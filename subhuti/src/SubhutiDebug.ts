/**
 * Subhuti Debug - 统一调试和性能分析系统（v3.0）
 * 
 * 设计理念：
 * - YAGNI：只实现实际需要的功能
 * - 简单优于复杂：统一入口，清晰的输出
 * - 基于实际需求：过程追踪 + 性能统计
 * 
 * 功能：
 * - ✅ 规则执行追踪（进入/退出）
 * - ✅ Token 消费显示（成功/失败）
 * - ✅ 缓存命中标识（⚡CACHED）
 * - ✅ 耗时信息
 * - ✅ 嵌套层级（缩进）
 * - ✅ Or 分支选择
 * - ✅ 回溯标识
 * - ✅ 性能统计（totalCalls, avgTime, cacheHits）
 * - ✅ Top N 慢规则（简化输出）
 * 
 * @version 3.0.0 - 合并 Debug + Profiler
 * @date 2025-11-04
 */

// ============================================
// 类型定义
// ============================================

/**
 * 规则性能统计
 */
export interface RuleStats {
    ruleName: string
    totalCalls: number          // 总调用次数（含缓存命中）
    actualExecutions: number    // 实际执行次数（不含缓存）
    cacheHits: number          // 缓存命中次数
    totalTime: number          // 总耗时（含缓存查询）
    executionTime: number      // 实际执行耗时（不含缓存）
    avgTime: number            // 平均耗时（仅实际执行）
}

// ============================================
// SubhutiDebugger - 调试器接口
// ============================================

/**
 * 调试器接口
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件
     * @returns 上下文对象（用于计算耗时）
     */
    onRuleEnter(ruleName: string, tokenIndex: number): unknown
    
    /**
     * 规则退出事件
     */
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void
    
    /**
     * Token 消费事件
     */
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void
    
    /**
     * Or 分支尝试事件
     */
    onOrBranch?(
        branchIndex: number,
        totalBranches: number,
        tokenIndex: number
    ): void
    
    /**
     * 回溯事件
     */
    onBacktrack?(
        fromTokenIndex: number,
        toTokenIndex: number
    ): void
}

// ============================================
// SubhutiTraceDebugger - 统一调试器（v3.0）
// ============================================

/**
 * Subhuti 轨迹调试器（v4.0 - 极简版）
 * 
 * 设计原则：
 * - 调用 debug() = 输出所有诊断信息
 * - 不调用 = 无输出
 * - 无参数，无多余方法
 * 
 * 整合功能：
 * - 过程追踪（规则进入/退出、Token 消费、Or 分支、回溯）
 * - 性能统计（调用次数、耗时、缓存命中率）
 * - CST 结构验证（null/undefined/children 检测）
 * - Token 完整性检查（输入 vs CST 对比）
 * - CST 统计分析（节点数、深度、类型分布）
 * - CST 可视化（树形结构展示）
 * 
 * 使用示例：
 * ```typescript
 * const parser = new MyParser(tokens)
 * parser.debug()  // 开启调试，输出所有信息
 * const cst = parser.Script()
 * ```
 * 
 * ============================================================
 * 输出格式示例（代码：let count = 1）
 * ============================================================
 * 
 * 【解析过程 - 实时输出】
 * ──────────────────────────────────────
 * ➡️  Script  @token[0]
 *   ➡️  StatementList  @token[0]
 *     🔀 Or[2 branches]  trying #0  @token[0]
 *     ➡️  Statement  @token[0]
 *       ➡️  VariableStatement  @token[0]
 *         ➡️  VariableDeclaration  @token[0]
 *           ➡️  LetDeclaration  @token[0]
 *             🔹 Consume  token[0] - let - <LetTok>  ✅
 *             ➡️  BindingList  @token[1]
 *               ➡️  LexicalBinding  @token[1]
 *                 ➡️  BindingIdentifier  @token[1]
 *                   🔹 Consume  token[1] - count - <Identifier>  ✅
 *                 ⬅️  BindingIdentifier (0.05ms)
 *                 ➡️  Initializer  @token[2]
 *                   🔹 Consume  token[2] - = - <Assign>  ✅
 *                   ➡️  AssignmentExpression  @token[3]
 *                     ➡️  ConditionalExpression  @token[3]
 *                       ➡️  PrimaryExpression  @token[3]
 *                         ➡️  Literal  @token[3]
 *                           🔹 Consume  token[3] - 1 - <DecimalLiteral>  ✅
 *                         ⬅️  Literal (0.02ms)
 *                       ⬅️  PrimaryExpression (0.08ms)
 *                     ⬅️  ConditionalExpression (0.15ms)
 *                   ⬅️  AssignmentExpression (0.18ms)
 *                 ⬅️  Initializer (0.22ms)
 *               ⬅️  LexicalBinding (0.35ms)
 *             ⬅️  BindingList (0.38ms)
 *           ⬅️  LetDeclaration (0.45ms)
 *         ⬅️  VariableDeclaration (0.48ms)
 *       ⬅️  VariableStatement (0.52ms)
 *     ⬅️  Statement (0.55ms)
 *     ⏪ Backtrack  token[4] → token[4]
 *   ⬅️  StatementList (0.68ms)
 * ⬅️  Script (0.75ms)
 * 
 * ============================================================
 * 
 * 【第一部分：性能摘要】
 * ──────────────────────────────────────
 * 
 * ⏱️  性能摘要
 * ────────────────────────────────────────
 * 总耗时: 0.75ms
 * 总调用: 25 次
 * 实际执行: 25 次
 * 缓存命中: 0 次 (0.0%)
 * 
 * Top 5 慢规则:
 *   1. Script: 0.75ms (1次, 平均750.0μs)
 *   2. StatementList: 0.68ms (1次, 平均680.0μs)
 *   3. Statement: 0.55ms (1次, 平均550.0μs)
 *   4. VariableStatement: 0.52ms (1次, 平均520.0μs)
 *   5. VariableDeclaration: 0.48ms (1次, 平均480.0μs)
 * 
 * 📋 所有规则详细统计:
 *   Script: 1次 | 执行1次 | 耗时0.75ms | 缓存0%
 *   StatementList: 1次 | 执行1次 | 耗时0.68ms | 缓存0%
 *   Statement: 1次 | 执行1次 | 耗时0.55ms | 缓存0%
 *   VariableStatement: 1次 | 执行1次 | 耗时0.52ms | 缓存0%
 *   VariableDeclaration: 1次 | 执行1次 | 耗时0.48ms | 缓存0%
 *   ... (更多规则)
 * 
 * ============================================================
 * 
 * 【第二部分：CST 验证报告】
 * ──────────────────────────────────────
 * 
 * 🔍 CST 验证报告
 * ────────────────────────────────────────
 * 
 * 📌 结构完整性: ✅
 *    无结构错误
 * 
 * 📌 Token 完整性: ✅
 *    输入 tokens: 4 个
 *    CST tokens:  4 个
 *    输入列表: [let, count, =, 1]
 *    CST列表:  [let, count, =, 1]
 *    ✅ 完整保留
 * 
 * 📌 CST 统计:
 *    总节点数: 28
 *    叶子节点: 4
 *    最大深度: 13
 *    节点类型: 14 种
 * 
 *    节点类型分布:
 *      Script: 1
 *      StatementList: 1
 *      Statement: 1
 *      VariableStatement: 1
 *      VariableDeclaration: 1
 *      ... (更多类型)
 * 
 * ────────────────────────────────────────
 * 
 * 【第三部分：CST 可视化】
 * ──────────────────────────────────────
 * 
 * 📊 CST 结构
 * ────────────────────────────────────────
 * └─Script [1:1-12]
 *    └─StatementList [1:1-12]
 *       └─Statement [1:1-12]
 *          └─VariableStatement [1:1-12]
 *             └─VariableDeclaration [1:1-12]
 *                └─LetDeclaration [1:1-12]
 *                   ├─LetTok: "let" [1:1-3]
 *                   └─BindingList [1:5-12]
 *                      └─LexicalBinding [1:5-12]
 *                         ├─BindingIdentifier [1:5-9]
 *                         │  └─Identifier: "count" [1:5-9]
 *                         └─Initializer [1:11-12]
 *                            ├─Assign: "=" [1:11-11]
 *                            └─AssignmentExpression [1:13-13]
 *                               └─ConditionalExpression [1:13-13]
 *                                  └─PrimaryExpression [1:13-13]
 *                                     └─Literal [1:13-13]
 *                                        └─DecimalLiteral: "1" [1:13-13]
 * ────────────────────────────────────────
 * 
 * ============================================================
 * 🎉 Debug 输出完成
 * ============================================================
 * 
 * 注意：
 * - 此输出格式可能随版本更新而调整
 * - 如需修改格式，请同步更新此注释中的示例
 */

import type SubhutiCst from "./struct/SubhutiCst.ts"

export class SubhutiTraceDebugger implements SubhutiDebugger {
    // ========================================
    // 过程追踪数据
    // ========================================
    private depth = 0
    public ruleStack: Array<{ruleName: string, startTime: number}> = []

    // ========================================
    // 性能统计数据
    // ========================================
    private stats = new Map<string, RuleStats>()
    
    // ========================================
    // Token 数据
    // ========================================
    private inputTokens: string[] = []
    
    // ========================================
    // CST 数据
    // ========================================
    private topLevelCst: SubhutiCst | null = null
    
    /**
     * 构造函数
     * 
     * @param tokens - 输入 token 流（用于完整性检查）
     */
    constructor(tokens?: any[]) {
        this.inputTokens = this.extractValidTokens(tokens || [])
    }
    
    /**
     * 从 token 流中提取有效 token（排除注释、空格等）
     */
    private extractValidTokens(tokens: any[]): string[] {
        return tokens
            .filter(t => {
                const name = t.tokenType?.name || ''
                return !['SingleLineComment', 'MultiLineComment', 'Spacing', 'LineBreak'].includes(name)
            })
            .map(t => t.tokenValue)
            .filter(v => v !== undefined)
    }
    
    // ========================================
    // 过程追踪方法
    // ========================================
    
    onRuleEnter(ruleName: string, tokenIndex: number): number {
        const startTime = performance.now()
        
        // 1. 过程追踪：立即输出规则进入
        const indent = '  '.repeat(this.depth)
        console.log(`${indent}➡️  ${ruleName}  @token[${tokenIndex}]`)
        
        // 2. 记录规则栈（用于 onRuleExit 时匹配）
        this.ruleStack.push({ruleName, startTime})
        this.depth++
        
        // 3. 性能统计：初始化统计数据
        let stat = this.stats.get(ruleName)
        if (!stat) {
            stat = {
                ruleName,
                totalCalls: 0,
                actualExecutions: 0,
                cacheHits: 0,
                totalTime: 0,
                executionTime: 0,
                avgTime: 0
            }
            this.stats.set(ruleName, stat)
        }
        stat.totalCalls++
        
        // 返回开始时间（用于计算耗时）
        return startTime
    }
    
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void {
        this.depth--
        
        // 计算耗时
        let duration = 0
        if (context !== undefined && typeof context === 'number') {
            duration = performance.now() - context
        }
        
        // 1. 过程追踪：立即输出规则退出
        const indent = '  '.repeat(this.depth)
        const cacheTag = cacheHit ? ' ⚡CACHED' : ''
        const timeTag = duration > 0 ? ` (${duration.toFixed(2)}ms)` : ''
        console.log(`${indent}⬅️  ${ruleName}${cacheTag}${timeTag}`)
        
        // 2. 弹出规则栈
        this.ruleStack.pop()
        
        // 3. 性能统计：更新统计数据
        const stat = this.stats.get(ruleName)
        if (stat) {
            stat.totalTime += duration
            
            if (cacheHit) {
                stat.cacheHits++
            } else {
                stat.actualExecutions++
                stat.executionTime += duration
                
                // 更新平均耗时
                if (stat.actualExecutions > 0) {
                    stat.avgTime = stat.executionTime / stat.actualExecutions
                }
            }
        }
    }
    
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void {
        const indent = '  '.repeat(this.depth)
        const status = success ? '✅' : '❌'
        const value = tokenValue.length > 20 ? tokenValue.slice(0, 20) + '...' : tokenValue
        
        console.log(
            `${indent}🔹 Consume  token[${tokenIndex}] - ${value} - <${tokenName}>  ${status}`
        )
    }
    
    onOrBranch(
        branchIndex: number,
        totalBranches: number,
        tokenIndex: number
    ): void {
        const indent = '  '.repeat(this.depth)
        console.log(
            `${indent}🔀 Or[${totalBranches} branches]  trying #${branchIndex}  @token[${tokenIndex}]`
        )
    }
    
    onBacktrack(
        fromTokenIndex: number,
        toTokenIndex: number
    ): void {
        const indent = '  '.repeat(this.depth)
        console.log(
            `${indent}⏪ Backtrack  token[${fromTokenIndex}] → token[${toTokenIndex}]`
        )
    }
    
    // ========================================
    // CST 验证方法
    // ========================================
    
    /**
     * 验证 CST 结构完整性
     */
    private validateStructure(node: any, path: string = 'root'): Array<{path: string, issue: string, node?: any}> {
        const errors: Array<{path: string, issue: string, node?: any}> = []

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

                const childErrors = this.validateStructure(child, childPath)
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
    
    /**
     * 收集所有 token 值
     */
    private collectTokenValues(node: any): string[] {
        const values: string[] = []

        if (node.value !== undefined && (!node.children || node.children.length === 0)) {
            values.push(node.value)
        }

        if (node.children) {
            for (const child of node.children) {
                values.push(...this.collectTokenValues(child))
            }
        }

        return values
    }
    
    /**
     * 检查 Token 完整性
     */
    private checkTokenCompleteness(cst: SubhutiCst): {
        input: string[]
        cst: string[]
        missing: string[]
    } {
        const cstTokens = this.collectTokenValues(cst)
        const missing = this.inputTokens.filter(t => !cstTokens.includes(t))

        return {
            input: this.inputTokens,
            cst: cstTokens,
            missing
        }
    }
    
    /**
     * 获取 CST 统计信息
     */
    private getCSTStatistics(node: any): {
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

        const traverse = (node: any, depth: number) => {
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
    
    // ========================================
    // 性能统计输出
    // ========================================
    
    /**
     * 获取性能摘要
     */
    private getSummary(): string {
        const allStats = Array.from(this.stats.values())
        
        if (allStats.length === 0) {
            return '📊 性能摘要：无数据'
        }
        
        // 计算总计
        const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0)
        const totalExecutions = allStats.reduce((sum, s) => sum + s.actualExecutions, 0)
        const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0)
        const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0)
        const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : '0.0'
        
        const lines: string[] = []
        lines.push('⏱️  性能摘要')
        lines.push('─'.repeat(40))
        lines.push(`总耗时: ${totalTime.toFixed(2)}ms`)
        lines.push(`总调用: ${totalCalls.toLocaleString()} 次`)
        lines.push(`实际执行: ${totalExecutions.toLocaleString()} 次`)
        lines.push(`缓存命中: ${totalCacheHits.toLocaleString()} 次 (${cacheHitRate}%)`)
        lines.push('')
        
        // Top 5 慢规则（简化版，无表格边框）
        const top5 = allStats
            .filter(s => s.actualExecutions > 0)
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, 5)
        
        if (top5.length > 0) {
            lines.push('Top 5 慢规则:')
            top5.forEach((stat, i) => {
                const avgUs = (stat.avgTime * 1000).toFixed(1)
                lines.push(
                    `  ${i + 1}. ${stat.ruleName}: ${stat.executionTime.toFixed(2)}ms ` +
                    `(${stat.totalCalls}次, 平均${avgUs}μs)`
                )
            })
        }
        
        return lines.join('\n')
    }
    
    // ========================================
    // CST 相关方法
    // ========================================
    
    /**
     * 设置要展示的 CST（由 Parser 在解析完成后调用）
     */
    setCst(cst: SubhutiCst | undefined): void {
        this.topLevelCst = cst || null
    }
    
    // ========================================
    // 自动输出（由 Parser 在顶层规则完成时调用）
    // ========================================
    
    /**
     * 自动输出完整调试报告
     */
    autoOutput(): void {
        console.log('\n' + '='.repeat(60))
        console.log('🔍 Subhuti Debug 输出')
        console.log('='.repeat(60))
        
        // ========================================
        // 第一部分：性能摘要
        // ========================================
        console.log('\n【第一部分：性能摘要】')
        console.log('─'.repeat(60))
        console.log('\n' + this.getSummary())
        
        // 所有规则详细统计
        console.log('\n📋 所有规则详细统计:')
        const allStats = Array.from(this.stats.values())
            .sort((a, b) => b.executionTime - a.executionTime)
        
        allStats.forEach((stat) => {
            const cacheRate = stat.totalCalls > 0 
                ? (stat.cacheHits / stat.totalCalls * 100).toFixed(1) 
                : '0.0'
            console.log(
                `  ${stat.ruleName}: ${stat.totalCalls}次 | ` +
                `执行${stat.actualExecutions}次 | ` +
                `耗时${stat.executionTime.toFixed(2)}ms | ` +
                `缓存${cacheRate}%`
            )
        })
        
        console.log('\n' + '='.repeat(60))
        
        // ========================================
        // 第二部分：CST 验证报告
        // ========================================
        if (this.topLevelCst) {
            console.log('\n【第二部分：CST 验证报告】')
            console.log('─'.repeat(60))
            console.log('\n🔍 CST 验证报告')
            console.log('─'.repeat(60))
            
            // 2.1 结构验证
            const structureErrors = this.validateStructure(this.topLevelCst)
            console.log(`\n📌 结构完整性: ${structureErrors.length === 0 ? '✅' : '❌'}`)
            
            if (structureErrors.length > 0) {
                console.log(`   发现 ${structureErrors.length} 个错误:`)
                structureErrors.forEach((err, i) => {
                    console.log(`\n   [${i + 1}] ${err.path}`)
                    console.log(`       问题: ${err.issue}`)
                    if (err.node) {
                        const nodeStr = JSON.stringify(err.node, null, 2)
                            .split('\n')
                            .map(line => `       ${line}`)
                            .join('\n')
                        console.log(nodeStr)
                    }
                })
            } else {
                console.log('   无结构错误')
            }
            
            // 2.2 Token 完整性
            const tokenResult = this.checkTokenCompleteness(this.topLevelCst)
            console.log(`\n📌 Token 完整性: ${tokenResult.missing.length === 0 ? '✅' : '❌'}`)
            console.log(`   输入 tokens: ${tokenResult.input.length} 个`)
            console.log(`   CST tokens:  ${tokenResult.cst.length} 个`)
            console.log(`   输入列表: [${tokenResult.input.join(', ')}]`)
            console.log(`   CST列表:  [${tokenResult.cst.join(', ')}]`)
            
            if (tokenResult.missing.length > 0) {
                console.log(`   ❌ 缺失: [${tokenResult.missing.join(', ')}]`)
            } else {
                console.log(`   ✅ 完整保留`)
            }
            
            // 2.3 CST 统计
            const stats = this.getCSTStatistics(this.topLevelCst)
            console.log(`\n📌 CST 统计:`)
            console.log(`   总节点数: ${stats.totalNodes}`)
            console.log(`   叶子节点: ${stats.leafNodes}`)
            console.log(`   最大深度: ${stats.maxDepth}`)
            console.log(`   节点类型: ${stats.nodeTypes.size} 种`)
            
            // 节点类型分布
            console.log(`\n   节点类型分布:`)
            const sortedTypes = Array.from(stats.nodeTypes.entries())
                .sort((a, b) => b[1] - a[1])
            sortedTypes.forEach(([name, count]) => {
                console.log(`     ${name}: ${count}`)
            })
            
            console.log('─'.repeat(60))
            
            // ========================================
            // 第三部分：CST 可视化
            // ========================================
            console.log('\n【第三部分：CST 可视化】')
            console.log('─'.repeat(60))
            console.log('\n📊 CST 结构')
            console.log('─'.repeat(60))
            console.log(this.formatCst(this.topLevelCst))
            console.log('─'.repeat(60))
        }
        
        console.log('\n' + '='.repeat(60))
        console.log('🎉 Debug 输出完成')
        console.log('='.repeat(60))
    }
    
    /**
     * 格式化 CST 为树形结构字符串
     */
    private formatCst(cst: SubhutiCst, prefix: string = '', isLast: boolean = true): string {
        const lines: string[] = []
        
        // 当前节点行
        const connector = isLast ? '└─' : '├─'
        const nodeLine = this.formatNode(cst, prefix, connector)
        lines.push(nodeLine)
        
        // 子节点
        if (cst.children && cst.children.length > 0) {
            const childPrefix = prefix + (isLast ? '   ' : '│  ')
            
            cst.children.forEach((child, index) => {
                const isLastChild = index === cst.children!.length - 1
                lines.push(this.formatCst(child, childPrefix, isLastChild))
            })
        }
        
        return lines.join('\n')
    }
    
    /**
     * 格式化单个节点
     */
    private formatNode(cst: SubhutiCst, prefix: string, connector: string): string {
        const isToken = cst.value !== undefined
        const parts: string[] = []
        
        // 连接符 + 节点名称
        parts.push(`${prefix}${connector}`)
        
        if (isToken) {
            // Token 节点：显示名称和值
            const valueStr = this.formatValue(cst.value)
            parts.push(`${cst.name}: ${valueStr}`)
        } else {
            // Rule 节点：只显示名称
            parts.push(`${cst.name}`)
        }
        
        // 位置信息（Token节点始终显示）
        if (isToken && cst.loc) {
            const locStr = this.formatLocation(cst.loc)
            parts.push(` ${locStr}`)
        }
        
        return parts.join('')
    }
    
    /**
     * 格式化值（处理特殊字符和长度）
     */
    private formatValue(value: string): string {
        // 转义特殊字符
        let escaped = value
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
        
        // 限制长度
        const maxLength = 40
        if (escaped.length > maxLength) {
            escaped = escaped.slice(0, maxLength) + '...'
        }
        
        return `"${escaped}"`
    }
    
    /**
     * 格式化位置信息
     */
    private formatLocation(loc: any): string {
        if (!loc.start || !loc.end) {
            return ''
        }
        
        const startLine = loc.start.line
        const startCol = loc.start.column
        const endLine = loc.end.line
        const endCol = loc.end.column
        
        if (startLine === endLine) {
            return `[${startLine}:${startCol}-${endCol}]`
        } else {
            return `[${startLine}:${startCol}-${endLine}:${endCol}]`
        }
    }
}


// ============================================
// 导出
// ============================================

export { SubhutiTraceDebugger as default }
