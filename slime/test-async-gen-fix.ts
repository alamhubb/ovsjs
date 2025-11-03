/**
 * 验证AsyncGeneratorMethod修复
 */
import Es2020Parser from './packages/slime-parser/src/language/es2020/Es2020Parser'
import {es2020Tokens} from './packages/slime-parser/src/language/es2020/Es2020Tokens'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer'

const testCases = [
    {
        name: '普通方法',
        code: 'class A { method() { return 1 } }'
    },
    {
        name: 'Async方法',
        code: 'class A { async method() { return 1 } }'
    },
    {
        name: 'Generator方法',
        code: 'class A { *method() { yield 1 } }'
    },
    {
        name: 'Async Generator方法',
        code: 'class A { async *method() { yield 1 } }'
    },
    {
        name: 'Getter',
        code: 'class A { get value() { return 1 } }'
    },
    {
        name: 'Setter',
        code: 'class A { set value(v) { this._value = v } }'
    }
]

console.log('🧪 测试AsyncGeneratorMethod修复\n')
console.log('=' .repeat(60))

let passed = 0
let failed = 0

for (const testCase of testCases) {
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(testCase.code)
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        console.log(`✅ ${testCase.name}: 通过`)
        passed++
    } catch (error: any) {
        console.log(`❌ ${testCase.name}: 失败`)
        console.log(`   错误: ${error.message}`)
        failed++
    }
}

console.log('=' .repeat(60))
console.log(`\n📊 测试结果: ${passed}/${testCases.length} 通过`)

if (failed > 0) {
    console.log(`❌ ${failed}个测试失败`)
    process.exit(1)
} else {
    console.log('🎉 所有测试通过！')
}

