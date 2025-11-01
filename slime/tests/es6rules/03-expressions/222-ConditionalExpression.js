/**
 * 规则测试：ConditionalExpression
 * 
 * 位置：Es6Parser.ts Line 783
 * 分类：expressions
 * 编号：222
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- 三元运算符可选
 * 
 * 规则语法：
 *   ConditionalExpression:
 *     LogicalORExpression (? AssignmentExpression : AssignmentExpression)?
 * 
 * 测试目标：
 * - 测试Option无（无三元运算符）
 * - 测试Option有（三元运算符）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 只有LogicalORExpression
const value = a
const logic = x || y

// ✅ 测试2：Option有 - 基础三元运算符
const result = a ? b : c
const sign = x > 0 ? 'positive' : 'negative'

// ✅ 测试3：嵌套三元运算符
const nested = a ? b : c ? d : e
const multi = x > 0 ? 'pos' : x < 0 ? 'neg' : 'zero'

// ✅ 测试4：复杂条件
const check = (a && b) ? c : d
const advanced = (x > 0 && y > 0) ? 'both' : 'not both'

// ✅ 测试5：复杂consequent和alternate
const calc = isPositive ? x * 2 + 1 : x * 2 - 1
const obj = hasData ? {data: value, status: 'ok'} : {error: 'none'}

// ✅ 测试6：在赋值中
const max = a > b ? a : b
const min = x < y ? x : y

// ✅ 测试7：多层嵌套
const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F'

// ✅ 测试8：在表达式中
const arr = [
    condition1 ? 'yes' : 'no',
    condition2 ? 1 : 0,
    condition3 ? true : false
]

a ? b : c
x > 0 ? 'pos' : 'neg'
a ? b : c ? d : e
