/**
 * 规则测试：CaseClause
 * 
 * 位置：Es6Parser.ts Line 1325
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

// ✅ 测试3：单语句case
switch (n) {
    case 'a': return 'A'
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

/* Es6Parser.ts: CaseClause */
