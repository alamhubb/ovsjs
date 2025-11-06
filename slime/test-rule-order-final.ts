/**
 * 最终测试：验证所有规则顺序修复
 */

import Es2025Parser from "./packages/slime-parser/src/language/es2025/Es2025Parser.ts"
import SubhutiLexer from "subhuti/src/SubhutiLexer.ts"
import { es2025Tokens } from "./packages/slime-parser/src/language/es2025/Es2025Tokens.ts"

function testParse(code: string, ruleName: string, description: string) {
    try {
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)
        
        const parser = new Es2025Parser(tokens)
        const ast = (parser as any)[ruleName]()
        
        if (ast) {
            console.log(`✅ ${description}`)
            return true
        } else {
            console.log(`❌ ${description} - 解析失败`)
            return false
        }
    } catch (e: any) {
        console.log(`❌ ${description} - 异常: ${e.message || e}`)
        return false
    }
}

console.log('\n========================================')
console.log('规则顺序问题检查 - 最终报告')
console.log('========================================\n')

let passedTests = 0
let totalTests = 0

// 测试1: HoistableDeclaration - async function* 顺序
console.log('【测试1】HoistableDeclaration 规则顺序')
console.log('问题：AsyncFunctionDeclaration 在前，AsyncGeneratorDeclaration 在后')
console.log('修复：将 AsyncGeneratorDeclaration 移到 AsyncFunctionDeclaration 之前\n')

totalTests++
if (testParse('async function foo() {}', 'HoistableDeclaration', 'async function')) passedTests++
totalTests++
if (testParse('async function* bar() {}', 'HoistableDeclaration', 'async function* (具体规则)')) passedTests++

// 测试2: PrimaryExpression - async function* 顺序
console.log('\n【测试2】PrimaryExpression 规则顺序')
console.log('问题：AsyncFunctionExpression 在前，AsyncGeneratorExpression 在后')
console.log('修复：将 AsyncGeneratorExpression 移到 AsyncFunctionExpression 之前\n')

totalTests++
if (testParse('(async function() {})', 'PrimaryExpression', 'async function expression')) passedTests++
totalTests++
if (testParse('(async function*() {})', 'PrimaryExpression', 'async function* expression (具体规则)')) passedTests++

// 测试3: 其他Expression规则 - 确认顺序正确
console.log('\n【测试3】其他 Or 规则顺序检查')
console.log('验证：其他规则是否存在类似问题\n')

totalTests++
if (testParse('function foo() {}', 'HoistableDeclaration', 'function declaration')) passedTests++
totalTests++
if (testParse('function* gen() {}', 'HoistableDeclaration', 'generator declaration')) passedTests++

// 测试4: MethodDefinition - 确认顺序正确
console.log('\n【测试4】MethodDefinition 规则顺序')
console.log('验证：AsyncGeneratorMethod 在 AsyncMethod 之前（已正确）\n')

totalTests++
if (testParse('class C { async foo() {} }', 'ClassDeclaration', 'async method')) passedTests++
totalTests++
if (testParse('class C { async* bar() {} }', 'ClassDeclaration', 'async generator method')) passedTests++

// 总结
console.log('\n========================================')
console.log('测试总结')
console.log('========================================')
console.log(`总测试数: ${totalTests}`)
console.log(`通过: ${passedTests}`)
console.log(`失败: ${totalTests - passedTests}`)
console.log(`通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`)

if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！规则顺序问题已修复。')
} else {
    console.log('\n⚠️ 部分测试失败，请检查问题。')
}

console.log('\n========================================')
console.log('发现的问题总结')
console.log('========================================')
console.log('1. HoistableDeclaration: AsyncGeneratorDeclaration 被 AsyncFunctionDeclaration 遮蔽')
console.log('   - 修复：调整顺序，具体规则在前')
console.log('')
console.log('2. PrimaryExpression: AsyncGeneratorExpression 被 AsyncFunctionExpression 遮蔽')
console.log('   - 修复：调整顺序，具体规则在前')
console.log('')
console.log('3. MethodDefinition: 顺序已正确（AsyncGeneratorMethod 在 AsyncMethod 之前）')
console.log('')
console.log('核心原则：在 PEG 解析器中，具体规则必须在宽泛规则之前')
console.log('          否则宽泛规则会匹配具体规则的前缀，导致具体规则永远无法匹配')
console.log('========================================\n')

