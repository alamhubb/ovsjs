import SubhutiLexer from "subhuti/src/SubhutiLexer";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {traverseClearLoc, traverseClearTokens} from "../utils/parserTestUtils";
import {LogUtil} from "../../src/logutil";
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens";

const code = `const [first, ...[second, third]] = arr
`

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)
console.log(tokens)

const parser = new Es2025Parser(tokens)
const curCst = parser.Program()

const outCst = JsonUtil.cloneDeep(curCst)
let cstForAst = traverseClearTokens(outCst)
cstForAst = traverseClearLoc(cstForAst)
console.log('\n=== CST 结构（children 数量）:', cstForAst.children.length)
console.log('\n=== 完整 CST 结构：')
console.log(JSON.stringify(cstForAst, null, 2))
LogUtil.log(cstForAst)
