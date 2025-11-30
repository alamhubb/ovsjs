/**
 * 调试 depthFromOrEntry 的值
 * 目标：验证层级计算是否正确
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `let a = 1`

console.log('🔍 调试 depthFromOrEntry 的值')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug）
const parser = new Es2025Parser(tokens).debug()

// Hook 到 restoreFromCacheAndPushAndPrint
const debug = (parser as any)._debugger
const originalRestore = debug.restoreFromCacheAndPushAndPrint.bind(debug)

let callCount = 0

debug.restoreFromCacheAndPushAndPrint = function(
    cacheKey: string,
    curDisplayDepth: number,
    isRoot: boolean = true,
    depthFromMultiBranchOr: number = 999
) {
    callCount++
    const cached = this.cacheGet(cacheKey)

    // 只关注 UpdateExpression 相关的调用
    if (cached && (cached.ruleName === 'UpdateExpression' || cached.ruleName?.includes('LeftHandSide'))) {
        const isOrEntry = cached.orBranchInfo?.isOrEntry
        const isToken = !!cached.tokenName
        const childsCount = cached.childs?.length ?? 0
        const isMultiBranchOr = isOrEntry && childsCount > 1
        const ruleName = cached.ruleName || `Token[${cached.tokenName}]`

        console.log(`[${callCount}] ${ruleName}`)
        console.log(`  isOrEntry: ${isOrEntry}, childs: ${childsCount}, isMultiBranchOr: ${isMultiBranchOr}, isToken: ${isToken}`)
        console.log(`  depthFromMultiBranchOr: ${depthFromMultiBranchOr}`)
        console.log(`  shouldBreakLine: ${isMultiBranchOr || depthFromMultiBranchOr <= 1 || isToken}`)
    }

    return originalRestore.call(this, cacheKey, curDisplayDepth, isRoot, depthFromMultiBranchOr)
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

