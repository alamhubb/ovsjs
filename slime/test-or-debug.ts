import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/SlimeTokensName"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

const code = `{ }`
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('='.repeat(80))
console.log('测试：ObjectLiteral 的 Or 标记')
console.log('='.repeat(80))
console.log(`代码: ${code}`)
console.log(`Tokens: ${tokens.map((t: any) => t.tokenValue).join(', ')}`)
console.log()

const parser = new Es2025Parser(tokens).debug()
parser.PrimaryExpression()

console.log()
console.log('='.repeat(80))
console.log('分析：')
console.log('  - PrimaryExpression 调用 Or([...多个选项...])')
console.log('  - ObjectLiteral 是 Or 的第5个分支选项')
console.log('  - 问题：为什么 PrimaryExpression 有 [Or]，ObjectLiteral 没有？')
console.log('='.repeat(80))































