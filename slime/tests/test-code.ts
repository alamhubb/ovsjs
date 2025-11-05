/**
 * Es2025Parser 调试测试工具
 *
 * 用法：
 *   1. 直接运行：npx tsx tests/test-code.ts
 *   2. 传入代码：npx tsx tests/test-code.ts "let a = 1"
 *   3. 传入代码+规则：npx tsx tests/test-code.ts "let a = 1" "Script"
 *   4. 简化模式（无debug）：npx tsx tests/test-code.ts "let a = 1" "Script" "simple"
 *
 * 功能：
 *   - 自动词法分析 + 语法分析
 *   - 可选的 debug() 输出
 *   - 验证 CST 结构完整性
 *   - Token 值完整性检查
 *   - 友好的错误提示
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"

// ============================================
// CST 验证工具
// ============================================

interface CSTValidationError {
    path: string
    issue: string
    node?: any
}

function validateCSTStructure(node: any, path: string = 'root'): CSTValidationError[] {
    const errors: CSTValidationError[] = []

    if (node === null) {
        errors.push({ path, issue: 'Node is null' })
        return errors
    }

    if (node === undefined) {
        errors.push({ path, issue: 'Node is undefined' })
        return errors
    }

    if (!node.name && node.value === undefined) {
        errors.push({
            path,
            issue: 'Node has neither name nor value',
            node: { ...node, children: node.children ? `[${node.children.length} children]` : undefined }
        })
    }

    if (node.children !== undefined) {
        if (!Array.isArray(node.children)) {
            errors.push({
                path,
                issue: `children is not an array (type: ${typeof node.children})`,
                node: { name: node.name, childrenType: typeof node.children }
            })
            return errors
        }

        node.children.forEach((child: any, index: number) => {
            const childPath = `${path}.children[${index}]`

            if (child === null) {
                errors.push({ path: childPath, issue: 'Child is null' })
                return
            }

            if (child === undefined) {
                errors.push({ path: childPath, issue: 'Child is undefined' })
                return
            }

            const childErrors = validateCSTStructure(child, childPath)
            errors.push(...childErrors)
        })
    }

    if (node.value !== undefined && node.children && node.children.length > 0) {
        errors.push({
            path,
            issue: `Leaf node has both value and non-empty children`,
            node: { name: node.name, value: node.value, childrenCount: node.children.length }
        })
    }

    return errors
}

function collectTokenValues(node: any): string[] {
    const values: string[] = []

    if (node.value !== undefined && (!node.children || node.children.length === 0)) {
        values.push(node.value)
    }

    if (node.children) {
        for (const child of node.children) {
            values.push(...collectTokenValues(child))
        }
    }

    return values
}

function getCSTStatistics(node: any): {
    totalNodes: number
    leafNodes: number
    maxDepth: number
    nodeTypes: Map<string, number>
} {
    const stats = {
        totalNodes: 0,
        leafNodes: 0,
        maxDepth: 0,
        nodeTypes: new Map<string, number>()
    }

    function traverse(node: any, depth: number) {
        if (!node) return

        stats.totalNodes++
        stats.maxDepth = Math.max(stats.maxDepth, depth)

        if (node.name) {
            stats.nodeTypes.set(node.name, (stats.nodeTypes.get(node.name) || 0) + 1)
        }

        if (!node.children || node.children.length === 0) {
            stats.leafNodes++
        } else {
            for (const child of node.children) {
                traverse(child, depth + 1)
            }
        }
    }

    traverse(node, 0)
    return stats
}

// ============================================
// 测试函数
// ============================================

function testCode(code: string, entryRule: string = 'Script', mode: string = 'full') {
    const isSimple = mode === 'simple'

    console.log('🔍 Es2025Parser 调试测试')
    console.log('='.repeat(80))
    console.log(`📝 代码: ${code}`)
    console.log(`📐 入口规则: ${entryRule}`)
    console.log(`🔧 模式: ${isSimple ? '简化（无debug）' : '完整（带debug）'}`)
    console.log('='.repeat(80))

    try {
        // 步骤1: 词法分析
        console.log('\n📋 步骤1: 词法分析')
        console.log('-'.repeat(80))
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)

        console.log(`✅ 词法分析成功: ${tokens.length} tokens`)

        // 过滤有效 tokens（排除空白和注释）
        const inputTokens = tokens
            .filter((t: any) => {
                const tokenName = t.tokenType?.name || ''
                return tokenName !== 'SingleLineComment' &&
                    tokenName !== 'MultiLineComment' &&
                    tokenName !== 'Spacing' &&
                    tokenName !== 'LineBreak'
            })
            .map((t: any) => t.tokenValue)
            .filter((v: any) => v !== undefined)

        console.log(`📊 有效 tokens: ${inputTokens.length}`)
        console.log(`📝 Token 序列: [${inputTokens.join(', ')}]`)

        // 步骤2: 语法分析（带调试）
        console.log(`\n📋 步骤2: 语法分析${isSimple ? '' : '（启用 debug）'}`)
        console.log('-'.repeat(80))
        const parser = isSimple ? new Es2025Parser(tokens) : new Es2025Parser(tokens).debug()

        // 调用指定的入口规则
        let cst: any
        if (entryRule === 'Script') {
            cst = parser.Script()
        } else if (entryRule === 'Module') {
            cst = parser.Module()
        } else if (entryRule === 'Expression') {
            cst = parser.Expression()
        } else if (entryRule === 'Statement') {
            cst = parser.Statement()
        } else {
            // 尝试调用任意规则
            const method = (parser as any)[entryRule]
            if (typeof method === 'function') {
                cst = method.call(parser)
            } else {
                throw new Error(`未知的入口规则: ${entryRule}`)
            }
        }

        console.log(`✅ 语法分析成功`)

        // 步骤3: CST 结构验证
        console.log('\n📋 步骤3: CST 结构验证')
        console.log('-'.repeat(80))
        const structureErrors = validateCSTStructure(cst)

        if (structureErrors.length > 0) {
            console.log(`❌ CST 结构验证失败: ${structureErrors.length} 个错误`)
            structureErrors.slice(0, 5).forEach((error, index) => {
                console.log(`\n  错误 ${index + 1}:`)
                console.log(`    路径: ${error.path}`)
                console.log(`    问题: ${error.issue}`)
                if (error.node) {
                    console.log(`    节点: ${JSON.stringify(error.node, null, 4)}`)
                }
            })
            if (structureErrors.length > 5) {
                console.log(`\n  ... 还有 ${structureErrors.length - 5} 个错误`)
            }
        } else {
            console.log(`✅ CST 结构完整: 无错误`)
        }

        // 步骤4: Token 值完整性检查
        console.log('\n📋 步骤4: Token 值完整性检查')
        console.log('-'.repeat(80))
        const cstTokens = collectTokenValues(cst)
        const missingTokens: string[] = []

        for (const inputToken of inputTokens) {
            if (!cstTokens.includes(inputToken)) {
                missingTokens.push(inputToken)
            }
        }

        if (missingTokens.length > 0) {
            console.log(`❌ Token 值未完整保留: ${missingTokens.length} 个缺失`)
            console.log(`   缺失的 tokens: [${missingTokens.join(', ')}]`)
        } else {
            console.log(`✅ Token 值完整保留`)
        }

        console.log(`📊 输入 tokens: ${inputTokens.length}`)
        console.log(`📊 CST tokens: ${cstTokens.length}`)

        // 步骤5: CST 统计信息
        console.log('\n📋 步骤5: CST 统计信息')
        console.log('-'.repeat(80))
        const stats = getCSTStatistics(cst)

        console.log(`📊 总节点数: ${stats.totalNodes}`)
        console.log(`📊 叶子节点数: ${stats.leafNodes}`)
        console.log(`📊 最大深度: ${stats.maxDepth}`)
        console.log(`📊 节点类型分布:`)

        const sortedNodeTypes = Array.from(stats.nodeTypes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)

        sortedNodeTypes.forEach(([name, count]) => {
            console.log(`     ${name}: ${count}`)
        })

        if (stats.nodeTypes.size > 10) {
            console.log(`     ... 还有 ${stats.nodeTypes.size - 10} 种节点类型`)
        }

        // 步骤6: 完整 CST 输出
        if (!isSimple) {
            console.log('\n📋 步骤6: 完整 CST 输出')
            console.log('-'.repeat(80))
            console.log(JSON.stringify(cst, null, 2))
        } else {
            console.log('\n📋 步骤6: 完整 CST 输出')
            console.log('-'.repeat(80))
            console.log('（简化模式已跳过，如需查看请使用完整模式）')
        }

        // 总结
        console.log('\n' + '='.repeat(80))
        console.log('🎉 测试完成')
        console.log('='.repeat(80))

        const allPassed = structureErrors.length === 0 && missingTokens.length === 0

        if (allPassed) {
            console.log('✅ 所有检查都通过了！')
        } else {
            console.log('⚠️ 部分检查未通过，请查看上面的详细信息')
        }

        console.log(`\n📊 最终统计:`)
        console.log(`   - 输入代码长度: ${code.length} 字符`)
        console.log(`   - 词法 tokens: ${tokens.length}`)
        console.log(`   - 有效 tokens: ${inputTokens.length}`)
        console.log(`   - CST 节点数: ${stats.totalNodes}`)
        console.log(`   - 结构错误: ${structureErrors.length}`)
        console.log(`   - 缺失 tokens: ${missingTokens.length}`)

    } catch (error: any) {
        console.log('\n' + '='.repeat(80))
        console.log('❌ 测试失败')
        console.log('='.repeat(80))
        console.log(`错误信息: ${error.message}`)

        if (error.stack) {
            console.log(`\n堆栈跟踪:`)
            const stackLines = error.stack.split('\n').slice(0, 15)
            stackLines.forEach((line: string) => console.log(`  ${line}`))
        }

        process.exit(1)
    }
}

// ============================================
// 主程序
// ============================================

// 从命令行参数获取代码、入口规则和模式
const code = process.argv[2] || 'let a = 1'
const entryRule = process.argv[3] || 'Script'
const mode = process.argv[4] || 'simple' // 默认使用简化模式避免卡死

testCode(code, entryRule, mode)

