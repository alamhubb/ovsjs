import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser";
import JsonUtil from "subhuti/src/utils/JsonUtil";

const code = `
1+2
3+4
`

console.log('=== 原始代码：')
console.log(code)

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('\n=== Token流（总数：', tokens.length, '）')
tokens.forEach((token, index) => {
    console.log(`[${index}]`, token.tokenName, '=', token.value)
})

const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('\n=== Parser当前位置：', parser.tokenIndex)
console.log('=== Token总数：', tokens.length)
console.log('=== 剩余未解析的token数量：', tokens.length - parser.tokenIndex)

if (parser.tokenIndex < tokens.length) {
    console.log('\n=== 剩余未解析的tokens：')
    for (let i = parser.tokenIndex; i < tokens.length; i++) {
        console.log(`[${i}]`, tokens[i].tokenName, '=', tokens[i].value)
    }
}

console.log('\n=== CST 结构（ModuleItemList的children数量）:', cst.children[0]?.children?.length || 0)

const moduleItemList = cst.children[0]
if (moduleItemList && moduleItemList.children) {
    console.log('\n=== ModuleItemList的每个child：')
    moduleItemList.children.forEach((child: any, index: number) => {
        console.log(`  [${index}] ${child.name}`)
    })
}

