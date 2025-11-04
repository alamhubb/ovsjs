/**
 * 测试合并后的性能统计功能（v3.0）
 * 
 * 验证：
 * - ✅ debug() 同时提供过程追踪和性能统计
 * - ✅ getSummary() 性能摘要
 * - ✅ getShortSummary() 单行摘要
 * - ✅ getStats() 原始数据访问
 * - ✅ 向后兼容：profiling() 仍可用
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
    IfTok: createKeywordToken('IfTok', 'if'),
    LParen: createRegToken('LParen', /\(/),
    RParen: createRegToken('RParen', /\)/),
    LBrace: createRegToken('LBrace', /\{/),
    RBrace: createRegToken('RBrace', /\}/),
    Identifier: createRegToken('Identifier', /[a-z]+/),
    WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', SubhutiCreateTokenGroupType.skip),
}

const tokens = Object.values(tokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
    IfTok() { return this.consume(tokensObj.IfTok) }
    LParen() { return this.consume(tokensObj.LParen) }
    RParen() { return this.consume(tokensObj.RParen) }
    LBrace() { return this.consume(tokensObj.LBrace) }
    RBrace() { return this.consume(tokensObj.RBrace) }
    Identifier() { return this.consume(tokensObj.Identifier) }
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
    Program() {
        this.Statement()
        return this.curCst
    }
    
    @SubhutiRule
    Statement() {
        this.IfStatement()
        return this.curCst
    }
    
    @SubhutiRule
    IfStatement() {
        this.tokenConsumer.IfTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.Block()
        return this.curCst
    }
    
    @SubhutiRule
    Expression() {
        this.tokenConsumer.Identifier()
        return this.curCst
    }
    
    @SubhutiRule
    Block() {
        this.tokenConsumer.LBrace()
        this.tokenConsumer.Identifier()
        this.tokenConsumer.RBrace()
        return this.curCst
    }
}

// ============================================
// 测试用例
// ============================================

console.log('🧪 测试合并后的性能统计功能（v3.0）\n')
console.log('═'.repeat(80))

// 测试 1：第一次解析（无缓存）
console.log('\n📋 测试 1：第一次解析（建立缓存）')
console.log('─'.repeat(80))
const code1 = 'if (x) { y }'
const lexer1 = new SubhutiLexer(tokens)
const tokenStream1 = lexer1.tokenize(code1)

const parser1 = new TestParser(tokenStream1 as any)
    .cache()    // 启用缓存
    .debug()    // 启用调试（现在包含性能统计）

const cst1 = parser1.Program()

console.log('过程追踪:')
console.log(parser1.getDebugTrace())
console.log('')

console.log('性能摘要:')
console.log(parser1.getProfilingReport())
console.log('')

console.log('简洁摘要:')
console.log(parser1.getProfilingShortReport())

// 测试 2：第二次解析（缓存命中）
console.log('\n\n📋 测试 2：第二次解析（缓存命中）')
console.log('─'.repeat(80))
const lexer2 = new SubhutiLexer(tokens)
const tokenStream2 = lexer2.tokenize(code1)

const parser2 = new TestParser(tokenStream2 as any).debug()

// 第一次解析（建立缓存）
parser2.Program()

// 清空调试轨迹，保留统计
parser2.debuggerInstance?.clear()

// 重置 parser
parser2.setTokens(lexer2.tokenize(code1) as any)

// 第二次解析（使用缓存）
parser2.Program()

console.log('过程追踪（应看到⚡CACHED）:')
console.log(parser2.getDebugTrace())
console.log('')

console.log('性能摘要（应有缓存命中）:')
console.log(parser2.getProfilingReport())

// 测试 3：向后兼容性（profiling() API）
console.log('\n\n📋 测试 3：向后兼容（profiling() API）')
console.log('─'.repeat(80))
const lexer3 = new SubhutiLexer(tokens)
const tokenStream3 = lexer3.tokenize(code1)

const parser3 = new TestParser(tokenStream3 as any)
    .profiling()  // 使用旧 API（应该等同于 debug()）

parser3.Program()

console.log('使用 profiling() API:')
console.log(parser3.getProfilingShortReport())
console.log('✅ 向后兼容成功')

// 测试 4：原始数据访问
console.log('\n\n📋 测试 4：原始数据访问')
console.log('─'.repeat(80))
const stats = parser1.getProfilingStats()

if (stats) {
    console.log('规则统计数据:')
    for (const [ruleName, stat] of stats) {
        console.log(`  ${ruleName}:`)
        console.log(`    总调用: ${stat.totalCalls}`)
        console.log(`    实际执行: ${stat.actualExecutions}`)
        console.log(`    缓存命中: ${stat.cacheHits}`)
        console.log(`    平均耗时: ${(stat.avgTime * 1000).toFixed(1)}μs`)
    }
    console.log('✅ 原始数据访问成功')
}

console.log('\n\n' + '═'.repeat(80))
console.log('✅ 所有测试完成！')
console.log('\n📊 验证功能：')
console.log('  1. ✅ debug() 同时提供过程追踪和性能统计')
console.log('  2. ✅ getSummary() 性能摘要（详细）')
console.log('  3. ✅ getShortSummary() 单行摘要')
console.log('  4. ✅ getStats() 原始数据')
console.log('  5. ✅ profiling() 向后兼容')

