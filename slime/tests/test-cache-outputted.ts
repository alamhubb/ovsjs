/**
 * 调试缓存恢复时的 outputted 标志
 * 目标：理解为什么 Or 包裹节点的 outputted 是 true
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `let a = 1`

console.log('🔍 调试缓存恢复时的 outputted 标志')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug）
const parser = new Es2025Parser(tokens).debug()

// Hook 到 onRuleEnter
const debug = (parser as any)._debugger
const originalOnRuleEnter = debug.onRuleEnter.bind(debug)
const originalOnOrEnter = debug.onOrEnter.bind(debug)
const originalRestoreFromCache = debug.restoreFromCacheAndPushAndPrint.bind(debug)

let updateExpressionCount = 0

debug.onRuleEnter = function(ruleName: string, tokenIndex: number) {
    if (ruleName === 'UpdateExpression') {
        updateExpressionCount++
        console.log(`\n🔍 [${updateExpressionCount}] onRuleEnter: ${ruleName}, tokenIndex: ${tokenIndex}`)
        
        const cacheKey = this.generateCacheKey({
            ruleName,
            tokenIndex,
            orBranchInfo: undefined
        })
        
        const cached = this.cacheGet(cacheKey)
        if (cached) {
            console.log(`  ✅ 缓存命中！`)
            console.log(`  cached.outputted: ${cached.outputted}`)
            console.log(`  cached.childs: ${cached.childs?.length || 0}`)
        } else {
            console.log(`  ❌ 缓存未命中`)
        }
    }
    
    return originalOnRuleEnter(ruleName, tokenIndex)
}

debug.onOrEnter = function(parentRuleName: string, tokenIndex: number) {
    if (parentRuleName === 'UpdateExpression') {
        console.log(`\n🔍 [${updateExpressionCount}] onOrEnter: ${parentRuleName}, tokenIndex: ${tokenIndex}`)
        console.log(`  创建 Or 包裹节点，outputted=false`)
    }
    
    originalOnOrEnter(parentRuleName, tokenIndex)
}

debug.restoreFromCacheAndPushAndPrint = function(cacheKey: string, curDisplayDepth: number, isRoot: boolean = true) {
    const cached = this.cacheGet(cacheKey)
    if (cached && cached.ruleName === 'UpdateExpression' && cached.orBranchInfo?.isOrEntry) {
        console.log(`\n🔍 restoreFromCacheAndPushAndPrint: UpdateExpression(Or)`)
        console.log(`  cached.outputted: ${cached.outputted}`)
        console.log(`  isRoot: ${isRoot}`)
        console.log(`  恢复后会设置 outputted=false`)
    }
    
    return originalRestoreFromCache(cacheKey, curDisplayDepth, isRoot)
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

