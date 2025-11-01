/**
 * 规则测试：LogicalANDExpression
 * 
 * 位置：Es6Parser.ts Line 765
 * 分类：expressions
 * 编号：220
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   LogicalANDExpression:
 *     BitwiseORExpression (&& BitwiseORExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 测试逻辑与运算
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无逻辑与
const single = a

// ✅ 测试2：Many=1 - 两个操作数
const and = a && b
const both = isValid && isActive

// ✅ 测试3：Many=2 - 三个操作数
const and3 = x && y && z
const all = cond1 && cond2 && cond3

// ✅ 测试4：Many=3 - 四个操作数
const and4 = a && b && c && d

// ✅ 测试5：短路求值
const result = null && obj.prop
const safe = obj && obj.method()

// ✅ 测试6：在条件中
if (x > 0 && y < 100) {}
if (isAdmin && hasPermission && isActive) {}

// ✅ 测试7：默认值模式
const value = input && input.value
const name = user && user.name || 'Guest'

// ✅ 测试8：复杂条件
if (a > 0 && b > 0 && a + b < 100) {}
const valid = type === 'user' && age >= 18 && verified