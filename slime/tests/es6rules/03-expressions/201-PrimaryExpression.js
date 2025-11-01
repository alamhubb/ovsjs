/**
 * 规则测试：PrimaryExpression
 * 
 * 位置：Es6Parser.ts Line 119
 * 分类：expressions
 * 编号：201
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 11个分支
 * 
 * 规则语法：
 *   PrimaryExpression:
 *     this
 *     IdentifierReference
 *     Literal
 *     ArrayLiteral
 *     ObjectLiteral
 *     FunctionExpression
 *     ClassExpression
 *     GeneratorExpression
 *     RegularExpressionLiteral
 *     TemplateLiteral
 *     ParenthesizedExpression
 * 
 * 测试目标：
 * - 覆盖所有11个Or分支
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：this
function test() {
    return this.value
}

// ✅ 测试2：IdentifierReference
const x = 1
const y = x

// ✅ 测试3：Literal - null
const n = null

// ✅ 测试4：Literal - boolean
const t = true
const f = false

// ✅ 测试5：Literal - number
const num = 42
const pi = 3.14

// ✅ 测试6：Literal - string
const str = "hello"

// ✅ 测试7：ArrayLiteral
const arr = [1, 2, 3]
const nested = [[1], [2]]

// ✅ 测试8：ObjectLiteral
const obj = {a: 1, b: 2}
const complex = {name: 'test', data: {value: 42}}

// ✅ 测试9：FunctionExpression
const func = function() { return 1 }
const named = function myFunc(x) { return x * 2 }

// ✅ 测试10：ClassExpression
const MyClass = class {
    constructor() {}
}
const NamedClass = class MyClass {
    method() {}
}

// ✅ 测试11：GeneratorExpression
const gen = function* () {
    yield 1
    yield 2
}

// ✅ 测试12：RegularExpressionLiteral
const regex = /abc/g
const pattern = /[0-9]+/i

// ✅ 测试13：TemplateLiteral
const template = `hello`
const withExpr = `value: ${x}`

// ✅ 测试14：ParenthesizedExpression
const grouped = (1 + 2) * 3
const precedence = (a || b) && c
