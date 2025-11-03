/**
 * Packrat 缓存（统一实现）
 * 
 * 设计理念：
 * - 单一实现：通过配置控制行为
 * - 默认最优：LRU(10000) 生产级配置
 * - 零配置：开箱即用
 * 
 * 配置方式：
 * ```typescript
 * // 默认（推荐 99%）
 * new PackratCache()  → LRU(10000)
 * 
 * // 大文件
 * new PackratCache({ maxSize: 50000 })  → LRU(50000)
 * 
 * // 无限缓存（小文件 + 内存充足）
 * new PackratCache({ maxSize: Infinity })  → Unlimited
 * ```
 * 
 * 算法：
 * - maxSize < Infinity：LRU 淘汰策略
 * - maxSize = Infinity：无限缓存
 * 
 * @version 1.0.0
 * @date 2025-11-03
 */

/**
 * 缓存配置
 */
export interface PackratCacheConfig {
    /**
     * 最大缓存条目数
     * 
     * - 数字：启用 LRU，达到上限自动淘汰最旧条目
     * - Infinity：无限缓存，永不淘汰
     * 
     * 推荐值：
     * - 默认：10000（99% 场景）
     * - 大文件：50000
     * - 超大文件：100000
     * - 小文件 + 内存充足：Infinity
     */
    maxSize?: number
}

export class PackratCache {
    /**
     * 缓存结构（两层 Map）
     * 
     * 外层 Map：ruleName → 内层 Map
     * 内层 Map：tokenIndex → result
     * 
     * 为什么用两层？
     * - 按规则分组，逻辑清晰
     * - size 返回规则数（而非条目数）
     * - 便于理解和调试
     */
    private cache = new Map<string, Map<number, any>>()
    
    /**
     * 访问顺序记录（LRU 使用）
     * 
     * 结构：[{ruleName, tokenIndex}, ...]
     * - 最前面 = 最久未使用
     * - 最后面 = 最近使用
     */
    private accessOrder: Array<{ruleName: string, tokenIndex: number}> = []
    
    /**
     * 最大容量
     */
    private readonly maxSize: number
    
    /**
     * 构造缓存
     * 
     * @param config 缓存配置（可选）
     */
    constructor(config: PackratCacheConfig = {}) {
        this.maxSize = config.maxSize ?? 10000  // 默认 10000
    }
    
    /**
     * 获取缓存结果
     */
    get(ruleName: string, tokenIndex: number): any | undefined {
        const ruleCache = this.cache.get(ruleName)
        if (!ruleCache) {
            return undefined
        }
        
        const result = ruleCache.get(tokenIndex)
        if (result === undefined) {
            return undefined
        }
        
        // ⭐ LRU 更新访问顺序（仅当启用 LRU 时）
        if (this.maxSize < Infinity) {
            this.updateAccessOrder(ruleName, tokenIndex)
        }
        
        return result
    }
    
    /**
     * 存储缓存结果
     */
    set(ruleName: string, tokenIndex: number, result: any): void {
        // ⭐ 容量检查（仅当启用 LRU 时）
        if (this.maxSize < Infinity) {
            const currentSize = this.getTotalEntries()
            if (currentSize >= this.maxSize) {
                this.evictOldest()
            }
        }
        
        // 获取或创建规则的缓存 Map
        let ruleCache = this.cache.get(ruleName)
        if (!ruleCache) {
            ruleCache = new Map<number, any>()
            this.cache.set(ruleName, ruleCache)
        }
        
        // 存储结果
        ruleCache.set(tokenIndex, result)
        
        // 记录访问顺序（仅当启用 LRU 时）
        if (this.maxSize < Infinity) {
            this.accessOrder.push({ ruleName, tokenIndex })
        }
    }
    
    /**
     * 清空所有缓存
     */
    clear(): void {
        this.cache.clear()
        this.accessOrder = []
    }
    
    /**
     * 获取缓存的规则数量
     */
    get size(): number {
        return this.cache.size
    }
    
    /**
     * 获取缓存的总条目数
     */
    getTotalEntries(): number {
        let total = 0
        for (const ruleCache of this.cache.values()) {
            total += ruleCache.size
        }
        return total
    }
    
    // ========================================
    // 私有方法（LRU 实现）
    // ========================================
    
    /**
     * 更新访问顺序（LRU）
     * 
     * 策略：移除旧记录，添加到末尾
     */
    private updateAccessOrder(ruleName: string, tokenIndex: number): void {
        // 移除旧的访问记录
        const index = this.accessOrder.findIndex(
            item => item.ruleName === ruleName && item.tokenIndex === tokenIndex
        )
        
        if (index !== -1) {
            this.accessOrder.splice(index, 1)
        }
        
        // 添加到末尾（最近使用）
        this.accessOrder.push({ ruleName, tokenIndex })
    }
    
    /**
     * 淘汰最旧的条目（LRU）
     */
    private evictOldest(): void {
        if (this.accessOrder.length === 0) {
            return
        }
        
        // 获取最旧的条目（第一个）
        const oldest = this.accessOrder.shift()!
        
        // 从缓存中删除
        const ruleCache = this.cache.get(oldest.ruleName)
        if (ruleCache) {
            ruleCache.delete(oldest.tokenIndex)
            
            // 如果规则的缓存为空，删除整个规则
            if (ruleCache.size === 0) {
                this.cache.delete(oldest.ruleName)
            }
        }
    }
}

