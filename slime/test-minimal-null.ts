import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 最小复现：为什么null无法解析？
const code = 'null;'

console.log(`测试代码: ${code}\n`)

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log(`Tokens: ${tokens.map(t => t.tokenName).join(', ')}`)
console.log()

// 容错模式
console.log('━━━ 容错模式 ━━━')
const parser1 = new Es6Parser(tokens)
parser1.faultTolerance = true
try {
  const cst1 = parser1.Program()
  console.log(`✅ 成功，剩余tokens: ${parser1.tokens.length}`)
} catch (e: any) {
  console.log(`❌ 失败: ${e.message}`)
}

// 严格模式
const tokens2 = lexer.lexer(code)
console.log('\n━━━ 严格模式 ━━━')
const parser2 = new Es6Parser(tokens2)
parser2.faultTolerance = false
try {
  const cst2 = parser2.Program()
  console.log(`✅ 成功，剩余tokens: ${parser2.tokens.length}`)
} catch (e: any) {
  console.log(`❌ 失败: ${e.message}`)
}

