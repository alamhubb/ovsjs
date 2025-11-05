/**
 * 测试规则: FunctionExpression
 * 来源: 从 Expression 拆分
 */

/**
 * 规则测试：FunctionExpression
 * 
 * 位置：Es2025Parser.ts Line 219
 * 分类：expressions
 * 编号：226
 * 
 * 规则特征：
 * ✓ 包含Option（2处）- 函数名、函数体
 * 
 * 规则语法：
 *   FunctionExpression:
 *     function Identifier? ( FormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 覆盖Option1无：匿名函数表达式
 * - 覆盖Option1有：命名函数表达式
 * - 验证各种函数参数形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option1无 - 匿名函数表达式
const func1 = function() {
    return 42
}

// ✅ 测试2：Option1有 - 命名函数表达式
const func2 = function namedFunc() {
    return 42
}

// ✅ 测试3：Option2无 - 无参数函数
const greet = function() {
    console.log('hello')
}

// ✅ 测试4：Option2有 - 单个参数
const double = function(x) {
    return x * 2
}

// ✅ 测试5：Option2有 - 多个参数
const add = function(a, b) {
    return a + b
}

// ✅ 测试6：默认参数
const withDefault = function(x = 10) {
    return x
}

// ✅ 测试7：Rest参数
const variadic = function(...args) {
    return args.length
}

// ✅ 测试8：解构参数
const destructured = function({ x, y }) {
    return x + y
}

// ✅ 测试9：立即调用函数表达式（IIFE）
const result1 = (function() {
    return 42
})()

// ✅ 测试10：IIFE 带参数
const result2 = (function(x) {
    return x * 2
})(21)

// ✅ 测试11：函数表达式作为参数
[1, 2, 3].map(function(x) {
    return x * 2
})
// ✅ 测试12：函数表达式作为对象属性
const obj = {
    method: function() { return 'method' },
    action: function(a, b) { return a + b }
}

// ✅ 测试13：递归函数表达式
const factorial = function fac(n) {
    return n <= 1 ? 1 : n * fac(n - 1)
}

// ✅ 测试14：在条件表达式中
const fn = condition ? function() { return 'yes' } : function() { return 'no' }

// ✅ 测试15：作为回调函数
setTimeout(function() {
    console.log('done')
}, 1000)

/* Es2025Parser.ts: FunctionExpression: function Identifier? ( FormalParameters ) { FunctionBody } */


/* Es2025Parser.ts: function Identifier? (FormalParameters) { FunctionBody } */

// ============================================
// 合并来自: AsyncFunctionExpression-001.js
// ============================================


/* Es2025Parser.ts: async function Identifier? (FormalParameters) { FunctionBody } */
