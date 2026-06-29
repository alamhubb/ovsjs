import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { OvsParser } from 'ovs-compiler'
import { CssTsParser } from 'cssts-compiler'
import { SlimeJavascriptParser } from '@qin/generated-qin-parser-ts'

const require = createRequire(import.meta.url)
const languageRoot = path.join(__dirname, '..')
const workspaceRoot = path.join(languageRoot, '..')

const languageConfigPath = path.join(languageRoot, 'qin.config.js')
const compilerConfigPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'qin.config.js')
const languagePackagePath = path.join(languageRoot, 'package.json')
const languageServerPackagePath = path.join(languageRoot, 'ovs-language-server', 'package.json')
const compilerPackagePath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'package.json')
const parserPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'src', 'parser', 'OvsParser.ts')
const compilerIndexPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'src', 'index.ts')
const localAdapterPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'src', 'parser', 'generated-runtime-adapter.ts')

const languageConfig = fs.readFileSync(languageConfigPath, 'utf-8')
const compilerConfig = fs.readFileSync(compilerConfigPath, 'utf-8')
const languagePackage = readJson(languagePackagePath)
const languageServerPackage = readJson(languageServerPackagePath)
const compilerPackage = readJson(compilerPackagePath)
const generatedParserPackage = readJson(require.resolve('@qin/generated-qin-parser-ts/package.json'))
const parserSource = fs.readFileSync(parserPath, 'utf-8')
const compilerIndexSource = fs.readFileSync(compilerIndexPath, 'utf-8')

function requireIncludes(source: string, needle: string, label: string) {
  if (!source.includes(needle)) {
    throw new Error(`${label} must include ${needle}`)
  }
}

function requireExcludes(source: string, needle: string, label: string) {
  if (source.includes(needle)) {
    throw new Error(`${label} must not include ${needle}`)
  }
}

async function loadQinConfig(configPath: string): Promise<any> {
  const moduleUrl = pathToFileURL(configPath).href
  const module = await import(`${moduleUrl}?mtime=${fs.statSync(configPath).mtimeMs}`)
  return module.default
}

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function requireEquals(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function requireDependency(packageJson: any, dependencyName: string, label: string) {
  const dependencies = packageJson.dependencies ?? {}
  if (typeof dependencies[dependencyName] !== 'string') {
    throw new Error(`${label} must depend on ${dependencyName}`)
  }
}

function requireNoDependency(packageJson: any, dependencyName: string, label: string) {
  const dependencySections = [
    packageJson.dependencies ?? {},
    packageJson.devDependencies ?? {},
    packageJson.peerDependencies ?? {},
    packageJson.optionalDependencies ?? {},
  ]
  if (dependencySections.some(section => typeof section[dependencyName] === 'string')) {
    throw new Error(`${label} must not depend directly on ${dependencyName}; use @qin/generated-qin-parser-ts through ovs-compiler`)
  }
}

async function main() {
  const languageConfigObject = await loadQinConfig(languageConfigPath)
  const compilerConfigObject = await loadQinConfig(compilerConfigPath)
  const generatedParserTarget = languageConfigObject.languageServer?.generatedParserTarget

  requireEquals(languageConfigObject.language?.parser, generatedParserTarget, 'ovs-language language.parser')
  requireEquals(compilerConfigObject.language?.parser, generatedParserTarget, 'ovs-compiler language.parser')
  requireEquals(generatedParserPackage.name, generatedParserTarget, 'resolved generated parser package name')
  requireDependency(languagePackage, generatedParserTarget, 'ovs-language package.json')
  requireDependency(compilerPackage, generatedParserTarget, 'ovs-compiler package.json')

  for (const legacyParserPackage of ['slime-ast', 'slime-parser', 'slime-token', 'subhuti']) {
    requireNoDependency(languageConfigObject, legacyParserPackage, 'ovs-language qin.config.js')
    requireNoDependency(languagePackage, legacyParserPackage, 'ovs-language package.json')
    requireNoDependency(languageServerPackage, legacyParserPackage, 'ovs-language-server package.json')
  }

  requireIncludes(languageConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-language qin.config.js')
  requireIncludes(compilerConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-compiler qin.config.js')
  requireIncludes(compilerConfig, 'build: "tsdown"', 'ovs-compiler qin.config.js')
  requireIncludes(compilerConfig, 'test: "tsx tests/test-generated-parser-chain.ts && tsdown"', 'ovs-compiler qin.config.js')
  requireIncludes(parserSource, 'from "@qin/generated-qin-parser-ts"', 'OvsParser.ts')
  requireIncludes(parserSource, 'from "cssts-compiler"', 'OvsParser.ts')
  requireIncludes(parserSource, 'normalizeGeneratedTokens', 'OvsParser.ts')
  requireIncludes(parserSource, 'extends CssTsParser', 'OvsParser.ts')
  requireIncludes(parserSource, 'Alternative.of(', 'OvsParser.ts')
  requireExcludes(parserSource, 'fallback', 'OvsParser.ts')
  requireIncludes(compilerIndexSource, 'normalizeGeneratedCst', 'ovs-compiler src/index.ts')

  if (parserSource.includes('alt:')) {
    throw new Error('OvsParser.ts must use generated parser Alternative.of semantics, not legacy { alt } alternatives')
  }

  if (compilerConfig.includes('npm run')) {
    throw new Error('ovs-compiler qin.config.js must run compiler tasks directly through Qin scripts, not npm run forwarding')
  }

  if (languageConfig.includes('npm run')) {
    throw new Error('ovs-language qin.config.js must run language tasks directly through Qin scripts, not npm run forwarding')
  }

  if (fs.existsSync(localAdapterPath)) {
    throw new Error('OVS must inherit the generated runtime adapter from cssts-compiler instead of keeping a local copy')
  }

  const inheritedSyntaxSource = [
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
    '  risky(flag: boolean): string {',
    '    try {',
    '      if (flag) {',
    '        throw new Error("boom")',
    '      }',
    '      return "ok"',
    '    } catch (error) {',
    '      return "caught"',
    '    }',
    '  }',
    '}',
    'const title = "Qin"',
    'const moduleUrl = import.meta.url',
    'const loadedModule = import("./dep.qin")',
    'div(class = css { displayFlex }) {',
    '  h1 { title }',
    '}',
    '',
  ].join('\n')
  const parser = new OvsParser(inheritedSyntaxSource)

  if (!(parser instanceof CssTsParser)) {
    throw new Error('OvsParser must inherit CssTsParser from cssts-compiler')
  }

  if (!(parser instanceof SlimeJavascriptParser)) {
    throw new Error('OvsParser must inherit the shared generated SlimeJavascriptParser export through CSSTS')
  }

  parser.Program()

  if (!parser.parsedTokens.length) {
    throw new Error('OvsParser must parse through the generated Qin/Slime -> CSSTS -> OVS parser chain')
  }

  if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'object')) {
    throw new Error('OvsParser chain must preserve Qin object declaration syntax from the generated parser')
  }

  if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'premium')
    || !parser.parsedTokens.some((token: any) => token.tokenValue === 'standard')) {
    throw new Error('OvsParser chain must preserve nested Qin object method-body syntax from the generated parser')
  }

  if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'try')
    || !parser.parsedTokens.some((token: any) => token.tokenValue === 'catch')
    || !parser.parsedTokens.some((token: any) => token.tokenValue === 'throw')) {
    throw new Error('OvsParser chain must preserve Qin try/catch/throw syntax from the generated parser')
  }

  if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'import')
    || !parser.parsedTokens.some((token: any) => token.tokenValue === 'meta')) {
    throw new Error('OvsParser chain must preserve import.meta syntax from the generated parser')
  }

  if (!parser.parsedTokens.some((token: any) => String(token.tokenValue).includes('./dep.qin'))) {
    throw new Error('OvsParser chain must preserve dynamic import syntax from the generated parser')
  }

  if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'css')) {
    throw new Error('OvsParser chain must preserve CSSTS css expression syntax')
  }

  console.log('test-generated-parser-chain passed')
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
