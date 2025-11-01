/**
 * 规则测试：BitwiseORExpression
 * 
 * 位置：Es6Parser.ts Line 756
 * 分类：expressions
 * 编号：219
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   BitwiseORExpression:
 *     BitwiseXORExpression (| BitwiseXORExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 测试位或运算
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无位或
const single = a

// ✅ 测试2：Many=1 - 两个操作数
const or = a | b
const combine = flags | NEW_FLAG

// ✅ 测试3：Many=2 - 三个操作数
const or3 = x | y | z
const multi = flag1 | flag2 | flag3

// ✅ 测试4：Many=3 - 四个操作数
const or4 = a | b | c | d

// ✅ 测试5：实际应用 - 设置标志位
const flags = READ_FLAG | WRITE_FLAG | EXECUTE_FLAG
const permissions = USER | ADMIN | GUEST

// ✅ 测试6：实际应用 - 合并颜色
const color = (r << 16) | (g << 8) | b
const rgba = (a << 24) | (r << 16) | (g << 8) | b

// ✅ 测试7：与其他位运算组合
const result = (a & 0xFF) | (b & 0xFF00)
const mixed = x | y & z

// ✅ 测试8：在条件中
if ((status | ERROR_FLAG) === status) {}
const enabled = (config | DEFAULT_CONFIG) !== 0