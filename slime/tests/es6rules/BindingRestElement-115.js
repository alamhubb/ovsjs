/**
 * 规则测试：BindingRestElement
 * 
 * 位置：Es6Parser.ts Line 1108
 * 分类：identifiers
 * 编号：115
 * 
 * 规则特征：
 * - 包含Or规则：BindingIdentifier | BindingPattern
 * 
 * 规则语法：
 *   BindingRestElement:
 *     ... BindingIdentifier
 *     ... BindingPattern
 * 
 * 测试目标：
 * - 测试数组rest元素（...rest）
 * - 覆盖Or的两个分支
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：数组rest - BindingIdentifier
const [first, ...rest] = arr
const [a, b, ...others] = list

// ✅ 测试2：只有rest，没有前置元素
const [...all] = array
const [...items] = data

// ✅ 测试3：函数参数rest
function test(first, ...args) {
    return args
}

// ✅ 测试4：函数参数只有rest
function collect(...items) {
    return items
}

// ✅ 测试5：对象rest（ES2018 - 可能不支持）
const {name, ...otherProps} = obj

// ✅ 测试6：嵌套解构中的rest
const [first, ...[second, third]] = arr

// ✅ 测试7：rest配合默认值
function sum(initial = 0, ...nums) {
    return nums.reduce((a, b) => a + b, initial)
}

// ✅ 测试8：多个函数使用rest
const fn1 = (...args) => args.length
const fn2 = (a, b, ...rest) => rest
/* Es6Parser.ts: ... BindingIdentifier */
