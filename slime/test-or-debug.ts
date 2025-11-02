import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser";
import type {SubhutiParserOr} from "subhuti/src/parser/SubhutiParser";

// 创建一个自定义Parser来追踪Or规则执行
class DebugEs6Parser extends Es6Parser {
    private orCount = 0
    
    override Or(subhutiParserOrs: SubhutiParserOr[]) {
        this.orCount++
        const orId = this.orCount
        console.log(`\n>>> Or #${orId} 开始（规则：${this.curCst.name}）`)
        console.log(`    当前token[${this.tokenIndex}]: ${this._tokens[this.tokenIndex]?.tokenName}`)
        console.log(`    分支数量: ${subhutiParserOrs.length}`)
        
        // Wrap each branch
        const wrappedOrs = subhutiParserOrs.map((or, index) => ({
            alt: () => {
                const tokenBefore = this.tokenIndex
                console.log(`    尝试分支 #${index + 1}...`)
                try {
                    or.alt()
                    const tokenAfter = this.tokenIndex
                    const success = this.continueForAndNoBreak
                    console.log(`    分支 #${index + 1} ${success ? '✅成功' : '❌失败'} (token: ${tokenBefore} → ${tokenAfter})`)
                } catch (e) {
                    console.log(`    分支 #${index + 1} 💥异常:`, e.message)
                    throw e
                }
            }
        }))
        
        const result = super.Or(wrappedOrs)
        console.log(`<<< Or #${orId} 结束，最终continueForAndNoBreak = ${this.continueForAndNoBreak}\n`)
        return result
    }
}

const code = `
1+2
3+4
`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('=== Token流：')
tokens.forEach((token, index) => {
    console.log(`[${index}] ${token.tokenName}`)
})

console.log('\n=== 开始解析')
const parser = new DebugEs6Parser(tokens)
parser.faultTolerance = false  // 明确设置为false
const cst = parser.Program()

console.log('\n=== 解析结果：')
console.log('解析的语句数：', cst.children[0]?.children?.length || 0)
console.log('剩余token数：', tokens.length - parser.tokenIndex)









