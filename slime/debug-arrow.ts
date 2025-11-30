import Es2025Parser from './packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import {es2025Tokens} from 'slime-parser/src/language/es2025/SlimeTokensName'

const code = 'export {privateValue as value}'
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)
const parser = new Es2025Parser(tokens)
const cst = parser.Program()

// 递归打印 CST 结构
function printCST(node: any, indent: string = '', maxDepth: number = 15) {
    if (!node || maxDepth <= 0) return
    const val = node.value ? ` = "${node.value}"` : ''
    console.log(`${indent}${node.name}${val}`)
    if (node.children) {
        for (const child of node.children) {
            printCST(child, indent + '  ', maxDepth - 1)
        }
    }
}

// 找到 CST
function findCST(node: any, name: string): any {
    if (node.name === name) return node
    if (node.children) {
        for (const child of node.children) {
            const found = findCST(child, name)
            if (found) return found
        }
    }
    return null
}

const exportDecl = findCST(cst, 'ExportDeclaration')
console.log('ExportDeclaration CST structure:')
printCST(exportDecl, '', 8)

