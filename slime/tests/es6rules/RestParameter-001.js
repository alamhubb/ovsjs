/**
 * 规则测试：RestParameter
 * 
 * 位置：Es2025Parser.ts Line 1465
 * 分类：others
 * 编号：931
 * 
 * EBNF规则：
 *   RestParameter:
 *     ... BindingIdentifier
 * 
 * 测试目标：
 * - 测试函数中的rest参数
 * - 测试箭头函数的rest参数
 * - 测试单个rest参数
 * - 测试与其他参数混合
 * - 测试默认参数后的rest
 * - 测试rest后访问arguments-like
 * - 测试解构后的rest
 * - 测试异步函数的rest参数
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：函数中的rest参数
function rest(...args) {
    return args.length
}

// ✅ 测试2：箭头函数的rest参数
const arrow = (...items) => items

// ✅ 测试3：混合参数和rest
function mixed(a, b, ...rest) {
    return [a, b, ...rest]
}

// ✅ 测试4：默认参数后的rest
function withDefaults(x = 1, y = 2, ...rest) {
    return rest
}

// ✅ 测试5：rest参数的使用
function sum(...numbers) {
    let total = 0
    for (let n of numbers) {
        total += n
    }
    return total
}

// ✅ 测试6：异步函数的rest参数
async function asyncRest(...promises) {
    return await Promise.all(promises)
}

// ✅ 测试7：generator函数的rest参数
function* genRest(...values) {
    for (let v of values) {
        yield v * 2
    }
}

// ✅ 测试8：复杂的rest使用
const complexArrow = (first, second = 0, ...rest) => {
    return {
        first,
        second,
        count: rest.length,
        items: rest
    }
}

/* Es2025Parser.ts: RestParameter */

/**
 * 规则测试：RestParameter
 * 
 * 位置：Es2025Parser.ts Line 1465
 * 分类：others
 * 编号：931
 * 
 * EBNF规则：
 *   RestParameter:
 *     ... BindingIdentifier
 * 
 * 测试目标：
 * - 测试函数中的rest参数
 * - 测试箭头函数的rest参数
 * - 测试单个rest参数
 * - 测试与其他参数混合
 * - 测试默认参数后的rest
 * - 测试rest后访问arguments-like
 * - 测试解构后的rest
 * - 测试异步函数的rest参数
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：函数中的rest参数
function rest(...args) {
    return args.length
}

// ✅ 测试2：箭头函数的rest参数
const arrow = (...items) => items

// ✅ 测试3：混合参数和rest
function mixed(a, b, ...rest) {
    return [a, b, ...rest]
}

// ✅ 测试4：默认参数后的rest
function withDefaults(x = 1, y = 2, ...rest) {
    return rest
}

// ✅ 测试5：rest参数的使用
function sum(...numbers) {
    let total = 0
    for (let n of numbers) {
        total += n
    }
    return total
}

// ✅ 测试6：异步函数的rest参数
async function asyncRest(...promises) {
    return await Promise.all(promises)
}

// ✅ 测试7：generator函数的rest参数
function* genRest(...values) {
    for (let v of values) {
        yield v * 2
    }
}

// ✅ 测试8：复杂的rest使用
const complexArrow = (first, second = 0, ...rest) => {
    return {
        first,
        second,
        count: rest.length,
        items: rest
    }
}

/* Es2025Parser.ts: RestParameter */
