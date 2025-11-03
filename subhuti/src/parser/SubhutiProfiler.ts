/**
 * Subhuti 性能分析器⭐
 * 
 * 用途：
 * - 调试：找出性能瓶颈规则
 * - 调优：评估优化效果
 * - 监控：生产环境性能监控
 * 
 * 使用方式：
 * ```typescript
 * const parser = new MyParser(tokens)
 * parser.enableProfiling()
 * 
 * const cst = parser.Program()
 * 
 * console.log(parser.getProfilingReport())
 * ```
 * 
 * 输出示例：
 * ```
 * ========================================
 * ⏱️  Subhuti Parser Performance Report
 * ========================================
 * 
 * Total Time: 245.32ms
 * 
 * Top 10 Slowest Rules:
 * ────────────────────────────────────────
 * Rule                Count     Total     Avg       Max
 * Expression          1523      98.45ms   0.06ms    2.34ms
 * Statement           892       67.23ms   0.08ms    3.12ms
 * ...
 * 
 * 💡 Performance Suggestions:
 *   ⚠️  规则 "Expression" 占用 40.1% 的时间
 *      → 建议优化此规则或启用 Packrat 缓存
 * ```
 * 
 * @version 1.0.0
 * @date 2025-11-03
 */

/**
 * 规则执行统计
 */
export interface RuleStats {
    count: number       // 调用次数
    totalTime: number   // 总耗时(ms)
    minTime: number     // 最小耗时(ms)
    maxTime: number     // 最大耗时(ms)
    avgTime: number     // 平均耗时(ms)
}

/**
 * 性能分析器
 */
export class SubhutiProfiler {
    /**
     * 规则执行统计
     * 
     * Map<ruleName, RuleStats>
     */
    private ruleTimings = new Map<string, {
        count: number
        totalTime: number
        minTime: number
        maxTime: number
    }>()
    
    /**
     * 分析开始时间
     */
    private startTime = 0
    
    /**
     * 是否正在分析
     */
    private isProfiling = false
    
    /**
     * 开始性能分析
     */
    start(): void {
        this.startTime = performance.now()
        this.ruleTimings.clear()
        this.isProfiling = true
    }
    
    /**
     * 停止性能分析
     */
    stop(): void {
        this.isProfiling = false
    }
    
    /**
     * 记录规则执行时间
     * 
     * @param ruleName 规则名称
     * @param duration 执行耗时(ms)
     */
    recordRule(ruleName: string, duration: number): void {
        if (!this.isProfiling) {
            return
        }
        
        const existing = this.ruleTimings.get(ruleName)
        
        if (existing) {
            existing.count++
            existing.totalTime += duration
            existing.minTime = Math.min(existing.minTime, duration)
            existing.maxTime = Math.max(existing.maxTime, duration)
        } else {
            this.ruleTimings.set(ruleName, {
                count: 1,
                totalTime: duration,
                minTime: duration,
                maxTime: duration
            })
        }
    }
    
    /**
     * 获取规则统计（带平均时间）
     */
    getRuleStats(): Map<string, RuleStats> {
        const stats = new Map<string, RuleStats>()
        
        for (const [ruleName, timing] of this.ruleTimings) {
            stats.set(ruleName, {
                count: timing.count,
                totalTime: timing.totalTime,
                minTime: timing.minTime,
                maxTime: timing.maxTime,
                avgTime: timing.totalTime / timing.count
            })
        }
        
        return stats
    }
    
    /**
     * 生成性能报告（详细版）
     * 
     * 包含：
     * - 总时间
     * - Top 10 慢规则
     * - 性能建议
     */
    getReport(): string {
        const totalTime = performance.now() - this.startTime
        const lines: string[] = []
        
        // ========================================
        // 标题
        // ========================================
        lines.push('========================================')
        lines.push('⏱️  Subhuti Parser Performance Report')
        lines.push('========================================')
        lines.push('')
        lines.push(`Total Time: ${totalTime.toFixed(2)}ms`)
        lines.push('')
        
        // ========================================
        // 统计信息
        // ========================================
        const totalRules = this.ruleTimings.size
        let totalCalls = 0
        for (const timing of this.ruleTimings.values()) {
            totalCalls += timing.count
        }
        
        lines.push(`Total Rules: ${totalRules}`)
        lines.push(`Total Calls: ${totalCalls.toLocaleString()}`)
        lines.push('')
        
        // ========================================
        // Top 10 Slowest Rules
        // ========================================
        const sorted = Array.from(this.ruleTimings.entries())
            .map(([name, timing]) => ({
                name,
                ...timing,
                avgTime: timing.totalTime / timing.count
            }))
            .sort((a, b) => b.totalTime - a.totalTime)
        
        lines.push('Top 10 Slowest Rules:')
        lines.push('─'.repeat(90))
        lines.push(
            'Rule'.padEnd(30) +
            'Count'.padEnd(12) +
            'Total(ms)'.padEnd(14) +
            'Avg(ms)'.padEnd(14) +
            'Max(ms)'.padEnd(14)
        )
        lines.push('─'.repeat(90))
        
        sorted.slice(0, 10).forEach(stats => {
            lines.push(
                stats.name.padEnd(30) +
                stats.count.toString().padEnd(12) +
                stats.totalTime.toFixed(2).padEnd(14) +
                stats.avgTime.toFixed(3).padEnd(14) +
                stats.maxTime.toFixed(3).padEnd(14)
            )
        })
        
        lines.push('')
        
        // ========================================
        // 性能建议
        // ========================================
        lines.push('💡 Performance Suggestions:')
        lines.push('')
        
        const suggestions = this.generateSuggestions(sorted, totalTime, totalCalls)
        suggestions.forEach(s => lines.push(`  ${s}`))
        
        if (suggestions.length === 0) {
            lines.push('  ✅ 性能表现良好，无明显瓶颈')
        }
        
        return lines.join('\n')
    }
    
    /**
     * 生成性能建议
     */
    private generateSuggestions(
        sorted: Array<{ name: string, count: number, totalTime: number, avgTime: number, maxTime: number }>,
        totalTime: number,
        totalCalls: number
    ): string[] {
        const suggestions: string[] = []
        
        // 建议1：时间占比过高的规则
        const slowestRule = sorted[0]
        if (slowestRule && slowestRule.totalTime > totalTime * 0.3) {
            const percentage = (slowestRule.totalTime / totalTime * 100).toFixed(1)
            suggestions.push(`⚠️  规则 "${slowestRule.name}" 占用 ${percentage}% 的时间`)
            suggestions.push(`   → 建议优化此规则或启用 Packrat 缓存`)
            suggestions.push('')
        }
        
        // 建议2：高频调用规则
        const highCountRules = sorted.filter(s => s.count > totalCalls * 0.1)
        if (highCountRules.length > 0) {
            suggestions.push(`⚠️  ${highCountRules.length} 个规则调用频率很高（> 10%总调用）`)
            highCountRules.slice(0, 3).forEach(rule => {
                const percentage = (rule.count / totalCalls * 100).toFixed(1)
                suggestions.push(`   • ${rule.name}: ${rule.count.toLocaleString()} 次 (${percentage}%)`)
            })
            suggestions.push(`   → 确保 Packrat 缓存已启用`)
            suggestions.push('')
        }
        
        // 建议3：平均耗时过高的规则
        const slowAvgRules = sorted.filter(s => s.avgTime > 1.0)  // 平均>1ms
        if (slowAvgRules.length > 0) {
            suggestions.push(`⚠️  ${slowAvgRules.length} 个规则平均耗时过高（> 1ms）`)
            slowAvgRules.slice(0, 3).forEach(rule => {
                suggestions.push(`   • ${rule.name}: ${rule.avgTime.toFixed(2)}ms 平均`)
            })
            suggestions.push(`   → 考虑优化规则实现或减少内部操作`)
            suggestions.push('')
        }
        
        // 建议4：峰值耗时异常的规则
        const peakRules = sorted.filter(s => s.maxTime > s.avgTime * 10)  // 峰值>10倍平均
        if (peakRules.length > 0) {
            suggestions.push(`⚠️  ${peakRules.length} 个规则存在异常慢的调用`)
            peakRules.slice(0, 3).forEach(rule => {
                suggestions.push(`   • ${rule.name}: 最慢 ${rule.maxTime.toFixed(2)}ms（平均 ${rule.avgTime.toFixed(3)}ms）`)
            })
            suggestions.push(`   → 检查特殊输入或边界情况`)
            suggestions.push('')
        }
        
        // 建议5：总体性能评估
        const avgCallTime = totalTime / totalCalls
        if (avgCallTime > 0.1) {
            suggestions.push(`⚠️  平均每次规则调用耗时 ${avgCallTime.toFixed(3)}ms（较慢）`)
            suggestions.push(`   → 启用 Packrat 缓存可大幅提升性能`)
        }
        
        return suggestions
    }
    
    /**
     * 获取简洁报告（单行）
     */
    getShortReport(): string {
        const totalTime = performance.now() - this.startTime
        const totalRules = this.ruleTimings.size
        let totalCalls = 0
        for (const timing of this.ruleTimings.values()) {
            totalCalls += timing.count
        }
        
        return `⏱️  ${totalTime.toFixed(2)}ms | ${totalRules} rules | ${totalCalls.toLocaleString()} calls`
    }
}


