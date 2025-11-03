/**
 * 测试规则: ForInOfStatement
 * 来源: 从 Statement 拆分
 */

/**
 * 规则测试：ForInOfStatement
 * 
 * 位置：Es6Parser.ts Line 1179
 * 分类：statements
 * 编号：410
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）- for-in vs for-of
 * 
 * 规则语法：
 *   ForInOfStatement:
 *     for ( LeftHandSideExpression in Expression ) Statement
 *     for ( LeftHandSideExpression of Expression ) Statement
 * 
 * 测试目标：
 * - 覆盖Or分支：for-in和for-of
 * - 验证各种迭代对象（对象、数组、Set、Map）
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - for-in 对象迭代
const obj = { a: 1, b: 2, c: 3 }
for (let key in obj) {
    console.log(key, obj[key])
}

// ✅ 测试2：Or分支1 - for-in 数组迭代
const arr = [10, 20, 30]
for (let index in arr) {
    console.log(index, arr[index])
}

// ✅ 测试3：Or分支2 - for-of 数组迭代
for (let value of arr) {
    console.log(value)
}

// ✅ 测试4：Or分支2 - for-of 字符串迭代
const str = 'hello'
for (let char of str) {
    console.log(char)
}

// ✅ 测试5：for-of Set迭代
const set = new Set([1, 2, 3])
for (let value of set) {
    console.log(value)
}

// ✅ 测试6：for-of Map迭代
const map = new Map([['a', 1], ['b', 2]])
for (let [key, value] of map) {
    console.log(key, value)
}

// ✅ 测试7：for-in 与break
for (let prop in obj) {
    if (prop === 'b') break
    console.log(prop)
}

// ✅ 测试8：for-of 与continue
for (let val of arr) {
    if (val === 20) continue
    console.log(val)
}

// ✅ 测试9：嵌套for-in
const nested = { outer: { inner: 'value' } }
for (let key1 in nested) {
    for (let key2 in nested[key1]) {
        console.log(key1, key2)
    }
}

// ✅ 测试10：嵌套for-of
const matrix = [[1, 2], [3, 4]]
for (let row of matrix) {
    for (let cell of row) {
        console.log(cell)
    }
}

// ✅ 测试11：for-in 对象属性迭代
const person = { name: 'Alice', age: 30 }
for (let prop in person) {
    console.log(`${prop}: ${person[prop]}`)
}

// ✅ 测试12：for-of 可迭代对象
const iterable = {
    [Symbol.iterator]: function() {
        let count = 0
        return {
            next: () => ({
                value: count++,
                done: count > 3
        })}
    }
}
for (let val of iterable) {
    console.log(val)
}

// ✅ 测试13：for-of 生成器
function* generator() {
    yield 1
    yield 2
    yield 3
}
for (let val of generator()) {
    console.log(val)
}

// ✅ 测试14：for-in 与复杂语句
for (let key in obj) {
    if (key.length > 1) {
        try {
            console.log(obj[key])
        } catch (e) {
        }
    }
}

// ✅ 测试15：for-of 与解构模式
const pairs = [[1, 'a'], [2, 'b'], [3, 'c']]
for (let [num, letter] of pairs) {
    console.log(`${num}: ${letter}`)
}

/* Es6Parser.ts: ForInOfStatement: for ( LeftHandSideExpression in|of Expression ) Statement */
