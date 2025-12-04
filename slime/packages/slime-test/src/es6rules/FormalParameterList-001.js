/**
 * 规则测试：FormalParameterList
 * 
 * 位置：Es2025Parser.ts Line 1472
 * 分类：statements
 * 编号：422
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * ✓ 包含Many（1处）
 * ✓ 包含Option（1处）
 * 
 * 规则语法：
 *   FormalParameterList:
 *     RestParameter
 *     BindingElement ( , BindingElement )* ( , RestParameter )?
 * 
 * 测试目标：
 * - 测试0个参数
 * - 测试1个参数
 * - 测试多个参数
 * - 测试Rest参数
 * - 测试默认参数
 * - 测试解构参数
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无参数
function noParams() {
    return 'no params'
}

// ✅ 测试2：单个参数
function oneParam(a) {
    return a
}

// ✅ 测试3：多个参数
function multiParams(a, b, c) {
    return a + b + c
}

// ✅ 测试4：默认参数
function defaultParam(name = 'Guest') {
    return `Hello ${name}`
}

function multipleDefaults(a = 1, b = 2, c = 3) {
    return a + b + c
}

// ✅ 测试5：Rest参数 (单独)
function onlyRest(...args) {
    return args.length
}

// ✅ 测试6：普通参数 + Rest参数
function normalAndRest(first, second, ...rest) {
    return [first, second, rest]
}

// ✅ 测试7：解构参数 - 数组
function arrayDestructure([a, b]) {
    return a + b
}

// ✅ 测试8：解构参数 - 对象
function objectDestructure({name, age}) {
    return `${name} is ${age}`
}

// ✅ 测试9：复杂组合
function complex(a, b = 2, {x, y} = {}, ...rest) {
    return [a, b, x, y, rest]
}

// ✅ 测试10：箭头函数中的参数
const arrow1 = (a, b) => a + b
const arrow2 = (...args) => args.length
const arrow3 = ({name}) => name

/* Es2025Parser.ts: FormalParameterList */

/**
 * 规则测试：FormalParameterList
 * 
 * 位置：Es2025Parser.ts Line 1472
 * 分类：statements
 * 编号：422
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * ✓ 包含Many（1处）
 * ✓ 包含Option（1处）
 * 
 * 规则语法：
 *   FormalParameterList:
 *     RestParameter
 *     BindingElement ( , BindingElement )* ( , RestParameter )?
 * 
 * 测试目标：
 * - 测试0个参数
 * - 测试1个参数
 * - 测试多个参数
 * - 测试Rest参数
 * - 测试默认参数
 * - 测试解构参数
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无参数
function noParams() {
    return 'no params'
}

// ✅ 测试2：单个参数
function oneParam(a) {
    return a
}

// ✅ 测试3：多个参数
function multiParams(a, b, c) {
    return a + b + c
}

// ✅ 测试4：默认参数
function defaultParam(name = 'Guest') {
    return `Hello ${name}`
}

function multipleDefaults(a = 1, b = 2, c = 3) {
    return a + b + c
}

// ✅ 测试5：Rest参数 (单独)
function onlyRest(...args) {
    return args.length
}

// ✅ 测试6：普通参数 + Rest参数
function normalAndRest(first, second, ...rest) {
    return [first, second, rest]
}

// ✅ 测试7：解构参数 - 数组
function arrayDestructure([a, b]) {
    return a + b
}

// ✅ 测试8：解构参数 - 对象
function objectDestructure({name, age}) {
    return `${name} is ${age}`
}

// ✅ 测试9：复杂组合
function complex(a, b = 2, {x, y} = {}, ...rest) {
    return [a, b, x, y, rest]
}

// ✅ 测试10：箭头函数中的参数
const arrow1 = (a, b) => a + b
const arrow2 = (...args) => args.length
const arrow3 = ({name}) => name

/* Es2025Parser.ts: FormalParameterList */
