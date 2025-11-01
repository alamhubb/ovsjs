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
