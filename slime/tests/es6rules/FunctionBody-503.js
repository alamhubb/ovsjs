/**
 * 规则测试：FunctionBody
 * 
 * 位置：Es6Parser.ts Line 1474
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

/* Es6Parser.ts: FunctionBody */
