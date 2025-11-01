/**
 * 规则测试：BitwiseANDExpression
 * 
 * 位置：Es6Parser.ts Line 738
 * 分类：expressions
 * 编号：217
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   BitwiseANDExpression:
 *     EqualityExpression (& EqualityExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 测试位与运算
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无位与
const single = a

// ✅ 测试2：Many=1 - 两个操作数
const and = a & b
const mask = flags & 0xFF

// ✅ 测试3：Many=2 - 三个操作数
const and3 = x & y & z
const masked = value & 0xFF & 0xF0

// ✅ 测试4：Many=3 - 四个操作数
const and4 = a & b & c & d

// ✅ 测试5：实际应用 - 位掩码
const red = color & 0xFF0000
const permissions = user.flags & ADMIN_FLAG

// ✅ 测试6：与其他位运算组合
const result = (a | b) & mask
const calc = x & y | z

// ✅ 测试7：在条件判断中
if ((flags & READ_FLAG) !== 0) {}

// ✅ 测试8：复杂位运算
const extracted = (value >> 8) & 0xFF
const combined = (r & 0xFF) << 16