/**
 * 规则测试：ElementList
 * 
 * 位置：Es6Parser.ts Line 180
 * 分类：others
 * 编号：901
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 * ✓ 包含Option（2处）
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   ElementList:
 *     Elision? (SpreadElement | AssignmentExpression) ( , Elision? (SpreadElement | AssignmentExpression))*
 * 
 * 测试目标：
 * - 覆盖Or的两个分支（Spread vs Assignment）
 * - 测试Option有无（Elision）
 * - 测试Many=0/1/多
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支2 - AssignmentExpression only
const arr1 = [1, 2, 3]

// ✅ 测试2：Or分支1 - SpreadElement
const arr2 = [...original]

// ✅ 测试3：混合Spread和Assignment
const arr3 = [...arr1, 4, 5]
const mixed = [1, ...arr2, 2, 3]

// ✅ 测试4：Option有 - 前导省略（Elision）
const sparse1 = [, , 1, 2]

// ✅ 测试5：Option有 - 中间省略
const sparse2 = [1, , , 3]

// ✅ 测试6：Many=0 - 单个元素
const single = [1]
const single2 = [...arr]

// ✅ 测试7：Many=1 - 两个元素
const two = [1, 2]
const two2 = [...arr, 3]

// ✅ 测试8：Many=多 - 复杂组合
const complex = [, 1, , ...arr1, 2, , ...arr2, , 3]
const long = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const arr = [1, 2, 3]
const spread = [...arr, 4]
const mixed = [1, ...arr, 2]
