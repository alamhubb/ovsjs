/**
 * Subhuti Or 分支冲突检测 - 单元测试
 * 
 * 测试：Or 分支的 First(1) 集合冲突检测
 * 
 * 测试场景：
 * 1. 无冲突：不同的 First token
 * 2. 完全冲突：相同的 First token
 * 3. 部分冲突：部分 First token 重叠
 * 4. 嵌套 Or：Or 节点内部还有 Or
 * 5. 包含 Option：Option 可能产生空分支
 * 6. 多分支冲突：3个或更多分支存在冲突
 * 7. 规则展开冲突：通过规则引用导致的冲突
 */

import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"

console.log('📝 Or 分支冲突检测测试开始...\n')

// ============================================
// 测试用例 1：无冲突 - 不同的 First token
// ============================================

@Subhuti
class TestNoConflictParser extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.consume('NUMBER') },      // First: {NUMBER}
            { alt: () => this.consume('STRING') },      // First: {STRING}
            { alt: () => this.consume('IDENTIFIER') }   // First: {IDENTIFIER}
        ])
    }
}

// ============================================
// 测试用例 2：完全冲突 - 相同的 First token
// ============================================

@Subhuti
class TestFullConflictParser extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => {
                this.consume('IDENTIFIER')
                this.consume('PLUS')
            }},  // First: {IDENTIFIER}
            { alt: () => {
                this.consume('IDENTIFIER')
                this.consume('MINUS')
            }}   // First: {IDENTIFIER} - 冲突！
        ])
    }
}

// ============================================
// 测试用例 3：部分冲突 - 部分 First token 重叠
// ============================================

@Subhuti
class TestPartialConflictParser extends SubhutiParser {
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.IfStatement() },      // First: {IF}
            { alt: () => this.WhileStatement() },   // First: {WHILE, IF} - IF 冲突！
            { alt: () => this.BlockStatement() }    // First: {LBRACE}
        ])
    }

    @SubhutiRule
    IfStatement() {
        this.consume('IF')
        this.consume('LPAREN')
    }

    @SubhutiRule
    WhileStatement() {
        // 通过 Or 产生多个 First token
        this.Or([
            { alt: () => this.consume('WHILE') },
            { alt: () => this.consume('IF') }  // 与 IfStatement 冲突
        ])
        this.consume('LPAREN')
    }

    @SubhutiRule
    BlockStatement() {
        this.consume('LBRACE')
    }
}

// ============================================
// 测试用例 4：嵌套 Or - Or 节点内部还有 Or
// ============================================

@Subhuti
class TestNestedOrParser extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.NumberExpr() },
            { alt: () => this.StringExpr() }
        ])
    }

    @SubhutiRule
    NumberExpr() {
        // 嵌套 Or
        this.Or([
            { alt: () => this.consume('NUMBER') },
            { alt: () => this.consume('NUMBER') }  // 内部冲突！
        ])
    }

    @SubhutiRule
    StringExpr() {
        this.consume('STRING')
    }
}

// ============================================
// 测试用例 5：包含 Option - 可能产生空分支
// ============================================

@Subhuti
class TestOptionConflictParser extends SubhutiParser {
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.Option(() => this.consume('KEYWORD')) },  // First: {ε, KEYWORD}
            { alt: () => this.consume('KEYWORD') }                      // First: {KEYWORD} - 冲突！
        ])
    }
}

// ============================================
// 测试用例 6：多分支冲突 - 3个分支都有冲突
// ============================================

@Subhuti
class TestMultiBranchConflictParser extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.consume('ID') },          // First: {ID}
            { alt: () => {
                this.consume('ID')
                this.consume('DOT')
            }},                                         // First: {ID} - 与分支1冲突
            { alt: () => {
                this.consume('ID')
                this.consume('LPAREN')
            }}                                          // First: {ID} - 与分支1、2冲突
        ])
    }
}

// ============================================
// 测试用例 7：规则展开冲突 - 通过规则引用导致的冲突
// ============================================

@Subhuti
class TestRuleExpansionConflictParser extends SubhutiParser {
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.AssignmentStatement() },  // First: {IDENTIFIER}
            { alt: () => this.CallStatement() }         // First: {IDENTIFIER} - 冲突！
        ])
    }

    @SubhutiRule
    AssignmentStatement() {
        this.consume('IDENTIFIER')
        this.consume('ASSIGN')
    }

    @SubhutiRule
    CallStatement() {
        this.consume('IDENTIFIER')
        this.consume('LPAREN')
    }
}

// ============================================
// 测试用例 8：复杂嵌套 - Sequence 中包含 Or
// ============================================

@Subhuti
class TestComplexNestedParser extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.consume('START')
        this.Or([
            { alt: () => this.consume('A') },
            { alt: () => this.consume('A') }  // 冲突！
        ])
        this.consume('END')
    }
}

// ============================================
// 测试用例 9：无冲突 - 通过规则引用但 First 集不同
// ============================================

@Subhuti
class TestNoConflictWithRulesParser extends SubhutiParser {
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.IfStatement() },      // First: {IF}
            { alt: () => this.WhileStatement() },   // First: {WHILE}
            { alt: () => this.ReturnStatement() }   // First: {RETURN}
        ])
    }

    @SubhutiRule
    IfStatement() {
        this.consume('IF')
    }

    @SubhutiRule
    WhileStatement() {
        this.consume('WHILE')
    }

    @SubhutiRule
    ReturnStatement() {
        this.consume('RETURN')
    }
}

// ============================================
// 测试函数
// ============================================

console.log('\n=== Subhuti Or 分支冲突检测测试 ===\n')

interface TestResult {
    success: boolean
    errors: any[]
}

function runTest(
    TestClass: any, 
    testName: string, 
    description: string, 
    shouldHaveError: boolean
): boolean {
    console.log(`测试 ${testName}: ${description}`)
    
    const parser = new TestClass([])
    let result: TestResult = { success: true, errors: [] }
    
    try {
        parser.validate()
    } catch (error: any) {
        result = { success: false, errors: error.errors || [error] }
    }
    
    const hasOrConflictError = result.errors.some((e: any) => e.type === 'or-conflict')
    const passed = shouldHaveError ? hasOrConflictError : result.success
    
    console.log(`预期: ${shouldHaveError ? '应该检测到 Or 冲突' : '不应该有 Or 冲突'}`)
    console.log(`结果: ${passed ? '✅ 通过' : '❌ 失败'}`)
    
    if (!result.success) {
        console.log(`检测到 ${result.errors.length} 个错误:`)
        result.errors.forEach((e: any) => {
            console.log(`  - [${e.level}] ${e.type}: ${e.message}`)
            if (e.type === 'or-conflict') {
                console.log(`    ${e.conflictPaths.pathA}`)
                console.log(`    ${e.conflictPaths.pathB}`)
            }
        })
    }
    
    console.log('')
    return passed
}

// 运行所有测试
const results: boolean[] = []

// 测试 1：无冲突
results.push(runTest(
    TestNoConflictParser,
    '1',
    '无冲突 - 不同的 First token',
    false  // 不应该有错误
))

// 测试 2：完全冲突
results.push(runTest(
    TestFullConflictParser,
    '2',
    '完全冲突 - 相同的 First token',
    true  // 应该有错误
))

// 测试 3：部分冲突
results.push(runTest(
    TestPartialConflictParser,
    '3',
    '部分冲突 - 部分 First token 重叠',
    true  // 应该有错误
))

// 测试 4：嵌套 Or
results.push(runTest(
    TestNestedOrParser,
    '4',
    '嵌套 Or - Or 节点内部还有 Or',
    true  // 应该有错误
))

// 测试 5：包含 Option
results.push(runTest(
    TestOptionConflictParser,
    '5',
    '包含 Option - 可能产生空分支',
    true  // 应该有错误
))

// 测试 6：多分支冲突
results.push(runTest(
    TestMultiBranchConflictParser,
    '6',
    '多分支冲突 - 3个分支都有冲突',
    true  // 应该有错误
))

// 测试 7：规则展开冲突
results.push(runTest(
    TestRuleExpansionConflictParser,
    '7',
    '规则展开冲突 - 通过规则引用导致的冲突',
    true  // 应该有错误
))

// 测试 8：复杂嵌套
results.push(runTest(
    TestComplexNestedParser,
    '8',
    '复杂嵌套 - Sequence 中包含 Or',
    true  // 应该有错误
))

// 测试 9：无冲突（规则引用）
results.push(runTest(
    TestNoConflictWithRulesParser,
    '9',
    '无冲突 - 通过规则引用但 First 集不同',
    false  // 不应该有错误
))

// 汇总结果
console.log('=== 测试汇总 ===')
results.forEach((passed, index) => {
    console.log(`测试 ${index + 1}: ${passed ? '✅ 通过' : '❌ 失败'}`)
})

const allPassed = results.every(r => r)
console.log(`\n所有测试: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`)
console.log(`通过率: ${results.filter(r => r).length}/${results.length}`)

// 退出码
process.exit(allPassed ? 0 : 1)









