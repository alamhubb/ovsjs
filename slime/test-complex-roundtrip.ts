import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

// 测试完整往返
const testCases = [
    {
        name: "只有 rest 的对象解构",
        code: `const {...opts} = obj`
    },
    {
        name: "对象 rest + 尾逗号",
        code: `const {a, ...rest,} = obj`
    },
    {
        name: "函数参数：重命名 + rest + 默认值",
        code: `function fn({options: {...opts} = {}}) {}`
    },
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

console.log('测试完整往返流程 (Parse → AST → Generate)\n')

testCases.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试 ${index + 1}: ${testCase.name}`)
    console.log(`原始代码:\n${testCase.code}`)
    console.log('-'.repeat(60))
    
    try {
        // 1. 词法分析
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(testCase.code)
        console.log(`✓ 词法分析: ${tokens.length} tokens`)
        
        // 2. 语法分析
        const parser = new Es6Parser(tokens)
        const cst = parser.Program()
        console.log(`✓ 语法分析: CST children=${cst.children?.length || 0}`)
        
        // 3. CST → AST
        const slimeCstToAst = new SlimeCstToAst()
        const ast = slimeCstToAst.toProgram(cst)
        console.log(`✓ AST转换: body length=${ast.body.length}`)
        
        // 检查第一个语句
        if (ast.body.length > 0) {
            const firstStmt = ast.body[0]
            console.log(`  第一个语句类型: ${firstStmt.type}`)
        }
        
        // 4. AST → Code
        const result = SlimeGenerator.generator(ast, tokens)
        console.log(`✓ 代码生成: ${result.code.length} 字符`)
        console.log(`\n生成代码:\n${result.code}`)
        
        // 5. 对比
        const original = testCase.code.replace(/\s+/g, ' ').trim()
        const generated = result.code.replace(/\s+/g, ' ').trim()
        
        if (generated.includes(original.substring(0, 20))) {
            console.log(`\n✅ 往返成功！`)
        } else {
            console.log(`\n⚠️  代码有差异`)
            console.log(`原始（规范化）: ${original.substring(0, 50)}...`)
            console.log(`生成（规范化）: ${generated.substring(0, 50)}...`)
        }
        
    } catch (error: any) {
        console.log(`\n✗ 失败: ${error.message}`)
        console.log(`堆栈: ${error.stack}`)
    }
})

console.log(`\n${'='.repeat(60)}`)
console.log('测试完成')





















