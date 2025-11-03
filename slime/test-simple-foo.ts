/**
 * 测试 foo() - 对比启用/禁用 memoization
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

const code = `foo()`

console.log('测试代码:', code)
console.log('='.repeat(60))

// 测试1：启用memoization
console.log('\n【启用 Memoization】')
{
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    const parser = new Es2020Parser(tokens)
    parser.enableMemoization = true
    
    const cst = parser.Program()
    const cstTokens = collectTokenValues(cst)
    
    console.log(`CST tokens: ${cstTokens.length}个 -`, cstTokens.join(', ') || '(空)')
    console.log(`缓存命中: ${parser.getMemoStats().hits}`)
}

// 测试2：禁用memoization
console.log('\n【禁用 Memoization】')
{
    const lexer = new SubhutiLexer(es2020Tokens)
    const tokens = lexer.lexer(code)
    const parser = new Es2020Parser(tokens)
    parser.enableMemoization = false
    
    const cst = parser.Program()
    const cstTokens = collectTokenValues(cst)
    
    console.log(`CST tokens: ${cstTokens.length}个 -`, cstTokens.join(', '))
    console.log(`缓存命中: ${parser.getMemoStats().hits}`)
}

console.log('\n' + '='.repeat(60))







