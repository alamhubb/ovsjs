/**
 * 规则测试：CallExpression
 * 
 * 位置：Es6Parser.ts Line 541
 * 分类：expressions
 * 编号：208
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 *   - 初始Or：MemberExpression Arguments | SuperCall
 *   - Many内Or：Arguments | BracketExpression | DotMemberExpression | TemplateLiteral
 * ✓ 包含Many规则（4种链式调用方式）
 * 
 * 规则语法：
 *   CallExpression:
 *     MemberExpression Arguments
 *     SuperCall
 *     CallExpression Arguments
 *     CallExpression [ Expression ]
 *     CallExpression . IdentifierName
 *     CallExpression TemplateLiteral
 * 
 * 测试目标：
 * - 覆盖Or分支：普通函数调用 vs super调用
 * - 覆盖Many的4种链式方式：参数、方括号、点号、模板字符串
 * - 验证链式调用：func().then().catch()
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - MemberExpression Arguments（基础函数调用）
function foo(a, b) {
    return a + b
}
const result1 = foo(1, 2)

// ✅ 测试2：Or分支1 - 无参数调用
function bar() {
    return 42
}
const result2 = bar()

// ✅ 测试3：Or分支1 - 多个参数
const result3 = foo(1, 2, 3, 4, 5)

// ✅ 测试4：Or分支1 - 嵌套函数调用
function add(a, b) { return a + b }
const result4 = add(1, add(2, 3))

// ✅ 测试5：Many=1（第一次链式）- Arguments
const result5 = foo(1, 2)

// ✅ 测试6：Many=1 - DotMemberExpression（链式方法调用）
const str = 'hello'
const result6 = str.toUpperCase()

// ✅ 测试7：Many=1 - BracketExpression（方括号访问）
const obj = { method: function() { return 42 } }
const result7 = obj['method']()

// ✅ 测试8：Many=1 - TemplateLiteral（标签模板）
function tag(strings, ...values) {
    return strings[0]
}
const result8 = tag`hello`

// ✅ 测试9：Many=2 - 方法调用链
const arr = [1, 2, 3]
const result9 = arr.map(function(x) { return x * 2 }).filter(function(x) { return x > 2 })

// ✅ 测试10：Many=2 - 混合链式（点号 + 参数）
const result10 = str.toUpperCase().toLowerCase()

// ✅ 测试11：Many=3 - 三层链式调用
const result11 = foo(1).method().property

// ✅ 测试12：Many混合 - 参数 + 方括号 + 点号
const calc = { add: function(a, b) { return a + b } }
const result12 = calc['add'](1, 2)

// ✅ 测试13：Many混合 - 复杂链式
const promise = Promise.resolve(42)
const result13 = promise.then(function(v) { return v }).catch(function(e) { return e })

// ✅ 测试14：或分支2 - super 调用（在类中）
class Base {
    constructor(a) {
        this.a = a
    }
    method() {
        return this.a
    }
}

class Child extends Base {
    constructor(a, b) {
        super(a)
        this.b = b
    }
    method() {
        return super.method() + this.b
    }
}

// ✅ 测试15：链式调用在实际场景中
const users = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
]
const result15 = users
    .filter(function(u) { return u.age > 26 })
    .map(function(u) { return u.name })

/* Es6Parser.ts: CallExpression: Or[MemberExpression Arguments, SuperCall], Many: Arguments | BracketExpression | DotMemberExpression | TemplateLiteral */
