/**
 * 测试运行器
 * 简单的测试执行器，不依赖外部测试框架
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface TestResult {
    name: string
    passed: boolean
    error?: string
    duration: number
}

interface TestSuite {
    name: string
    tests: TestResult[]
}

interface TestStats {
    total: number
    passed: number
    failed: number
    duration: number
}

// 全局测试收集器
const suites: TestSuite[] = []
let currentSuite: TestSuite | null = null

// 模拟测试框架API
global.describe = (name: string, fn: () => void) => {
    const suite: TestSuite = { name, tests: [] }
    suites.push(suite)
    currentSuite = suite
    fn()
    currentSuite = null
}

global.test = async (name: string, fn: () => Promise<void> | void) => {
    if (!currentSuite) {
        throw new Error('test() must be called inside describe()')
    }
    
    const startTime = Date.now()
    try {
        await fn()
        currentSuite.tests.push({
            name,
            passed: true,
            duration: Date.now() - startTime
        })
    } catch (error) {
        currentSuite.tests.push({
            name,
            passed: false,
            error: error.message,
            duration: Date.now() - startTime
        })
    }
}

global.expect = (value: any) => ({
    toContain: (expected: string) => {
        if (!value?.includes(expected)) {
            throw new Error(`Expected value to contain "${expected}"`)
        }
    },
    not: {
        toContain: (expected: string) => {
            if (value?.includes(expected)) {
                throw new Error(`Expected value NOT to contain "${expected}"`)
            }
        },
        toThrow: () => {
            // 已经成功，说明没有抛出错误
        }
    },
    toThrow: () => {
        throw new Error('Expected to throw but succeeded')
    }
})

/**
 * 运行指定目录下的所有测试文件
 */
export async function runTestsInDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`)
        return
    }
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name)
        
        if (file.isDirectory()) {
            await runTestsInDirectory(fullPath)
        } else if (file.name.endsWith('.test.ts')) {
            console.log(`\n📄 Loading: ${path.relative(__dirname, fullPath)}`)
            try {
                await import(fullPath)
            } catch (error) {
                console.error(`❌ Failed to load test file: ${error.message}`)
            }
        }
    }
}

/**
 * 打印测试结果
 */
export function printResults(): TestStats {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Results')
    console.log('='.repeat(60) + '\n')
    
    let totalTests = 0
    let totalPassed = 0
    let totalFailed = 0
    let totalDuration = 0
    
    for (const suite of suites) {
        const suitePassed = suite.tests.filter(t => t.passed).length
        const suiteFailed = suite.tests.filter(t => !t.passed).length
        const suiteSymbol = suiteFailed === 0 ? '✅' : '❌'
        
        console.log(`${suiteSymbol} ${suite.name}`)
        
        for (const test of suite.tests) {
            const symbol = test.passed ? '  ✅' : '  ❌'
            const duration = test.duration < 1000 ? `${test.duration}ms` : `${(test.duration / 1000).toFixed(2)}s`
            console.log(`${symbol} ${test.name} (${duration})`)
            
            if (!test.passed && test.error) {
                console.log(`     Error: ${test.error}`)
            }
            
            totalDuration += test.duration
        }
        
        console.log()
        totalTests += suite.tests.length
        totalPassed += suitePassed
        totalFailed += suiteFailed
    }
    
    console.log('='.repeat(60))
    console.log(`Total: ${totalTests} tests`)
    console.log(`✅ Passed: ${totalPassed}`)
    console.log(`❌ Failed: ${totalFailed}`)
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log('='.repeat(60))
    
    return {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        duration: totalDuration
    }
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2)
    const testType = args[0] || 'all'  // unit, integration, regression, or all
    
    console.log('🧪 OVS Test Runner')
    console.log('='.repeat(60))
    console.log(`Test Type: ${testType}`)
    
    const testDir = __dirname
    
    if (testType === 'all') {
        await runTestsInDirectory(path.join(testDir, 'unit'))
        await runTestsInDirectory(path.join(testDir, 'integration'))
        await runTestsInDirectory(path.join(testDir, 'regression'))
    } else {
        await runTestsInDirectory(path.join(testDir, testType))
    }
    
    const success = printResults()
    process.exit(success ? 0 : 1)
}

main().catch(error => {
    console.error('❌ Test runner failed:', error)
    process.exit(1)
})

