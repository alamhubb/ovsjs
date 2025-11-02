import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {traverseClearLoc, traverseClearTokens} from "../utils/parserTestUtils";

const code = `
1+2
3+4
`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(tokens)

const parser = new Es6Parser(tokens)
const curCst = parser.ModuleItemList()

const outCst = JsonUtil.cloneDeep(curCst)
let cstForAst = traverseClearTokens(outCst)
cstForAst = traverseClearLoc(cstForAst)
console.log('\n=== CST 结构（children 数量）:', cstForAst.children.length)
console.log('\n=== 完整 CST 结构：')
console.log(JSON.stringify(cstForAst, null, 2))
