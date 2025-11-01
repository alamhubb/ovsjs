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
