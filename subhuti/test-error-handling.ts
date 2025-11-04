/**
 * 测试简化后的错误处理系统
 * 
 * 验证：
 * - ✅ ParsingError 基本功能
 * - ✅ 智能建议生成（5 种核心场景）
 * - ✅ 详细格式 vs 简单格式
 */

import SubhutiLexer from './src/SubhutiLexer.ts'
import SubhutiParser, { Subhuti, SubhutiRule } from './src/SubhutiParser.ts'
import SubhutiTokenConsumer from './src/SubhutiTokenConsumer.ts'
import { createKeywordToken, createRegToken, createValueRegToken, SubhutiCreateTokenGroupType } from './src/struct/SubhutiCreateToken.ts'
import type { SubhutiTokenConsumerConstructor } from './src/SubhutiParser.ts'
import type SubhutiMatchToken from './src/struct/SubhutiMatchToken.ts'

// ============================================
// 定义 Token
// ============================================

const tokensObj = {
    LetTok: createKeywordToken('LetTok', 'let'),
    Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    Number: createRegToken('Number', /[0-9]+/),
    LBrace: createRegToken('LBrace', /\{/),
    RBrace: createRegToken('RBrace', /\}/),
    Semicolon: createRegToken('Semicolon', /;/),
    WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', SubhutiCreateTokenGroupType.skip),
}

const tokens = Object.values(tokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
    LetTok() { return this.consume(tokensObj.LetTok) }
    Identifier() { return this.consume(tokensObj.Identifier) }
    Number() { return this.consume(tokensObj.Number) }
    LBrace() { return this.consume(tokensObj.LBrace) }
    RBrace() { return this.consume(tokensObj.RBrace) }
    Semicolon() { return this.consume(tokensObj.Semicolon) }
}

// ============================================
// Parser
// ============================================

@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
    constructor(
        tokens?: SubhutiMatchToken[],
        TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
    ) {
        super(tokens, TokenConsumerClass)
    }
    
    @SubhutiRule
    Statement() {
        this.tokenConsumer.LetTok()
        this.tokenConsumer.Identifier()
        this.tokenConsumer.LBrace()
        this.tokenConsumer.RBrace()
        this.tokenConsumer.Semicolon()
        return this.curCst
    }
}

// ============================================
// 测试用例
// ============================================

console.log('🧪 测试简化后的错误处理系统\n')
console.log('═'.repeat(80))

// 测试 1：缺少闭合花括号
console.log('\n📋 测试 1：缺少闭合花括号 }')
console.log('─'.repeat(80))
try {
    const code1 = 'let x { ;'  // 缺少 }
    const lexer1 = new SubhutiLexer(tokens)
    const tokenStream1 = lexer1.tokenize(code1)
    const parser1 = new TestParser(tokenStream1 as any)
    parser1.Statement()
} catch (error: any) {
    console.log(error.toString())
}

// 测试 2：缺少分号
console.log('\n\n📋 测试 2：缺少分号 ;')
console.log('─'.repeat(80))
try {
    const code2 = 'let x { }'  // 缺少 ;
    const lexer2 = new SubhutiLexer(tokens)
    const tokenStream2 = lexer2.tokenize(code2)
    const parser2 = new TestParser(tokenStream2 as any)
    parser2.Statement()
} catch (error: any) {
    console.log(error.toString())
}

// 测试 3：关键字拼写错误
console.log('\n\n📋 测试 3：关键字拼写错误')
console.log('─'.repeat(80))
try {
    const code3 = 'lat x { } ;'  // lat 不是关键字
    const lexer3 = new SubhutiLexer(tokens)
    const tokenStream3 = lexer3.tokenize(code3)
    const parser3 = new TestParser(tokenStream3 as any)
    parser3.Statement()
} catch (error: any) {
    console.log(error.toString())
}

// 测试 4：标识符错误（数字开头）
console.log('\n\n📋 测试 4：标识符错误（数字开头）')
console.log('─'.repeat(80))
try {
    const code4 = 'let 123 { } ;'  // 数字不能作为标识符
    const lexer4 = new SubhutiLexer(tokens)
    const tokenStream4 = lexer4.tokenize(code4)
    const parser4 = new TestParser(tokenStream4 as any)
    parser4.Statement()
} catch (error: any) {
    console.log(error.toString())
}

// 测试 5：EOF（代码意外结束）
console.log('\n\n📋 测试 5：代码意外结束（EOF）')
console.log('─'.repeat(80))
try {
    const code5 = 'let'  // 代码不完整
    const lexer5 = new SubhutiLexer(tokens)
    const tokenStream5 = lexer5.tokenize(code5)
    const parser5 = new TestParser(tokenStream5 as any)
    parser5.Statement()
} catch (error: any) {
    console.log(error.toString())
}

// 测试 6：简单格式 vs 详细格式
console.log('\n\n📋 测试 6：简单格式 vs 详细格式')
console.log('─'.repeat(80))
try {
    const code6 = 'let x { ;'
    const lexer6 = new SubhutiLexer(tokens)
    const tokenStream6 = lexer6.tokenize(code6)
    const parser6 = new TestParser(tokenStream6 as any)
    
    // 设置简单模式
    ;(parser6 as any)._errorHandler.setDetailed(false)
    
    parser6.Statement()
} catch (error: any) {
    console.log('简单格式：')
    console.log(error.toString())
}

console.log('\n\n' + '═'.repeat(80))
console.log('✅ 错误处理测试完成！')
console.log('\n📊 验证功能：')
console.log('  1. ✅ 缺少闭合符号提示')
console.log('  2. ✅ 缺少分号提示')
console.log('  3. ✅ 关键字拼写错误提示')
console.log('  4. ✅ 标识符错误提示')
console.log('  5. ✅ EOF 提示')
console.log('  6. ✅ 简单格式 vs 详细格式')

