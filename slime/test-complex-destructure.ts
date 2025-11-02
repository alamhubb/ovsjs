import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试复杂解构场景
const testCases = [
    // 1. 基础对象 rest（只有 rest，无其他属性）
    {
        name: "只有 rest 的对象解构",
        code: `const {...opts} = obj`
    },
    
    // 2. 对象 rest + 尾逗号
    {
        name: "对象 rest + 尾逗号",
        code: `const {a, ...rest,} = obj`
    },
    
    // 3. 函数参数：只有 rest 的对象解构
    {
        name: "函数参数：只有 rest",
        code: `function fn({...opts}) {}`
    },
    
    // 4. 函数参数：对象 rest + 默认值
    {
        name: "函数参数：对象 rest + 默认值",
        code: `function fn({...opts} = {}) {}`
    },
    
    // 5. 函数参数：重命名 + 只有 rest 的对象解构 + 默认值
    {
        name: "函数参数：重命名 + rest + 默认值",
        code: `function fn({options: {...opts} = {}}) {}`
    },
    
    // 6. 完整的复杂场景
    {
        name: "完整复杂场景",
        code: `function complex({ 
    user: { name = 'Guest', profile: { age = 0 } = {} } = {},
    options: { ...opts } = {}
}) {
    return { name, age, opts }
}`
    }
]

console.log('测试复杂解构场景\n')

testCases.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试 ${index + 1}: ${testCase.name}`)
    console.log(`代码: ${testCase.code}`)
    console.log('-'.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(testCase.code)
        
        console.log(`✓ 词法分析成功 (${tokens.length} tokens)`)
        
        const parser = new Es6Parser(tokens)
        const cst = parser.Program()
        
        console.log(`✓ 语法分析成功`)
        console.log(`CST name: ${cst.name}`)
        console.log(`CST children: ${cst.children?.length || 0}`)
        
    } catch (error: any) {
        console.log(`✗ 失败: ${error.message}`)
        if (error.message.includes('expect')) {
            console.log(`  位置信息: ${JSON.stringify(error.position || {})}`)
        }
    }
})

console.log(`\n${'='.repeat(60)}`)
console.log('测试完成')

