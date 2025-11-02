import {ovsTransform, vitePluginOvsTransform} from "ovsjs/src";
import OvsTokenConsumer, {ovs6Tokens} from "ovsjs/src/parser/OvsConsumer.ts";
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer.ts";
import OvsParser from "ovsjs/src/parser/OvsParser.ts";
import {LogUtil} from "./logutil.ts";

const code = `
1+2
3+4
`

// 1. 词法分析
const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(code)

// 2. 语法分析
const parser = new OvsParser(tokens, OvsTokenConsumer)
let curCst = parser.Program()

LogUtil.log(curCst)