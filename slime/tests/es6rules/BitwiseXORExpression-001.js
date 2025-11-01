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

// ✅ 测试1：Many=0 - 无异或    BitwiseXORExpression -> BitwiseANDExpression (无^ 操作)
const single = a

// ✅ 测试2：Many=1 - 两个操作数    BitwiseXORExpression -> BitwiseANDExpression ^ BitwiseANDExpression (1个^)
const xor = a ^ b
const toggle = flags ^ 0x01

// ✅ 测试3：Many=2 - 三个操作数    BitwiseXORExpression -> Many (2个^)
const xor3 = x ^ y ^ z
const chain = a ^ b ^ c

// ✅ 测试4：Many=3 - 四个操作数    BitwiseXORExpression -> Many (3个^)
const xor4 = w ^ x ^ y ^ z

// ✅ 测试5：实际应用 - 位翻转    BitwiseXORExpression -> 实际位翻转操作
const flipped = value ^ 0xFF
const inverted = byte ^ 0xFFFF

// ✅ 测试6：实际应用 - 交换    BitwiseXORExpression -> 使用异或交换变量
let temp = a
a = a ^ b
b = a ^ b
a = a ^ b

// ✅ 测试7：与其他位运算组合    BitwiseXORExpression -> 与BitwiseANDExpression结合
const result = (a & 0xFF) ^ (b & 0xFF)
const calc = x ^ y & z

// ✅ 测试8：加密/校验场景    BitwiseXORExpression -> 在加密校验中使用
const checksum = data[0] ^ data[1] ^ data[2]
const encrypted = plaintext ^ key
/* Es6Parser.ts: BitwiseANDExpression (^ BitwiseANDExpression)* */


// ============================================
// 来自文件: 227-BitwiseXORExpression.js
// ============================================

/**
 * 规则测试：BitwiseXORExpression
 * 分类：expressions | 编号：227
 * 
 * 规则特征：
 * ✓ Or规则 - BitwiseXORExpression ^ BitwiseORExpression | BitwiseORExpression
 * ✓ Many情况 - 0个/1个/多个^操作符
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：Or分支2 - 单个BitwiseORExpression（无^操作）
const a = 5

// ✅ 测试2：Or分支1 - 两个操作数的^操作
const b = 5 ^ 3

// ✅ 测试3：Many情况 - 多个^操作（链式）
const c = 5 ^ 3 ^ 1

// ✅ 测试4：^操作 - 变量操作数
let x = 10
let y = 6
const d = x ^ y

// ✅ 测试5：^操作 - 字面量操作
const e = 15 ^ 8

// ✅ 测试6：^操作 - 函数调用
function getBits() { return 12 }
const f = getBits() ^ 7

// ✅ 测试7：^操作 - 对象属性
const obj = { a: 20, b: 16 }
const g = obj.a ^ obj.b

// ✅ 测试8：^操作 - 数组元素
const arr = [18, 6, 4]
const h = arr[0] ^ arr[1]

// ✅ 测试9：^操作 - 一元表达式
const i = ~5 ^ 3

// ✅ 测试10：^操作 - 加法表达式
const j = (5 + 3) ^ (2 + 1)

// ✅ 测试11：^操作 - 乘法表达式
const k = (4 * 3) ^ (2 * 2)

// ✅ 测试12：^操作 - 嵌套^操作
const l = 15 ^ 7 ^ 3 ^ 1

// ✅ 测试13：^操作 - 与&操作结合
const m = (12 & 8) ^ 5

// ✅ 测试14：^操作 - 条件表达式
const n = (true ? 12 : 8) ^ 5

// ✅ 测试15：^操作 - 成员访问链
const obj2 = { prop: { val: 24 } }
const o = obj2.prop.val ^ 18

// ✅ 测试16：^操作 - 在控制流中
if ((10 ^ 3) > 5) {
    console.log('xor result')
}

/* Es6Parser.ts: BitwiseXORExpression: BitwiseXORExpression ^ BitwiseORExpression | BitwiseORExpression */

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
/* Es6Parser.ts: BitwiseANDExpression (^ BitwiseANDExpression)* */
