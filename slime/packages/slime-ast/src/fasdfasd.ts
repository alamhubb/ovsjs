import SubhutiLexer from "subhuti/src/SubhutiLexer.ts";
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";

const code = 'let a = {'

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log(tokens)

const parser = new Es2025Parser(tokens)

const res = parser.Program()

console.log(res)