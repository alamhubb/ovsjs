/**
 * 调试非缓存模式下的 Or 分支输出
 * 目标：找出为什么 Branch #2 和 Branch #5 没有被输出
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `let a = 1`

console.log('🔍 调试非缓存模式下的 Or 分支输出')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug，关闭缓存）
const parser = new Es2025Parser(tokens).debug()

// 确认缓存已关闭
const debug = (parser as any)._debugger
console.log(`\n缓存状态: openDebugLogCache = ${debug.openDebugLogCache}`)

// Hook 到 onOrBranch 和 onOrBranchExit
const originalOnOrBranch = debug.onOrBranch.bind(debug)
const originalOnOrBranchExit = debug.onOrBranchExit.bind(debug)

debug.onOrBranch = function(branchIndex: number, totalBranches: number, parentRuleName: string) {
    if (parentRuleName === 'UpdateExpression') {
        console.log(`\n🔍 onOrBranch: ${parentRuleName}, Branch #${branchIndex + 1}`)
        console.log(`  栈深度: ${this.ruleStack.length}`)
    }
    originalOnOrBranch(branchIndex, totalBranches, parentRuleName)
}

debug.onOrBranchExit = function(parentRuleName: string, branchIndex: number) {
    if (parentRuleName === 'UpdateExpression') {
        console.log(`\n🔍 onOrBranchExit: ${parentRuleName}, Branch #${branchIndex + 1}`)
        console.log(`  Parser._parseSuccess: ${(parser as any)._parseSuccess}`)
        
        const curBranchNode = this.ruleStack[this.ruleStack.length - 1]
        console.log(`  当前分支节点: outputted=${curBranchNode?.outputted}`)
    }
    originalOnOrBranchExit(parentRuleName, branchIndex)
}

// Hook 到 onTokenConsume
const originalOnTokenConsume = debug.onTokenConsume.bind(debug)
let tokenConsumeCount = 0

debug.onTokenConsume = function(tokenIndex: number, tokenName: string, tokenValue: string) {
    tokenConsumeCount++
    if (tokenIndex === 3) {  // token[3] 是 "1"
        console.log(`\n🔍 [${tokenConsumeCount}] onTokenConsume: token[${tokenIndex}] = "${tokenValue}"`)
        console.log(`  栈深度: ${this.ruleStack.length}`)
        console.log(`  栈顶 5 个节点:`)
        for (let i = Math.max(0, this.ruleStack.length - 5); i < this.ruleStack.length; i++) {
            const item = this.ruleStack[i]
            console.log(`    [${i}] ${item.ruleName} (outputted=${item.outputted})`)
        }
    }
    originalOnTokenConsume(tokenIndex, tokenName, tokenValue)
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

