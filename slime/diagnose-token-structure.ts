import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const x = 42`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log(`生成了 ${tokens.length} 个tokens\n`)

tokens.forEach((token, idx) => {
  console.log(`Token[${idx}]:`)
  console.log('  完整对象:', token)
  console.log('  所有属性:', Object.keys(token))
  console.log('  type:', token.type)
  console.log('  value:', token.value)
  console.log('')
})

