import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {traverseClearLoc, traverseClearTokens} from "../utils/parserTestUtils";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `Math.max(1, 2) + Math.min(5, 3)`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens:')
tokens.forEach((t, i) => console.log(`  ${i}: ${t.tokenName}="${t.tokenValue}"`))

const parser = new Es2020Parser(tokens)
const curCst = parser.Program()

const outCst = JsonUtil.cloneDeep(curCst)
let cstForAst = traverseClearTokens(outCst)
cstForAst = traverseClearLoc(cstForAst)

console.log('\n=== CST 结构（children 数量）:', cstForAst.children.length)
console.log('\n=== ModuleItemList children:', cstForAst.children[0]?.children?.length || 0)

// 简化显示：只显示关键路径
function showKeyNodes(node: any, depth = 0): string {
    if (!node) return ''
    
    const indent = '  '.repeat(depth)
    let result = `${indent}${node.name}`
    
    if (node.value) {
        result += ` = "${node.value}"`
    }
    
    // 只展开关键节点
    const keyNodes = ['Program', 'ModuleItemList', 'StatementListItem', 'ExpressionStatement', 
                      'Expression', 'AdditiveExpression', 'CallExpression', 'MemberExpression',
                      'Arguments', 'ArgumentList', 'Plus', 'Identifier', 'NumericLiteral', 'Dot']
    
    if (node.children && node.children.length > 0) {
        if (keyNodes.includes(node.name) || node.name.includes('Identifier') || node.name.includes('Literal')) {
            result += ` (${node.children.length})`
            for (const child of node.children) {
                const childStr = showKeyNodes(child, depth + 1)
                if (childStr) result += '\n' + childStr
            }
        } else if (node.children.length === 0) {
            result += ' [EMPTY]'
        } else {
            result += ` (${node.children.length} children, collapsed)`
        }
    } else if (node.children && node.children.length === 0) {
        result += ' [EMPTY]'
    }
    
    return result
}

console.log('\n=== 关键 CST 节点:')
console.log(showKeyNodes(cstForAst))

