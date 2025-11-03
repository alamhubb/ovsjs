import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `let`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Token:', tokens[0].tokenName, tokens[0].tokenValue)

const parser = new Es6Parser(tokens)

console.log('\n=== 调用 VariableLetOrConst ===')
try {
  // @ts-ignore
  parser.VariableLetOrConst()
  console.log('✅ 成功')
  console.log('tokenIndex:', parser.tokenIndex)
} catch (e: any) {
  console.log('❌ 异常:', e.message)
}





