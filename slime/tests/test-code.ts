/**
 * Es2025Parser 调试测试工具（v2.0 - 使用 SubhutiDebugUtils）
 *
 * 用法：
 *   1. 直接运行：npx tsx tests/test-code.ts
 *   2. 传入代码：npx tsx tests/test-code.ts "let a = 1"
 *   3. 指定入口规则：npx tsx tests/test-code.ts "let a = 1" "Script"
 *
 * 功能：
 *   - MWE：测试最小可工作示例
 *   - 二分增量调试：使用 SubhutiDebugUtils.bisectDebug
 *   - 完整调试输出：使用 SubhutiDebug 追踪器
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { SubhutiDebugUtils } from 'subhuti/src/SubhutiDebug.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

// ============================================
// Es2025Parser 特定的测试层级配置
// ============================================

const ES2025_TEST_LEVELS = [
    { name: 'LexicalDeclaration', call: (p: any) => p.LexicalDeclaration({ In: true }) },
    { name: 'Declaration', call: (p: any) => p.Declaration() },
    { name: 'StatementListItem', call: (p: any) => p.StatementListItem() },
    { name: 'StatementList', call: (p: any) => p.StatementList() },
    { name: 'Script', call: (p: any) => p.Script() },
]

// ============================================
// 普通测试函数
// ============================================

function testCode(code: string, entryRule: string = 'Script') {
    console.log('🔍 Es2025Parser 调试测试')
    console.log('='.repeat(80))
    console.log(`📝 代码: ${code}`)
    console.log(`📐 入口规则: ${entryRule}`)
    console.log('='.repeat(80))

    try {
        // 步骤1: 词法分析
        console.log('\n📋 步骤1: 词法分析')
        console.log('-'.repeat(80))
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)

        console.log(`✅ 词法分析成功: ${tokens.length} tokens`)
        
        // 显示 tokens
        console.log('\nTokens:')
        tokens.forEach((t: any, i: number) => {
            const tokenName = t.tokenName || 'Unknown'
            console.log(`  [${i}] ${tokenName}: "${t.tokenValue}"`)
        })

        // 步骤2: 语法分析（启用 debug）
        console.log(`\n📋 步骤2: 语法分析（启用 SubhutiDebug）`)
        console.log('-'.repeat(80))
        console.log('注意：以下输出由 SubhutiDebug 自动生成\n')
        
        const parser = new Es2025Parser(tokens).debug()

        // 调用指定的入口规则
        let cst: any
        const method = (parser as any)[entryRule]
        if (typeof method === 'function') {
            cst = method.call(parser)
        } else {
            throw new Error(`未知的入口规则: ${entryRule}`)
        }

        console.log('\n✅ 语法分析成功！')

    } catch (error: any) {
        console.log('\n' + '='.repeat(80))
        console.log('❌ 测试失败')
        console.log('='.repeat(80))
        console.log(`错误信息: ${error.message}`)

        if (error.stack) {
            console.log(`\n堆栈跟踪（前15行）:`)
            const stackLines = error.stack.split('\n').slice(0, 15)
            stackLines.forEach((line: string) => console.log(`  ${line}`))
        }

        process.exit(1)
    }
}

// ============================================
// 主程序
// ============================================

const code = process.argv[2] || `let a = 1`
// const code = process.argv[2] || `const obj = { sum: 5 + 6 }`
const mode = process.argv[3] || 'bisect' // 默认使用二分调试模式

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

if (mode === 'bisect') {
    // 二分增量调试模式（使用 SubhutiDebugUtils）
    console.log('🔍 Es2025Parser MWE + 二分增量调试')
    console.log('='.repeat(80))
    console.log(`📝 代码: ${code}`)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)
    
    // 调用 SubhutiDebugUtils.bisectDebug
    SubhutiDebugUtils.bisectDebug(tokens, Es2025Parser, ES2025_TEST_LEVELS)
} else {
    // 普通测试模式（支持指定入口规则）
    testCode(code, mode)
}

