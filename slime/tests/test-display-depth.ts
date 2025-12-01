/**
 * 调试 displayDepth 的计算
 * 目标：找出为什么 Branch #2 的 displayDepth 是 58 而不是 41
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser"

const code = `let a = 1`

console.log('🔍 调试 displayDepth 的计算')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug）
const parser = new SlimeParser(tokens).debug()

// Hook 到 restoreFromCacheAndPushAndPrint
const debug = (parser as any)._debugger
const originalRestore = debug.restoreFromCacheAndPushAndPrint.bind(debug)

let indent = 0

debug.restoreFromCacheAndPushAndPrint = function(cacheKey: string, curDisplayDepth: number, isRoot: boolean = true) {
    const cached = this.cacheGet(cacheKey)
    
    // 只关注 UpdateExpression 相关的节点
    if (cached && (
        cached.ruleName === 'UpdateExpression' ||
        (cached.orBranchInfo?.isOrBranch && cached.ruleName === 'UpdateExpression')
    )) {
        const prefix = '  '.repeat(indent)
        console.log(`${prefix}🔍 restoreFromCacheAndPushAndPrint:`)
        console.log(`${prefix}  cacheKey: ${cacheKey}`)
        console.log(`${prefix}  ruleName: ${cached.ruleName}`)
        console.log(`${prefix}  isOrEntry: ${cached.orBranchInfo?.isOrEntry}`)
        console.log(`${prefix}  isOrBranch: ${cached.orBranchInfo?.isOrBranch}`)
        console.log(`${prefix}  branchIndex: ${cached.orBranchInfo?.branchIndex}`)
        console.log(`${prefix}  curDisplayDepth (传入): ${curDisplayDepth}`)
        console.log(`${prefix}  isRoot: ${isRoot}`)
        console.log(`${prefix}  childs: ${cached.childs?.length || 0}`)
        
        indent++
    }
    
    const result = originalRestore(cacheKey, curDisplayDepth, isRoot)
    
    if (cached && (
        cached.ruleName === 'UpdateExpression' ||
        (cached.orBranchInfo?.isOrBranch && cached.ruleName === 'UpdateExpression')
    )) {
        indent--
    }
    
    return result
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

