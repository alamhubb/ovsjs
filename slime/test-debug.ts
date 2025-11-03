/**
 * 调试新的SubhutiParser
 */

import Es2020Parser from './packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from './packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const num = 42`

console.log('输入代码:', code)
console.log()

// 1. 词法分析
const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log('Token数量:', tokens.length)
tokens.slice(0, 5).forEach(t => {
    console.log(`  - ${t.tokenName}: "${t.tokenValue}"`)
})
console.log()

// 2. 语法分析
const parser = new Es2020Parser(tokens)
console.log('开始解析...')

try {
    const cst = parser.Program()
    console.log('✅ 解析成功')
    console.log('CST:', JSON.stringify(cst, null, 2).slice(0, 500))
    console.log()
    console.log('CST.name:', cst?.name)
    console.log('CST.children:', cst?.children?.length)
    
    if (cst?.children) {
        cst.children.forEach((child, i) => {
            console.log(`  [${i}] ${child.name} (children: ${child.children?.length || 0})`)
        })
    }
    
    // Packrat统计
    console.log()
    const stats = parser.getMemoStats()
    console.log('Packrat统计:')
    console.log('  - 缓存命中:', stats.hits)
    console.log('  - 缓存未命中:', stats.misses)
    console.log('  - 命中率:', stats.hitRate)
    
} catch (error) {
    console.log('❌ 解析失败')
    console.log('错误:', error.message)
    console.log('堆栈:', error.stack?.split('\n').slice(0, 5).join('\n'))
}









