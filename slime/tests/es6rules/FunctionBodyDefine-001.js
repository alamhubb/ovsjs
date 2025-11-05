/**
 * 规则测试：FunctionBodyDefine
 * 
 * 位置：Es2025Parser.ts Line 1425
 * 分类：functions
 * 编号：502
 * 
 * EBNF规则：
 *   FunctionBodyDefine:
 *     ( FunctionFormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 测试空函数体
 * - 测试单语句函数体
 * - 测试多语句函数体
 * - 测试带返回值的函数体
 * - 测试带作用域的函数体
 * - 测试带异常处理的函数体
 * - 测试带循环的函数体
 * - 测试复杂函数体
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：空函数体
function empty() {
}

// ✅ 测试2：单语句函数体
function single() {
    return 42
}

// ✅ 测试3：多个声明语句
function declares() {
    const x = 1
    const y = 2
    const z = x + y
}

// ✅ 测试4：带条件语句的函数体
function conditional(n) {
    if (n > 0) {
        return 'positive'
    } else {
        return 'negative'
    }
}

// ✅ 测试5：带循环的函数体
function withLoop(arr) {
    let sum = 0
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
    }
    return sum
}

// ✅ 测试6：带异常处理的函数体
function withTry(fn) {
    try {
        return fn()
    } catch (e) {
        console.error(e)
    }
}

// ✅ 测试7：带作用域隔离的函数体
function withScope() {
    {
        let x = 1
    }
    {
        let y = 2
    }
}

// ✅ 测试8：复杂函数体（多分支、嵌套）
function complex(x, y) {
    if (x > 0) {
        if (y > 0) {
            return x + y
        } else {
            return x - y
        }
    } else {
        try {
            let result = x * y
            return result
        } catch (e) {
            return 0
        }
    }
}

/* Es2025Parser.ts: FunctionBodyDefine */

/**
 * 规则测试：FunctionBodyDefine
 * 
 * 位置：Es2025Parser.ts Line 1425
 * 分类：functions
 * 编号：502
 * 
 * EBNF规则：
 *   FunctionBodyDefine:
 *     ( FunctionFormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 测试空函数体
 * - 测试单语句函数体
 * - 测试多语句函数体
 * - 测试带返回值的函数体
 * - 测试带作用域的函数体
 * - 测试带异常处理的函数体
 * - 测试带循环的函数体
 * - 测试复杂函数体
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：空函数体
function empty() {
}

// ✅ 测试2：单语句函数体
function single() {
    return 42
}

// ✅ 测试3：多个声明语句
function declares() {
    const x = 1
    const y = 2
    const z = x + y
}

// ✅ 测试4：带条件语句的函数体
function conditional(n) {
    if (n > 0) {
        return 'positive'
    } else {
        return 'negative'
    }
}

// ✅ 测试5：带循环的函数体
function withLoop(arr) {
    let sum = 0
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
    }
    return sum
}

// ✅ 测试6：带异常处理的函数体
function withTry(fn) {
    try {
        return fn()
    } catch (e) {
        console.error(e)
    }
}

// ✅ 测试7：带作用域隔离的函数体
function withScope() {
    {
        let x = 1
    }
    {
        let y = 2
    }
}

// ✅ 测试8：复杂函数体（多分支、嵌套）
function complex(x, y) {
    if (x > 0) {
        if (y > 0) {
            return x + y
        } else {
            return x - y
        }
    } else {
        try {
            let result = x * y
            return result
        } catch (e) {
            return 0
        }
    }
}

/* Es2025Parser.ts: FunctionBodyDefine */
