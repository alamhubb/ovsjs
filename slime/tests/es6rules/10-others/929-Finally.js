/**
 * 规则测试：Finally
 * 
 * 位置：Es6Parser.ts Line 1387
 * 分类：others
 * 编号：929
 * 
 * EBNF规则：
 *   Finally:
 *     finally Block
 * 
 * 测试目标：
 * - 测试基本finally块
 * - 测试try-finally（无catch）
 * - 测试try-catch-finally
 * - 测试finally中的资源清理
 * - 测试finally中的多条语句
 * - 测试finally中的控制流
 * - 测试嵌套finally
 * - 测试finally与return的交互
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本finally块
try {
    operation()
} finally {
    cleanup()
}

// ✅ 测试2：try-finally（无catch）
try {
    acquireResource()
} finally {
    releaseResource()
}

// ✅ 测试3：try-catch-finally
try {
    riskyOp()
} catch (e) {
    handleError(e)
} finally {
    cleanup()
}

// ✅ 测试4：finally中的资源清理
try {
    file = openFile()
    read(file)
} finally {
    if (file) {
        file.close()
    }
}

// ✅ 测试5：finally中的多条语句
try {
    process()
} finally {
    console.log('Cleaning up')
    const result = save()
    notify(result)
    closeConnections()
}

// ✅ 测试6：finally中的条件语句
try {
    transaction()
} finally {
    if (transactionOpen) {
        rollback()
    } else {
        commit()
    }
}

// ✅ 测试7：嵌套finally
try {
    try {
        inner()
    } finally {
        cleanInner()
    }
} finally {
    cleanOuter()
}

// ✅ 测试8：finally与return的交互
function withFinally() {
    try {
        if (condition) {
            return result1
        }
        return result2
    } finally {
        log('Function ending')
        cleanup()
    }
}

/* Es6Parser.ts: Finally */
