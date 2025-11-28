/**
 * 测试规则: ObjectBindingPattern
 * 来源: 从 BindingPattern 拆分
 */

/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es2025Parser.ts Line 1015
 * 分类：identifiers
 * 编号：107
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 4个分支
 * 
 * 规则语法：
 *   ObjectBindingPattern:
 *     { }
 *     { BindingPropertyList , BindingRestElement }  (ES2018, 长规则)
 *     { BindingPropertyList , }
 *     { BindingPropertyList }
 * 
 * 测试目标：
 * - 测试空对象解构
 * - 测试基础属性解构
 * - 测试属性重命名
 * - 测试默认值
 * - 测试Rest元素（ES2018）
 * - 测试嵌套解构
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空对象解构
const {} = {}

// ✅ 测试2：基础属性解构
const {name, age} = {name: 'Alice', age: 25}
const {x, y, z} = {x: 1, y: 2, z: 3}

// ✅ 测试3：单个属性
const {value} = {value: 42}

// ✅ 测试4：属性重命名
const {name: userName} = {name: 'Bob'}
const {x: a, y: b} = {x: 10, y: 20}

// ✅ 测试5：默认值
const {prop = 'default'} = {}
const {x1 = 0, y1 = 0} = {x1: 5}

// ✅ 测试6：重命名 + 默认值
const {name: userName2 = 'Guest'} = {}
const {value: val = 100} = {value: 200}

// ✅ 测试7：Rest元素（ES2018）
const {a1, ...rest} = {a1: 1, b: 2, c: 3}
const {x2, y2, ...others} = {x2: 1, y2: 2, z: 3, w: 4}

// ✅ 测试8：嵌套对象解构
const {user: {name: n, age: a2}} = {user: {name: 'Eve', age: 22}}
const {data: {items: [first]}} = {data: {items: [1, 2, 3]}}

// ✅ 测试9：带尾逗号
const {p1, p2,} = {p1: 1, p2: 2}

// ✅ 测试10：函数参数中的对象解构
function greet({name, age}) {
    return `${name} is ${age}`
}

const extract = ({id, data: {value}}) => value
const withDefaults = ({x = 0, y = 0} = {}) => x + y

// ✅ 测试11：Rest + 带尾逗号
const {first1, ...remaining} = {first1: 1, second: 2, third: 3}

/* Es2025Parser.ts: { BindingPropertyList? TrailingComma? } */

/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es2025Parser.ts（对象解构处理）
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

/* Es2025Parser.ts: ObjectBindingPattern: { BindingPropertyList? } */
