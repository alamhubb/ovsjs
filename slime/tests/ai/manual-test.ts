import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens";
import {LogUtil} from "../../src/logutil";

const code = "true"
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('Tokens数量:', tokens.length)
console.log('Token内容:', JSON.stringify(tokens, null, 2))

const parser = new Es6Parser(tokens)

LogUtil.log(tokens)

console.log('调用前 - initFlag:', (parser as any).initFlag, 'continueMatch:', (parser as any).continueMatch)

console.log('\n📝 测试 parser.Literal() - 使用 BooleanLiteral()')

let orDepth = 0

// 拦截 Or 方法
const originalOr = (parser as any).Or.bind(parser)
;(parser as any).Or = function(branches: any[]) {
    orDepth++
    const indent = '  '.repeat(orDepth)
    const position = (parser as any).tokens.length
    const stackPath = (parser as any).ruleExecErrorStack.join('>')
    console.log(`${indent}🔷 Or开始 (深度${orDepth}), continueMatch:`, (parser as any).continueMatch)
    console.log(`${indent}   position: ${position}, stackPath: ${stackPath}`)
    console.log(`${indent}   分支数: ${branches.length}`)
    console.log(`${indent}   failureCache size: ${(parser as any).failureCache.size}`)
    
    const result = originalOr(branches)
    
    console.log(`${indent}🔶 Or结束 (深度${orDepth}), 返回:`, result ? 'CST' : 'undefined', ', continueMatch:', (parser as any).continueMatch)
    console.log(`${indent}   failureCache size: ${(parser as any).failureCache.size}`)
    orDepth--
    return result
}

// 拦截 consume 方法
const originalConsume = (parser as any).consume.bind(parser)
;(parser as any).consume = function(token: any) {
    const indent = '  '.repeat(orDepth + 1)
    console.log(`${indent}🔍 consume: ${token?.name}`)
    const result = originalConsume(token)
    console.log(`${indent}${result ? '✅' : '❌'} 结果: ${result ? 'matched' : 'failed'}, continueMatch:`, (parser as any).continueMatch)
    return result
}

const cst = parser.Literal()

console.log('调用后 - initFlag:', (parser as any).initFlag, 'continueMatch:', (parser as any).continueMatch)
console.log('CST结果:', cst ? 'SUCCESS' : 'UNDEFINED')
console.log('剩余tokens:', (parser as any).tokens.length)

if (cst) {
    LogUtil.log(cst)
} else {
    console.log('❌ AbsLiteral() 返回 undefined，匹配失败')
}
