import { spawn, type ChildProcess } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const args = process.argv.slice(2)
const useSource = args.includes('--source')

interface LspMessage {
  jsonrpc: '2.0'
  id?: number
  method?: string
  params?: any
  result?: any
  error?: any
}

interface LspSession {
  server: ChildProcess
  messages: LspMessage[]
  stderr(): string
  exitCode(): number | null
  sendRequest(method: string, params: any): { id: number, packet: string }
  sendNotification(method: string, params: any): void
  waitForResponse(id: number, description: string): Promise<LspMessage>
  close(): Promise<void>
}

let messageId = 0

function createRequest(method: string, params: any): { id: number, packet: string } {
  const id = ++messageId
  const body = JSON.stringify({ jsonrpc: '2.0', id, method, params })
  return {
    id,
    packet: `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`,
  }
}

function createNotification(method: string, params: any): string {
  const body = JSON.stringify({ jsonrpc: '2.0', method, params })
  return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
}

function createResponse(id: number, result: any): string {
  const body = JSON.stringify({ jsonrpc: '2.0', id, result })
  return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
}

function extractMessages(raw: string): { messages: LspMessage[], rest: string } {
  const messages: LspMessage[] = []
  let rest = raw
  while (true) {
    const headerEnd = rest.indexOf('\r\n\r\n')
    if (headerEnd < 0) break
    const header = rest.slice(0, headerEnd)
    const lengthMatch = header.match(/Content-Length:\s*(\d+)/i)
    if (!lengthMatch) {
      throw new Error(`Malformed LSP header: ${header}`)
    }
    const bodyLength = Number(lengthMatch[1])
    const bodyStart = headerEnd + 4
    const packetEnd = bodyStart + bodyLength
    if (rest.length < packetEnd) break
    messages.push(JSON.parse(rest.slice(bodyStart, packetEnd)))
    rest = rest.slice(packetEnd)
  }
  return { messages, rest }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function toFileUri(filePath: string): string {
  const normalized = path.resolve(filePath).replace(/\\/g, '/')
  return /^[A-Za-z]:\//.test(normalized) ? `file:///${normalized}` : `file://${normalized.startsWith('/') ? '' : '/'}${normalized}`
}

function sameUri(left: string | undefined, right: string): boolean {
  if (!left) return false
  if (left.toLowerCase() === right.toLowerCase()) return true
  const leftName = decodeURIComponent(left).replace(/\\/g, '/').split('/').at(-1)
  const rightName = decodeURIComponent(right).replace(/\\/g, '/').split('/').at(-1)
  return leftName !== undefined && leftName.toLowerCase() === rightName?.toLowerCase()
}

function locationUri(item: any): string | undefined {
  return item?.uri ?? item?.targetUri
}

function rangeStartsAt(item: any, line: number, character?: number): boolean {
  const start = item?.range?.start ?? item?.targetSelectionRange?.start
  return Boolean(start && start.line === line && (character === undefined || start.character === character))
}

function rangeContains(item: any, line: number, character: number): boolean {
  const range = item?.range ?? item?.targetSelectionRange
  const start = range?.start
  const end = range?.end
  if (!start || !end || line < start.line || line > end.line) return false
  if (line === start.line && character < start.character) return false
  return !(line === end.line && character > end.character)
}

function collectSymbolNames(symbols: any[]): string[] {
  const names: string[] = []
  for (const symbol of symbols) {
    if (typeof symbol.name === 'string') names.push(symbol.name)
    if (Array.isArray(symbol.children)) names.push(...collectSymbolNames(symbol.children))
  }
  return names
}

function semanticTokenCovers(result: any, line: number, character: number): boolean {
  const data = result?.data
  if (!Array.isArray(data) || data.length % 5 !== 0) {
    return false
  }
  let currentLine = 0
  let currentCharacter = 0
  for (let index = 0; index < data.length; index += 5) {
    const deltaLine = data[index]
    const deltaStart = data[index + 1]
    const length = data[index + 2]
    currentLine += deltaLine
    currentCharacter = deltaLine === 0 ? currentCharacter + deltaStart : deltaStart
    if (currentLine === line && currentCharacter <= character && character < currentCharacter + length) {
      return true
    }
  }
  return false
}

function requireSemanticTokenAt(result: any, line: number, character: number, label: string) {
  if (!semanticTokenCovers(result, line, character)) {
    throw new Error(`${label} semanticTokens did not cover ${line}:${character}: ${JSON.stringify(result)}`)
  }
}

function summarizeMessages(messages: LspMessage[]): string {
  return JSON.stringify(messages.map(message => ({
    id: message.id,
    method: message.method,
    hasResult: message.result !== undefined,
    hasError: message.error !== undefined,
    paramsUri: message.params?.uri,
  })).slice(-40))
}

async function waitFor(description: string, predicate: () => boolean, timeoutMs = 10000): Promise<void> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (predicate()) return
    await sleep(50)
  }
  throw new Error(`Timed out waiting for ${description}`)
}

function resolveTsdkPath(): string {
  const candidates = [
    path.join(__dirname, '..', 'node_modules', 'typescript', 'lib'),
    path.join(__dirname, '..', '..', 'node_modules', 'typescript', 'lib'),
    path.join(__dirname, '..', '..', '..', 'node_modules', 'typescript', 'lib'),
    path.join(process.cwd(), 'node_modules', 'typescript', 'lib'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'typescript.js')) || fs.existsSync(path.join(candidate, 'tsserverlibrary.js'))) {
      return candidate
    }
  }
  throw new Error(`TypeScript SDK not found. Checked: ${candidates.join(', ')}`)
}

function resolveServerCommand(): { command: string, args: string[] } {
  if (useSource) {
    const serverPath = path.join(__dirname, '..', 'ovs-language-server', 'src', 'index.ts')
    return process.platform === 'win32'
      ? { command: 'cmd', args: ['/c', 'npx', 'tsx', serverPath, '--stdio'] }
      : { command: 'npx', args: ['tsx', serverPath, '--stdio'] }
  }
  const serverPath = path.join(__dirname, '..', 'dist', 'language-server.js')
  if (!fs.existsSync(serverPath)) {
    throw new Error(`OVS language server bundle not found: ${serverPath}`)
  }
  return { command: 'node', args: [serverPath, '--stdio'] }
}

function configurationForSection(section: string | undefined): any {
  if (section === 'typescript.suggest.enabled' || section === 'javascript.suggest.enabled') return true
  if (section === 'typescript.validate.enable' || section === 'javascript.validate.enable') return true
  if (section === 'typescript.suggest.completeFunctionCalls' || section === 'javascript.suggest.completeFunctionCalls') return false
  if (section === 'typescript' || section === 'javascript') {
    return {
      suggest: {
        autoImports: false,
        includeCompletionsForImportStatements: false,
      },
      preferences: {
        includePackageJsonAutoImports: 'off',
      },
    }
  }
  return {}
}

function languageServerEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--max-old-space-size=512'].filter(Boolean).join(' '),
  }
}

async function createSession(): Promise<LspSession> {
  const serverCommand = resolveServerCommand()
  const server = spawn(serverCommand.command, serverCommand.args, {
    cwd: path.join(__dirname, '..'),
    env: languageServerEnvironment(),
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  if (!server.stdin || !server.stdout || !server.stderr) {
    throw new Error('Failed to start OVS language server process')
  }

  let stdoutBuffer = ''
  let stderrText = ''
  let exitCode: number | null = null
  const messages: LspMessage[] = []

  server.stdout.on('data', chunk => {
    stdoutBuffer += chunk.toString()
    const parsed = extractMessages(stdoutBuffer)
    stdoutBuffer = parsed.rest
    messages.push(...parsed.messages)
    for (const message of parsed.messages) {
      if (typeof message.id === 'number' && message.method === 'workspace/configuration') {
        const items = message.params?.items ?? []
        server.stdin!.write(createResponse(message.id, items.map((item: any) => configurationForSection(item.section))))
      } else if (typeof message.id === 'number' && message.method === 'client/registerCapability') {
        server.stdin!.write(createResponse(message.id, null))
      }
    }
  })

  server.stderr.on('data', chunk => {
    stderrText += chunk.toString()
  })
  server.on('exit', code => {
    exitCode = code
  })

  const session: LspSession = {
    server,
    messages,
    stderr: () => stderrText,
    exitCode: () => exitCode,
    sendRequest(method, params) {
      const request = createRequest(method, params)
      server.stdin!.write(request.packet)
      return request
    },
    sendNotification(method, params) {
      server.stdin!.write(createNotification(method, params))
    },
    async waitForResponse(id, description) {
      await waitFor(description, () => messages.some(message => message.id === id && !message.method) || exitCode !== null)
      const message = messages.find(item => item.id === id && !item.method)
      if (!message) {
        throw new Error(`${description} missing response. exitCode=${exitCode} stderr=${stderrText} messages=${summarizeMessages(messages)}`)
      }
      if (message.error) {
        throw new Error(`${description} returned error: ${JSON.stringify(message.error)}`)
      }
      return message
    },
    async close() {
      if (exitCode !== null) return
      const shutdown = createRequest('shutdown', null)
      server.stdin!.write(shutdown.packet)
      await waitFor(`shutdown response ${shutdown.id}`, () => messages.some(message => message.id === shutdown.id && !message.method), 3000)
      server.stdin!.write(createNotification('exit', null))
      await sleep(200)
      if (exitCode === null) server.kill()
    },
  }

  const init = session.sendRequest('initialize', {
    processId: process.pid,
    capabilities: {
      workspace: { configuration: true },
      textDocument: {
        completion: { completionItem: { snippetSupport: true, insertReplaceSupport: true } },
        hover: {},
        definition: {},
        references: {},
        documentSymbol: {},
        semanticTokens: { requests: { full: true } },
        publishDiagnostics: {},
      },
    },
    rootUri: toFileUri(path.join(__dirname, '..')),
    initializationOptions: {
      typescript: { tsdk: resolveTsdkPath() },
      qin: {
        languageServer: {
          sourceExtension: '.ovs',
          serviceExtension: '.ts',
          generatedParserTarget: '@qin/generated-qin-parser-ts',
          compilerPackage: 'ovs-compiler',
        },
      },
    },
  })
  const initResponse = await session.waitForResponse(init.id, 'OVS initialize response')
  if (!initResponse.result?.capabilities) {
    throw new Error(`OVS initialize failed. exitCode=${exitCode} stderr=${stderrText} messages=${summarizeMessages(messages)}`)
  }
  session.sendNotification('initialized', {})

  return session
}

async function testDiagnostics() {
  const session = await createSession()
  try {
    const validUri = toFileUri(path.join(__dirname, 'valid.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: validUri,
        languageId: 'ovs',
        version: 1,
        text: "div { h1 { 'Hello' } }\n",
      },
    })

    const qinRichUri = toFileUri(path.join(__dirname, 'qin-rich-valid.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: qinRichUri,
        languageId: 'ovs',
        version: 1,
        text: [
          'object NestedLabeler {',
          '  label(name: string, premium: boolean, active: boolean): string {',
          '    const base = "hello "',
          '    if (active) {',
          '      if (premium) {',
          '        const label = "vip "',
          '        return label + name',
          '      }',
          '      const standard = "std "',
          '      return standard + name',
          '    }',
          '    return base + name',
          '  }',
          '}',
          'const cardStyle = css { displayFlex }',
          'const title = "Qin"',
          'div(class = cardStyle) {',
          '  h1 { title }',
          '}',
          '',
        ].join('\n'),
      },
    })

    const invalidUri = toFileUri(path.join(__dirname, 'invalid.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: invalidUri,
        languageId: 'ovs',
        version: 1,
        text: "div { h1 { 'Broken' }\n",
      },
    })

    const qinRichDiagnosticRequest = session.sendRequest('textDocument/diagnostic', {
      textDocument: { uri: qinRichUri },
    })
    const qinRichDiagnosticResponse = await session.waitForResponse(qinRichDiagnosticRequest.id, 'OVS Qin-rich valid diagnostic response')

    const invalidDiagnosticRequest = session.sendRequest('textDocument/diagnostic', {
      textDocument: { uri: invalidUri },
    })
    const invalidDiagnosticResponse = await session.waitForResponse(invalidDiagnosticRequest.id, 'OVS invalid diagnostic response')

    const diagnostics = session.messages.filter(message => message.method === 'textDocument/publishDiagnostics')
    const validDiagnostics = diagnostics.filter(message => sameUri(message.params?.uri, validUri)).at(-1)?.params?.diagnostics ?? []
    const qinRichDiagnostics = qinRichDiagnosticResponse.result?.items
      ?? diagnostics.filter(message => sameUri(message.params?.uri, qinRichUri)).at(-1)?.params?.diagnostics
      ?? []
    const invalidDiagnostics = invalidDiagnosticResponse.result?.items
      ?? diagnostics.filter(message => sameUri(message.params?.uri, invalidUri)).at(-1)?.params?.diagnostics
      ?? []
    if (validDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`Valid OVS source produced transform diagnostics: ${JSON.stringify(validDiagnostics)}`)
    }
    if (qinRichDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`Qin-rich valid OVS source produced transform diagnostics: ${JSON.stringify(qinRichDiagnostics)}`)
    }
    if (!invalidDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`Invalid OVS source did not produce transform diagnostics: ${JSON.stringify(invalidDiagnostics)}`)
    }
  } finally {
    await session.close()
  }
}

async function testTsSubsetLanguageFeatures() {
  const session = await createSession()
  try {
    const tsSubsetUri = toFileUri(path.join(__dirname, 'ts-subset.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: tsSubsetUri,
        languageId: 'ovs',
        version: 1,
        text: [
          'const alphaNumber = 41',
          'const alphaText = alphaNumber.toString()',
          'const finalValue = alphaText',
          'al',
          '',
        ].join('\n'),
      },
    })

    const hover = session.sendRequest('textDocument/hover', {
      textDocument: { uri: tsSubsetUri },
      position: { line: 0, character: 8 },
    })
    const hoverResponse = await session.waitForResponse(hover.id, 'OVS hover response')
    if (!JSON.stringify(hoverResponse.result ?? '').includes('alphaNumber')) {
      throw new Error(`OVS hover did not return TS content: ${JSON.stringify(hoverResponse.result)}`)
    }

    const completion = session.sendRequest('textDocument/completion', {
      textDocument: { uri: tsSubsetUri },
      position: { line: 3, character: 2 },
      context: { triggerKind: 1 },
    })
    const completionResponse = await session.waitForResponse(completion.id, 'OVS completion response')
    const completionItems = Array.isArray(completionResponse.result) ? completionResponse.result : completionResponse.result?.items ?? []
    const completionLabels = completionItems.map((item: any) => item.label)
    if (!completionLabels.includes('alphaNumber') || !completionLabels.includes('alphaText')) {
      throw new Error(`OVS completion did not include TS symbols: ${JSON.stringify(completionLabels.slice(0, 30))}`)
    }

    const definition = session.sendRequest('textDocument/definition', {
      textDocument: { uri: tsSubsetUri },
      position: { line: 1, character: 20 },
    })
    const definitionResponse = await session.waitForResponse(definition.id, 'OVS definition response')
    const definitions = Array.isArray(definitionResponse.result) ? definitionResponse.result : definitionResponse.result ? [definitionResponse.result] : []
    if (!definitions.some(item => sameUri(locationUri(item), tsSubsetUri) && rangeContains(item, 0, 6))) {
      throw new Error(`OVS definition did not resolve alphaNumber declaration: ${JSON.stringify(definitionResponse.result)}`)
    }

    const references = session.sendRequest('textDocument/references', {
      textDocument: { uri: tsSubsetUri },
      position: { line: 0, character: 8 },
      context: { includeDeclaration: true },
    })
    const referencesResponse = await session.waitForResponse(references.id, 'OVS references response')
    const referenceItems = Array.isArray(referencesResponse.result) ? referencesResponse.result : []
    if (
      !referenceItems.some(item => sameUri(locationUri(item), tsSubsetUri) && rangeStartsAt(item, 0, 6))
      || !referenceItems.some(item => sameUri(locationUri(item), tsSubsetUri) && rangeStartsAt(item, 1, 18))
    ) {
      throw new Error(`OVS references did not include declaration and usage: ${JSON.stringify(referencesResponse.result)}`)
    }

    const symbols = session.sendRequest('textDocument/documentSymbol', {
      textDocument: { uri: tsSubsetUri },
    })
    const symbolsResponse = await session.waitForResponse(symbols.id, 'OVS documentSymbol response')
    const symbolNames = collectSymbolNames(Array.isArray(symbolsResponse.result) ? symbolsResponse.result : [])
    if (!symbolNames.includes('alphaNumber') || !symbolNames.includes('alphaText')) {
      throw new Error(`OVS documentSymbol did not include TS symbols: ${JSON.stringify(symbolsResponse.result)}`)
    }

    const semanticTokens = session.sendRequest('textDocument/semanticTokens/full', {
      textDocument: { uri: tsSubsetUri },
    })
    const semanticTokensResponse = await session.waitForResponse(semanticTokens.id, 'OVS semanticTokens response')
    if (!Array.isArray(semanticTokensResponse.result?.data) || semanticTokensResponse.result.data.length === 0) {
      throw new Error(`OVS semanticTokens did not return token data: ${JSON.stringify(semanticTokensResponse.result)}`)
    }

    const tsRichUri = toFileUri(path.join(__dirname, 'ts-rich.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: tsRichUri,
        languageId: 'ovs',
        version: 1,
        text: [
          'export interface ChainUser {',
          '  id: string',
          '  active?: boolean',
          '}',
          'export type ChainPair<T, U> = { left: T, right: U }',
          'class ChainService {',
          '  name: string = "qin"',
          '  count = 0',
          '  constructor(name: string) {',
          '    this.name = name',
          '  }',
          '  label(): string {',
          '    return this.name',
          '  }',
          '}',
          'const config = { name: "qin", values: [1, 2, 3] }',
          'const { name: destructuredName, values: [firstValue] } = config',
          'const service = new ChainService(destructuredName)',
          'const finalLabel = service.label() + firstValue',
          'des',
          '',
        ].join('\n'),
      },
    })

    const tsRichDiagnostic = session.sendRequest('textDocument/diagnostic', {
      textDocument: { uri: tsRichUri },
    })
    const tsRichDiagnosticResponse = await session.waitForResponse(tsRichDiagnostic.id, 'OVS TS-rich diagnostic response')
    const tsRichDiagnostics = tsRichDiagnosticResponse.result?.items ?? []
    if (tsRichDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`OVS TS-rich source produced transform diagnostics: ${JSON.stringify(tsRichDiagnostics)}`)
    }

    const tsRichCompletion = session.sendRequest('textDocument/completion', {
      textDocument: { uri: tsRichUri },
      position: { line: 19, character: 3 },
      context: { triggerKind: 1 },
    })
    const tsRichCompletionResponse = await session.waitForResponse(tsRichCompletion.id, 'OVS TS-rich completion response')
    const tsRichCompletionItems = Array.isArray(tsRichCompletionResponse.result) ? tsRichCompletionResponse.result : tsRichCompletionResponse.result?.items ?? []
    const tsRichCompletionLabels = tsRichCompletionItems.map((item: any) => item.label)
    if (!tsRichCompletionLabels.includes('destructuredName')) {
      throw new Error(`OVS TS-rich completion did not include destructuredName: ${JSON.stringify(tsRichCompletionLabels.slice(0, 30))}`)
    }

    const tsRichDefinition = session.sendRequest('textDocument/definition', {
      textDocument: { uri: tsRichUri },
      position: { line: 17, character: 38 },
    })
    const tsRichDefinitionResponse = await session.waitForResponse(tsRichDefinition.id, 'OVS TS-rich definition response')
    const tsRichDefinitions = Array.isArray(tsRichDefinitionResponse.result) ? tsRichDefinitionResponse.result : tsRichDefinitionResponse.result ? [tsRichDefinitionResponse.result] : []
    if (!tsRichDefinitions.some(item => sameUri(locationUri(item), tsRichUri) && rangeContains(item, 16, 14))) {
      throw new Error(`OVS TS-rich definition did not resolve destructuredName declaration: ${JSON.stringify(tsRichDefinitionResponse.result)}`)
    }

    const tsRichReferences = session.sendRequest('textDocument/references', {
      textDocument: { uri: tsRichUri },
      position: { line: 17, character: 38 },
      context: { includeDeclaration: true },
    })
    const tsRichReferencesResponse = await session.waitForResponse(tsRichReferences.id, 'OVS TS-rich references response')
    const tsRichReferenceItems = Array.isArray(tsRichReferencesResponse.result) ? tsRichReferencesResponse.result : []
    if (
      !tsRichReferenceItems.some(item => sameUri(locationUri(item), tsRichUri) && rangeStartsAt(item, 16, 14))
      || !tsRichReferenceItems.some(item => sameUri(locationUri(item), tsRichUri) && rangeStartsAt(item, 17, 33))
    ) {
      throw new Error(`OVS TS-rich references did not include destructuredName declaration and usage: ${JSON.stringify(tsRichReferencesResponse.result)}`)
    }

    const tsRichSymbols = session.sendRequest('textDocument/documentSymbol', {
      textDocument: { uri: tsRichUri },
    })
    const tsRichSymbolsResponse = await session.waitForResponse(tsRichSymbols.id, 'OVS TS-rich documentSymbol response')
    const tsRichSymbolNames = collectSymbolNames(Array.isArray(tsRichSymbolsResponse.result) ? tsRichSymbolsResponse.result : [])
    if (!tsRichSymbolNames.includes('ChainUser') || !tsRichSymbolNames.includes('ChainPair') || !tsRichSymbolNames.includes('ChainService')) {
      throw new Error(`OVS TS-rich documentSymbol did not include inherited TS declarations: ${JSON.stringify(tsRichSymbolsResponse.result)}`)
    }

    const tsRichSemanticTokens = session.sendRequest('textDocument/semanticTokens/full', {
      textDocument: { uri: tsRichUri },
    })
    const tsRichSemanticTokensResponse = await session.waitForResponse(tsRichSemanticTokens.id, 'OVS TS-rich semanticTokens response')
    if (!Array.isArray(tsRichSemanticTokensResponse.result?.data) || tsRichSemanticTokensResponse.result.data.length === 0) {
      throw new Error(`OVS TS-rich semanticTokens did not return token data: ${JSON.stringify(tsRichSemanticTokensResponse.result)}`)
    }
    requireSemanticTokenAt(tsRichSemanticTokensResponse.result, 16, 14, 'OVS TS-rich destructuredName declaration')
    requireSemanticTokenAt(tsRichSemanticTokensResponse.result, 17, 33, 'OVS TS-rich destructuredName usage')

    const ovsSyntaxUri = toFileUri(path.join(__dirname, 'ovs-syntax.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: ovsSyntaxUri,
        languageId: 'ovs',
        version: 1,
        text: [
          'const cardStyle = css { displayFlex }',
          'const labelText = "Hello"',
          'export default div(class = cardStyle) {',
          '  h1 { labelText }',
          '}',
          'lab',
          '',
        ].join('\n'),
      },
    })

    const ovsCompletion = session.sendRequest('textDocument/completion', {
      textDocument: { uri: ovsSyntaxUri },
      position: { line: 5, character: 3 },
      context: { triggerKind: 1 },
    })
    const ovsCompletionResponse = await session.waitForResponse(ovsCompletion.id, 'OVS syntax completion response')
    const ovsCompletionItems = Array.isArray(ovsCompletionResponse.result) ? ovsCompletionResponse.result : ovsCompletionResponse.result?.items ?? []
    const ovsCompletionLabels = ovsCompletionItems.map((item: any) => item.label)
    if (!ovsCompletionLabels.includes('labelText')) {
      throw new Error(`OVS syntax completion did not include labelText: ${JSON.stringify(ovsCompletionLabels.slice(0, 30))}`)
    }

    const ovsDefinition = session.sendRequest('textDocument/definition', {
      textDocument: { uri: ovsSyntaxUri },
      position: { line: 3, character: 10 },
    })
    const ovsDefinitionResponse = await session.waitForResponse(ovsDefinition.id, 'OVS syntax definition response')
    const ovsDefinitions = Array.isArray(ovsDefinitionResponse.result) ? ovsDefinitionResponse.result : ovsDefinitionResponse.result ? [ovsDefinitionResponse.result] : []
    if (!ovsDefinitions.some(item => sameUri(locationUri(item), ovsSyntaxUri) && rangeContains(item, 1, 6))) {
      throw new Error(`OVS syntax definition did not resolve labelText declaration: ${JSON.stringify(ovsDefinitionResponse.result)}`)
    }

    const ovsReferences = session.sendRequest('textDocument/references', {
      textDocument: { uri: ovsSyntaxUri },
      position: { line: 3, character: 10 },
      context: { includeDeclaration: true },
    })
    const ovsReferencesResponse = await session.waitForResponse(ovsReferences.id, 'OVS syntax references response')
    const ovsReferenceItems = Array.isArray(ovsReferencesResponse.result) ? ovsReferencesResponse.result : []
    if (
      !ovsReferenceItems.some(item => sameUri(locationUri(item), ovsSyntaxUri) && rangeStartsAt(item, 1, 6))
      || !ovsReferenceItems.some(item => sameUri(locationUri(item), ovsSyntaxUri) && rangeStartsAt(item, 3, 7))
    ) {
      throw new Error(`OVS syntax references did not include labelText declaration and render usage: ${JSON.stringify(ovsReferencesResponse.result)}`)
    }

    const ovsSymbols = session.sendRequest('textDocument/documentSymbol', {
      textDocument: { uri: ovsSyntaxUri },
    })
    const ovsSymbolsResponse = await session.waitForResponse(ovsSymbols.id, 'OVS syntax documentSymbol response')
    const ovsSymbolNames = collectSymbolNames(Array.isArray(ovsSymbolsResponse.result) ? ovsSymbolsResponse.result : [])
    if (!ovsSymbolNames.includes('cardStyle') || !ovsSymbolNames.includes('labelText')) {
      throw new Error(`OVS syntax documentSymbol did not include style/text symbols: ${JSON.stringify(ovsSymbolsResponse.result)}`)
    }

    const ovsSemanticTokens = session.sendRequest('textDocument/semanticTokens/full', {
      textDocument: { uri: ovsSyntaxUri },
    })
    const ovsSemanticTokensResponse = await session.waitForResponse(ovsSemanticTokens.id, 'OVS syntax semanticTokens response')
    if (!Array.isArray(ovsSemanticTokensResponse.result?.data) || ovsSemanticTokensResponse.result.data.length === 0) {
      throw new Error(`OVS syntax semanticTokens did not return token data: ${JSON.stringify(ovsSemanticTokensResponse.result)}`)
    }
    requireSemanticTokenAt(ovsSemanticTokensResponse.result, 1, 6, 'OVS syntax labelText declaration')
    requireSemanticTokenAt(ovsSemanticTokensResponse.result, 3, 7, 'OVS syntax labelText render usage')

    const ovsForOfUri = toFileUri(path.join(__dirname, 'ovs-for-of.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: ovsForOfUri,
        languageId: 'ovs',
        version: 1,
        text: [
          'const items = [{ name: "Ada" }, { name: "Lin" }]',
          'let selectedName = ""',
          'export default ul {',
          '  for (const item of items) {',
          '    selectedName = item.name',
          '    li { item.name }',
          '  }',
          '}',
          'sele',
          '',
        ].join('\n'),
      },
    })

    const ovsForOfDiagnostic = session.sendRequest('textDocument/diagnostic', {
      textDocument: { uri: ovsForOfUri },
    })
    const ovsForOfDiagnosticResponse = await session.waitForResponse(ovsForOfDiagnostic.id, 'OVS for...of diagnostic response')
    const ovsForOfDiagnostics = ovsForOfDiagnosticResponse.result?.items ?? []
    if (ovsForOfDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`OVS for...of source produced transform diagnostics: ${JSON.stringify(ovsForOfDiagnostics)}`)
    }

    const ovsForOfCompletion = session.sendRequest('textDocument/completion', {
      textDocument: { uri: ovsForOfUri },
      position: { line: 8, character: 4 },
      context: { triggerKind: 1 },
    })
    const ovsForOfCompletionResponse = await session.waitForResponse(ovsForOfCompletion.id, 'OVS for...of completion response')
    const ovsForOfCompletionItems = Array.isArray(ovsForOfCompletionResponse.result) ? ovsForOfCompletionResponse.result : ovsForOfCompletionResponse.result?.items ?? []
    const ovsForOfCompletionLabels = ovsForOfCompletionItems.map((item: any) => item.label)
    if (!ovsForOfCompletionLabels.includes('selectedName')) {
      throw new Error(`OVS for...of completion did not include selectedName: ${JSON.stringify(ovsForOfCompletionLabels.slice(0, 30))}`)
    }

    const ovsForOfDefinition = session.sendRequest('textDocument/definition', {
      textDocument: { uri: ovsForOfUri },
      position: { line: 5, character: 10 },
    })
    const ovsForOfDefinitionResponse = await session.waitForResponse(ovsForOfDefinition.id, 'OVS for...of definition response')
    const ovsForOfDefinitions = Array.isArray(ovsForOfDefinitionResponse.result) ? ovsForOfDefinitionResponse.result : ovsForOfDefinitionResponse.result ? [ovsForOfDefinitionResponse.result] : []
    if (!ovsForOfDefinitions.some(item => sameUri(locationUri(item), ovsForOfUri) && rangeContains(item, 3, 13))) {
      throw new Error(`OVS for...of definition did not resolve item declaration: ${JSON.stringify(ovsForOfDefinitionResponse.result)}`)
    }

    const ovsForOfReferences = session.sendRequest('textDocument/references', {
      textDocument: { uri: ovsForOfUri },
      position: { line: 5, character: 10 },
      context: { includeDeclaration: true },
    })
    const ovsForOfReferencesResponse = await session.waitForResponse(ovsForOfReferences.id, 'OVS for...of references response')
    const ovsForOfReferenceItems = Array.isArray(ovsForOfReferencesResponse.result) ? ovsForOfReferencesResponse.result : []
    if (
      !ovsForOfReferenceItems.some(item => sameUri(locationUri(item), ovsForOfUri) && rangeStartsAt(item, 3, 13))
      || !ovsForOfReferenceItems.some(item => sameUri(locationUri(item), ovsForOfUri) && rangeStartsAt(item, 5, 9))
    ) {
      throw new Error(`OVS for...of references did not include item declaration and render usage: ${JSON.stringify(ovsForOfReferencesResponse.result)}`)
    }

    const ovsForOfSymbols = session.sendRequest('textDocument/documentSymbol', {
      textDocument: { uri: ovsForOfUri },
    })
    const ovsForOfSymbolsResponse = await session.waitForResponse(ovsForOfSymbols.id, 'OVS for...of documentSymbol response')
    const ovsForOfSymbolNames = collectSymbolNames(Array.isArray(ovsForOfSymbolsResponse.result) ? ovsForOfSymbolsResponse.result : [])
    if (!ovsForOfSymbolNames.includes('items') || !ovsForOfSymbolNames.includes('selectedName')) {
      throw new Error(`OVS for...of documentSymbol did not include loop source symbols: ${JSON.stringify(ovsForOfSymbolsResponse.result)}`)
    }

    const ovsForOfSemanticTokens = session.sendRequest('textDocument/semanticTokens/full', {
      textDocument: { uri: ovsForOfUri },
    })
    const ovsForOfSemanticTokensResponse = await session.waitForResponse(ovsForOfSemanticTokens.id, 'OVS for...of semanticTokens response')
    if (!Array.isArray(ovsForOfSemanticTokensResponse.result?.data) || ovsForOfSemanticTokensResponse.result.data.length === 0) {
      throw new Error(`OVS for...of semanticTokens did not return token data: ${JSON.stringify(ovsForOfSemanticTokensResponse.result)}`)
    }
    requireSemanticTokenAt(ovsForOfSemanticTokensResponse.result, 3, 13, 'OVS for...of item declaration')
    requireSemanticTokenAt(ovsForOfSemanticTokensResponse.result, 5, 9, 'OVS for...of item render usage')
  } finally {
    await session.close()
  }
}

async function main() {
  await testDiagnostics()
  await testTsSubsetLanguageFeatures()
  console.log(`OVS language server LSP smoke passed (${useSource ? 'source' : 'dist'})`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
