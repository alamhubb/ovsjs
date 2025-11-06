/**
 * Subhuti Grammar Validation - 单元测试
 * 
 * 测试：
 * 1. 路径计算
 * 2. 冲突检测（空路径、前缀冲突）
 * 3. 无冲突情况
 */

import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser"

// ============================================
// 测试 Parser 定义
// ============================================

/**
 * 测试1：前缀冲突（Identifier vs MemberExpression）
 */
@Subhuti
class TestParser1 extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.Identifier() },        // 短路径
            { alt: () => this.MemberExpression() }   // 长路径（会被遮蔽）
        ])
    }
    
    @SubhutiRule
    MemberExpression() {
        this.consume('Identifier')
        this.consume('Dot')
        this.consume('Identifier')
    }
    
    @SubhutiRule
    Identifier() {
        this.consume('Identifier')
    }
}

/**
 * 测试2：空路径冲突（Option 导致）
 */
@Subhuti
class TestParser2 extends SubhutiParser {
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.Option(() => this.consume('Keyword')) },  // 空路径
            { alt: () => this.consume('Identifier') }                   // 永远不可达
        ])
    }
}

/**
 * 测试3：无冲突（正确顺序）
 */
@Subhuti
class TestParser3 extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.MemberExpression() },  // 长路径在前
            { alt: () => this.Identifier() }         // 短路径在后（正确）
        ])
    }
    
    @SubhutiRule
    MemberExpression() {
        this.consume('Identifier')
        this.consume('Dot')
        this.consume('Identifier')
    }
    
    @SubhutiRule
    Identifier() {
        this.consume('Identifier')
    }
}

/**
 * 测试4：复杂情况（Option 导致多路径）
 */
@Subhuti
class TestParser4 extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => this.ShortRule() },   // 有短路径
            { alt: () => this.LongRule() }     // 会被遮蔽
        ])
    }
    
    @SubhutiRule
    ShortRule() {
        this.consume('A')
        this.Option(() => this.consume('B'))  // 产生两条路径: [A,] 和 [A,B,]
        this.consume('C')
    }
    
    @SubhutiRule
    LongRule() {
        this.consume('A')
        this.consume('B')
        this.consume('C')
        this.consume('D')
    }
}

// ============================================
// 测试函数
// ============================================

console.log('\n=== Subhuti Grammar Validation Tests ===\n')

// 测试1：前缀冲突检测
console.log('Test 1: Prefix Conflict Detection')
console.log('Parser: Expression -> Identifier | MemberExpression')
console.log('Expected: ERROR (Identifier 遮蔽 MemberExpression)')
const parser1 = new TestParser1([])
const result1 = parser1.validateGrammar({ verbose: true })
console.log('Result:', result1.success ? '✅ Pass (no errors)' : `❌ Fail (${result1.errors.length} errors)`)
if (!result1.success) {
    console.log('Errors:', result1.errors.map(e => `[${e.level}] ${e.message}`).join(', '))
}
console.log('')

// 测试2：空路径冲突检测
console.log('Test 2: Empty Path Detection')
console.log('Parser: Statement -> Option(Keyword) | Identifier')
console.log('Expected: FATAL (空路径导致后续不可达)')
const parser2 = new TestParser2([])
const result2 = parser2.validateGrammar({ verbose: true })
console.log('Result:', result2.success ? '✅ Pass (no errors)' : `❌ Fail (${result2.errors.length} errors)`)
if (!result2.success) {
    console.log('Errors:', result2.errors.map(e => `[${e.level}] ${e.message}`).join(', '))
}
console.log('')

// 测试3：无冲突（正确顺序）
console.log('Test 3: No Conflict (Correct Order)')
console.log('Parser: Expression -> MemberExpression | Identifier')
console.log('Expected: SUCCESS (长规则在前，无冲突)')
const parser3 = new TestParser3([])
const result3 = parser3.validateGrammar({ verbose: true })
console.log('Result:', result3.success ? '✅ Pass (no errors)' : `❌ Fail (${result3.errors.length} errors)`)
if (!result3.success) {
    console.log('Errors:', result3.errors.map(e => `[${e.level}] ${e.message}`).join(', '))
}
console.log('')

// 测试4：Option 多路径冲突
console.log('Test 4: Option Multi-Path Conflict')
console.log('Parser: Expression -> ShortRule(A,[B],C) | LongRule(A,B,C,D)')
console.log('Expected: ERROR (ShortRule 的 [A,B,C,] 遮蔽 LongRule 的 [A,B,C,D,])')
const parser4 = new TestParser4([])
const result4 = parser4.validateGrammar({ verbose: true })
console.log('Result:', result4.success ? '✅ Pass (no errors)' : `❌ Fail (${result4.errors.length} errors)`)
if (!result4.success) {
    console.log('Errors:', result4.errors.map(e => `[${e.level}] ${e.message}`).join(', '))
}
console.log('')

// 汇总
console.log('=== Test Summary ===')
console.log(`Test 1: ${result1.success ? '❌ FAIL (应该检测到错误)' : '✅ PASS'}`)
console.log(`Test 2: ${result2.success ? '❌ FAIL (应该检测到错误)' : '✅ PASS'}`)
console.log(`Test 3: ${result3.success ? '✅ PASS' : '❌ FAIL (不应该有错误)'}`)
console.log(`Test 4: ${result4.success ? '❌ FAIL (应该检测到错误)' : '✅ PASS'}`)

// 退出码
const allPassed = !result1.success && !result2.success && result3.success && !result4.success
console.log(`\nAll tests: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`)
process.exit(allPassed ? 0 : 1)

