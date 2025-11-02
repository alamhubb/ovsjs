// 调试：检查 Token 定义顺序
import { es2020Tokens, es2020TokensObj } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'

console.log('\n🔍 ES2020 Tokens 顺序检查')
console.log('='.repeat(60))

// 查找关键 tokens 的位置
const tokenNames = es2020Tokens.map(t => t.name)

const questionIndex = tokenNames.indexOf('Question')
const dotIndex = tokenNames.indexOf('Dot')
const optionalChainingIndex = tokenNames.indexOf('OptionalChainingTok')

console.log('Token 定义顺序:')
console.log(`  Question (?)     : ${questionIndex >= 0 ? `索引 ${questionIndex}` : '未找到'}`)
console.log(`  Dot (.)          : ${dotIndex >= 0 ? `索引 ${dotIndex}` : '未找到'}`)
console.log(`  OptionalChaining : ${optionalChainingIndex >= 0 ? `索引 ${optionalChainingIndex}` : '未找到'}`)

console.log('\n⚠️  问题分析:')
if (questionIndex >= 0 && dotIndex >= 0 && optionalChainingIndex >= 0) {
    if (optionalChainingIndex > questionIndex || optionalChainingIndex > dotIndex) {
        console.log('  ❌ OptionalChaining 在 Question/Dot 之后定义')
        console.log('  ❌ Lexer 会优先匹配 Question 和 Dot')
        console.log('  ❌ 导致 ?. 被解析为两个单独的 token')
    } else {
        console.log('  ✅ OptionalChaining 在 Question/Dot 之前定义')
        console.log('  ✅ Lexer 会优先匹配 OptionalChaining')
    }
}

console.log('\n📋 es2020TokensObj 结构:')
console.log('  扩展自: es6TokensObj')
console.log('  新增 tokens:')
console.log(`    - OptionalChaining: ${es2020TokensObj.OptionalChaining ? '✅' : '❌'}`)
console.log(`    - NullishCoalescing: ${es2020TokensObj.NullishCoalescing ? '✅' : '❌'}`)
console.log(`    - Exponentiation: ${es2020TokensObj.Exponentiation ? '✅' : '❌'}`)

console.log('\n🔧 解决方案:')
console.log('  问题根源: Object spread (...es6TokensObj) 保持了原有顺序')
console.log('  ES6 tokens 在前，ES2020 tokens 在后')
console.log('  需要调整 es2020Tokens 的构造方式')

