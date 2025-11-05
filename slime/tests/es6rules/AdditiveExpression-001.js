/**
 * 规则测试：AdditiveExpression
 * 
 * 位置：Es6Parser.ts Line 1016
 * 分类：expressions
 * 编号：213
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 加法、减法、字符串连接
 * 
 * 规则语法：
 *   AdditiveExpression:
 *     MultiplicativeExpression
 *     AdditiveExpression + MultiplicativeExpression
 *     AdditiveExpression - MultiplicativeExpression
 * 
 * 测试目标：
 * - 覆盖Or分支：加法、减法、字符串连接
 * - 验证各种操作数类型
 * - 覆盖嵌套和复杂表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本加法
1 + 2

// ✅ 测试2：基本减法
10 - 3

// ✅ 测试3：字符串连接
'hello' + 'world'

// ✅ 测试4：数字和字符串混合
42 + 'answer'

// ✅ 测试5：多个加法
1 + 2 + 3

// ✅ 测试6：多个减法
100 - 20 - 10

// ✅ 测试7：混合加减
10 + 5 - 3

// ✅ 测试8：加法链式
1 + 2 + 3 + 4 + 5

// ✅ 测试9：复杂操作数
(10 + 5) + (20 - 3)

// ✅ 测试10：变量运算
const a = 10
const b = 20
a + b

// ✅ 测试11：函数调用加法
Math.max(1, 2) + Math.min(5, 3)

// ✅ 测试12：字符串多次连接
'a' + 'b' + 'c' + 'd'

// ✅ 测试13：表达式中的加法
const result = (a + b) * 2

// ✅ 测试14：条件表达式加法
const x = true ? 1 + 2 : 3 + 4

// ✅ 测试15：对象/数组中的加法
const arr = [1 + 2, 3 + 4]
const obj = { sum: 5 + 6 }

/* Es6Parser.ts: AdditiveExpression: AddOp[+|-] */

/**
 * 规则测试：AdditiveExpression
 * 
 * 位置：Es6Parser.ts Line 1016
 * 分类：expressions
 * 编号：213
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 加法、减法、字符串连接
 * 
 * 规则语法：
 *   AdditiveExpression:
 *     MultiplicativeExpression
 *     AdditiveExpression + MultiplicativeExpression
 *     AdditiveExpression - MultiplicativeExpression
 * 
 * 测试目标：
 * - 覆盖Or分支：加法、减法、字符串连接
 * - 验证各种操作数类型
 * - 覆盖嵌套和复杂表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本加法
1 + 2

// ✅ 测试2：基本减法
10 - 3

// ✅ 测试3：字符串连接
'hello' + 'world'

// ✅ 测试4：数字和字符串混合
42 + 'answer'

// ✅ 测试5：多个加法
1 + 2 + 3

// ✅ 测试6：多个减法
100 - 20 - 10

// ✅ 测试7：混合加减
10 + 5 - 3

// ✅ 测试8：加法链式
1 + 2 + 3 + 4 + 5

// ✅ 测试9：复杂操作数
(10 + 5) + (20 - 3)

// ✅ 测试10：变量运算
const a = 10
const b = 20
a + b

// ✅ 测试11：函数调用加法
Math.max(1, 2) + Math.min(5, 3)

// ✅ 测试12：字符串多次连接
'a' + 'b' + 'c' + 'd'

// ✅ 测试13：表达式中的加法
const result = (a + b) * 2

// ✅ 测试14：条件表达式加法
const x = true ? 1 + 2 : 3 + 4

// ✅ 测试15：对象/数组中的加法
const arr = [1 + 2, 3 + 4]
const obj = { sum: 5 + 6 }

/* Es6Parser.ts: AdditiveExpression: AddOp[+|-] */
