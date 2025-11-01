import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试分号的影响
const tests = [
  { name: '无分号: x = 1', code: 'function f() { x = 1 }' },
  { name: '有分号: x = 1;', code: 'function f() { x = 1; }' },
  { name: '无分号: this.x = 1', code: 'function f() { this.x = 1 }' },
  { name: '有分号: this.x = 1;', code: 'function f() { this.x = 1; }' },
  { name: '无分号: return 1', code: 'function f() { return 1 }' },
  { name: '有分号: return 1;', code: 'function f() { return 1; }' },
]

for (const test of tests) {
  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(test.code)
    
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    const status = (cst.children?.length || 0) > 0 ? '✅ 成功' : '❌ 失败'
    console.log(`${status} - ${test.name}`)
    
  } catch (error) {
    console.log(`❌ 异常 - ${test.name}: ${error instanceof Error ? error.message : error}`)
  }
}




