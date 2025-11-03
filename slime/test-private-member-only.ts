/**
 * 测试私有属性访问（普通方法）
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const tests = [
    {
        name: '私有字段声明',
        code: `class Test { #count = 0 }`
    },
    {
        name: '普通方法返回this',
        code: `class Test { get() { return this } }`
    },
    {
        name: '普通方法访问公共属性',
        code: `class Test { name = "a"; get() { return this.name } }`
    },
    {
        name: '私有字段+普通方法访问私有字段',
        code: `class Test { #count = 0; get() { return this.#count } }`
    }
]

for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试: ${test.name}`)
    console.log(`代码: ${test.code}`)
    console.log('='.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(test.code)
        
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        const hasContent = cst.children?.[0]?.children?.length > 0
        
        if (hasContent) {
            console.log(`✅ 成功`)
        } else {
            console.log(`❌ 失败（空CST）`)
            // 显示token序列
            console.log('\nToken序列:')
            tokens.forEach((t, i) => {
                console.log(`  [${i}] ${t.tokenName}: "${t.tokenValue}"`)
            })
        }
        
    } catch (e) {
        console.log(`❌ 异常: ${e.message}`)
    }
}

