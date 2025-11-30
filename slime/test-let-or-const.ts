import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"
import { SubhutiDebugRuleTracePrint } from '../subhuti/src/SubhutiDebugRuleTracePrint'

const code = `let x = 1`
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('代码:', code)
console.log()

const parser = new Es2025Parser(tokens).debug()

// Hook 到 flushPendingOutputs
const originalFlush = SubhutiDebugRuleTracePrint.flushPendingOutputs
SubhutiDebugRuleTracePrint.flushPendingOutputs = function(ruleStack) {
    console.log('\n=== flushPendingOutputs 调用 ===')
    const pending = ruleStack.filter((item: any) => !item.outputted)
    console.log('pending 规则数量:', pending.length)
    
    pending.forEach((item: any, i: number) => {
        const orInfo = item.orBranchInfo
        const orStr = orInfo 
            ? `(isOrEntry=${orInfo.isOrEntry}, isOrBranch=${orInfo.isOrBranch})` 
            : '(普通规则)'
        console.log(`  [${i}] ${item.ruleName} ${orStr}`)
    })
    
    // 断链计算
    console.log('\n断链计算:')
    let lastOrIndex = -1
    for (let i = pending.length - 1; i >= 0; i--) {
        const result = SubhutiDebugRuleTracePrint.isOrEntry(pending[i])
        if (result) {
            lastOrIndex = i
            console.log(`  找到最后一个 Or Entry: pending[${i}] (${pending[i].ruleName})`)
            break
        }
    }
    
    const grandpaIndex = pending.length >= 2 ? pending.length - 2 : -1
    console.log(`  lastOrIndex = ${lastOrIndex}`)
    console.log(`  grandpaIndex = ${grandpaIndex}`)
    
    const validIndices = [lastOrIndex, grandpaIndex].filter((i: number) => i >= 0)
    const breakPoint = validIndices.length > 0 ? Math.min(...validIndices) : -1
    console.log(`  breakPoint = ${breakPoint}`)
    
    if (breakPoint > 0) {
        console.log(`\n  折叠部分 [0, ${breakPoint}):`)
        pending.slice(0, breakPoint).forEach((item: any, i: number) => {
            const orInfo = item.orBranchInfo
            const orStr = orInfo ? `(Or节点)` : ''
            console.log(`    [${i}] ${item.ruleName} ${orStr}`)
        })
        
        console.log(`\n  单独部分 [${breakPoint}, ${pending.length}]:`)
        pending.slice(breakPoint).forEach((item: any, i: number) => {
            const orInfo = item.orBranchInfo
            const orStr = orInfo 
                ? `(isOrEntry=${orInfo.isOrEntry}, isOrBranch=${orInfo.isOrBranch})` 
                : ''
            console.log(`    [${breakPoint + i}] ${item.ruleName} ${orStr}`)
        })
    }
    
    console.log('===\n')
    
    return originalFlush.call(this, ruleStack)
}

parser.Script()

