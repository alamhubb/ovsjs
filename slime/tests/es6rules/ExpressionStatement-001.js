/**
 * 测试规则: ExpressionStatement
 * 来源: 从 Expression 拆分
 */

/* Es6Parser.ts: Expression ; */

/**
 * 规则测试：ExpressionStatement
 * 
 * 位置：Es6Parser.ts Line 1119
 * 分类：expressions
 * 编号：225
 * 
 * 规则特征：
 * - 简单规则：Expression ; 
 * - 无Or、Option、Many分支
 * 
 * 规则语法：
 *   ExpressionStatement:
 *     Expression ;
 * 
 * 测试目标：
 * - 验证各种表达式可以作为语句
 * - 验证自动分号插入
 * - 覆盖各种表达式类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：算术表达式语句    ExpressionStatement -> Expression (算术表达式)
1 + 2

// ✅ 测试2：函数调用表达式语句    ExpressionStatement -> CallExpression
console.log('test')

// ✅ 测试3：方法调用表达式语句    ExpressionStatement -> MemberExpression + CallExpression
const obj = { method: function() {} }
obj.method()

// ✅ 测试4：赋值表达式语句
let x = 1
x = 2

// ✅ 测试5：复合赋值表达式语句
x += 3

// ✅ 测试6：递增表达式语句
x++

// ✅ 测试7：递减表达式语句
x--

// ✅ 测试8：逗号表达式语句
x = 1, x = 2

// ✅ 测试9：new 表达式语句
new Date()

// ✅ 测试10：函数表达式语句（不同于函数声明）
(function() {
    console.log('iife')
})()

// ✅ 测试11：成员访问表达式语句
const arr = [1, 2, 3]
arr[0]

// ✅ 测试12：delete 表达式语句
const obj2 = { prop: 1 }
delete obj2.prop

// ✅ 测试13：typeof 表达式语句
typeof x

// ✅ 测试14：逻辑表达式语句
x > 0 && console.log('positive')

// ✅ 测试15：条件表达式语句
true ? console.log('yes') : console.log('no')

/* Es6Parser.ts: ExpressionStatement: Expression ; */


/* Es6Parser.ts: Expression ; */
