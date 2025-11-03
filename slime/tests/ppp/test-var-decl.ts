import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `let x = 1`  // 不加分号

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => t.tokenValue).join(' '))

const parser = new Es6Parser(tokens)

console.log('\n=== 直接调用 VariableDeclaration ===')
try {
  // @ts-ignore
  parser.VariableDeclaration()
  console.log('✅ 解析成功')
  console.log('tokenIndex:', parser.tokenIndex)
  console.log('tokens consumed:', parser.tokenIndex, '/', tokens.length)
} catch (e: any) {
  console.log('❌ 异常:', e.message)
}




