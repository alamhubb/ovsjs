/**
 * 测试 LeftHandSideExpression 调用链
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

const code = `Math.max(1, 2)`

console.log('测试代码:', code)
console.log('='.repeat(60))

// ES6Parser - LeftHandSideExpression
console.log('\n【ES6Parser - LeftHandSideExpression】')
try {
    const lexer6 = new SubhutiLexer(es6Tokens)
    const tokens6 = lexer6.lexer(code)
    const parser6 = new Es6Parser(tokens6)
    
    const cst6 = (parser6 as any).LeftHandSideExpression()
    const tokens6Values = collectTokenValues(cst6)
    
    console.log('✅ CST:', cst6 ? `${cst6.name} (${cst6.children?.length || 0} children)` : 'undefined')
    console.log('✅ Tokens:', tokens6Values.join(', '))
    
} catch (error: any) {
    console.log('❌ 错误:', error.message)
}

// ES2020Parser - LeftHandSideExpression
console.log('\n【ES2020Parser - LeftHandSideExpression】')
try {
    const lexer2020 = new SubhutiLexer(es2020Tokens)
    const tokens2020 = lexer2020.lexer(code)
    const parser2020 = new Es2020Parser(tokens2020)
    
    const cst2020 = (parser2020 as any).LeftHandSideExpression()
    const tokens2020Values = collectTokenValues(cst2020)
    
    console.log('✅ CST:', cst2020 ? `${cst2020.name} (${cst2020.children?.length || 0} children)` : 'undefined')
    console.log('✅ Tokens:', tokens2020Values.join(', '))
    
} catch (error: any) {
    console.log('❌ 错误:', error.message)
}

// ES2020Parser - OptionalExpression (第一个分支)
console.log('\n【ES2020Parser - OptionalExpression】')
try {
    const lexer2020 = new SubhutiLexer(es2020Tokens)
    const tokens2020 = lexer2020.lexer(code)
    const parser2020 = new Es2020Parser(tokens2020)
    
    const cst2020 = (parser2020 as any).OptionalExpression()
    const tokens2020Values = collectTokenValues(cst2020)
    
    console.log('✅ CST:', cst2020 ? `${cst2020.name} (${cst2020.children?.length || 0} children)` : 'undefined')
    console.log('✅ Tokens:', tokens2020Values.join(', '))
    
} catch (error: any) {
    console.log('❌ 错误:', error.message.slice(0, 100))
}

console.log('\n' + '='.repeat(60))

