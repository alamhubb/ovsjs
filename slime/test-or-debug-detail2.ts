import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"
import { SubhutiDebugRuleTracePrint } from '../subhuti/src/SubhutiDebugRuleTracePrint'

const code = `{ }`
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
        console.log(`  [${i}] ${item.ruleName}`, {
            hasOrInfo: !!item.orBranchInfo,
            isOrEntry: item.orBranchInfo?.isOrEntry,
            isOrBranch: item.orBranchInfo?.isOrBranch
        })
    })
    
    // 详细显示断链逻辑
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
    console.log(`  lastOrIndex = ${lastOrIndex}`)
    
    const grandpaIndex = pending.length >= 2 ? pending.length - 2 : -1
    console.log(`  grandpaIndex = ${grandpaIndex} (倒数第二个)`)
    
    const validIndices = [lastOrIndex, grandpaIndex].filter((i: number) => i >= 0)
    console.log(`  validIndices = [${validIndices}]`)
    
    const breakPoint = validIndices.length > 0 ? Math.min(...validIndices) : -1
    console.log(`  breakPoint = ${breakPoint}`)
    
    if (breakPoint > 0) {
        console.log(`  -> 折叠部分: [0, ${breakPoint}) = [${Array.from({length: breakPoint}, (_, i) => i)}]`)
        console.log(`  -> 单独部分: [${breakPoint}, ${pending.length}] = [${Array.from({length: pending.length - breakPoint}, (_, i) => i + breakPoint)}]`)
    } else {
        console.log(`  -> 全部单独输出 (breakPoint <= 0)`)
    }
    
    console.log('===\n')
    
    return originalFlush.call(this, ruleStack)
}

parser.PrimaryExpression()

