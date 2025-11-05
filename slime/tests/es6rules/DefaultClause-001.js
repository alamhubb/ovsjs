/**
 * 规则测试：DefaultClause
 * 
 * 位置：Es6Parser.ts Line 1333
 * 分类：others
 * 编号：926
 * 
 * EBNF规则：
 *   DefaultClause:
 *     default : StatementList?
 * 
 * 测试目标：
 * - 测试基本default
 * - 测试无语句的default
 * - 测试单语句default
 * - 测试多语句default
 * - 测试default中的声明
 * - 测试default中的控制流
 * - 测试default中的异常处理
 * - 测试default在不同位置
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本default    DefaultClause -> default : StatementList (1个语句)
switch (x) {
    default:
        console.log('default')
}

// ✅ 测试2：无语句的default    DefaultClause -> default : (无StatementList)
switch (x) {
    case 1: break
    default:
}

// ✅ 测试3：单语句default    DefaultClause -> default : (单个Statement)
switch (status) {
    default: return 'unknown'
}

// ✅ 测试4：多语句default    DefaultClause -> default : (多个Statement)
switch (value) {
    default:
        let result = 0
        console.log('handling default')
        throw new Error('Unexpected value')
}

// ✅ 测试5：default中的声明
switch (type) {
    case 'int': break
    default:
        const x = {}
        const y = []
}

// ✅ 测试6：default中的控制流
switch (key) {
    default:
        if (isDebug) {
            console.log('debug mode')
        } else {
            process()
        }
}

// ✅ 测试7：default中的循环
switch (cmd) {
    default:
        for (let i = 0; i < 10; i++) {
            handle(i)
        }
}

// ✅ 测试8：default前的case
switch (action) {
    case 'a':
    case 'b':
        doAB()
        break
    default:
        doDefault()
}

/* Es6Parser.ts: DefaultClause */


// ============================================
// 合并来自: DefaultBinding-001.js
// ============================================


/* Es6Parser.ts: ImportedDefaultBinding */

/**
 * 规则测试：DefaultClause
 * 
 * 位置：Es6Parser.ts Line 1333
 * 分类：others
 * 编号：926
 * 
 * EBNF规则：
 *   DefaultClause:
 *     default : StatementList?
 * 
 * 测试目标：
 * - 测试基本default
 * - 测试无语句的default
 * - 测试单语句default
 * - 测试多语句default
 * - 测试default中的声明
 * - 测试default中的控制流
 * - 测试default中的异常处理
 * - 测试default在不同位置
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本default
switch (x) {
    default:
        console.log('default')
}

// ✅ 测试2：无语句的default
switch (x) {
    case 1: break
    default:
}

// ✅ 测试3：单语句default
switch (status) {
    default: return 'unknown'
}

// ✅ 测试4：多语句default
switch (value) {
    default:
        let result = 0
        console.log('handling default')
        throw new Error('Unexpected value')
}

// ✅ 测试5：default中的声明
switch (type) {
    case 'int': break
    default:
        const x = {}
        const y = []
}

// ✅ 测试6：default中的控制流
switch (key) {
    default:
        if (isDebug) {
            console.log('debug mode')
        } else {
            process()
        }
}

// ✅ 测试7：default中的循环
switch (cmd) {
    default:
        for (let i = 0; i < 10; i++) {
            handle(i)
        }
}

// ✅ 测试8：default前的case
switch (action) {
    case 'a':
    case 'b':
        doAB()
        break
    default:
        doDefault()
}

/* Es6Parser.ts: DefaultClause */
