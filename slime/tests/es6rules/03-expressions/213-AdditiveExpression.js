/**
 * 规则测试：AdditiveExpression
 * 
 * 位置：Es6Parser.ts Line 679
 * 分类：expressions
 * 编号：213
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * ✓ Many内包含Or（2个分支）- + 或 -
 * 
 * 规则语法：
 *   AdditiveExpression:
 *     MultiplicativeExpression ((+ | -) MultiplicativeExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 覆盖Or的两个分支（+和-）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 单个操作数
const single = a

// ✅ 测试2：Many=1，Or分支1 - + 运算符
const sum = a + b
const total = x + y

// ✅ 测试3：Many=1，Or分支2 - - 运算符
const diff = c - d
const delta = max - min

// ✅ 测试4：Many=2 - 三个操作数（+）
const sum3 = a + b + c
const total3 = x + y + z

// ✅ 测试5：Many=2 - 混合+和-
const calc = a + b - c
const result = x - y + z

// ✅ 测试6：Many>=3 - 多个操作数
const long = a + b + c + d + e
const chain = x - y - z - w

// ✅ 测试7：与乘法混合（优先级）
const mixed = a + b * c
const complex = x * y + z / w

// ✅ 测试8：字符串拼接
const str = 'hello' + ' ' + 'world'
const concat = prefix + value + suffix

a + b
c - d
a + b + c
