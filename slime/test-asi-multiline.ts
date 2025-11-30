/**
 * 测试多行注释中的换行是否触发 ASI
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer'
import { es2025Tokens } from 'slime-parser/src/language/es2025/SlimeTokensName'
import Es2025Parser from 'slime-parser/src/language/es2025/Es2025Parser'

// 测试代码：两个字符串字面量之间有包含换行的多行注释
const code = `''/*
*/''`

const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

console.log('Tokens:')
for (const t of tokens) {
    console.log(`  ${t.tokenName}: "${t.tokenValue}" hasLineBreakBefore=${t.hasLineBreakBefore}`)
}

console.log('\nParsing...')
try {
    const parser = new Es2025Parser(tokens)
    const cst = parser.Program('script')
    console.log('Success!')
    console.log('CST:', JSON.stringify(cst, null, 2))
} catch (e: any) {
    console.log('Error:', e.message)
}

