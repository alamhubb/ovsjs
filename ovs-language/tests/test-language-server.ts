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

async function createSession(): Promise<LspSession> {
  const serverCommand = resolveServerCommand()
  const server = spawn(serverCommand.command, serverCommand.args, {
    cwd: path.join(__dirname, '..'),
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

    const invalidUri = toFileUri(path.join(__dirname, 'invalid.ovs'))
    session.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri: invalidUri,
        languageId: 'ovs',
        version: 1,
        text: "div { h1 { 'Broken' }\n",
      },
    })

    const invalidDiagnosticRequest = session.sendRequest('textDocument/diagnostic', {
      textDocument: { uri: invalidUri },
    })
    const invalidDiagnosticResponse = await session.waitForResponse(invalidDiagnosticRequest.id, 'OVS invalid diagnostic response')

    const diagnostics = session.messages.filter(message => message.method === 'textDocument/publishDiagnostics')
    const validDiagnostics = diagnostics.filter(message => sameUri(message.params?.uri, validUri)).at(-1)?.params?.diagnostics ?? []
    const invalidDiagnostics = invalidDiagnosticResponse.result?.items
      ?? diagnostics.filter(message => sameUri(message.params?.uri, invalidUri)).at(-1)?.params?.diagnostics
      ?? []
    if (validDiagnostics.some((item: any) => String(item.message ?? '').includes('OVS transform failed'))) {
      throw new Error(`Valid OVS source produced transform diagnostics: ${JSON.stringify(validDiagnostics)}`)
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
