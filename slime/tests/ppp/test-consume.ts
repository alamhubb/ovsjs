import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens, es6TokensObj} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `Math`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)

console.log('=== Parser 状态 ===')
console.log('parser._tokens:', parser._tokens)
console.log('parser.tokenIndex:', parser.tokenIndex)
console.log('parser.tokenConsumer:', parser.tokenConsumer)

console.log('\n=== Token Consumer 状态 ===')
console.log('tokenConsumer.instance:', parser.tokenConsumer.instance === parser)
console.log('tokenConsumer.instance._tokens:', parser.tokenConsumer.instance?._tokens)

console.log('\n=== 测试 consume 方法 ===')
try {
  const result = parser.tokenConsumer.Identifier()
  console.log('consume result:', result)
  console.log('parser.tokenIndex after consume:', parser.tokenIndex)
} catch (e: any) {
  console.log('异常:', e.message)
}

console.log('\n=== 检查 es6TokensObj.Identifier ===')
console.log('es6TokensObj.Identifier:', es6TokensObj.Identifier)










