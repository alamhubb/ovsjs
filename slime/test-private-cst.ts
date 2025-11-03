/**
 * 查看私有属性的CST结构
 */

import Es2020Parser from './packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from './packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `class Counter {
  #count = 0;
}`

try {
  const lexer = new SubhutiLexer(es2020Tokens)
  const tokens = lexer.lexer(code)
  const parser = new Es2020Parser(tokens)
  const cst = parser.Program()
  
  console.log('CST结构:')
  console.log(JSON.stringify(cst, null, 2))
  
} catch (e) {
  console.error('错误:', e.message)
  console.error(e.stack)
}

