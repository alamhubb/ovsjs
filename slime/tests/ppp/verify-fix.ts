#!/usr/bin/env tsx
/**
 * 快速验证回溯修复效果
 * 
 * 使用方法：
 *   npx tsx tests/ppp/verify-fix.ts
 */

import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

// 测试用例
const testCases = [
    { name: '简单标识符', code: 'a' },
    { name: '简单表达式', code: 'a + b' },
    { name: '函数调用', code: 'Math.max(1, 2)' },
    { name: '复杂表达式', code: 'Math.max(1, 2) + Math.min(5, 3)' },
    { name: '嵌套调用', code: 'a.b().c().d()' }
]

console.log('='.repeat(60))
console.log('Subhuti Parser - 回溯修复验证')
console.log('='.repeat(60))

// 统计函数
function analyzeCST(cst: any) {
    const stats = {
        total: 0,
        emptyRules: 0,
        tokens: 0,
        duplicates: 0
    }
    
    const tokenPositions = new Map<number, number>()
    
    function traverse(n: any) {
        stats.total++
        
        if (n.children && n.children.length === 0) {
            if (n.value) {
                stats.tokens++
                // 检查重复
                const pos = n.loc?.start?.index
                if (pos !== undefined) {
                    tokenPositions.set(pos, (tokenPositions.get(pos) || 0) + 1)
                }
            } else {
                stats.emptyRules++
            }
        }
        
        if (n.children) {
            for (const child of n.children) {
                traverse(child)
            }
        }
    }
    
    traverse(cst)
    
    // 统计重复 token
    for (const count of tokenPositions.values()) {
        if (count > 1) {
            stats.duplicates += count - 1
        }
    }
    
    return stats
}

// 运行测试
let totalPassed = 0
let totalFailed = 0

for (const testCase of testCases) {
    console.log(`\n【测试】${testCase.name}`)
    console.log(`代码: ${testCase.code}`)
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(testCase.code)
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        const stats = analyzeCST(cst)
        const emptyRatio = (stats.emptyRules / stats.total * 100).toFixed(2)
        
        console.log(`  总节点: ${stats.total}`)
        console.log(`  Token节点: ${stats.tokens}`)
        console.log(`  空规则节点: ${stats.emptyRules} (${emptyRatio}%)`)
        console.log(`  重复Token: ${stats.duplicates}`)
        
        // 判断标准
        const passed = stats.emptyRules < 20 && stats.duplicates === 0
        
        if (passed) {
            console.log(`  ✅ 通过`)
            totalPassed++
        } else {
            console.log(`  ❌ 失败`)
            if (stats.emptyRules >= 20) {
                console.log(`     - 空节点过多 (${stats.emptyRules}个)`)
            }
            if (stats.duplicates > 0) {
                console.log(`     - 有重复Token (${stats.duplicates}个)`)
            }
            totalFailed++
        }
        
    } catch (error) {
        console.log(`  ❌ 解析失败: ${(error as Error).message}`)
        totalFailed++
    }
}

// 总结
console.log('\n' + '='.repeat(60))
console.log('测试总结')
console.log('='.repeat(60))
console.log(`通过: ${totalPassed}/${testCases.length}`)
console.log(`失败: ${totalFailed}/${testCases.length}`)

if (totalFailed === 0) {
    console.log('\n🎉 所有测试通过！回溯修复生效！')
    process.exit(0)
} else {
    console.log('\n❌ 部分测试失败，请检查回溯机制')
    process.exit(1)
}









