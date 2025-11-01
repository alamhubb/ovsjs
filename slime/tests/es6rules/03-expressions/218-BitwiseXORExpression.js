/**
 * 规则测试：BitwiseXORExpression
 * 
 * 位置：Es6Parser.ts Line 747
 * 分类：expressions
 * 编号：218
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   BitwiseXORExpression:
 *     BitwiseANDExpression (^ BitwiseANDExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 测试位异或运算
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无异或
const single = a

// ✅ 测试2：Many=1 - 两个操作数
const xor = a ^ b
const toggle = flags ^ 0x01

// ✅ 测试3：Many=2 - 三个操作数
const xor3 = x ^ y ^ z
const chain = a ^ b ^ c

// ✅ 测试4：Many=3 - 四个操作数
const xor4 = w ^ x ^ y ^ z

// ✅ 测试5：实际应用 - 位翻转
const flipped = value ^ 0xFF
const inverted = byte ^ 0xFFFF

// ✅ 测试6：实际应用 - 交换
let temp = a
a = a ^ b
b = a ^ b
a = a ^ b

// ✅ 测试7：与其他位运算组合
const result = (a & 0xFF) ^ (b & 0xFF)
const calc = x ^ y & z

// ✅ 测试8：加密/校验场景
const checksum = data[0] ^ data[1] ^ data[2]
const encrypted = plaintext ^ key