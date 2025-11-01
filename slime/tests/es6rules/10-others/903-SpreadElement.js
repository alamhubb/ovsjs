/**
 * 规则测试：SpreadElement
 * 
 * 位置：Es6Parser.ts Line 203
 * 分类：others
 * 编号：903
 * 
 * 规则特征：
 * - 简单规则：... AssignmentExpression
 * 
 * 规则语法：
 *   SpreadElement:
 *     ... AssignmentExpression
 * 
 * 测试目标：
 * - 测试数组中的spread
 * - 测试函数调用中的spread
 * - 测试各种表达式
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：数组中的spread - 变量
const arr1 = [...original]

// ✅ 测试2：数组中的spread - 数组字面量
const arr2 = [...[1, 2, 3]]

// ✅ 测试3：数组中的spread - 函数调用
const arr3 = [...getArray()]

// ✅ 测试4：数组中多个spread
const merged = [...arr1, ...arr2, ...arr3]

// ✅ 测试5：数组中spread混合元素
const mixed = [0, ...arr1, 4, 5, ...arr2, 9]

// ✅ 测试6：函数调用中的spread
func(...args)
Math.max(...numbers)

// ✅ 测试7：对象spread（ES2018）
const obj = {...source}
const combined = {...obj1, ...obj2}

// ✅ 测试8：复杂表达式spread
const complex = [...(condition ? arr1 : arr2)]
const conditional = [...(arr || [])]