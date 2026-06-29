import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { OvsParser } from '../src/index.ts'
import { CssTsParser } from 'cssts-compiler'
import { SlimeJavascriptParser } from '@qin/generated-qin-parser-ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compilerRoot = path.join(__dirname, '..')
const workspaceRoot = path.join(compilerRoot, '..', '..', '..')

const compilerConfigPath = path.join(compilerRoot, 'qin.config.js')
const parserPath = path.join(compilerRoot, 'src', 'parser', 'OvsParser.ts')
const compilerIndexPath = path.join(compilerRoot, 'src', 'index.ts')
const cstToAstPath = path.join(compilerRoot, 'src', 'factory', 'OvsCstToSlimeAst', 'OvsCstToSlimeAst.ts')
const statementCstToAstPath = path.join(compilerRoot, 'src', 'factory', 'OvsCstToSlimeAst', 'OvsCstToSlimeAst.Statement.ts')
const localAdapterPath = path.join(compilerRoot, 'src', 'parser', 'generated-runtime-adapter.ts')
const legacyOldFilePath = path.join(compilerRoot, 'src', 'factory', 'oldfile.ts')
const generatedParserPath = path.join(workspaceRoot, 'qin', 'packages', 'qin-language', 'generated', 'qin-parser-ts')

const compilerConfig = fs.readFileSync(compilerConfigPath, 'utf-8')
const parserSource = fs.readFileSync(parserPath, 'utf-8')
const compilerIndexSource = fs.readFileSync(compilerIndexPath, 'utf-8')
const cstToAstSource = fs.readFileSync(cstToAstPath, 'utf-8')
const statementCstToAstSource = fs.readFileSync(statementCstToAstPath, 'utf-8')

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

requireIncludes(compilerConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-compiler qin.config.js')
requireIncludes(compilerConfig, '"@qin/generated-qin-parser-ts": "file:../../../qin/packages/qin-language/generated/qin-parser-ts"', 'ovs-compiler qin.config.js')
requireIncludes(compilerConfig, 'test: "tsx tests/test-generated-parser-chain.ts && tsdown"', 'ovs-compiler qin.config.js')
for (const requiredCompilerDependency of ['"subhuti"', '"slime-ast"', '"slime-parser"']) {
  requireIncludes(compilerConfig, requiredCompilerDependency, 'ovs-compiler qin.config.js')
}
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
requireIncludes(compilerIndexSource, 'import { registerSlimeCstToAstUtil } from "slime-parser"', 'ovs-compiler src/index.ts')
requireIncludes(cstToAstSource, 'import { SlimeCstToAst, SlimeParser, registerSlimeCstToAstUtil } from "slime-parser"', 'OvsCstToSlimeAst.ts')
requireIncludes(cstToAstSource, 'Object.getPrototypeOf(SlimeCstToAst.prototype)', 'OvsCstToSlimeAst.ts')
requireIncludes(statementCstToAstSource, 'import { SlimeParser } from "slime-parser"', 'OvsCstToSlimeAst.Statement.ts')

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
  '  count(limit: number): number {',
  '    let total = 0',
  '    while (total < limit) {',
  '      total = total + 1',
  '    }',
  '    return total',
  '  }',
  '  sum(limit: number): number {',
  '    let total = 0',
  '    for (let i = 0; i < limit; i = i + 1) {',
  '      if (i == 2) {',
  '        continue',
  '      }',
  '      if (i == 5) {',
  '        break',
  '      }',
  '      total = total + i',
  '    }',
  '    return total',
  '  }',
  '  countAtLeastOnce(limit: number): number {',
  '    let i = 0',
  '    do {',
  '      i = i + 1',
  '    } while (i < limit)',
  '    return i',
  '  }',
  '  collect(values: List): number {',
  '    let total = 0',
  '    for (const item of values) {',
  '      total = total + item',
  '    }',
  '    return total',
  '  }',
  '}',
  'const title = "Qin"',
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
  'const optionalName = user?.profile?.name',
  'const fallbackName = user.name ?? "anonymous"',
  'const templateName = `hello ${name}`',
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
