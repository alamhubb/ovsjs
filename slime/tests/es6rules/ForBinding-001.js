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

/* Es6Parser.ts: BindingPattern | BindingIdentifier */


// ============================================
// 来自文件: 706-ForBinding.js
// ============================================

/**
 * 规则测试：ForBinding
 * 分类：others | 编号：706
 * 
 * 规则定义（Es6Parser.ts）：
 * ForBinding:
 *   BindingIdentifier
 *   BindingPattern
 * 
 * 中文说明：
 * ✓ for循环中的绑定形式
 * ✓ 可以是简单标识符或解构模式
 * ✓ 用于for-in/for-of循环变量声明
 * ✓ 创建块作用域的变量
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：ForBinding - BindingIdentifier
for (let item of [1, 2, 3]) {
    console.log(item)
}

// ✅ 测试2：ForBinding - BindingIdentifier with const
for (const key in {a: 1, b: 2}) {
    console.log(key)
}

// ✅ 测试3：ForBinding - BindingPattern对象解构
for (let { x, y } of [{x: 1, y: 2}]) {
    console.log(x, y)
}

// ✅ 测试4：ForBinding - BindingPattern数组解构
for (const [a, b] of [[1, 2], [3, 4]]) {
    console.log(a, b)
}

// ✅ 测试5：ForBinding - for-of单元素
for (const value of [1, 2, 3]) {
    console.log(value)
}

// ✅ 测试6：ForBinding - for-in对象遍历
for (let key in {name: 'test', age: 30}) {
    console.log(key)
}

// ✅ 测试7：ForBinding - 嵌套对象解构
for (const { user: { name } } of [{user: {name: 'John'}}]) {
    console.log(name)
}

// ✅ 测试8：ForBinding - 嵌套数组解构
for (let [x, [y, z]] of [[1, [2, 3]]]) {
    console.log(x, y, z)
}

// ✅ 测试9：ForBinding - 对象解构with默认值
for (const { x = 0, y = 0 } of [{x: 5}]) {
    console.log(x, y)
}

// ✅ 测试10：ForBinding - 数组解构跳过元素
for (const [, second] of [[1, 2], [3, 4]]) {
    console.log(second)
}

// ✅ 测试11：ForBinding - 数组解构rest元素
for (const [first, ...rest] of [[1, 2, 3], [4, 5, 6]]) {
    console.log(first, rest)
}

// ✅ 测试12：ForBinding - 字符串迭代
for (const char of 'hello') {
    console.log(char)
}

// ✅ 测试13：ForBinding - 数组迭代
for (let value of [10, 20, 30]) {
    console.log(value)
}

// ✅ 测试14：ForBinding - 对象属性遍历
for (const prop in {a: 1, b: 2, c: 3}) {
    console.log(prop)
}

// ✅ 测试15：ForBinding - 复杂混合解构
for (const [{ id }, value] of [[{id: 1}, 'a'], [{id: 2}, 'b']]) {
    console.log(id, value)
}

/* Es6Parser.ts: ForBinding
 * 规则：
 * ForBinding:
 *   BindingIdentifier
 *   BindingPattern
 */
