// ES2020 完整测试套件运行器
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface TestResult {
    name: string
    file: string
    success: boolean
    duration: number
    tokenCount?: number
    error?: string
}

function runTest(filePath: string, testName: string): TestResult {
    const startTime = Date.now()
    
    try {
        // 读取测试文件
        const code = readFileSync(filePath, 'utf-8')
        
        // 词法分析
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        
        // 语法分析
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        const duration = Date.now() - startTime
        
        return {
            name: testName,
            file: filePath,
            success: true,
            duration,
            tokenCount: tokens.length
        }
    } catch (error: any) {
        const duration = Date.now() - startTime
        
        return {
            name: testName,
            file: filePath,
            success: false,
            duration,
            error: error.message
        }
    }
}

function main() {
    console.log('\n' + '='.repeat(70))
    console.log('🧪 ES2020 完整测试套件')
    console.log('='.repeat(70))
    
    const tests = [
        { name: 'Nullish Coalescing (??)', file: '01-nullish-coalescing.js' },
        { name: 'Optional Chaining (?.)', file: '02-optional-chaining.js' },
        { name: 'BigInt', file: '03-bigint.js' },
        { name: 'Exponentiation (**)', file: '04-exponentiation.js' },
        { name: 'Dynamic Import', file: '05-dynamic-import.js' },
        { name: 'Comprehensive Test', file: '06-comprehensive.js' },
    ]
    
    const results: TestResult[] = []
    
    console.log('\n📋 运行测试...\n')
    
    for (const test of tests) {
        const filePath = resolve(__dirname, test.file)
        process.stdout.write(`  ${test.name.padEnd(30)} ... `)
        
        const result = runTest(filePath, test.name)
        results.push(result)
        
        if (result.success) {
            console.log(`✅ PASS (${result.duration}ms, ${result.tokenCount} tokens)`)
        } else {
            console.log(`❌ FAIL (${result.duration}ms)`)
            console.log(`     Error: ${result.error}`)
        }
    }
    
    // 统计
    console.log('\n' + '='.repeat(70))
    console.log('📊 测试统计')
    console.log('='.repeat(70))
    
    const passed = results.filter(r => r.success).length
    const failed = results.filter(r => r.success === false).length
    const total = results.length
    const passRate = ((passed / total) * 100).toFixed(1)
    
    console.log(`\n总计测试：  ${total}`)
    console.log(`✅ 通过：    ${passed}`)
    console.log(`❌ 失败：    ${failed}`)
    console.log(`📈 通过率：  ${passRate}%`)
    
    if (passed > 0) {
        const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
        const avgDuration = (totalDuration / results.length).toFixed(1)
        const totalTokens = results.reduce((sum, r) => sum + (r.tokenCount || 0), 0)
        
        console.log(`\n⏱️  总耗时：  ${totalDuration}ms`)
        console.log(`📊 平均耗时：${avgDuration}ms/测试`)
        console.log(`🔢 Token总数：${totalTokens}`)
    }
    
    // 失败详情
    if (failed > 0) {
        console.log('\n' + '='.repeat(70))
        console.log('❌ 失败详情')
        console.log('='.repeat(70))
        
        results.filter(r => !r.success).forEach(result => {
            console.log(`\n📁 ${result.name}`)
            console.log(`   文件: ${result.file}`)
            console.log(`   错误: ${result.error}`)
        })
    }
    
    // 总结
    console.log('\n' + '='.repeat(70))
    if (failed === 0) {
        console.log('🎉 所有测试通过！ES2020 Parser 工作正常！')
    } else {
        console.log(`⚠️  有 ${failed} 个测试失败，需要修复`)
    }
    console.log('='.repeat(70) + '\n')
    
    process.exit(failed === 0 ? 0 : 1)
}

main()









