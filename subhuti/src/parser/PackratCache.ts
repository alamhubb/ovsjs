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
 * 
 * @version 2.0.0 - 双向链表优化
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

