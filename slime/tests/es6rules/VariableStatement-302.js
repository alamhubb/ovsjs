/**
 * 规则测试：VariableStatement
 * 
 * 位置：Es6Parser.ts Line 1135
 * 分类：statements
 * 编号：302
 * 
 * 规则语法：
 *   VariableStatement:
 *     var VariableDeclarationList ;
 * 
 * 测试目标：
 * - 验证var关键字声明
 * - 验证多变量声明
 * - 覆盖各种初始化形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个var声明
var x = 1

// ✅ 测试2：多个var声明
var a = 1, b = 2, c = 3

// ✅ 测试3：无初始值的var
var uninitialized

// ✅ 测试4：混合有/无初始值
var init = 42, noinit, another = 'test'

// ✅ 测试5：var在全局作用域
var globalVar = 'global'

// ✅ 测试6：var在函数作用域
function testVarScope() {
    var funcVar = 'function scope'
    console.log(funcVar)
}

// ✅ 测试7：var提升特性
console.log(typeof hoisted)
var hoisted = 42

// ✅ 测试8：var在if语句中
if (true) {
    var ifVar = 'in if'
}
console.log(ifVar)

// ✅ 测试9：var在for循环中
for (var i = 0; i < 5; i++) {
    console.log(i)
}

// ✅ 测试10：var重新声明
var redeclare = 1
var redeclare = 2

// ✅ 测试11：var声明中的表达式初始值
var computed = 1 + 2 * 3

// ✅ 测试12：var声明对象初始值
var obj = { name: 'test', age: 25 }

// ✅ 测试13：var声明数组初始值
var arr = [1, 2, 3, 4, 5]

// ✅ 测试14：var声明函数初始值
var func = function() {
    return 42
}

// ✅ 测试15：复杂var声明组合
var p = 10, q = function() {}, r = { x: 1 }, s, t = [1, 2]

/* Es6Parser.ts: VariableStatement: var VariableDeclarationList ; */
