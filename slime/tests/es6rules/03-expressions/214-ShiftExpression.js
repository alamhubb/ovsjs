/**
 * 规则测试：ShiftExpression
 * 
 * 位置：Es6Parser.ts Line 691
 * 分类：expressions
 * 编号：214
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * ✓ Many内包含Or（3个分支）- << >> >>>
 * 
 * 规则语法：
 *   ShiftExpression:
 *     AdditiveExpression ((<< | >> | >>>) AdditiveExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 覆盖Or的三个分支
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无移位
const single = a

// ✅ 测试2：Many=1，Or分支1 - << 左移
const leftShift = a << 1
const double = n << 1

// ✅ 测试3：Many=1，Or分支2 - >> 有符号右移
const rightShift = b >> 2
const half = n >> 1

// ✅ 测试4：Many=1，Or分支3 - >>> 无符号右移
const unsigned = c >>> 1
const positive = n >>> 2

// ✅ 测试5：Many=2 - 多次移位
const multi = a << 2 << 1
const chain = x >> 1 >> 1

// ✅ 测试6：混合移位运算符
const mixed = a << 2 >> 1
const complex = n << 3 >>> 1

// ✅ 测试7：实际应用场景
const flag = 1 << bitPosition
const mask = 0xFF << 8
const extract = value >> offset

// ✅ 测试8：在位运算中
const packed = (r << 16) | (g << 8) | b
const unpacked = color >> 16

a << 1
b >> 2
c >>> 1
