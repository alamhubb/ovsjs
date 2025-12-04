/**
 * 规则测试：MultiplicativeExpression
 * 
 * 位置：Es2025Parser.ts Line 1008
 * 分类：expressions
 * 编号：212
 * 
 * 规则语法：
 *   MultiplicativeExpression:
 *     UnaryExpression
 *     MultiplicativeExpression * UnaryExpression
 *     MultiplicativeExpression / UnaryExpression
 *     MultiplicativeExpression % UnaryExpression
 * 
 * 测试目标：
 * - 覆盖乘法、除法、取模三个运算符
 * - 验证各种操作数类型
 * - 覆盖嵌套表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本乘法
2 * 3

// ✅ 测试2：基本除法
10 / 2

// ✅ 测试3：基本取模
10 % 3

// ✅ 测试4：多个乘法
2 * 3 * 4

// ✅ 测试5：多个除法
100 / 2 / 5

// ✅ 测试6：混合乘除
10 * 2 / 5

// ✅ 测试7：乘法链式
2 * 2 * 2 * 2

// ✅ 测试8：取模运算
15 % 4

// ✅ 测试9：复杂操作数
(10 * 2) / (5 - 1)

// ✅ 测试10：变量运算
const x = 5
const y = 3
x * y

// ✅ 测试11：函数调用乘法
Math.max(2, 3) * Math.min(5, 4)

// ✅ 测试12：表达式中的乘法
const result = (a * b) + 10

// ✅ 测试13：整数除法
20 / 3

// ✅ 测试14：零的处理
0 * 100

// ✅ 测试15：复杂表达式
const total = 10 * 5 / 2 % 7

/* Es2025Parser.ts: MultiplicativeExpression: MulOp[*|/|%] */


// ============================================
// 合并来自: ExponentiationExpression-001.js
// ============================================

/**
 * 规则测试：ExponentiationExpression
 * 分类：expressions | 编号：231
 * 
 * 规则特征：
 * ✓ Or规则 - UpdateExpression ** ExponentiationExpression | UpdateExpression
 * ✓ 右结合性 - 多个**操作符（右结合）
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：Or分支2 - UpdateExpression（无**操作）
const a = 5

// ✅ 测试2：Or分支1 - 基本幂操作
const b = 2 ** 3

// ✅ 测试3：**操作 - 浮点数
const c = 2.5 ** 2

// ✅ 测试4：**操作 - 变量
let x = 2
let y = 8
const d = x ** y

// ✅ 测试5：**操作 - 右结合（链式）
const e = 2 ** 3 ** 2

// ✅ 测试6：**操作 - 函数调用
function getBase() { return 3 }
function getExp() { return 4 }
const f = getBase() ** getExp()

// ✅ 测试7：**操作 - 对象属性
const obj = { base: 2, exp: 5 }
const g = obj.base ** obj.exp

// ✅ 测试8：**操作 - 数组元素
const arr = [3, 3]
const h = arr[0] ** arr[1]

// ✅ 测试9：**操作 - 表达式
const i = (2 + 1) ** (1 + 1)

// ✅ 测试10：**操作 - 一元操作
const j = (-2) ** 2

// ✅ 测试11：**操作 - 递增操作
let n = 2
const k = n++ ** 2

// ✅ 测试12：**操作 - 成员访问链
const obj2 = { math: { base: 2 } }
const l = obj2.math.base ** 10

// ✅ 测试13：**操作 - 条件表达式
const m = (true ? 2 : 3) ** 4

// ✅ 测试14：**操作 - 平方根倒数
const o = 16 ** 0.5

// ✅ 测试15：**操作 - 在赋值中
const p = 5 ** 2 + 3 ** 2

/* Es2025Parser.ts: ExponentiationExpression: UpdateExpression ** ExponentiationExpression | UpdateExpression */

/**
 * 规则测试：MultiplicativeExpression
 * 
 * 位置：Es2025Parser.ts Line 1008
 * 分类：expressions
 * 编号：212
 * 
 * 规则语法：
 *   MultiplicativeExpression:
 *     UnaryExpression
 *     MultiplicativeExpression * UnaryExpression
 *     MultiplicativeExpression / UnaryExpression
 *     MultiplicativeExpression % UnaryExpression
 * 
 * 测试目标：
 * - 覆盖乘法、除法、取模三个运算符
 * - 验证各种操作数类型
 * - 覆盖嵌套表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本乘法
2 * 3

// ✅ 测试2：基本除法
10 / 2

// ✅ 测试3：基本取模
10 % 3

// ✅ 测试4：多个乘法
2 * 3 * 4

// ✅ 测试5：多个除法
100 / 2 / 5

// ✅ 测试6：混合乘除
10 * 2 / 5

// ✅ 测试7：乘法链式
2 * 2 * 2 * 2

// ✅ 测试8：取模运算
15 % 4

// ✅ 测试9：复杂操作数
(10 * 2) / (5 - 1)

// ✅ 测试10：变量运算
const x = 5
const y = 3
x * y

// ✅ 测试11：函数调用乘法
Math.max(2, 3) * Math.min(5, 4)

// ✅ 测试12：表达式中的乘法
const result = (a * b) + 10

// ✅ 测试13：整数除法
20 / 3

// ✅ 测试14：零的处理
0 * 100

// ✅ 测试15：复杂表达式
const total = 10 * 5 / 2 % 7

/* Es2025Parser.ts: MultiplicativeExpression: MulOp[*|/|%] */
