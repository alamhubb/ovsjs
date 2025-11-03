/**
 * 测试第一次解析（无缓存重用）
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

function collectTokenValues(node: any): string[] {
    const values: string[] = []
    
    if (node.value !== undefined && (!node.children || node.children.length === 0)) {
        values.push(node.value)
    }
    
    if (node.children) {
        for (const child of node.children) {
            values.push(...collectTokenValues(child))
        }
    }
    
    return values
}

// 测试最简单的情况：单个函数调用
const code = `foo()`

console.log('测试代码:', code)
console.log('='.repeat(60))

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
const parser = new Es2020Parser(tokens)

parser.enableMemoization = true

const cst = parser.Program()
const cstTokens = collectTokenValues(cst)

console.log(`CST tokens (${cstTokens.length}个):`, cstTokens.join(', '))

const inputTokens = tokens
    .filter((t: any) => {
        const tokenName = t.tokenType?.name || ''
        return tokenName !== 'SingleLineComment' &&
            tokenName !== 'MultiLineComment' &&
            tokenName !== 'Spacing' &&
            tokenName !== 'LineBreak'
    })
    .map((t: any) => t.tokenValue)

const missingTokens = inputTokens.filter((v: string) => !cstTokens.includes(v))

if (missingTokens.length > 0) {
    console.log(`❌ 丢失 ${missingTokens.length} 个tokens:`, missingTokens)
} else {
    console.log(`✅ Token完整`)
}

console.log('\n缓存统计:')
const stats = parser.getMemoStats()
console.log('  命中:', stats.hits)
console.log('  未命中:', stats.misses)

console.log('\n' + '='.repeat(60))









