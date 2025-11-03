/**
 * 测试只声明私有属性（不使用）
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试1：只声明
const code1 = `class Test { #count }`

// 测试2：声明+初始化
const code2 = `class Test { #count = 0 }`

// 测试3：声明+使用（在MemberExpression中）
const code3 = `class Test { 
  #count = 0
  get() {
    return this.#count
  }
}`

for (const [name, code] of [['只声明', code1], ['声明+初始化', code2], ['声明+使用', code3]]) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试: ${name}`)
    console.log(`代码: ${code}`)
    console.log('='.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        console.log(`✅ Tokens: ${tokens.length}个`)
        
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        const hasContent = cst.children?.[0]?.children?.length > 0
        console.log(`✅ Parse: ${hasContent ? '成功（有内容）' : '失败（空CST）'}`)
        
        if (hasContent) {
            // 简单验证CST结构
            const classDecl = cst.children[0].children[0]
            console.log(`   - ClassDeclaration存在: ${classDecl?.name === 'StatementListItem'}`)
        }
        
    } catch (e) {
        console.log(`❌ 错误: ${e.message}`)
    }
}

