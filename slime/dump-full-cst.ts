import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const file = process.argv[2]
if (!file) {
  console.log('usage: npx tsx dump-full-cst.ts <file>')
  process.exit(1)
}

const code = readFileSync(file, 'utf-8')
console.log('代码:')
console.log(code)
console.log('\n=== Lexer分析 ===')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(`Token数量: ${tokens.length}`)
console.log('前10个tokens:')
tokens.slice(0, 10).forEach((t, i) => {
  const typeName = t.type?.name || t.constructor?.name || 'Unknown'
  console.log(`  [${i}] ${typeName.padEnd(20)} "${t.value}"`)
})

console.log('\n=== Parser分析 ===')
const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('CST结构:')
console.log(JSON.stringify(cst, null, 2))

