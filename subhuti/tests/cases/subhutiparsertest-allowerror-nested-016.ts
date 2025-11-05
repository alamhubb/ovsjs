/**
 * 测试 16：allowError 嵌套深度测试
 * 
 * 测试目标：
 * - allowError 深度计数器（allowErrorDepth）
 * - outerHasAllowError 机制（深度 > 1）
 * - Or/Many/Option 嵌套时的错误管理
 * - 最后分支抛详细错误，前面分支静默失败
 * 
 * 核心机制：
 * - Or 前 N-1 分支：allowError=true（静默失败）
 * - Or 最后分支：allowError=false（抛详细错误）
 * - 嵌套 Or：outerHasAllowError=true（外层允许错误）
 */

import SubhutiParser, {Subhuti, SubhutiRule} from "../../src/SubhutiParser.ts"
import type SubhutiCst from "../../src/struct/SubhutiCst.ts"
import type SubhutiMatchToken from "../../src/struct/SubhutiMatchToken.ts"

// ============================================
// 辅助函数
// ============================================

function createTokens(tokens: Array<{name: string, value: string}>): SubhutiMatchToken[] {
    return tokens.map((t, i) => ({
        tokenName: t.name,
        tokenValue: t.value,
        index: i * 10,
        rowNum: 1,
        columnStartNum: i * 10,
        columnEndNum: i * 10 + t.value.length,
        hasLineBreakBefore: false
    }))
}

// ============================================
// 测试Parser
// ============================================

@Subhuti
class AllowErrorTestParser extends SubhutiParser {
    // ========================================
    // 测试 1：单层 Or（基础）
    // ========================================
    
    @SubhutiRule
    SimpleOr(): SubhutiCst | undefined {
        this.Or([
            {alt: () => this.consume('A')},
            {alt: () => this.consume('B')},
            {alt: () => this.consume('C')} // 最后分支，失败会抛错误
        ])
        return this.curCst
    }
    
    // ========================================
    // 测试 2：嵌套 Or（2层）
    // ========================================
    
    @SubhutiRule
    NestedOr2(): SubhutiCst | undefined {
        this.Or([
            // 分支1：嵌套Or
            {alt: () => {
                this.Or([
                    {alt: () => this.consume('A')},
                    {alt: () => this.consume('B')}
                ])
            }},
            // 分支2：最后分支
            {alt: () => this.consume('C')}
        ])
        return this.curCst
    }
    
    // ========================================
    // 测试 3：嵌套 Or（3层）
    // ========================================
    
    @SubhutiRule
    NestedOr3(): SubhutiCst | undefined {
        this.Or([
            // 分支1：嵌套Or（2层）
            {alt: () => {
                this.Or([
                    // 分支1.1：嵌套Or（3层）
                    {alt: () => {
                        this.Or([
                            {alt: () => this.consume('A')},
                            {alt: () => this.consume('B')}
                        ])
                    }},
                    // 分支1.2
                    {alt: () => this.consume('C')}
                ])
            }},
            // 分支2：最后分支
            {alt: () => this.consume('D')}
        ])
        return this.curCst
    }
    
    // ========================================
    // 测试 4：Or + Many 嵌套
    // ========================================
    
    @SubhutiRule
    OrWithMany(): SubhutiCst | undefined {
        this.Or([
            {alt: () => {
                this.consume('Start')
                this.Many(() => this.consume('Item'))
            }},
            {alt: () => this.consume('Fallback')}
        ])
        return this.curCst
    }
    
    // ========================================
    // 测试 5：Or + Option 嵌套
    // ========================================
    
    @SubhutiRule
    OrWithOption(): SubhutiCst | undefined {
        this.Or([
            {alt: () => {
                this.consume('Start')
                this.Option(() => this.consume('Optional'))
            }},
            {alt: () => this.consume('Fallback')}
        ])
        return this.curCst
    }
    
    // ========================================
    // 测试 6：Many + Or 嵌套
    // ========================================
    
    @SubhutiRule
    ManyWithOr(): SubhutiCst | undefined {
        this.Many(() => {
            this.Or([
                {alt: () => this.consume('A')},
                {alt: () => this.consume('B')}
            ])
        })
        return this.curCst
    }
    
    // ========================================
    // 测试 7：Option + Or 嵌套
    // ========================================
    
    @SubhutiRule
    OptionWithOr(): SubhutiCst | undefined {
        this.Option(() => {
            this.Or([
                {alt: () => this.consume('A')},
                {alt: () => this.consume('B')}
            ])
        })
        return this.curCst
    }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(70))
console.log('测试 16：allowError 嵌套深度测试')
console.log('='.repeat(70))

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
// 测试 1：单层 Or
// ============================================

test('单层Or - 匹配第1分支', () => {
    const tokens = createTokens([{name: 'A', value: 'a'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.SimpleOr()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'A') throw new Error('应该匹配A')
})

test('单层Or - 匹配第2分支', () => {
    const tokens = createTokens([{name: 'B', value: 'b'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.SimpleOr()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'B') throw new Error('应该匹配B')
})

test('单层Or - 匹配最后分支', () => {
    const tokens = createTokens([{name: 'C', value: 'c'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.SimpleOr()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'C') throw new Error('应该匹配C')
})

test('单层Or - 所有分支失败，抛详细错误', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new AllowErrorTestParser(tokens).errorHandler(true)
    
    let errorThrown = false
    let errorMessage = ''
    
    try {
        parser.SimpleOr()
    } catch (e: any) {
        errorThrown = true
        errorMessage = e.message
    }
    
    if (!errorThrown) throw new Error('应该抛出错误')
    if (!errorMessage.includes('Expected C')) throw new Error('错误消息应该包含 "Expected C"')
})

// ============================================
// 测试 2：嵌套 Or（2层）
// ============================================

test('嵌套Or(2层) - 匹配外层第1分支的第1个', () => {
    const tokens = createTokens([{name: 'A', value: 'a'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr2()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'A') throw new Error('应该匹配A')
})

test('嵌套Or(2层) - 匹配外层第1分支的第2个', () => {
    const tokens = createTokens([{name: 'B', value: 'b'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr2()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'B') throw new Error('应该匹配B')
})

test('嵌套Or(2层) - 匹配外层第2分支', () => {
    const tokens = createTokens([{name: 'C', value: 'c'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr2()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'C') throw new Error('应该匹配C')
})

test('嵌套Or(2层) - 所有分支失败，抛详细错误', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new AllowErrorTestParser(tokens).errorHandler(true)
    
    let errorThrown = false
    let errorMessage = ''
    
    try {
        parser.NestedOr2()
    } catch (e: any) {
        errorThrown = true
        errorMessage = e.message
    }
    
    if (!errorThrown) throw new Error('应该抛出错误')
    if (!errorMessage.includes('Expected C')) throw new Error('错误消息应该包含 "Expected C"')
})

// ============================================
// 测试 3：嵌套 Or（3层）
// ============================================

test('嵌套Or(3层) - 匹配最深层', () => {
    const tokens = createTokens([{name: 'A', value: 'a'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr3()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'A') throw new Error('应该匹配A')
})

test('嵌套Or(3层) - 匹配中间层', () => {
    const tokens = createTokens([{name: 'C', value: 'c'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr3()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'C') throw new Error('应该匹配C')
})

test('嵌套Or(3层) - 匹配最外层', () => {
    const tokens = createTokens([{name: 'D', value: 'd'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.NestedOr3()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'D') throw new Error('应该匹配D')
})

test('嵌套Or(3层) - 所有分支失败，抛详细错误', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new AllowErrorTestParser(tokens).errorHandler(true)
    
    let errorThrown = false
    let errorMessage = ''
    
    try {
        parser.NestedOr3()
    } catch (e: any) {
        errorThrown = true
        errorMessage = e.message
    }
    
    if (!errorThrown) throw new Error('应该抛出错误')
    if (!errorMessage.includes('Expected D')) throw new Error('错误消息应该包含 "Expected D"')
})

// ============================================
// 测试 4：Or + Many 嵌套
// ============================================

test('Or+Many - 匹配第1分支（0个Item）', () => {
    const tokens = createTokens([{name: 'Start', value: 'start'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithMany()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'Start') throw new Error('应该匹配Start')
})

test('Or+Many - 匹配第1分支（2个Item）', () => {
    const tokens = createTokens([
        {name: 'Start', value: 'start'},
        {name: 'Item', value: 'item1'},
        {name: 'Item', value: 'item2'}
    ])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithMany()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 3) throw new Error('应该消费3个token')
})

test('Or+Many - 匹配第2分支', () => {
    const tokens = createTokens([{name: 'Fallback', value: 'fallback'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithMany()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'Fallback') throw new Error('应该匹配Fallback')
})

// ============================================
// 测试 5：Or + Option 嵌套
// ============================================

test('Or+Option - 匹配第1分支（无Optional）', () => {
    const tokens = createTokens([{name: 'Start', value: 'start'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithOption()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'Start') throw new Error('应该匹配Start')
})

test('Or+Option - 匹配第1分支（有Optional）', () => {
    const tokens = createTokens([
        {name: 'Start', value: 'start'},
        {name: 'Optional', value: 'opt'}
    ])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithOption()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 2) throw new Error('应该消费2个token')
})

test('Or+Option - 匹配第2分支', () => {
    const tokens = createTokens([{name: 'Fallback', value: 'fallback'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OrWithOption()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'Fallback') throw new Error('应该匹配Fallback')
})

// ============================================
// 测试 6：Many + Or 嵌套
// ============================================

test('Many+Or - 0次匹配', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.ManyWithOr()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('应该不消费token')
})

test('Many+Or - 3次匹配', () => {
    const tokens = createTokens([
        {name: 'A', value: 'a'},
        {name: 'B', value: 'b'},
        {name: 'A', value: 'a'}
    ])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.ManyWithOr()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 3) throw new Error('应该消费3个token')
})

// ============================================
// 测试 7：Option + Or 嵌套
// ============================================

test('Option+Or - 不匹配', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OptionWithOr()
    
    if (!cst) throw new Error('解析失败')
    const childCount = cst.children?.length || 0
    if (childCount !== 0) throw new Error('应该不消费token')
})

test('Option+Or - 匹配', () => {
    const tokens = createTokens([{name: 'A', value: 'a'}])
    const parser = new AllowErrorTestParser(tokens)
    const cst = parser.OptionWithOr()
    
    if (!cst) throw new Error('解析失败')
    if (cst.children.length !== 1) throw new Error('应该消费1个token')
    if (cst.children[0].name !== 'A') throw new Error('应该匹配A')
})

// ============================================
// 总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log(`测试完成: ${passCount}/${testCount} 通过`)
console.log('='.repeat(70))

if (passCount === testCount) {
    console.log('\n✅ 所有 allowError 嵌套深度测试通过！')
} else {
    console.log(`\n❌ ${testCount - passCount} 个测试失败`)
    process.exit(1)
}









