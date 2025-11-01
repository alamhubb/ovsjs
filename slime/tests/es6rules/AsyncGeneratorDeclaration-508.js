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
