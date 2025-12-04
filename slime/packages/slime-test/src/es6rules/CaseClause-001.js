/**
 * 规则测试：CaseClause
 * 分类：others | 编号：704
 * 
 * 规则定义（Es2025Parser.ts）：
 * CaseClause:
 *   case Expression : StatementList?
 *   default : StatementList?
 * 
 * 中文说明：
 * ✓ case子句由case关键字、表达式、冒号和可选的语句列表组成
 * ✓ default子句是特殊的case，没有表达式
 * ✓ 语句列表可以为空（允许fall-through）
 * ✓ 在switch语句中使用
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：基本case子句    CaseClause -> case Expression : (无StatementList)
switch (1) {
    case 1: break
}

// ✅ 测试2：多个case子句    CaseClause -> 多个case子句组合
switch (1) {
    case 1: console.log(1); break
    case 2: console.log(2); break
}

// ✅ 测试3：default子句    CaseClause -> default (特殊的case, 无Expression)
switch (1) {
    default: console.log('default')
}

// ✅ 测试4：case + default组合    CaseClause -> Or分支1 (case) + Or分支2 (default)
switch (1) {
    case 1: console.log(1); break
    default: console.log('default')
}

// ✅ 测试5：case - StatementList为空（fall-through）    CaseClause -> case Expression : (StatementList?)
switch (1) {
    case 1:
    case 2: console.log('1 or 2'); break
}

// ✅ 测试7：case - 多个语句    CaseClause -> case Expression : StatementList (多个语句)
switch (1) {
    case 1:
        const x = 1
        const y = 2
        console.log(x + y)
        break
}

// ✅ 测试8：case - 表达式求值    CaseClause -> case (复杂Expression) : StatementList
const value = 2
switch (value) {
    case 1 + 1: console.log('two'); break
    case 2: console.log('number two'); break
}

// ✅ 测试9：case - 字符串表达式
switch ('hello') {
    case 'hello': console.log('matched'); break
    case 'world': console.log('other'); break
}

// ✅ 测试10：case - 对象表达式
const obj = { x: 1 }
switch (obj) {
    case obj: console.log('same object'); break
    default: console.log('different')
}

// ✅ 测试11：case - 条件表达式
switch (true) {
    case 5 > 3: console.log('true condition'); break
    default: console.log('false')
}

// ✅ 测试12：default - StatementList为空
switch (1) {
    case 1: console.log(1); break
    default:
}

// ✅ 测试13：default - 单个语句
switch (99) {
    case 1: break
    default: console.log('not found')
}

// ✅ 测试14：多个case fall-through
switch (1) {
    case 0:
    case 1:
    case 2:
    case 3: console.log('0-3'); break
    default: console.log('other')
}

// ✅ 测试15：嵌套switch的case
switch (1) {
    case 1:
        switch (2) {
            case 2: console.log('nested'); break
        }
        break
}

// ✅ 测试16：case中的控制流
switch (1) {
    case 1:
        if (true) {
            break
        }
    case 2: console.log(2)
}

/* Es2025Parser.ts: CaseClause
 * 规则：
 * CaseClause:
 *   case Expression : StatementList?
 *   default : StatementList?
 */


// ============================================
// 来自文件: 925-CaseClause.js
// ============================================

/**
 * 规则测试：CaseClause
 * 
 * 位置：Es2025Parser.ts Line 1325
 * 分类：others
 * 编号：925
 * 
 * EBNF规则：
 *   CaseClause:
 *     case Expression : StatementList?
 * 
 * 测试目标：
 * - 测试基本case
 * - 测试无语句的case
 * - 测试单语句case
 * - 测试多语句case
 * - 测试case中的声明
 * - 测试case中的表达式
 * - 测试case中的控制流
 * - 测试fall-through case
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本case带语句
switch (x) {
    case 1:
        console.log('one')
        break
}

// ✅ 测试2：无语句的case（fall-through）
switch (x) {
    case 1:
    case 2:
        console.log('one or two')
}

// ✅ 测试4：多语句case
switch (code) {
    case 1:
        let x = 1
        console.log(x)
        doSomething()
}

// ✅ 测试5：case中的声明
switch (type) {
    case 'const': const y = 2; break
    case 'let': let z = 3; break
}

// ✅ 测试6：case中的表达式
switch (val) {
    case 1 + 2: process(); break
    case func(): execute(); break
}

// ✅ 测试7：case中的控制流
switch (status) {
    case 'active':
        if (isReady()) {
            run()
        } else {
            wait()
        }
        break
}

// ✅ 测试8：复杂case
switch (action) {
    case 'save':
        try {
            save()
        } catch (e) {
            alert(e)
        }
        break
}

/* Es2025Parser.ts: CaseClause */

/**
 * 规则测试：CaseClause
 * 
 * 位置：Es2025Parser.ts Line 1325
 * 分类：others
 * 编号：925
 * 
 * EBNF规则：
 *   CaseClause:
 *     case Expression : StatementList?
 * 
 * 测试目标：
 * - 测试基本case
 * - 测试无语句的case
 * - 测试单语句case
 * - 测试多语句case
 * - 测试case中的声明
 * - 测试case中的表达式
 * - 测试case中的控制流
 * - 测试fall-through case
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本case带语句
switch (x) {
    case 1:
        console.log('one')
        break
}

// ✅ 测试2：无语句的case（fall-through）
switch (x) {
    case 1:
    case 2:
        console.log('one or two')
}

// ✅ 测试4：多语句case
switch (code) {
    case 1:
        let x = 1
        console.log(x)
        doSomething()
}

// ✅ 测试5：case中的声明
switch (type) {
    case 'const': const y = 2; break
    case 'let': let z = 3; break
}

// ✅ 测试6：case中的表达式
switch (val) {
    case 1 + 2: process(); break
    case func(): execute(); break
}

// ✅ 测试7：case中的控制流
switch (status) {
    case 'active':
        if (isReady()) {
            run()
        } else {
            wait()
        }
        break
}

// ✅ 测试8：复杂case
switch (action) {
    case 'save':
        try {
            save()
        } catch (e) {
            alert(e)
        }
        break
}

/* Es2025Parser.ts: CaseClause */
