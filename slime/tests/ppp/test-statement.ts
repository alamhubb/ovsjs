import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `Math`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))

const parser = new Es6Parser(tokens)

console.log('\n=== 直接调用 StatementListItem ===')
try {
  // @ts-ignore
  parser.StatementListItem()
  console.log('解析成功')
  console.log('curCst:', parser.curCst ? `有CST（${parser.curCst.name}）` : '无CST')
} catch (e: any) {
  console.log('异常:', e.message)
}

// 重新初始化
const parser2 = new Es6Parser(tokens)
console.log('\n=== 直接调用 Statement ===')
try {
  // @ts-ignore
  parser2.Statement()
  console.log('解析成功')
  console.log('curCst:', parser2.curCst ? `有CST（${parser2.curCst.name}）` : '无CST')
} catch (e: any) {
  console.log('异常:', e.message)
}

// 重新初始化
const parser3 = new Es6Parser(tokens)
console.log('\n=== 直接调用 ExpressionStatement ===')
try {
  // @ts-ignore
  parser3.ExpressionStatement()
  console.log('解析成功')
  console.log('curCst:', parser3.curCst ? `有CST（${parser3.curCst.name}）` : '无CST')
} catch (e: any) {
  console.log('异常:', e.message)
}

