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
        toTokenIndex: number,
        reason: string
    ): void
    
    /**
     * 获取格式化的执行轨迹
     */
    getTrace(): string
    
    /**
     * 清空记录
     */
    clear(): void
}

// ============================================
// SubhutiTraceDebugger - 统一调试器（v3.0）
// ============================================

/**
 * Subhuti 轨迹调试器（v3.2 支持 CST 输出）
 * 
 * 整合功能：
 * - 过程追踪（Debug）- **实时输出**
 * - 性能统计（Profiler）
 * - CST 结构可视化（可选）
 * 
 * 输出模式：**实时输出**
 * - 规则进入/退出时立即输出到控制台
 * - Token 消费时立即输出
 * - Or 分支/回溯时立即输出
 * - 解析完成后输出性能摘要
 * - 解析完成后可选输出 CST 结构
 * 
 * 输出示例：
 * 
 * 1. 过程追踪（实时输出）：
 * ```
 * ➡️  ImportDeclaration  @token[0]
 *   🔹 Consume  token[0] - import - <ImportTok>  ✅
 *   ➡️  ImportClause  @token[1]
 *     🔀 Or[2 branches]  trying #0  @token[1]
 *     ⏪ Backtrack  token[5] → token[2]
 *   ⬅️  ImportClause (0.12ms)
 * ⬅️  ImportDeclaration ⚡CACHED (1.23ms)
 * ```
 * 
 * 2. 性能摘要（解析完成后输出）：
 * ```
 * ⏱️  性能摘要
 * ────────────────────────────────────────
 * 总耗时: 12.45ms
 * 总调用: 133 次
 * 实际执行: 42 次
 * 缓存命中: 91 次 (68.5%)
 * 
 * Top 5 慢规则:
 *   1. Expression: 5.23ms (45次, 平均116μs)
 *   2. Statement: 3.12ms (28次, 平均111μs)
 * ```
 * 
 * 3. CST 结构（可选输出）：
 * ```
 * 📊 CST 结构
 * └─VariableDeclaration [1:1-21]
 *    ├─LetTok: "let" [1:1-3]
 *    ├─Identifier: "sum" [1:5-7]
 *    └─Expression [1:11-19]
 *       ├─Number: "1" [1:11-11]
 *       └─Plus: "+" [1:13-13]
 * ```
 */

import type SubhutiCst from "./struct/SubhutiCst.ts"

export class SubhutiTraceDebugger implements SubhutiDebugger {
    // ========================================
    // 配置标志
    // ========================================
    private cstMode: boolean = false  // 是否为 CST 模式
    
    // ========================================
    // 过程追踪数据
    // ========================================
    private depth = 0
    private ruleStack: Array<{ruleName: string, startTime: number}> = []
    
    // ========================================
    // 性能统计数据
    // ========================================
    private stats = new Map<string, RuleStats>()
    
    // ========================================
    // CST 数据
    // ========================================
    private topLevelCst: SubhutiCst | null = null
    
    /**
     * 构造函数
     * 
     * @param mode - 调试模式：
     *   - `undefined`（默认）：普通模式（过程追踪 + 性能统计）
     *   - `'cst'`：CST 模式（只输出 CST 结构）
     * 
     * 使用示例：
     * ```typescript
     * const parser = new MyParser(tokens)
     * 
     * // 普通调试
     * parser.debug()
     * 
     * // CST 调试
     * parser.debug('cst')
     * ```
     */
    constructor(mode?: 'cst') {
        this.cstMode = mode === 'cst'
    }
    
    // ========================================
    // 过程追踪方法
    // ========================================
    
    onRuleEnter(ruleName: string, tokenIndex: number): number {
        const startTime = performance.now()
        
        // 1. 过程追踪：立即输出规则进入（非 CST 模式才输出）
        if (!this.cstMode) {
            const indent = '  '.repeat(this.depth)
            console.log(`${indent}➡️  ${ruleName}  @token[${tokenIndex}]`)
        }
        
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
        
        // 1. 过程追踪：立即输出规则退出（非 CST 模式才输出）
        if (!this.cstMode) {
            const indent = '  '.repeat(this.depth)
            const cacheTag = cacheHit ? ' ⚡CACHED' : ''
            const timeTag = duration > 0 ? ` (${duration.toFixed(2)}ms)` : ''
            console.log(`${indent}⬅️  ${ruleName}${cacheTag}${timeTag}`)
        }
        
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
        if (!this.cstMode) {
            const indent = '  '.repeat(this.depth)
            const status = success ? '✅' : '❌'
            const value = tokenValue.length > 20 ? tokenValue.slice(0, 20) + '...' : tokenValue
            
            console.log(
                `${indent}🔹 Consume  token[${tokenIndex}] - ${value} - <${tokenName}>  ${status}`
            )
        }
    }
    
    onOrBranch(
        branchIndex: number,
        totalBranches: number,
        tokenIndex: number
    ): void {
        if (!this.cstMode) {
            const indent = '  '.repeat(this.depth)
            console.log(
                `${indent}🔀 Or[${totalBranches} branches]  trying #${branchIndex}  @token[${tokenIndex}]`
            )
        }
    }
    
    onBacktrack(
        fromTokenIndex: number,
        toTokenIndex: number,
        reason: string
    ): void {
        if (!this.cstMode) {
            const indent = '  '.repeat(this.depth)
            console.log(
                `${indent}⏪ Backtrack  token[${fromTokenIndex}] → token[${toTokenIndex}]  (${reason})`
            )
        }
    }
    
    // ========================================
    // 过程追踪输出
    // ========================================
    
    /**
     * 获取执行轨迹（实时输出模式下无需此方法）
     */
    getTrace(): string {
        return '（实时输出模式：规则执行过程已直接输出到控制台）'
    }
    
    // ========================================
    // 性能统计输出
    // ========================================
    
    /**
     * 获取性能摘要（简化版）
     * 
     * 输出示例：
     * ```
     * ⏱️  性能摘要
     * ────────────────────────────────────────
     * 总耗时: 12.45ms
     * 总调用: 133 次
     * 实际执行: 42 次
     * 缓存命中: 91 次 (68.5%)
     * 
     * Top 5 慢规则:
     *   1. Expression: 5.23ms (45次, 平均116μs)
     *   2. Statement: 3.12ms (28次, 平均111μs)
     * ```
     */
    getSummary(): string {
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
    
    /**
     * 获取简洁摘要（单行）
     * 
     * 输出示例：
     * `⏱️ 12.45ms | 8 rules | 133 calls | 68.5% cached`
     */
    getShortSummary(): string {
        const allStats = Array.from(this.stats.values())
        const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0)
        const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0)
        const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0)
        const ruleCount = allStats.length
        const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : '0.0'
        
        return `⏱️  ${totalTime.toFixed(2)}ms | ${ruleCount} rules | ${totalCalls.toLocaleString()} calls | ${cacheHitRate}% cached`
    }
    
    /**
     * 获取原始统计数据（供高级用户使用）
     * 
     * 使用示例：
     * ```typescript
     * const stats = debugger.getStats()
     * for (const [ruleName, stat] of stats) {
     *   console.log(`${ruleName}: ${stat.avgTime}ms`)
     * }
     * ```
     */
    getStats(): Map<string, RuleStats> {
        return this.stats
    }
    
    // ========================================
    // 清空方法
    // ========================================
    
    /**
     * 清空所有记录（追踪 + 统计 + CST）
     */
    clear(): void {
        // 清空过程追踪
        this.depth = 0
        this.ruleStack = []
        
        // 清空性能统计
        this.stats.clear()
        
        // 清空 CST
        this.topLevelCst = null
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
     * 自动输出调试报告
     * 
     * - CST 模式：只输出 CST 结构
     * - 普通模式：输出性能摘要
     */
    autoOutput(): void {
        if (this.cstMode) {
            // CST 模式：只输出 CST
            this.outputCst()
        } else {
            // 普通模式：输出性能摘要
            console.log('\n' + '='.repeat(50))
            console.log(this.getSummary())
            console.log('='.repeat(50))
        }
    }
    
    /**
     * 输出 CST 结构
     */
    private outputCst(): void {
        if (!this.topLevelCst) {
            console.log('\n📊 CST 结构: (empty)')
            return
        }
        
        console.log('\n' + '='.repeat(60))
        console.log('📊 CST 结构')
        console.log('='.repeat(60))
        console.log(this.formatCst(this.topLevelCst))
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
