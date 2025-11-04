/**
 * SubhutiParser 调试功能简单测试
 * 
 * 用法：
 *   npx tsx test-debug-simple.ts
 */

import Es2020Parser from "../slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import { es2020Tokens } from "../slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from "./src/SubhutiLexer.ts"
import { SubhutiVisualizer } from "./src/debugger/SubhutiVisualizer.ts"

// 测试代码
const testCases = [
    { code: 'const x = 1', desc: '简单变量声明' },
    { code: 'const obj = {a: 1}', desc: '对象字面量' },
    { code: 'const arr = [1, 2, 3]', desc: '数组字面量' },
    { code: 'function test() { return 1 }', desc: '函数声明' },
]

console.log('═'.repeat(80))
console.log('🧪 SubhutiParser 调试功能测试')
console.log('═'.repeat(80))
console.log('')

for (const testCase of testCases) {
    console.log(`📝 测试: ${testCase.desc}`)
    console.log(`代码: ${testCase.code}`)
    console.log('─'.repeat(80))
    
    try {
        // 词法分析
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.tokenize(testCase.code)
        
        // 方式1：不调试（正常模式）
        console.log('\n🔹 正常模式（不调试）:')
        const parser1 = new Es2020Parser(tokens)
        const cst1 = parser1.Program()
        console.log(`  结果: ${cst1 ? '✅ 成功' : '❌ 失败'}`)
        const data1 = parser1.getDebugData()
        console.log(`  调试数据: ${data1 ? '有数据（不应该）' : '无数据（正确）'}`)
        
        // 方式2：调试模式
        console.log('\n🔹 调试模式:')
        const parser2 = new Es2020Parser(tokens).debug()  // ← 开启调试
        const cst2 = parser2.Program()
        const data2 = parser2.getDebugData()
        
        if (data2) {
            console.log(`  结果: ${cst2 ? '✅ 成功' : '❌ 失败'}`)
            console.log(`  规则执行数: ${data2.ruleExecutions.length / 2}`)
            console.log(`  Or分支数: ${data2.orBranches.length}`)
            console.log(`  Token消费数: ${data2.tokenConsumes.length}`)
            console.log(`  解析耗时: ${(data2.endTime - data2.startTime).toFixed(2)}ms`)
            
            // 生成简洁报告
            const shortReport = SubhutiVisualizer.generateShortReport(data2, tokens, cst2)
            console.log(`\n  ${shortReport}`)
        } else {
            console.log('  ❌ 未能获取调试数据')
        }
        
    } catch (error: any) {
        console.log(`  ❌ 错误: ${error.message}`)
    }
    
    console.log('')
    console.log('═'.repeat(80))
    console.log('')
}

console.log('✅ 测试完成！')
console.log('')
console.log('💡 提示：')
console.log('  1. 不调试时：parser.getDebugData() 返回 null')
console.log('  2. 调试时：parser.debug().Program() 收集数据')
console.log('  3. 使用 SubhutiVisualizer 可以格式化输出')
console.log('')










