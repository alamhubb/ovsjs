/**
 * 规则测试：SpreadElement
 * 分类：expressions | 编号：232
 * 
 * 规则特征：
 * ✓ Or规则 - ...AssignmentExpression | 无spread
 * ✓ 应用场景 - 数组、对象、函数调用
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：数组spread - 基本情况
const arr1 = [1, 2, 3]
const arr2 = [...arr1]

// ✅ 测试2：数组spread - 多个spread
const arr3 = [...arr1, ...[4, 5]]

// ✅ 测试3：数组spread - 混合元素
const arr4 = [0, ...arr1, 4]

// ✅ 测试4：数组spread - 嵌套数组
const nested = [[1, 2], [3, 4]]
const arr5 = [...nested]

// ✅ 测试5：对象spread - 基本情况
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1 }

// ✅ 测试6：对象spread - 多个spread
const obj3 = { ...obj1, ...{ c: 3 } }

// ✅ 测试7：对象spread - 混合属性
const obj4 = { x: 0, ...obj1, y: 5 }

// ✅ 测试8：对象spread - 覆盖属性
const obj5 = { ...obj1, a: 10 }

// ✅ 测试9：函数调用spread - 单个
function sum(a, b, c) { return a + b + c }
const result1 = sum(...[1, 2, 3])

// ✅ 测试10：函数调用spread - 多个
const args = [2, 3]
const result2 = sum(1, ...args)

// ✅ 测试11：函数调用spread - 混合
const result3 = sum(...[1], 2, 3)

// ✅ 测试12：spread - 字符串转数组
const str = "hello"
const chars = [...str]

// ✅ 测试13：spread - Map/Set转数组
const set = new Set([1, 2, 3])
const arr6 = [...set]

// ✅ 测试14：spread - 表达式
const arr7 = [...(true ? [1, 2] : [3, 4])]

// ✅ 测试15：spread - 函数表达式
const getArray = () => [5, 6, 7]
const arr8 = [...getArray()]

/* Es6Parser.ts: SpreadElement: ... AssignmentExpression */


// ============================================
// 来自文件: 903-SpreadElement.js
// ============================================

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
