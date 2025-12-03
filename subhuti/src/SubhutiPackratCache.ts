/**
 * Subhuti SubhutiPackratCache Cache - 高性能 SubhutiPackratCache Parsing 缓存系统
 *
 * 包含：
 * - SubhutiPackratCache: 集成 LRU 缓存 + 统计 + 分析
 *
 * @version 4.0.0 - 使用 lru-cache 开源库替代手写实现
 * @date 2025-11-04
 */

import type SubhutiCst from "./struct/SubhutiCst.ts";
import type { ParseRecordNode } from "./SubhutiParser.ts";
import { LRUCache } from "lru-cache";

// ============================================
// [1] SubhutiPackratCache - SubhutiPackratCache Parsing缓存管理器（集成LRU）
// ============================================

/**
 * SubhutiPackratCache Parsing 缓存结果（完整状态）
 *
 * 关键字段：
 * - endTokenIndex: 解析结束时的 token 索引
 * - cst: CST 节点（成功时有值）
 * - parseSuccess: 解析是否成功
 * - recordNode: 解析记录节点（容错模式下使用）
 * - parsedTokens: 消费的 token 列表
 */
export interface SubhutiPackratCacheResult {
    endTokenIndex: number                 // 解析结束时的 token 索引
    cst: SubhutiCst                       // CST 节点
    parseSuccess: boolean                 // 解析是否成功
    recordNode?: ParseRecordNode | null   // 解析记录节点（容错模式）
    parsedTokens?: any[]                  // 消费的 token 列表
}

/**
 * SubhutiPackratCache 基础统计字段
 * 
 * 用于 SubhutiPackratCacheStatsReport 接口的字段定义
 */
interface SubhutiPackratCacheStats {
    hits: number       // 缓存命中次数
    misses: number     // 缓存未命中次数
    stores: number     // 缓存存储次数
}

/**
 * SubhutiPackratCache 缓存统计报告（唯一对外接口）⭐
 * 
 * 通过 getStatsReport() 获取，包含完整的缓存分析数据：
 * 
 * 基础统计（继承自 SubhutiPackratCacheStats）：
 * - hits: 缓存命中次数
 * - misses: 缓存未命中次数
 * - stores: 缓存存储次数
 * 
 * 计算字段：
 * - total: 总查询次数（hits + misses）
 * - hitRate: 命中率（如："68.5%"）
 * 
 * 缓存信息：
 * - maxCacheSize: 最大容量
 * - currentSize: 当前大小
 * - usageRate: 使用率（如："45.2%" 或 "unlimited"）
 * 
 * 性能建议：
 * - suggestions: 根据统计数据自动生成的优化建议
 */
export interface SubhutiPackratCacheStatsReport extends SubhutiPackratCacheStats {
    // 计算字段
    total: number
    hitRate: string

    // 缓存信息
    maxCacheSize: number        // 最大容量
    currentSize: number         // 当前大小
    usageRate: string           // 使用率（如："45.2%" 或 "unlimited"）

    // 性能建议
    suggestions: string[]
}

/**
 * Subhuti SubhutiPackratCache Cache - 集成 LRU 缓存 + 统计的 SubhutiPackratCache Parsing 管理器 ⭐⭐⭐
 *
 * 职责：
 * - LRU 缓存实现（使用成熟的 lru-cache 库）
 * - 统计缓存命中率
 * - 应用和存储缓存结果
 * - 提供性能分析建议
 *
 * 设计理念：
 * - 使用开源库：基于 lru-cache（10k+ stars，每周 4000万+ 下载）
 * - 默认最优：LRU(10000) 生产级配置
 * - 零配置：开箱即用
 * - 高性能：lru-cache 高度优化，所有操作 O(1)
 * - 集成统计：hits/misses/stores 与缓存操作原子化
 *
 * 使用示例：
 * ```typescript
 * // 默认配置（推荐 99%）- LRU(10000)
 * const cache = new SubhutiPackratCache()
 *
 * // 自定义缓存大小（大文件）- LRU(50000)
 * const cache = new SubhutiPackratCache(50000)
 *
 * // 无限缓存（小文件 + 内存充足）
 * const cache = new SubhutiPackratCache(0)
 * ```
 *
 * 性能：
 * - get: O(1) 常数时间
 * - set: O(1) 常数时间
 * - 统计集成：零额外开销
 */
export class SubhutiPackratCache {
    // ========================================
    // LRU 缓存实现（使用 lru-cache 开源库）
    // ========================================

    /**
     * 缓存主存储（使用 lru-cache 库）
     *
     * 优势：
     * - 成熟稳定：10+ 年维护，每周 4000万+ 下载
     * - 高度优化：O(1) 所有操作
     * - 功能丰富：支持 TTL、dispose 回调等
     * - TypeScript 原生支持
     *
     * 复合键格式：`${ruleName}:${tokenIndex}`
     * 示例："Expression:5" → 规则Expression在第5个token位置的缓存结果
     */
    private cache: LRUCache<string, SubhutiPackratCacheResult>

    /**
     * 最大容量（0 表示无限缓存）
     */
    private readonly maxSize: number

    // ========================================
    // 缓存统计
    // ========================================

    /**
     * 缓存统计信息（内部存储）
     * 
     * 简单对象存储三个计数器，无需额外封装
     */
    private stats = {
        hits: 0,
        misses: 0,
        stores: 0
    }

    // ========================================
    // 构造函数
    // ========================================

    /**
     * 构造 SubhutiPackratCache Cache
     *
     * 使用示例：
     * ```typescript
     * // 默认配置（推荐 99%）
     * new SubhutiPackratCache()          → LRU(10000)
     *
     * // 大文件
     * new SubhutiPackratCache(50000)     → LRU(50000)
     *
     * // 超大文件
     * new SubhutiPackratCache(100000)    → LRU(100000)
     *
     * // 无限缓存（小文件 + 内存充足）
     * new SubhutiPackratCache(0)         → Unlimited
     * ```
     *
     * @param maxSize 最大缓存条目数
     *                - 0：无限缓存，永不淘汰
     *                - >0：启用 LRU，达到上限自动淘汰最旧条目
     *                - 默认：10000（适用 99% 场景）
     */
    constructor(maxSize = 10000) {
        this.maxSize = maxSize
        
        // 初始化 lru-cache
        if (maxSize === 0) {
            // 无限缓存：设置为无穷大
            this.cache = new LRUCache<string, SubhutiPackratCacheResult>({
                max: Infinity
            })
        } else {
            // LRU 模式：设置最大容量
            this.cache = new LRUCache<string, SubhutiPackratCacheResult>({
                max: maxSize
            })
        }
    }

    // ========================================
    // 核心缓存操作（集成 LRU + 统计）⭐⭐⭐
    // ========================================

    /**
     * 查询缓存 - O(1) ⭐⭐⭐
     *
     * 集成功能：
     * - LRU 查找（由 lru-cache 库自动处理）
     * - 统计记录（hits / misses）
     * - 自动更新访问顺序（由 lru-cache 库自动处理）
     *
     * @param ruleName 规则名称
     * @param tokenIndex token 索引
     * @returns 缓存结果，未命中返回 undefined
     */
    get(ruleName: string, tokenIndex: number): SubhutiPackratCacheResult | undefined {
        const key = `${ruleName}:${tokenIndex}`
        const result = this.cache.get(key)

        if (result === undefined) {
            this.stats.misses++  // 👈 统计：未命中
            return undefined
        }

        // ✅ 命中
        this.stats.hits++  // 👈 统计：命中
        return result
    }

    /**
     * 存储缓存 - O(1) ⭐⭐⭐
     *
     * 集成功能：
     * - LRU 存储（由 lru-cache 库自动处理）
     * - 统计记录（stores）
     * - 自动淘汰旧条目（由 lru-cache 库自动处理）
     *
     * @param ruleName 规则名称
     * @param tokenIndex token 索引
     * @param result 缓存结果
     */
    set(ruleName: string, tokenIndex: number, result: SubhutiPackratCacheResult): void {
        const key = `${ruleName}:${tokenIndex}`
        this.stats.stores++

        // lru-cache 自动处理 LRU 逻辑和容量限制
        this.cache.set(key, result)
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

        // 重置统计
        this.stats.hits = 0
        this.stats.misses = 0
        this.stats.stores = 0
    }

    /**
     * 获取缓存的总条目数
     */
    get size(): number {
        return this.cache.size
    }

    // ========================================
    // 统计和分析
    // ========================================

    /**
     * 获取缓存统计报告（唯一对外API）⭐
     *
     * 这是获取统计信息的唯一方法，包含完整的分析数据：
     * - 基础统计：hits、misses、stores、total、命中率
     * - 缓存信息：最大容量、当前大小、使用率
     * - 性能建议：根据数据自动生成
     *
     * 使用示例：
     * ```typescript
     * const report = cache.getStatsReport()
     * console.log(`命中率: ${report.hitRate}`)
     * console.log(`建议: ${report.suggestions.join(', ')}`)
     * ```
     */
    getStatsReport(): SubhutiPackratCacheStatsReport {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : '0.0'
        const hitRateNum = parseFloat(hitRate)

        // 计算使用率
        const usageRate = this.maxSize > 0
            ? ((this.size / this.maxSize) * 100).toFixed(1) + '%'
            : 'unlimited'

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

        // 检查缓存使用率（动态阈值，仅 LRU 模式）
        if (this.maxSize > 0) {
            const usageRatio = this.size / this.maxSize

            if (usageRatio > 0.9) {
                suggestions.push('⚠️ 缓存使用率高（> 90%），建议增加 maxSize')
            } else if (usageRatio > 0.7) {
                suggestions.push('⚠️ 缓存使用率较高（70-90%），可考虑增加 maxSize')
            }

            // 缓存使用率低 且 总请求数多（说明缓存分配过大）
            if (usageRatio < 0.1 && total > 10000) {
                suggestions.push('💡 缓存使用率低（< 10%），可考虑减小 maxSize 节省内存')
            }
        }

        return {
            // 基础统计
            hits: this.stats.hits,
            misses: this.stats.misses,
            stores: this.stats.stores,
            total,
            hitRate: `${hitRate}%`,

            // 缓存信息
            maxCacheSize: this.maxSize,
            currentSize: this.size,
            usageRate,

            // 性能建议
            suggestions
        }
    }

}
