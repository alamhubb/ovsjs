/**
 * 规则测试：ObjectLiteral
 * 
 * 位置：Es6Parser.ts Line 209
 * 分类：literals
 * 编号：003
 * 
 * 规则特征：
 * ✓ 包含Option（2处）
 * 
 * 规则语法：
 *   ObjectLiteral:
 *     { PropertyDefinitionList? , ? }
 * 
 * 测试目标：
 * - 测试空对象
 * - 测试基础属性
 * - 测试方法
 * - 测试Getter/Setter
 * - 测试计算属性名
 * - 测试Spread
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空对象
const empty = {}

// ✅ 测试2：单个属性
const single = {name: 'Alice'}

// ✅ 测试3：多个属性
const multiple = {
    name: 'Bob',
    age: 25,
    city: 'NYC'
}

// ✅ 测试4：属性简写
const name = 'Charlie'
const age = 30
const shorthand = {name, age}

// ✅ 测试5：带尾逗号
const trailing = {
    a: 1,
    b: 2,
}

// ✅ 测试6：方法定义
const methods = {
    greet() {
        return 'Hello'
    },
    add(a, b) {
        return a + b
    }
}

// ✅ 测试7：Getter/Setter
const accessors = {
    _value: 0,
    get value() {
        return this._value
    },
    set value(v) {
        this._value = v
    }
}

// ✅ 测试8：计算属性名
const key = 'dynamicKey'
const computed = {
    [key]: 'value',
    ['prefix_' + key]: 'prefixed'
}

// ✅ 测试9：Spread (ES2018)
const obj1 = {a: 1}
const obj2 = {...obj1, b: 2}
const obj3 = {x: 0, ...obj1, ...obj2, y: 3}

// ✅ 测试10：嵌套对象
const nested = {
    user: {
        name: 'Dave',
        profile: {
            age: 28,
            city: 'LA'
        }
    }
}

// ✅ 测试11：混合所有特性
const symbol = Symbol('test')
const complex = {
    // 普通属性
    simple: 'value',
    // 简写
    name,
    // 方法
    method() { return 42 },
    // Getter
    get prop() { return this._prop },
    // 计算属性
    [symbol]: 'symbol value',
    // Spread
    ...obj1
}
