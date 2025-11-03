/**
 * 测试 import(...) vs Math.max(...)
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

function testCode(code: string) {
    console.log('\n' + '='.repeat(60))
    console.log('测试代码:', code)
    console.log('-'.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        const cstTokens = collectTokenValues(cst)
        
        console.log(`✅ 解析成功`)
        console.log(`  CST tokens (${cstTokens.length}个):`, cstTokens.join(', '))
        
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
            console.log(`  ❌ 丢失 ${missingTokens.length} 个tokens:`, missingTokens)
        } else {
            console.log(`  ✅ Token完整`)
        }
        
    } catch (error: any) {
        console.log(`❌ 解析失败: ${error.message}`)
    }
}

// 测试1：import() 动态导入
testCode(`import('./module.js')`)

// 测试2：普通函数调用
testCode(`Math.max(1, 2)`)

// 测试3：多层调用
testCode(`Math.max(1, 2) + Math.min(5, 3)`)

// 测试4：单纯的成员访问
testCode(`Math.PI`)

// 测试5：简单的函数调用
testCode(`foo()`)

console.log('\n' + '='.repeat(60))






