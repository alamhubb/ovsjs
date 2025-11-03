/**
 * 分别测试 MemberExpression 和 CallExpression
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
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

function testWithBothParsers(code: string, testName: string) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`【${testName}】${code}`)
    console.log('-'.repeat(60))
    
    // 测试 ES6
    try {
        const lexer6 = new SubhutiLexer(es6Tokens)
        const tokens6 = lexer6.lexer(code)
        const parser6 = new Es6Parser(tokens6)
        const cst6 = parser6.Program()
        const cstTokens6 = collectTokenValues(cst6)
        console.log(`ES6:  ✅ ${cstTokens6.length}个tokens -`, cstTokens6.join(', '))
    } catch (error: any) {
        console.log(`ES6:  ❌ 失败 -`, error.message.slice(0, 50))
    }
    
    // 测试 ES2020
    try {
        const lexer2020 = new SubhutiLexer(es2020Tokens)
        const tokens2020 = lexer2020.lexer(code)
        const parser2020 = new Es2020Parser(tokens2020)
        const cst2020 = parser2020.Program()
        const cstTokens2020 = collectTokenValues(cst2020)
        console.log(`ES2020: ✅ ${cstTokens2020.length}个tokens -`, cstTokens2020.join(', '))
    } catch (error: any) {
        console.log(`ES2020: ❌ 失败 -`, error.message.slice(0, 50))
    }
}

// 测试各种情况
testWithBothParsers(`Math.PI`, '成员访问')
testWithBothParsers(`Math.max`, '成员访问（函数名）')
testWithBothParsers(`foo()`, '简单调用')
testWithBothParsers(`Math.max()`, '成员调用（无参数）')
testWithBothParsers(`Math.max(1)`, '成员调用（1个参数）')
testWithBothParsers(`Math.max(1, 2)`, '成员调用（2个参数）')
testWithBothParsers(`import('./module.js')`, 'import调用')

console.log(`\n${'='.repeat(60)}`)



