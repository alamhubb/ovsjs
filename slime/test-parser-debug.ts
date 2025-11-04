import SubhutiLexer from "../subhuti/src/parser/SubhutiLexer.ts"
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens.ts"
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser.ts"

// 测试不同复杂度的代码
const testCases = [
    {
        name: "简单函数声明",
        code: `function fn() {}`
    },
    {
        name: "函数参数：只有标识符",
        code: `function fn(a) {}`
    },
    {
        name: "函数参数：对象解构",
        code: `function fn({a}) {}`
    },
    {
        name: "函数参数：对象解构 + 默认值",
        code: `function fn({a} = {}) {}`
    },
    {
        name: "函数参数：只有 rest",
        code: `function fn({...opts}) {}`
    },
    {
        name: "函数参数：只有 rest + 默认值",
        code: `function fn({...opts} = {}) {}`
    },
    {
        name: "函数参数：重命名 + rest",
        code: `function fn({options: {...opts}}) {}`
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

testCases.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(70)}`)
    console.log(`测试 ${index + 1}: ${testCase.name}`)
    console.log(`代码: ${testCase.code.substring(0, 60)}${testCase.code.length > 60 ? '...' : ''}`)
    console.log('-'.repeat(70))
    
    try {
        const lexer = new SubhutiLexer(es6Tokens)
        const tokens = lexer.lexer(testCase.code)
        console.log(`✓ 词法分析: ${tokens.length} tokens`)
        
        const parser = new Es6Parser(tokens)
        const cst = parser.Program()
        console.log(`✓ 语法分析成功`)
        
        // 检查 CST 结构
        const moduleItemList = cst.children?.[0]
        if (moduleItemList) {
            console.log(`  Program.children[0]: ${moduleItemList.name}`)
            console.log(`  ModuleItemList.children: ${moduleItemList.children?.length || 0}`)
            
            if (moduleItemList.children && moduleItemList.children.length > 0) {
                const firstItem = moduleItemList.children[0]
                console.log(`  第一个项目: ${firstItem.name}`)
                
                // 如果是 StatementListItem，继续深入
                if (firstItem.name === 'StatementListItem' && firstItem.children) {
                    const declaration = firstItem.children[0]
                    console.log(`    StatementListItem.children[0]: ${declaration?.name}`)
                    
                    if (declaration && declaration.children) {
                        console.log(`      children 数量: ${declaration.children.length}`)
                    }
                }
            } else {
                console.log(`  ❌ ModuleItemList 为空！`)
            }
        }
        
    } catch (error: any) {
        console.log(`✗ 失败: ${error.message}`)
    }
})

console.log(`\n${'='.repeat(70)}`)
console.log('诊断完成')





















