/**
 * 规则测试：ArrayBindingPattern
 * 
 * 位置：Es6Parser.ts Line 1017
 * 分类：identifiers
 * 编号：108
 * 
 * EBNF规则：
 *   ArrayBindingPattern:
 *     [ BindingElementList , Elision? BindingRestElement? ] |
 *     [ BindingElementList ] |
 *     [ Elision? BindingRestElement? ]
 * 
 * 规则特征：
 * ✓ 包含Or规则（3个分支）
 * ✓ 分支1：BindingElementList + Comma + Optional(Elision) + Optional(BindingRestElement)
 * ✓ 分支2：BindingElementList
 * ✓ 分支3：Optional(Elision) + Optional(BindingRestElement)
 * 
 * 测试目标：
 * - 覆盖Or分支1：元素列表 + 逗号 + 可选Elision + 可选Rest
 * - 覆盖Or分支2：元素列表
 * - 覆盖Or分支3：可选Elision + 可选Rest（空数组、只有Rest等）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖3个Or分支 + 扩展测试）
 */

// ✅ 测试1：Or分支2 - 基础数组解构（BindingElementList）
const [a, b] = [1, 2]
const [x, y, z] = [10, 20, 30]

// ✅ 测试2：或分支2变体 - 单元素解构
const [first] = [1, 2, 3]

// ✅ 测试3：Or分支1 - 元素列表 + 逗号 + Rest（BindingElementList + Comma + BindingRestElement）
const [head, ...tail] = [1, 2, 3, 4, 5]

// ✅ 测试4：或分支1变体 - 元素列表 + 逗号 + Elision + Rest
const [, , ...rest] = [1, 2, 3, 4, 5]

// ✅ 测试5：Or分支3 - 空数组（Option=false, Option=false）
const [] = []

// ✅ 测试6：或分支3变体 - 只有Elision（跳过所有）
const [, , ,] = [1, 2, 3, 4]

// ✅ 测试7：或分支3变体 - 只有Rest（Option=false, Option=true）
const [...all] = [1, 2, 3]

// ✅ 测试8：或分支1变体 - 嵌套解构
const [[x1, y1], z1] = [[1, 2], 3]

// ✅ 扩展测试1：跳过元素（Elision）
const [, second] = [1, 2]
const [one, , three] = [1, 2, 3]
const [, , third] = [1, 2, 3]

// ✅ 扩展测试2：嵌套数组解构
const [a1, [b1, c1]] = [1, [2, 3]]
const [[[deep]]] = [[[42]]]

// ✅ 扩展测试3：默认值
const [val = 0] = []
const [first1 = 1, second1 = 2] = [10]

// ✅ 扩展测试4：带尾逗号的解构
const [a2, b2,] = [1, 2]

// ✅ 扩展测试5：函数参数中的数组解构
function swap([a, b]) {
    return [b, a]
}

const getFirst = ([first]) => first
const getRest = ([, ...rest]) => rest

/* Es6Parser.ts: [ BindingElementList? Elision? BindingRestElement? ] */
