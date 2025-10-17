import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const file = process.argv[2]
if (!file) {
  console.log('usage: npx tsx dump-parser-errors.ts <file>')
  process.exit(1)
}

const code = readFileSync(file, 'utf-8')
console.log('代码:')
console.log(code)
console.log('\n=== Lexer分析 ===')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(`Token数量: ${tokens.length}`)

console.log('\n=== Parser分析 ===')
const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('CST children数量:', cst.children.length)
console.log('CST tokens数量:', cst.tokens.length)

// 检查Parser的错误
if ((parser as any).errors) {
  console.log('\nParser错误:')
  console.log((parser as any).errors)
}

// 检查Parser的currentIndex
console.log('\nParser currentIndex:', (parser as any).currentIndex)
console.log('总Token数:', tokens.length)
console.log('是否全部解析:', (parser as any).currentIndex === tokens.length)






