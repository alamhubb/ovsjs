/**
 * Parser 解析可视化工具 - 融合完美版
 * 
 * 功能：
 * 1. Token流展示 - 清晰的词法分析结果
 * 2. 解析树展示 - 美观的CST树形结构
 * 3. 解析过程跟踪 - Or分支选择、回溯过程（可选）
 * 4. 问题诊断 - 自动定位解析问题
 * 5. 多种模式 - 简洁/详细/调试模式
 * 
 * 用法：
 *   npx tsx parse-visualizer.ts "const x = {async: 37}"
 *   npx tsx parse-visualizer.ts "const x = {async: 37}" --mode=simple
 *   npx tsx parse-visualizer.ts "const x = {async: 37}" --mode=detail
 *   npx tsx parse-visualizer.ts "const x = {async: 37}" --mode=debug
 *   npx tsx parse-visualizer.ts "const x = {async: 37}" --highlight=PropertyDefinition,AsyncTok
 * 
 * 模式说明：
 *   simple  - 简洁模式（只显示关键规则 + Token流 + 统计）
 *   detail  - 详细模式（完整CST树 + Token流 + 统计）[默认]
 *   debug   - 调试模式（解析过程跟踪 + CST树 + 诊断）
 */

import Es2020Parser from "slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts"
import SubhutiLexer from 'src/parser/SubhutiLexer.ts'

// ============================================
// 类型定义
// ============================================

interface TreeNode {
    name: string
    value?: string
    children?: TreeNode[]
    isToken?: boolean
}

interface ParseEvent {
    type: 'enter' | 'exit' | 'or-enter' | 'or-exit' | 'token'
    ruleName?: string
    branchIndex?: number
    branchName?: string
    success?: boolean
    tokenType?: string
    tokenValue?: string
    depth: number
}

// ============================================
// CST树处理
// ============================================

function simplifyCST(cst: any): TreeNode {
    if (!cst) return { name: 'null' }
    
    // 叶子节点（token）
    if (cst.value !== undefined && (!cst.children || cst.children.length === 0)) {
        return {
            name: cst.name || 'Token',
            value: cst.value,
            isToken: true
        }
    }
    
    // 中间节点
    const node: TreeNode = {
        name: cst.name || 'Unknown'
    }
    
    if (cst.children && cst.children.length > 0) {
        node.children = cst.children.map((child: any) => simplifyCST(child))
    }
    
    return node
}

function renderTree(
    node: TreeNode, 
    indent: number = 0, 
    isLast: boolean = true, 
    prefix: string = '',
    highlightRules: string[] = [],
    indentStr: string = '│  '  // 缩进字符串，默认树形线条
): string[] {
    const lines: string[] = []
    
    // 根据缩进字符串决定连接符样式
    const useTreeStyle = indentStr.includes('│') || indentStr.includes('├') || indentStr.includes('└')
    
    // 当前节点
    let connector = ''
    if (indent > 0) {
        if (useTreeStyle) {
            // 树形样式：使用 ├─ 和 └─
            connector = isLast ? '└─ ' : '├─ '
        } else {
            // 简洁样式：只用缩进
            connector = ''
        }
    }
    
    const nodeName = node.value ? `${node.name}: "${node.value}" ✅` : node.name
    
    // 高亮处理
    const isHighlighted = highlightRules.some(rule => nodeName.includes(rule))
    const displayName = isHighlighted ? `🔍 ${nodeName}` : nodeName
    
    lines.push(`${prefix}${connector}${displayName}`)
    
    // 子节点
    if (node.children && node.children.length > 0) {
        let childPrefix = prefix
        
        if (indent > 0) {
            if (useTreeStyle) {
                // 树形样式：最后一个子节点用空格，其他用竖线
                childPrefix = prefix + (isLast ? '   ' : '│  ')
            } else {
                // 简洁样式：直接累加缩进字符串
                childPrefix = prefix + indentStr
            }
        } else {
            // 根节点的子节点
            childPrefix = useTreeStyle ? '' : indentStr
        }
        
        node.children.forEach((child, index) => {
            const childIsLast = index === node.children!.length - 1
            const childLines = renderTree(child, indent + 1, childIsLast, childPrefix, highlightRules, indentStr)
            lines.push(...childLines)
        })
    }
    
    return lines
}

// 过滤树（简洁模式）
function filterTree(node: TreeNode, importantRules: string[]): TreeNode {
    // 叶子节点保留
    if (node.isToken) {
        return node
    }
    
    // 重要规则保留
    if (importantRules.includes(node.name)) {
        return node
    }
    
    // 递归过滤子节点
    if (node.children && node.children.length > 0) {
        const filteredChildren = node.children
            .map(child => filterTree(child, importantRules))
            .filter(child => child !== null) as TreeNode[]
        
        // 单子节点展平
        if (filteredChildren.length === 1 && !importantRules.includes(node.name)) {
            return filteredChildren[0]
        }
        
        if (filteredChildren.length > 0) {
            return {
                name: node.name,
                children: filteredChildren
            }
        }
    }
    
    return node
}

// ============================================
// Token流处理
// ============================================

function formatTokenStream(tokens: any[]): void {
    const inputTokens = tokens.filter((t: any) => {
        const tokenName = t.tokenType?.name || ''
        return tokenName !== 'SingleLineComment' &&
            tokenName !== 'MultiLineComment' &&
            tokenName !== 'Spacing' &&
            tokenName !== 'LineBreak'
    })
    
    console.log(`\n📝 Token流 (${inputTokens.length}个):`)
    console.log('─'.repeat(80))
    
    inputTokens.forEach((t: any, i: number) => {
        const tokenName = (t.tokenType?.name || 'Unknown').padEnd(20)
        const tokenValue = t.tokenValue
        const position = `[${i + 1}]`.padStart(5)
        console.log(`${position} ${tokenName} "${tokenValue}"`)
    })
}

// ============================================
// 统计信息
// ============================================

function calculateStats(tree: TreeNode) {
    const stats = {
        totalNodes: 0,
        leafNodes: 0,
        maxDepth: 0,
        tokenCount: 0,
        ruleCount: 0
    }
    
    function traverse(node: TreeNode, depth: number = 0) {
        stats.totalNodes++
        stats.maxDepth = Math.max(stats.maxDepth, depth)
        
        if (node.isToken) {
            stats.leafNodes++
            stats.tokenCount++
        } else {
            stats.ruleCount++
        }
        
        if (node.children) {
            node.children.forEach(child => traverse(child, depth + 1))
        }
    }
    
    traverse(tree)
    return stats
}

function printStats(stats: any): void {
    console.log(`\n📈 统计信息:`)
    console.log('─'.repeat(80))
    console.log(`  总节点数: ${stats.totalNodes} (规则: ${stats.ruleCount}, Token: ${stats.tokenCount})`)
    console.log(`  叶子节点: ${stats.leafNodes}`)
    console.log(`  最大深度: ${stats.maxDepth}`)
}

// ============================================
// 问题诊断
// ============================================

function diagnoseIssues(tree: TreeNode, tokens: any[]): void {
    const issues: string[] = []
    
    // 检查token丢失
    const inputTokenCount = tokens.filter((t: any) => {
        const tokenName = t.tokenType?.name || ''
        return tokenName !== 'SingleLineComment' &&
            tokenName !== 'MultiLineComment' &&
            tokenName !== 'Spacing' &&
            tokenName !== 'LineBreak'
    }).length
    
    const stats = calculateStats(tree)
    
    if (stats.tokenCount < inputTokenCount) {
        issues.push(`⚠️  Token丢失: 输入${inputTokenCount}个，CST中只有${stats.tokenCount}个`)
    }
    
    // 检查常见问题规则
    const problemRules = ['MethodDefinition', 'ArrowFunction', 'AsyncGeneratorMethod']
    let foundProblemRule = false
    
    function checkNode(node: TreeNode) {
        if (problemRules.includes(node.name)) {
            foundProblemRule = true
        }
        if (node.children) {
            node.children.forEach(checkNode)
        }
    }
    
    checkNode(tree)
    
    if (foundProblemRule && issues.length > 0) {
        issues.push(`💡 提示: 可能是关键字作为属性名的问题（async, yield, await等）`)
    }
    
    // 输出诊断
    if (issues.length > 0) {
        console.log(`\n🔍 问题诊断:`)
        console.log('─'.repeat(80))
        issues.forEach(issue => console.log(`  ${issue}`))
    }
}

// ============================================
// 导出的可视化函数（可被其他模块使用）
// ============================================

export interface VisualizeOptions {
    code: string
    mode?: 'simple' | 'detail' | 'debug'
    highlight?: string[]
    showTokens?: boolean
    showStats?: boolean
    indent?: string  // 缩进字符，默认 '│  '（树形线条），可设为 ' '（1空格）, '  '（2空格）等
}

export function visualizeCode(options: VisualizeOptions): {
    success: boolean
    tree?: TreeNode
    tokens?: any[]
    stats?: any
    error?: string
} {
    const {
        code,
        mode = 'detail',
        highlight = [],
        showTokens = true,
        showStats = true
    } = options
    
    try {
        // 词法分析
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        
        // 语法分析
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        // 转换CST
        let tree = simplifyCST(cst)
        
        // 简洁模式：过滤不重要的规则
        if (mode === 'simple') {
            const importantRules = [
                'Program', 'VariableDeclaration', 'VariableDeclarator', 'Initializer',
                'ObjectLiteral', 'PropertyDefinitionList', 'PropertyDefinition',
                'PropertyName', 'LiteralPropertyName', 'MethodDefinition',
                'BindingIdentifier', 'AssignmentExpression'
            ]
            tree = filterTree(tree, importantRules)
        }
        
        const stats = calculateStats(tree)
        
        return {
            success: true,
            tree,
            tokens,
            stats
        }
        
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        }
    }
}

export function printVisualization(options: VisualizeOptions): void {
    const {
        code,
        mode = 'detail',
        highlight = [],
        indent = '│  '  // 默认树形线条
    } = options
    
    console.log('🌳 Parser 解析可视化工具')
    console.log('='.repeat(80))
    console.log(`输入代码: ${code}`)
    console.log(`显示模式: ${mode}`)
    if (highlight.length > 0) {
        console.log(`高亮规则: ${highlight.join(', ')}`)
    }
    if (indent !== '│  ') {
        const indentName = indent === ' ' ? '1空格' : indent === '  ' ? '2空格' : indent === '    ' ? '4空格' : `自定义(${JSON.stringify(indent)})`
        console.log(`缩进样式: ${indentName}`)
    }
    console.log('='.repeat(80))
    
    const result = visualizeCode(options)
    
    if (!result.success) {
        console.log(`\n❌ 解析失败: ${result.error}`)
        return
    }
    
    // 显示Token流
    if (result.tokens) {
        formatTokenStream(result.tokens)
    }
    
    console.log(`\n✅ 解析成功！`)
    
    // 显示解析树
    console.log(`\n📊 解析树结构 (${mode}模式):`)
    console.log('='.repeat(80))
    
    const lines = renderTree(result.tree!, 0, true, '', highlight, indent)
    lines.forEach(line => console.log(line))
    
    console.log('='.repeat(80))
    
    // 统计信息
    if (result.stats) {
        printStats(result.stats)
    }
    
    // 调试模式：问题诊断
    if (mode === 'debug' && result.tokens) {
        diagnoseIssues(result.tree!, result.tokens)
    }
}

// ============================================
// 命令行主程序
// ============================================

function parseArgs() {
    const args = {
        code: process.argv[2] || `const x = {async: 37}`,
        mode: 'detail' as 'simple' | 'detail' | 'debug',
        highlight: [] as string[],
        indent: '│  '  // 默认树形线条
    }
    
    process.argv.forEach(arg => {
        if (arg.startsWith('--mode=')) {
            const mode = arg.split('=')[1]
            if (['simple', 'detail', 'debug'].includes(mode)) {
                args.mode = mode as any
            }
        }
        if (arg.startsWith('--highlight=')) {
            args.highlight = arg.split('=')[1].split(',')
        }
        if (arg.startsWith('--indent=')) {
            const indentValue = arg.split('=')[1]
            // 支持预定义的缩进样式
            if (indentValue === '1') {
                args.indent = ' '
            } else if (indentValue === '2') {
                args.indent = '  '
            } else if (indentValue === '4') {
                args.indent = '    '
            } else if (indentValue === 'tree') {
                args.indent = '│  '
            } else {
                // 自定义缩进字符串（支持转义）
                args.indent = indentValue.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
            }
        }
    })
    
    return args
}

function main() {
    const args = parseArgs()
    
    printVisualization({
        code: args.code,
        mode: args.mode,
        highlight: args.highlight,
        indent: args.indent
    })
    
    // 使用提示
    console.log(`\n💡 使用提示:`)
    console.log('─'.repeat(80))
    console.log(`  --mode=simple    简洁模式（只显示关键规则）`)
    console.log(`  --mode=detail    详细模式（完整CST树）[默认]`)
    console.log(`  --mode=debug     调试模式（包含问题诊断）`)
    console.log(`  --highlight=规则  高亮特定规则（逗号分隔）`)
    console.log(`  --indent=样式     缩进样式:`)
    console.log(`                    tree  树形线条 [默认]`)
    console.log(`                    1     1个空格`)
    console.log(`                    2     2个空格`)
    console.log(`                    4     4个空格`)
    console.log(`                    或自定义字符串`)
    console.log(``)
    console.log(`示例:`)
    console.log(`  # 基础用法`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}"`)
    console.log(`  `)
    console.log(`  # 不同模式`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}" --mode=simple`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}" --mode=debug`)
    console.log(`  `)
    console.log(`  # 缩进样式`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}" --indent=1`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}" --indent=2`)
    console.log(`  npx tsx parse-visualizer.ts "const x = {async: 37}" --indent=4`)
    console.log(`  `)
    console.log(`  # 组合使用`)
    console.log(`  npx tsx parse-visualizer.ts "obj.yield" --highlight=MemberExpression --indent=2`)
}

// 只有作为命令行工具运行时才执行main
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    main()
}


