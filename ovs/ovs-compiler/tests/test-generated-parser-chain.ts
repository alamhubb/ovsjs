import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { OvsParser } from '../src/index.ts'
import { CssTsParser } from 'cssts-compiler'
import { SlimeJavascriptParser } from '@qin/generated-qin-parser-ts'
import { ovsInheritedSyntaxSource } from './generated-parser-chain-fixture.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const compilerRoot = path.join(__dirname, '..')
const workspaceRoot = path.join(compilerRoot, '..', '..', '..')

const compilerConfigPath = path.join(compilerRoot, 'qin.config.js')
const compilerPackagePath = path.join(compilerRoot, 'package.json')
const parserPath = path.join(compilerRoot, 'src', 'parser', 'OvsParser.ts')
const compilerIndexPath = path.join(compilerRoot, 'src', 'index.ts')
const cstToAstPath = path.join(compilerRoot, 'src', 'factory', 'OvsCstToSlimeAst', 'OvsCstToSlimeAst.ts')
const statementCstToAstPath = path.join(compilerRoot, 'src', 'factory', 'OvsCstToSlimeAst', 'OvsCstToSlimeAst.Statement.ts')
const localAdapterPath = path.join(compilerRoot, 'src', 'parser', 'generated-runtime-adapter.ts')
const legacyOldFilePath = path.join(compilerRoot, 'src', 'factory', 'oldfile.ts')
const generatedParserPath = path.join(workspaceRoot, 'qin', 'packages', 'qin-language', 'generated', 'qin-parser-ts')

const compilerConfig = fs.readFileSync(compilerConfigPath, 'utf-8')
const compilerPackage = readJson(compilerPackagePath)
const generatedParserPackage = readJson(require.resolve('@qin/generated-qin-parser-ts/package.json'))
const parserSource = fs.readFileSync(parserPath, 'utf-8')
const compilerIndexSource = fs.readFileSync(compilerIndexPath, 'utf-8')
const cstToAstSource = fs.readFileSync(cstToAstPath, 'utf-8')
const statementCstToAstSource = fs.readFileSync(statementCstToAstPath, 'utf-8')

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
    throw new Error(`${label} must not depend on ${dependencyName}`)
  }
}

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

const compilerConfigObject = await loadQinConfig(compilerConfigPath)
const generatedParserTarget = compilerConfigObject.language?.parser

requireEquals(compilerConfigObject.name, compilerPackage.name, 'ovs-compiler qin.config.js name')
requireEquals(compilerConfigObject.version, compilerPackage.version, 'ovs-compiler qin.config.js version')
requireEquals(compilerConfigObject.entry, 'src/index.ts', 'ovs-compiler qin.config.js entry')
requireEquals(compilerConfigObject.scripts?.build, 'tsdown', 'ovs-compiler qin.config.js build script')
requireEquals(compilerConfigObject.scripts?.test, 'tsx tests/test-generated-parser-chain.ts && tsdown', 'ovs-compiler qin.config.js test script')
requireEquals(generatedParserTarget, '@qin/generated-qin-parser-ts', 'ovs-compiler language.parser')
requireEquals(generatedParserPackage.name, generatedParserTarget, 'resolved generated parser package name')
requireDependency(compilerPackage, generatedParserTarget, 'ovs-compiler package.json')
for (const unusedCompilerDependency of ['slime-generator', 'slime-token']) {
  requireNoDependency(compilerConfigObject, unusedCompilerDependency, 'ovs-compiler qin.config.js')
  requireNoDependency(compilerPackage, unusedCompilerDependency, 'ovs-compiler package.json')
}

requireIncludes(compilerConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-compiler qin.config.js')
requireIncludes(compilerConfig, '"@qin/generated-qin-parser-ts": "file:../../../qin/packages/qin-language/generated/qin-parser-ts"', 'ovs-compiler qin.config.js')
requireIncludes(compilerConfig, 'test: "tsx tests/test-generated-parser-chain.ts && tsdown"', 'ovs-compiler qin.config.js')
for (const requiredCompilerDependency of ['"subhuti"', '"slime-ast"']) {
  requireIncludes(compilerConfig, requiredCompilerDependency, 'ovs-compiler qin.config.js')
}
requireExcludes(compilerConfig, '"slime-parser"', 'ovs-compiler qin.config.js')
for (const unusedCompilerDependency of ['"slime-generator"', '"slime-token"']) {
  requireExcludes(compilerConfig, unusedCompilerDependency, 'ovs-compiler qin.config.js')
}
requireIncludes(parserSource, 'from "@qin/generated-qin-parser-ts"', 'OvsParser.ts')
requireExcludes(parserSource, 'slime-parser', 'OvsParser.ts')
requireIncludes(parserSource, 'from "cssts-compiler"', 'OvsParser.ts')
requireIncludes(parserSource, 'normalizeGeneratedTokens', 'OvsParser.ts')
requireIncludes(parserSource, 'extends CssTsParser', 'OvsParser.ts')
requireIncludes(parserSource, 'Alternative.of(', 'OvsParser.ts')
requireIncludes(compilerIndexSource, 'normalizeGeneratedCst', 'ovs-compiler src/index.ts')
requireIncludes(compilerIndexSource, 'import { registerSlimeCstToAstUtil } from "@qin/generated-qin-parser-ts/SlimeCstToAstBridge"', 'ovs-compiler src/index.ts')
requireIncludes(cstToAstSource, 'from "@qin/generated-qin-parser-ts/SlimeCstToAstBridge"', 'OvsCstToSlimeAst.ts')
requireIncludes(cstToAstSource, 'import { QinParser as SlimeParser } from "@qin/generated-qin-parser-ts"', 'OvsCstToSlimeAst.ts')
requireExcludes(cstToAstSource, 'from "slime-parser"', 'OvsCstToSlimeAst.ts')
requireIncludes(cstToAstSource, 'Object.getPrototypeOf(SlimeCstToAst.prototype)', 'OvsCstToSlimeAst.ts')
requireIncludes(statementCstToAstSource, 'import { QinParser as SlimeParser } from "@qin/generated-qin-parser-ts"', 'OvsCstToSlimeAst.Statement.ts')
requireExcludes(statementCstToAstSource, 'from "slime-parser"', 'OvsCstToSlimeAst.Statement.ts')

if (!fs.existsSync(generatedParserPath)) {
  throw new Error(`OVS compiler must resolve the shared generated Qin parser package: ${generatedParserPath}`)
}

if (parserSource.includes('alt:')) {
  throw new Error('OvsParser.ts must use generated parser Alternative.of semantics, not legacy { alt } alternatives')
}

if (compilerConfig.includes('npm run')) {
  throw new Error('ovs-compiler qin.config.js must run compiler tasks directly through Qin scripts, not npm run forwarding')
}

if (fs.existsSync(localAdapterPath)) {
  throw new Error('OVS must inherit the generated runtime adapter from cssts-compiler instead of keeping a local copy')
}

if (fs.existsSync(legacyOldFilePath)) {
  throw new Error('OVS compiler must not keep historical oldfile.ts source beside the active CST-to-AST implementation')
}

const parser = new OvsParser(ovsInheritedSyntaxSource)

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

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'interface')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'ChainUser')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'ChainPair')) {
  throw new Error('OvsParser chain must preserve TypeScript interface and type alias declarations from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'class')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'ChainService')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'constructor')) {
  throw new Error('OvsParser chain must preserve class fields and constructor syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'destructuredName')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'firstValue')) {
  throw new Error('OvsParser chain must preserve destructuring declarations from the generated parser')
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

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'while')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'total')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === '=')) {
  throw new Error('OvsParser chain must preserve Qin mutable while local and assignment syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'for')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'continue')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'break')) {
  throw new Error('OvsParser chain must preserve Qin for/break/continue syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'do')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'while')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'countAtLeastOnce')) {
  throw new Error('OvsParser chain must preserve Qin do-while syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'for')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'of')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'collect')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'item')) {
  throw new Error('OvsParser chain must preserve Qin for...of syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'switch')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'case')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'default')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'switchStatus')) {
  throw new Error('OvsParser chain must preserve Qin switch/case/default syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'import')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'meta')) {
  throw new Error('OvsParser chain must preserve import.meta syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => String(token.tokenValue).includes('./dep.qin'))) {
  throw new Error('OvsParser chain must preserve dynamic import syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenName === 'QuestionDot' && token.tokenValue === '?.')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'optionalName')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'profile')) {
  throw new Error('OvsParser chain must preserve optional chaining syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenName === 'NullishCoalescing' && token.tokenValue === '??')
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'fallbackName')) {
  throw new Error('OvsParser chain must preserve nullish coalescing syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenName === 'TemplateHead' && String(token.tokenValue).includes('hello'))
  || !parser.parsedTokens.some((token: any) => token.tokenValue === 'templateName')) {
  throw new Error('OvsParser chain must preserve template literal syntax from the generated parser')
}

if (!parser.parsedTokens.some((token: any) => token.tokenValue === 'css')) {
  throw new Error('OvsParser chain must preserve CSSTS css expression syntax')
}

console.log('ovs-compiler generated parser chain smoke passed')
