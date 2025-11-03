/**
 * 对比 Es6Parser 和 Es2020Parser
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `Math.max(1, 2) + Math.min(5, 3)`

console.log('测试代码:', code)
console.log('='.repeat(60))

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

function testParser(name: string, tokens: any[], parserClass: any) {
    console.log(`\n【${name}】`)
    console.log('-'.repeat(40))
    
    try {
        const parser = new parserClass(tokens)
        const cst = parser.Program()
        const cstTokens = collectTokenValues(cst)
        
        console.log(`✅ 解析成功`)
        console.log(`  CST中的tokens: ${cstTokens.length}个`)
        console.log(`  Tokens:`, cstTokens.join(', '))
        
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
            console.log(`  ✅ Token完整保留`)
        }
        
    } catch (error: any) {
        console.log(`❌ 解析失败: ${error.message}`)
    }
}

// 测试 ES6
const lexer6 = new SubhutiLexer(es6Tokens)
const tokens6 = lexer6.lexer(code)
testParser('ES6Parser', tokens6, Es6Parser)

// 测试 ES2020
const lexer2020 = new SubhutiLexer(es2020Tokens)
const tokens2020 = lexer2020.lexer(code)
testParser('ES2020Parser', tokens2020, Es2020Parser)

console.log('\n' + '='.repeat(60))






