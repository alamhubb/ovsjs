/**
 * 直接测试 CallExpression 规则
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `Math.max(1, 2)`

console.log('测试代码:', code)
console.log('='.repeat(60))

// ES6Parser测试
console.log('\n【ES6Parser】')
try {
    const lexer6 = new SubhutiLexer(es6Tokens)
    const tokens6 = lexer6.lexer(code)
    const parser6 = new Es6Parser(tokens6)
    
    console.log('调用 CallExpression()...')
    const cst6 = (parser6 as any).CallExpression()
    
    console.log('✅ CST:',  cst6 ? `${cst6.name} (${cst6.children?.length || 0} children)` : 'undefined')
    
} catch (error: any) {
    console.log('❌ 错误:', error.message)
    console.log('堆栈:', error.stack?.split('\n').slice(0, 5).join('\n'))
}

// ES2020Parser测试
console.log('\n【ES2020Parser】')
try {
    const lexer2020 = new SubhutiLexer(es2020Tokens)
    const tokens2020 = lexer2020.lexer(code)
    const parser2020 = new Es2020Parser(tokens2020)
    
    console.log('调用 CallExpression()...')
    const cst2020 = (parser2020 as any).CallExpression()
    
    console.log('✅ CST:', cst2020 ? `${cst2020.name} (${cst2020.children?.length || 0} children)` : 'undefined')
    
} catch (error: any) {
    console.log('❌ 错误:', error.message)
    console.log('堆栈:', error.stack?.split('\n').slice(0, 5).join('\n'))
}

console.log('\n' + '='.repeat(60))






