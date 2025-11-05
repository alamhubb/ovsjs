/**
 * 规则测试：FunctionBody
 * 
 * 位置：Es2025Parser.ts Line 1474
 * 分类：functions
 * 编号：503
 * 
 * EBNF规则：
 *   FunctionBody:
 *     FunctionStatementList
 *   
 *   FunctionStatementList:
 *     StatementListItem*
 * 
 * 测试目标：
 * - 测试空函数体（0个语句）
 * - 测试单个声明语句
 * - 测试单个表达式语句
 * - 测试混合声明和表达式
 * - 测试嵌套语句（if、for、try等）
 * - 测试函数声明在函数体内
 * - 测试类声明在函数体内
 * - 测试复杂混合场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：空函数体
function test1() {
}

// ✅ 测试2：单个变量声明
function test2() {
    const x = 1
    return x
}

// ✅ 测试3：多个变量声明
function test3() {
    let a = 1
    let b = 2
    let c = a + b
    return c
}

// ✅ 测试4：表达式语句
function test4() {
    console.log('hello')
    Math.max(1, 2, 3)
}

// ✅ 测试5：混合声明和表达式
function test5() {
    const obj = {a: 1, b: 2}
    console.log(obj)
    const arr = [1, 2, 3]
    console.log(arr)
}

// ✅ 测试6：嵌套控制流语句
function test6() {
    if (true) {
        for (let i = 0; i < 10; i++) {
            if (i % 2 === 0) {
                console.log(i)
            }
        }
    }
}

// ✅ 测试7：函数声明在函数体内（函数提升）
function test7() {
    function inner() {
        return 42
    }
    return inner()
}

// ✅ 测试8：完整复杂函数体
function test8() {
    const config = {debug: true, timeout: 5000}
    function log(msg) {
        if (config.debug) {
            console.log(msg)
        }
    }
    for (let i = 0; i < 3; i++) {
        log('iteration ' + i)
    }
    try {
        const result = Math.random()
        return result
    } catch (e) {
        log('error: ' + e.message)
        return null
    }
}

/* Es2025Parser.ts: FunctionBody */


// ============================================
// 来自文件: 510-FunctionBody.js
// ============================================

/**
 * 规则测试：FunctionBody
 * 分类：functions | 编号：510
 * 
 * 规则定义（Es2025Parser.ts）：
 * FunctionBody:
 *   { StatementList? }
 * 
 * StatementList:
 *   StatementListItem
 *   StatementList StatementListItem
 * 
 * 中文说明：
 * ✓ 函数体是由花括号包含的可选语句列表
 * ✓ 可以是空函数体或包含多个语句
 * ✓ 支持声明和语句的混合
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：空函数体
function empty() {
}

// ✅ 测试2：单个语句的函数体
function single() {
    return 42
}

// ✅ 测试3：多个语句的函数体
function multiple() {
    const x = 1
    const y = 2
    return x + y
}

// ✅ 测试4：函数体包含变量声明
function withVar() {
    var a = 10
    let b = 20
    const c = 30
    return a + b + c
}

// ✅ 测试5：函数体包含函数声明
function withFunc() {
    function inner() {
        return 5
    }
    return inner()
}

// ✅ 测试6：函数体包含类声明
function withClass() {
    class MyClass {
        constructor() {
            this.value = 42
        }
    }
    return new MyClass()
}

// ✅ 测试7：函数体包含if语句
function withIf() {
    if (true) {
        return "yes"
    }
    return "no"
}

// ✅ 测试8：函数体包含for循环
function withFor() {
    let sum = 0
    for (let i = 0; i < 5; i++) {
        sum += i
    }
    return sum
}

// ✅ 测试9：函数体包含try-catch
function withTry() {
    try {
        throw new Error("test")
    } catch (e) {
        return e.message
    }
}

// ✅ 测试10：函数体包含switch
function withSwitch() {
    switch (1) {
        case 1:
            return "one"
        case 2:
            return "two"
        default:
            return "other"
    }
}

// ✅ 测试11：函数体包含while循环
function withWhile() {
    let i = 0
    while (i < 3) {
        i++
    }
    return i
}

// ✅ 测试12：函数体包含嵌套函数
function withNested() {
    function outer() {
        function inner() {
            return 10
        }
        return inner() + 5
    }
    return outer()
}

// ✅ 测试13：函数体包含混合语句和声明
function mixed() {
    const x = 5
    function helper(n) {
        return n * 2
    }
    let result = helper(x)
    return result
}

// ✅ 测试14：函数体包含表达式语句
function withExpr() {
    console.log("test")
    1 + 1
    "string expression"
    return undefined
}

// ✅ 测试15：函数体包含throw语句
function withThrow() {
    if (Math.random() > 0.5) {
        throw new Error("Random error")
    }
    return "success"
}

/* Es2025Parser.ts: FunctionBody
 * 规则：
 * FunctionBody:
 *   { StatementList? }
 * 
 * StatementList:
 *   StatementListItem
 *   StatementList StatementListItem
 */


// ============================================
// 合并来自: AsyncArrowFunctionBody-001.js
// ============================================


/* Es2025Parser.ts: async ArrowFunction with async body */

/**
 * 规则测试：FunctionBody
 * 
 * 位置：Es2025Parser.ts Line 1474
 * 分类：functions
 * 编号：503
 * 
 * EBNF规则：
 *   FunctionBody:
 *     FunctionStatementList
 *   
 *   FunctionStatementList:
 *     StatementListItem*
 * 
 * 测试目标：
 * - 测试空函数体（0个语句）
 * - 测试单个声明语句
 * - 测试单个表达式语句
 * - 测试混合声明和表达式
 * - 测试嵌套语句（if、for、try等）
 * - 测试函数声明在函数体内
 * - 测试类声明在函数体内
 * - 测试复杂混合场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：空函数体
function test1() {
}

// ✅ 测试2：单个变量声明
function test2() {
    const x = 1
    return x
}

// ✅ 测试3：多个变量声明
function test3() {
    let a = 1
    let b = 2
    let c = a + b
    return c
}

// ✅ 测试4：表达式语句
function test4() {
    console.log('hello')
    Math.max(1, 2, 3)
}

// ✅ 测试5：混合声明和表达式
function test5() {
    const obj = {a: 1, b: 2}
    console.log(obj)
    const arr = [1, 2, 3]
    console.log(arr)
}

// ✅ 测试6：嵌套控制流语句
function test6() {
    if (true) {
        for (let i = 0; i < 10; i++) {
            if (i % 2 === 0) {
                console.log(i)
            }
        }
    }
}

// ✅ 测试7：函数声明在函数体内（函数提升）
function test7() {
    function inner() {
        return 42
    }
    return inner()
}

// ✅ 测试8：完整复杂函数体
function test8() {
    const config = {debug: true, timeout: 5000}
    function log(msg) {
        if (config.debug) {
            console.log(msg)
        }
    }
    for (let i = 0; i < 3; i++) {
        log('iteration ' + i)
    }
    try {
        const result = Math.random()
        return result
    } catch (e) {
        log('error: ' + e.message)
        return null
    }
}

/* Es2025Parser.ts: FunctionBody */
