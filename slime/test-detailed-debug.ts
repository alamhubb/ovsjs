import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser";

// 创建一个自定义Parser来追踪执行过程
class DebugEs6Parser extends Es6Parser {
    private loopCount = 0
    
    override FaultToleranceMany(fun: Function) {
        console.log('\n=== FaultToleranceMany开始执行')
        console.log('faultTolerance =', this.faultTolerance)
        console.log('当前token位置：', this.tokenIndex)
        
        // 调用父类方法前，先保存原始fun
        const originalFun = fun
        const wrappedFun = () => {
            this.loopCount++
            console.log(`\n--- 循环 #${this.loopCount} 开始 ---`)
            console.log('当前token位置：', this.tokenIndex)
            console.log('当前token：', this._tokens[this.tokenIndex]?.tokenName)
            console.log('continueForAndNoBreak BEFORE:', this.continueForAndNoBreak)
            
            originalFun()
            
            console.log('continueForAndNoBreak AFTER:', this.continueForAndNoBreak)
            console.log('当前token位置：', this.tokenIndex)
            console.log(`--- 循环 #${this.loopCount} 结束 ---`)
        }
        
        return super.FaultToleranceMany(wrappedFun)
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
    console.log(`[${index}]`, token.tokenName)
})

console.log('\n=== 开始解析（faultTolerance = false）')
const parser = new DebugEs6Parser(tokens)
const cst = parser.Program()

console.log('\n=== 解析结果：')
console.log('解析的语句数：', cst.children[0]?.children?.length || 0)
console.log('剩余token数：', tokens.length - parser.tokenIndex)



















