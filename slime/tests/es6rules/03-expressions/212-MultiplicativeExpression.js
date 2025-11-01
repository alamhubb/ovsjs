/**
 * 规则测试：MultiplicativeExpression
 * 
 * 位置：Es6Parser.ts Line 1008
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

/* Es6Parser.ts: MultiplicativeExpression: MulOp[*|/|%] */
