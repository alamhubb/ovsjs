/**
 * 规则测试：SpreadElement
 * 
 * 位置：Es6Parser.ts Line 203
 * 分类：others
 * 编号：903
 * 
 * EBNF规则：
 *   SpreadElement:
 *     ... AssignmentExpression
 * 
 * 测试目标：
 * - 测试数组中的spread操作
 * - 测试函数调用中的spread参数
 * - 测试spread不同的表达式类型
 * - 验证spread与普通元素的组合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：数组中spread变量
const arr1 = [...a]

// ✅ 测试2：数组中spread数组字面量
const arr2 = [...[1, 2, 3]]

// ✅ 测试3：spread在数组中间
const arr3 = [1, ...b, 3]

// ✅ 测试4：多个spread在数组中
const arr4 = [...a, ...b]

// ✅ 测试5：spread与普通元素混合
const arr5 = [...a, 2, ...b]

// ✅ 测试6：嵌套spread
const arr6 = [1, ...[2, 3], ...c, 4]

// ✅ 测试7：函数调用中的spread
const result = f(...args)

// ✅ 测试8：多个spread连续
const arr8 = [...a, ...b, ...c]
/* Es6Parser.ts: SpreadElement */
