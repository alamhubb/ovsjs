/**
 * 规则测试：Literal
 * 
 * 位置：Es6Parser.ts Line 144
 * 规则结构：Literal -> this.Or -> [NullLiteral, TrueTok, FalseTok, NumericLiteral, StringLiteral]
 * 
 * 规则语法：
 *   Literal:
 *     this.Or([
 *       {alt: () => this.tokenConsumer.NullLiteral()},
 *       {alt: () => this.tokenConsumer.TrueTok()},
 *       {alt: () => this.tokenConsumer.FalseTok()},
 *       {alt: () => this.tokenConsumer.NumericLiteral()},
 *       {alt: () => this.tokenConsumer.StringLiteral()}
 *     ])
 * 
 * 测试覆盖：
 * - ✅ Or分支1：NullLiteral（测试1）
 * - ✅ Or分支2：TrueTok（测试2）
 * - ✅ Or分支3：FalseTok（测试3）
 * - ✅ Or分支4：NumericLiteral（测试4-6）
 * - ✅ Or分支5：StringLiteral（测试7-9）
 * - ✅ 综合场景（测试10）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：NullLiteral    Literal -> this.Or (分支1) -> this.tokenConsumer.NullLiteral()
const nullValue = null

// ✅ 测试2：TrueTok    Literal -> this.Or (分支2) -> this.tokenConsumer.TrueTok()
const trueValue = true

// ✅ 测试3：FalseTok    Literal -> this.Or (分支3) -> this.tokenConsumer.FalseTok()
const falseValue = false

// ✅ 测试4：NumericLiteral整数    Literal -> this.Or (分支4) -> this.tokenConsumer.NumericLiteral()
const integer = 42
const zero = 0
const negative = -100

// ✅ 测试5：NumericLiteral浮点数    Literal -> this.Or (分支4) -> this.tokenConsumer.NumericLiteral()
const float = 3.14
const scientific = 1.23e-4

// ✅ 测试6：NumericLiteral进制    Literal -> this.Or (分支4) -> this.tokenConsumer.NumericLiteral()
const binary = 0b1010
const octal = 0o755
const hex = 0xFF

// ✅ 测试7：StringLiteral单引号    Literal -> this.Or (分支5) -> this.tokenConsumer.StringLiteral()
const singleQuote = 'hello'

// ✅ 测试8：StringLiteral双引号    Literal -> this.Or (分支5) -> this.tokenConsumer.StringLiteral()
const doubleQuote = "world"

// ✅ 测试9：StringLiteral转义字符    Literal -> this.Or (分支5) -> this.tokenConsumer.StringLiteral()
const escaped = 'line1\nline2\ttab'

// ✅ 测试10：综合所有分支    Literal -> this.Or (所有5个分支)
const mixed = [null, true, false, 42, "text"]

/* 
 * 规则验证小结：
 * - Literal规则包含5个Or分支
 * - 所有分支都有对应的测试用例
 * - Or结构已完整覆盖
 */


// ============================================
// 合并来自: ArrayLiteral-001.js
// ============================================

/**
 * 规则测试：ArrayLiteral
 * 
 * 位置：Es6Parser.ts Line 285
 * 分类：literals
 * 编号：002
 * 
 * 规则语法：
 *   ArrayLiteral:
 *     [ ElementList? ]
 *     [ ElementList , ]
 * 
 * 测试目标：
 * - 验证空数组
 * - 验证各种元素类型
 * - 覆盖复杂数组
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空数组
const empty = []

// ✅ 测试2：单个元素
const single = [42]

// ✅ 测试3：多个元素
const multi = [1, 2, 3, 4, 5]

// ✅ 测试4：各种类型混合
const mixed = [1, 'string', true, null, undefined, {}, []]

// ✅ 测试5：嵌套数组
const nested = [[1, 2], [3, 4], [5, 6]]

// ✅ 测试6：数组中的对象
const arrayOfObjects = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
]

// ✅ 测试7：数组中的函数
const arrayOfFunctions = [
    () => 1,
    function() { return 2 },
    x => x * 3
]

// ✅ 测试8：数组中的表达式
const expressions = [1 + 2, 3 * 4, 5 - 1]

// ✅ 测试9：尾逗号数组
const trailing = [1, 2, 3,]

// ✅ 测试10：稀疏数组（元素缺失）
const sparse = [1, , , 4]

// ✅ 测试11：Spread运算符
const arr = [1, 2, 3]
const spread = [...arr, 4, 5]

// ✅ 测试12：多行数组
const multiline = [
    'a',
    'b',
    'c',
    'd',
    'e'
]

// ✅ 测试13：复杂嵌套
const complex = [
    [1, [2, [3, [4]]]],
    { key: 'value' },
    () => 'function'
]

// ✅ 测试14：数组中的Promise
const promises = [
    Promise.resolve(1),
    Promise.reject(2),
    new Promise(r => r(3))
]

// ✅ 测试15：实际应用
const data = [
    { id: 1, values: [10, 20, 30] },
    { id: 2, values: [40, 50, 60] },
    { id: 3, values: [70, 80, 90] }
]

/* Es6Parser.ts: ArrayLiteral: [ ElementList? ] */


// ============================================
// 合并来自: LiteralPropertyName-001.js
// ============================================

/**
 * 规则测试：LiteralPropertyName
 * 
 * 位置：Es6Parser.ts Line 267
 * 分类：literals
 * 编号：004
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 38个分支！
 * 
 * 规则语法：
 *   LiteralPropertyName:
 *     Identifier
 *     | StringLiteral
 *     | NumericLiteral
 *     | 所有保留字（35个）
 * 
 * 测试目标：
 * - 覆盖所有38个Or分支
 * - 测试所有保留字作为对象属性名
 * - 测试字面量作为属性名
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善（完整覆盖）
 */

// ✅ 测试1：Identifier、StringLiteral、NumericLiteral
const basic = {
    identifier: 1,
    'string': 2,
    "doubleQuote": 3,
    123: 4,
    0xFF: 5,
    3.14: 6
}

// ✅ 测试2：常用保留字 - class, function, return, const, let, var
const common = {
    class: 'Class',
    function: 'Function',
    return: 'Return',
    const: 'Const',
    let: 'Let',
    var: 'Var'
}

// ✅ 测试3：控制流关键字 - if, else, for, while, do
const controlFlow = {
    if: 'If',
    else: 'Else',
    for: 'For',
    while: 'While',
    do: 'Do'
}

// ✅ 测试4：控制流关键字 - switch, case, default, break, continue
const controlFlow2 = {
    switch: 'Switch',
    case: 'Case',
    default: 'Default',
    break: 'Break',
    continue: 'Continue'
}

// ✅ 测试5：异常处理 - try, catch, finally, throw
const exceptions = {
    try: 'Try',
    catch: 'Catch',
    finally: 'Finally',
    throw: 'Throw'
}

// ✅ 测试6：运算符关键字 - new, this, typeof, void, delete
const operators = {
    new: 'New',
    this: 'This',
    typeof: 'Typeof',
    void: 'Void',
    delete: 'Delete'
}

// ✅ 测试7：运算符关键字 - in, instanceof, with, debugger
const operators2 = {
    in: 'In',
    instanceof: 'Instanceof',
    with: 'With',
    debugger: 'Debugger'
}

// ✅ 测试8：模块关键字 - import, export, from, as, of
const modules = {
    import: 'Import',
    export: 'Export',
    from: 'From',
    as: 'As',
    of: 'Of'
}

// ✅ 测试9：类相关 - extends, static, super
const classKeywords = {
    extends: 'Extends',
    static: 'Static',
    super: 'Super'
}

// ✅ 测试10：异步/生成器 - yield, async, await
const asyncKeywords = {
    yield: 'Yield',
    async: 'Async',
    await: 'Await'
}

// ✅ 测试11：Getter/Setter - get, set
const accessors = {
    get: 'Get',
    set: 'Set'
}

// ✅ 测试12：字面量关键字 - null, true, false
const literals = {
    null: 'Null',
    true: 'True',
    false: 'False'
}

// ✅ 测试13：混合使用（所有类型）
const mixed = {
    // 普通
    name: 'test',
    123: 'number',
    'string': 'string',
    
    // 保留字
    class: 1,
    function: 2,
    if: 3,
    for: 4,
    try: 5,
    catch: 6,
    import: 7,
    export: 8,
    default: 9,
    extends: 10,
    async: 11,
    await: 12,
    get: 13,
    set: 14,
    null: 15,
    true: 16,
    false: 17
}

// ✅ 测试14：嵌套对象中的保留字
const nested = {
    catch: {
        then: {
            finally: 'deep'
        }
    }
}

// ✅ 测试15：对象方法中的保留字属性名
const methods = {
    then() {},
    catch() {},
    finally() {},
    default() {},
    constructor() {}
}
/* Es6Parser.ts: Identifier | StringLiteral | NumericLiteral | ReservedWord */


// ============================================
// 合并来自: NumericLiteral-001.js
// ============================================


/* Es6Parser.ts: DecimalLiteral | HexIntegerLiteral | OctalLiteral | BinaryLiteral | LegacyOctal */


// ============================================
// 合并来自: ObjectLiteral-001.js
// ============================================

/**
 * 规则测试：ObjectLiteral
 * 
 * 位置：Es6Parser.ts Line 297
 * 分类：literals
 * 编号：003
 * 
 * 规则语法：
 *   ObjectLiteral:
 *     { PropertyDefinitionList? }
 * 
 * 测试目标：
 * - 验证空对象
 * - 验证各种属性形式
 * - 覆盖复杂对象
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空对象
const empty = {}

// ✅ 测试2：简单属性
const simple = { x: 1, y: 2 }

// ✅ 测试3：各种值类型
const mixed = {
    number: 42,
    string: 'hello',
    boolean: true,
    null: null,
    undefined: undefined,
    array: [1, 2, 3],
    object: { nested: 'value' }
}

// ✅ 测试4：方法
const withMethods = {
    getValue: function() { return 42 },
    add: function(a, b) { return a + b }
}

// ✅ 测试5：Getter和Setter
const withGetterSetter = {
    get value() { return this._value },
    set value(v) { this._value = v }
}

// ✅ 测试6：计算属性名
const computed = {
    ['key' + 1]: 'value1',
    [2 + 3]: 'five'
}

// ✅ 测试7：简写属性
const name = 'Alice'
const age = 30
const shorthand = { name, age }

// ✅ 测试8：方法简写
const methods = {
    greet() { return 'hello' },
    farewell() { return 'goodbye' }
}

// ✅ 测试9：嵌套对象
const nested = {
    level1: {
        level2: {
            level3: 'deep'
        }
    }
}

// ✅ 测试10：Spread运算符
const source = { a: 1, b: 2 }
const spread = { ...source, c: 3 }

// ✅ 测试11：混合属性
const complex = {
    prop1: 'value',
    [dynamicKey]: 123,
    method() { return this.prop1 },
    get computed() { return this.prop1 }
}

// ✅ 测试12：Symbol属性
const sym = Symbol('test')
const withSymbol = { [sym]: 'value' }

// ✅ 测试13：Generator方法
const withGenerator = {
    *gen() {
        yield 1
        yield 2
    }
}

// ✅ 测试14：多行对象
const multiline = {
    prop1: 'value1',
    prop2: 'value2',
    prop3: 'value3',
    prop4: 'value4'
}

// ✅ 测试15：实际应用
const config = {
    server: {
        host: 'localhost',
        port: 3000,
        ssl: false
    },
    database: {
        url: 'mongodb://...',
        timeout: 5000
    }
}

/* Es6Parser.ts: ObjectLiteral: { PropertyDefinitionList? } */


// ============================================
// 合并来自: RegularExpressionLiteral-001.js
// ============================================


/* Es6Parser.ts: / RegularExpressionBody / RegularExpressionFlags */


// ============================================
// 合并来自: StringLiteral-001.js
// ============================================


/* Es6Parser.ts: DoubleStringCharacters | SingleStringCharacters */


// ============================================
// 合并来自: TemplateLiteral-001.js
// ============================================

/**
 * 规则测试：TemplateLiteral
 * 
 * 位置：Es6Parser.ts（模板字符串处理）
 * 分类：literals
 * 编号：005
 * 
 * 规则语法：
 *   TemplateLiteral:
 *     NoSubstitutionTemplate
 *     TemplateHead Expression* TemplateTail
 * 
 * 测试目标：
 * ✅ 覆盖所有模板字符串形式
 * ✅ 无插值模板（Option 0情况）
 * ✅ 单和多插值（Option 1+情况）
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：无插值模板字符串
const simple = `hello world`

// ✅ 测试2：单个插值
const single = `value: ${42}`

// ✅ 测试3：多个插值
const multiple = `a: ${1}, b: ${2}, c: ${3}`

// ✅ 测试4：模板字符串插值变量
const x = 10
const withVar = `value: ${x}`

// ✅ 测试5：模板字符串插值表达式
const expr = `result: ${1 + 2}`

// ✅ 测试6：模板字符串插值函数调用
const funcExpr = `result: ${Math.max(1, 2, 3)}`

// ✅ 测试7：模板字符串插值对象
const obj = { name: 'Alice', age: 30 }
const objInterp = `name: ${obj.name}, age: ${obj.age}`

// ✅ 测试8：模板字符串插值数组
const arr = [1, 2, 3]
const arrInterp = `items: ${arr.length}`

// ✅ 测试9：模板字符串插值嵌套模板
const nested = `outer: ${`inner: ${42}`}`

// ✅ 测试10：模板字符串插值三元表达式
const ternary = `result: ${true ? 'yes' : 'no'}`

// ✅ 测试11：模板字符串插值逻辑表达式
const logical = `check: ${x > 5 && x < 100}`

// ✅ 测试12：模板字符串多行
const multiline = `line 1
line 2
line 3`

// ✅ 测试13：模板字符串特殊字符
const special = `symbols: \n \t \r \$ \`` 

// ✅ 测试14：模板字符串插值循环
let result = ''
for (let i = 0; i < 3; i++) {
    result += `item: ${i}\n`
}

// ✅ 测试15：模板字符串作为函数参数
function process(template) {
    return template
}
const param = process(`template: ${42}`)

// ✅ 测试16：模板字符串插值空表达式
const empty = `empty: ${''}` 

// ✅ 测试17：模板字符串插值null/undefined
const nullish = `value: ${null}, ${undefined}`

// ✅ 测试18：模板字符串插值对象方法
const obj2 = {
    getValue: () => 42
}
const methodCall = `method result: ${obj2.getValue()}`

// ✅ 测试19：模板字符串在对象属性中
const config = {
    path: `./data/${1 + 1}/file.txt`,
    url: `https://example.com/api/${42}`
}

// ✅ 测试20：模板字符串插值箭头函数
const arrow = `result: ${((x) => x * 2)(21)}`

/* Es6Parser.ts: TemplateLiteral: NoSubstitutionTemplate | TemplateHead (Expression TemplateMiddle)* Expression TemplateTail */


// ============================================
// 合并来自: NumericLiteral-001.js
// ============================================


/* Es6Parser.ts: DecimalLiteral | HexIntegerLiteral | OctalLiteral | BinaryLiteral | LegacyOctal */


// ============================================
// 合并来自: StringLiteral-001.js
// ============================================


/* Es6Parser.ts: DoubleStringCharacters | SingleStringCharacters */


// ============================================
// 合并来自: RegularExpressionLiteral-001.js
// ============================================


/* Es6Parser.ts: / RegularExpressionBody / RegularExpressionFlags */
