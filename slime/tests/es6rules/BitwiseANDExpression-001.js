/**
 * 规则测试：BitwiseANDExpression
 * 
 * 位置：Es2025Parser.ts Line 738
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

// ✅ 测试1：Many=0 - 无位与    BitwiseANDExpression -> EqualityExpression (无&操作)
const single = a

// ✅ 测试2：Many=1 - 两个操作数    BitwiseANDExpression -> EqualityExpression & EqualityExpression (1个&)
const and = a & b
const mask = flags & 0xFF

// ✅ 测试3：Many=2 - 三个操作数    BitwiseANDExpression -> Many (2个&)
const and3 = x & y & z
const masked = value & 0xFF & 0xF0

// ✅ 测试4：Many=3 - 四个操作数    BitwiseANDExpression -> Many (3个&)
const and4 = a & b & c & d

// ✅ 测试5：实际应用 - 位掩码    BitwiseANDExpression -> 实际位掩码操作
const red = color & 0xFF0000
const permissions = user.flags & ADMIN_FLAG

// ✅ 测试6：与其他位运算组合    BitwiseANDExpression -> 与BitwiseORExpression结合
const result = (a | b) & mask
const calc = x & y | z

// ✅ 测试7：在条件判断中    BitwiseANDExpression -> 在if条件中
if ((flags & READ_FLAG) !== 0) {}

// ✅ 测试8：复杂位运算    BitwiseANDExpression -> 与移位运算结合
const extracted = (value >> 8) & 0xFF
const combined = (r & 0xFF) << 16
/* Es2025Parser.ts: EqualityExpression (& EqualityExpression)* */


// ============================================
// 来自文件: 226-BitwiseANDExpression.js
// ============================================

/**
 * 规则测试：BitwiseANDExpression
 * 分类：expressions | 编号：226
 * 
 * 规则特征：
 * ✓ Or规则 - BitwiseANDExpression & BitwiseXORExpression | BitwiseXORExpression
 * ✓ Many情况 - 0个/1个/多个&操作符
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：Or分支2 - 单个BitwiseXORExpression（无&操作）
const a = 5

// ✅ 测试2：Or分支1 - 两个操作数的&操作
const b = 5 & 3

// ✅ 测试3：Many情况 - 多个&操作（链式）
const c = 5 & 3 & 1

// ✅ 测试4：&操作 - 变量操作数
let x = 10
let y = 6
const d = x & y

// ✅ 测试5：&操作 - 表达式操作数
const e = (5 + 3) & (2 + 1)

// ✅ 测试6：&操作 - 函数调用结果
function getValue() { return 8 }
const f = getValue() & 7

// ✅ 测试7：&操作 - 对象属性访问
const obj = { a: 15, b: 8 }
const g = obj.a & obj.b

// ✅ 测试8：&操作 - 数组元素访问
const arr = [12, 5, 3]
const h = arr[0] & arr[1]

// ✅ 测试9：&操作 - 一元表达式
const i = ~5 & 3

// ✅ 测试10：&操作 - 成员表达式
const obj2 = { prop: { val: 16 } }
const j = obj2.prop.val & 14

// ✅ 测试11：&操作 - 调用表达式
const k = getValue() & getValue()

// ✅ 测试12：&操作 - 条件表达式
const l = (true ? 12 : 8) & 10

// ✅ 测试13：&操作 - 复杂链式
const m = 15 & 7 & 3 & 1

// ✅ 测试14：&操作 - 赋值给新变量
const result = 20 & 12

// ✅ 测试15：&操作 - 在逻辑表达式中
const n = (5 & 3) > 0

// ✅ 测试16：&操作 - 在循环中
for (let i = 0; i < 10; i++) {
    const mask = i & 7
}

/* Es2025Parser.ts: BitwiseANDExpression: BitwiseANDExpression & BitwiseXORExpression | BitwiseXORExpression */

/**
 * 规则测试：BitwiseANDExpression
 * 
 * 位置：Es2025Parser.ts Line 738
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

// ✅ 测试1：Many=0 - 无位与    BitwiseANDExpression -> EqualityExpression (无&操作)
const single = a

// ✅ 测试2：Many=1 - 两个操作数    BitwiseANDExpression -> EqualityExpression & EqualityExpression (1个&)
const and = a & b
const mask = flags & 0xFF

// ✅ 测试3：Many=2 - 三个操作数    BitwiseANDExpression -> Many (2个&)
const and3 = x & y & z
const masked = value & 0xFF & 0xF0

// ✅ 测试4：Many=3 - 四个操作数    BitwiseANDExpression -> Many (3个&)
const and4 = a & b & c & d

// ✅ 测试5：实际应用 - 位掩码    BitwiseANDExpression -> 实际位掩码操作
const red = color & 0xFF0000
const permissions = user.flags & ADMIN_FLAG

// ✅ 测试6：与其他位运算组合    BitwiseANDExpression -> 与BitwiseORExpression结合
const result = (a | b) & mask
const calc = x & y | z

// ✅ 测试7：在条件判断中    BitwiseANDExpression -> 在if条件中
if ((flags & READ_FLAG) !== 0) {}

// ✅ 测试8：复杂位运算    BitwiseANDExpression -> 与移位运算结合
const extracted = (value >> 8) & 0xFF
const combined = (r & 0xFF) << 16
/* Es2025Parser.ts: EqualityExpression (& EqualityExpression)* */
