/**
 * Subhuti Packrat Cache - 高性能 Packrat Parsing 缓存系统
 * 
 * 包含：
 * - SubhutiPackratCache: 集成 LRU 缓存 + 统计 + 分析
 * 
 * @version 3.0.0 - 架构简化（统一命名为 PackratCache）
 * @date 2025-11-04
 */

import type SubhutiCst from "./struct/SubhutiCst.ts";

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

/**
 * LRU 双向链表节点
 * 
 * 结构：
 * - key: 缓存键（ruleName:tokenIndex）
 * - value: 缓存值（PackratCacheResult）
 * - prev: 前一个节点（更旧）
 * - next: 后一个节点（更新）
 * 
 * 链表顺序：
 * - head（最新访问） ← ... ← tail（最久未访问）
 * - 新节点总是添加到 head
 * - 访问的节点移动到 head
 * - 淘汰时删除 tail
 */
class LRUNode {
    key: string
    value: any
    prev: LRUNode | null = null
    next: LRUNode | null = null
    
    constructor(key: string, value: any) {
        this.key = key
        this.value = value
    }
}

// ============================================
// [1] SubhutiPackratCache - Packrat Parsing缓存管理器（集成LRU）
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
export interface PackratCacheResult {
    success: boolean                      // 解析是否成功
    endTokenIndex: number                 // 解析结束位置
    cst?: SubhutiCst                      // 成功时的 CST 节点
    parseFailed: boolean                  // parseFailed 状态（必须缓存）
}

/**
 * Packrat 缓存统计信息
 */
export interface PackratStats {
    hits: number        // 缓存命中次数
    misses: number      // 缓存未命中次数
    stores: number      // 缓存存储次数
}

/**
 * Packrat 缓存统计报告（详细版）
 */
export interface PackratStatsReport {
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

/**
 * Subhuti Packrat Cache - 集成 LRU 缓存 + 统计的 Packrat Parsing 管理器 ⭐⭐⭐
 * 
 * 职责：
 * - LRU 缓存实现（高性能双向链表）
 * - 统计缓存命中率
 * - 应用和存储缓存结果
 * - 提供性能分析建议
 * 
 * 设计理念：
 * - 单一实现：通过配置控制行为（LRU / Unlimited）
 * - 默认最优：LRU(10000) 生产级配置
 * - 零配置：开箱即用
 * - 高性能：双向链表 + Map，所有操作 O(1)
 * - 集成统计：hits/misses/stores 与缓存操作原子化
 * 
 * 使用示例：
 * ```typescript
 * // 默认配置（推荐 99%）- LRU(10000)
 * const parser = new MyParser(tokens)
 * console.log(parser.getCacheStats())
 * 
 * // 自定义缓存大小（大文件）- LRU(50000)
 * const parser = new MyParser(tokens, undefined, { maxSize: 50000 })
 * 
 * // 无限缓存（小文件 + 内存充足）
 * const parser = new MyParser(tokens, undefined, { maxSize: Infinity })
 * 
 * // 禁用缓存
 * parser.cache(false)
 * ```
 * 
 * 性能：
 * - get: O(1) 常数时间
 * - set: O(1) 常数时间
 * - 统计集成：零额外开销
 */
export class SubhutiPackratCache {
    // ========================================
    // LRU 缓存实现
    // ========================================
    
    /**
     * 缓存主存储（Map: key → LRUNode）⭐⭐ 双向链表优化
     * 
     * 结构：Map<"ruleName:tokenIndex", LRUNode>
     * 
     * 优势：
     * - Map: O(1) 查找
     * - LRUNode: 包含 prev/next 指针，支持 O(1) 移动
     * - 复合键：单层查找（键值优化）
     * 
     * 复合键格式：`${ruleName}:${tokenIndex}`
     * 示例："Expression:42" → 规则Expression在位置42的缓存节点
     */
    private cache = new Map<string, LRUNode>()
    
    /**
     * 双向链表头部（最新访问）
     * 
     * 链表顺序：head → ... → tail
     * - head: 最近访问的节点
     * - tail: 最久未访问的节点（优先淘汰）
     */
    private head: LRUNode | null = null
    
    /**
     * 双向链表尾部（最久未访问）
     */
    private tail: LRUNode | null = null
    
    /**
     * 当前缓存条目数
     */
    private currentSize = 0
    
    /**
     * 最大容量
     */
    private readonly maxSize: number
    
    // ========================================
    // 缓存统计
    // ========================================
    
    /**
     * 缓存统计信息
     */
    private stats: PackratStats = {
        hits: 0,
        misses: 0,
        stores: 0
    }
    
    // ========================================
    // 构造函数
    // ========================================
    
    /**
     * 构造 Packrat Cache
     * 
     * @param config 缓存配置（可选）
     * 
     * 配置方式：
     * ```typescript
     * // 默认（推荐 99%）
     * new SubhutiPackratCache()  → LRU(10000)
     * 
     * // 大文件
     * new SubhutiPackratCache({ maxSize: 50000 })  → LRU(50000)
     * 
     * // 无限缓存（小文件 + 内存充足）
     * new SubhutiPackratCache({ maxSize: Infinity })  → Unlimited
     * ```
     */
    constructor(config?: PackratCacheConfig) {
        this.maxSize = config?.maxSize ?? 10000  // 默认 10000
    }
    
    // ========================================
    // 核心缓存操作（集成 LRU + 统计）⭐⭐⭐
    // ========================================
    
    /**
     * 查询缓存 - O(1) ⭐⭐⭐
     * 
     * 集成功能：
     * - LRU 查找（Map + 双向链表）
     * - 统计记录（hits / misses）
     * - 自动更新访问顺序
     * 
     * @param ruleName 规则名称
     * @param tokenIndex Token 位置
     * @returns 缓存结果，未命中返回 undefined
     */
    get(ruleName: string, tokenIndex: number): PackratCacheResult | undefined {
        const key = `${ruleName}:${tokenIndex}`
        const node = this.cache.get(key)
        
        if (!node) {
            this.stats.misses++  // 👈 统计：未命中
            return undefined
        }
        
        // ✅ 命中
        this.stats.hits++  // 👈 统计：命中
        
        // ⭐ LRU：移到链表头部（最近访问）- O(1)
        if (this.maxSize < Infinity) {
            this.moveToHead(node)
        }
        
        return node.value
    }
    
    /**
     * 存储缓存 - O(1) ⭐⭐⭐
     * 
     * 集成功能：
     * - LRU 存储（Map + 双向链表）
     * - 统计记录（stores）
     * - 自动淘汰旧条目
     * 
     * @param ruleName 规则名称
     * @param tokenIndex Token 位置
     * @param result 缓存结果
     */
    set(ruleName: string, tokenIndex: number, result: PackratCacheResult): void {
        const key = `${ruleName}:${tokenIndex}`
        const existingNode = this.cache.get(key)
        
        this.stats.stores++  // 👈 统计：存储次数
        
        if (existingNode) {
            // 已存在：更新值并移到头部
            existingNode.value = result
            if (this.maxSize < Infinity) {
                this.moveToHead(existingNode)
            }
            return
        }
        
        // 新节点：创建并添加
        const newNode = new LRUNode(key, result)
        this.cache.set(key, newNode)
        
        if (this.maxSize < Infinity) {
            this.addToHead(newNode)
            this.currentSize++
            
            // 超过容量：删除尾节点 - O(1)
            if (this.currentSize > this.maxSize) {
                this.removeTail()
            }
        } else {
            // 无限缓存：不需要链表
            this.currentSize++
        }
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
        this.head = null
        this.tail = null
        this.currentSize = 0
        this.stats = { hits: 0, misses: 0, stores: 0 }
    }
    
    /**
     * 获取缓存的总条目数
     */
    get size(): number {
        return this.currentSize
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
    apply(cached: PackratCacheResult, parentCst?: SubhutiCst): SubhutiCst | undefined {
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
    getStats(): PackratStats {
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
    getStatsReport(): PackratStatsReport {
        const total = this.stats.hits + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(1) : '0.0'
        const hitRateNum = parseFloat(hitRate)
        
        const cacheSize = this.size
        const totalEntries = this.size
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
    
    // ========================================
    // 双向链表操作（全部 O(1)）⭐⭐⭐
    // ========================================
    
    /**
     * 添加节点到链表头部 - O(1)
     * 
     * 步骤：
     * 1. 新节点.next = 原head
     * 2. 如果有原head，原head.prev = 新节点
     * 3. head = 新节点
     * 4. 如果没有tail，tail = 新节点
     * 
     * 时间复杂度：O(1) - 只修改指针
     */
    private addToHead(node: LRUNode): void {
        node.prev = null
        node.next = this.head
        
        if (this.head) {
            this.head.prev = node
        }
        
        this.head = node
        
        if (!this.tail) {
            this.tail = node
        }
    }
    
    /**
     * 从链表中移除节点 - O(1)
     * 
     * 步骤：
     * 1. node.prev.next = node.next（跳过当前节点）
     * 2. node.next.prev = node.prev（跳过当前节点）
     * 3. 处理head/tail边界情况
     * 
     * 时间复杂度：O(1) - 只修改指针，不需要遍历
     */
    private removeNode(node: LRUNode): void {
        if (node.prev) {
            node.prev.next = node.next
        } else {
            // 是head节点
            this.head = node.next
        }
        
        if (node.next) {
            node.next.prev = node.prev
        } else {
            // 是tail节点
            this.tail = node.prev
        }
    }
    
    /**
     * 移动节点到链表头部 - O(1)
     * 
     * 步骤：
     * 1. 如果已经是head，直接返回
     * 2. 从当前位置移除：O(1)
     * 3. 添加到头部：O(1)
     * 
     * 时间复杂度：O(1)
     * 
     * 对比旧实现：
     * - 旧：indexOf O(n) + splice O(n) + push O(1) = O(n)
     * - 新：removeNode O(1) + addToHead O(1) = O(1)
     * - 提升：5000倍（10000条缓存时）⭐⭐⭐
     */
    private moveToHead(node: LRUNode): void {
        if (node === this.head) {
            return  // 已经在头部，无需移动
        }
        
        this.removeNode(node)
        this.addToHead(node)
    }
    
    /**
     * 移除并淘汰尾节点（最久未访问）- O(1)
     * 
     * 步骤：
     * 1. 获取tail：O(1)
     * 2. 从Map删除：O(1)
     * 3. 从链表删除：O(1)
     * 4. 更新currentSize：O(1)
     * 
     * 时间复杂度：O(1)
     * 
     * 对比旧实现：
     * - 旧：shift O(n)（移动所有元素）
     * - 新：直接删除tail O(1)
     */
    private removeTail(): void {
        if (!this.tail) {
            return
        }
        
        const key = this.tail.key
        this.cache.delete(key)
        
        this.removeNode(this.tail)
        this.currentSize--
    }
}
