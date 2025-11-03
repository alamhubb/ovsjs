/**
 * 诊断token丢失问题
 */
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `Math.max(1, 2) + Math.min(5, 3)`

console.log('测试代码:', code)
console.log('='.repeat(60))

// 词法分析
const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

const inputTokens = tokens
    .filter((t: any) => {
        const tokenName = t.tokenType?.name || ''
        return tokenName !== 'SingleLineComment' &&
            tokenName !== 'MultiLineComment' &&
            tokenName !== 'Spacing' &&
            tokenName !== 'LineBreak'
    })

console.log(`输入tokens (${inputTokens.length}个):`)
inputTokens.forEach((t: any, i: number) => {
    console.log(`  ${i}: "${t.tokenValue}" (${t.tokenType?.name || 'unknown'})`)
})

// 语法分析
const parser = new Es2020Parser(tokens)

// 启用 memoization 统计
console.log('\n开始语法分析...')
console.log('Parser memoization enabled:', parser.enableMemoization)

const cst = parser.Program()

// 输出 memoization 统计
const stats = parser.getMemoStats()
console.log('\nMemoization 统计:')
console.log('  缓存命中:', stats.hits)
console.log('  缓存未命中:', stats.misses)
console.log('  命中率:', stats.hitRate)
console.log('  缓存大小:', stats.cacheSize)

console.log('\n='.repeat(60))
console.log('CST结构（简化版）:')
console.log('='.repeat(60))

// 简化输出CST
function printCST(node: any, indent: string = '', depth: number = 0) {
    if (depth > 15) {
        console.log(indent + '... (超过15层，省略)')
        return
    }
    
    const nodeInfo = node.value !== undefined 
        ? `"${node.value}"`
        : `${node.name} (${node.children?.length || 0} children)`
    
    console.log(indent + nodeInfo)
    
    if (node.children && depth < 15) {
        node.children.forEach((child: any) => {
            printCST(child, indent + '  ', depth + 1)
        })
    }
}

printCST(cst)

// 收集CST中的token值
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

const cstTokens = collectTokenValues(cst)

console.log('\n='.repeat(60))
console.log(`CST中的tokens (${cstTokens.length}个):`)
cstTokens.forEach((t: string, i: number) => {
    console.log(`  ${i}: "${t}"`)
})

console.log('\n='.repeat(60))
console.log('对比分析:')

const inputValues = inputTokens.map((t: any) => t.tokenValue)
const missingTokens = inputValues.filter((v: string) => !cstTokens.includes(v))
const extraTokens = cstTokens.filter((v: string) => !inputValues.includes(v))

if (missingTokens.length > 0) {
    console.log(`\n❌ 丢失的tokens (${missingTokens.length}个):`, missingTokens)
}

if (extraTokens.length > 0) {
    console.log(`\n⚠️  CST中多出的tokens (${extraTokens.length}个):`, extraTokens)
}

if (missingTokens.length === 0 && extraTokens.length === 0) {
    console.log('\n✅ Token完全匹配！')
}

