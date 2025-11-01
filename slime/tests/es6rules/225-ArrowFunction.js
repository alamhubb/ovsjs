/**
 * 规则测试：ArrowFunction
 * 
 * 位置：Es6Parser.ts Line 227
 * 分类：expressions
 * 编号：225
 * 
 * 规则语法：
 *   ArrowFunction:
 *     ArrowFormalParameters => ArrowFunctionBody
 * 
 * 测试目标：
 * - 覆盖各种箭头函数形式
 * - 验证参数和返回值
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无参数箭头函数
const fn1 = () => 42

// ✅ 测试2：单参数（无括号）
const double = x => x * 2

// ✅ 测试3：单参数（有括号）
const triple = (x) => x * 3

// ✅ 测试4：多参数
const add = (a, b) => a + b

// ✅ 测试5：对象返回
const makeObj = (x) => ({ value: x })

// ✅ 测试6：块体函数
const compute = (x) => {
    const result = x * 2
    return result
}

// ✅ 测试7：默认参数
const withDefault = (x = 10) => x * 2

// ✅ 测试8：Rest参数
const variadic = (...args) => args.length

// ✅ 测试9：解构参数
const destructured = ({ x, y }) => x + y

// ✅ 测试10：复杂参数组合
const complex = (a, b = 2, ...rest) => a + b + rest.length

// ✅ 测试11：嵌套箭头函数
const curry = (a) => (b) => (c) => a + b + c

// ✅ 测试12：数组方法中使用
[1, 2, 3].map(x => x * 2)

// ✅ 测试13：条件表达式
const conditionalArrow = (x) => x > 0 ? 'positive' : 'negative'

// ✅ 测试14：对象方法（不应该用this）
const obj = {
    items: [1, 2, 3],
    process: function() {
        return this.items.map(x => x * 2)
    }
}

// ✅ 测试15：Promise链式
const asyncChain = (promise) =>
    promise
        .then(data => ({ data }))
        .catch(error => ({ error }))

/* Es6Parser.ts: ArrowFunction: ArrowFormalParameters => ArrowFunctionBody */
