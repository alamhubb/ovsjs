/**
 * SubhutiParser 调试报告生成测试
 * 
 * 用法：
 *   npx tsx test-debug-report.ts
 *   npx tsx test-debug-report.ts --mode=timeline
 *   npx tsx test-debug-report.ts --mode=or-branches
 */

import Es2020Parser from "../slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import { es2020Tokens } from "../slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from "./src/parser/SubhutiLexer.ts"
import { SubhutiVisualizer } from "./src/debugger/SubhutiVisualizer.ts"

// 解析命令行参数
const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] as any || 'full'
const maxDepth = parseInt(process.argv.find(arg => arg.startsWith('--max-depth='))?.split('=')[1] || '3')
const showTimestamps = process.argv.includes('--show-timestamps')

// 测试代码
const code = 'const obj = {null: 41, a: 1}'

console.log('═'.repeat(80))
console.log('📊 SubhutiParser 调试报告生成测试')
console.log('═'.repeat(80))
console.log(`代码: ${code}`)
console.log(`模式: ${mode}`)
console.log(`最大深度: ${maxDepth}`)
console.log(`显示时间戳: ${showTimestamps}`)
console.log('═'.repeat(80))
console.log('')

try {
    // 词法分析
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.tokenize(code)
    
    // 调试模式解析
    const parser = new Es2020Parser(tokens).debug()
    const cst = parser.Program()
    const data = parser.getDebugData()
    
    if (data) {
        // 生成报告
        const report = SubhutiVisualizer.generateReport(data, tokens, cst, {
            mode,
            maxDepth,
            showTimestamps,
            showTokenIndex: true,
            highlightRules: ['PropertyDefinition', 'LiteralPropertyName']
        })
        
        console.log(report)
    } else {
        console.log('❌ 未能获取调试数据')
    }
    
} catch (error: any) {
    console.log('❌ 解析失败')
    console.log(error.message)
    if (error.stack) {
        console.log('')
        console.log('堆栈:')
        console.log(error.stack.split('\n').slice(0, 5).join('\n'))
    }
}

console.log('')
console.log('💡 可用选项:')
console.log('  --mode=timeline       只显示时间线')
console.log('  --mode=or-branches    只显示 Or 分支')
console.log('  --mode=token-compare  只显示 Token 对比')
console.log('  --mode=full           显示完整报告 [默认]')
console.log('  --max-depth=N         限制时间线深度 [默认: 3]')
console.log('  --show-timestamps     显示时间戳')
console.log('')


