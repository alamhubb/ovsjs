import SubhutiParser, { Subhuti, SubhutiRule } from '../src/parser/SubhutiParser.ts'
import SubhutiTokenConsumer from '../src/parser/SubhutiTokenConsumer.ts'
import SubhutiMatchToken from '../src/struct/SubhutiMatchToken.ts'
import { SubhutiCreateToken } from '../src/struct/SubhutiCreateToken.ts'

// Subhuti Or回退问题测试
// 目标：演示Or机制在部分匹配成功时的回退问题

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' Subhuti Or回退问题演示'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')

// 模拟tokens：(1 < 2) || false
// 期望：解析为逻辑or表达式
// 实际：ArrowFunction误将 (1 < 2) 当成箭头函数参数
const mockTokens: SubhutiMatchToken[] = [
  { type: 'LParen', value: '(', start: { index: 0, line: 1, column: 0 }, end: { index: 1, line: 1, column: 1 } },
  { type: 'NumericLiteral', value: '1', start: { index: 1, line: 1, column: 1 }, end: { index: 2, line: 1, column: 2 } },
  { type: 'LessThan', value: '<', start: { index: 3, line: 1, column: 3 }, end: { index: 4, line: 1, column: 4 } },
  { type: 'NumericLiteral', value: '2', start: { index: 5, line: 1, column: 5 }, end: { index: 6, line: 1, column: 6 } },
  { type: 'RParen', value: ')', start: { index: 6, line: 1, column: 6 }, end: { index: 7, line: 1, column: 7 } },
  { type: 'LogicalOr', value: '||', start: { index: 8, line: 1, column: 8 }, end: { index: 10, line: 1, column: 10 } },
  { type: 'BooleanLiteral', value: 'false', start: { index: 11, line: 1, column: 11 }, end: { index: 16, line: 1, column: 16 } },
]

console.log('\n📝 测试场景: (1 < 2) || false')
console.log('─'.repeat(80))
console.log('代码: var x = (1 < 2) || false;')
console.log('\n预期行为：')
console.log('  1. Or尝试分支1: ArrowFunction')
console.log('     - ArrowParameters 匹配 (1 < 2) ✅')
console.log('     - 期望 Arrow (=>) token')
console.log('     - 实际是 || token ❌')
console.log('     - 应该: 回退tokens和CST，尝试下一个分支')
console.log('  2. Or尝试分支2: ConditionalExpression')
console.log('     - 成功解析为 LogicalOrExpression ✅')
console.log('\n实际行为：')
console.log('  - ArrowFunction部分匹配成功（ArrowParameters）')
console.log('  - Arrow token失败，但Or未正确回退')
console.log('  - CST保留了ArrowParameters子节点（不完整）')
console.log('  - CstToAst报错: "期望3个children，实际1个"')

console.log('\n🔍 根本原因推测：')
console.log('  1. Arrow token消费失败时，continueForAndNoBreak状态异常')
console.log('  2. Or的setBackData只回退tokens，未清理CST子节点')
console.log('  3. allowError机制导致错误被静默处理')

console.log('\n💡 解决方案：')
console.log('  方案1: ArrowFunction增加lookahead - 先检查是否有=>再匹配参数')
console.log('  方案2: 修复Or的CST清理 - 分支失败时清理部分创建的子节点')
console.log('  方案3: 调整AssignmentExpression的Or顺序 - 把ArrowFunction放最后')

console.log('\n' + '═'.repeat(80))
console.log('说明：这是一个演示文档，展示Or回退问题的原因和解决方案')
console.log('实际测试请运行: cd slime && npm test')
console.log('═'.repeat(80))

