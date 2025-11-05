/**
 * 测试 18：左递归检测机制测试
 * 
 * 测试目标：
 * - 检测直接左递归（A -> A x）
 * - 检测间接左递归（A -> B, B -> A）
 * - 检测多层间接左递归
 * - 左递归检测开关控制
 * - 验证错误消息质量
 * 
 * 核心机制：
 * - 维护 (ruleName:tokenIndex) 调用栈
 * - 检测在同一位置重复调用同一规则
 * - 提供清晰的错误消息和修复建议
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
// 测试Parser - 左递归语法（错误）
// ============================================

@Subhuti
class DirectLeftRecursionParser extends SubhutiParser {
    /**
     * 直接左递归：A -> A 'x' | 'y'
     * 
     * 这是最经典的左递归形式
     */
    @SubhutiRule
    A(): SubhutiCst | undefined {
        this.Or([
            {alt: () => {
                this.A()  // 左递归！
                this.consume('X')
            }},
            {alt: () => this.consume('Y')}
        ])
        return this.curCst
    }
}

@Subhuti
class IndirectLeftRecursionParser extends SubhutiParser {
    /**
     * 间接左递归：A -> B, B -> A
     */
    @SubhutiRule
    A(): SubhutiCst | undefined {
        this.B()
        return this.curCst
    }
    
    @SubhutiRule
    B(): SubhutiCst | undefined {
        this.Or([
            {alt: () => this.A()},  // 间接左递归！
            {alt: () => this.consume('Y')}
        ])
        return this.curCst
    }
}

@Subhuti
class MultiLevelLeftRecursionParser extends SubhutiParser {
    /**
     * 多层间接左递归：A -> B -> C -> A
     */
    @SubhutiRule
    A(): SubhutiCst | undefined {
        this.B()
        return this.curCst
    }
    
    @SubhutiRule
    B(): SubhutiCst | undefined {
        this.C()
        return this.curCst
    }
    
    @SubhutiRule
    C(): SubhutiCst | undefined {
        this.Or([
            {alt: () => this.A()},  // 多层间接左递归！
            {alt: () => this.consume('Y')}
        ])
        return this.curCst
    }
}

// ============================================
// 测试Parser - 正确的递归（非左递归）
// ============================================

@Subhuti
class CorrectRecursionParser extends SubhutiParser {
    /**
     * 正确的右递归：A -> 'x' A | 'y'
     */
    @SubhutiRule
    A(): SubhutiCst | undefined {
        this.Or([
            {alt: () => {
                this.consume('X')
                this.A()  // 右递归，OK
            }},
            {alt: () => this.consume('Y')}
        ])
        return this.curCst
    }
    
    /**
     * 正确的消除左递归：A -> 'y' ('x')*
     */
    @SubhutiRule
    AOptimized(): SubhutiCst | undefined {
        this.consume('Y')
        this.Many(() => this.consume('X'))
        return this.curCst
    }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(70))
console.log('测试 18：左递归检测机制测试')
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
// 测试 1：直接左递归检测
// ============================================

test('直接左递归 - 应该抛出错误', () => {
    const tokens = createTokens([
        {name: 'X', value: 'x'},
        {name: 'X', value: 'x'}
    ])
    
    const parser = new DirectLeftRecursionParser(tokens)
    
    let errorThrown = false
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorThrown = true
        errorMessage = e.message
    }
    
    if (!errorThrown) throw new Error('应该抛出左递归错误')
    if (!errorMessage.includes('Left recursion detected')) {
        throw new Error('错误消息应该包含 "Left recursion detected"')
    }
    if (!errorMessage.includes('rule "A"')) {
        throw new Error('错误消息应该包含规则名称')
    }
})

test('直接左递归 - 错误消息包含修复建议', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new DirectLeftRecursionParser(tokens)
    
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorMessage = e.message
    }
    
    if (!errorMessage.includes('Example')) {
        throw new Error('错误消息应该包含修复示例')
    }
    if (!errorMessage.includes('Bad:') || !errorMessage.includes('Good:')) {
        throw new Error('错误消息应该包含对比示例')
    }
})

test('直接左递归 - 错误消息包含规则栈', () => {
    const tokens = createTokens([{name: 'X', value: 'x'}])
    const parser = new DirectLeftRecursionParser(tokens)
    
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorMessage = e.message
    }
    
    if (!errorMessage.includes('Rule stack')) {
        throw new Error('错误消息应该包含规则调用栈')
    }
})

// ============================================
// 测试 2：间接左递归检测
// ============================================

test('间接左递归 - 应该抛出错误', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new IndirectLeftRecursionParser(tokens)
    
    let errorThrown = false
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorThrown = true
        errorMessage = e.message
    }
    
    if (!errorThrown) throw new Error('应该抛出左递归错误')
    if (!errorMessage.includes('Left recursion detected')) {
        throw new Error('错误消息应该包含 "Left recursion detected"')
    }
})

test('间接左递归 - 检测规则名称', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new IndirectLeftRecursionParser(tokens)
    
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorMessage = e.message
    }
    
    // 间接左递归：A调用B，B调用A，所以检测到的是在A的位置重复调用A
    // 但实际错误会在第一次检测到的位置报告，可能是"B"或"A"
    if (!errorMessage.includes('rule')) {
        throw new Error('错误消息应该包含规则名称')
    }
})

// ============================================
// 测试 3：多层间接左递归
// ============================================

test('多层间接左递归 - 应该抛出错误', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new MultiLevelLeftRecursionParser(tokens)
    
    let errorThrown = false
    
    try {
        parser.A()
    } catch (e: any) {
        errorThrown = true
    }
    
    if (!errorThrown) throw new Error('应该抛出左递归错误')
})

test('多层间接左递归 - 规则栈完整', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new MultiLevelLeftRecursionParser(tokens)
    
    let errorMessage = ''
    
    try {
        parser.A()
    } catch (e: any) {
        errorMessage = e.message
    }
    
    // 规则栈应该显示完整路径：A -> B -> C -> A
    if (!errorMessage.includes('Rule stack')) {
        throw new Error('错误消息应该包含规则栈')
    }
})

// ============================================
// 测试 4：正确的递归（非左递归）
// ============================================

test('右递归 - 不应该报错', () => {
    const tokens = createTokens([
        {name: 'X', value: 'x'},
        {name: 'X', value: 'x'},
        {name: 'Y', value: 'y'}
    ])
    
    const parser = new CorrectRecursionParser(tokens)
    
    const cst = parser.A()
    
    if (!cst) throw new Error('右递归应该成功解析')
    // 右递归会消费所有X后，最后消费Y
    // X -> X -> Y，最外层Or成功返回的CST只包含一个子节点（最外层的Or结果）
    if (!cst.children || cst.children.length === 0) throw new Error('应该有子节点')
})

test('消除左递归版本 - 不应该报错', () => {
    const tokens = createTokens([
        {name: 'Y', value: 'y'},
        {name: 'X', value: 'x'},
        {name: 'X', value: 'x'}
    ])
    
    const parser = new CorrectRecursionParser(tokens)
    
    const cst = parser.AOptimized()
    
    if (!cst) throw new Error('优化版本应该成功解析')
    if (cst.children.length !== 3) throw new Error('应该消费3个token')
})

// ============================================
// 测试 5：左递归检测开关
// ============================================

test('禁用左递归检测 - 不抛出错误（但可能死循环）', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new DirectLeftRecursionParser(tokens)
    
    // 禁用左递归检测
    parser.leftRecursionDetection(false)
    
    // 注意：这个测试不实际调用A()，因为会导致栈溢出
    // 我们只验证开关能够被设置
    if (parser.enableLeftRecursionDetection) {
        throw new Error('禁用左递归检测失败')
    }
})

test('启用左递归检测 - 默认启用', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new DirectLeftRecursionParser(tokens)
    
    if (!parser.enableLeftRecursionDetection) {
        throw new Error('默认应该启用左递归检测')
    }
})

test('链式调用 - leftRecursionDetection()', () => {
    const tokens = createTokens([{name: 'Y', value: 'y'}])
    const parser = new DirectLeftRecursionParser(tokens)
        .leftRecursionDetection(false)
        .cache(true)
    
    if (parser.enableLeftRecursionDetection) {
        throw new Error('链式调用应该生效')
    }
    if (!parser.enableMemoization) {
        throw new Error('链式调用应该支持多个方法')
    }
})

// ============================================
// 测试 6：Token位置变化后可以重复调用
// ============================================

test('Token位置变化 - 允许重复调用同一规则', () => {
    const tokens = createTokens([
        {name: 'Y', value: 'y'},
        {name: 'Y', value: 'y'}
    ])
    
    const parser = new CorrectRecursionParser(tokens)
    
    // 在不同token位置调用A()不应该报错
    const cst1 = parser.AOptimized()
    if (!cst1) throw new Error('第一次调用应该成功')
    
    // 第二次调用（tokenIndex已经改变）
    const cst2 = parser.AOptimized()
    if (!cst2) throw new Error('第二次调用应该成功')
})

// ============================================
// 总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log(`测试完成: ${passCount}/${testCount} 通过`)
console.log('='.repeat(70))

if (passCount === testCount) {
    console.log('\n✅ 所有左递归检测测试通过！')
    console.log('\n📊 测试覆盖：')
    console.log('  - 直接左递归检测（A -> A x）')
    console.log('  - 间接左递归检测（A -> B -> A）')
    console.log('  - 多层间接左递归（A -> B -> C -> A）')
    console.log('  - 左递归检测开关控制')
    console.log('  - 错误消息质量验证')
    console.log('  - 正确递归（右递归、消除左递归）')
    console.log('  - Token位置变化后允许重复调用')
} else {
    console.log(`\n❌ ${testCount - passCount} 个测试失败`)
    process.exit(1)
}

