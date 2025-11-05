/**
 * 规则测试：LogicalORExpression
 * 
 * 位置：Es2025Parser.ts Line 1042
 * 分类：expressions
 * 编号：221
 * 
 * 规则语法：
 *   LogicalORExpression:
 *     LogicalANDExpression
 *     LogicalORExpression || LogicalANDExpression
 * 
 * 测试目标：
 * - 验证逻辑OR操作符
 * - 验证短路求值
 * - 覆盖各种条件组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本OR
false || true

// ✅ 测试2：多个OR
false || false || true

// ✅ 测试3：混合条件
1 < 0 || 2 > 1

// ✅ 测试4：短路求值
true || (1 / 0)

// ✅ 测试5：数值转布尔
0 || 5

// ✅ 测试6：null/undefined
null || undefined || 'default'

// ✅ 测试7：字符串真值
'' || 'hello' || 'world'

// ✅ 测试8：对象真值
false || {} || null

// ✅ 测试9：默认值模式
const name = input || 'Guest'

// ✅ 测试10：OR与AND混合
true || (false && true)

// ✅ 测试11：复杂条件组合
x < 0 || y > 100 || z === null

// ✅ 测试12：函数调用OR
isAdmin() || isModerator() || isUser()

// ✅ 测试13：多个备选值
getOption1() || getOption2() || getOption3()

// ✅ 测试14：三元与OR组合
condition1 || condition2 ? 'yes' : 'no'

// ✅ 测试15：实际应用
const result = userInput || sessionValue || defaultValue

/* Es2025Parser.ts: LogicalORExpression: || LogicalANDExpression */

/**
 * 规则测试：LogicalORExpression
 * 
 * 位置：Es2025Parser.ts Line 1042
 * 分类：expressions
 * 编号：221
 * 
 * 规则语法：
 *   LogicalORExpression:
 *     LogicalANDExpression
 *     LogicalORExpression || LogicalANDExpression
 * 
 * 测试目标：
 * - 验证逻辑OR操作符
 * - 验证短路求值
 * - 覆盖各种条件组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本OR
false || true

// ✅ 测试2：多个OR
false || false || true

// ✅ 测试3：混合条件
1 < 0 || 2 > 1

// ✅ 测试4：短路求值
true || (1 / 0)

// ✅ 测试5：数值转布尔
0 || 5

// ✅ 测试6：null/undefined
null || undefined || 'default'

// ✅ 测试7：字符串真值
'' || 'hello' || 'world'

// ✅ 测试8：对象真值
false || {} || null

// ✅ 测试9：默认值模式
const name = input || 'Guest'

// ✅ 测试10：OR与AND混合
true || (false && true)

// ✅ 测试11：复杂条件组合
x < 0 || y > 100 || z === null

// ✅ 测试12：函数调用OR
isAdmin() || isModerator() || isUser()

// ✅ 测试13：多个备选值
getOption1() || getOption2() || getOption3()

// ✅ 测试14：三元与OR组合
condition1 || condition2 ? 'yes' : 'no'

// ✅ 测试15：实际应用
const result = userInput || sessionValue || defaultValue

/* Es2025Parser.ts: LogicalORExpression: || LogicalANDExpression */
