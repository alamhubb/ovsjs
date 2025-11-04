/**
 * 快速测试新的 SubhutiParser
 */

import SubhutiParser, { Subhuti, SubhutiRule } from '../src/parser/SubhutiParser.ts'
import SubhutiLexer from '../src/parser/SubhutiLexer.ts'
import SubhutiTokenConsumer from '../src/parser/SubhutiTokenConsumer.ts'
import { createKeywordToken, createRegToken } from '../src/struct/SubhutiCreateToken.ts'

// 定义简单的 Token
const tokens = [
    createRegToken('WhiteSpace', /\s+/, true),  // 跳过空格
    createKeywordToken('IfTok', 'if'),
    createKeywordToken('ElseTok', 'else'),
    createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    createRegToken('Number', /[0-9]+/),
    createRegToken('LParen', /\(/),
    createRegToken('RParen', /\)/),
    createRegToken('LBrace', /\{/),
    createRegToken('RBrace', /\}/),
    createRegToken('Semicolon', /;/),
    createRegToken('Plus', /\+/),
    createRegToken('Assign', /=/),
]

// 定义 TokenConsumer
class TestTokenConsumer extends SubhutiTokenConsumer {
    IfTok() { this.instance.consume('IfTok') }
    ElseTok() { this.instance.consume('ElseTok') }
    Identifier() { return this.instance.consume('Identifier') }
    Number() { return this.instance.consume('Number') }
    LParen() { this.instance.consume('LParen') }
    RParen() { this.instance.consume('RParen') }
    LBrace() { this.instance.consume('LBrace') }
    RBrace() { this.instance.consume('RBrace') }
    Semicolon() { this.instance.consume('Semicolon') }
    Plus() { this.instance.consume('Plus') }
    Assign() { this.instance.consume('Assign') }
}

// 定义简单的 Parser
@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
    constructor(tokens) {
        super(tokens, TestTokenConsumer)
    }
    
    @SubhutiRule
    Program() {
        this.Many(() => this.Statement())
    }
    
    @SubhutiRule
    Statement() {
        this.Or([
            { alt: () => this.IfStatement() },
            { alt: () => this.Assignment() }
        ])
    }
    
    @SubhutiRule
    IfStatement() {
        this.tokenConsumer.IfTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.Statement()
        this.tokenConsumer.RBrace()
        this.Option(() => {
            this.tokenConsumer.ElseTok()
            this.tokenConsumer.LBrace()
            this.Statement()
            this.tokenConsumer.RBrace()
        })
    }
    
    @SubhutiRule
    Assignment() {
        this.tokenConsumer.Identifier()
        this.tokenConsumer.Assign()
        this.Expression()
        this.tokenConsumer.Semicolon()
    }
    
    @SubhutiRule
    Expression() {
        this.Or([
            { alt: () => {
                this.tokenConsumer.Identifier()
                this.tokenConsumer.Plus()
                this.tokenConsumer.Number()
            }},
            { alt: () => this.tokenConsumer.Identifier() },
            { alt: () => this.tokenConsumer.Number() }
        ])
    }
}

// 测试用例
console.log('🧪 测试新的 SubhutiParser\n')

// 测试1：简单赋值
console.log('测试1：简单赋值')
const code1 = 'x = 5;'
const lexer1 = new SubhutiLexer(tokens)
const tokenStream1 = lexer1.tokenize(code1)
const parser1 = new TestParser(tokenStream1)

try {
    const cst1 = parser1.Program()
    console.log('✅ 解析成功')
    console.log('CST 节点数:', cst1?.children?.length || 0)
} catch (error) {
    console.log('❌ 解析失败:', error.message)
}

// 测试2：if语句
console.log('\n测试2：if语句')
const code2 = 'if (x) { y = 1; }'
const lexer2 = new SubhutiLexer(tokens)
const tokenStream2 = lexer2.tokenize(code2)
const parser2 = new TestParser(tokenStream2)

try {
    const cst2 = parser2.Program()
    console.log('✅ 解析成功')
    console.log('CST 节点数:', cst2?.children?.length || 0)
} catch (error) {
    console.log('❌ 解析失败:', error.message)
}

// 测试3：Packrat Parsing 统计
console.log('\n测试3：Packrat Parsing 统计')
const code3 = 'x = 1; y = 2; z = 3;'
const lexer3 = new SubhutiLexer(tokens)
const tokenStream3 = lexer3.tokenize(code3)
const parser3 = new TestParser(tokenStream3)

try {
    const cst3 = parser3.Program()
    const stats = parser3.getMemoStats()
    console.log('✅ 解析成功')
    console.log('缓存命中:', stats.hits)
    console.log('缓存未命中:', stats.misses)
    console.log('缓存大小:', stats.cacheSize)
    console.log('命中率:', stats.hitRate)
} catch (error) {
    console.log('❌ 解析失败:', error.message)
}

console.log('\n🎉 所有测试完成')

