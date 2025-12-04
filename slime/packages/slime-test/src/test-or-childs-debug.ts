/**
 * 调试 Or 节点的 childs 数组
 * 目标：找出为什么同一个 Or 节点下面有多个分支
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser"

const code = `let a = 1`

console.log('🔍 调试 Or 节点的 childs 数组')
console.log('='.repeat(80))
console.log(`📝 代码: ${code}`)
console.log('='.repeat(80))

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(`\n✅ 词法分析: ${tokens.length} tokens`)
tokens.forEach((t: any, i: number) => {
    console.log(`  [${i}] ${t.tokenName}: "${t.tokenValue}"`)
})

// 语法分析（启用 debug）
console.log(`\n📋 语法分析（启用 SubhutiDebug）`)
console.log('-'.repeat(80))

const parser = new SlimeParser(tokens).debug()

// Hook 到 onOrBranchExit，打印 Or 包裹节点的 childs
const debug = (parser as any)._debugger
const originalOnOrBranchExit = debug.onOrBranchExit.bind(debug)

debug.onOrBranchExit = function(parentRuleName: string, branchIndex: number) {
    console.log(`\n🔍 onOrBranchExit: ${parentRuleName}, Branch #${branchIndex + 1}`)
    
    // 获取当前分支节点（栈顶）
    const curBranchNode = this.ruleStack[this.ruleStack.length - 1]
    console.log(`  当前分支节点: outputted=${curBranchNode?.outputted}`)
    
    // 调用原始方法
    originalOnOrBranchExit(parentRuleName, branchIndex)
    
    // 获取父 Or 包裹节点
    const parentOrNode = this.ruleStack[this.ruleStack.length - 1]
    if (parentOrNode && parentOrNode.orBranchInfo?.isOrEntry) {
        console.log(`  父 Or 包裹节点: ${parentOrNode.ruleName}`)
        console.log(`  父节点的 childs 数量: ${parentOrNode.childs?.length || 0}`)
        if (parentOrNode.childs && parentOrNode.childs.length > 0) {
            console.log(`  父节点的 childs:`)
            parentOrNode.childs.forEach((key: string, i: number) => {
                console.log(`    [${i}] ${key}`)
            })
        }
    }
}

// 执行解析
parser.Script()

console.log('\n✅ 解析完成')

