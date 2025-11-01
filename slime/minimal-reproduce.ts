import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

console.log('=== 最小复现案例 ===\n')

const tests = [
  { code: 'function f() { return 1 }', desc: 'Return语句 - 正常' },
  { code: 'function f() { x = 1 }', desc: '赋值语句 - 失败' },
  { code: 'class A { constructor() { return 1 } }', desc: 'Class constructor with return - 正常' },
  { code: 'class B { constructor() { this.x = 1 } }', desc: 'Class constructor with 赋值 - 失败' },
]

for (const test of tests) {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(test.code)
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const status = (cst.children?.length || 0) > 0 ? '✅' : '❌'
  console.log(`${status} ${test.desc}`)
  console.log(`   代码: ${test.code}`)
  console.log(`   CST children: ${cst.children?.length || 0}`)
  console.log()
}

console.log('\n=== 问题模式 ===')
console.log('所有函数体中的赋值语句 (x = 1, this.x = 1) 都失败')
console.log('所有函数体中的return语句都成功')
console.log('问题定位: FunctionBody -> StatementList -> ExpressionStatement 解析失败')




