import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `Math`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))

const parser = new Es2020Parser(tokens)

// 测试 IdentifierReference
console.log('\n=== 测试 IdentifierReference ===')
try {
  // @ts-ignore
  parser.IdentifierReference()
  console.log('curCst:', parser.curCst)
  if (parser.curCst) {
    console.log('curCst.name:', parser.curCst.name)
    console.log('curCst.children:', parser.curCst.children?.length)
  }
} catch (e: any) {
  console.log('异常:', e.message)
}


