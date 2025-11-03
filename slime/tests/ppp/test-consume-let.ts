import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens, es6TokensObj} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `let x = 1`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Token[0]:', tokens[0].tokenName, tokens[0].tokenValue)

const parser = new Es6Parser(tokens)

console.log('\n=== Parser 状态 ===')
console.log('tokenIndex:', parser.tokenIndex)
console.log('_tokens[0]:', parser._tokens[0]?.tokenName)

console.log('\n=== 调用 tokenConsumer.LetTok() ===')
try {
  const result = parser.tokenConsumer.LetTok()
  console.log('✅ 成功')
  console.log('result:', result)
  console.log('tokenIndex after:', parser.tokenIndex)
} catch (e: any) {
  console.log('❌ 异常:', e.message)
  console.log('Stack:', e.stack?.substring(0, 500))
}

console.log('\n=== 检查 es6TokensObj.LetTok ===')
console.log('es6TokensObj.LetTok:', es6TokensObj.LetTok.name)



