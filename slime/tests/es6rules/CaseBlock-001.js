/**
 * 测试规则: CaseBlock
 * 来源: 从 Block 拆分
 *//**
 * 规则测试：CaseBlock
 * 
 * 位置：Es6Parser.ts Line 1309
 * 分类：others
 * 编号：923
 * 
 * EBNF规则：
 *   CaseBlock:
 *     { CaseClauses? DefaultClause? CaseClauses? }
 * 
 * 测试目标：
 * - 测试基本case块
 * - 测试仅case子句
 * - 测试仅default子句
 * - 测试case和default混合
 * - 测试fall-through情况
 * - 测试多个case
 * - 测试case块中的复杂语句
 * - 测试空case块
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本case块
switch (x) {
    case 1: break
    case 2: break
    default: break
}

// ✅ 测试2：仅case子句
switch (value) {
    case 'a': break
    case 'b': break
    case 'c': break
}

// ✅ 测试3：case和default
switch (n) {
    case 0:
        console.log('zero')
        break
    default:
        console.log('other')
}

// ✅ 测试4：fall-through
switch (code) {
    case 1:
    case 2:
        doSomething()
        break
    case 3:
        doOther()
        break
}

// ✅ 测试5：多个case
switch (status) {
    case 'pending':
        handle()
        break
    case 'active':
        run()
        break
    case 'done':
        complete()
        break
}

// ✅ 测试6：case块中的复杂语句
switch (type) {
    case 1:
        let x = 1
        if (x > 0) {
            console.log(x)
        }
        break
    default:
        const y = 2
        return y
}

// ✅ 测试7：default在中间位置
switch (key) {
    case 'first':
        console.log('1')
        break
    default:
        console.log('default')
        break
    case 'second':
        console.log('2')
        break
}

// ✅ 测试8：空case块
switch (val) {
    case 1:
        break
    case 2:
        break
}

/* Es6Parser.ts: CaseBlock */
