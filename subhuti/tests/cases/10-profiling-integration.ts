/**
 * 测试：性能分析器和调试器集成（v2.0）
 * 
 * 验证目标：
 * 1. 调试器完整追踪（含缓存命中）
 * 2. 性能分析器统计准确
 * 3. 缓存命中/未命中分别记录
 * 4. 观测层不影响解析结果
 */

import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"
import SubhutiLexer from "../../src/SubhutiLexer.ts"
import {createKeywordToken, createRegToken} from "../../src/struct/SubhutiCreateToken.ts"
import SubhutiTokenConsumer from "../../src/SubhutiTokenConsumer.ts"

// ============================================
// 简单语法：if (x) { y }
// ============================================

const tokens = [
    createKeywordToken('IfTok', 'if'),
    createKeywordToken('LParen', '('),
    createKeywordToken('RParen', ')'),
    createKeywordToken('LBrace', '{'),
    createKeywordToken('RBrace', '}'),
    createRegToken('Identifier', /[a-z]+/)
]

class TestTokenConsumer extends SubhutiTokenConsumer {
    IfTok() { return this.instance.consume('IfTok') }
    LParen() { return this.instance.consume('LParen') }
    RParen() { return this.instance.consume('RParen') }
    LBrace() { return this.instance.consume('LBrace') }
    RBrace() { return this.instance.consume('RBrace') }
    Identifier() { return this.instance.consume('Identifier') }
}

@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
    @SubhutiRule
    Program() {
        this.Statement()
    }
    
    @SubhutiRule
    Statement() {
        this.IfStatement()
    }
    
    @SubhutiRule
    IfStatement() {
        this.tokenConsumer.IfTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.Block()
    }
    
    @SubhutiRule
    Expression() {
        this.tokenConsumer.Identifier()
    }
    
    @SubhutiRule
    Block() {
        this.tokenConsumer.LBrace()
        this.tokenConsumer.Identifier()
        this.tokenConsumer.RBrace()
    }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('测试：性能分析器和调试器集成（v2.0）')
console.log('='.repeat(60))

// 测试1：第一次解析（缓存未命中）
console.log('\n【测试1】第一次解析（建立缓存）')
{
    const lexer = new SubhutiLexer(tokens)
    const tokenStream = lexer.tokenize('if (x) { y }')
    
    const parser = new TestParser(tokenStream, TestTokenConsumer)
        .cache()       // 启用缓存
        .debug()       // 启用调试
        .profiling()   // 启用性能分析
    
    const cst = parser.Program()
    
    // 验证解析结果
    if (cst?.name === 'Program' && cst.children?.length === 1) {
        console.log('✓ CST 解析成功')
    } else {
        console.error('✗ CST 解析失败')
    }
    
    // 获取调试轨迹
    const trace = parser.getDebugTrace()
    if (trace) {
        console.log('\n调试轨迹:')
        console.log(trace)
        
        // 验证：第一次解析不应有缓存标记
        if (!trace.includes('⚡CACHED')) {
            console.log('\n✓ 验证通过：第一次解析无缓存命中')
        } else {
            console.error('\n✗ 验证失败：第一次解析不应有缓存')
        }
    }
    
    // 获取性能报告
    const stats = parser.getProfilingStats()
    if (stats) {
        console.log('\n性能统计:')
        for (const [ruleName, stat] of stats) {
            console.log(`  ${ruleName}:`)
            console.log(`    总调用: ${stat.totalCalls}`)
            console.log(`    实际执行: ${stat.actualExecutions}`)
            console.log(`    缓存命中: ${stat.cacheHits}`)
        }
        
        // 验证：第一次解析全部实际执行
        let allExecuted = true
        for (const stat of stats.values()) {
            if (stat.totalCalls !== stat.actualExecutions || stat.cacheHits !== 0) {
                allExecuted = false
                break
            }
        }
        
        if (allExecuted) {
            console.log('\n✓ 验证通过：第一次解析全部实际执行（无缓存）')
        } else {
            console.error('\n✗ 验证失败：第一次解析应该全部实际执行')
        }
    }
}

// 测试2：第二次解析（缓存命中）
console.log('\n' + '='.repeat(60))
console.log('【测试2】第二次解析（使用缓存）')
{
    const lexer = new SubhutiLexer(tokens)
    const tokenStream = lexer.tokenize('if (x) { y }')
    
    const parser = new TestParser(tokenStream, TestTokenConsumer)
        .cache()       // 启用缓存
        .debug()       // 启用调试
        .profiling()   // 启用性能分析
    
    // 第一次解析（建立缓存）
    parser.Program()
    
    // 清空调试轨迹
    parser.debuggerInstance?.clear()
    
    // 重置 token 流（模拟第二次解析）
    parser.setTokens(lexer.tokenize('if (x) { y }'))
    
    // 第二次解析（使用缓存）
    const cst = parser.Program()
    
    // 验证解析结果
    if (cst?.name === 'Program' && cst.children?.length === 1) {
        console.log('✓ CST 解析成功')
    } else {
        console.error('✗ CST 解析失败')
    }
    
    // 获取调试轨迹
    const trace = parser.getDebugTrace()
    if (trace) {
        console.log('\n调试轨迹:')
        console.log(trace)
        
        // 验证：第二次解析应有缓存标记
        if (trace.includes('⚡CACHED')) {
            console.log('\n✓ 验证通过：第二次解析有缓存命中标记')
        } else {
            console.error('\n✗ 验证失败：第二次解析应该有缓存标记')
        }
    }
    
    // 获取性能报告
    console.log('\n' + parser.getProfilingReport())
    
    // 获取统计数据验证
    const stats = parser.getProfilingStats()
    if (stats) {
        // 验证：第二次解析应该有缓存命中
        let hasCacheHits = false
        for (const stat of stats.values()) {
            if (stat.cacheHits > 0) {
                hasCacheHits = true
                break
            }
        }
        
        if (hasCacheHits) {
            console.log('\n✓ 验证通过：第二次解析有缓存命中')
        } else {
            console.error('\n✗ 验证失败：第二次解析应该有缓存命中')
        }
        
        // 验证：总调用 = 实际执行 + 缓存命中
        let statisticsCorrect = true
        for (const stat of stats.values()) {
            if (stat.totalCalls !== stat.actualExecutions + stat.cacheHits) {
                statisticsCorrect = false
                console.error(`✗ 统计错误: ${stat.ruleName} 总调用(${stat.totalCalls}) ≠ 执行(${stat.actualExecutions}) + 缓存(${stat.cacheHits})`)
            }
        }
        
        if (statisticsCorrect) {
            console.log('✓ 验证通过：统计数据一致（总调用 = 实际执行 + 缓存命中）')
        }
    }
}

// 测试3：观测层不影响解析结果
console.log('\n' + '='.repeat(60))
console.log('【测试3】观测层不影响解析结果')
{
    const lexer = new SubhutiLexer(tokens)
    
    // 不启用观测
    const tokenStream1 = lexer.tokenize('if (x) { y }')
    const parser1 = new TestParser(tokenStream1, TestTokenConsumer)
    const cst1 = parser1.Program()
    
    // 启用所有观测
    const tokenStream2 = lexer.tokenize('if (x) { y }')
    const parser2 = new TestParser(tokenStream2, TestTokenConsumer)
        .cache()
        .debug()
        .profiling()
    const cst2 = parser2.Program()
    
    // 比较 CST 结构
    const structure1 = JSON.stringify(cst1, null, 2)
    const structure2 = JSON.stringify(cst2, null, 2)
    
    if (structure1 === structure2) {
        console.log('✓ 验证通过：观测层不影响解析结果')
    } else {
        console.error('✗ 验证失败：观测层改变了解析结果')
        console.log('无观测:', structure1)
        console.log('有观测:', structure2)
    }
}

console.log('\n' + '='.repeat(60))
console.log('✅ 所有测试完成')
console.log('='.repeat(60))

