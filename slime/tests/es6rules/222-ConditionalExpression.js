/**
 * 规则测试：ConditionalExpression
 * 
 * 位置：Es6Parser.ts Line 1046
 * 分类：expressions
 * 编号：222
 * 
 * 规则语法：
 *   ConditionalExpression:
 *     LogicalORExpression
 *     LogicalORExpression ? AssignmentExpression : AssignmentExpression
 * 
 * 测试目标：
 * - 验证三元条件表达式
 * - 验证条件判断
 * - 覆盖嵌套条件表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本三元表达式
true ? 'yes' : 'no'

// ✅ 测试2：数值条件
1 > 0 ? 'positive' : 'non-positive'

// ✅ 测试3：变量条件
const x = 10
x > 5 ? 'big' : 'small'

// ✅ 测试4：布尔条件
const isValid = true
isValid ? 'valid' : 'invalid'

// ✅ 测试5：表达式作为结果
10 > 5 ? 10 + 5 : 10 - 5

// ✅ 测试6：函数调用条件
Math.random() > 0.5 ? 'heads' : 'tails'

// ✅ 测试7：嵌套三元表达式
const age = 30
age > 65 ? 'elderly' : age > 18 ? 'adult' : 'minor'

// ✅ 测试8：对象作为结果
true ? { x: 1 } : { y: 2 }

// ✅ 测试9：数组作为结果
false ? [1, 2, 3] : [4, 5, 6]

// ✅ 测试10：字符串条件
'hello' === 'hello' ? 'match' : 'no match'

// ✅ 测试11：逻辑AND条件
x > 0 && x < 100 ? 'in range' : 'out of range'

// ✅ 测试12：逻辑OR条件
x < 0 || x > 100 ? 'out of range' : 'in range'

// ✅ 测试13：复杂表达式条件
(x + 5) > (y - 3) ? 'first' : 'second'

// ✅ 测试14：函数参数三元表达式
const result = Math.max(5 > 3 ? 10 : 5, 20)

// ✅ 测试15：链式三元表达式
const score = 85
score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F'

/* Es6Parser.ts: ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression */
