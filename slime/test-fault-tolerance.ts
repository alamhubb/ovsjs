import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser";

const code = `
1+2
3+4
`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('=== 测试1：默认faultTolerance')
const parser1 = new Es6Parser(tokens)
console.log('faultTolerance =', parser1.faultTolerance)
const cst1 = parser1.Program()
console.log('解析的语句数：', cst1.children[0]?.children?.length || 0)
console.log('剩余token数：', tokens.length - parser1.tokenIndex)

console.log('\n=== 测试2：开启faultTolerance')
const parser2 = new Es6Parser(tokens)
parser2.faultTolerance = true
console.log('faultTolerance =', parser2.faultTolerance)
const cst2 = parser2.Program()
console.log('解析的语句数：', cst2.children[0]?.children?.length || 0)
console.log('剩余token数：', tokens.length - parser2.tokenIndex)












