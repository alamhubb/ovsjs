/**
 * 规则测试：ComputedPropertyName
 * 
 * 位置：Es6Parser.ts Line 320
 * 分类：others
 * 编号：907
 * 
 * 规则特征：
 * - 简单规则：[ AssignmentExpression ]
 * 
 * 规则语法：
 *   ComputedPropertyName:
 *     [ AssignmentExpression ]
 * 
 * 测试目标：
 * - 测试计算属性名
 * - 测试各种表达式作为属性名
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：变量作为属性名
const key = 'dynamic'
const obj1 = {
    [key]: 'value'
}

// ✅ 测试2：字符串拼接表达式
const obj2 = {
    [key + 'Suffix']: 'computed',
    ['prefix' + key]: 'concat'
}

// ✅ 测试3：数字表达式
const obj3 = {
    [1 + 2]: 'three',
    [10 * 2]: 'twenty'
}

// ✅ 测试4：Symbol
const sym = Symbol('test')
const obj4 = {
    [sym]: 'symbol property',
    [Symbol.iterator]: function* () {}
}

// ✅ 测试5：函数调用结果
const obj5 = {
    [getKey()]: 'function result',
    [computeKey('prefix')]: 'computed'
}

// ✅ 测试6：条件表达式
const obj6 = {
    [condition ? 'key1' : 'key2']: 'conditional',
    [x > 0 ? 'positive' : 'negative']: 'sign'
}

// ✅ 测试7：在类中
class Test {
    [methodName]() {
        return 'dynamic method'
    }
    [fieldName] = 'dynamic field'
}

// ✅ 测试8：混合使用
const mixed = {
    // 普通属性
    name: 'test',
    // 计算属性
    [key]: 'value',
    [key + '2']: 'value2',
    [Symbol.key]: 'symbol'
}