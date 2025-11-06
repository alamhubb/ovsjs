/**
 * 测试尾随逗号问题
 * 验证哪些规则存在"更宽泛模式在前，更具体模式在后"的顺序问题
 */

import Es2025Parser from './slime/packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import { es2025Tokens } from './slime/packages/slime-parser/src/language/es2025/Es2025Tokens.ts'
import SubhutiLexer from './subhuti/src/SubhutiLexer.ts'

interface TestCase {
    name: string
    code: string
    shouldParseSuccessfully: boolean
    description: string
}

const testCases: TestCase[] = [
    // 1. ArrayLiteral
    {
        name: 'ArrayLiteral-without-comma',
        code: 'const x = [1, 2]',
        shouldParseSuccessfully: true,
        description: '数组字面量（无尾随逗号）'
    },
    {
        name: 'ArrayLiteral-with-comma',
        code: 'const x = [1, 2,]',
        shouldParseSuccessfully: true,
        description: '数组字面量（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 2. ObjectLiteral
    {
        name: 'ObjectLiteral-without-comma',
        code: 'const x = {a: 1, b: 2}',
        shouldParseSuccessfully: true,
        description: '对象字面量（无尾随逗号）'
    },
    {
        name: 'ObjectLiteral-with-comma',
        code: 'const x = {a: 1, b: 2,}',
        shouldParseSuccessfully: true,
        description: '对象字面量（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 3. Arguments
    {
        name: 'Arguments-without-comma',
        code: 'func(a, b)',
        shouldParseSuccessfully: true,
        description: '函数参数（无尾随逗号）'
    },
    {
        name: 'Arguments-with-comma',
        code: 'func(a, b,)',
        shouldParseSuccessfully: true,
        description: '函数参数（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 4. ObjectBindingPattern
    {
        name: 'ObjectBindingPattern-without-comma',
        code: 'const {a, b} = obj',
        shouldParseSuccessfully: true,
        description: '对象解构绑定（无尾随逗号）'
    },
    {
        name: 'ObjectBindingPattern-with-comma',
        code: 'const {a, b,} = obj',
        shouldParseSuccessfully: true,
        description: '对象解构绑定（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 5. ArrayBindingPattern
    {
        name: 'ArrayBindingPattern-without-comma',
        code: 'const [a, b] = arr',
        shouldParseSuccessfully: true,
        description: '数组解构绑定（无尾随逗号）'
    },
    {
        name: 'ArrayBindingPattern-with-comma',
        code: 'const [a, b,] = arr',
        shouldParseSuccessfully: true,
        description: '数组解构绑定（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 6. NamedImports
    {
        name: 'NamedImports-without-comma',
        code: 'import {a, b} from "mod"',
        shouldParseSuccessfully: true,
        description: '命名导入（无尾随逗号）'
    },
    {
        name: 'NamedImports-with-comma',
        code: 'import {a, b,} from "mod"',
        shouldParseSuccessfully: true,
        description: '命名导入（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 7. NamedExports
    {
        name: 'NamedExports-without-comma',
        code: 'export {a, b}',
        shouldParseSuccessfully: true,
        description: '命名导出（无尾随逗号）'
    },
    {
        name: 'NamedExports-with-comma',
        code: 'export {a, b,}',
        shouldParseSuccessfully: true,
        description: '命名导出（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 8. ObjectAssignmentPattern (在赋值中)
    {
        name: 'ObjectAssignmentPattern-without-comma',
        code: '({a, b} = obj)',
        shouldParseSuccessfully: true,
        description: '对象赋值解构（无尾随逗号）'
    },
    {
        name: 'ObjectAssignmentPattern-with-comma',
        code: '({a, b,} = obj)',
        shouldParseSuccessfully: true,
        description: '对象赋值解构（有尾随逗号）- 如果解析失败说明顺序有问题'
    },

    // 9. ArrayAssignmentPattern (在赋值中)
    {
        name: 'ArrayAssignmentPattern-without-comma',
        code: '([a, b] = arr)',
        shouldParseSuccessfully: true,
        description: '数组赋值解构（无尾随逗号）'
    },
    {
        name: 'ArrayAssignmentPattern-with-comma',
        code: '([a, b,] = arr)',
        shouldParseSuccessfully: true,
        description: '数组赋值解构（有尾随逗号）- 如果解析失败说明顺序有问题'
    },
]

console.log('🔍 开始测试尾随逗号问题...\n')

let totalTests = 0
let passedTests = 0
let failedTests = 0
const problemCases: string[] = []

for (const testCase of testCases) {
    totalTests++
    
    try {
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(testCase.code)
        const parser = new Es2025Parser(tokens)
        const result = parser.Module()
        
        const success = result !== undefined
        
        if (success === testCase.shouldParseSuccessfully) {
            passedTests++
            console.log(`✅ ${testCase.name}`)
            console.log(`   ${testCase.description}`)
        } else {
            failedTests++
            console.log(`❌ ${testCase.name}`)
            console.log(`   ${testCase.description}`)
            console.log(`   期望: ${testCase.shouldParseSuccessfully ? '成功' : '失败'}, 实际: ${success ? '成功' : '失败'}`)
            
            // 如果是带尾随逗号的测试失败，说明存在问题
            if (testCase.name.includes('with-comma') && !success) {
                problemCases.push(testCase.name.split('-')[0])
            }
        }
    } catch (error) {
        failedTests++
        console.log(`❌ ${testCase.name} - 抛出异常`)
        console.log(`   ${testCase.description}`)
        console.log(`   错误: ${error instanceof Error ? error.message : String(error)}`)
        
        if (testCase.name.includes('with-comma')) {
            problemCases.push(testCase.name.split('-')[0])
        }
    }
    
    console.log()
}

console.log('='.repeat(60))
console.log(`测试结果: ${passedTests}/${totalTests} 通过`)
console.log(`失败数量: ${failedTests}`)

if (problemCases.length > 0) {
    console.log('\n⚠️  发现以下规则存在顺序问题（尾随逗号无法解析）:')
    const uniqueProblems = [...new Set(problemCases)]
    uniqueProblems.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`)
    })
    console.log('\n这些规则需要修复：将更具体的模式（带逗号）放在更宽泛模式（不带逗号）之前')
} else {
    console.log('\n✨ 所有测试通过！没有发现顺序问题。')
}





