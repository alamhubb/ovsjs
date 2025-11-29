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
parser.debug()
parser.enableErrorRecovery()

// 添加调试：打印整个解析记录树（显示所有 children）
function printTree(node: any, depth = 0) {
    const indent = '  '.repeat(depth)
    const tokenMark = node.token ? ' [TOKEN]' : ''
    const childCount = node.children?.length || 0
    console.log(`${indent}${node.name} (start=${node.startTokenIndex}, end=${node.endTokenIndex}, children=${childCount})${tokenMark}`)
    for (const child of node.children || []) {
        printTree(child, depth + 1)
    }
}

// hook recoverFromParseRecord 来打印解析记录树
const origRecoverFromParseRecord = Object.getPrototypeOf(parser).recoverFromParseRecord
Object.getPrototypeOf(parser).recoverFromParseRecord = function(this: any, root: any, maxIndex: number) {
    console.log('\n=== 解析记录树（原始） ===')
    printTree(root)

    // 检查 AssignmentExpression 有几个子节点
    function findNode(node: any, name: string): any[] {
        const results: any[] = []
        if (node.name === name) results.push(node)
        for (const child of node.children || []) {
            results.push(...findNode(child, name))
        }
        return results
    }

    const assignExprs = findNode(root, 'AssignmentExpression')
    for (const ae of assignExprs) {
        console.log(`\nAssignmentExpression children (${ae.children?.length}):`)
        for (const child of ae.children || []) {
            console.log(`  - ${child.name} (start=${child.startTokenIndex}, end=${child.endTokenIndex})`)
        }
    }

    return origRecoverFromParseRecord.call(this, root, maxIndex)
}

const res = parser.Program()

// 简化输出
function getTokens(node: any): string[] {
    if (!node) return []
    const result: string[] = []
    if (node.value) result.push(node.value)
    if (node.children) {
        for (const child of node.children) {
            result.push(...getTokens(child))
        }
    }
    return result
}
console.log('\n=== CST tokens ===')
console.log(getTokens(res).join(' '))

// console.log('Unparsed tokens:', parser.unparsedTokens)
// console.log('Has unparsed tokens:', parser.hasUnparsedTokens)
//
// const ast = slimeCstToAstUtil.toProgram(res)
// console.log('AST:', JSON.stringify(ast, null, 2))