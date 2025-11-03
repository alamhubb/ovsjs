/**
 * 调试 memoization 的缓存行为
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `Math.max(1, 2)`

console.log('测试代码:', code)
console.log('='.repeat(60))

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
const parser = new Es2020Parser(tokens)

// 启用 memoization
parser.enableMemoization = true

console.log('\n开始解析...\n')

try {
    const cst = parser.Program()
    
    console.log('\n解析成功！')
    
    // 输出 memoization 统计
    const stats = parser.getMemoStats()
    console.log('\nMemoization 统计:')
    console.log('  缓存命中:', stats.hits)
    console.log('  缓存未命中:', stats.misses)
    console.log('  命中率:', stats.hitRate)
    console.log('  缓存大小:', stats.cacheSize)
    
    // 查找关键规则的缓存
    console.log('\n关键规则的缓存:')
    const memoCache = (parser as any).memoCache
    const keyRules = ['CallExpression', 'LeftHandSideExpression', 'OptionalExpression', 'MemberExpression']
    
    for (const [key, result] of memoCache.entries()) {
        const ruleName = key.split(':')[0]
        if (keyRules.includes(ruleName)) {
            const childCount = result.cst?.children?.length || 0
            console.log(`  ${key}:`)
            console.log(`    success=${result.success}, endIndex=${result.endTokenIndex}`)
            console.log(`    cst=${result.cst?.name || 'undefined'}, children=${childCount}`)
        }
    }
    
} catch (error: any) {
    console.log('\n解析失败:', error.message)
}

console.log('\n' + '='.repeat(60))

