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
/* Es6Parser.ts: BitwiseXORExpression (| BitwiseXORExpression)* */


// ============================================
// 来自文件: 228-BitwiseORExpression.js
// ============================================

/**
 * 规则测试：BitwiseORExpression
 * 分类：expressions | 编号：228
 * 
 * 规则特征：
 * ✓ Or规则 - BitwiseORExpression | EqualityExpression | EqualityExpression
 * ✓ Many情况 - 0个/1个/多个|操作符
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：Or分支2 - 单个EqualityExpression（无|操作）
const a = 5

// ✅ 测试2：Or分支1 - 两个操作数的|操作
const b = 5 | 3

// ✅ 测试3：Many情况 - 多个|操作（链式）
const c = 5 | 3 | 1

// ✅ 测试4：|操作 - 变量操作数
let x = 8
let y = 4
const d = x | y

// ✅ 测试5：|操作 - 字面量操作
const e = 12 | 2

// ✅ 测试6：|操作 - 函数调用
function getFlagA() { return 6 }
function getFlagB() { return 9 }
const f = getFlagA() | getFlagB()

// ✅ 测试7：|操作 - 对象属性
const obj = { flag1: 1, flag2: 2 }
const g = obj.flag1 | obj.flag2

// ✅ 测试8：|操作 - 数组元素
const arr = [1, 2, 4]
const h = arr[0] | arr[1]

// ✅ 测试9：|操作 - 一元表达式
const i = ~5 | 3

// ✅ 测试10：|操作 - 比较表达式
const j = (5 == 5) | (3 == 2)

// ✅ 测试11：|操作 - 加法表达式
const k = (5 + 3) | (2 + 1)

// ✅ 测试12：|操作 - 多个标志位组合
const flags = 0x01 | 0x02 | 0x04 | 0x08

// ✅ 测试13：|操作 - 与&操作组合
const m = (12 & 8) | 3

// ✅ 测试14：|操作 - 条件表达式
const n = (true ? 12 : 8) | 3

// ✅ 测试15：|操作 - 嵌套成员访问
const obj2 = { flags: { mask: 15 } }
const o = obj2.flags.mask | 1

// ✅ 测试16：|操作 - 权限设置场景
const READ = 4, WRITE = 2, EXECUTE = 1
const permissions = READ | WRITE | EXECUTE

/* Es6Parser.ts: BitwiseORExpression: BitwiseORExpression | EqualityExpression | EqualityExpression */
