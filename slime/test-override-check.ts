/**
 * 检查 DotMemberExpression override 是否生效
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 直接测试私有属性访问表达式
const testCodes = [
    'this.name',      // 普通属性
    'this.#count'     // 私有属性
]

for (const code of testCodes) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试代码: ${code}`)
    console.log('='.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        
        console.log('Tokens:')
        tokens.forEach((t, i) => {
            console.log(`  [${i}] ${t.tokenName}: "${t.tokenValue}"`)
        })
        
        const parser = new Es2020Parser(tokens)
        
        // 尝试解析为 MemberExpression
        const cst = parser.MemberExpression()
        
        if (cst && cst.children) {
            console.log(`\n✅ MemberExpression解析成功`)
            console.log(`CST结构:`, JSON.stringify(cst, null, 2))
        } else {
            console.log(`\n❌ MemberExpression解析失败（返回null或无children）`)
        }
        
    } catch (e) {
        console.log(`\n❌ 异常: ${e.message}`)
    }
}

