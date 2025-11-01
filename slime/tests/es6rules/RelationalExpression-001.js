/**
 * 规则测试：RelationalExpression
 * 
 * 位置：Es6Parser.ts Line 1024
 * 分类：expressions
 * 编号：215
 * 
 * 规则语法：
 *   RelationalExpression:
 *     ShiftExpression
 *     RelationalExpression < ShiftExpression
 *     RelationalExpression > ShiftExpression
 *     RelationalExpression <= ShiftExpression
 *     RelationalExpression >= ShiftExpression
 *     RelationalExpression instanceof ShiftExpression
 *     RelationalExpression in ShiftExpression
 * 
 * 测试目标：
 * - 覆盖六个关系运算符
 * - 验证大小比较
 * - 覆盖instanceof和in运算符
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本小于（<）
1 < 2

// ✅ 测试2：基本大于（>）
5 > 3

// ✅ 测试3：小于等于（<=）
10 <= 10

// ✅ 测试4：大于等于（>=）
20 >= 15

// ✅ 测试5：instanceof 检查
new Date() instanceof Date

// ✅ 测试6：in 运算符
'length' in [1, 2, 3]

// ✅ 测试7：多个比较
1 < 2 && 2 < 3

// ✅ 测试8：字符串比较
'a' < 'b'

// ✅ 测试9：instanceof 对象
const obj = {}
obj instanceof Object

// ✅ 测试10：in 对象属性
'name' in { name: 'test' }

// ✅ 测试11：变量比较
const x = 10
const y = 20
x < y

// ✅ 测试12：范围检查
const age = 25
age >= 18 && age < 65

// ✅ 测试13：数组instanceof检查
[] instanceof Array

// ✅ 测试14：复杂比较
(1 + 5) <= (2 * 3)

// ✅ 测试15：条件表达式中的比较
const result = x > 10 ? 'big' : 'small'

/* Es6Parser.ts: RelationalExpression: RelOp[<|>|<=|>=|instanceof|in] */
