/**
 * Packrat 缓存分析器
 * 
 * 职责：
 * - 分析缓存统计数据
 * - 生成性能建议
 * - 识别缓存问题
 * 
 * 设计理念：
 * - 外置于核心 Parser
 * - 基于统计数据分析
 * - 智能建议生成
 */

/**
 * 缓存统计数据（来自 Parser）
 */
export interface CacheStats {
    hits: number
    misses: number
    stores: number
    total: number
    hitRate: string
    cacheSize: number
    totalEntries: number
    avgEntriesPerRule: string
}

/**
 * 缓存分析结果
 */
export interface CacheAnalysisResult {
    performance: 'excellent' | 'good' | 'fair' | 'poor'
    suggestions: string[]
    warnings: string[]
    recommendations: string[]
}

/**
 * 缓存分析器
 */
export class CacheAnalyzer {
    /**
     * 分析缓存性能
     */
    analyze(stats: CacheStats): CacheAnalysisResult {
        const suggestions: string[] = []
        const warnings: string[] = []
        const recommendations: string[] = []
        
        // 解析命中率
        const hitRateNum = parseFloat(stats.hitRate.replace('%', ''))
        
        // ========================================
        // 分析1：命中率评估
        // ========================================
        let performance: 'excellent' | 'good' | 'fair' | 'poor'
        
        if (hitRateNum >= 70) {
            performance = 'excellent'
            suggestions.push('✅ 缓存命中率优秀（≥ 70%）')
            suggestions.push('   → Packrat Parsing 工作良好')
        } else if (hitRateNum >= 50) {
            performance = 'good'
            suggestions.push('✅ 缓存命中率良好（50-70%）')
            suggestions.push('   → 性能表现正常')
        } else if (hitRateNum >= 30) {
            performance = 'fair'
            warnings.push('⚠️ 缓存命中率偏低（30-50%）')
            warnings.push('   → 可能语法较复杂或回溯较多')
            recommendations.push('考虑优化语法规则，减少回溯')
        } else {
            performance = 'poor'
            warnings.push('❌ 缓存命中率低（< 30%）')
            warnings.push('   → 建议检查语法规则设计')
            recommendations.push('检查是否有大量失败的规则尝试')
            recommendations.push('考虑调整 Or 规则的分支顺序')
        }
        
        // ========================================
        // 分析2：缓存使用率
        // ========================================
        const maxSize = 10000  // 默认 LRU 大小
        const usageRate = (stats.totalEntries / maxSize) * 100
        
        if (stats.totalEntries > maxSize * 0.9) {
            warnings.push('⚠️ 缓存使用率高（> 90%）')
            warnings.push('   → 缓存可能频繁淘汰，影响性能')
            recommendations.push(`建议增加缓存大小到 ${Math.ceil(maxSize * 1.5)}`)
            recommendations.push('示例：new Parser(tokens, undefined, { maxSize: 15000 })')
        } else if (stats.totalEntries > maxSize * 0.7) {
            suggestions.push('⚠️ 缓存使用率较高（70-90%）')
            suggestions.push('   → 可考虑增加缓存大小')
            recommendations.push(`可选：增加到 ${Math.ceil(maxSize * 1.2)}`)
        }
        
        // ========================================
        // 分析3：缓存效率
        // ========================================
        if (stats.totalEntries < 1000 && stats.total > 10000) {
            suggestions.push('💡 缓存使用率低')
            suggestions.push('   → 可考虑减小缓存大小节省内存')
            recommendations.push('示例：new Parser(tokens, undefined, { maxSize: 5000 })')
        }
        
        // ========================================
        // 分析4：规则缓存密度
        // ========================================
        const avgEntries = parseFloat(stats.avgEntriesPerRule)
        
        if (avgEntries > 100) {
            warnings.push('⚠️ 平均每规则缓存条目过多（> 100）')
            warnings.push('   → 可能存在高度重复的解析模式')
            recommendations.push('检查是否有递归规则导致大量缓存条目')
        } else if (avgEntries < 2 && stats.total > 1000) {
            suggestions.push('💡 平均每规则缓存条目较少（< 2）')
            suggestions.push('   → 规则多样性高，缓存效果可能有限')
        }
        
        // ========================================
        // 分析5：命中/未命中比例
        // ========================================
        const missRate = (stats.misses / stats.total) * 100
        
        if (missRate > 70) {
            warnings.push('⚠️ 缓存未命中率高（> 70%）')
            warnings.push('   → 大部分规则都是首次执行')
            recommendations.push('这可能是正常的（首次解析）')
            recommendations.push('如果是重复解析，检查是否正确使用缓存')
        }
        
        return {
            performance,
            suggestions,
            warnings,
            recommendations
        }
    }
    
    /**
     * 生成完整的分析报告（文本格式）
     */
    generateReport(stats: CacheStats): string {
        const analysis = this.analyze(stats)
        const lines: string[] = []
        
        lines.push('📊 Packrat 缓存分析报告')
        lines.push('═'.repeat(80))
        lines.push('')
        
        // 基础统计
        lines.push('📈 基础统计:')
        lines.push(`  命中次数:     ${stats.hits.toLocaleString()}`)
        lines.push(`  未命中次数:   ${stats.misses.toLocaleString()}`)
        lines.push(`  总查询次数:   ${stats.total.toLocaleString()}`)
        lines.push(`  命中率:       ${stats.hitRate}`)
        lines.push(`  存储次数:     ${stats.stores.toLocaleString()}`)
        lines.push('')
        
        // 缓存信息
        lines.push('💾 缓存信息:')
        lines.push(`  规则数量:     ${stats.cacheSize}`)
        lines.push(`  总条目数:     ${stats.totalEntries}`)
        lines.push(`  平均条目/规则: ${stats.avgEntriesPerRule}`)
        lines.push('')
        
        // 性能评估
        const performanceEmoji = {
            excellent: '🏆',
            good: '✅',
            fair: '⚠️',
            poor: '❌'
        }[analysis.performance]
        
        lines.push(`${performanceEmoji} 性能评估: ${analysis.performance.toUpperCase()}`)
        lines.push('')
        
        // 建议
        if (analysis.suggestions.length > 0) {
            lines.push('💡 建议:')
            analysis.suggestions.forEach(suggestion => {
                lines.push(`  ${suggestion}`)
            })
            lines.push('')
        }
        
        // 警告
        if (analysis.warnings.length > 0) {
            lines.push('⚠️  警告:')
            analysis.warnings.forEach(warning => {
                lines.push(`  ${warning}`)
            })
            lines.push('')
        }
        
        // 推荐操作
        if (analysis.recommendations.length > 0) {
            lines.push('🔧 推荐操作:')
            analysis.recommendations.forEach((rec, i) => {
                lines.push(`  ${i + 1}. ${rec}`)
            })
        }
        
        return lines.join('\n')
    }
    
    /**
     * 生成简洁报告（单行）
     */
    generateShortReport(stats: CacheStats): string {
        const analysis = this.analyze(stats)
        const emoji = {
            excellent: '🏆',
            good: '✅',
            fair: '⚠️',
            poor: '❌'
        }[analysis.performance]
        
        return `${emoji} Cache: ${stats.hitRate} hit rate | ${stats.totalEntries} entries | ${analysis.performance}`
    }
    
    /**
     * 检查是否需要调整缓存大小
     */
    shouldAdjustCacheSize(stats: CacheStats, currentMaxSize: number = 10000): {
        adjust: boolean
        recommendedSize?: number
        reason?: string
    } {
        const usageRate = (stats.totalEntries / currentMaxSize) * 100
        
        // 使用率 > 90%：建议增大
        if (usageRate > 90) {
            return {
                adjust: true,
                recommendedSize: Math.ceil(currentMaxSize * 1.5),
                reason: '缓存使用率过高，建议增大以避免频繁淘汰'
            }
        }
        
        // 使用率 < 10% 且总查询 > 10000：建议减小
        if (usageRate < 10 && stats.total > 10000) {
            return {
                adjust: true,
                recommendedSize: Math.max(1000, Math.ceil(stats.totalEntries * 1.5)),
                reason: '缓存使用率过低，可以减小以节省内存'
            }
        }
        
        return { adjust: false }
    }
}


