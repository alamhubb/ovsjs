// ES6规则级测试运行器

import * as fs from 'fs'
import * as path from 'path'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const testsDir = './tests/es6rules'

// 递归获取所有.js测试文件
function getAllTestFiles(dir: string): string[] {
    const files: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            files.push(...getAllTestFiles(fullPath))
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath)
        }
    }
    
    return files.sort()
}

// 从文件内容提取规则信息
function extractRuleInfo(content: string) {
    const ruleMatch = content.match(/\* 规则测试：(\w+)/)
    const statusMatch = content.match(/\* 状态：(.+)/)
    const categoryMatch = content.match(/\* 分类：(\w+)/)
    
    return {
        ruleName: ruleMatch?.[1] || 'Unknown',
        status: statusMatch?.[1] || '⏸️ 待完善',
        category: categoryMatch?.[1] || 'unknown'
    }
}

// 验证CST完整性
function validateCST(node: any, depth = 0): { valid: boolean, issues: string[] } {
    const issues: string[] = []
    
    if (!node) {
        issues.push(`空节点（深度${depth}）`)
        return { valid: false, issues }
    }
    
    if (!node.name && node.value === undefined) {
        issues.push(`节点缺少name和value（深度${depth}）`)
    }
    
    if (node.children) {
        if (!Array.isArray(node.children)) {
            issues.push(`children不是数组（深度${depth}）`)
        } else {
            node.children.forEach((child: any, index: number) => {
                if (child) {
                    const childResult = validateCST(child, depth + 1)
                    issues.push(...childResult.issues)
                }
            })
        }
    }
    
    return { valid: issues.length === 0, issues }
}

// 运行测试
async function runTests() {
    console.log('🧪 ES6规则级测试运行器\n')
    console.log('='.repeat(70))
    
    const testFiles = getAllTestFiles(testsDir)
    console.log(`📋 发现 ${testFiles.length} 个测试文件\n`)
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        byCategory: {} as Record<string, { total: number, passed: number, failed: number, skipped: number }>
    }
    
    for (const testFile of testFiles) {
        const relativePath = path.relative(testsDir, testFile)
        const content = fs.readFileSync(testFile, 'utf-8')
        const info = extractRuleInfo(content)
        
        results.total++
        
        // 统计分类
        if (!results.byCategory[info.category]) {
            results.byCategory[info.category] = { total: 0, passed: 0, failed: 0, skipped: 0 }
        }
        results.byCategory[info.category].total++
        
        // 检查是否有实际测试代码（不只是TODO）
        const hasTests = !content.includes('// TODO: 添加测试用例')
        
        if (!hasTests || info.status.includes('待完善')) {
            console.log(`⏸️  [SKIP] ${relativePath} - ${info.ruleName}`)
            results.skipped++
            results.byCategory[info.category].skipped++
            continue
        }
        
        console.log(`🧪 [TEST] ${relativePath} - ${info.ruleName}`)
        
        try {
            // 词法分析
            const lexer = new SubhutiLexer(es6Tokens)
            const tokens = lexer.lexer(content)
            
            // 语法分析
            const parser = new Es6Parser(tokens)
            const cst = parser.Program()
            
            if (!cst) {
                throw new Error('CST生成失败')
            }
            
            // 验证CST完整性
            const validation = validateCST(cst)
            if (!validation.valid) {
                throw new Error(`CST结构错误: ${validation.issues.join(', ')}`)
            }
            
            console.log(`   ✅ 通过`)
            results.passed++
            results.byCategory[info.category].passed++
            
        } catch (error) {
            console.log(`   ❌ 失败: ${error instanceof Error ? error.message : error}`)
            results.failed++
            results.byCategory[info.category].failed++
        }
    }
    
    // 输出统计
    console.log('\n' + '='.repeat(70))
    console.log('📊 测试统计\n')
    
    console.log(`总计：${results.total} 个测试`)
    console.log(`✅ 通过：${results.passed}`)
    console.log(`❌ 失败：${results.failed}`)
    console.log(`⏸️  跳过：${results.skipped}`)
    console.log(`📈 通过率：${((results.passed / (results.passed + results.failed)) * 100 || 0).toFixed(1)}%`)
    
    console.log('\n📋 分类统计：\n')
    Object.entries(results.byCategory).forEach(([category, stats]) => {
        const passRate = ((stats.passed / (stats.passed + stats.failed)) * 100 || 0).toFixed(1)
        console.log(`${category.padEnd(15)} - 总计:${stats.total} 通过:${stats.passed} 失败:${stats.failed} 跳过:${stats.skipped} (${passRate}%)`)
    })
    
    console.log('\n' + '='.repeat(70))
    
    if (results.failed === 0 && results.passed > 0) {
        console.log('🎉 所有已完善的规则测试通过！')
    } else if (results.failed > 0) {
        console.log(`⚠️  有 ${results.failed} 个测试失败，需要修复`)
    }
    
    if (results.skipped > 0) {
        console.log(`💡 还有 ${results.skipped} 个规则测试待完善`)
    }
}

// 执行测试
runTests().catch(console.error)







