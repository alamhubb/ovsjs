/**
 * OVS 测试套件 - 统一入口
 * 运行所有类型的测试：单元测试 + 集成测试 + 回归测试 + 用例验证
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🧪 OVS Test Suite')
console.log('='.repeat(70))
console.log('')

interface TestStats {
    total: number
    passed: number
    failed: number
    duration: number
}

const stats: TestStats = {
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0
}

/**
 * 运行自动化测试（TypeScript测试文件）
 */
async function runAutomatedTests() {
    console.log('📦 Part 1: Automated Tests (TypeScript)\n')
    
    const testTypes = ['unit', 'integration', 'regression']
    
    for (const type of testTypes) {
        console.log(`\n📂 Running ${type} tests...`)
        
        try {
            // 动态导入run-tests.ts并执行
            const { runTestsInDirectory, printResults } = await import('./run-tests.js')
            await runTestsInDirectory(path.join(__dirname, type))
            
            const results = printResults()
            stats.total += results.total
            stats.passed += results.passed
            stats.failed += results.failed
            stats.duration += results.duration
        } catch (error) {
            console.error(`❌ Failed to run ${type} tests:`, error.message)
        }
    }
}

/**
 * 验证.ovs用例文件
 */
async function validateOvsCases() {
    console.log('\n' + '='.repeat(70))
    console.log('📦 Part 2: OVS Cases Validation\n')
    
    const { vitePluginOvsTransform } = await import('../src/index.js')
    
    const casesDir = path.join(__dirname, 'cases')
    const categories = fs.readdirSync(casesDir, { withFileTypes: true })
        .filter(item => item.isDirectory())
    
    for (const category of categories) {
        console.log(`\n📂 ${category.name}/`)
        
        const categoryPath = path.join(casesDir, category.name)
        const files = fs.readdirSync(categoryPath)
            .filter(f => f.endsWith('.ovs'))
        
        for (const file of files) {
            const filePath = path.join(categoryPath, file)
            const code = fs.readFileSync(filePath, 'utf-8')
            
            const startTime = Date.now()
            
            try {
                await vitePluginOvsTransform(code, file, false)
                const duration = Date.now() - startTime
                console.log(`  ✅ ${file.padEnd(25)} (${duration}ms)`)
                stats.total++
                stats.passed++
                stats.duration += duration
            } catch (error) {
                const duration = Date.now() - startTime
                console.log(`  ❌ ${file.padEnd(25)} (${duration}ms)`)
                console.log(`     Error: ${error.message}`)
                stats.total++
                stats.failed++
                stats.duration += duration
            }
        }
    }
}

/**
 * 打印总体统计
 */
function printSummary() {
    console.log('\n' + '='.repeat(70))
    console.log('📊 Overall Summary')
    console.log('='.repeat(70))
    console.log(`Total Tests:    ${stats.total}`)
    console.log(`✅ Passed:      ${stats.passed} (${(stats.passed / stats.total * 100).toFixed(1)}%)`)
    console.log(`❌ Failed:      ${stats.failed}`)
    console.log(`⏱️  Duration:    ${(stats.duration / 1000).toFixed(2)}s`)
    console.log('='.repeat(70))
    
    if (stats.failed === 0) {
        console.log('\n🎉 All tests passed!')
    } else {
        console.log(`\n⚠️  ${stats.failed} test(s) failed`)
    }
}

/**
 * 主函数
 */
async function main() {
    const startTime = Date.now()
    
    try {
        // Part 1: 自动化测试
        await runAutomatedTests()
        
        // Part 2: .ovs用例验证
        await validateOvsCases()
        
        // 打印总结
        stats.duration = Date.now() - startTime
        printSummary()
        
        process.exit(stats.failed === 0 ? 0 : 1)
    } catch (error) {
        console.error('\n❌ Test suite failed:', error)
        process.exit(1)
    }
}

main()
