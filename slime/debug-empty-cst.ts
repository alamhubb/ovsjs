/**
 * 调试空CST问题
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `
class User {
    #password
    
    constructor(name, password) {
        this.name = name
        this.#password = password
    }
}
`

try {
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    
    console.log('✅ Tokens数量:', tokens.length)
    console.log('\n前10个tokens:')
    tokens.slice(0, 10).forEach((t, i) => {
        console.log(`  [${i}] ${t.tokenName}: ${t.tokenValue}`)
    })
    
    const parser = new Es2020Parser(tokens)
    const cst = parser.Program()
    
    console.log('\n✅ Parser返回的CST:')
    console.log('CST.name:', cst.name)
    console.log('CST.children数量:', cst.children?.length || 0)
    
    if (cst.children && cst.children.length > 0) {
        console.log('\nCST.children[0]:')
        console.log('  name:', cst.children[0].name)
        console.log('  children:', cst.children[0].children?.length || 0)
        
        if (cst.children[0].children) {
            console.log('\n  children[0]的children:')
            cst.children[0].children.forEach((child, i) => {
                console.log(`    [${i}] ${child.name}: ${child.children?.length || 0} children`)
            })
        }
    }
    
    console.log('\n完整CST结构（前100行）:')
    const cstStr = JSON.stringify(cst, null, 2)
    console.log(cstStr.split('\n').slice(0, 100).join('\n'))
    
} catch (e) {
    console.error('❌ 错误:', e.message)
    console.error(e.stack)
}

