/**
 * 规则测试：GeneratorDeclaration
 * 
 * 位置：Es6Parser.ts Line 1584
 * 分类：functions
 * 编号：506
 * 
 * 规则特征：
 * - Generator函数：function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 规则语法：
 *   GeneratorDeclaration:
 *     function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 测试目标：
 * - 验证generator函数声明
 * - 验证yield表达式
 * - 覆盖各种generator模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本generator函数
function* gen() {
    yield 1
    yield 2
}

// ✅ 测试2：generator函数带参数
function* numbers(n) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}

// ✅ 测试3：generator函数返回值
function* withReturn() {
    yield 1
    yield 2
    return 'done'
}

// ✅ 测试4：generator函数中的if语句
function* conditional(x) {
    if (x > 0) {
        yield 'positive'
    } else {
        yield 'negative'
    }
}

// ✅ 测试5：generator函数中的循环
function* loop(n) {
    for (let i = 0; i < n; i++) {
        yield i * 2
    }
}

// ✅ 测试6：generator函数中的while循环
function* whileLoop() {
    let i = 0
    while (i < 5) {
        yield i
        i++
    }
}

// ✅ 测试7：嵌套generator调用
function* nested() {
    yield 1
    yield* numbers(3)
    yield 4
}

// ✅ 测试8：generator中的try-catch
function* withTry() {
    try {
        yield 1
    } catch (e) {
        yield 'error'
    }
}

// ✅ 测试9：多个yield
function* multiYield() {
    yield 'a'
    yield 'b'
    yield 'c'
    yield 'd'
    yield 'e'
}

// ✅ 测试10：yield表达式的值
function* yieldValue() {
    const x = yield 1
    const y = yield 2
    yield x + y
}

// ✅ 测试11：generator中的for-of
function* forOf(arr) {
    for (let item of arr) {
        yield item * 2
    }
}

// ✅ 测试12：generator中的递归调用
function* fibonacci(n) {
    if (n <= 1) {
        yield n
    } else {
        yield* fibonacci(n - 1)
        yield n
    }
}

// ✅ 测试13：generator中的对象返回
function* objectGen() {
    yield { x: 1 }
    yield { y: 2 }
}

// ✅ 测试14：generator中的数组返回
function* arrayGen() {
    yield [1, 2, 3]
    yield [4, 5, 6]
}

// ✅ 测试15：复杂generator场景
function* complexGen(max) {
    for (let i = 0; i < max; i++) {
        if (i % 2 === 0) {
            yield i
        } else {
            yield i * 2
        }
    }
}

/* Es6Parser.ts: GeneratorDeclaration: function* Identifier ( FormalParameters ) { GeneratorBody } */


// ============================================
// 合并来自: AsyncGeneratorDeclaration-001.js
// ============================================

/**
 * 规则测试：AsyncGeneratorDeclaration
 * 
 * 位置：Es6Parser.ts（async function*处理）
 * 分类：functions
 * 编号：508
 * 
 * 规则语法：
 *   AsyncGeneratorDeclaration:
 *     async function* Identifier ( FormalParameters ) { AsyncGeneratorBody }
 * 
 * 测试目标：
 * ✅ 覆盖async function*的各种形式
 * ✅ 参数和返回值类型
 * ✅ await和yield的结合
 * ✅ 实际异步生成器场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本async生成器
async function* asyncGen1() {
    yield 1
}

// ✅ 测试2：async生成器无参数
async function* asyncGen2() {
    yield await Promise.resolve(1)
}

// ✅ 测试3：async生成器单参数
async function* asyncGen3(x) {
    yield x
}

// ✅ 测试4：async生成器多参数
async function* asyncGen4(a, b, c) {
    yield a + b + c
}

// ✅ 测试5：async生成器默认参数
async function* asyncGen5(x = 10) {
    yield x
}

// ✅ 测试6：async生成器rest参数
async function* asyncGen6(...args) {
    for (const arg of args) {
        yield arg
    }
}

// ✅ 测试7：async生成器单个yield
async function* asyncGen7() {
    yield await Promise.resolve(42)
}

// ✅ 测试8：async生成器多个yield
async function* asyncGen8() {
    yield 1
    yield await Promise.resolve(2)
    yield 3
}

// ✅ 测试9：async生成器yield*委托
async function* asyncGen9() {
    yield* [1, 2, 3]
}

// ✅ 测试10：async生成器yield*到另一个async生成器
async function* inner() {
    yield await Promise.resolve(1)
}

async function* asyncGen10() {
    yield* inner()
}

// ✅ 测试11：async生成器for-of循环
async function* asyncGen11(data) {
    for (const item of data) {
        yield await Promise.resolve(item)
    }
}

// ✅ 测试12：async生成器while循环
async function* asyncGen12() {
    let i = 0
    while (i < 5) {
        yield await Promise.resolve(i)
        i++
    }
}

// ✅ 测试13：async生成器try-catch
async function* asyncGen13() {
    try {
        yield await Promise.resolve(1)
    } catch (e) {
        yield 'error'
    }
}

// ✅ 测试14：async生成器if条件
async function* asyncGen14(flag) {
    if (flag) {
        yield await Promise.resolve('yes')
    } else {
        yield 'no'
    }
}

// ✅ 测试15：async生成器嵌套await
async function* asyncGen15() {
    const result = await Promise.resolve(42)
    yield result
}

// ✅ 测试16：async生成器多个await和yield
async function* asyncGen16() {
    const a = await Promise.resolve(1)
    yield a
    const b = await Promise.resolve(2)
    yield b
}

// ✅ 测试17：async生成器返回Promise
async function* asyncGen17() {
    return await Promise.resolve(42)
}

// ✅ 测试18：async生成器复杂逻辑
async function* asyncGen18(urls) {
    for (const url of urls) {
        try {
            const data = await Promise.resolve(url)
            yield data
        } catch (e) {
            yield 'failed'
        }
    }
}

// ✅ 测试19：async生成器for-await-of
async function* asyncGen19() {
    const promises = [Promise.resolve(1), Promise.resolve(2)]
    for await (const p of promises) {
        yield p
    }
}

// ✅ 测试20：async生成器混合yield和yield*
async function* asyncGen20() {
    yield 0
    yield* [1, 2]
    yield await Promise.resolve(3)
}

/* Es6Parser.ts: AsyncGeneratorDeclaration: async function* Identifier ( FormalParameters ) { AsyncGeneratorBody } */

/**
 * 规则测试：GeneratorDeclaration
 * 
 * 位置：Es6Parser.ts Line 1584
 * 分类：functions
 * 编号：506
 * 
 * 规则特征：
 * - Generator函数：function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 规则语法：
 *   GeneratorDeclaration:
 *     function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 测试目标：
 * - 验证generator函数声明
 * - 验证yield表达式
 * - 覆盖各种generator模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本generator函数
function* gen() {
    yield 1
    yield 2
}

// ✅ 测试2：generator函数带参数
function* numbers(n) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}

// ✅ 测试3：generator函数返回值
function* withReturn() {
    yield 1
    yield 2
    return 'done'
}

// ✅ 测试4：generator函数中的if语句
function* conditional(x) {
    if (x > 0) {
        yield 'positive'
    } else {
        yield 'negative'
    }
}

// ✅ 测试5：generator函数中的循环
function* loop(n) {
    for (let i = 0; i < n; i++) {
        yield i * 2
    }
}

// ✅ 测试6：generator函数中的while循环
function* whileLoop() {
    let i = 0
    while (i < 5) {
        yield i
        i++
    }
}

// ✅ 测试7：嵌套generator调用
function* nested() {
    yield 1
    yield* numbers(3)
    yield 4
}

// ✅ 测试8：generator中的try-catch
function* withTry() {
    try {
        yield 1
    } catch (e) {
        yield 'error'
    }
}

// ✅ 测试9：多个yield
function* multiYield() {
    yield 'a'
    yield 'b'
    yield 'c'
    yield 'd'
    yield 'e'
}

// ✅ 测试10：yield表达式的值
function* yieldValue() {
    const x = yield 1
    const y = yield 2
    yield x + y
}

// ✅ 测试11：generator中的for-of
function* forOf(arr) {
    for (let item of arr) {
        yield item * 2
    }
}

// ✅ 测试12：generator中的递归调用
function* fibonacci(n) {
    if (n <= 1) {
        yield n
    } else {
        yield* fibonacci(n - 1)
        yield n
    }
}

// ✅ 测试13：generator中的对象返回
function* objectGen() {
    yield { x: 1 }
    yield { y: 2 }
}

// ✅ 测试14：generator中的数组返回
function* arrayGen() {
    yield [1, 2, 3]
    yield [4, 5, 6]
}

// ✅ 测试15：复杂generator场景
function* complexGen(max) {
    for (let i = 0; i < max; i++) {
        if (i % 2 === 0) {
            yield i
        } else {
            yield i * 2
        }
    }
}

/* Es6Parser.ts: GeneratorDeclaration: function* Identifier ( FormalParameters ) { GeneratorBody } */

// ============================================
// 合并来自: AsyncGeneratorDeclaration-001.js
// ============================================

/**
 * 规则测试：AsyncGeneratorDeclaration
 * 
 * 位置：Es6Parser.ts（async function*处理）
 * 分类：functions
 * 编号：508
 * 
 * 规则语法：
 *   AsyncGeneratorDeclaration:
 *     async function* Identifier ( FormalParameters ) { AsyncGeneratorBody }
 * 
 * 测试目标：
 * ✅ 覆盖async function*的各种形式
 * ✅ 参数和返回值类型
 * ✅ await和yield的结合
 * ✅ 实际异步生成器场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本async生成器
async function* asyncGen1() {
    yield 1
}

// ✅ 测试2：async生成器无参数
async function* asyncGen2() {
    yield await Promise.resolve(1)
}

// ✅ 测试3：async生成器单参数
async function* asyncGen3(x) {
    yield x
}

// ✅ 测试4：async生成器多参数
async function* asyncGen4(a, b, c) {
    yield a + b + c
}

// ✅ 测试5：async生成器默认参数
async function* asyncGen5(x = 10) {
    yield x
}

// ✅ 测试6：async生成器rest参数
async function* asyncGen6(...args) {
    for (const arg of args) {
        yield arg
    }
}

// ✅ 测试7：async生成器单个yield
async function* asyncGen7() {
    yield await Promise.resolve(42)
}

// ✅ 测试8：async生成器多个yield
async function* asyncGen8() {
    yield 1
    yield await Promise.resolve(2)
    yield 3
}

// ✅ 测试9：async生成器yield*委托
async function* asyncGen9() {
    yield* [1, 2, 3]
}

// ✅ 测试10：async生成器yield*到另一个async生成器
async function* inner() {
    yield await Promise.resolve(1)
}

async function* asyncGen10() {
    yield* inner()
}

// ✅ 测试11：async生成器for-of循环
async function* asyncGen11(data) {
    for (const item of data) {
        yield await Promise.resolve(item)
    }
}

// ✅ 测试12：async生成器while循环
async function* asyncGen12() {
    let i = 0
    while (i < 5) {
        yield await Promise.resolve(i)
        i++
    }
}

// ✅ 测试13：async生成器try-catch
async function* asyncGen13() {
    try {
        yield await Promise.resolve(1)
    } catch (e) {
        yield 'error'
    }
}

// ✅ 测试14：async生成器if条件
async function* asyncGen14(flag) {
    if (flag) {
        yield await Promise.resolve('yes')
    } else {
        yield 'no'
    }
}

// ✅ 测试15：async生成器嵌套await
async function* asyncGen15() {
    const result = await Promise.resolve(42)
    yield result
}

// ✅ 测试16：async生成器多个await和yield
async function* asyncGen16() {
    const a = await Promise.resolve(1)
    yield a
    const b = await Promise.resolve(2)
    yield b
}

// ✅ 测试17：async生成器返回Promise
async function* asyncGen17() {
    return await Promise.resolve(42)
}

// ✅ 测试18：async生成器复杂逻辑
async function* asyncGen18(urls) {
    for (const url of urls) {
        try {
            const data = await Promise.resolve(url)
            yield data
        } catch (e) {
            yield 'failed'
        }
    }
}

// ✅ 测试19：async生成器for-await-of
async function* asyncGen19() {
    const promises = [Promise.resolve(1), Promise.resolve(2)]
    for await (const p of promises) {
        yield p
    }
}

// ✅ 测试20：async生成器混合yield和yield*
async function* asyncGen20() {
    yield 0
    yield* [1, 2]
    yield await Promise.resolve(3)
}

/* Es6Parser.ts: AsyncGeneratorDeclaration: async function* Identifier ( FormalParameters ) { AsyncGeneratorBody } */
