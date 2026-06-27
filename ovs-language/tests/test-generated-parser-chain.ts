import fs from 'node:fs'
import path from 'node:path'

const languageRoot = path.join(__dirname, '..')
const workspaceRoot = path.join(languageRoot, '..')

const languageConfigPath = path.join(languageRoot, 'qin.config.js')
const compilerConfigPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'qin.config.js')
const parserPath = path.join(workspaceRoot, 'ovs', 'ovs-compiler', 'src', 'parser', 'OvsParser.ts')

const languageConfig = fs.readFileSync(languageConfigPath, 'utf-8')
const compilerConfig = fs.readFileSync(compilerConfigPath, 'utf-8')
const parserSource = fs.readFileSync(parserPath, 'utf-8')

function requireIncludes(source: string, needle: string, label: string) {
  if (!source.includes(needle)) {
    throw new Error(`${label} must include ${needle}`)
  }
}

requireIncludes(languageConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-language qin.config.js')
requireIncludes(compilerConfig, 'parser: "@qin/generated-qin-parser-ts"', 'ovs-compiler qin.config.js')
requireIncludes(parserSource, 'from "@qin/generated-qin-parser-ts"', 'OvsParser.ts')
requireIncludes(parserSource, 'from "cssts-compiler"', 'OvsParser.ts')
requireIncludes(parserSource, 'extends CssTsParser', 'OvsParser.ts')
requireIncludes(parserSource, 'Alternative.of(', 'OvsParser.ts')

if (parserSource.includes('alt:')) {
  throw new Error('OvsParser.ts must use generated parser Alternative.of semantics, not legacy { alt } alternatives')
}

console.log('test-generated-parser-chain passed')
