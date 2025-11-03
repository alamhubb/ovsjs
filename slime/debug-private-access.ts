/**
 * 调试私有属性访问问题
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 最简单的私有属性访问
const code = `class Test {
  #count = 0
  get() {
    return this.#count
  }
}`

try {
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    console.log('✅ 词法分析成功:', tokens.length, '个tokens\n')
    
    // 显示所有tokens
    console.log('Token序列:')
    tokens.forEach((t, i) => {
        console.log(`  [${i}] ${t.tokenName.padEnd(20)} : "${t.tokenValue}"`)
    })
    
    console.log('\n开始语法分析...')
    const parser = new Es2020Parser(tokens)
    
    // 尝试解析
    const cst = parser.Program()
    
    console.log('\n✅ 语法分析返回')
    console.log('CST结构:')
    console.log(JSON.stringify(cst, null, 2))
    
} catch (e) {
    console.error('\n❌ Parser错误:', e.message)
    if (e.details) {
        console.error('详细信息:', e.details)
    }
    console.error('\nStack:', e.stack)
}

