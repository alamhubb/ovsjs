import SubhutiLexer from "subhuti/src/SubhutiLexer.ts";
import {es2025Tokens} from "slime-parser/src/language/es2025/SlimeTokensName.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";
import {SubhutiDebugUtils} from "subhuti/src/SubhutiDebug.ts";
import slimeCstToAstUtil from "slime-parser/src/language/SlimeCstToAstUtil.ts";
import SlimeAstPrintUtil from "./SlimeAstPrintUtil.ts";

// 测试：第一个语句不完整
const code = 'let a = {'

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('Tokens:', tokens.map(t => t.tokenValue).join(' '))

const parser = new Es2025Parser(tokens)
// parser.debug()  // 暂时关闭 debug
parser.enableErrorRecovery()

const res = parser.Program()

// 打印 CST 结构
console.log('\n=== CST 结构 ===')
console.log(SubhutiDebugUtils.formatCst(res))

// 提取所有 token 值
console.log('\n=== 所有 tokens ===')
console.log(SubhutiDebugUtils.collectTokens(res).join(' '))

// console.log('Unparsed tokens:', parser.unparsedTokens)
// console.log('Has unparsed tokens:', parser.hasUnparsedTokens)
//
const ast = slimeCstToAstUtil.toProgram(res)

// 打印 AST 树形结构
console.log('\n=== AST 树形结构 ===')
console.log(SlimeAstPrintUtil.formatAst(ast))

console.log('\n=== AST JSON ===')
console.log(JSON.stringify(ast, null, 2))