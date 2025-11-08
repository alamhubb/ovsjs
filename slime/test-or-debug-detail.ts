import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"
import { SubhutiDebugRuleTracePrint } from '../subhuti/src/SubhutiDebugRuleTracePrint'

const code = `{ }`
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('代码:', code)
console.log()

const parser = new Es2025Parser(tokens).debug()

// 在消费第一个 token 之前，手动检查 ruleStack
const tracer = (parser as any)._debugger

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
    
    // 测试 isOrEntry 方法
    console.log('\nisOrEntry 检查:')
    let lastOrIndex = -1
    for (let i = pending.length - 1; i >= 0; i--) {
        const result = SubhutiDebugRuleTracePrint.isOrEntry(pending[i])
        console.log(`  pending[${i}] (${pending[i].ruleName}):`, result)
        if (result) {
            lastOrIndex = i
            break
        }
    }
    console.log('lastOrIndex:', lastOrIndex)
    console.log('===\n')
    
    return originalFlush.call(this, ruleStack)
}

parser.PrimaryExpression()

