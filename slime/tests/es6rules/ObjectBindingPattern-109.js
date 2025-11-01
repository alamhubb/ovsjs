/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es6Parser.ts（对象解构处理）
 * 分类：identifiers
 * 编号：109
 * 
 * 规则语法：
 *   ObjectBindingPattern:
 *     { BindingPropertyList? }
 * 
 * 测试目标：
 * ✅ 覆盖所有对象解构形式
 * ✅ 空解构、单属性、多属性（Option/Many）
 * ✅ 属性重命名、嵌套、默认值
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本对象解构
const { x, y } = { x: 1, y: 2 }

// ✅ 测试2：空对象解构
const { } = {}

// ✅ 测试3：单属性解构
const { name } = { name: 'Alice' }

// ✅ 测试4：多属性解构
const { a, b, c } = { a: 1, b: 2, c: 3 }

// ✅ 测试5：属性重命名
const { x: xVal, y: yVal } = { x: 10, y: 20 }

// ✅ 测试6：部分解构
const { name: fullName } = { name: 'Bob', age: 30 }

// ✅ 测试7：默认值
const { count = 0 } = { }

// ✅ 测试8：混合重命名和默认值
const { x: a = 5, y: b = 10 } = { }

// ✅ 测试9：嵌套对象解构
const { user: { name, age } } = { user: { name: 'Charlie', age: 25 } }

// ✅ 测试10：深层嵌套解构
const { a: { b: { c } } } = { a: { b: { c: 'deep' } } }

// ✅ 测试11：混合嵌套和默认值
const { user: { name = 'Guest' } } = { }

// ✅ 测试12：rest属性
const { x, ...rest } = { x: 1, y: 2, z: 3 }

// ✅ 测试13：函数参数解构
function processObj({ x, y }) {
    return x + y
}

// ✅ 测试14：函数参数解构带默认值
function withDefaults({ x = 0, y = 0 } = {}) {
    return x + y
}

// ✅ 测试15：箭头函数参数解构
const arrow = ({ a, b }) => a + b

// ✅ 测试16：复杂嵌套解构
const { 
    user: { 
        profile: { 
            name, 
            contact: { email } 
        } 
    } 
} = { 
    user: { 
        profile: { 
            name: 'Dave', 
            contact: { email: 'dave@example.com' } 
        } 
    } 
}

// ✅ 测试17：in语句中的解构
for (let { id, value } of [{ id: 1, value: 'a' }, { id: 2, value: 'b' }]) {
    console.log(id, value)
}

// ✅ 测试18：数组中包含对象解构
const data = { 
    items: [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' }
    ]
}
const { items: [{ id: firstId }] } = data

// ✅ 测试19：catch子句中的解构
try {
    throw { code: 'ERR_001', message: 'Error' }
} catch ({ code, message }) {
    console.log(code, message)
}

// ✅ 测试20：复杂场景混合所有特性
function complex({ 
    user: { name = 'Guest', profile: { age = 0 } = {} } = {},
    options: { ...opts } = {}
}) {
    return { name, age, opts }
}

/* Es6Parser.ts: ObjectBindingPattern: { BindingPropertyList? } */
