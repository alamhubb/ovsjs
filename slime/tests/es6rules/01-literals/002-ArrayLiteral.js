/**
 * 规则测试：ArrayLiteral
 * 
 * 位置：Es6Parser.ts Line 155
 * 分类：literals
 * 编号：002
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 3个分支
 * 
 * 规则语法：
 *   ArrayLiteral:
 *     [ ElementList , Elision? ]
 *     [ ElementList ]
 *     [ Elision? ]
 * 
 * 测试目标：
 * - 测试空数组
 * - 测试基础数组
 * - 测试带尾逗号
 * - 测试Elision（空元素）
 * - 测试Spread
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空数组
const empty = []

// ✅ 测试2：单元素数组
const single = [1]

// ✅ 测试3：多元素数组
const multiple = [1, 2, 3, 4, 5]

// ✅ 测试4：带尾逗号
const withTrailing = [1, 2, 3,]

// ✅ 测试5：Elision - 跳过元素
const sparse1 = [1, , 3]
const sparse2 = [, , 3]
const sparse3 = [1, 2, ,]

// ✅ 测试6：嵌套数组
const nested = [[1, 2], [3, 4], [5, 6]]

// ✅ 测试7：混合类型
const mixed = [1, 'text', true, null, {key: 'value'}]

// ✅ 测试8：Spread元素
const arr1 = [1, 2]
const arr2 = [...arr1, 3, 4]
const arr3 = [0, ...arr1, ...arr2]

// ✅ 测试9：复杂表达式作为元素
const complex = [1 + 2, func(), obj.prop, arr[0]]

// ✅ 测试10：空数组的Elision
const onlyCommas = [,,,]
