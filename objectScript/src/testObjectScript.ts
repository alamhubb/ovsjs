import {traverseClearLoc, traverseClearTokens, vitePluginOvsTransform} from "ovsjs/src"
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens";
import OvsParser from "ovsjs/src/parser/OvsParser";
import {objectScript6Tokens} from "./parser/ObjectScriptTokenConsumer";
import ObjectScriptParser from "./parser/ObjectScriptParser";
import {LogUtil} from "./logutil";


Error.stackTraceLimit = 50

const code = `
object a {
  a = 1
  b=2
}
`

const lexer = new SubhutiLexer(objectScript6Tokens)
const tokens = lexer.lexer(code)

// console.log(tokens)
// console.log(tokens.length)

const parser = new ObjectScriptParser(tokens)

let curCst = parser.Program()

curCst = traverseClearTokens(curCst)
traverseClearLoc(curCst)
LogUtil.log(curCst)
