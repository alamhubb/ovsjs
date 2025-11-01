import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

console.log('=== 深度追踪：function f() { x = 1 } ===\n')

const code = 'function f() { x = 1 }'

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('Tokens序列:')
tokens.forEach((t, i) => {
  console.log(`  [${i}] ${t.tokenName}`)
})

console.log('\n=== 解析流程 ===')
console.log('1. Program → ModuleItemList')
console.log('2. ModuleItemList → StatementListItem')
console.log('3. StatementListItem → Declaration')
console.log('4. Declaration → HoistableDeclaration')
console.log('5. HoistableDeclaration → FunctionDeclaration')
console.log('6. FunctionDeclaration → FunctionFormalParametersBodyDefine')
console.log('7. FunctionFormalParametersBodyDefine → FunctionBodyDefine')
console.log('8. FunctionBodyDefine → LBrace + FunctionBody + RBrace')
console.log('9. FunctionBody → StatementList')
console.log('10. StatementList → StatementListItem (Many)')
console.log('11. StatementListItem → Statement')
console.log('12. Statement → ExpressionStatement')
console.log('13. ExpressionStatement → Expression + EmptySemicolon')
console.log('14. Expression → AssignmentExpression')
console.log('15. AssignmentExpression 应该匹配: Identifier Eq NumericLiteral')
console.log('\n❌ 问题: 第14-15步失败')

console.log('\n=== 可能的失败点 ===')
console.log('• AssignmentExpression 被 ConditionalExpression 或 ArrowFunction 误匹配')
console.log('• 某个中间规则消费了过多 tokens')
console.log('• EmptySemicolon 导致回溯失败')










