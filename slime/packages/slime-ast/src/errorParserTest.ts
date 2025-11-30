import SubhutiLexer from "subhuti/src/SubhutiLexer.ts";
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";
import slimeCstToAstUtil from "slime-parser/src/language/SlimeCstToAstUtil.ts";

// 测试：第一个语句不完整
const code = 'let a = {'

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('Tokens:', tokens.map(t => t.tokenValue).join(' '))

const parser = new Es2025Parser(tokens)
// parser.debug()  // 暂时关闭 debug
parser.enableErrorRecovery()



const res = parser.Program()

// 打印 CST 结构（简化版）
function printCst(node: any, depth = 0, maxDepth = 50) {
    if (!node || depth > maxDepth) return
    const indent = '  '.repeat(depth)
    const value = node.value ? ` = "${node.value}"` : ''
    console.log(`${indent}${node.name}${value}`)
    for (const child of node.children || []) {
        printCst(child, depth + 1, maxDepth)
    }
}

console.log('\n=== CST 结构 ===')
printCst(res)

// 提取所有 token 值
function getTokens(node: any): string[] {
    if (!node) return []
    const result: string[] = []
    if (node.value) result.push(node.value)
    for (const child of node.children || []) {
        result.push(...getTokens(child))
    }
    return result
}
console.log('\n=== 所有 tokens ===')
console.log(getTokens(res).join(' '))

// console.log('Unparsed tokens:', parser.unparsedTokens)
// console.log('Has unparsed tokens:', parser.hasUnparsedTokens)
//
// const ast = slimeCstToAstUtil.toProgram(res)
// console.log('AST:', JSON.stringify(ast, null, 2))