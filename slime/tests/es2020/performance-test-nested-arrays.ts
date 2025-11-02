/**
 * 性能测试：嵌套数组解构
 * 验证 ExponentiationExpression 优化效果
 */

import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

interface TestCase {
    name: string
    code: string
    expectedTime: number  // 预期时间（毫秒）
}

const testCases: TestCase[] = [
    {
        name: "单层数组",
        code: "const [a] = [1]",
        expectedTime: 50
    },
    {
        name: "双层嵌套",
        code: "const [[a]] = [[1]]",
        expectedTime: 100
    },
    {
        name: "三层嵌套",
        code: "const [[[deep]]] = [[[1]]]",
        expectedTime: 200
    },
    {
        name: "四层嵌套",
        code: "const [[[[very_deep]]]] = [[[[1]]]]",
        expectedTime: 400
    },
    {
        name: "幂运算（验证功能）",
        code: "const x = 2 ** 3 ** 2",
        expectedTime: 50
    },
    {
        name: "混合：嵌套 + 幂运算",
        code: "const [a] = [2 ** 3]",
        expectedTime: 100
    }
]

function measureParseTime(code: string): number {
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    const startTime = performance.now()
    const parser = new Es2020Parser(tokens)
    const cst = parser.Program()
    const endTime = performance.now()
    
    if (!cst) {
        throw new Error("解析失败")
    }
    
    return endTime - startTime
}

function runPerformanceTests() {
    console.log("🚀 ExponentiationExpression 性能测试\n")
    console.log("=" .repeat(70))
    
    let totalTests = 0
    let passedTests = 0
    
    for (const testCase of testCases) {
        totalTests++
        
        try {
            // 预热（避免 JIT 影响）
            for (let i = 0; i < 3; i++) {
                measureParseTime(testCase.code)
            }
            
            // 正式测试（取3次平均值）
            const times: number[] = []
            for (let i = 0; i < 3; i++) {
                times.push(measureParseTime(testCase.code))
            }
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length
            
            const status = avgTime <= testCase.expectedTime ? "✅ PASS" : "⚠️  SLOW"
            const speedRatio = (avgTime / testCase.expectedTime * 100).toFixed(0)
            
            console.log(`\n${status} ${testCase.name}`)
            console.log(`  代码: ${testCase.code}`)
            console.log(`  实际耗时: ${avgTime.toFixed(2)}ms`)
            console.log(`  预期耗时: ${testCase.expectedTime}ms`)
            console.log(`  速度比: ${speedRatio}%`)
            
            if (avgTime <= testCase.expectedTime) {
                passedTests++
            }
            
        } catch (error) {
            console.log(`\n❌ FAIL ${testCase.name}`)
            console.log(`  错误: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
    
    console.log("\n" + "=".repeat(70))
    console.log(`\n📊 总结: ${passedTests}/${totalTests} 测试通过 (${(passedTests/totalTests*100).toFixed(0)}%)`)
    
    if (passedTests === totalTests) {
        console.log("🎉 所有性能测试通过！")
    } else {
        console.log("⚠️  部分测试超出预期时间，可能需要进一步优化")
    }
}

// 运行测试
runPerformanceTests()

