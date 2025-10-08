import {traverseClearLoc, traverseClearTokens, vitePluginOvsTransform} from "ovsjs/src"
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "slime-parser/src/language/es2015/Es6Tokens";
import OvsParser from "ovsjs/src/parser/OvsParser";
import {LogUtil} from "ovs-lsp/src/logutil";
import {objectScript6Tokens} from "./parser/ObjectScriptTokenConsumer";
import ObjectScriptParser from "./parser/ObjectScriptParser";


Error.stackTraceLimit = 50

const code = `
object a {}
`

const lexer = new SubhutiLexer(objectScript6Tokens)
const tokens = lexer.lexer(code)

console.log(tokens)
console.log(tokens.length)

const parser = new ObjectScriptParser(tokens)

let curCst = parser.Program()

curCst = traverseClearTokens(curCst)
traverseClearLoc(curCst)
LogUtil.log(curCst)
