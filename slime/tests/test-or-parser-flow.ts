/**
 * 调试 Parser 的 Or 执行流程
 * 目标：找出为什么 Parser 会尝试多个分支
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `let a = 1`

console.log('🔍 调试 Parser 的 Or 执行流程')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug）
const parser = new Es2025Parser(tokens).debug()

// Hook 到 onOrBranch 和 onOrBranchExit
const debug = (parser as any)._debugger
const originalOnOrBranch = debug.onOrBranch.bind(debug)
const originalOnOrBranchExit = debug.onOrBranchExit.bind(debug)

let updateExpressionCount = 0

debug.onOrBranch = function(branchIndex: number, totalBranches: number, parentRuleName: string) {
    if (parentRuleName === 'UpdateExpression') {
        updateExpressionCount++
        console.log(`\n🔍 [${updateExpressionCount}] onOrBranch: ${parentRuleName}, Branch #${branchIndex + 1}/${totalBranches}`)
        console.log(`  Parser._parseSuccess: ${(parser as any)._parseSuccess}`)
        console.log(`  Parser.tokenIndex: ${(parser as any).tokenIndex}`)
    }
    originalOnOrBranch(branchIndex, totalBranches, parentRuleName)
}

debug.onOrBranchExit = function(parentRuleName: string, branchIndex: number) {
    if (parentRuleName === 'UpdateExpression') {
        console.log(`\n🔍 [${updateExpressionCount}] onOrBranchExit: ${parentRuleName}, Branch #${branchIndex + 1}`)
        console.log(`  Parser._parseSuccess: ${(parser as any)._parseSuccess}`)
        console.log(`  Parser.tokenIndex: ${(parser as any).tokenIndex}`)
        
        const curBranchNode = this.ruleStack[this.ruleStack.length - 1]
        console.log(`  当前分支节点: outputted=${curBranchNode?.outputted}`)
    }
    originalOnOrBranchExit(parentRuleName, branchIndex)
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

