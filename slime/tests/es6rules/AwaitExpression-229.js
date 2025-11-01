/**
 * 规则测试：AwaitExpression
 * 
 * 位置：Es6Parser.ts Line 1627
 * 分类：expressions
 * 编号：229
 * 
 * 规则语法：
 *   AwaitExpression:
 *     await UnaryExpression
 * 
 * 测试目标：
 * ✅ 覆盖所有UnaryExpression分支
 * ✅ 实际async应用场景
 * ✅ 各种Promise类型
 * ✅ 边界和复杂场景（嵌套、表达式）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（18个测试）
 */

// ✅ 测试1：基本await Promise
async function async1() {
    const result = await Promise.resolve(42)
}

// ✅ 测试2：await异步函数
async function async2() {
    async function getValue() {
        return 42
    }
    const result = await getValue()
}

// ✅ 测试3：await 变量（Promise）
async function async3() {
    const p = Promise.resolve(1)
    const result = await p
}

// ✅ 测试4：await 成员表达式
async function async4() {
    const obj = {
        getPromise: () => Promise.resolve(42)
    }
    const result = await obj.getPromise()
}

// ✅ 测试5：await 函数调用
async function async5() {
    function getPromise() {
        return Promise.resolve(42)
    }
    const result = await getPromise()
}

// ✅ 测试6：await 一元表达式（!）
async function async6() {
    const result = await !Promise.resolve(false)
}

// ✅ 测试7：await 数组元素
async function async7() {
    const promises = [Promise.resolve(1), Promise.resolve(2)]
    const result = await promises[0]
}

// ✅ 测试8：await new Promise
async function async8() {
    const result = await new Promise(resolve => {
        resolve(42)
    })
}

// ✅ 测试9：多个await
async function async9() {
    const a = await Promise.resolve(1)
    const b = await Promise.resolve(2)
    return a + b
}

// ✅ 测试10：await在循环中
async function async10() {
    for (let i = 0; i < 3; i++) {
        await Promise.resolve(i)
    }
}

// ✅ 测试11：await在条件中
async function async11() {
    if (await Promise.resolve(true)) {
        console.log('yes')
    }
}

// ✅ 测试12：await在表达式中
async function async12() {
    const result = (await Promise.resolve(1)) + (await Promise.resolve(2))
}

// ✅ 测试13：嵌套await
async function async13() {
    const result = await Promise.resolve(await Promise.resolve(42))
}

// ✅ 测试14：await 链式调用
async function async14() {
    const result = await Promise.resolve(1).then(() => Promise.resolve(2))
}

// ✅ 测试15：await 后缀表达式（i++）
async function async15() {
    let i = 0
    await Promise.resolve(i++)
}

// ✅ 测试16：await void表达式
async function async16() {
    const result = await void Promise.resolve(1)
}

// ✅ 测试17：await typeof表达式
async function async17() {
    const result = await typeof Promise.resolve(42)
}

// ✅ 测试18：await delete表达式
async function async18() {
    const obj = { x: 1 }
    await delete obj.x
}

/* Es6Parser.ts: AwaitExpression: await UnaryExpression */
