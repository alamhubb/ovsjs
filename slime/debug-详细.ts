import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code1 = 'function f() { return 1 }' // ✅ 成功
const code2 = 'function f() { x = 1 }' // ❌ 失败

console.log('='.repeat(60))
console.log('测试1: function f() { return 1 }')
console.log('='.repeat(60))

try {
  const lexer1 = new SubhutiLexer(es6Tokens)
  const tokens1 = lexer1.lexer(code1)
  console.log(`Tokens: ${tokens1.length}个`)
  tokens1.forEach((t, i) => console.log(`  [${i}] ${t.tokenName}`))
  
  const parser1 = new Es6Parser(tokens1)
  const cst1 = parser1.Program()
  console.log(`\nCST children: ${cst1.children?.length || 0}`)
} catch (e) {
  console.error('错误:', e)
}

console.log('\n' + '='.repeat(60))
console.log('测试2: function f() { x = 1 }')
console.log('='.repeat(60))

try {
  const lexer2 = new SubhutiLexer(es6Tokens)
  const tokens2 = lexer2.lexer(code2)
  console.log(`Tokens: ${tokens2.length}个`)
  tokens2.forEach((t, i) => console.log(`  [${i}] ${t.tokenName}`))
  
  const parser2 = new Es6Parser(tokens2)
  const cst2 = parser2.Program()
  console.log(`\nCST children: ${cst2.children?.length || 0}`)
  
  // 打印parser内部状态
  console.log(`\nParser 状态:`)
  console.log(`  - curIndex: ${(parser2 as any).curIndex}`)
  console.log(`  - tokens.length: ${tokens2.length}`)
  console.log(`  - 未消费的tokens: ${tokens2.length - (parser2 as any).curIndex}`)
  
  if ((parser2 as any).curIndex < tokens2.length) {
    console.log(`  - 下一个token: ${tokens2[(parser2 as any).curIndex].tokenName}`)
  }
} catch (e) {
  console.error('错误:', e)
}










