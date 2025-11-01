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
