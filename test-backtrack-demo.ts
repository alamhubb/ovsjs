/**
 * 演示 Subhuti Parser 的回溯机制
 * 验证即使"宽泛模式在前"，Parser 也能正确处理
 */

import SlimeParser from './slime/packages/slime-parser/src/language/es2025/SlimeParser.ts'
import { es2025Tokens } from './slime/packages/slime-parser/src/language/es2025/SlimeTokenTypes.ts'
import SubhutiLexer from './subhuti/src/SubhutiLexer.ts'

const code = 'const x = {a: 1, b: 2,}'

console.log('📝 测试代码:')
console.log(code)
console.log()

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('🔤 Token 列表:')
tokens.forEach((token, i) => {
    const name = token.name || token.type || 'unknown'
    console.log(`  [${i}] ${name.padEnd(20)} "${token.value}"`)
})
console.log()

const parser = new SlimeParser(tokens)

// 开启调试模式
parser.debug()

console.log('🚀 开始解析...\n')
console.log('='.repeat(80))
console.log()

const result = parser.Module()

console.log()
console.log('='.repeat(80))
console.log()

if (result) {
    console.log('✅ 解析成功！')
    console.log()
    console.log('📊 观察以下几点：')
    console.log('1. 当 Or 尝试"{ PropertyDefinitionList }"分支时')
    console.log('2. PropertyDefinitionList 会匹配 "a: 1, b: 2"')
    console.log('3. 然后期望 "}"，但实际是 ","')
    console.log('4. 匹配失败，触发回溯 (Backtrack)')
    console.log('5. 恢复到分支开始前的状态')
    console.log('6. 尝试下一个分支 "{ PropertyDefinitionList , }"')
    console.log('7. 这次成功匹配全部内容')
} else {
    console.log('❌ 解析失败')
}

