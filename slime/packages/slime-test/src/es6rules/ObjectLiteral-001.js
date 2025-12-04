/**
 * 测试规则: ObjectLiteral
 * 来源: 从 Literal 拆分
 */

/**
 * 规则测试：ObjectLiteral
 * 
 * 位置：Es2025Parser.ts Line 297
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

/* Es2025Parser.ts: ObjectLiteral: { PropertyDefinitionList? } */
