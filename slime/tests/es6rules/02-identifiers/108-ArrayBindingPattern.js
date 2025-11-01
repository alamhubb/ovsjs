/**
 * 规则测试：ArrayBindingPattern
 * 
 * 位置：Es6Parser.ts Line 1048
 * 分类：identifiers
 * 编号：108
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 3个分支
 * ✓ 包含Option（3处）
 * 
 * 规则语法：
 *   ArrayBindingPattern:
 *     [ BindingElementList , Elision? BindingRestElement? ]
 *     [ BindingElementList ]
 *     [ Elision? BindingRestElement? ]
 * 
 * 测试目标：
 * - 测试基础数组解构
 * - 测试跳过元素（Elision）
 * - 测试Rest元素
 * - 测试嵌套解构
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基础数组解构
const [a, b] = [1, 2]
const [x, y, z] = [10, 20, 30]

// ✅ 测试2：单元素解构
const [first] = [1, 2, 3]

// ✅ 测试3：跳过元素（Elision）
const [, second] = [1, 2]
const [one, , three] = [1, 2, 3]
const [, , third] = [1, 2, 3]

// ✅ 测试4：Rest元素
const [head, ...tail] = [1, 2, 3, 4, 5]
const [...all] = [1, 2, 3]

// ✅ 测试5：跳过 + Rest
const [, , ...rest] = [1, 2, 3, 4, 5]

// ✅ 测试6：嵌套数组解构
const [a1, [b1, c1]] = [1, [2, 3]]
const [[x1, y1], z1] = [[1, 2], 3]
const [[[deep]]] = [[[42]]]

// ✅ 测试7：空数组解构
const [] = []

// ✅ 测试8：默认值
const [val = 0] = []
const [first1 = 1, second1 = 2] = [10]

// ✅ 测试9：带尾逗号的解构
const [a2, b2,] = [1, 2]

// ✅ 测试10：函数参数中的数组解构
function swap([a, b]) {
    return [b, a]
}

const getFirst = ([first]) => first
const getRest = ([, ...rest]) => rest
