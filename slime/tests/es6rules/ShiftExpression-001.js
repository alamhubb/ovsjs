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

/* Es6Parser.ts: AdditiveExpression ((<< | >> | >>>) AdditiveExpression)* */


// ============================================
// 来自文件: 230-ShiftExpression.js
// ============================================

/**
 * 规则测试：ShiftExpression
 * 分类：expressions | 编号：230
 * 
 * 规则特征：
 * ✓ Or规则 - 3个分支（<<, >>, >>>）
 * ✓ Many情况 - 0个/1个/多个shift操作
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：Or分支0 - AdditiveExpression（无shift）
const a = 5

// ✅ 测试2：Or分支1 - 左移操作<<
const b = 5 << 1

// ✅ 测试3：Or分支2 - 右移操作>>
const c = 20 >> 2

// ✅ 测试4：Or分支3 - 无符号右移>>>
const d = -5 >>> 1

// ✅ 测试5：<<操作 - 多个移位
const e = 1 << 3

// ✅ 测试6：>>操作 - 变量操作数
let x = 16
const f = x >> 2

// ✅ 测试7：>>>操作 - 表达式
const g = (8 + 4) >>> 1

// ✅ 测试8：<<操作 - 函数调用
function getValue() { return 2 }
const h = 4 << getValue()

// ✅ 测试9：>>操作 - 对象属性
const obj = { bits: 24, shift: 3 }
const i = obj.bits >> obj.shift

// ✅ 测试10：>>>操作 - 数组元素
const arr = [32, 4]
const j = arr[0] >>> arr[1]

// ✅ 测试11：<<操作 - 乘以2的n次方
const k = 3 << 2

// ✅ 测试12：>>操作 - 除以2的n次方
const l = 64 >> 2

// ✅ 测试13：>>>操作 - 无符号操作
const m = -1 >>> 1

// ✅ 测试14：混合shift操作
const n = ((8 << 2) >> 1)

// ✅ 测试15：shift在条件中
if ((1 << 3) > 5) {
    console.log('shift result')
}

/* Es6Parser.ts: ShiftExpression: ShiftExpression << AdditiveExpression | ShiftExpression >> AdditiveExpression | ShiftExpression >>> AdditiveExpression | AdditiveExpression */

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

/* Es6Parser.ts: AdditiveExpression ((<< | >> | >>>) AdditiveExpression)* */
