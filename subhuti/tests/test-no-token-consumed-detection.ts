/**
 * 测试新增的"成功但不消费 token"检测
 * 
 * 测试目标：
 * 1. 检测 A：_parseSuccess=true 但返回 undefined
 * 2. 检测 B：成功但不消费 token（仅在 allowErrorDepth=0 时）
 */

import SubhutiLexer from "../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken } from "../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../src/SubhutiParser.ts"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken"
import { ParsingError } from "../src/SubhutiError.ts"

// ============================================
// 定义Token集
// ============================================

const testTokens = [
    createKeywordToken('LetTok', 'let'),
    createKeywordToken('ConstTok', 'const'),
    createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    createKeywordToken('Assign', '='),
    createRegToken('Number', /[0-9]+/),
    createKeywordToken('Semicolon', ';'),
    createRegToken('Whitespace', /\s+/, true),  // 跳过空格
]

// ============================================
// 定义 TokenConsumer
// ============================================

// 创建 token 对象（用于 consume）
const testTokensObj = {
    LetTok: testTokens[0],
    ConstTok: testTokens[1],
    Identifier: testTokens[2],
    Assign: testTokens[3],
    Number: testTokens[4],
    Semicolon: testTokens[5],
}

class TestTokenConsumer extends SubhutiTokenConsumer {
    LetTok() { return this.consume(testTokensObj.LetTok) }
    ConstTok() { return this.consume(testTokensObj.ConstTok) }
    Identifier() { return this.consume(testTokensObj.Identifier) }
    Assign() { return this.consume(testTokensObj.Assign) }
    Number() { return this.consume(testTokensObj.Number) }
    Semicolon() { return this.consume(testTokensObj.Semicolon) }
}

// ============================================
// 测试 1：检测 _parseSuccess=true 但返回 undefined
// ============================================

@Subhuti
class BadParser1 extends SubhutiParser<TestTokenConsumer> {
    constructor(tokens: SubhutiMatchToken[]) {
        super(tokens)
    }

    getTokenConsumerConstructor(): SubhutiTokenConsumerConstructor<TestTokenConsumer> {
        return TestTokenConsumer
    }

    @SubhutiRule
    Statement() {
        this.tokenConsumer.LetTok()
        this.tokenConsumer.Identifier()
        // ❌ 错误：成功但返回 undefined（没有调用 this.parserFail()）
        return undefined
    }
}

console.log('[测试 1] 检测：_parseSuccess=true 但返回 undefined\n')

try {
    const lexer1 = new SubhutiLexer(testTokens)
    const tokens1 = lexer1.tokenize('let x')
    const parser1 = new BadParser1(tokens1)
    parser1.Statement()
    
    console.log('  ❌ 失败：应该抛出错误')
} catch (e: any) {
    if (e instanceof ParsingError && e.type === 'infinite-loop') {
        console.log('  ✅ 成功：检测到错误')
        console.log(`  错误类型: ${e.type}`)
        console.log(`  Hint: ${e.hint}`)
        if (e.hint?.includes('parserFail')) {
            console.log('  ✅ 提示信息正确')
        }
    } else {
        console.log('  ❌ 失败：错误类型不正确')
        console.log('  实际错误:', e.message)
    }
}

// ============================================
// 测试 2：检测成功但不消费 token（普通规则）
// ============================================

@Subhuti
class BadParser2 extends SubhutiParser<TestTokenConsumer> {
    constructor(tokens: SubhutiMatchToken[]) {
        super(tokens)
    }

    getTokenConsumerConstructor(): SubhutiTokenConsumerConstructor<TestTokenConsumer> {
        return TestTokenConsumer
    }

    @SubhutiRule
    Statement() {
        // ❌ 错误：成功但不消费任何 token
        // （没有调用任何 token 消费方法）
        return this.curCst
    }
}

console.log('\n[测试 2] 检测：成功但不消费 token（普通规则）\n')

try {
    const lexer2 = new SubhutiLexer(testTokens)
    const tokens2 = lexer2.tokenize('let x')
    const parser2 = new BadParser2(tokens2)
    parser2.Statement()
    
    console.log('  ❌ 失败：应该抛出错误')
} catch (e: any) {
    if (e instanceof ParsingError && e.type === 'infinite-loop') {
        console.log('  ✅ 成功：检测到错误')
        console.log(`  错误类型: ${e.type}`)
        console.log(`  Hint: ${e.hint}`)
        if (e.hint?.includes('消费至少一个 token')) {
            console.log('  ✅ 提示信息正确')
        }
    } else {
        console.log('  ❌ 失败：错误类型不正确')
        console.log('  实际错误:', e.message)
    }
}

// ============================================
// 测试 3：Option 允许不消费 token（不应该报错）
// ============================================

@Subhuti
class GoodParser extends SubhutiParser<TestTokenConsumer> {
    constructor(tokens: SubhutiMatchToken[]) {
        super(tokens)
    }

    getTokenConsumerConstructor(): SubhutiTokenConsumerConstructor<TestTokenConsumer> {
        return TestTokenConsumer
    }

    @SubhutiRule
    Statement() {
        // ✅ 正确：Option 允许匹配 0 次
        this.Option(() => {
            this.tokenConsumer.LetTok()
        })
        return this.curCst
    }
}

console.log('\n[测试 3] Option 允许不消费 token（不应该报错）\n')

try {
    const lexer3 = new SubhutiLexer(testTokens)
    const tokens3 = lexer3.tokenize('const x')  // 没有 let
    const parser3 = new GoodParser(tokens3)
    parser3.Statement()
    
    console.log('  ✅ 成功：Option 正常工作，没有误报')
} catch (e: any) {
    console.log('  ❌ 失败：Option 不应该报错')
    console.log('  错误:', e.message)
}

console.log('\n' + '='.repeat(80))
console.log('✅ 所有检测测试完成！')

