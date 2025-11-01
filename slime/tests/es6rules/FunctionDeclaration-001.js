/**
 * 测试规则: FunctionDeclaration
 * 来源: 从 Declaration 拆分
 */

// TODO: 添加 FunctionDeclaration 的完整测试用例
// 当前从 Declaration 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});


/* Es6Parser.ts: function Identifier (FormalParameters) { FunctionBody } */

/**
 * 规则测试：FunctionDeclaration
 * 
 * 位置：Es6Parser.ts Line 210
 * 分类：functions
 * 编号：501
 * 
 * 规则特征：
 * - 函数声明：function Identifier ( FormalParameters ) { FunctionBody }
 * - 必须有函数名
 * 
 * 规则语法：
 *   FunctionDeclaration:
 *     function Identifier ( FormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 验证基本函数声明
 * - 验证各种参数形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本函数声明
function greet() {
    console.log('hello')
}

// ✅ 测试2：带参数的函数
function add(a, b) {
    return a + b
}

// ✅ 测试3：多个参数
function multiply(x, y, z) {
    return x * y * z
}

// ✅ 测试4：默认参数
function withDefault(x = 10, y = 20) {
    return x + y
}

// ✅ 测试5：Rest参数
function variadic(...args) {
    return args.length
}

// ✅ 测试6：解构参数
function destructured({ x, y }) {
    return x + y
}

// ✅ 测试7：混合参数形式
function mixed(a, b = 2, ...rest) {
    return a + b + rest.length
}

// ✅ 测试8：无返回值函数
function printOnly(msg) {
    console.log(msg)
}

// ✅ 测试9：有返回值函数
function getValue() {
    return 42
}

// ✅ 测试10：递归函数
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1)
}

// ✅ 测试11：嵌套函数声明
function outer() {
    function inner() {
        return 'inner'
    }
    return inner()
}

// ✅ 测试12：函数体中的块语句
function withBlock() {
    {
        const x = 1
        console.log(x)
    }
    {
        const y = 2
        console.log(y)
    }
}

// ✅ 测试13：函数体中的if-else
function conditional(x) {
    if (x > 0) {
        return 'positive'
    } else if (x < 0) {
        return 'negative'
    } else {
        return 'zero'
    }
}

// ✅ 测试14：函数体中的for循环
function sumTo(n) {
    let sum = 0
    for (let i = 1; i <= n; i++) {
        sum += i
    }
    return sum
}

// ✅ 测试15：复杂函数场景
function processArray(items, filter = true) {
    let result = []
    
    for (let item of items) {
        if (filter && item > 0) {
            result.push(item * 2)
        } else if (!filter) {
            result.push(item)
        }
    }
    
    return result.length > 0 ? result : null
}

/* Es6Parser.ts: FunctionDeclaration: function Identifier ( FormalParameters ) { FunctionBody } */

// ============================================
// 合并来自: AsyncFunctionDeclaration-001.js
// ============================================


/* Es6Parser.ts: async function Identifier (FormalParameters) { FunctionBody } */

/**
 * 规则测试：AsyncFunctionDeclaration
 * 
 * 位置：Es6Parser.ts（async关键字处理）
 * 分类：functions
 * 编号：507
 * 
 * 规则语法：
 *   AsyncFunctionDeclaration:
 *     async function Identifier ( FormalParameters ) { AsyncFunctionBody }
 * 
 * 测试目标：
 * ✅ 覆盖async函数各种形式
 * ✅ 参数和返回值类型
 * ✅ 实际async应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本async函数
async function basic() {
    return 42
}

// ✅ 测试2：async函数无参数
async function noParams() {
    await Promise.resolve()
}

// ✅ 测试3：async函数单参数
async function single(x) {
    return await Promise.resolve(x)
}

// ✅ 测试4：async函数多参数
async function multiple(a, b, c) {
    return a + b + c
}

// ✅ 测试5：async函数默认参数
async function withDefault(x = 10) {
    return await Promise.resolve(x)
}

// ✅ 测试6：async函数Rest参数
async function withRest(...args) {
    return args.length
}

// ✅ 测试7：async函数解构参数
async function withDestructured({ x, y }) {
    return x + y
}

// ✅ 测试8：async函数包含await
async function withAwait() {
    const result = await Promise.resolve(42)
    return result
}

// ✅ 测试9：async函数多个await
async function multipleAwaits() {
    const a = await Promise.resolve(1)
    const b = await Promise.resolve(2)
    return a + b
}

// ✅ 测试10：async函数try-catch
async function withTryCatch() {
    try {
        return await Promise.resolve(42)
    } catch (e) {
        return null
    }
}

// ✅ 测试11：async函数for循环
async function withLoop() {
    for (let i = 0; i < 3; i++) {
        await Promise.resolve(i)
    }
}

// ✅ 测试12：async函数if条件
async function withCondition(flag) {
    if (flag) {
        return await Promise.resolve('yes')
    } else {
        return await Promise.resolve('no')
    }
}

// ✅ 测试13：async函数返回Promise
async function returnsPromise() {
    return Promise.resolve(42)
}

// ✅ 测试14：async函数调用其他async
async function callsOtherAsync() {
    return await basic()
}

// ✅ 测试15：嵌套async函数
async function outerAsync() {
    async function innerAsync() {
        return 42
    }
    return await innerAsync()
}

// ✅ 测试16：async函数混合参数
async function mixedParams(a, b = 2, ...rest) {
    return a + b + rest.length
}

// ✅ 测试17：async函数返回值类型多样
async function diverseReturn(type) {
    if (type === 'obj') return { x: 1 }
    if (type === 'arr') return [1, 2, 3]
    if (type === 'fn') return () => 42
    return null
}

// ✅ 测试18：async函数没有await
async function noAwait() {
    return 42
}

// ✅ 测试19：async函数复杂逻辑
async function complex(data) {
    try {
        const result = await Promise.resolve(data)
        for (let item of result) {
            await Promise.resolve(item)
        }
        return result
    } catch (e) {
        return null
    }
}

// ✅ 测试20：async函数可选链操作
async function withOptional() {
    const obj = { method: async () => 42 }
    return await obj?.method?.()
}

/* Es6Parser.ts: AsyncFunctionDeclaration: async function Identifier ( FormalParameters ) { AsyncFunctionBody } */
