/**
 * 规则测试：PropertyName
 * 
 * 位置：Es6Parser.ts Line 259
 * 分类：others
 * 编号：906
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   PropertyName:
 *     LiteralPropertyName
 *     ComputedPropertyName
 * 
 * 测试目标：
 * - 覆盖Or的两个分支
 * - 测试所有属性名形式
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - LiteralPropertyName（标识符）
const obj1 = {
    name: 'test',
    value: 42
}

// ✅ 测试2：Or分支1 - LiteralPropertyName（字符串）
const obj2 = {
    'string-key': 1,
    'another key': 2
}

// ✅ 测试3：Or分支1 - LiteralPropertyName（数字）
const obj3 = {
    123: 'number',
    0: 'zero',
    3.14: 'pi'
}

// ✅ 测试4：Or分支1 - LiteralPropertyName（保留字）
const obj4 = {
    class: 'Class',
    function: 'Function',
    return: 'Return'
}

// ✅ 测试5：Or分支2 - ComputedPropertyName（变量）
const key = 'dynamic'
const obj5 = {
    [key]: 'value'
}

// ✅ 测试6：Or分支2 - ComputedPropertyName（表达式）
const obj6 = {
    [key + 'Suffix']: 'computed',
    ['prefix' + key]: 'concat'
}

// ✅ 测试7：Or分支2 - ComputedPropertyName（Symbol）
const sym = Symbol('test')
const obj7 = {
    [sym]: 'symbol property',
    [Symbol.iterator]: function* () {}
}

// ✅ 测试8：混合使用
const mixed = {
    // 标识符
    id: 1,
    // 字符串
    'str-key': 2,
    // 数字
    123: 3,
    // 保留字
    class: 4,
    // 计算属性
    [key]: 5,
    [key + 'X']: 6
}