/**
 * 规则测试：EqualityExpression
 * 
 * 位置：Es6Parser.ts Line 724
 * 分类：expressions
 * 编号：216
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * ✓ Many内包含Or（4个分支）- == != === !==
 * 
 * 规则语法：
 *   EqualityExpression:
 *     RelationalExpression ((== | != | === | !==) RelationalExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 覆盖Or的全部4个分支
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无比较
const value = x

// ✅ 测试2：Or分支1 - == 运算符
const equal = a == b
if (x == 10) {}

// ✅ 测试3：Or分支2 - != 运算符
const notEqual = c != d
if (y != 0) {}

// ✅ 测试4：Or分支3 - === 运算符（严格相等）
const strictEqual = e === f
if (type === 'string') {}

// ✅ 测试5：Or分支4 - !== 运算符（严格不等）
const strictNotEqual = g !== h
if (value !== null) {}

// ✅ 测试6：Many=2 - 多个比较
const chain = a == b == c
const multi = x !== y !== z

// ✅ 测试7：实际应用
if (name === 'admin' && password !== '') {}
const isValid = input !== null && input !== undefined

// ✅ 测试8：== vs ===
const loose = null == undefined
const strict = null === undefined
const diff = 0 == false
const strictDiff = 0 === false

a == b
c != d
e === f
g !== h
