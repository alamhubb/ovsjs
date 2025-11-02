import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens, es2020TokensObj} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `1`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Lexer Token:')
console.log('  tokenName:', tokens[0].tokenName)
console.log('  tokenValue:', tokens[0].tokenValue)

console.log('\n=== Es2020Tokens 数组长度:', es2020Tokens.length)

// 查找所有 NumericLiteral 相关的 token
console.log('\n=== 查找 NumericLiteral:')
const numericTokens = es2020Tokens.filter((t: any) => 
  t.name && t.name.includes('Numeric')
)
console.log(`找到 ${numericTokens.length} 个:`)
numericTokens.forEach((t: any, i: number) => {
  console.log(`  ${i + 1}. name="${t.name}", pattern=${t.pattern}`)
})

// 查看 es2020TokensObj 中是否有 NumericLiteral
console.log('\n=== es2020TokensObj 中的 NumericLiteral:')
const keys = Object.keys(es2020TokensObj)
const numericKeys = keys.filter(k => k.includes('Numeric'))
console.log('找到的键:', numericKeys)

console.log('\n=== 尝试直接获取 es2020TokensObj.NumericLiteral:')
console.log('es2020TokensObj.NumericLiteral:', (es2020TokensObj as any).NumericLiteral)

// 测试 Parser
const parser = new Es2020Parser(tokens) as any
console.log('\n=== Parser tokenConsumer.NumericLiteral:')
const tc = parser.tokenConsumer
const numericMethod = tc.NumericLiteral
console.log('方法存在:', typeof numericMethod === 'function')

// 查看当前token
console.log('\n=== Parser 当前 token:')
console.log('  currTok:', parser.currTok)
console.log('  tokenIndex:', parser.tokenIndex)

