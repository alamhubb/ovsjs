/**
 * Subhuti 性能分析器（v2.0 - 支持缓存追踪）⭐
 * 
 * 用途：
 * - 调试：找出性能瓶颈规则
 * - 调优：评估优化效果
 * - 缓存分析：评估缓存命中率
 * - 监控：生产环境性能监控
 * 
 * 核心特性（v2.0）：
 * - 区分总调用和实际执行
 * - 追踪缓存命中率
 * - 详细的性能报告
 * - 智能优化建议
 * 
 * 使用方式：
 * ```typescript
 * const parser = new MyParser(tokens).profiling()
 * 
 * const cst = parser.Program()
 * 
 * console.log(parser.getProfilingReport())
 * ```
 * 
 * 输出示例：
 * ```
 * ⏱️  性能报告
 * 
 * 总耗时: 245.32ms
 * 总调用: 15,234
 * 实际执行: 3,456 (缓存命中率: 77.3%)
 * 
 * Top 10 慢规则（按执行耗时）:
 * ┌─────────────┬───────┬──────────┬──────────┬──────────┬──────────┐
 * │ 规则        │ 调用  │ 执行     │ 缓存     │ 执行耗时 │ 平均耗时 │
 * ├─────────────┼───────┼──────────┼──────────┼──────────┼──────────┤
 * │ Expression  │ 5,234 │ 1,124    │ 4,110    │ 89.23ms  │ 79.4μs   │
 * │ Statement   │ 3,456 │   845    │ 2,611    │ 56.78ms  │ 67.2μs   │
 * └─────────────┴───────┴──────────┴──────────┴──────────┴──────────┘
 * ```
 * 
 * @version 2.0.0
 * @date 2025-11-04
 */

/**
 * 规则执行统计（v2.0 增强）
 */
export interface RuleStats {
    ruleName: string
    totalCalls: number          // 总调用次数（含缓存命中）
    actualExecutions: number    // 实际执行次数（不含缓存）
    cacheHits: number          // 缓存命中次数
    totalTime: number          // 总耗时（含缓存查询）
    executionTime: number      // 实际执行耗时（不含缓存）
    minTime: number            // 最小耗时
    maxTime: number            // 最大耗时
    avgTime: number            // 平均耗时（仅实际执行）
}

/**
 * 性能分析器（v2.0）
 */
export class SubhutiProfiler {
    /**
     * 规则执行统计
     * 
     * Map<ruleName, RuleStats>
     */
    private stats = new Map<string, RuleStats>()
    
    /**
     * 是否正在分析
     */
    private enabled = false
    
    /**
     * 开始性能分析
     */
    start(): void {
        this.enabled = true
        this.stats.clear()
    }
    
    /**
     * 停止性能分析
     */
    stop(): void {
        this.enabled = false
    }
    
    /**
     * 规则开始（由 SubhutiParser 调用）
     * 
     * @param ruleName - 规则名称
     * @returns 上下文对象（包含时间戳）
     */
    startRule(ruleName: string): { startTime: number; ruleName: string } | undefined {
        if (!this.enabled) return undefined
        
        // 获取或创建统计记录
        let stat = this.stats.get(ruleName)
        if (!stat) {
            stat = {
                ruleName,
                totalCalls: 0,
                actualExecutions: 0,
                cacheHits: 0,
                totalTime: 0,
                executionTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0
            }
            this.stats.set(ruleName, stat)
        }
        
        // 增加总调用次数
        stat.totalCalls++
        
        // 返回上下文
        return {
            startTime: performance.now(),
            ruleName
        }
    }
    
    /**
     * 规则结束（由 SubhutiParser 调用）
     * 
     * @param ruleName - 规则名称
     * @param context - startRule 返回的上下文
     * @param cacheHit - 是否缓存命中
     */
    endRule(
        ruleName: string, 
        context: unknown, 
        cacheHit: boolean
    ): void {
        if (!this.enabled || !context) return
        
        const ctx = context as { startTime: number; ruleName: string }
        const duration = performance.now() - ctx.startTime
        
        const stat = this.stats.get(ruleName)
        if (!stat) return
        
        // 更新总耗时
        stat.totalTime += duration
        
        if (cacheHit) {
            // 缓存命中
            stat.cacheHits++
        } else {
            // 实际执行
            stat.actualExecutions++
            stat.executionTime += duration
            stat.minTime = Math.min(stat.minTime, duration)
            stat.maxTime = Math.max(stat.maxTime, duration)
        }
        
        // 计算平均耗时
        if (stat.actualExecutions > 0) {
            stat.avgTime = stat.executionTime / stat.actualExecutions
        }
    }
    
    /**
     * 获取规则统计（原始数据）
     */
    getRuleStats(): Map<string, RuleStats> {
        return this.stats
    }
    
    /**
     * 获取格式化报告（v2.0 增强）
     */
    getReport(): string {
        if (!this.enabled) {
            return '⚠️  性能分析未启用\n   → 请先调用 profiling()'
        }
        
        const allStats = Array.from(this.stats.values())
        if (allStats.length === 0) {
            return '📊 性能报告：无数据'
        }
        
        // 按实际执行耗时排序
        const sorted = allStats
            .filter(s => s.actualExecutions > 0)
            .sort((a, b) => b.executionTime - a.executionTime)
        
        // 总统计
        const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0)
        const totalExecutions = allStats.reduce((sum, s) => sum + s.actualExecutions, 0)
        const totalCacheHits = allStats.reduce((sum, s) => sum + s.cacheHits, 0)
        const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0)
        const cacheHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls * 100).toFixed(1) : '0.0'
        
        const lines: string[] = []
        lines.push('⏱️  性能报告')
        lines.push('')
        lines.push(`总耗时: ${totalTime.toFixed(2)}ms`)
        lines.push(`总调用: ${totalCalls.toLocaleString()}`)
        lines.push(`实际执行: ${totalExecutions.toLocaleString()}`)
        lines.push(`缓存命中: ${totalCacheHits.toLocaleString()} (${cacheHitRate}%)`)
        lines.push('')
        
        // Top 10 慢规则
        lines.push('Top 10 慢规则（按执行耗时）:')
        lines.push('┌─────────────────────┬───────┬──────────┬──────────┬──────────┬──────────┐')
        lines.push('│ 规则                │ 调用  │ 执行     │ 缓存     │ 执行耗时 │ 平均耗时 │')
        lines.push('├─────────────────────┼───────┼──────────┼──────────┼──────────┼──────────┤')
        
        const top10 = sorted.slice(0, 10)
        for (const stat of top10) {
            const name = stat.ruleName.padEnd(19).slice(0, 19)
            const calls = stat.totalCalls.toString().padStart(5)
            const execs = stat.actualExecutions.toString().padStart(8)
            const cache = stat.cacheHits.toString().padStart(8)
            const execTime = `${stat.executionTime.toFixed(2)}ms`.padStart(8)
            const avgTime = `${(stat.avgTime * 1000).toFixed(1)}μs`.padStart(8)
            
            lines.push(`│ ${name} │ ${calls} │ ${execs} │ ${cache} │ ${execTime} │ ${avgTime} │`)
        }
        
        lines.push('└─────────────────────┴───────┴──────────┴──────────┴──────────┴──────────┘')
        lines.push('')
        
        // 智能建议
        lines.push('💡 建议:')
        if (parseFloat(cacheHitRate) >= 70) {
            lines.push('  ✅ 缓存命中率优秀（≥ 70%）')
        } else if (parseFloat(cacheHitRate) >= 50) {
            lines.push('  ✅ 缓存命中率良好（50-70%）')
        } else {
            lines.push('  ⚠️  缓存命中率偏低（< 50%），建议检查语法规则')
        }
        
        // 找出缓存率低的规则
        const lowCacheRules = allStats
            .filter(s => s.totalCalls > 100 && s.cacheHits / s.totalCalls < 0.3)
            .sort((a, b) => a.cacheHits / a.totalCalls - b.cacheHits / b.totalCalls)
            .slice(0, 3)
        
        if (lowCacheRules.length > 0) {
            lines.push('  ⚠️  缓存率低的规则:')
            for (const rule of lowCacheRules) {
                const rate = (rule.cacheHits / rule.totalCalls * 100).toFixed(1)
                lines.push(`     - ${rule.ruleName}: ${rate}% (${rule.totalCalls} 次调用)`)
            }
        }
        
        return lines.join('\n')
    }
    
    /**
     * 获取简洁报告（单行）
     */
    getShortReport(): string {
        if (!this.enabled) {
            return '⚠️  Profiling not enabled'
        }
        
        const allStats = Array.from(this.stats.values())
        const totalCalls = allStats.reduce((sum, s) => sum + s.totalCalls, 0)
        const totalTime = allStats.reduce((sum, s) => sum + s.totalTime, 0)
        const ruleCount = allStats.length
        
        return `⏱️  ${totalTime.toFixed(2)}ms | ${ruleCount} rules | ${totalCalls.toLocaleString()} calls`
    }
}












