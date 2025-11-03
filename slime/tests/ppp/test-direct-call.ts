import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

// 直接测试各个规则
const code = `Math`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))

const parser = new Es2020Parser(tokens)

// 测试1：Program
console.log('\n=== 测试 Program ===')
try {
  const cst1 = parser.Program()
  console.log('CST children:', cst1.children.length)
  console.log('CST:', JSON.stringify(cst1, null, 2).substring(0, 500))
} catch (e: any) {
  console.log('异常:', e.message, e.stack?.substring(0, 500))
}

// 重新初始化 parser
const parser2 = new Es2020Parser(tokens)

// 测试2：直接调用 ExpressionStatement
console.log('\n=== 测试 ExpressionStatement ===')
try {
  // @ts-ignore - 访问私有方法用于调试
  parser2.ExpressionStatement()
  const cst2 = parser2.curCst
  console.log('CST:', JSON.stringify(cst2, null, 2).substring(0, 500))
} catch (e: any) {
  console.log('异常:', e.message)
  if (e.stack) {
    console.log('Stack:', e.stack.substring(0, 800))
  }
}

// 重新初始化 parser
const parser3 = new Es2020Parser(tokens)

// 测试3：直接调用 PrimaryExpression
console.log('\n=== 测试 PrimaryExpression ===')
try {
  // @ts-ignore
  parser3.PrimaryExpression()
  const cst3 = parser3.curCst
  console.log('CST:', JSON.stringify(cst3, null, 2).substring(0, 500))
} catch (e: any) {
  console.log('异常:', e.message)
  if (e.stack) {
    console.log('Stack:', e.stack.substring(0, 800))
  }
}

// 重新初始化 parser
const parser4 = new Es2020Parser(tokens)

// 测试4：直接调用 IdentifierReference
console.log('\n=== 测试 IdentifierReference ===')
try {
  // @ts-ignore
  parser4.IdentifierReference()
  const cst4 = parser4.curCst
  console.log('CST:', JSON.stringify(cst4, null, 2).substring(0, 500))
} catch (e: any) {
  console.log('异常:', e.message)
  if (e.stack) {
    console.log('Stack:', e.stack.substring(0, 800))
  }
}

