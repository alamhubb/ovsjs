import SubhutiLexer from "subhuti/src/SubhutiLexer.ts";
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";
import slimeCstToAstUtil from "slime-parser/src/language/SlimeCstToAstUtil.ts";

// 测试：第一个语句不完整，第二个语句完整
const code = 'let a = {'

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('Tokens:', tokens)

const parser = new Es2025Parser(tokens)

// 启用容错模式
parser.enableErrorRecovery()

const res = parser.Program()

console.log('CST:', JSON.stringify(res, null, 2))

console.log('Unparsed tokens:', parser.unparsedTokens)
console.log('Has unparsed tokens:', parser.hasUnparsedTokens)

const ast = slimeCstToAstUtil.toProgram(res)
console.log('AST:', JSON.stringify(ast, null, 2))