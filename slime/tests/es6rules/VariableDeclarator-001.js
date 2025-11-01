/**
 * 规则测试：VariableDeclarator
 * 
 * 位置：Es6Parser.ts Line 874
 * 分类：others
 * 编号：919
 * 
 * EBNF规则：
 *   VariableDeclarator:
 *     BindingIdentifier Initializer? |
 *     BindingPattern Initializer
 * 
 * 测试目标：
 * - 测试简单标识符声明
 * - 测试带初始化的标识符
 * - 测试解构模式（数组）
 * - 测试解构模式（对象）
 * - 验证初始化可选性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单标识符不带初始化
let a

// ✅ 测试2：简单标识符带初始化
let b = 1

// ✅ 测试3：数组解构
let [x, y] = [2, 3]

// ✅ 测试4：对象解构
let {name, age} = {name: 'John', age: 25}

// ✅ 测试5：解构带默认值
let [m = 10] = []

// ✅ 测试6：对象解构带默认值
let {p = 20, q} = {}

// ✅ 测试7：嵌套解构
let {a: {b}} = {a: {b: 30}}

// ✅ 测试8：复杂解构混合
let [arr, {obj, val = 40}] = [[1, 2], {obj: 5}]

/* Es6Parser.ts: VariableDeclarator */
