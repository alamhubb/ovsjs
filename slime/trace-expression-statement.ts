import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试不同表达式语句
const cases = [
  { code: 'function f() { return 1 }', desc: 'Return语句' },
  { code: 'function f() { x = 1 }', desc: '赋值表达式' },
  { code: 'function f() { x }', desc: '标识符表达式' },
  { code: 'function f() { 1 }', desc: '数字字面量' },
  { code: 'function f() { this.x = 1 }', desc: '成员赋值' },
]

console.log('=== 验证 ExpressionStatement 解析路径 ===\n')

for (const test of cases) {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(test.code)
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const status = (cst.children?.length || 0) > 0 ? '✅' : '❌'
  console.log(`${status} ${test.desc}: ${test.code}`)
}

console.log('\n✅ 成功 = 能正确通过 ExpressionStatement')
console.log('❌ 失败 = ExpressionStatement 解析失败导致整体失败')











