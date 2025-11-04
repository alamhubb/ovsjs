/**
 * SubhutiParser 调试命令行工具
 * 
 * 用法：
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}"
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}" --mode=timeline
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}" --mode=or-branches
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}" --mode=token-compare
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}" --mode=full
 *   npx tsx subhuti-debug-cli.ts "const x = {async: 37}" --highlight=PropertyDefinition
 * 
 * 可用选项：
 *   --mode=<mode>          显示模式：timeline | or-branches | token-compare | full
 *   --highlight=<rules>    高亮特定规则（逗号分隔）
 *   --max-depth=<number>   最大显示深度
 *   --show-timestamps      显示时间戳
 */

import { SubhutiParserDebugger } from "../debugger/SubhutiParserDebugger.ts"
import { SubhutiVisualizer } from "../debugger/SubhutiVisualizer.ts"
import { ErrorDiagnoser } from "../error/ErrorDiagnoser.ts"
import { ErrorFormatter } from "../error/ErrorFormatter.ts"

// 导入实际的 Parser（这里需要根据项目调整）
import Es2020Parser from "../../../slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import { es2020Tokens } from "../../../slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from "../SubhutiLexer.ts"

/**
 * 命令行参数
 */
interface CLIArgs {
    code: string
    mode: 'timeline' | 'or-branches' | 'token-compare' | 'full'
    highlightRules: string[]
    maxDepth: number
    showTimestamps: boolean
    showTokenIndex: boolean
}

/**
 * 解析命令行参数
 */
function parseArgs(): CLIArgs {
    const args: CLIArgs = {
        code: process.argv[2] || 'const x = {async: 37}',
        mode: 'full',
        highlightRules: [],
        maxDepth: Infinity,
        showTimestamps: false,
        showTokenIndex: true
    }
    
    for (let i = 3; i < process.argv.length; i++) {
        const arg = process.argv[i]
        
        if (arg.startsWith('--mode=')) {
            const mode = arg.split('=')[1]
            if (['timeline', 'or-branches', 'token-compare', 'full'].includes(mode)) {
                args.mode = mode as any
            }
        } else if (arg.startsWith('--highlight=')) {
            args.highlightRules = arg.split('=')[1].split(',')
        } else if (arg.startsWith('--max-depth=')) {
            args.maxDepth = parseInt(arg.split('=')[1])
        } else if (arg === '--show-timestamps') {
            args.showTimestamps = true
        } else if (arg === '--no-token-index') {
            args.showTokenIndex = false
        }
    }
    
    return args
}

/**
 * 主函数
 */
function main() {
    const args = parseArgs()
    
    console.log('═'.repeat(80))
    console.log('🔍 SubhutiParser 调试工具')
    console.log('═'.repeat(80))
    console.log(`输入代码: ${args.code}`)
    console.log(`显示模式: ${args.mode}`)
    if (args.highlightRules.length > 0) {
        console.log(`高亮规则: ${args.highlightRules.join(', ')}`)
    }
    console.log('═'.repeat(80))
    console.log('')
    
    try {
        // 词法分析
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.tokenize(args.code)
        
        console.log(`✅ 词法分析成功: ${tokens.length} tokens`)
        console.log('')
        
        // 使用调试装饰器
        const debugParser = SubhutiParserDebugger.create(Es2020Parser, tokens)
        
        // 开始调试
        debugParser.start()
        
        // 解析
        const cst = debugParser.Program()
        
        // 结束调试
        debugParser.end()
        
        // 获取调试数据
        const data = debugParser.getData()
        
        // 生成报告
        const report = SubhutiVisualizer.generateReport(data, tokens, cst, {
            mode: args.mode,
            highlightRules: args.highlightRules,
            maxDepth: args.maxDepth,
            showTimestamps: args.showTimestamps,
            showTokenIndex: args.showTokenIndex
        })
        
        console.log(report)
        
        // 简洁报告
        const shortReport = SubhutiVisualizer.generateShortReport(data, tokens, cst)
        console.log('')
        console.log('─'.repeat(80))
        console.log(shortReport)
        console.log('─'.repeat(80))
        
    } catch (error: any) {
        console.log('')
        console.log('❌ 解析失败')
        console.log('═'.repeat(80))
        
        // 如果是 ParsingError，使用诊断工具
        if (error.name === 'ParsingError') {
            // 格式化错误
            const formatter = new ErrorFormatter()
            console.log(formatter.format(error, 'rust'))
            console.log('')
            
            // 智能诊断
            const diagnoser = new ErrorDiagnoser()
            const diagnosis = diagnoser.diagnose(error)
            
            console.log('🔍 智能诊断')
            console.log('─'.repeat(80))
            console.log(`严重程度: ${diagnosis.severity}`)
            console.log('')
            
            if (diagnosis.suggestions.length > 0) {
                console.log('💡 建议:')
                diagnosis.suggestions.forEach(s => console.log(`  ${s}`))
                console.log('')
            }
            
            if (diagnosis.possibleFixes.length > 0) {
                console.log('🔧 可能的修复:')
                diagnosis.possibleFixes.forEach((fix, i) => {
                    console.log(`  ${i + 1}. ${fix}`)
                })
            }
        } else {
            // 其他错误
            console.log(error.message)
            if (error.stack) {
                console.log('')
                console.log('堆栈跟踪:')
                console.log(error.stack.split('\n').slice(0, 5).join('\n'))
            }
        }
    }
    
    // 使用提示
    console.log('')
    console.log('💡 使用提示')
    console.log('─'.repeat(80))
    console.log('  --mode=timeline       显示规则执行时间线')
    console.log('  --mode=or-branches    显示 Or 分支选择')
    console.log('  --mode=token-compare  显示 Token 对比')
    console.log('  --mode=full           显示完整报告 [默认]')
    console.log('  --highlight=规则      高亮特定规则（逗号分隔）')
    console.log('  --max-depth=数字      限制显示深度')
    console.log('  --show-timestamps     显示时间戳')
    console.log('  --no-token-index      隐藏 token 索引')
    console.log('')
    console.log('示例:')
    console.log('  npx tsx subhuti-debug-cli.ts "const x = 1"')
    console.log('  npx tsx subhuti-debug-cli.ts "const x = 1" --mode=timeline')
    console.log('  npx tsx subhuti-debug-cli.ts "obj.prop" --highlight=MemberExpression')
}

// 只有作为命令行工具运行时才执行
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    main()
}

export { main }



