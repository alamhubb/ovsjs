// 简单测试：直接检查 ?. token
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'

console.log('\n🧪 OptionalChaining Token 简单测试')
console.log('='.repeat(60))

// 测试代码
const testCode = `obj?.prop`

console.log(`测试代码: ${testCode}`)

// 词法分析
const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(testCode)

console.log(`\n总 Token 数: ${tokens.length}`)
console.log('\nToken 列表:')
tokens.forEach((token, index) => {
    console.log(`  [${index}] ${token.tokenName}: "${token.tokenValue}"`)
})

// 检查 OptionalChaining
const optionalTokens = tokens.filter(t => t.tokenName === 'OptionalChainingTok')
console.log(`\n✅ OptionalChaining tokens: ${optionalTokens.length}`)

if (optionalTokens.length > 0) {
    console.log('🎉 OptionalChaining 正确识别！')
} else {
    console.log('❌ OptionalChaining 未被识别')
    // 检查是否被拆分
    const questionTokens = tokens.filter(t => t.tokenName === 'Question')
    const dotTokens = tokens.filter(t => t.tokenName === 'Dot')
    if (questionTokens.length > 0 || dotTokens.length > 0) {
        console.log(`⚠️  可能被拆分为: Question(${questionTokens.length}) + Dot(${dotTokens.length})`)
    }
}

