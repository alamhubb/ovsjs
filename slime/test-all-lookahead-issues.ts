/**
 * 系统性测试：所有前瞻检查问题
 */

import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts"
import SubhutiLexer from "subhuti/src/SubhutiLexer.ts"
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokenType.ts"

function test(code: string, ruleName: string, description: string, shouldFail: boolean) {
    try {
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)
        
        const parser = new SlimeParser(tokens)
        const ast = (parser as any)[ruleName]()
        
        const result = ast !== undefined && ast !== null
        const isCorrect = result !== shouldFail
        
        if (isCorrect) {
            console.log(`  ✅ ${description}`)
        } else {
            if (shouldFail) {
                console.log(`  ❌ ${description} - 应该失败但成功了`)
            } else {
                console.log(`  ❌ ${description} - 应该成功但失败了`)
            }
        }
        return isCorrect
    } catch (e: any) {
        const isCorrect = shouldFail
        if (isCorrect) {
            console.log(`  ✅ ${description} - 正确抛出异常`)
        } else {
            console.log(`  ❌ ${description} - 不应该抛异常: ${e.message?.split('\n')[0]}`)
        }
        return isCorrect
    }
}

console.log('\n========================================')
console.log('系统性前瞻检查问题测试')
console.log('========================================\n')

let totalTests = 0
let passedTests = 0

// ============================================
// 测试1: ExpressionStatement 前瞻检查
// ============================================
console.log('【测试1】ExpressionStatement - 规则开头的前瞻检查')
console.log('问题：在消费任何token前就 return undefined')
console.log('位置：第2207-2232行\n')

totalTests++
if (test('x = 1', 'ExpressionStatement', '普通表达式（应该成功）', false)) passedTests++

totalTests++
if (test('function foo() {}', 'ExpressionStatement', 'function开头（应该失败）', true)) passedTests++

totalTests++
if (test('class Bar {}', 'ExpressionStatement', 'class开头（应该失败）', true)) passedTests++

totalTests++
if (test('async function baz() {}', 'ExpressionStatement', 'async function开头（应该失败）', true)) passedTests++

totalTests++
if (test('{ x: 1 }', 'ExpressionStatement', '{开头（应该失败）', true)) passedTests++

// ============================================
// 测试2: Identifier - 保留字检查
// ============================================
console.log('\n【测试2】Identifier - 保留字检查')
console.log('问题：consume后检查保留字，然后 return undefined')
console.log('位置：第125-132行\n')

totalTests++
if (test('foo', 'Identifier', '普通标识符（应该成功）', false)) passedTests++

totalTests++
if (test('function', 'Identifier', '保留字function（应该失败）', true)) passedTests++

totalTests++
if (test('class', 'Identifier', '保留字class（应该失败）', true)) passedTests++

// ============================================
// 测试3: ThrowStatement - 换行符检查  
// ============================================
console.log('\n【测试3】ThrowStatement - 换行符检查')
console.log('问题：consume后检查换行符，然后 return undefined')
console.log('位置：第2760-2767行\n')

totalTests++
if (test('throw new Error()', 'ThrowStatement', 'throw同行表达式（应该成功）', false)) passedTests++

totalTests++
if (test('throw\nnew Error()', 'ThrowStatement', 'throw后有换行（应该失败）', true)) passedTests++

// ============================================
// 总结
// ============================================
console.log('\n========================================')
console.log('测试总结')
console.log('========================================')
console.log(`总测试数: ${totalTests}`)
console.log(`通过: ${passedTests}`)
console.log(`失败: ${totalTests - passedTests}`)
console.log(`通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`)

console.log('\n========================================')
console.log('问题严重性评估')
console.log('========================================')

if (passedTests < totalTests) {
    const failedCount = totalTests - passedTests
    console.log(`⚠️  发现 ${failedCount} 个前瞻检查问题`)
    console.log('')
    console.log('严重性分类：')
    console.log('  🔴 ExpressionStatement: 严重（影响Statement规则解析）')
    console.log('  🟡 Identifier: 中等（保留字检查）')
    console.log('  🟡 ThrowStatement: 中等（换行符约束）')
    console.log('')
    console.log('建议修复方案：')
    console.log('  1. 在 SubhutiParser 中添加 markFailed() 方法')
    console.log('  2. 修改所有前瞻检查：')
    console.log('     if (检测到问题) {')
    console.log('         this.markFailed()')
    console.log('         return undefined')
    console.log('     }')
} else {
    console.log('✅ 所有前瞻检查正常工作')
}

console.log('========================================\n')

