/**
 * 规则测试：PrimaryExpression
 * 
 * 位置：Es6Parser.ts Line 451
 * 分类：expressions
 * 编号：201
 * 
 * 规则特征：
 * ✓ 包含Or规则（11处）- 所有基础表达式类型
 * 
 * 规则语法：
 *   PrimaryExpression:
 *     this | Identifier | Literal | ArrayLiteral | ObjectLiteral
 *     FunctionExpression | ClassExpression | GeneratorExpression
 *     RegularExpressionLiteral | TemplateLiteral | ParenthesizedExpression
 * 
 * 测试目标：
 * - 覆盖所有11个Or分支
 * - 验证各种基础表达式类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：this关键字
const obj = {
    value: 42,
    getValue: function() {
        return this.value
    }
}

// ✅ 测试2：标识符
const x = 10
console.log(x)

// ✅ 测试3：数字字面量
42

// ✅ 测试4：字符串字面量
'hello world'

// ✅ 测试5：布尔字面量
true
false

// ✅ 测试6：null字面量
null

// ✅ 测试7：数组字面量
[1, 2, 3, 4, 5]

// ✅ 测试8：对象字面量
{ x: 1, y: 2, z: 3 }

// ✅ 测试9：函数表达式
const add = function(a, b) {
    return a + b
}

// ✅ 测试10：类表达式
const MyClass = class {
    constructor(value) {
        this.value = value
    }
}

// ✅ 测试11：生成器表达式
const gen = function*() {
    yield 1
    yield 2
}

// ✅ 测试12：正则表达式
/[a-z]+/g

// ✅ 测试13：模板字符串
`Hello ${x}`

// ✅ 测试14：括号表达式
(1 + 2 * 3)

// ✅ 测试15：复杂组合
const complex = {
    arr: [1, 2, (3 + 4)],
    fn: function() { return this.arr },
    str: `value: ${(1 + 2)}`
}

/* Es6Parser.ts: PrimaryExpression: this|Identifier|Literal|ArrayLiteral|ObjectLiteral|FunctionExpression|ClassExpression|GeneratorExpression|RegularExpressionLiteral|TemplateLiteral|ParenthesizedExpression */

/**
 * 规则测试：PrimaryExpression
 * 
 * 位置：Es6Parser.ts Line 451
 * 分类：expressions
 * 编号：201
 * 
 * 规则特征：
 * ✓ 包含Or规则（11处）- 所有基础表达式类型
 * 
 * 规则语法：
 *   PrimaryExpression:
 *     this | Identifier | Literal | ArrayLiteral | ObjectLiteral
 *     FunctionExpression | ClassExpression | GeneratorExpression
 *     RegularExpressionLiteral | TemplateLiteral | ParenthesizedExpression
 * 
 * 测试目标：
 * - 覆盖所有11个Or分支
 * - 验证各种基础表达式类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：this关键字
const obj = {
    value: 42,
    getValue: function() {
        return this.value
    }
}

// ✅ 测试2：标识符
const x = 10
console.log(x)

// ✅ 测试3：数字字面量
42

// ✅ 测试4：字符串字面量
'hello world'

// ✅ 测试5：布尔字面量
true
false

// ✅ 测试6：null字面量
null

// ✅ 测试7：数组字面量
[1, 2, 3, 4, 5]

// ✅ 测试8：对象字面量
{ x: 1, y: 2, z: 3 }

// ✅ 测试9：函数表达式
const add = function(a, b) {
    return a + b
}

// ✅ 测试10：类表达式
const MyClass = class {
    constructor(value) {
        this.value = value
    }
}

// ✅ 测试11：生成器表达式
const gen = function*() {
    yield 1
    yield 2
}

// ✅ 测试12：正则表达式
/[a-z]+/g

// ✅ 测试13：模板字符串
`Hello ${x}`

// ✅ 测试14：括号表达式
(1 + 2 * 3)

// ✅ 测试15：复杂组合
const complex = {
    arr: [1, 2, (3 + 4)],
    fn: function() { return this.arr },
    str: `value: ${(1 + 2)}`
}

/* Es6Parser.ts: PrimaryExpression: this|Identifier|Literal|ArrayLiteral|ObjectLiteral|FunctionExpression|ClassExpression|GeneratorExpression|RegularExpressionLiteral|TemplateLiteral|ParenthesizedExpression */
