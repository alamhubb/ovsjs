/**
 * 测试规则: VariableDeclarationList
 * 来源: 从 VariableDeclaration 拆分
 */

/**
 * 规则测试：VariableDeclarationList
 * 
 * 位置：Es2025Parser.ts Line 863
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

/* Es2025Parser.ts: VariableDeclarationList */
