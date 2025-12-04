/**
 * 规则测试：NewExpression
 * 
 * 位置：Es2025Parser.ts Line 417
 * 分类：expressions
 * 编号：207
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   NewExpression:
 *     MemberExpression
 *     new NewExpression
 * 
 * 测试目标：
 * - 覆盖Or分支1：MemberExpression（无new）
 * - 覆盖Or分支2：new NewExpression（递归new）
 * - 验证new操作符的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - MemberExpression（无new）
const obj = { method: function() { return 42 } }
const result1 = obj.method()

// ✅ 测试2：Or分支1 - 简单成员访问
const x = 42
const value1 = x

// ✅ 测试3：Or分支2 - new 构造函数
function MyConstructor(a, b) {
    this.a = a
    this.b = b
}
const instance1 = new MyConstructor(1, 2)

// ✅ 测试4：Or分支2 - new 内置对象
const date = new Date()

// ✅ 测试5：Or分支2 - new Array
const arr1 = new Array(5)

// ✅ 测试6：Or分支2 - new Object
const obj2 = new Object()

// ✅ 测试7：Or分支2 - new 无参数
class Point {
    constructor() {
        this.x = 0
        this.y = 0
    }
}
const p1 = new Point()

// ✅ 测试8：Or分支2 - new 多参数
const map = new Map([['key1', 'value1'], ['key2', 'value2']])

// ✅ 测试9：递归new - new new 表达式
function Factory() {
    return function() {}
}
const result2 = new new Factory()()

// ✅ 测试10：new 与成员访问组合
const constructor = { create: function() {} }
const instance2 = new constructor.create()

// ✅ 测试11：new 在复杂表达式中
const arr2 = [new Date(), new Error('test')]

// ✅ 测试12：new 作为函数参数
function process(obj) { return obj }
const result3 = process(new Object())

// ✅ 测试13：new Error异常
try {
    throw new Error('Something went wrong')
} catch (e) {}

// ✅ 测试14：new Map/Set集合
const set1 = new Set([1, 2, 3])

// ✅ 测试15：new 自定义类
class User {
    constructor(name) {
        this.name = name
    }
}
const user = new User('Alice')

/* Es2025Parser.ts: NewExpression: Or[MemberExpression, new NewExpression] */

/**
 * 规则测试：NewExpression
 * 
 * 位置：Es2025Parser.ts Line 417
 * 分类：expressions
 * 编号：207
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   NewExpression:
 *     MemberExpression
 *     new NewExpression
 * 
 * 测试目标：
 * - 覆盖Or分支1：MemberExpression（无new）
 * - 覆盖Or分支2：new NewExpression（递归new）
 * - 验证new操作符的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - MemberExpression（无new）
const obj = { method: function() { return 42 } }
const result1 = obj.method()

// ✅ 测试2：Or分支1 - 简单成员访问
const x = 42
const value1 = x

// ✅ 测试3：Or分支2 - new 构造函数
function MyConstructor(a, b) {
    this.a = a
    this.b = b
}
const instance1 = new MyConstructor(1, 2)

// ✅ 测试4：Or分支2 - new 内置对象
const date = new Date()

// ✅ 测试5：Or分支2 - new Array
const arr1 = new Array(5)

// ✅ 测试6：Or分支2 - new Object
const obj2 = new Object()

// ✅ 测试7：Or分支2 - new 无参数
class Point {
    constructor() {
        this.x = 0
        this.y = 0
    }
}
const p1 = new Point()

// ✅ 测试8：Or分支2 - new 多参数
const map = new Map([['key1', 'value1'], ['key2', 'value2']])

// ✅ 测试9：递归new - new new 表达式
function Factory() {
    return function() {}
}
const result2 = new new Factory()()

// ✅ 测试10：new 与成员访问组合
const constructor = { create: function() {} }
const instance2 = new constructor.create()

// ✅ 测试11：new 在复杂表达式中
const arr2 = [new Date(), new Error('test')]

// ✅ 测试12：new 作为函数参数
function process(obj) { return obj }
const result3 = process(new Object())

// ✅ 测试13：new Error异常
try {
    throw new Error('Something went wrong')
} catch (e) {}

// ✅ 测试14：new Map/Set集合
const set1 = new Set([1, 2, 3])

// ✅ 测试15：new 自定义类
class User {
    constructor(name) {
        this.name = name
    }
}
const user = new User('Alice')

/* Es2025Parser.ts: NewExpression: Or[MemberExpression, new NewExpression] */
