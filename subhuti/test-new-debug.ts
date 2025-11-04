/**
 * 测试新的简化版 SubhutiDebugger（方案C）
 * 
 * 验证功能：
 * - ✅ 规则执行（进入/退出）
 * - ✅ Token 消费（成功/失败）
 * - ✅ 缓存命中标识
 * - ✅ 耗时信息
 * - ✅ 嵌套层级（缩进）
 * - ✅ Or 分支选择
 * - ✅ 回溯标识
 */

import SubhutiLexer from './src/SubhutiLexer.ts'
import SubhutiParser, { Subhuti, SubhutiRule } from './src/SubhutiParser.ts'
import SubhutiTokenConsumer from './src/SubhutiTokenConsumer.ts'
import { createKeywordToken, createRegToken, createValueRegToken, SubhutiCreateTokenGroupType } from './src/struct/SubhutiCreateToken.ts'
import type { SubhutiTokenConsumerConstructor } from './src/SubhutiParser.ts'
import type SubhutiMatchToken from './src/struct/SubhutiMatchToken.ts'

// ============================================
// 1. 定义简单的 Token
// ============================================

const tokensObj = {
    ImportTok: createKeywordToken('ImportTok', 'import'),
    FromTok: createKeywordToken('FromTok', 'from'),
    Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    String: createRegToken('String', /"[^"]*"/),
    LBrace: createRegToken('LBrace', /\{/),
    RBrace: createRegToken('RBrace', /\}/),
    WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', SubhutiCreateTokenGroupType.skip),
}

const tokens = Object.values(tokensObj)

// ============================================
// 2. 定义 Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
    ImportTok() { return this.consume(tokensObj.ImportTok) }
    FromTok() { return this.consume(tokensObj.FromTok) }
    Identifier() { return this.consume(tokensObj.Identifier) }
    String() { return this.consume(tokensObj.String) }
    LBrace() { return this.consume(tokensObj.LBrace) }
    RBrace() { return this.consume(tokensObj.RBrace) }
}

// ============================================
// 3. 定义简单的 Parser
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
    ImportDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.ImportTok()
        this.ImportClause()
        this.tokenConsumer.FromTok()
        this.tokenConsumer.String()
        return this.curCst
    }
    
    @SubhutiRule
    ImportClause(): SubhutiCst | undefined {
        // Or 规则：测试分支选择
        this.Or([
            // 分支 1：{ name }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.Identifier()
                    this.tokenConsumer.RBrace()
                }
            },
            // 分支 2：name（简单形式）
            {
                alt: () => {
                    this.tokenConsumer.Identifier()
                }
            }
        ])
        return this.curCst
    }
}

// ============================================
// 4. 测试用例
// ============================================

console.log('🧪 测试新的简化版 SubhutiDebugger\n')
console.log('═'.repeat(80))

// 测试 1：成功的解析（Or 分支 1 成功）
console.log('\n📋 测试 1：Or 分支 1 成功')
console.log('─'.repeat(80))
const code1 = 'import { lodash } from "lodash"'
const lexer1 = new SubhutiLexer(tokens)
const tokenStream1 = lexer1.tokenize(code1)

// 调试：打印 tokenStream 结构
console.log('tokenStream1:', tokenStream1)
console.log('tokenStream1.tokens:', tokenStream1.tokens)
console.log('')

// 假设 tokenStream1 就是 tokens 数组
const parser1 = new TestParser(tokenStream1 as any).debug()  // 启用调试
const cst1 = parser1.ImportDeclaration()

console.log(parser1.getDebugTrace())
console.log('\n✅ 解析结果:', cst1 ? 'SUCCESS' : 'FAILED')

// 测试 2：Or 分支回溯（分支 1 失败，分支 2 成功）
console.log('\n\n📋 测试 2：Or 分支回溯（分支 1 失败 → 分支 2 成功）')
console.log('─'.repeat(80))
const code2 = 'import lodash from "lodash"'
const lexer2 = new SubhutiLexer(tokens)
const tokenStream2 = lexer2.tokenize(code2)
const parser2 = new TestParser(tokenStream2 as any).debug()  // 启用调试
const cst2 = parser2.ImportDeclaration()

console.log(parser2.getDebugTrace())
console.log('\n✅ 解析结果:', cst2 ? 'SUCCESS' : 'FAILED')

// 测试 3：缓存命中（第二次解析同一规则）
console.log('\n\n📋 测试 3：缓存命中（第二次解析）')
console.log('─'.repeat(80))
const lexer3 = new SubhutiLexer(tokens)
const tokenStream3 = lexer3.tokenize(code1)
const parser3 = new TestParser(tokenStream3 as any).debug()

// 第一次解析
parser3.ImportDeclaration()
parser3.debuggerInstance?.clear()  // 清空调试记录

// 重置 parser（模拟第二次解析）
;(parser3 as any).tokenIndex = 0
;(parser3 as any)._parseFailed = false

// 第二次解析（应该命中缓存）
parser3.ImportDeclaration()
console.log(parser3.getDebugTrace())
console.log('\n✅ 应该看到 ⚡CACHED 标识')

console.log('\n\n' + '═'.repeat(80))
console.log('✅ 所有测试完成！')
console.log('\n📊 预期输出格式：')
console.log('  ➡️  规则名    ⚡CACHED  (耗时ms)')
console.log('    🔹 Consume  token[index] - value - <TokenName>  ✅')
console.log('    🔀 Or[N branches]  trying #index  @token[index]')
console.log('    ⏪ Backtrack  token[from] → token[to]  (reason)')

