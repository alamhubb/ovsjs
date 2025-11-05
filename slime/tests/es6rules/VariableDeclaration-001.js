/**
 * 规则测试：VariableDeclaration
 * 
 * 位置：Es6Parser.ts Line 890
 * 分类：others
 * 编号：918
 * 
 * EBNF规则：
 *   VariableDeclaration:
 *     VariableLetOrConst VariableDeclarationList ;
 *   
 *   VariableLetOrConst:
 *     let | const
 * 
 * 测试目标：
 * - 测试let声明
 * - 测试const声明
 * - 测试var声明
 * - 测试多变量声明
 * - 测试带初始化的声明
 * - 测试数组解构声明
 * - 测试对象解构声明
 * - 测试混合声明（多变量 + 解构 + 初始化）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：let声明
let x = 1

// ✅ 测试2：const声明
const y = 2

// ✅ 测试3：var声明
var z = 3

// ✅ 测试4：多变量声明（let）
let a, b, c

// ✅ 测试5：多变量声明带初始化
let d = 4, e = 5, f = 6

// ✅ 测试6：数组解构声明
let [x1, x2, x3] = [10, 20, 30]

// ✅ 测试7：对象解构声明
let {name, age} = {name: 'John', age: 30}

// ✅ 测试8：解构与默认值
const [p = 0, q = 0] = arr
const {username = 'guest', email = ''} = user

/* Es6Parser.ts: VariableDeclaration */


// ============================================
// 合并来自: VariableDeclarationList-001.js
// ============================================

/**
 * 规则测试：VariableDeclarationList
 * 
 * 位置：Es6Parser.ts Line 863
 * 分类：others
 * 编号：917
 * 
 * EBNF规则：
 *   VariableDeclarationList:
 *     VariableDeclaration ( , VariableDeclaration )*
 * 
 * 测试目标：
 * - 测试单个变量声明
 * - 测试多个变量声明的组合
 * - 测试混合不同形式的声明
 * - 验证Many=1的情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：单个变量
let a = 1

// ✅ 测试2：两个变量
let b = 2, c = 3

// ✅ 测试3：多个变量
let d = 4, e = 5, f = 6

// ✅ 测试4：混合初始化和无初始化
let g, h = 7, i

// ✅ 测试5：const多变量
const j = 8, k = 9, l = 10

// ✅ 测试6：解构变量
let [m, n] = [11, 12], o = 13

// ✅ 测试7：对象解构
const {p, q} = {p: 14, q: 15}, r = 16

// ✅ 测试8：复杂混合
let {s: {t}} = {s: {t: 17}}, u = 18, [v] = [19]

/* Es6Parser.ts: VariableDeclarationList */

/**
 * 规则测试：VariableDeclaration
 * 
 * 位置：Es6Parser.ts Line 890
 * 分类：others
 * 编号：918
 * 
 * EBNF规则：
 *   VariableDeclaration:
 *     VariableLetOrConst VariableDeclarationList ;
 *   
 *   VariableLetOrConst:
 *     let | const
 * 
 * 测试目标：
 * - 测试let声明
 * - 测试const声明
 * - 测试var声明
 * - 测试多变量声明
 * - 测试带初始化的声明
 * - 测试数组解构声明
 * - 测试对象解构声明
 * - 测试混合声明（多变量 + 解构 + 初始化）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：let声明
let x = 1

// ✅ 测试2：const声明
const y = 2

// ✅ 测试3：var声明
var z = 3

// ✅ 测试4：多变量声明（let）
let a, b, c

// ✅ 测试5：多变量声明带初始化
let d = 4, e = 5, f = 6

// ✅ 测试6：数组解构声明
let [x1, x2, x3] = [10, 20, 30]

// ✅ 测试7：对象解构声明
let {name, age} = {name: 'John', age: 30}

// ✅ 测试8：解构与默认值
const [p = 0, q = 0] = arr
const {username = 'guest', email = ''} = user

/* Es6Parser.ts: VariableDeclaration */

// ============================================
// 合并来自: VariableStatement-001.js
// ============================================

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
