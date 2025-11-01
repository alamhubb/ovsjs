/**
 * 规则测试：RelationalExpression
 * 
 * 位置：Es6Parser.ts Line 704
 * 分类：expressions
 * 编号：215
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * ✓ Many内包含Or（6个分支）- < > <= >= instanceof in
 * 
 * 规则语法：
 *   RelationalExpression:
 *     ShiftExpression ((< | > | <= | >= | instanceof | in) ShiftExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 覆盖Or的全部6个分支
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无比较
const value = x

// ✅ 测试2：Or分支1 - < 运算符
const less = a < b
if (x < 10) {}

// ✅ 测试3：Or分支2 - > 运算符
const greater = c > d
if (y > 0) {}

// ✅ 测试4：Or分支3 - <= 运算符
const lessEq = e <= f
if (count <= max) {}

// ✅ 测试5：Or分支4 - >= 运算符
const greaterEq = g >= h
if (age >= 18) {}

// ✅ 测试6：Or分支5 - instanceof 运算符
const isArray = x instanceof Array
if (obj instanceof Object) {}

// ✅ 测试7：Or分支6 - in 运算符
const hasKey = 'key' in obj
if ('length' in arr) {}

// ✅ 测试8：混合使用
if (a < b && c > d) {}
const check = x >= 0 && x <= 100
const valid = obj instanceof User && 'name' in obj

a < b
c > d
e <= f
g >= h
x instanceof Array
key in obj
