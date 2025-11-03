import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `Math`

console.log('=== 测试 Es6Parser ===')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))

const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('CST children:', cst.children.length)
if (cst.children.length > 0) {
  console.log('✅ Es6Parser 正常工作')
  console.log('CST:', JSON.stringify(cst, null, 2).substring(0, 500))
} else {
  console.log('❌ Es6Parser 也无法解析')
}




