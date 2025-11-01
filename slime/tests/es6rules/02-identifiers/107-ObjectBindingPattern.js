/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es6Parser.ts Line 1015
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
const {first1, ...remaining,} = {first1: 1, second: 2, third: 3}
