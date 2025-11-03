import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {traverseClearLoc, traverseClearTokens} from "../utils/parserTestUtils";
import {LogUtil} from "../../src/logutil";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";

const code = `
Math.max(1, 2) + Math.min(5, 3)
`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log(tokens)

const parser = new Es6Parser(tokens)
const curCst = parser.Program()

const outCst = JsonUtil.cloneDeep(curCst)
let cstForAst = traverseClearTokens(outCst)
cstForAst = traverseClearLoc(cstForAst)
console.log('\n=== CST 结构（children 数量）:', cstForAst.children.length)
console.log('\n=== 完整 CST 结构：')
console.log(JSON.stringify(cstForAst, null, 2))
LogUtil.log(cstForAst)
