/**
 * 测试错误信息中的规则路径显示
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
    createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    createKeywordToken('Assign', '='),
    createRegToken('Number', /[0-9]+/),
    createKeywordToken('Semicolon', ';'),
    createRegToken('Whitespace', /\s+/, true),  // 跳过空格
]

// 创建 token 对象（用于 consume）
const testTokensObj = {
    LetTok: testTokens[0],
    Identifier: testTokens[1],
    Assign: testTokens[2],
    Number: testTokens[3],
    Semicolon: testTokens[4],
}

class TestTokenConsumer extends SubhutiTokenConsumer {
    LetTok() { return this.consume(testTokensObj.LetTok) }
    Identifier() { return this.consume(testTokensObj.Identifier) }
    Assign() { return this.consume(testTokensObj.Assign) }
    Number() { return this.consume(testTokensObj.Number) }
    Semicolon() { return this.consume(testTokensObj.Semicolon) }
}

// ============================================
// 测试：触发"成功但不消费 token"错误
// ============================================

@Subhuti
class BadParser extends SubhutiParser<TestTokenConsumer> {
    constructor(tokens: SubhutiMatchToken[]) {
        super(tokens)
    }

    getTokenConsumerConstructor(): SubhutiTokenConsumerConstructor<TestTokenConsumer> {
        return TestTokenConsumer
    }

    @SubhutiRule
    Program() {
        this.Statement()
        return this.curCst
    }

    @SubhutiRule
    Statement() {
        // ❌ 错误：成功但不消费任何 token
        return this.curCst
    }
}

console.log('🧪 测试错误信息中的规则路径显示\n')
console.log('='.repeat(80))

try {
    const lexer = new SubhutiLexer(testTokens)
    const tokens = lexer.tokenize('let x = 1')
    const parser = new BadParser(tokens)
    parser.Program()
    
    console.log('\n❌ 失败：应该抛出错误')
} catch (e: any) {
    if (e instanceof ParsingError && e.type === 'infinite-loop') {
        console.log('\n✅ 成功：检测到无限循环错误\n')
        console.log('错误信息:')
        console.log('='.repeat(80))
        console.log(e.message)
        console.log('='.repeat(80))
        
        // 检查是否包含规则路径
        if (e.rulePath) {
            console.log('\n✅ 规则路径已包含在错误中')
            console.log('\n规则路径内容:')
            console.log(e.rulePath)
        } else {
            console.log('\n⚠️  规则路径未包含（可能没有开启调试模式）')
        }
        
        // 检查 hint
        if (e.hint) {
            console.log('\n✅ Hint 已包含')
            console.log(`Hint: ${e.hint}`)
        }
    } else {
        console.log('\n❌ 失败：错误类型不正确')
        console.log('实际错误:', e.message)
    }
}

console.log('\n' + '='.repeat(80))
console.log('✅ 测试完成！')

