/**
 * 测试规则: CatchParameter
 * 来源: 从 Catch 拆分
 *//**
 * 规则测试：CatchParameter
 * 
 * 位置：Es6Parser.ts Line 1393
 * 分类：others
 * 编号：930
 * 
 * EBNF规则：
 *   CatchParameter:
 *     BindingIdentifier
 *     BindingPattern
 * 
 * 测试目标：
 * - 测试简单标识符参数
 * - 测试对象解构参数
 * - 测试数组解构参数
 * - 测试嵌套解构参数
 * - 测试参数的重命名
 * - 测试带默认值的参数
 * - 测试多个catch的不同参数
 * - 测试复杂解构
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单参数
try {} catch (e) {
    console.log(e)
}

// ✅ 测试2：对象解构参数
try {} catch ({message, code}) {
    console.error(message, code)
}

// ✅ 测试3：数组解构参数
try {} catch ([status, reason]) {
    console.log(status, reason)
}

// ✅ 测试4：嵌套对象解构
try {
    api()
} catch ({error: {message}}) {
    log(message)
}

// ✅ 测试5：参数重命名
try {
    call()
} catch ({status: code, msg: message}) {
    handle(code, message)
}

// ✅ 测试6：混合解构
try {
    operation()
} catch ({name, value: [first, second]}) {
    process(name, first, second)
}

// ✅ 测试7：多个catch块的不同参数
try {
    riskyOp()
} catch (e) {
    handleError(e)
}
try {
    anotherOp()
} catch ({details}) {
    handleDetails(details)
}

// ✅ 测试8：复杂嵌套解构
try {
    complexCall()
} catch ({
    status,
    data: {
        error: {
            message,
            code
        },
        trace: [line, column]
    }
}) {
    reportError(status, message, code, line, column)
}

/* Es6Parser.ts: CatchParameter */
