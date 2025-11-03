import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens, es6TokensObj} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";

const code = `let x = 1`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('=== Token 详细信息 ===')
tokens.forEach((token, i) => {
  console.log(`Token ${i}:`)
  console.log('  tokenName:', token.tokenName)
  console.log('  tokenValue:', token.tokenValue)
  console.log('  type:', (token as any).type)
})

console.log('\n=== 检查 es6TokensObj.LetTok ===')
console.log('es6TokensObj.LetTok:', es6TokensObj.LetTok)
console.log('LetTok.name:', es6TokensObj.LetTok.name)
console.log('LetTok.type:', es6TokensObj.LetTok.type)

console.log('\n=== 对比 ===')
console.log('token[0].tokenName === LetTok.name:', tokens[0].tokenName === es6TokensObj.LetTok.name)
console.log('token[0].tokenName === LetTok.type:', tokens[0].tokenName === es6TokensObj.LetTok.type)





