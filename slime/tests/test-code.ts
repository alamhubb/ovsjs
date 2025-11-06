/**
 * Es2025Parser 调试测试工具（MWE + 二分增量调试版）
 *
 * 用法：
 *   1. 直接运行：npx tsx tests/test-code.ts
 *   2. 传入代码：npx tsx tests/test-code.ts "let a = 1"
 *   3. 二分调试模式：npx tsx tests/test-code.ts "let a = 1" "bisect"
 *
 * 功能：
 *   - MWE：测试最小可工作示例
 *   - 二分增量调试：从最底层规则逐层测试到顶层
 *   - 使用 SubhutiDebug 提供的完整调试功能
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

// ============================================
// 二分增量调试函数
// ============================================

// 收集CST中的所有token
function collectCSTTokens(node: any): any[] {
    if (!node) return []
    
    const tokens: any[] = []
    
    // 如果是token节点（有tokenValue或tokenType）
    if (node.tokenValue !== undefined || node.tokenType) {
        tokens.push(node)
        return tokens
    }
    
    // 递归收集子节点的tokens
    if (node.children) {
        for (const child of Object.values(node.children)) {
            if (Array.isArray(child)) {
                for (const item of child) {
                    tokens.push(...collectCSTTokens(item))
                }
            } else {
                tokens.push(...collectCSTTokens(child))
            }
        }
    }
    
    return tokens
}

function bisectDebug(code: string, tokens: any[]) {
    console.log('\n🔬 二分增量调试模式')
    console.log('='.repeat(80))
    console.log('策略：从最底层规则逐层测试，找出问题层级\n')
    
    // 说明问题
    console.log('📋 问题分析：')
    console.log('   规范中 [+In] 表示"只在 In=true 时产生式才存在"')
    console.log('   错误写法：{ alt: () => { if (In) { consume() } } }  ← 这个分支始终存在！')
    console.log('   正确写法：...(In ? [{ alt: () => consume() }] : [])  ← 条件展开')
    console.log('')
    console.log('   当"空操作分支"是 Or 的最后一个时：')
    console.log('   - Or 会在最后分支抛出详细错误（Subhuti 设计）')
    console.log('   - if (In) 为 true 但 token 不匹配 → 抛错 ❌')
    console.log('   - if (In) 为 false → 什么都不做，返回 undefined → Or 失败 → Many 也失败 ❌')
    console.log('='.repeat(80))
    console.log('')
    
    // 测试层级（从低到高）
    const testLevels = [
        { name: 'LexicalDeclaration', call: (p: any) => p.LexicalDeclaration({ In: true }) },
        { name: 'Declaration', call: (p: any) => p.Declaration() },
        { name: 'StatementListItem', call: (p: any) => p.StatementListItem() },
        { name: 'StatementList', call: (p: any) => p.StatementList() },
        { name: 'Script', call: (p: any) => p.Script() },
    ]
    
    for (let i = 0; i < testLevels.length; i++) {
        const level = testLevels[i]
        
        console.log(`\n[${'▸'.repeat(i + 1)}] 测试层级 ${i + 1}: ${level.name}`)
        console.log('-'.repeat(80))
        
        try {
            const parser = new Es2025Parser(tokens).debug()
            const result = level.call(parser)
            
            if (!result) {
                console.log(`\n⚠️ ${level.name} 返回 undefined`)
                continue
            }
            
            // 验证token完整性
            const cstTokens = collectCSTTokens(result)
            const inputTokenCount = tokens.length
            const cstTokenCount = cstTokens.length
            
            if (cstTokenCount === inputTokenCount) {
                console.log(`\n✅ ${level.name} 解析成功（Token完整: ${cstTokenCount}/${inputTokenCount}）`)
            } else {
                console.log(`\n❌ ${level.name} Token不完整`)
                console.log(`   输入tokens: ${inputTokenCount} 个`)
                console.log(`   CST tokens:  ${cstTokenCount} 个`)
                
                const inputTokenNames = tokens.map((t: any) => t.tokenValue || t.tokenType?.name || '?')
                const cstTokenNames = cstTokens.map((t: any) => t.tokenValue || t.tokenType?.name || '?')
                const missingTokens = inputTokenNames.filter((name: string, idx: number) => 
                    !cstTokenNames.includes(name) || idx >= cstTokenCount
                )
                
                console.log(`   输入列表: [${inputTokenNames.join(', ')}]`)
                console.log(`   CST列表:  [${cstTokenNames.join(', ')}]`)
                console.log(`   ❌ 缺失: [${missingTokens.join(', ')}]`)
                
                console.log(`\n🔍 问题定位: ${level.name} 未能消费所有token`)
                
                if (i > 0) {
                    console.log(`   ⚠️ 前一层级（${testLevels[i - 1].name}）也可能有问题`)
                    console.log(`   💡 建议: 检查 ${level.name} 和 ${testLevels[i - 1].name} 的实现`)
                } else {
                    console.log(`   💡 建议: 检查 ${level.name} 的实现，确保所有token都被正确处理`)
                }
                
                return // 遇到token不完整就停止
            }
        } catch (error: any) {
            console.log(`\n❌ ${level.name} 解析失败`)
            console.log(`   错误: ${error.message}`)
            console.log(`\n🔍 问题定位: ${level.name} 层级出现错误`)
            
            if (i > 0) {
                console.log(`   ✅ 前一层级（${testLevels[i - 1].name}）可以工作`)
                console.log(`   ❌ 当前层级（${level.name}）出现问题`)
                console.log(`\n💡 建议: 检查 ${level.name} 的实现，特别是它如何调用 ${testLevels[i - 1].name}`)
            } else {
                console.log(`   ❌ 最底层规则（${level.name}）就已经失败`)
                console.log(`\n💡 建议: 检查 ${level.name} 的实现和 token 定义`)
            }
            
            // 输出堆栈跟踪（仅前 10 行）
            if (error.stack) {
                console.log(`\n📋 堆栈跟踪（前10行）:`)
                const stackLines = error.stack.split('\n').slice(0, 10)
                stackLines.forEach((line: string) => console.log(`   ${line}`))
            }
            
            return // 遇到错误就停止
        }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('🎉 所有层级测试通过！')
    console.log('='.repeat(80))
}

// ============================================
// 普通测试函数
// ============================================

function testCode(code: string, entryRule: string = 'Script') {
    console.log('🔍 Es2025Parser 调试测试')
    console.log('='.repeat(80))
    console.log(`📝 代码: ${code}`)
    console.log(`📐 入口规则: ${entryRule}`)
    console.log('='.repeat(80))

    try {
        // 步骤1: 词法分析
        console.log('\n📋 步骤1: 词法分析')
        console.log('-'.repeat(80))
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)

        console.log(`✅ 词法分析成功: ${tokens.length} tokens`)
        
        // 显示 tokens
        console.log('\nTokens:')
        tokens.forEach((t: any, i: number) => {
            const tokenName = t.tokenType?.name || 'Unknown'
            console.log(`  [${i}] ${tokenName}: "${t.tokenValue}"`)
        })

        // 步骤2: 语法分析（启用 debug）
        console.log(`\n📋 步骤2: 语法分析（启用 SubhutiDebug）`)
        console.log('-'.repeat(80))
        console.log('注意：以下输出由 SubhutiDebug 自动生成\n')
        
        const parser = new Es2025Parser(tokens).debug()

        // 调用指定的入口规则
        let cst: any
        const method = (parser as any)[entryRule]
        if (typeof method === 'function') {
            cst = method.call(parser)
        } else {
            throw new Error(`未知的入口规则: ${entryRule}`)
        }

        console.log('\n✅ 语法分析成功！')

    } catch (error: any) {
        console.log('\n' + '='.repeat(80))
        console.log('❌ 测试失败')
        console.log('='.repeat(80))
        console.log(`错误信息: ${error.message}`)

        if (error.stack) {
            console.log(`\n堆栈跟踪（前15行）:`)
            const stackLines = error.stack.split('\n').slice(0, 15)
            stackLines.forEach((line: string) => console.log(`  ${line}`))
        }

        process.exit(1)
    }
}

// ============================================
// 主程序
// ============================================

const code = process.argv[2] || `const obj = { sum: 5 + 6 }`
const mode = process.argv[3] || 'bisect' // 默认使用二分调试模式

// 词法分析
const lexer = new SubhutiLexer(es2025Tokens)
const tokens = lexer.tokenize(code)

if (mode === 'bisect') {
    // 二分增量调试模式
    console.log('🔍 Es2025Parser MWE + 二分增量调试')
    console.log('='.repeat(80))
    console.log(`📝 代码: ${code}`)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)
    
    bisectDebug(code, tokens)
} else {
    // 普通测试模式
    testCode(code, mode)
}

