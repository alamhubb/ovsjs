/**
 * 规则测试：LogicalANDExpression
 * 
 * 位置：Es6Parser.ts Line 1040
 * 分类：expressions
 * 编号：220
 * 
 * 规则语法：
 *   LogicalANDExpression:
 *     BitwiseORExpression
 *     LogicalANDExpression && BitwiseORExpression
 * 
 * 测试目标：
 * - 验证逻辑AND操作符
 * - 验证短路求值
 * - 覆盖各种条件组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本AND
true && true

// ✅ 测试2：AND返回false
true && false

// ✅ 测试3：多个AND
true && true && true

// ✅ 测试4：混合条件
1 > 0 && 2 > 1

// ✅ 测试5：数值转布尔
5 && 3

// ✅ 测试6：短路求值
false && (1 / 0)

// ✅ 测试7：对象真值
{} && true

// ✅ 测试8：null/undefined
null && true

// ✅ 测试9：字符串真值
'hello' && 'world'

// ✅ 测试10：复杂条件组合
x > 0 && y < 10 && z === 5

// ✅ 测试11：AND与OR混合
true && (false || true)

// ✅ 测试12：函数调用AND
isValid() && processData()

// ✅ 测试13：数组AND
[1, 2] && [3, 4]

// ✅ 测试14：三元与AND组合
x > 5 && y < 10 ? 'yes' : 'no'

// ✅ 测试15：变量赋值AND
const result = condition && getValue()

/* Es6Parser.ts: LogicalANDExpression: && BitwiseORExpression */

/**
 * 规则测试：LogicalANDExpression
 * 
 * 位置：Es6Parser.ts Line 1040
 * 分类：expressions
 * 编号：220
 * 
 * 规则语法：
 *   LogicalANDExpression:
 *     BitwiseORExpression
 *     LogicalANDExpression && BitwiseORExpression
 * 
 * 测试目标：
 * - 验证逻辑AND操作符
 * - 验证短路求值
 * - 覆盖各种条件组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本AND
true && true

// ✅ 测试2：AND返回false
true && false

// ✅ 测试3：多个AND
true && true && true

// ✅ 测试4：混合条件
1 > 0 && 2 > 1

// ✅ 测试5：数值转布尔
5 && 3

// ✅ 测试6：短路求值
false && (1 / 0)

// ✅ 测试7：对象真值
{} && true

// ✅ 测试8：null/undefined
null && true

// ✅ 测试9：字符串真值
'hello' && 'world'

// ✅ 测试10：复杂条件组合
x > 0 && y < 10 && z === 5

// ✅ 测试11：AND与OR混合
true && (false || true)

// ✅ 测试12：函数调用AND
isValid() && processData()

// ✅ 测试13：数组AND
[1, 2] && [3, 4]

// ✅ 测试14：三元与AND组合
x > 5 && y < 10 ? 'yes' : 'no'

// ✅ 测试15：变量赋值AND
const result = condition && getValue()

/* Es6Parser.ts: LogicalANDExpression: && BitwiseORExpression */
