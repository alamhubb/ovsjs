/**
 * Subhuti Memoizer - Packrat Parsing 缓存管理器
 * 
 * 职责：
 * - 管理 Packrat Parsing 缓存
 * - 统计缓存命中率
 * - 应用和存储缓存结果
 * - 提供性能分析建议
 * 
 * 设计理念：
 * - 可插拔：Parser 通过可选的 memoizer 实例使用
 * - 独立性：不依赖 Parser 内部状态
 * - 零开销：未启用时只有一次属性检查
 * 
 * 使用示例：
 * ```typescript
 * // 默认配置（推荐）
 * const parser = new MyParser(tokens)
 * // → 自动启用缓存，LRU(10000)
 * 
 * // 自定义配置
 * const parser = new MyParser(tokens, undefined, { maxSize: 50000 })
 * 
 * // 禁用缓存
 * parser.cache(false)
 * 
 * // 获取统计信息
 * console.log(parser.getMemoStats())
 * ```
 * 
 * @version 1.0.0
 * @date 2025-11-04
 */

import SubhutiCst from "../struct/SubhutiCst.ts"
import { PackratCache } from "./PackratCache.ts"
import type { PackratCacheConfig } from "./PackratCache.ts"

// ============================================
// 类型定义
// ============================================

/**
 * Packrat Parsing 缓存结果（完整状态）
 * 
 * 关键字段：
 * - success: 解析是否成功
 * - endTokenIndex: 解析结束位置
 * - cst: 成功时的 CST 节点
 * - parseFailed: parseFailed 状态（必须缓存）
 */
export interface SubhutiMemoResult {
    success: boolean                      // 解析是否成功
    endTokenIndex: number                 // 解析结束位置
    cst?: SubhutiCst                      // 成功时的 CST 节点
    parseFailed: boolean                  // parseFailed 状态（必须缓存）
}

/**
 * 缓存统计信息
 */
export interface MemoStats {
    hits: number        // 缓存命中次数
    misses: number      // 缓存未命中次数
    stores: number      // 缓存存储次数
}

/**
 * 缓存统计报告（详细版）
 */
export interface MemoStatsReport {
    // 基础统计
    hits: number
    misses: number
    stores: number
    total: number
    hitRate: string
    
    // 缓存信息
    cacheSize: number
    totalEntries: number
    avgEntriesPerRule: string
    
    // 性能建议
    suggestions: string[]
}

// ============================================
// SubhutiMemoizer 类
// ============================================

export class SubhutiMemoizer {
    /**
     * 底层缓存实例
     */
    private readonly cache: PackratCache
    
    /**
     * 缓存统计
     */
    private stats: MemoStats = {
        hits: 0,
        misses: 0,
        stores: 0
    }
    
    /**
     * 构造 Memoizer
     * 
     * @param config 缓存配置（可选）
     */
    constructor(config?: PackratCacheConfig) {
        this.cache = new PackratCache(config)
    }
    
    // ========================================
    // 核心缓存操作
    // ========================================
    
    /**
     * 查询缓存
     * 
     * @param ruleName 规则名称
     * @param tokenIndex Token 位置
     * @returns 缓存结果，未命中返回 undefined
     */
    get(ruleName: string, tokenIndex: number): SubhutiMemoResult | undefined {
        const result = this.cache.get(ruleName, tokenIndex)
        
        if (result !== undefined) {
            this.stats.hits++
            return result
        }
        
        this.stats.misses++
        return undefined
    }
    
    /**
     * 存储缓存
     * 
     * @param ruleName 规则名称
     * @param tokenIndex Token 位置
     * @param result 缓存结果
     */
    set(ruleName: string, tokenIndex: number, result: SubhutiMemoResult): void {
        this.cache.set(ruleName, tokenIndex, result)
        this.stats.stores++
    }
    
    /**
     * 清空所有缓存
     * 
     * 使用场景：
     * - 解析新文件前
     * - 手动清理内存
     * - 测试重置
     */
    clear(): void {
        this.cache.clear()
        this.stats = { hits: 0, misses: 0, stores: 0 }
    }
    
    // ========================================
    // 应用缓存结果（辅助方法）
    // ========================================
    
    /**
     * 应用缓存结果到 CST 栈
     * 
     * 用途：将缓存的 CST 节点添加到父节点
     * 
     * @param cached 缓存结果
     * @param parentCst 父 CST 节点
     * @returns CST 节点或 undefined
     */
    apply(cached: SubhutiMemoResult, parentCst?: SubhutiCst): SubhutiCst | undefined {
        if (cached.success && cached.cst && parentCst) {
            parentCst.children.push(cached.cst)
            return cached.cst
        }
        
        return undefined
    }
    
    // ========================================
    // 统计和分析
    // ========================================
    
    /**
     * 获取简单统计信息
     */
    getStats(): MemoStats {
        return { ...this.stats }
    }
    
    /**
     * 获取详细统计报告
     * 
     * 包含：
     * - 基础统计：hits、misses、命中率
     * - 缓存信息：规则数、总条目、平均条目
     * - 性能建议：根据数据自动生成
     */
    getStatsReport(): MemoStatsReport {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : '0.0'
        const hitRateNum = parseFloat(hitRate)
        
        const cacheSize = this.cache.size
        const totalEntries = this.cache.getTotalEntries()
        const avgEntriesPerRule = cacheSize > 0 ? (totalEntries / cacheSize).toFixed(1) : '0'
        
        // 性能建议（智能分析）
        const suggestions: string[] = []
        
        if (hitRateNum >= 70) {
            suggestions.push('✅ 缓存命中率优秀（≥ 70%）')
        } else if (hitRateNum >= 50) {
            suggestions.push('✅ 缓存命中率良好（50-70%）')
        } else if (hitRateNum >= 30) {
            suggestions.push('⚠️ 缓存命中率偏低（30-50%），可能语法复杂')
        } else {
            suggestions.push('❌ 缓存命中率低（< 30%），建议检查语法规则')
        }
        
        // 检查缓存使用率（假设 LRU 默认 10000）
        if (totalEntries > 9000) {
            suggestions.push('⚠️ 缓存使用率高（> 90%），建议增加 maxSize')
        } else if (totalEntries > 7000) {
            suggestions.push('⚠️ 缓存使用率较高（70-90%），可考虑增加 maxSize')
        }
        
        if (totalEntries < 1000 && total > 10000) {
            suggestions.push('💡 缓存使用率低，可考虑减小 maxSize 节省内存')
        }
        
        return {
            // 基础统计
            hits: this.stats.hits,
            misses: this.stats.misses,
            stores: this.stats.stores,
            total,
            hitRate: `${hitRate}%`,
            
            // 缓存信息
            cacheSize,
            totalEntries,
            avgEntriesPerRule,
            
            // 性能建议
            suggestions
        }
    }
}

