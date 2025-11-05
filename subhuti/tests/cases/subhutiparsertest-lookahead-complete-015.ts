/**
 * 测试 15：完整前瞻功能测试
 * 
 * 测试目标：
 * - tokenIs/tokenNotIs（单token前瞻）
 * - tokenIn/tokenNotIn（集合前瞻）
 * - matchSequence/notMatchSequence（序列前瞻）
 * - matchSequenceWithoutLineTerminator（换行符约束序列）
 * 
 * 对应ECMAScript规范：
 * - [lookahead = token]
 * - [lookahead ≠ token]
 * - [lookahead ∈ {t1, t2}]
 * - [lookahead ∉ {t1, t2}]
 * - [lookahead = t1 t2]
 * - [lookahead ≠ t1 t2]
 */

import SubhutiParser, {Subhuti, SubhutiRule} from "../../src/SubhutiParser.ts"
import type SubhutiCst from "../../src/struct/SubhutiCst.ts"
import type SubhutiMatchToken from "../../src/struct/SubhutiMatchToken.ts"

// ============================================
// 辅助函数
// ============================================

function createTokens(tokens: Array<{name: string, value: string, hasLineBreakBefore?: boolean}>): SubhutiMatchToken[] {
    return tokens.map((t, i) => ({
        tokenName: t.name,
        tokenValue: t.value,
        index: i * 10,
        rowNum: 1,
        columnStartNum: i * 10,
        columnEndNum: i * 10 + t.value.length,
        hasLineBreakBefore: t.hasLineBreakBefore ?? false
    }))
}

// ============================================
// 测试Parser
// ============================================

@Subhuti
class LookaheadTestParser extends SubhutiParser {
    // ========================================
    // 测试 1：tokenIs / tokenNotIs
    // ========================================
    
    @SubhutiRule
    IfStatement(): SubhutiCst | undefined {
        // [lookahead = else]
        this.consume('IfTok')
        
        if (this.tokenIs('ElseTok')) {
            this.consume('ElseTok')
        }
        
        return this.curCst
    }
    
    @SubhutiRule
    StatementWithoutElse(): SubhutiCst | undefined {
        // [lookahead ≠ else]
        this.consume('IfTok')
        
        if (this.tokenNotIs('ElseTok')) {
            this.consume('Body')
        }
        
        return this.curCst
    }
    
    // ========================================
    // 测试 2：tokenIn / tokenNotIn
    // ========================================
    
    @SubhutiRule
    LegacyOctalEscape(): SubhutiCst | undefined {
        // [lookahead ∈ {8, 9}]
        this.consume('Backslash')
        
        if (this.tokenIn(['Digit8', 'Digit9'])) {
            this.Or([
                {alt: () => this.consume('Digit8')},
                {alt: () => this.consume('Digit9')}
            ])
        }
        
        return this.curCst
    }
    
    @SubhutiRule
    ExpressionStatement(): SubhutiCst | undefined {
        // [lookahead ∉ {{, function, class}]
        if (this.tokenNotIn(['LBrace', 'FunctionTok', 'ClassTok'])) {
            this.consume('Expression')
            this.consume('Semicolon')
        }
        
        return this.curCst
    }
    
    // ========================================
    // 测试 3：matchSequence / notMatchSequence
    // ========================================
    
    @SubhutiRule
    AsyncFunction(): SubhutiCst | undefined {
        // [lookahead = async function]
        if (this.matchSequence(['AsyncTok', 'FunctionTok'])) {
            this.consume('AsyncTok')
            this.consume('FunctionTok')
            this.consume('Name')
        }
        
        return this.curCst
    }
    
    @SubhutiRule
    ForStatement(): SubhutiCst | undefined {
        // [lookahead ≠ let []
        this.consume('ForTok')
        this.consume('LParen')
        
        if (this.notMatchSequence(['LetTok', 'LBracket'])) {
            this.consume('Expression')
        } else {
            // 匹配 let [，消费它们
            this.consume('LetTok')
            this.consume('LBracket')
        }
        
        this.consume('RParen')
        return this.curCst
    }
    
    // ========================================
    // 测试 4：matchSequenceWithoutLineTerminator
    // ========================================
    
    @SubhutiRule
    AsyncFunctionSameLine(): SubhutiCst | undefined {
        // async [no LineTerminator here] function
        if (this.matchSequenceWithoutLineTerminator(['AsyncTok', 'FunctionTok'])) {
            this.consume('AsyncTok')
            this.consume('FunctionTok')
            this.consume('Name')
        } else {
            // 有换行符或不匹配，消费当前token作为表达式
            if (this.curToken) {
                this.consume(this.curToken.tokenName)
            }
        }
        
        return this.curCst
    }
}

// ============================================
// 测试用例
// ============================================

console.log('=' .repeat(70))
console.log('测试 15：完整前瞻功能测试')
console.log('=' .repeat(70))

let testCount = 0
let passCount = 0

function test(name: string, fn: () => void) {
    testCount++
    try {
        fn()
        passCount++
        console.log(`✅ ${testCount}. ${name}`)
    } catch (e: any) {
        console.log(`❌ ${testCount}. ${name}`)
        console.log(`   错误: ${e.message}`)
    }
}

// ============================================
// 测试 1：tokenIs / tokenNotIs
// ============================================

test('tokenIs - 下一个token匹配', () => {
    const tokens = createTokens([
        {name: 'IfTok', value: 'if'},
        {name: 'ElseTok', value: 'else'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.IfStatement()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
    if (cst.children[1].name !== 'ElseTok') throw new Error('应该消费else')
})

test('tokenIs - 下一个token不匹配', () => {
    const tokens = createTokens([
        {name: 'IfTok', value: 'if'},
        {name: 'Body', value: 'body'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.IfStatement()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该只消费1个token')
})

test('tokenNotIs - 下一个token不匹配', () => {
    const tokens = createTokens([
        {name: 'IfTok', value: 'if'},
        {name: 'Body', value: 'body'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.StatementWithoutElse()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
})

test('tokenNotIs - 下一个token匹配（不消费）', () => {
    const tokens = createTokens([
        {name: 'IfTok', value: 'if'},
        {name: 'ElseTok', value: 'else'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.StatementWithoutElse()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该只消费1个token（不消费else）')
})

test('tokenNotIs - EOF情况', () => {
    const tokens = createTokens([
        {name: 'IfTok', value: 'if'},
        {name: 'Body', value: 'body'} // 添加Body token
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.StatementWithoutElse()
    
    if (!cst) throw new Error('解析失败')
    // EOF时tokenNotIs应该返回true（认为不是任何具体token）
    if (cst.children.length !== 2) throw new Error('应该消费if和body')
})

// ============================================
// 测试 2：tokenIn / tokenNotIn
// ============================================

test('tokenIn - token在集合中（8）', () => {
    const tokens = createTokens([
        {name: 'Backslash', value: '\\'},
        {name: 'Digit8', value: '8'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.LegacyOctalEscape()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
    if (cst.children[1].name !== 'Digit8') throw new Error('应该消费8')
})

test('tokenIn - token在集合中（9）', () => {
    const tokens = createTokens([
        {name: 'Backslash', value: '\\'},
        {name: 'Digit9', value: '9'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.LegacyOctalEscape()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
    if (cst.children[1].name !== 'Digit9') throw new Error('应该消费9')
})

test('tokenIn - token不在集合中', () => {
    const tokens = createTokens([
        {name: 'Backslash', value: '\\'},
        {name: 'Digit7', value: '7'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.LegacyOctalEscape()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该只消费1个token（\\）')
})

test('tokenNotIn - token不在集合中', () => {
    const tokens = createTokens([
        {name: 'Expression', value: 'expr'},
        {name: 'Semicolon', value: ';'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.ExpressionStatement()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
})

test('tokenNotIn - token在集合中（不消费）', () => {
    const tokens = createTokens([
        {name: 'LBrace', value: '{'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.ExpressionStatement()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('不应该消费任何token')
})

test('tokenNotIn - EOF情况', () => {
    const tokens = createTokens([
        {name: 'Expression', value: 'expr'},
        {name: 'Semicolon', value: ';'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.ExpressionStatement()
    
    if (!cst) throw new Error('解析失败')
    // 正常消费
    if (cst.children.length !== 2) throw new Error('应该消费Expression和Semicolon')
})

// ============================================
// 测试 3：matchSequence / notMatchSequence
// ============================================

test('matchSequence - 序列匹配', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async'},
        {name: 'FunctionTok', value: 'function'},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunction()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 3) throw new Error('应该消费3个token')
})

test('matchSequence - 序列不匹配（第1个）', () => {
    const tokens = createTokens([
        {name: 'FunctionTok', value: 'function'},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunction()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('不应该消费token')
})

test('matchSequence - 序列不匹配（第2个）', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async'},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunction()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('不应该消费token')
})

test('matchSequence - EOF截断', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunction()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('EOF时不应该消费token')
})

test('notMatchSequence - 序列不匹配', () => {
    const tokens = createTokens([
        {name: 'ForTok', value: 'for'},
        {name: 'LParen', value: '('},
        {name: 'Expression', value: 'expr'},
        {name: 'RParen', value: ')'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.ForStatement()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 4) throw new Error('应该消费4个token')
})

test('notMatchSequence - 序列匹配（不执行分支）', () => {
    const tokens = createTokens([
        {name: 'ForTok', value: 'for'},
        {name: 'LParen', value: '('},
        {name: 'LetTok', value: 'let'},
        {name: 'LBracket', value: '['},
        {name: 'RParen', value: ')'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.ForStatement()
    
    if (!cst) throw new Error('解析失败')
    // 序列匹配let [，执行else分支消费let和[
    if (cst.children.length !== 5) throw new Error('应该消费5个token（for ( let [ )）')
})

// ============================================
// 测试 4：matchSequenceWithoutLineTerminator
// ============================================

test('matchSequenceWithoutLineTerminator - 同一行', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async', hasLineBreakBefore: false},
        {name: 'FunctionTok', value: 'function', hasLineBreakBefore: false},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunctionSameLine()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 3) throw new Error('应该消费3个token（async function foo）')
    if (cst.children[0].name !== 'AsyncTok') throw new Error('第一个应该是async')
})

test('matchSequenceWithoutLineTerminator - 有换行符', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async', hasLineBreakBefore: false},
        {name: 'FunctionTok', value: 'function', hasLineBreakBefore: true}, // 有换行
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunctionSameLine()
    
    if (!cst) throw new Error('解析失败')
    // 有换行符，匹配失败，消费第一个token
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'AsyncTok') throw new Error('应该消费AsyncTok')
})

test('matchSequenceWithoutLineTerminator - 第一个token不匹配', () => {
    const tokens = createTokens([
        {name: 'FunctionTok', value: 'function'},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunctionSameLine()
    
    if (!cst) throw new Error('解析失败')
    // 第一个token不匹配，消费第一个token
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'FunctionTok') throw new Error('应该消费FunctionTok')
})

test('matchSequenceWithoutLineTerminator - 第二个token不匹配', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async'},
        {name: 'Name', value: 'foo'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunctionSameLine()
    
    if (!cst) throw new Error('解析失败')
    // 第二个token不匹配，消费第一个token
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'AsyncTok') throw new Error('应该消费AsyncTok')
})

test('matchSequenceWithoutLineTerminator - EOF截断', () => {
    const tokens = createTokens([
        {name: 'AsyncTok', value: 'async'}
    ])
    
    const parser = new LookaheadTestParser(tokens)
    const cst = parser.AsyncFunctionSameLine()
    
    if (!cst) throw new Error('解析失败')
    // EOF，序列不完整，消费第一个token
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'AsyncTok') throw new Error('应该消费AsyncTok')
})

// ============================================
// 总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log(`测试完成: ${passCount}/${testCount} 通过`)
console.log('='.repeat(70))

if (passCount === testCount) {
    console.log('\n✅ 所有前瞻功能测试通过！')
} else {
    console.log(`\n❌ ${testCount - passCount} 个测试失败`)
    process.exit(1)
}

