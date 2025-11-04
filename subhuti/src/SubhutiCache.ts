/**
 * Subhuti Cache - 缓存系统
 * 
 * 包含：
 * - PackratCache: 高性能LRU缓存
 * - SubhutiMemoizer: Packrat Parsing缓存管理器
 * - CacheAnalyzer: 缓存性能分析器
 * 
 * @version 2.0.0 - 文件合并重构
 * @date 2025-11-04
 */

import SubhutiCst from "./struct/SubhutiTypes.ts"

// ============================================
// [1] PackratCache - 高性能LRU缓存
// ============================================

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
 * - value: 缓存值（SubhutiMemoResult）
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

/**
 * Packrat 缓存（高性能双向链表实现）⭐⭐⭐
 * 
 * 设计理念：
 * - 单一实现：通过配置控制行为
 * - 默认最优：LRU(10000) 生产级配置
 * - 零配置：开箱即用
 * - 高性能：双向链表 + Map，所有操作 O(1)
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
 * 算法：标准 LRU（Map + 双向链表）
 * - maxSize < Infinity：LRU 淘汰策略
 * - maxSize = Infinity：无限缓存
 * 
 * 性能：
 * - get: O(1) 常数时间
 * - set: O(1) 常数时间
 * - 旧实现：O(n) → 10000条时平均5000次操作
 * - 新实现：O(1) → 提升5000倍 ⭐
 */
export class PackratCache {
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
    
    /**
     * 构造缓存
     * 
     * @param config 缓存配置（可选）
     */
    constructor(config: PackratCacheConfig = {}) {
        this.maxSize = config.maxSize ?? 10000  // 默认 10000
    }
    
    /**
     * 获取缓存结果 - O(1) ⭐⭐⭐
     * 
     * 步骤：
     * 1. Map查找节点：O(1)
     * 2. 移动到链表头部：O(1)（双向链表优势）
     * 3. 返回值：O(1)
     * 
     * 总复杂度：O(1) 常数时间
     */
    get(ruleName: string, tokenIndex: number): any | undefined {
        const key = `${ruleName}:${tokenIndex}`
        const node = this.cache.get(key)
        
        if (!node) {
            return undefined
        }
        
        // ⭐ LRU：移到链表头部（最近访问）- O(1)
        if (this.maxSize < Infinity) {
            this.moveToHead(node)
        }
        
        return node.value
    }
    
    /**
     * 存储缓存结果 - O(1) ⭐⭐⭐
     * 
     * 步骤：
     * 1. 检查是否已存在：O(1)
     * 2. 如已存在：更新值并移到头部 O(1)
     * 3. 如不存在：
     *    - 创建新节点：O(1)
     *    - 添加到Map：O(1)
     *    - 添加到链表头部：O(1)
     *    - 检查容量并淘汰：O(1)
     * 
     * 总复杂度：O(1) 常数时间
     */
    set(ruleName: string, tokenIndex: number, result: any): void {
        const key = `${ruleName}:${tokenIndex}`
        const existingNode = this.cache.get(key)
        
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
     */
    clear(): void {
        this.cache.clear()
        this.head = null
        this.tail = null
        this.currentSize = 0
    }
    
    /**
     * 获取缓存的总条目数
     */
    get size(): number {
        return this.currentSize
    }
    
    /**
     * 获取缓存的总条目数（与 size 相同）
     */
    getTotalEntries(): number {
        return this.currentSize
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

// ============================================
// [2] SubhutiMemoizer - Packrat Parsing缓存管理器
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
 */
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

// ============================================
// [3] CacheAnalyzer - 缓存性能分析器
// ============================================

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
 * 
 * 职责：
 * - 分析 Packrat 缓存统计数据
 * - 生成性能建议
 * - 识别缓存问题
 * 
 * 设计理念：
 * - 外置于核心 Parser
 * - 基于统计数据分析
 * - 智能建议生成
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

