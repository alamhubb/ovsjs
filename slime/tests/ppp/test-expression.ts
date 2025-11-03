import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `Math`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens)

const parser = new Es6Parser(tokens)

console.log('\n=== 直接调用 Expression ===')
try {
  // @ts-ignore
  parser.Expression()
  console.log('解析成功')
  console.log('curCst:', parser.curCst)
  console.log('curToken index:', parser.curTokenIndex)
  console.log('matchedTokens:', parser.matchedTokens?.length)
} catch (e: any) {
  console.log('异常:', e.message)
}


