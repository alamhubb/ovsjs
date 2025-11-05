/**
 * 测试 ReturnStatement 解析
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import Es2025Parser from './Es2025Parser.ts'
import { es2025Tokens } from './Es2025Tokens.ts'

const code = 'return 42'

console.log('测试代码:', code)
console.log('-'.repeat(60))

// 1. 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)
console.log('Tokens:', tokens.map((t: any) => `${t.tokenType?.name}:${t.tokenValue}`).join(', '))

// 2. 尝试以 ReturnStatement 规则解析
const parser = new Es2025Parser(tokens).debug(true)

console.log('\n尝试解析 ReturnStatement:')
console.log('-'.repeat(60))
const cst = parser.ReturnStatement({ Yield: false, Await: false })

if (cst) {
  console.log('\n✅ 解析成功！')
  console.log('CST:', JSON.stringify(cst, null, 2))
} else {
  console.log('\n❌ 解析失败')
}





