/**
 * 规则测试：ForBinding
 * 
 * 位置：Es6Parser.ts Line 1253
 * 分类：identifiers
 * 编号：116
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   ForBinding:
 *     BindingIdentifier
 *     BindingPattern
 * 
 * 测试目标：
 * - 测试for-in/of循环中的绑定
 * - 覆盖Or的两个分支
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - BindingIdentifier (for-of)
for (const item of arr) {
    console.log(item)
}

// ✅ 测试2：Or分支1 - BindingIdentifier (for-in)
for (const key in obj) {
    console.log(key)
}

// ✅ 测试3：Or分支1 - BindingIdentifier (let)
for (let i of numbers) {
    console.log(i)
}

// ✅ 测试4：Or分支2 - ObjectBindingPattern
for (const {x, y} of points) {
    console.log(x, y)
}

// ✅ 测试5：Or分支2 - ArrayBindingPattern
for (const [a, b] of pairs) {
    console.log(a, b)
}

// ✅ 测试6：复杂ObjectBindingPattern
for (const {name, age = 18} of users) {
    console.log(name, age)
}

// ✅ 测试7：复杂ArrayBindingPattern
for (const [first, ...rest] of arrays) {
    console.log(first, rest)
}

// ✅ 测试8：嵌套BindingPattern
for (const {user: {name}} of data) {
    console.log(name)
}

for (const item of arr) {}
for (let {x, y} of points) {}
for (const [a, b] of pairs) {}
