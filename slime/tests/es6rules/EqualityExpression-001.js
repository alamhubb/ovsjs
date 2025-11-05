/**
 * 规则测试：EqualityExpression
 * 
 * 位置：Es6Parser.ts Line 1032
 * 分类：expressions
 * 编号：216
 * 
 * 规则语法：
 *   EqualityExpression:
 *     RelationalExpression
 *     EqualityExpression == RelationalExpression
 *     EqualityExpression != RelationalExpression
 *     EqualityExpression === RelationalExpression
 *     EqualityExpression !== RelationalExpression
 * 
 * 测试目标：
 * - 覆盖四个相等性运算符
 * - 验证各种类型比较
 * - 覆盖嵌套比较
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本相等（==）    EqualityExpression -> Or分支2 (==)
1 == 1

// ✅ 测试2：基本不相等（!=）    EqualityExpression -> Or分支3 (!=)
1 != 2

// ✅ 测试3：严格相等（===）    EqualityExpression -> Or分支4 (===)
1 === 1

// ✅ 测试4：严格不相等（!==）    EqualityExpression -> Or分支5 (!==)
1 !== '1'

// ✅ 测试5：字符串比较    EqualityExpression -> StringLiteral比较
'hello' === 'hello'

// ✅ 测试6：类型转换（==）    EqualityExpression -> 类型转换相等
1 == '1'

// ✅ 测试7：null比较
null == undefined

// ✅ 测试8：严格null比较
null === null

// ✅ 测试9：布尔值比较
true === true

// ✅ 测试10：多个相等性运算
1 === 1 && 2 === 2

// ✅ 测试11：比较变量
const a = 10
const b = 10
a === b

// ✅ 测试12：函数调用比较
Math.max(1, 2) === 2

// ✅ 测试13：对象比较
const obj1 = {}
const obj2 = obj1
obj1 === obj2

// ✅ 测试14：数组比较
[1, 2] === [1, 2]

// ✅ 测试15：复杂表达式
(a + 5) === (b + 5)

/* Es6Parser.ts: EqualityExpression: EqOp[==|!=|===|!==] */

/**
 * 规则测试：EqualityExpression
 * 
 * 位置：Es6Parser.ts Line 1032
 * 分类：expressions
 * 编号：216
 * 
 * 规则语法：
 *   EqualityExpression:
 *     RelationalExpression
 *     EqualityExpression == RelationalExpression
 *     EqualityExpression != RelationalExpression
 *     EqualityExpression === RelationalExpression
 *     EqualityExpression !== RelationalExpression
 * 
 * 测试目标：
 * - 覆盖四个相等性运算符
 * - 验证各种类型比较
 * - 覆盖嵌套比较
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本相等（==）
1 == 1

// ✅ 测试2：基本不相等（!=）
1 != 2

// ✅ 测试3：严格相等（===）
1 === 1

// ✅ 测试4：严格不相等（!==）
1 !== '1'

// ✅ 测试5：字符串比较
'hello' === 'hello'

// ✅ 测试6：类型转换（==）
1 == '1'

// ✅ 测试7：null比较
null == undefined

// ✅ 测试8：严格null比较
null === null

// ✅ 测试9：布尔值比较
true === true

// ✅ 测试10：多个相等性运算
1 === 1 && 2 === 2

// ✅ 测试11：比较变量
const a = 10
const b = 10
a === b

// ✅ 测试12：函数调用比较
Math.max(1, 2) === 2

// ✅ 测试13：对象比较
const obj1 = {}
const obj2 = obj1
obj1 === obj2

// ✅ 测试14：数组比较
[1, 2] === [1, 2]

// ✅ 测试15：复杂表达式
(a + 5) === (b + 5)

/* Es6Parser.ts: EqualityExpression: EqOp[==|!=|===|!==] */
