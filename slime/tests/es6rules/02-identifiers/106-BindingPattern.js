/**
 * 规则测试：BindingPattern
 * 
 * 位置：Es6Parser.ts Line 1007
 * 分类：identifiers
 * 编号：106
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   BindingPattern:
 *     ObjectBindingPattern
 *     ArrayBindingPattern
 * 
 * 测试目标：
 * - 测试对象解构模式
 * - 测试数组解构模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：ObjectBindingPattern - 基础
const {name, age} = person

// ✅ 测试2：ObjectBindingPattern - 重命名
const {name: userName} = user

// ✅ 测试3：ObjectBindingPattern - 嵌套
const {user: {name, profile: {age}}} = data

// ✅ 测试4：ObjectBindingPattern - Rest
const {a, ...rest} = obj

// ✅ 测试5：ArrayBindingPattern - 基础
const [first, second] = arr

// ✅ 测试6：ArrayBindingPattern - 跳过元素
const [, , third] = arr

// ✅ 测试7：ArrayBindingPattern - Rest
const [head, ...tail] = arr

// ✅ 测试8：ArrayBindingPattern - 嵌套
const [x, [y, z]] = [1, [2, 3]]

// ✅ 测试9：在函数参数中
function objectParam({name, age}) { return name }
function arrayParam([first, second]) { return first }

// ✅ 测试10：在for循环中
for (const {key, value} of entries) {}
for (const [index, item] of indexed) {}
