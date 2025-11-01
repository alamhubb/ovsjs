/**
 * 测试规则: ReturnStatement
 * 来源: 从 Statement 拆分
 */

// TODO: 添加 ReturnStatement 的完整测试用例
// 当前从 Statement 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});


/* Es6Parser.ts: return Expression? */

/**
 * 规则测试：ReturnStatement
 * 
 * 位置：Es6Parser.ts Line 1244
 * 分类：statements
 * 编号：402
 * 
 * 规则语法：
 *   ReturnStatement:
 *     return Expression? ;
 * 
 * 测试目标：
 * - 验证无返回值的return
 * - 验证有返回值的return
 * - 覆盖各种返回值类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无返回值
function test1() {
    return
}

// ✅ 测试2：返回字面量
function test2() {
    return 42
}

// ✅ 测试3：返回字符串
function test3() {
    return 'hello'
}

// ✅ 测试4：返回布尔值
function test4() {
    return true
}

// ✅ 测试5：返回变量
function test5() {
    const x = 10
    return x
}

// ✅ 测试6：返回表达式
function test6() {
    return 1 + 2 * 3
}

// ✅ 测试7：返回对象
function test7() {
    return { x: 1, y: 2 }
}

// ✅ 测试8：返回数组
function test8() {
    return [1, 2, 3]
}

// ✅ 测试9：返回函数调用结果
function test9() {
    return Math.max(1, 2, 3)
}

// ✅ 测试10：返回箭头函数
function test10() {
    return (x) => x * 2
}

// ✅ 测试11：条件返回
function test11(x) {
    if (x > 0) {
        return 'positive'
    } else {
        return 'negative'
    }
}

// ✅ 测试12：循环中的return
function test12() {
    for (let i = 0; i < 10; i++) {
        if (i === 5) return i
    }
}

// ✅ 测试13：return await表达式
async function test13() {
    return await Promise.resolve(42)
}

// ✅ 测试14：返回null/undefined
function test14() {
    return null
}

// ✅ 测试15：多个return分支
function test15(x) {
    if (x < 0) return 'negative'
    if (x === 0) return 'zero'
    if (x > 0) return 'positive'
}

/* Es6Parser.ts: ReturnStatement: return Expression? ; */

/**
 * 规则测试：ReturnStatement
 * 
 * 位置：Es6Parser.ts Line 1281
 * 分类：statements
 * 编号：414
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- Expression可选
 * 
 * 规则语法：
 *   ReturnStatement:
 *     return Expression? ;?
 * 
 * 测试目标：
 * - 测试Option无（无返回值）
 * - 测试Option有（有返回值）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 无返回值
function none() {
    return
}

// ✅ 测试2：Option无 - void函数
function log(msg) {
    console.log(msg)
    return
}

// ✅ 测试3：Option有 - 返回基础值
function get() {
    return 42
}

// ✅ 测试4：Option有 - 返回表达式
function sum(a, b) {
    return a + b
}

// ✅ 测试5：返回对象
function createUser(name) {
    return {name, age: 0}
}

// ✅ 测试6：返回数组
function range(n) {
    return [1, 2, 3, n]
}

// ✅ 测试7：返回函数
function makeAdder(x) {
    return function(y) {
        return x + y
    }
}

// ✅ 测试8：条件返回
function abs(n) {
    if (n < 0) return -n
    return n
}

function test() { return 42 }
function none() { return }
function complex() { return {a: 1, b: 2} }

/* Es6Parser.ts: ReturnStatement */
