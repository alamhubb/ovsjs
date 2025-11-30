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

// Hook printSingleRule
const originalPrintSingle = (SubhutiDebugRuleTracePrint as any).printSingleRule
;(SubhutiDebugRuleTracePrint as any).printSingleRule = function(rules: any[], startDepth: number) {
    console.log(`>>> printSingleRule 被调用: rules.length=${rules.length}, startDepth=${startDepth}`)
    rules.forEach((r: any, i: number) => {
        console.log(`    [${i}] ${r.ruleName} (orInfo: ${!!r.orBranchInfo})`)
    })
    return originalPrintSingle.call(this, rules, startDepth)
}

// Hook printChainRule  
const originalPrintChain = (SubhutiDebugRuleTracePrint as any).printChainRule
;(SubhutiDebugRuleTracePrint as any).printChainRule = function(rules: any[], depth: number) {
    console.log(`>>> printChainRule 被调用: rules.length=${rules.length}, depth=${depth}`)
    return originalPrintChain.call(this, rules, depth)
}

parser.PrimaryExpression()

