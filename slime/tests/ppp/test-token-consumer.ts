import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `Math`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens)
console.log('Token[0]:', tokens[0])

const parser = new Es2020Parser(tokens)
console.log('Parser created')

// 测试 tokenConsumer
console.log('\n=== 测试 tokenConsumer.Identifier ===')
try {
  // @ts-ignore
  const result = parser.tokenConsumer.Identifier()
  console.log('result:', result)
} catch (e: any) {
  console.log('异常:', e.message)
}

// 重新创建 parser
const parser2 = new Es2020Parser(tokens)
console.log('\n=== 测试 Or 调用 ===')
try {
  // @ts-ignore
  parser2.Or([
    {alt: () => parser2.tokenConsumer.Identifier()},
  ])
  console.log('curCst:', parser2.curCst)
} catch (e: any) {
  console.log('异常:', e.message)
}



