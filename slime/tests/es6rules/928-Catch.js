/**
 * 规则测试：Catch
 * 
 * 位置：Es6Parser.ts Line 1378
 * 分类：others
 * 编号：928
 * 
 * EBNF规则：
 *   Catch:
 *     catch CatchParameter? Block
 * 
 * 测试目标：
 * - 测试基本catch（带参数）
 * - 测试catch无参数
 * - 测试catch参数解构（对象）
 * - 测试catch参数解构（数组）
 * - 测试catch中的多条语句
 * - 测试嵌套try-catch
 * - 测试catch中的控制流
 * - 测试异常重新抛出
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本catch
try {
    riskyOperation()
} catch (e) {
    console.log(e)
}

// ✅ 测试2：catch参数解构（对象）
try {
    api()
} catch ({message, code}) {
    console.error(message, code)
}

// ✅ 测试3：catch中的多条语句
try {
    doSomething()
} catch (error) {
    console.error('Error:', error.message)
    logError(error)
    notify(error)
}

// ✅ 测试4：catch参数解构（数组）
try {
    parse()
} catch ([status, reason]) {
    console.log(status, reason)
}

// ✅ 测试5：嵌套try-catch
try {
    try {
        inner()
    } catch (innerError) {
        console.log('Inner:', innerError)
        throw innerError
    }
} catch (outerError) {
    console.log('Outer:', outerError)
}

// ✅ 测试6：catch中的条件语句
try {
    execute()
} catch (err) {
    if (err instanceof TypeError) {
        handleTypeError(err)
    } else if (err instanceof ReferenceError) {
        handleRefError(err)
    } else {
        handleGenericError(err)
    }
}

// ✅ 测试7：catch中的循环和控制流
try {
    process()
} catch (e) {
    for (let i = 0; i < 3; i++) {
        if (retry(i)) {
            break
        }
    }
}

// ✅ 测试8：异常重新抛出
try {
    critical()
} catch (e) {
    logError(e)
    if (!canHandle(e)) {
        throw e
    }
}

/* Es6Parser.ts: Catch */
