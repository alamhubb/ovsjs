/**
 * 调试 Or 包裹节点的 childs
 * 目标：验证 Or 包裹节点的 childs 是否包含失败的分支
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `let a = 1`

console.log('🔍 调试 Or 包裹节点的 childs')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)

// 语法分析（启用 debug）
const parser = new Es2025Parser(tokens).debug()

// Hook 到 onOrExit 和 onOrEnter
const debug = (parser as any)._debugger
const originalOnOrExit = debug.onOrExit.bind(debug)
const originalOnOrEnter = debug.onOrEnter.bind(debug)

let updateExpressionOrCount = 0

debug.onOrEnter = function(parentRuleName: string, tokenIndex: number) {
    if (parentRuleName === 'UpdateExpression') {
        updateExpressionOrCount++
        console.log(`\n🔍 [${updateExpressionOrCount}] onOrEnter: ${parentRuleName}, tokenIndex: ${tokenIndex}`)
    }
    originalOnOrEnter(parentRuleName, tokenIndex)
}

debug.onOrExit = function(parentRuleName: string) {
    if (parentRuleName === 'UpdateExpression') {
        console.log(`\n🔍 [${updateExpressionOrCount}] onOrExit: ${parentRuleName}`)
        console.log(`  Parser._parseSuccess: ${(parser as any)._parseSuccess}`)

        // 获取 Or 包裹节点（栈顶）
        const orNode = this.ruleStack[this.ruleStack.length - 1]
        if (orNode && orNode.orBranchInfo?.isOrEntry) {
            console.log(`  Or 包裹节点: ${orNode.ruleName}`)
            console.log(`  outputted: ${orNode.outputted}`)
            console.log(`  isManuallyAdded: ${orNode.isManuallyAdded}`)
            console.log(`  childs 数量: ${orNode.childs?.length || 0}`)

            if (orNode.childs && orNode.childs.length > 0) {
                console.log(`  childs:`)
                orNode.childs.forEach((key: string, i: number) => {
                    const child = this.cacheGet(key)
                    console.log(`    [${i}] ${key}`)
                    if (child && child.orBranchInfo?.isOrBranch) {
                        console.log(`        Branch #${child.orBranchInfo.branchIndex + 1}`)
                        console.log(`        outputted: ${child.outputted}`)
                        console.log(`        childs: ${child.childs?.length || 0}`)
                    }
                })
            }
        }
    }

    originalOnOrExit(parentRuleName)
}

// 执行解析
try {
    parser.Script()
    console.log('\n✅ 解析完成')
} catch (error: any) {
    console.log('\n❌ 解析失败:', error.message)
}

