/**
 * Subhuti Grammar Validation - 语法分析器
 *
 * 功能：计算规则的所有可能路径（按层级展开）
 *
 * 实现方案：方案B - 按最大层级展开，分层存储
 *
 * 核心原理：
 * 1. **分层展开**：不再完全展开到token，而是按层级逐步展开
 *    - Level 0: 直接子节点（可能是token或规则引用）
 *    - Level 1: 展开一层规则引用
 *    - Level N: 展开N层规则引用
 *
 * 2. **缓存策略**：只缓存规则的直接子节点，不递归展开
 *    - cache.set("A", [直接子节点])
 *    - 使用时按需递归查找和展开
 *
 * 3. **分层存储**：每个规则存储多层展开结果
 *    - expansion[0]: 第1层的所有分支
 *    - expansion[1]: 第2层的所有分支
 *    - expansion[N]: 第N层的所有分支
 *
 * 4. **性能优化**：
 *    - 只展开到配置的最大层级（默认3层）
 *    - 每层独立存储，避免重复计算
 *    - 路径数量限制：默认10000条（防止路径爆炸）
 *
 * ⚠️⚠️⚠️ 关键：空分支 [] 的处理 ⚠️⚠️⚠️
 *
 * 空分支来源：
 * - option(X) 和 many(X) 会产生空分支 []，表示可以跳过（0次）
 * - 空分支在展开结果中表示为 []（空数组）
 *
 * 空分支的重要性：
 * - 空分支必须保留，否则 option/many 的语义就错了！
 * - 例如：option(a) 的 First 集合 = {ε, a}
 * - 如果过滤掉空分支，就变成 First 集合 = {a}，语义错误！
 *
 * 空分支在各个处理环节的行为：
 * 1. deduplicate：
 *    - [] join(',') = ""（空字符串）
 *    - 空字符串是合法的 Set key，不会被过滤
 *    - 例如：[[], [a], []] → [[], [a]]（正常去重）
 *
 * 2. cartesianProduct：
 *    - [...seq, ...[]] = [...seq]（空分支拼接不影响结果）
 *    - [...[], ...branch] = [...branch]（空序列拼接）
 *    - 例如：[[a]] × [[], [b]] → [[a], [a,b]]（正常笛卡尔积）
 *
 * 3. truncateAndDeduplicate：
 *    - [] slice(0, firstK) = []（空分支截取还是空分支）
 *    - 例如：[[], [a,b]], firstK=1 → [[], [a]]（正常截取）
 *
 * 4. expandSequenceNode：
 *    - 空分支参与笛卡尔积和截取，不会被过滤
 *
 * 5. expandOr：
 *    - 空分支参与合并，不会被过滤
 *
 * 结论：
 * - 整个系统中没有任何地方会过滤空分支 []
 * - 空分支在所有处理环节都是一等公民
 * - 空分支的语义被完整保留
 *
 * 用途：为SubhutiConflictDetector提供路径数据，用于检测Or分支冲突
 *
 * @version 2.0.0 - 分层展开版本
 */

import type {
    RuleNode,
    Path,
    SequenceNode,
    ValidationError,
    SubruleNode,
    ConsumeNode,
    OrNode
} from "./SubhutiValidationError"
import {SubhutiValidationLogger} from './SubhutiValidationLogger'
import {list} from "@lerna-lite/publish";

/**
 * 左递归错误类型
 */
export type LeftRecursionError = ValidationError

/**
 * 性能分析器
 */
class PerformanceAnalyzer {
    private stats = new Map<string, {
        count: number
        totalTime: number
        maxTime: number
        minTime: number
        inputSizes: number[]
        outputSizes: number[]
    }>()

    // 缓存统计
    public cacheStats = {
        subRuleHandlerTotal: 0,  // subRuleHandler 总调用次数
        recursiveReturn: 0,  // 递归检测返回次数
        levelLimitReturn: 0,  // 层级限制返回次数
        dfsFirst1: {hit: 0, miss: 0, total: 0},
        dfsFirstK: {hit: 0, miss: 0, total: 0},
        bfsLevel: {hit: 0, miss: 0, total: 0},  // handleDFS 中的特殊场景（firstK=∞, maxLevel=1）
        getDirectChildren: {hit: 0, miss: 0, total: 0},  // getDirectChildren 第一层缓存（懒加载）
        expandOneLevel: {hit: 0, miss: 0, total: 0},  // 展开1层缓存（不截取）- 仅在 BFS 预填充时使用
        expandOneLevelTruncated: {hit: 0, miss: 0, total: 0},  // 展开1层+截取缓存
        actualCompute: 0,  // 实际计算次数（getDirectChildren）
        bfsOptimization: {
            totalCalls: 0,           // BFS 总调用次数
            skippedLevels: 0,        // 跳过的层级数（增量优化效果）
            fromLevel1: 0,           // 从 level 1 开始的次数
            fromCachedLevel: 0       // 从缓存层级开始的次数
        }
    }

    // 记录方法调用
    record(methodName: string, duration: number, inputSize?: number, outputSize?: number) {
        if (!this.stats.has(methodName)) {
            this.stats.set(methodName, {
                count: 0,
                totalTime: 0,
                maxTime: 0,
                minTime: Infinity,
                inputSizes: [],
                outputSizes: []
            })
        }

        const stat = this.stats.get(methodName)!
        stat.count++
        stat.totalTime += duration
        stat.maxTime = Math.max(stat.maxTime, duration)
        stat.minTime = Math.min(stat.minTime, duration)

        if (inputSize !== undefined) {
            stat.inputSizes.push(inputSize)
        }
        if (outputSize !== undefined) {
            stat.outputSizes.push(outputSize)
        }
    }

    // 记录缓存命中/未命中
    recordCacheHit(cacheType: 'dfsFirst1' | 'dfsFirstK' | 'bfsLevel' | 'getDirectChildren' | 'expandOneLevel' | 'expandOneLevelTruncated') {
        this.cacheStats[cacheType].hit++
        this.cacheStats[cacheType].total++
    }

    recordCacheMiss(cacheType: 'dfsFirst1' | 'dfsFirstK' | 'bfsLevel' | 'getDirectChildren' | 'expandOneLevel' | 'expandOneLevelTruncated') {
        this.cacheStats[cacheType].miss++
        this.cacheStats[cacheType].total++
    }

    // 记录实际计算
    recordActualCompute() {
        this.cacheStats.actualCompute++
    }

    // 输出统计报告
    report() {
        console.log('\n📊 ===== 性能分析报告 =====\n')

        // 1. subRuleHandler 总体统计
        console.log('🎯 subRuleHandler 调用统计:')
        console.log(`   总调用次数: ${this.cacheStats.subRuleHandlerTotal}`)
        console.log(`   递归检测返回: ${this.cacheStats.recursiveReturn}`)
        console.log(`   层级限制返回: ${this.cacheStats.levelLimitReturn}`)
        console.log(`   正常处理: ${this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn}`)
        console.log('')

        // 2. 缓存统计
        console.log('💾 缓存命中率统计:')
        console.log(`   DFS_First1 (深度优先 First(1)):`)
        console.log(`     命中: ${this.cacheStats.dfsFirst1.hit}`)
        console.log(`     未命中: ${this.cacheStats.dfsFirst1.miss}`)
        console.log(`     总次数: ${this.cacheStats.dfsFirst1.total}`)
        console.log(`     命中率: ${this.cacheStats.dfsFirst1.total > 0 ? ((this.cacheStats.dfsFirst1.hit / this.cacheStats.dfsFirst1.total) * 100).toFixed(1) : 0}%`)

        console.log(`   DFS_FirstK (深度优先 First(K)):`)
        console.log(`     命中: ${this.cacheStats.dfsFirstK.hit}`)
        console.log(`     未命中: ${this.cacheStats.dfsFirstK.miss}`)
        console.log(`     总次数: ${this.cacheStats.dfsFirstK.total}`)
        console.log(`     命中率: ${this.cacheStats.dfsFirstK.total > 0 ? ((this.cacheStats.dfsFirstK.hit / this.cacheStats.dfsFirstK.total) * 100).toFixed(1) : 0}%`)

        console.log(`   GetDirectChildren (懒加载缓存):`)
        console.log(`     命中: ${this.cacheStats.getDirectChildren.hit}`)
        console.log(`     未命中: ${this.cacheStats.getDirectChildren.miss}`)
        console.log(`     总次数: ${this.cacheStats.getDirectChildren.total}`)
        console.log(`     命中率: ${this.cacheStats.getDirectChildren.total > 0 ? ((this.cacheStats.getDirectChildren.hit / this.cacheStats.getDirectChildren.total) * 100).toFixed(1) : 0}%`)

        // BFS 增量优化效果
        if (this.cacheStats.bfsOptimization.totalCalls > 0) {
            console.log(`\n   🚀 BFS 增量优化效果:`)
            console.log(`     总调用次数: ${this.cacheStats.bfsOptimization.totalCalls}`)
            console.log(`     从 level 1 开始: ${this.cacheStats.bfsOptimization.fromLevel1} (${((this.cacheStats.bfsOptimization.fromLevel1 / this.cacheStats.bfsOptimization.totalCalls) * 100).toFixed(1)}%)`)
            console.log(`     从缓存层级开始: ${this.cacheStats.bfsOptimization.fromCachedLevel} (${((this.cacheStats.bfsOptimization.fromCachedLevel / this.cacheStats.bfsOptimization.totalCalls) * 100).toFixed(1)}%)`)
            console.log(`     总计跳过层数: ${this.cacheStats.bfsOptimization.skippedLevels}`)
            if (this.cacheStats.bfsOptimization.fromCachedLevel > 0) {
                const avgSkipped = this.cacheStats.bfsOptimization.skippedLevels / this.cacheStats.bfsOptimization.fromCachedLevel
                console.log(`     平均每次跳过: ${avgSkipped.toFixed(2)} 层`)
            }
        }

        // 以下缓存仅在特殊场景使用，通常命中率较低
        if (this.cacheStats.bfsLevel.total > 0) {
            console.log(`   BFS_Level (handleDFS特殊场景: firstK=∞, maxLevel=1):`)
            console.log(`     命中: ${this.cacheStats.bfsLevel.hit}`)
            console.log(`     未命中: ${this.cacheStats.bfsLevel.miss}`)
            console.log(`     总次数: ${this.cacheStats.bfsLevel.total}`)
            console.log(`     命中率: ${((this.cacheStats.bfsLevel.hit / this.cacheStats.bfsLevel.total) * 100).toFixed(1)}%`)
        }

        if (this.cacheStats.expandOneLevel.total > 0) {
            console.log(`   ExpandOneLevel (BFS路径展开缓存):`)
            console.log(`     命中: ${this.cacheStats.expandOneLevel.hit}`)
            console.log(`     未命中: ${this.cacheStats.expandOneLevel.miss}`)
            console.log(`     总次数: ${this.cacheStats.expandOneLevel.total}`)
            console.log(`     命中率: ${((this.cacheStats.expandOneLevel.hit / this.cacheStats.expandOneLevel.total) * 100).toFixed(1)}%`)
        }

        console.log(`   实际计算次数 (getDirectChildren): ${this.cacheStats.actualCompute}`)
        console.log('')

        // 验证统计完整性
        const expectedNormalProcess = this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn
        const actualCacheOperations = this.cacheStats.dfsFirst1.hit +
            this.cacheStats.dfsFirstK.hit +
            this.cacheStats.actualCompute
        console.log(`📈 统计验证:`)
        console.log(`   预期正常处理: ${expectedNormalProcess}`)
        console.log(`   实际缓存操作: ${actualCacheOperations}`)
        console.log(`   差异: ${expectedNormalProcess - actualCacheOperations} (应该接近0)`)
        console.log('')

        // 2. 方法调用统计
        const sorted = Array.from(this.stats.entries())
            .sort((a, b) => b[1].totalTime - a[1].totalTime)
            .slice(0, 20)  // 只显示前20个

        console.log('⏱️  方法耗时统计 (Top 20):')
        for (const [method, stat] of sorted) {
            const avgTime = stat.totalTime / stat.count
            const avgInput = stat.inputSizes.length > 0
                ? stat.inputSizes.reduce((a, b) => a + b, 0) / stat.inputSizes.length
                : 0
            const avgOutput = stat.outputSizes.length > 0
                ? stat.outputSizes.reduce((a, b) => a + b, 0) / stat.outputSizes.length
                : 0

            console.log(`📌 ${method}:`)
            console.log(`   调用: ${stat.count}次, 总耗时: ${stat.totalTime.toFixed(0)}ms, 平均: ${avgTime.toFixed(2)}ms`)

            if (stat.inputSizes.length > 0 && stat.outputSizes.length > 0) {
                console.log(`   输入→输出: ${avgInput.toFixed(1)} → ${avgOutput.toFixed(1)} (${(avgOutput / avgInput).toFixed(1)}x)`)
            }
        }

        // 总耗时
        const totalTime = Array.from(this.stats.values())
            .reduce((sum, stat) => sum + stat.totalTime, 0)
        console.log(`\n⏱️  所有方法总耗时: ${totalTime.toFixed(2)}ms\n`)
    }

    // 清空统计
    clear() {
        this.stats.clear()
        this.cacheStats = {
            subRuleHandlerTotal: 0,
            recursiveReturn: 0,
            levelLimitReturn: 0,
            dfsFirst1: {hit: 0, miss: 0, total: 0},
            dfsFirstK: {hit: 0, miss: 0, total: 0},
            bfsLevel: {hit: 0, miss: 0, total: 0},
            getDirectChildren: {hit: 0, miss: 0, total: 0},
            expandOneLevel: {hit: 0, miss: 0, total: 0},
            expandOneLevelTruncated: {hit: 0, miss: 0, total: 0},
            actualCompute: 0,
            bfsOptimization: {
                totalCalls: 0,
                skippedLevels: 0,
                fromLevel1: 0,
                fromCachedLevel: 0
            }
        }
    }
}

/**
 * 全局统一限制配置
 *
 * 设计理念：
 * - MAX_LEVEL：控制展开深度，防止无限递归
 * - MAX_BRANCHES：仅用于冲突检测时的路径比较优化
 */
export const EXPANSION_LIMITS = {
    /**
     * 0,不展开
     * Infinity，无线展开
     */
    FIRST_1: 1,
    FIRST_K: 3,

    LEVEL_1: 1,
    LEVEL_K: 2,

    INFINITY: Infinity,

    /**
     * 冲突检测路径比较限制
     *
     * ⚠️ 注意：此限制仅用于冲突检测阶段的路径比较优化
     * - 不影响规则展开阶段（展开阶段不做任何截断）
     * - 仅在 SubhutiConflictDetector.detectOrConflicts 中使用
     * - 用于限制每个分支的路径数量，防止路径比较爆炸
     *
     * 性能考虑：
     * - 路径比较复杂度：O(n²)
     * - 1000条路径 × 1000条路径 = 100万次比较（可接受）
     * - 超过1000条路径会导致性能问题（如 28260条 = 8亿次比较）
     *
     * 当前设置：已取消限制（Infinity），可能导致性能问题
     */
    MAX_BRANCHES: Infinity,
} as const

/**
 * 展开模式：系统只支持三种模式
 */
export type ExpansionMode =
    | 'First_Infinity_Level_K'    // firstK=∞, maxLevel=5 (完整路径，展开5层)
    | 'First_1_Level_Infinity'    // firstK=1, maxLevel=∞ (前1个token，完全展开)
    | 'First_K_Level_Infinity'    // firstK=3, maxLevel=∞ (前3个token，完全展开)

/**
 * 规则展开结果（二维数组）
 * expansion[branchIndex][nodeIndex]
 *
 * 第一维：分支索引（包含所有层级的所有分支）
 * 第二维：该分支的节点序列（规则名或token名）
 *
 * 特殊值：
 * - 空数组 [] 表示 option/many 的跳过分支
 */
export type RuleExpansion = string[][]

/**
 * 语法分析器配置
 */
export interface GrammarAnalyzerOptions {
    /**
     * 最大展开层级
     * 默认: 3
     *
     * 说明：
     * - 控制规则展开的深度
     * - Level 0: 直接子节点
     * - Level 1: 展开一层
     * - Level N: 展开N层
     */
    maxLevel?: number
}

/**
 * 语法分析器
 *
 * 职责：
 * 1. 接收规则 AST
 * 2. 按层级展开规则（不再完全展开到token）
 * 3. 分层存储展开结果
 * 4. 只缓存直接子节点，使用时按需展开
 *
 * 性能：
 * - 默认限制：3层展开，10000条路径
 * - 缓存机制：只缓存直接子节点
 * - 按需计算：使用时才递归展开
 */
export class SubhutiGrammarAnalyzer {
    /** 正在计算的规则（用于检测循环依赖） */
    private recursiveDetectionSet = new Set<string>()

    // ========================================
    // DFS（深度优先）专属缓存
    // 适用：maxLevel = INFINITY（无限层数，递归到token）
    // ========================================

    /** DFS 主缓存：key="ruleName"，First(K) + 无限层级 */
    private dfsFirstKCache = new Map<string, string[][]>()

    /** DFS 派生缓存：key="ruleName"，First(1) + 无限层级（从 dfsFirstKCache 截取） */
    private dfsFirst1Cache = new Map<string, string[][]>()

    // ========================================
    // BFS（广度优先）专属缓存
    // 适用：maxLevel = 具体值（限制层数，按层级展开）
    // 特点：BFS 只负责按层级展开，不负责截取
    // ========================================

    /** BFS 缓存：key="ruleName"（完整展开，不截取，所有层级聚合） */
    private bfsAllCache = new Map<string, string[][]>()
    /** BFS 缓存：key="ruleName:level"（完整展开，不截取） */
    private bfsLevelCache = new Map<string, string[][]>()

    /**
     * 注意：levelFullResultCache 已删除，复用 bfsLevelCache
     * bfsLevelCache 存储的就是某规则在某层级的完整结果（firstK=∞）
     */

    /** 展开单个路径缓存（完整版）：key="ruleName:level:pathIndex" */
    private expandSinglePathFullCache = new Map<string, string[][]>()

    /** 展开单个路径缓存（截取版）：key="ruleName:level:pathIndex:firstK" */
    private expandSinglePathTruncatedCache = new Map<string, string[][]>()


    /** 性能分析器 */
    private perfAnalyzer = new PerformanceAnalyzer()
    // private firstInfinityLevel1Cache = new Map<string, string[][]>()
    // 🔧 特殊：key 为 "ruleName:maxLevel"，因为不同层级返回不同结果
    // private firstInfinityLevelKAllCache = new Map<string, string[][]>()
    private leftRecursiveDetectionSet = new Set<string>()

    /** 收集检测过程中发现的左递归错误（使用 Map 提高查重性能） */
    private detectedLeftRecursionErrors = new Map<string, LeftRecursionError>()

    /** 配置选项 */
    private options: Required<GrammarAnalyzerOptions>

    /** 🔍 DEBUG: 只对这些规则输出日志 */
    private debugRules = new Set<string>([
        'AsyncArrowBindingIdentifier',
        'BindingIdentifier',
        'AsyncConciseBody',
        'AsyncArrowHead'
    ])

    /**
     * 构造函数
     *
     * @param ruleASTs 规则名称 → AST 的映射
     * @param tokenCache
     * @param options 配置选项
     */
    constructor(
        private ruleASTs: Map<string, SequenceNode>,
        private tokenCache: Map<string, ConsumeNode>,
        options?: GrammarAnalyzerOptions
    ) {
        this.options = {
            maxLevel: options?.maxLevel ?? 5
        }
    }


    getRuleNodeByAst(ruleName: string) {
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误')
        }
        return ruleNode
    }

    /**
     * 检测所有规则的左递归
     *
     * 实现方式：
     * - 遍历所有规则，调用 expandPathsByDFS 触发展开
     * - 在 subRuleHandler 中检测递归，区分左递归和普通递归
     * - 收集所有左递归错误
     *
     * @returns 左递归错误列表
     */
    public checkAllLeftRecursion(): LeftRecursionError[] {
        console.log(`\n📊 [左递归检测] 开始检测 ${this.ruleASTs.size} 个规则...`)

        const ruleNames = Array.from(this.ruleASTs.keys())

        // ========================================
        // 阶段1：初始化 DFS 缓存 + 左递归检测
        // ========================================
        console.log(`    [1/2] 初始化 DFS 缓存 (无限层数场景) + 左递归检测...`)
        console.log(`       策略：dfsFirstKCache (firstK=${EXPANSION_LIMITS.FIRST_K}, maxLevel=∞) + 派生 first1`)
        console.log(`       算法：深度优先，递归展开到token`)
        const t1 = Date.now()

        // 清空错误 Map
        this.detectedLeftRecursionErrors.clear()

        // 启动超时检测
        this.operationStartTime = Date.now()

        // 遍历所有规则
        for (const ruleNode of this.ruleASTs.values()) {
            const ruleName = (ruleNode as any).ruleName
            this.currentProcessingRule = ruleName

            // 清空递归检测集合
            this.recursiveDetectionSet.clear()

            try {
                this.checkTimeout(`规则${ruleName}-开始`)
                this.expandPathsByDFS(null, ruleNode, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.INFINITY, true)
            } catch (e) {
                console.error(`  ❌ 规则 ${ruleName} 检测失败: ${e.message}`)
                throw e
            }
        }

        // 重置超时检测
        this.operationStartTime = 0

        // 为每个错误补充 suggestion
        for (const error of this.detectedLeftRecursionErrors.values()) {
            const ruleAST = this.getRuleNodeByAst(error.ruleName)
            error.suggestion = this.getLeftRecursionSuggestion(
                error.ruleName,
                ruleAST,
                new Set([error.ruleName])
            )
        }

        const t1End = Date.now()
        console.log(`\n    ✓ [1/1] DFS 缓存初始化 + 左递归检测完成`)
        console.log(`       耗时: ${t1End - t1}ms`)
        console.log(`       主缓存 dfsFirstKCache: ${this.dfsFirstKCache.size} 条`)
        console.log(`       派生缓存 dfsFirst1Cache: ${this.dfsFirst1Cache.size} 条（从firstK截取）`)
        if (this.detectedLeftRecursionErrors.size > 0) {
            console.log(`       ⚠️  发现 ${this.detectedLeftRecursionErrors.size} 个左递归错误（详情见后续汇总）`)
        }

        // ========================================
        // 🔧 优化：删除无用的 BFS 预填充
        // ========================================
        // 原因：整个系统都使用 DFS（maxLevel=∞），BFS 缓存从未被有效使用
        // BFS 缓存改为懒加载：在 getDirectChildren 中第一次使用时才填充
        // 
        // ❌ 已删除阶段2：BFS 缓存预填充（浪费时间和内存）
        // ❌ 已删除阶段2.5：bfsAllCache 聚合（从未使用）
        //
        // 性能提升：
        // - 减少初始化时间（不再遍历所有规则的 level 1-2）
        // - 减少内存占用（按需填充，不存储无用数据）
        // - ExpandOneLevel 缓存统计不再显示无意义的 0%

        // 返回收集到的错误（转换为数组）
        return Array.from(this.detectedLeftRecursionErrors.values())
    }

    /**
     * BFS 缓存预填充（从 level 1 到 level_k）
     *
     * 目的：
     * - 提前计算常用的浅层展开结果
     * - 为 BFS 增量优化提供基础缓存
     * - 触发 getDirectChildren 的懒加载填充
     *
     * 策略：
     * - 遍历所有规则
     * - 对每个规则预填充 level 1 到 level_k 的缓存
     */
    private preFillBFSCache(): void {
        console.log(`    预填充策略: 从 level 1 到 level ${EXPANSION_LIMITS.LEVEL_K}`)

        const ruleNames = Array.from(this.ruleASTs.keys())
        let totalFilled = 0

        // 预填充 level 1 到 level_k
        for (let level = 1; level <= EXPANSION_LIMITS.LEVEL_K; level++) {

            for (const ruleName of ruleNames) {
                const key = `${ruleName}:${level}`
                console.log(`\n    [预填充] 规则: ${ruleName}`)

                // 跳过已有缓存
                if (this.bfsLevelCache.has(key)) {
                    console.log(`      ✓ Level ${level}: 已有缓存，跳过`)
                    continue
                }

                try {
                    // 调用 BFS 展开（会触发 getDirectChildren 和懒加载）
                    const result = this.expandPathsByBFS(ruleName, level)
                    totalFilled++
                    console.log(`      ✓ Level ${level}: 填充完成 (${result.length} 条路径)`)
                } catch (e) {
                    console.error(`      ✗ Level ${level}: 填充失败: ${e.message}`)
                    throw e
                }
            }
        }

        console.log(`\n    预填充汇总:`)
        console.log(`      规则数: ${ruleNames.length}`)
        console.log(`      层级数: 1~${EXPANSION_LIMITS.LEVEL_K}`)
        console.log(`      新增缓存: ${totalFilled} 条`)
        console.log(`      BFS Level 缓存总数: ${this.bfsLevelCache.size} 条`)
    }

    /**
     * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * 实现方式：
     * - 遍历所有规则的 AST
     * - 递归查找所有 Or 节点
     * - 先计算每个分支的 First(1) 集合
     * - 如果有冲突，再深入检测 First(5)
     *
     * @returns Or 冲突错误列表
     */
    /**
     * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * 实现方式：
     * - 遍历所有规则的 AST
     * - 递归查找所有 Or 节点
     * - 先计算每个分支的 First(1) 集合
     * - 如果有冲突，再深入检测 First(5)
     *
     * @returns Or 冲突错误列表
     */
    public checkAllOrConflicts(): ValidationError[] {
        const orConflictErrors: ValidationError[] = []

        // 性能统计对象
        const perfStats = {
            totalTime: 0,
            first1Time: 0,
            first5Time: 0,
            comparisonTime: 0,
            rulesChecked: 0,
            orNodesChecked: 0,
            first1Computed: 0,
            first5Computed: 0,
            conflictComparisons: 0,
            first5Skipped: 0  // 跳过的First(5)计算
        }

        const startTime = Date.now()

        console.log(`\n📊 [Or分支冲突检测] 开始智能检测 ${this.ruleASTs.size} 个规则...`)
        console.log(`   策略：先 First(1) 检测，有冲突再 First(5) 深入分析`)

        // 遍历所有规则
        for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
            perfStats.rulesChecked++
            this.checkOrConflictsInNodeSmart(ruleName, ruleAST, orConflictErrors, perfStats)
        }

        perfStats.totalTime = Date.now() - startTime

        if (orConflictErrors.length > 0) {
            console.log(`   ⚠️  发现 ${orConflictErrors.length} 个 Or 分支冲突（详情见后续汇总）`)
        }

        // 输出性能统计
        console.log(`\n⏱️  [性能统计]`)
        console.log(`   总耗时: ${perfStats.totalTime}ms`)
        console.log(`   ├─ First(1)计算: ${perfStats.first1Time}ms (${(perfStats.first1Time / perfStats.totalTime * 100).toFixed(1)}%) - ${perfStats.first1Computed}次`)
        console.log(`   ├─ First(k)计算: ${perfStats.first5Time}ms (${(perfStats.first5Time / perfStats.totalTime * 100).toFixed(1)}%) - ${perfStats.first5Computed}次`)
        console.log(`   ├─ 冲突对比: ${perfStats.comparisonTime}ms (${(perfStats.comparisonTime / perfStats.totalTime * 100).toFixed(1)}%) - ${perfStats.conflictComparisons}次`)
        console.log(`   └─ 其他: ${(perfStats.totalTime - perfStats.first1Time - perfStats.first5Time - perfStats.comparisonTime)}ms`)
        console.log(`   Or节点总数: ${perfStats.orNodesChecked}`)
        console.log(`   性能优化: 跳过 ${perfStats.first5Skipped} 次First(k)计算 (无First(1)冲突)`)
        if (perfStats.orNodesChecked > 0) {
            console.log(`   平均每Or节点: ${(perfStats.totalTime / perfStats.orNodesChecked).toFixed(2)}ms`)
        }

        return orConflictErrors
    }

    /**
     * 检测所有规则的 Or 分支冲突（支持 First(k)）
     *
     * 实现方式：
     * - 遍历所有规则的 AST
     * - 递归查找所有 Or 节点
     * - 计算每个分支的 First(k) 集合
     * - 检测分支间是否有交集
     *
     * @param k First(k) 的 k 值，默认为 1
     * @returns Or 冲突错误列表
     */
    public checkAllOrConflictsWithFirstK(k: number = 1): ValidationError[] {
        const orConflictErrors: ValidationError[] = []

        console.log(`\n📊 [Or分支冲突检测] 开始检测 ${this.ruleASTs.size} 个规则 (First(${k}))...`)

        // 遍历所有规则
        for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
            // 递归检查 AST 中的所有 Or 节点
            this.checkOrConflictsInNodeWithFirstK(ruleName, ruleAST, orConflictErrors, k)
        }

        if (orConflictErrors.length === 0) {
            console.log(`  ✅ 未发现 Or 分支冲突`)
        } else {
            console.log(`  ⚠️  发现 ${orConflictErrors.length} 个 Or 分支冲突`)
        }

        return orConflictErrors
    }

    /**
     * 递归检查节点中的 Or 冲突（使用 First(1)）
     *
     * @param ruleName 规则名
     * @param node 当前节点
     * @param errors 错误列表
     */
    private checkOrConflictsInNode(
        ruleName: string,
        node: RuleNode,
        errors: ValidationError[]
    ): void {
        // 默认使用 First(1)
        this.checkOrConflictsInNodeWithFirstK(ruleName, node, errors, 1)
    }

    /**
     * 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * @param ruleName 规则名
     * @param node 当前节点
     * @param errors 错误列表
     */
    private checkOrConflictsInNodeSmart(
        ruleName: string,
        node: RuleNode,
        errors: ValidationError[],
        perfStats?: any
    ): void {
        switch (node.type) {
            case 'or':
                // 使用智能检测
                if (perfStats) perfStats.orNodesChecked++
                this.detectOrNodeConflictSmart(ruleName, node, errors, perfStats)
                // 递归检查每个分支
                for (const alt of node.alternatives) {
                    this.checkOrConflictsInNodeSmart(ruleName, alt, errors, perfStats)
                }
                break

            case 'sequence':
                // 递归检查序列中的每个节点
                for (const child of node.nodes) {
                    this.checkOrConflictsInNodeSmart(ruleName, child, errors, perfStats)
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检查内部节点
                this.checkOrConflictsInNodeSmart(ruleName, node.node, errors, perfStats)
                break

            case 'consume':
            case 'subrule':
                // 叶子节点，不需要递归
                break
        }
    }

    /**
     * 递归检查节点中的 Or 冲突（支持 First(k)）
     *
     * @param ruleName 规则名
     * @param node 当前节点
     * @param errors 错误列表
     * @param k First(k) 的 k 值
     */
    private checkOrConflictsInNodeWithFirstK(
        ruleName: string,
        node: RuleNode,
        errors: ValidationError[],
        k: number = 1
    ): void {
        switch (node.type) {
            case 'or':
                // 检测当前 Or 节点的冲突
                this.detectOrNodeConflictWithFirstK(ruleName, node, errors, k)
                // 递归检查每个分支
                for (const alt of node.alternatives) {
                    this.checkOrConflictsInNodeWithFirstK(ruleName, alt, errors, k)
                }
                break

            case 'sequence':
                // 递归检查序列中的每个节点
                for (const child of node.nodes) {
                    this.checkOrConflictsInNodeWithFirstK(ruleName, child, errors, k)
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检查内部节点
                this.checkOrConflictsInNodeWithFirstK(ruleName, node.node, errors, k)
                break

            case 'consume':
            case 'subrule':
                // 叶子节点，不需要递归
                break
        }
    }

    /**
     * 检测单个 Or 节点的冲突（使用 First(1)）
     *
     * @param ruleName 规则名
     * @param orNode Or 节点
     * @param errors 错误列表
     */
    private detectOrNodeConflict(
        ruleName: string,
        orNode: RuleNode,
        errors: ValidationError[]
    ): void {
        // 默认使用 First(1)
        this.detectOrNodeConflictWithFirstK(ruleName, orNode, errors, 1)
    }

    /**
     * 检测单个 Or 节点的冲突（智能检测：先 First(1)，有冲突再 First(k)）
     *
     * @param ruleName 规则名
     * @param orNode Or 节点
     * @param errors 错误列表
     * @param k First(k) 的 k 值（仅在单独调用时使用）
     */
    private detectOrNodeConflictWithFirstK(
        ruleName: string,
        orNode: RuleNode,
        errors: ValidationError[],
        k: number = 1
    ): void {
        // 防御：确保是 Or 节点
        if (orNode.type !== 'or') {
            throw new Error('系统错误：detectOrNodeConflictWithFirstK 只能处理 or 类型节点')
        }

        // 类型断言为 OrNode
        const orNodeTyped = orNode as OrNode

        // 计算每个分支的 First(k) 集合
        const branchFirstSets: Set<string>[] = []

        for (const alt of orNodeTyped.alternatives) {
            // 使用 computeNodeFirstK 计算 First(k) 集合
            const firstSet = this.computeNodeFirstK(alt, k)
            branchFirstSets.push(firstSet)
        }

        // 检测分支间的冲突（两两比较）
        for (let i = 0; i < branchFirstSets.length; i++) {
            for (let j = i + 1; j < branchFirstSets.length; j++) {
                // 计算交集
                const intersection = this.setIntersection(branchFirstSets[i], branchFirstSets[j])

                if (intersection.size > 0) {
                    // 发现冲突
                    const conflictTokens = Array.from(intersection).join(', ')
                    const errorType = k === 1 ? 'or-conflict' : `or-conflict-first${k}`

                    errors.push({
                        level: 'ERROR',
                        type: errorType as any,
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: `分支 ${i + 1} First(${k}): {${Array.from(branchFirstSets[i]).join(', ')}}`,
                            pathB: `分支 ${j + 1} First(${k}): {${Array.from(branchFirstSets[j]).join(', ')}}`
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 在 First(${k}) 存在冲突`,
                        suggestion: this.getOrConflictSuggestion(ruleName, i, j, intersection, branchFirstSets[i], branchFirstSets[j])
                    })

                    console.log(`  ❌ ${ruleName}: 分支 ${i + 1} 和 ${j + 1} 在 First(${k}) 冲突 (${conflictTokens})`)
                }
            }
        }
    }

    /**
     * 智能检测单个 Or 节点的冲突（先 First(1)，有冲突再 First(5)）
     *
     * @param ruleName 规则名
     * @param orNode Or 节点
     * @param errors 错误列表
     */
    private detectOrNodeConflictSmart(
        ruleName: string,
        orNode: RuleNode,
        errors: ValidationError[],
        perfStats?: any
    ): void {
        // 防御：确保是 Or 节点
        if (orNode.type !== 'or') {
            throw new Error('系统错误：detectOrNodeConflictSmart 只能处理 or 类型节点')
        }

        // 类型断言为 OrNode
        const orNodeTyped = orNode as OrNode

        // Step 1: 计算每个分支的 First(1) 集合
        const branchFirst1Sets: Set<string>[] = []
        let hasFirst1Conflict = false

        const t1Start = Date.now()

        for (const alt of orNodeTyped.alternatives) {
            const firstSet = this.computeNodeFirstK(alt, EXPANSION_LIMITS.FIRST_1)
            branchFirst1Sets.push(firstSet)
            if (perfStats) perfStats.first1Computed++
        }

        const t1End = Date.now()
        if (perfStats) perfStats.first1Time += (t1End - t1Start)

        // 检测 First(1) 冲突
        const first1Conflicts: Array<{ i: number, j: number, intersection: Set<string> }> = []

        for (let i = 0; i < branchFirst1Sets.length; i++) {
            for (let j = i + 1; j < branchFirst1Sets.length; j++) {
                const intersection = this.setIntersection(branchFirst1Sets[i], branchFirst1Sets[j])
                if (intersection.size > 0) {
                    hasFirst1Conflict = true
                    first1Conflicts.push({i, j, intersection})
                }
            }
        }

        // Step 2: 如果有 First(1) 冲突，进一步检测 First(5)
        if (hasFirst1Conflict) {

            const t5Start = Date.now()

            // 计算每个分支的 First(5) 集合
            const branchFirst5Sets: Set<string>[] = []

            for (const alt of orNodeTyped.alternatives) {
                const firstSet = this.computeNodeFirstK(alt, EXPANSION_LIMITS.FIRST_K)
                branchFirst5Sets.push(firstSet)
                if (perfStats) perfStats.first5Computed++
            }

            const t5End = Date.now()
            if (perfStats) perfStats.first5Time += (t5End - t5Start)

            // 只检测在 First(1) 有冲突的分支对
            const tCompStart = Date.now()

            // 🔧 优化：收集所有冲突，最后合并报告
            interface RuleConflictInfo {
                branchIndices: [number, number]
                conflictPair: {
                    frontSeq: string
                    frontLen: number
                    behindSeq: string
                    behindLen: number
                    type: 'equal' | 'prefix' | 'full'
                }
                typeLabel: string
            }

            const allRuleConflicts: RuleConflictInfo[] = []

            for (const conflict of first1Conflicts) {
                const {i, j} = conflict

                if (perfStats) perfStats.conflictComparisons++

                // 新逻辑：检测真正的冲突
                // 情况1：两个序列长度都等于 k，且完全相同
                // 情况2：if ((front.length < k) || (behind.length >= front.length))
                const k = EXPANSION_LIMITS.FIRST_K

                // 存储冲突对的详细信息
                interface ConflictPair {
                    frontSeq: string
                    frontLen: number
                    behindSeq: string
                    behindLen: number
                    type: 'equal' | 'prefix' | 'full'
                }

                const conflictPairs: ConflictPair[] = []

                // 🔧 优化：一旦发现第一个冲突就停止，避免重复报告同一对分支
                let foundConflict = false

                for (const seqA of branchFirst5Sets[i]) {
                    if (foundConflict) break  // 已发现冲突，跳出外层循环

                    const tokensA = seqA.split(' ')

                    for (const seqB of branchFirst5Sets[j]) {
                        const tokensB = seqB.split(' ')

                        // 情况1：两个序列长度都等于 k，且完全相同
                        if (tokensA.length === k && tokensB.length === k && seqA === seqB) {
                            conflictPairs.push({
                                frontSeq: seqA,
                                frontLen: tokensA.length,
                                behindSeq: seqB,
                                behindLen: tokensB.length,
                                type: 'full'
                            })
                            foundConflict = true
                            break  // 发现冲突，停止比较
                        }

                        // 情况2：前面就是分支A，后面就是分支B，不调整顺序
                        const front = tokensA  // 分支 i (前面的分支)
                        const behind = tokensB  // 分支 j (后面的分支)
                        const frontSeq = front.join(' ')
                        const behindSeq = behind.join(' ')

                        // 外层判断：(front.length < k) || (behind.length >= front.length)
                        if ((front.length < k) || (behind.length >= front.length)) {
                            if (behind.length > front.length) {
                                // 后面长度大于前面，检查是否包含前面（前缀关系）
                                let isPrefix = true
                                for (let idx = 0; idx < front.length; idx++) {
                                    if (front[idx] !== behind[idx]) {
                                        isPrefix = false
                                        break
                                    }
                                }

                                if (isPrefix) {
                                    conflictPairs.push({
                                        frontSeq,
                                        frontLen: front.length,
                                        behindSeq,
                                        behindLen: behind.length,
                                        type: 'prefix'
                                    })
                                    foundConflict = true
                                    break  // 发现冲突，停止比较
                                }
                            } else if (behind.length === front.length) {
                                // 长度相等，检查内容是否相等
                                if (frontSeq === behindSeq) {
                                    conflictPairs.push({
                                        frontSeq,
                                        frontLen: front.length,
                                        behindSeq,
                                        behindLen: behind.length,
                                        type: 'equal'
                                    })
                                    foundConflict = true
                                    break  // 发现冲突，停止比较
                                }
                            }
                            // 如果 behind.length < front.length，则不检查
                        }
                    }
                }

                // 收集冲突信息（不输出日志）
                if (conflictPairs.length > 0) {
                    // First(5) 有真实冲突 - 深层冲突
                    // 每对分支只有一个冲突（已优化）
                    const pair = conflictPairs[0]

                    // 确定冲突类型
                    let typeLabel = ''
                    if (pair.type === 'full') {
                        typeLabel = `完全相同(长度=${k})`
                    } else if (pair.type === 'prefix') {
                        typeLabel = `前缀冲突(前面${pair.frontLen}个是后面${pair.behindLen}个的前缀)`
                    } else {
                        typeLabel = `相等(长度=${pair.frontLen})`
                    }

                    // 收集到数组
                    allRuleConflicts.push({
                        branchIndices: [i, j],
                        conflictPair: pair,
                        typeLabel
                    })
                }
            }

            // 🔧 合并报告：将同一规则的所有冲突合并成一个报告
            if (allRuleConflicts.length > 0) {
                const k = EXPANSION_LIMITS.FIRST_K

                // 构建合并的冲突详情
                const conflictDetailsArray = allRuleConflicts.map((conflict, index) => {
                    const {branchIndices, conflictPair, typeLabel} = conflict
                    const [i, j] = branchIndices

                    return `  冲突${index + 1}: 分支${i + 1} 和 分支${j + 1}
    ${typeLabel}: "${conflictPair.frontSeq}"`
                })

                const mergedConflictDetails = conflictDetailsArray.join('\n\n')

                // 判断是否有深层冲突
                const hasFullLengthConflict = allRuleConflicts.some(c => c.conflictPair.type === 'full')

                const suggestion = hasFullLengthConflict
                    ? `⚠️ 深层冲突：存在长度为 ${k} 的完全相同序列，无法通过 First(${k}) 前瞻区分，需要重新设计语法结构`
                    : `⚠️ 前缀/相等冲突：存在重叠序列，建议调整语法或增加前瞻深度`

                // 生成合并的错误报告
                errors.push({
                    level: 'ERROR',
                    type: 'or-conflict-first5' as any,
                    ruleName,
                    branchIndices: [],  // 不指定具体分支，因为有多对
                    conflictPaths: {
                        pathA: mergedConflictDetails,
                        pathB: ''
                    },
                    message: `规则 "${ruleName}" 存在 ${allRuleConflicts.length} 对 Or 分支冲突`,
                    suggestion
                })
            }

            const tCompEnd = Date.now()
            if (perfStats) perfStats.comparisonTime += (tCompEnd - tCompStart)
        } else {
            // 无 First(1) 冲突，跳过 First(5) 检测
            if (perfStats) perfStats.first5Skipped++
        }
    }

    /**
     * 计算集合交集
     *
     * @param setA 集合 A
     * @param setB 集合 B
     * @returns 交集
     */
    private setIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
        const result = new Set<T>()
        for (const item of setA) {
            if (setB.has(item)) {
                result.add(item)
            }
        }
        return result
    }

    /**
     * 生成 Or 冲突修复建议
     *
     * @param ruleName 规则名
     * @param branchIndexA 分支 A 索引
     * @param branchIndexB 分支 B 索引
     * @param intersection 冲突的 token 集合
     * @param firstSetA 分支 A 的 First 集合
     * @param firstSetB 分支 B 的 First 集合
     * @returns 修复建议
     */
    private getOrConflictSuggestion(
        ruleName: string,
        branchIndexA: number,
        branchIndexB: number,
        intersection: Set<string>,
        firstSetA: Set<string>,
        firstSetB: Set<string>
    ): string {
        const conflictTokens = Array.from(intersection).slice(0, 5).join(', ')
        const hasMore = intersection.size > 5

        return `PEG 解析器使用顺序选择，Or 分支的 First 集合不能有交集！

检测到的冲突：
  分支 ${branchIndexA + 1} 的 First(1) 集合: {${Array.from(firstSetA).slice(0, 10).join(', ')}${firstSetA.size > 10 ? ', ...' : ''}}
  分支 ${branchIndexB + 1} 的 First(1) 集合: {${Array.from(firstSetB).slice(0, 10).join(', ')}${firstSetB.size > 10 ? ', ...' : ''}}
  
  冲突的 token: {${conflictTokens}${hasMore ? ', ...' : ''}} (共 ${intersection.size} 个)

修复建议：
  1. 调整分支顺序：将更具体的分支放在前面
  2. 重构语法：提取公共前缀或使用不同的 token 区分
  3. 使用语义谓词：在运行时进行额外判断
  
示例（提取公共前缀）：
  ❌ 有冲突：
     ${ruleName} → 'if' Expr 'then' Stmt | 'if' Expr 'then' Stmt 'else' Stmt
  
  ✅ 无冲突：
     ${ruleName} → 'if' Expr 'then' Stmt ElseClause?
     ElseClause → 'else' Stmt`
    }

    /**
     * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
     * @returns 所有验证错误列表（包括左递归和 Or 冲突）
     */
    initCacheAndCheckLeftRecursion(): ValidationError[] {
        console.log(`\n🔍 ========== 语法验证与缓存初始化 ==========\n`)

        const totalStartTime = Date.now()

        // 1. 左递归检测（内部会初始化 DFS 缓存和 BFS 缓存）
        console.log(`📊 [阶段1] 开始左递归检测...`)
        const t1 = Date.now()
        const leftRecursionErrors = this.checkAllLeftRecursion()
        const t1End = Date.now()
        console.log(`✅ [阶段1] 左递归检测完成，耗时 ${t1End - t1}ms`)

        // 1.5. BFS 缓存预填充（level 1 到 level_k）
        console.log(`\n📊 [阶段1.5] 开始 BFS 缓存预填充...`)
        const t1_5 = Date.now()
        this.preFillBFSCache()
        const t1_5End = Date.now()
        console.log(`✅ [阶段1.5] BFS 缓存预填充完成，耗时 ${t1_5End - t1_5}ms`)

        // 2. Or 分支冲突检测
        console.log(`\n📊 [阶段2] 开始 Or 分支冲突检测...`)
        const t2 = Date.now()
        const orConflictErrors = this.checkAllOrConflicts()
        const t2End = Date.now()
        console.log(`✅ [阶段2] Or 分支冲突检测完成，耗时 ${t2End - t2}ms`)

        // 3. 合并所有错误（左递归优先）
        const allErrors: ValidationError[] = []
        allErrors.push(...leftRecursionErrors)
        allErrors.push(...orConflictErrors)

        // 4. 统一输出错误汇总
        console.log(`\n`)
        console.log(`${'='.repeat(60)}`)
        console.log(`📋 语法验证错误汇总`)
        console.log(`${'='.repeat(60)}`)

        if (allErrors.length === 0) {
            console.log(`\n✅ 未发现任何语法错误！\n`)
        } else {
            console.log(`\n⚠️  发现 ${allErrors.length} 个语法错误：\n`)

            // 4.1 输出左递归错误（优先）
            if (leftRecursionErrors.length > 0) {
                console.log(`❌ 左递归错误 (${leftRecursionErrors.length} 个)：`)
                console.log(`${'─'.repeat(60)}`)
                leftRecursionErrors.forEach((error, index) => {
                    console.log(`\n[${index + 1}] 规则: ${error.ruleName}`)
                    console.log(`    消息: ${error.message}`)
                    if (error.suggestion) {
                        console.log(`    建议:\n${error.suggestion.split('\n').map(line => `      ${line}`).join('\n')}`)
                    }
                })
                console.log(`\n`)
            }

            // 4.2 输出 Or 分支冲突错误
            if (orConflictErrors.length > 0) {
                console.log(`⚠️  Or 分支冲突 (${orConflictErrors.length} 个)：`)
                console.log(`${'─'.repeat(60)}`)
                orConflictErrors.forEach((error, index) => {
                    console.log(`\n[${index + 1}] 规则: ${error.ruleName}`)
                    console.log(`    消息: ${error.message}`)
                    if (error.conflictPaths) {
                        console.log(`    冲突详情:`)
                        console.log(`${error.conflictPaths.pathA}`)
                        if (error.conflictPaths.pathB) {
                            console.log(`${error.conflictPaths.pathB}`)
                        }
                    }
                    if (error.suggestion) {
                        console.log(`    建议: ${error.suggestion}`)
                    }
                })
                console.log(`\n`)
            }
        }

        console.log(`${'='.repeat(60)}`)

        // 5. 输出性能统计
        const totalTime = Date.now() - totalStartTime
        console.log(`\n⏱️  总耗时: ${totalTime}ms`)
        console.log(`   - 阶段1(左递归检测): ${t1End - t1}ms (${((t1End - t1) / totalTime * 100).toFixed(1)}%)`)
        console.log(`   - 阶段2(Or冲突检测): ${t2End - t2}ms (${((t2End - t2) / totalTime * 100).toFixed(1)}%)`)

        console.log(`\n🎯 ========== 最终性能分析报告 ==========`)
        this.perfAnalyzer.report()

        return allErrors
    }


    /**
     * 计算笛卡尔积（优化版：先截取再拼接 + seq级别去重 + 提前移入最终结果集）
     * [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] 参与笛卡尔积时，会被正常拼接
     * - [...seq, ...[]] = [...seq]，相当于只保留 seq
     * - 例如：[[a]] × [[], [b]] → [[a], [a,b]]
     * - 这正是 option/many 需要的行为：可以跳过或执行
     *
     * 🔧 优化策略：
     * 1. 先计算可拼接长度，避免拼接超长数据
     * 2. seq 级别去重，提前跳过重复分支
     * 3. 修复循环逻辑，逐个数组处理
     * 4. 长度达到 FIRST_K 的序列立即移入最终结果集，不再参与后续计算
     * 5. 所有序列都达到 FIRST_K 时提前结束，跳过剩余数组
     */
    private cartesianProduct(arrays: string[][][]): string[][] {
        const t0 = Date.now()

        // 空数组，返回包含一个空序列的数组
        if (arrays.length === 0) {
            return [[]]
        }

        // 只有一个数组，直接返回（可能包含空分支）
        if (arrays.length === 1) {
            const duration = Date.now() - t0
            this.perfAnalyzer.record('cartesianProduct', duration, 1, arrays[0].length)
            return arrays[0]
        }

        // 性能监控统计
        const perfStats = {
            totalBranches: 0,           // 总分支数
            skippedByLength: 0,         // 因长度已满跳过的
            skippedByDuplicate: 0,      // 因重复跳过的（seq级别）
            actualCombined: 0,          // 实际拼接的
            maxResultSize: 0,           // 最大结果集大小
            movedToFinal: 0,            // 移入最终结果集的数量
            arrayDedupTotal: 0,         // 数组层面去重总数
            arrayOriginalTotal: 0       // 数组原始总数
        }

        // 初始结果为第一个数组
        let result = arrays[0].filter(item => item.length < EXPANSION_LIMITS.FIRST_K)
        let finalResult = arrays[0].filter(item => item.length >= EXPANSION_LIMITS.FIRST_K).map(item => item.join(','))

        // 最终结果集（长度已达 FIRST_K 的序列）
        const finalResultSet = new Set<string>(finalResult)

        // 逐个处理后续数组
        for (let i = 1; i < arrays.length; i++) {
            this.checkTimeout(`cartesianProduct-数组${i}/${arrays.length}`)

            let currentArray = arrays[i]

            console.log(`    [笛卡尔积-步骤${i}/${arrays.length - 1}] result(${result.length}) × currentArray(${currentArray.length})`)

            // 🔧 优化：数组层面提前去重
            // 如果数组较大且包含重复，提前去重可以显著减少后续计算
            const arrayDedupStats = {
                originalSize: currentArray.length,
                dedupedSize: 0,
                skippedDuplicates: 0
            }

            // 只对较大数组进行去重（避免小数组的去重开销）
            if (currentArray.length > 100) {
                const arrayDedupSet = new Set<string>()
                const dedupedArray: string[][] = []

                for (const branch of currentArray) {
                    const branchKey = branch.join(',')
                    if (!arrayDedupSet.has(branchKey)) {
                        arrayDedupSet.add(branchKey)
                        dedupedArray.push(branch)
                    } else {
                        arrayDedupStats.skippedDuplicates++
                    }
                }

                currentArray = dedupedArray
                arrayDedupStats.dedupedSize = currentArray.length

                // 更新总体统计
                perfStats.arrayOriginalTotal += arrayDedupStats.originalSize
                perfStats.arrayDedupTotal += arrayDedupStats.skippedDuplicates

                // 如果去重效果显著，输出日志
                if (arrayDedupStats.skippedDuplicates > 1000) {
                    console.log(`🔧 [数组 ${i}/${arrays.length - 1}] 数组层面去重: 原始=${arrayDedupStats.originalSize}, 去重后=${arrayDedupStats.dedupedSize}, 消除重复=${arrayDedupStats.skippedDuplicates} (${((arrayDedupStats.skippedDuplicates / arrayDedupStats.originalSize) * 100).toFixed(2)}%)`)
                }
            }

            const temp: string[][] = []

            // console.log(result.length)
            // console.log(result.slice(0,10))
            // console.log(currentArray.length)
            // console.log(currentArray.slice(0,10))
            // console.log(currentArray.length * result.length)
            // 遍历当前结果的每个序列
            let seqIndex = 0
            const totalSeqs = result.length
            for (const seq of result) {
                seqIndex++

                // 每处理1000个seq输出一次进度
                if (seqIndex % 1000 === 0 || seqIndex === totalSeqs) {
                    console.log(`      [处理seq进度] ${seqIndex}/${totalSeqs}, temp累积: ${temp.length}`)
                    this.checkTimeout(`cartesianProduct-seq${seqIndex}`)
                }

                // 防御检查：不应该出现超长序列
                if (seq.length > EXPANSION_LIMITS.FIRST_K) {
                    throw new Error('系统错误：序列长度超过限制')
                }

                // seq 级别的去重集合
                const seqDeduplicateSet = new Set<string>()

                // 计算当前 seq 的可拼接长度
                const availableLength = EXPANSION_LIMITS.FIRST_K - seq.length

                // 情况1：seq 已达到 FIRST_K，直接放入最终结果集
                if (availableLength === 0) {
                    const seqKey = seq.join(',')
                    finalResultSet.add(seqKey)
                    perfStats.movedToFinal++
                    perfStats.skippedByLength += currentArray.length
                    continue  // 不再参与后续计算
                }

                // 情况2：seq 超过 FIRST_K（不应该发生，已有防御检查）
                if (availableLength < 0) {
                    throw new Error('系统错误：可拼接长度为负')
                }

                // 情况3：seq 长度 < FIRST_K，继续拼接
                for (const branch of currentArray) {
                    perfStats.totalBranches++

                    // 提前截取 branch
                    const truncatedBranch = branch.slice(0, availableLength)

                    // 序列化用于去重
                    const branchKey = truncatedBranch.join(',')

                    // seq 级别去重
                    if (seqDeduplicateSet.has(branchKey)) {
                        perfStats.skippedByDuplicate++
                        continue
                    }

                    seqDeduplicateSet.add(branchKey)

                    // 拼接
                    const combined: string[] = [].concat(seq).concat(truncatedBranch)

                    // 检查拼接后的长度
                    if (combined.length > EXPANSION_LIMITS.FIRST_K) {
                        throw new Error('系统错误：笛卡尔积拼接后长度超过限制')
                    }

                    // 判断拼接后是否达到 FIRST_K
                    if (combined.length === EXPANSION_LIMITS.FIRST_K) {
                        // 达到最大长度，放入最终结果集
                        const combinedKey = combined.join(',')
                        finalResultSet.add(combinedKey)
                        perfStats.movedToFinal++
                    } else {
                        // 未达到最大长度，放入 temp 继续参与后续计算
                        temp.push(combined)
                    }

                    perfStats.actualCombined++

                    // 防止结果集爆炸
                    if (temp.length + finalResultSet.size > 1000000) {
                        console.warn(`⚠️ 笛卡尔积结果超过100万 (arrays[${i}/${arrays.length - 1}])`)
                        console.warn(`   temp: ${temp.length}, finalResultSet: ${finalResultSet.size}`)
                        console.warn(`   性能统计:`, perfStats)
                        throw new Error('笛卡尔积结果过大（超过100万）')
                    }
                }
            }

            // 更新结果为本轮笛卡尔积（只包含未达到 FIRST_K 的）
            result = temp

            // 更新统计
            perfStats.maxResultSize = Math.max(perfStats.maxResultSize, result.length + finalResultSet.size)

            // 输出本轮统计
            console.log(`    [步骤${i}完成] 新result: ${result.length}, finalResult: ${finalResultSet.size}, 总计: ${result.length + finalResultSet.size}`)

            // 监控
            if (result.length + finalResultSet.size > 100000) {
                console.warn(`⚠️ 笛卡尔积中间结果较大: temp=${result.length}, final=${finalResultSet.size} (数组 ${i}/${arrays.length - 1})`)
            }

            // 优化：如果 result 为空且还有后续数组，可以提前结束
            if (result.length === 0 && finalResultSet.size > 0) {
                // console.log(`✅ 所有序列已达 FIRST_K，跳过剩余 ${arrays.length - i - 1} 个数组的计算`)
                break
            }
        }

        // 合并最终结果：finalResultSet + result
        const finalArray: string[][] = []

        // 1. 将 Set 中的字符串转回二维数组
        for (const seqStr of finalResultSet) {
            if (seqStr === '') {
                finalArray.push([])  // 空序列
            } else {
                finalArray.push(seqStr.split(','))
            }
        }

        // 2. 添加未达到 FIRST_K 的序列
        finalArray.push(...result)

        // 最终验证
        for (const resultElement of finalArray) {
            if (resultElement.length > EXPANSION_LIMITS.FIRST_K) {
                throw new Error('系统错误：最终结果长度超过限制')
            }
        }

        // 输出性能统计
        /*if (perfStats.maxResultSize > 10000 || perfStats.skippedByDuplicate > 1000 || perfStats.movedToFinal > 1000 || perfStats.arrayDedupTotal > 0) {
            console.log(`📊 笛卡尔积性能统计:`)

            // 数组层面去重统计
            if (perfStats.arrayDedupTotal > 0) {
                console.log(`   [数组去重] 原始总数: ${perfStats.arrayOriginalTotal}, 消除重复: ${perfStats.arrayDedupTotal} (${((perfStats.arrayDedupTotal / perfStats.arrayOriginalTotal) * 100).toFixed(2)}%)`)
            }

            // 计算统计
            console.log(`   总分支数: ${perfStats.totalBranches}`)
            console.log(`   因长度已满跳过: ${perfStats.skippedByLength}`)
            console.log(`   因重复跳过(seq级别): ${perfStats.skippedByDuplicate}`)
            console.log(`   实际拼接: ${perfStats.actualCombined}`)
            console.log(`   移入最终结果集: ${perfStats.movedToFinal}`)
            console.log(`   最终结果: finalSet=${finalResultSet.size}, temp=${result.length}, total=${finalArray.length}`)

            // 计算优化效果
            const seqLevelOptimization = perfStats.totalBranches > 0 ? ((perfStats.skippedByDuplicate / perfStats.totalBranches) * 100).toFixed(2) : '0.00'
            console.log(`   seq级别优化率: ${seqLevelOptimization}%`)

            // 计算总体节省的计算量
            if (perfStats.arrayDedupTotal > 0 && result.length > 0) {
                const savedCalculations = perfStats.arrayDedupTotal * result.length
                console.log(`   💡 数组去重节省计算: ${savedCalculations.toLocaleString()} 次循环`)
            }
        }*/

        // 记录性能数据
        const duration = Date.now() - t0
        const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0)
        this.perfAnalyzer.record('cartesianProduct', duration, inputSize, finalArray.length)

        return finalArray
    }


    /**
     * 计算节点的完全展开 First 集合（用于 Or 冲突检测）
     *
     * @param node AST 节点
     * @returns 完全展开的 First 集合（只包含叶子节点）
     */
    public computeNodeFirst(node: SequenceNode): Set<string> {
        // 默认使用 First(1)
        return this.computeNodeFirstK(node, 1)
    }

    /**
     * 计算节点的 First(k) 集合（支持任意 k 值）
     *
     * @param node AST 节点
     * @param k First(k) 的 k 值
     * @returns 完全展开的 First(k) 集合（只包含叶子节点序列）
     */
    public computeNodeFirstK(node: SequenceNode, k: number = 1): Set<string> {
        // 清空循环检测集合（即使没有规则名，子规则可能有）
        this.recursiveDetectionSet.clear()

        // 🔍 调试日志：检查节点结构
        const nodeRuleName = (node as any).ruleName

        // 调用通用展开方法，传入对应的 k 值
        let paths: string[][]
        try {
            // 使用 expandPathsByDFS 方法，传入 firstK 参数
            paths = this.expandPathsByDFS(null, node, k, 0, EXPANSION_LIMITS.INFINITY, false)

            // 🔍 调试日志：检查路径结果
            if (nodeRuleName && (nodeRuleName === 'BreakableStatement' || nodeRuleName === 'IterationStatement')) {
                console.log(`   🔍 路径数: ${paths.length}`)
                if (paths.length === 0) {
                    console.log(`   ⚠️ 路径为空！`)
                } else if (paths.length <= 10) {
                    paths.forEach((path, idx) => {
                        console.log(`   🔍 路径 ${idx + 1}: [${path.join(', ')}]`)
                    })
                } else {
                    console.log(`   🔍 路径太多，只显示前 5 个`)
                    paths.slice(0, 5).forEach((path, idx) => {
                        console.log(`   🔍 路径 ${idx + 1}: [${path.join(', ')}]`)
                    })
                }
            }
        } catch (e) {
            if (nodeRuleName && (nodeRuleName === 'BreakableStatement' || nodeRuleName === 'IterationStatement')) {
                console.log(`   ❌ 异常: ${e.message}`)
                console.log(`   ❌ 堆栈: ${e.stack}`)
            }
            throw e
        }

        // 根据 k 值提取符号序列
        const expandedSet = new Set<string>()

        if (k === 1) {
            // First(1)：只提取第一个符号
            for (const path of paths) {
                if (path.length > 0) {
                    expandedSet.add(path[0])
                }
            }
        } else {
            // First(k)：提取前 k 个符号的序列
            for (const path of paths) {
                // 取前 k 个符号（如果路径长度小于 k，就取整个路径）
                const firstK = path.slice(0, k)
                if (firstK.length > 0) {
                    // 将符号序列转换为字符串（用于比较）
                    expandedSet.add(firstK.join(' '))
                }
            }
        }

        // 🔍 调试日志：检查 First 集合
        if (nodeRuleName && (nodeRuleName === 'BreakableStatement' || nodeRuleName === 'IterationStatement')) {
            console.log(`   First(${k}) 集合: ${Array.from(expandedSet).slice(0, 10).join(', ')}${expandedSet.size > 10 ? '...' : ''}`)
        }

        return expandedSet
    }


    /**
     * 深度优先展开（DFS - Depth-First Search）
     *
     * 🚀 算法：递归深入，自然展开到token
     *
     * 适用场景：
     * - maxLevel = INFINITY（无限层级）
     * - 需要完全展开到token
     * - 适合 First(K) + 完全展开
     *
     * 优势：
     * - 递归处理AST，代码简洁
     * - 自然深入到叶子节点
     * - 配合 firstK 截取，可提前终止部分分支
     *
     * @param node - AST 节点（可选）
     * @param ruleName - 规则名（可选）
     * @param firstK - 取前 K 个符号
     * @param curLevel - 当前层级（默认 0）
     * @param maxLevel - 最大展开层级（通常为 Infinity）
     * @param isFirstPosition - 是否在第一个位置（用于左递归检测）
     * @returns 展开后的路径数组 string[][]
     *
     * 调用方式：
     * - expandPathsByDFS(node, null, firstK, curLevel, maxLevel) - 传入节点
     * - expandPathsByDFS(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
     *
     * 核心逻辑：递归处理 AST 节点
     * - consume: 返回 [[tokenName]]
     * - subrule: 递归展开
     * - sequence: 笛卡尔积组合子节点
     * - or: 合并所有分支
     * - option/many: 添加空分支
     */
    private expandPathsByDFS(
        ruleName: string | null,
        node: RuleNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = false,
        // 是否在第一个位置（用于左递归检测）
    ): string[][] {
        // DFS 总是无限展开

        // 如果传入规则名，转发给 subRuleHandler 处理
        if (ruleName) {
            return this.subRuleHandler(ruleName, firstK, curLevel, maxLevel, isFirstPosition)
        }
        // 根据节点类型分发处理
        switch (node.type) {
            case 'consume':
                // Token 节点：直接返回 token 名
                return [[node.tokenName]]

            case 'subrule':
                // 子规则引用：转发给 subRuleHandler 处理
                return this.subRuleHandler(node.ruleName, firstK, curLevel, maxLevel, isFirstPosition)

            case 'or':
                // Or 节点：遍历所有分支，合并结果
                // 🔴 关键：Or 分支中的第一个规则也需要传递 isFirstPosition
                return this.expandOr(node.alternatives, firstK, curLevel, maxLevel, isFirstPosition)

            case 'sequence':
                // Sequence 节点：笛卡尔积组合子节点
                return this.expandSequenceNode(node, firstK, curLevel, maxLevel, isFirstPosition);

            case 'option':
            case 'many':
                // Option/Many 节点：0次或多次，添加空分支
                // 🔴 关键：Option 内的第一个规则也需要传递 isFirstPosition
                return this.expandOption(node.node, firstK, curLevel, maxLevel, isFirstPosition)

            case 'atLeastOne':
                // AtLeastOne 节点：1次或多次，添加 double 分支
                // 🔴 关键：AtLeastOne 内的第一个规则也需要传递 isFirstPosition
                return this.expandAtLeastOne(node.node, firstK, curLevel, maxLevel, isFirstPosition)

            default:
                // 未知节点类型，抛出错误
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }
    }

    /**
     * 展开 Sequence 节点
     *
     * 核心逻辑：
     * - First(1)：只展开第1个子节点
     * - First(K)：笛卡尔积展开所有子节点，然后截取
     *
     * ⚠️ 重要：空分支在 sequence 中的处理
     * - 如果子节点包含空分支 []（来自 option/many）
     * - 笛卡尔积会正常处理：[[a]] × [[], [b]] → [[a], [a,b]]
     * - 空分支不会被过滤，会正常参与笛卡尔积
     *
     * @param node
     * @param firstK
     * @param curLevel
     * @param maxLevel
     * @param isFirstPosition 是否在第一个位置（用于左递归检测）
     */
        // 超时检测相关
    private operationStartTime: number = 0
    private currentProcessingRule: string = ''
    private timeoutSeconds: number = 20

    private checkTimeout(location: string): void {
        if (!this.operationStartTime) return

        const elapsed = (Date.now() - this.operationStartTime) / 1000
        if (elapsed > this.timeoutSeconds) {
            const errorMsg = `
❌ ========== 操作超时 ==========
超时位置: ${location}
当前规则: ${this.currentProcessingRule}
已耗时: ${elapsed.toFixed(2)}秒
超时阈值: ${this.timeoutSeconds}秒

建议：
1. 检查是否存在笛卡尔积爆炸
2. 检查是否有循环递归未被检测
3. 查看日志最后处理的规则和子节点
================================`
            console.error(errorMsg)
            throw new Error(`操作超时: ${elapsed.toFixed(2)}秒 (超时位置: ${location})`)
        }
    }

    private expandSequenceNode(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true
    ) {
        this.checkTimeout('expandSequenceNode-开始')

        // 获取规则名（用于日志和错误提示）
        const ruleName = (node as any).ruleName || '(unnamed)'

        // 检查是否为空序列
        if (node.nodes.length === 0) {
            // 空序列，返回包含一个空分支
            return [[]]
        }

        // First(K)：需要笛卡尔积
        // ⚠️⚠️⚠️ 双重优化策略：
        //
        // 优化1：硬性上限 - slice(0, firstK)
        // - 最多只展开前 firstK 个子节点
        // - 例如：firstK=2，最多展开前2个，后续节点完全不看
        //
        // 优化2：累加提前停止 - 在前 firstK 个节点内提前停止
        // - 原理：笛卡尔积后的最短路径 = 各子节点最短分支的拼接
        // - 如果累加的最短长度 >= firstK，后续节点不影响截取后的结果
        // - 可能只展开1个或几个节点就够了
        //
        // 示例1：sequence([a,b,c], [d], [e], [f])  firstK=2
        //   优化1：slice(0,2) → 最多展开 [a,b,c], [d]
        //   优化2：
        //     1. [a,b,c] → [[a,b,c]]，最短=3
        //        累加：3 >= 2 ✅ 停止！只展开1个节点
        //   笛卡尔积：[[a,b,c]]
        //   截取到2：[[a,b]]
        //
        // 示例2：sequence([a], or([b]/[c,d]), [e])  firstK=3
        //   优化1：slice(0,3) → 最多展开前3个
        //   优化2：
        //     1. [a] → [[a]]，最短=1，累加=1 < 3，继续
        //     2. or([b]/[c,d]) → [[b],[c,d]]，最短=1，累加=2 < 3，继续
        //     3. [e] → [[e]]，最短=1，累加=3 >= 3 ✅ 停止
        //   笛卡尔积：[[a]] × [[b],[c,d]] × [[e]] = [[a,b,e],[a,c,d,e]]
        //   截取到3：[[a,b,e],[a,c,d]]
        //
        // 示例3：包含空分支 sequence([a], option([b]), [c,d])  firstK=2
        //   优化1：slice(0,2) → 最多展开前2个
        //   优化2：
        //     1. [a] → [[a]]，最短=1，累加=1 < 2，继续
        //     2. option([b]) → [[],[b]]，最短=0（空分支！），累加=1 < 2，继续
        //   累加不够，需要展开第3个节点，但 slice(0,2) 限制了
        //   笛卡尔积：[[a]] × [[],[b]] = [[a],[a,b]]
        //   截取到2：[[a],[a,b]]（不需要截取）
        //
        // ✅ 双重保护：
        // - 最坏情况：展开 firstK 个节点（优化1）
        // - 最好情况：展开 1 个节点（优化2）
        // - 平均情况：展开 < firstK 个节点

        // ⚠️⚠️⚠️ 双重优化策略：
        // 1. 第一层保护：slice(0, firstK) - 最多展开 firstK 个节点
        // 2. 第二层优化：累加提前停止 - 在 firstK 个节点内提前停止

        // 🔴 新增：计算需要展开到的索引（考虑 option/many 不计入必需元素）
        let requiredCount = 0  // 非 option/many 的计数
        let expandToIndex = node.nodes.length  // 默认全部展开

        // 遍历找到第 firstK 个必需元素的位置
        for (let i = 0; i < node.nodes.length; i++) {
            const child = node.nodes[i]

            // 非 option/many 才计数
            if (child.type !== 'option' && child.type !== 'many') {
                requiredCount++

                // 找到第 firstK 个必需元素
                if (requiredCount >= firstK) {
                    // 包含当前元素，所以是 i + 1
                    expandToIndex = i + 1
                    break
                }
            }

        }

        // 使用计算出的索引进行截取（替换原来的简单 firstK）
        // const nodesToExpand = node.nodes.slice(0, firstK)
        const nodesToExpand = node.nodes.slice(0, expandToIndex)

        const allBranches: string[][][] = []
        let minLengthSum = 0  // 累加的最短长度

        // 遍历前 firstK 个子节点，累加最短分支长度
        for (let i = 0; i < nodesToExpand.length; i++) {
            this.checkTimeout(`expandSequenceNode-子节点${i + 1}`)

            const childNode = nodesToExpand[i]
            // 展开当前子节点
            // 💡 传递累积的位置信息：父级是第1个 AND 当前也是第1个
            let branches = this.expandPathsByDFS(
                null,
                nodesToExpand[i],
                firstK,
                curLevel,
                maxLevel,
                isFirstPosition && i === 0  // 累积位置：只有当父级和当前都是第1个时才是 true
            )

            // 如果 branches 为空（可能是左递归检测返回的空数组）
            if (branches.length === 0) {
                // 左递归情况，返回空分支
                return []
            }

            branches = branches.map(item => item.slice(0, firstK));
            allBranches.push(branches);

            console.log(`  [allBranches] 当前总数: ${allBranches.length} 组`)

            // 找到当前子节点的最短分支长度（安全写法）
            let minLength = Infinity;
            for (const b of branches) {
                const len = b.length;
                if (len < minLength) {
                    minLength = len;
                    if (minLength === 0) break; // 已经最小，提前结束
                }
            }

            minLengthSum += minLength;

            console.log(`  [累加长度] 当前: ${minLengthSum}, firstK: ${firstK}`)

            // 如果累加的最短长度 >= firstK，可以停止
            if (minLengthSum >= firstK) {
                console.log(`  [提前停止] 累加长度已满足`)
                break;
            }
        }

        // 如果没有展开任何节点（可能是左递归检测返回的空数组）
        if (allBranches.length === 0) {
            // 左递归情况，返回空分支
            return []
        }

        // 笛卡尔积组合子节点（只对需要的节点做笛卡尔积）
        // 例如：[[a,b]] × [[c]] → [[a,b,c]]
        // ⚠️ 如果包含空分支：[[a]] × [[], [b]] → [[a], [a,b]]

        // 🔍 计算笛卡尔积大小估计
        let estimatedSize = 1
        const branchSizes: number[] = []
        for (const branches of allBranches) {
            branchSizes.push(branches.length)
            estimatedSize *= branches.length
            // 已取消笛卡尔积大小限制
            // if (estimatedSize > 1000000) {
            //     console.error(`❌ [笛卡尔积] 估计大小超限: ${estimatedSize}`)
            //     console.error(`   当前规则: ${ruleName}`)
            //     console.error(`   allBranches 详情:`)
            //     allBranches.forEach((br, idx) => {
            //         console.error(`     [${idx}]: ${br.length} 个分支`)
            //     })
            //     throw new Error(`笛卡尔积爆炸: 估计大小 ${estimatedSize} 超过限制`)
            // }
        }

        console.log(`  [笛卡尔积] 规则: ${ruleName}`)
        console.log(`  [笛卡尔积] 数组数量: ${allBranches.length}, 各数组大小: [${branchSizes.join(', ')}]`)
        console.log(`  [笛卡尔积] 估计结果大小: ${branchSizes.join(' × ')} = ${estimatedSize}`)
        this.checkTimeout(`笛卡尔积-${ruleName}`)
        const result = this.cartesianProduct(allBranches)
        console.log(`  [笛卡尔积] 完成, 实际结果: ${result.length} 个路径`)
        this.checkTimeout(`笛卡尔积完成-${ruleName}`)

        // 笛卡尔积后路径可能超过 firstK，需要截取并去重
        // 注意：如果某些节点包含空分支，笛卡尔积后可能产生不同长度的路径
        return this.truncateAndDeduplicate(result, firstK)
    }


    /**
     * 广度优先展开（BFS - Breadth-First Search）
     *
     * 🚀 算法：逐层循环，精确控制层数
     * 🔥 优化：增量复用 - 从最近的缓存层级开始，而非每次从 level 1 开始
     *
     * 适用场景：
     * - maxLevel = 具体值（如 3, 5）
     * - 需要展开到指定层级
     * - 适合 First(∞) + 限制层数
     *
     * 设计理念：
     * - BFS 只负责按层级完整展开（firstK=∞）
     * - 不负责截取操作
     * - 截取由外层调用者统一处理
     *
     * 优化策略：
     * - 增量复用：level3 = level2 + 展开1层
     * - 缓存查找：从 maxLevel-1 → maxLevel-2 → ... → level 1
     * - 跳过中间计算：避免重复展开低层级
     *
     * @param ruleName 顶层规则名
     * @param maxLevel 目标层级
     * @returns 展开到目标层级的完整路径（不截取）
     *
     * 核心逻辑（增量展开）：
     * 1. 查找最近的缓存层级（maxLevel-1, maxLevel-2, ..., 1）
     * 2. 从最近的缓存开始展开（而非总是从 level 1）
     * 3. 每次展开1层：调用 expandSinglePath
     * 4. 分离已完成（全token）和未完成（含规则名）的路径
     * 5. 继续展开未完成的路径
     * 6. 达到目标层级后停止
     *
     * 示例：
     * 展开 level 4：
     *   - 查找 level 3 缓存 → 找到 ✅
     *   - level 3 + 展开1层 = level 4
     *   - 节省：level 1→2→3 的计算
     */
    private expandPathsByBFS(
        ruleName: string,
        maxLevel: number
    ): string[][] {
        const t0 = Date.now()

        console.log(`\n📊 [BFS展开] 规则: ${ruleName}, 目标层级: ${maxLevel}`)

        // 记录统计
        this.perfAnalyzer.cacheStats.bfsOptimization.totalCalls++

        // 🔧 优化：尝试从 BFS 缓存直接获取目标层级的结果
        const cacheKey = `${ruleName}:${maxLevel}`

        if (maxLevel <= EXPANSION_LIMITS.LEVEL_K) {
            if (this.bfsLevelCache.has(cacheKey)) {
                // ✅ BFS 缓存命中，直接返回完整结果
                console.log(`   ✅ 缓存命中: ${cacheKey}`)
                return this.bfsLevelCache.get(cacheKey)!
            }
        }

        // 🔥 增量优化：查找最近的缓存层级
        let startLevel = 1
        let currentPaths: string[][] | null = null

        console.log(`   🔍 查找最近的缓存层级...`)
        for (let searchLevel = maxLevel - 1; searchLevel >= 1; searchLevel--) {
            const searchKey = `${ruleName}:${searchLevel}`
            if (this.bfsLevelCache.has(searchKey)) {
                startLevel = searchLevel
                currentPaths = this.bfsLevelCache.get(searchKey)!

                // 记录优化统计
                const skippedLevels = searchLevel - 1
                this.perfAnalyzer.cacheStats.bfsOptimization.skippedLevels += skippedLevels
                this.perfAnalyzer.cacheStats.bfsOptimization.fromCachedLevel++

                console.log(`   ✅ 找到缓存: level ${searchLevel} (${currentPaths.length} 条路径)`)
                console.log(`   🚀 优化: 跳过 ${skippedLevels} 层计算（level 1~${searchLevel}），直接从 level ${searchLevel} 开始`)
                break
            }
        }

        // 如果没有找到缓存，从 level 1 开始
        if (currentPaths === null) {
            console.log(`   ⚠️  无缓存，从 level 1 开始展开`)
            startLevel = 1
            currentPaths = this.getDirectChildren(ruleName)

            // 记录统计：从 level 1 开始
            this.perfAnalyzer.cacheStats.bfsOptimization.fromLevel1++
        }

        const initialPathsCount = currentPaths.length
        let finishedPaths: string[][] = []  // 已经全是 token 的路径

        // 🔥 优化：从 startLevel 开始展开，而非总是从 level 1
        // 计算需要展开多少层
        const levelsToExpand = maxLevel === EXPANSION_LIMITS.INFINITY
            ? EXPANSION_LIMITS.INFINITY
            : (maxLevel - startLevel)

        // 防御检查
        if (levelsToExpand < 0) {
            throw new Error(`系统错误：levelsToExpand < 0 (startLevel=${startLevel}, maxLevel=${maxLevel})`)
        }

        console.log(`   📈 需要展开层数: ${levelsToExpand} (从 level ${startLevel} → level ${maxLevel})`)

        let expandedLevels = 0

        // 广度优先展开
        while (expandedLevels < levelsToExpand) {
            // 当前实际层级 = startLevel + expandedLevels
            const actualCurrentLevel = startLevel + expandedLevels

            // 当前实际层级 = startLevel + expandedLevels（循环前已定义）
            // 下一层级 = actualCurrentLevel + 1
            const nextLevel = actualCurrentLevel + 1
            const levelCacheKey = `${ruleName}:${nextLevel}`

            console.log(`\n   [层级 ${actualCurrentLevel} → ${nextLevel}]`)

            // ========================================
            // 步骤0：检查下一层级是否有完整缓存
            // ========================================
            // 🔧 优化：检查下一层级是否有 BFS 缓存
            let usedLevelCache = false
            if (nextLevel <= EXPANSION_LIMITS.LEVEL_K &&
                this.bfsLevelCache.has(levelCacheKey)) {
                // ✅ 缓存命中：直接使用下一层级的缓存数据
                // 注意：不能直接 continue，需要经过分离逻辑更新 finishedPaths
                currentPaths = this.bfsLevelCache.get(levelCacheKey)!
                usedLevelCache = true
                console.log(`      ✅ 层级缓存命中: ${levelCacheKey} (${currentPaths.length} 条路径)`)
            } else {
                console.log(`      ⚠️  层级缓存未命中: ${levelCacheKey}`)
            }

            // ========================================
            // 步骤1：分离已完成和未完成的路径
            // ========================================
            const pathsToExpand: string[][] = []
            const pathsFinished: string[][] = []

            for (const path of currentPaths) {
                // 检查当前路径是否全部是 token
                const isAllTokens = path.every(symbol => this.tokenCache.has(symbol))

                if (isAllTokens) {
                    // 已完成：全部是 token，无需继续展开
                    pathsFinished.push(path)
                } else {
                    // 未完成：还有规则名，需要继续展开
                    pathsToExpand.push(path)
                }
            }

            // 将已完成的路径移到 finishedPaths
            finishedPaths.push(...pathsFinished)

            console.log(`      分离结果: 已完成=${pathsFinished.length}, 待展开=${pathsToExpand.length}`)

            // ========================================
            // 步骤2：如果使用了层级缓存或没有需要展开的路径，跳过展开
            // ========================================
            if (usedLevelCache || pathsToExpand.length === 0) {
                // 情况1：使用了层级缓存，currentPaths 已经是下一层级的数据
                // 情况2：所有路径都已完成，停止展开
                expandedLevels++
                if (pathsToExpand.length === 0) {
                    console.log(`      ✅ 所有路径已完成，停止展开`)
                    break  // 所有路径都已完成，退出循环
                }
                console.log(`      ⏭️  使用层级缓存，跳过展开，进入下一层`)
                continue  // 进入下一轮（层级缓存的情况）
            }

            // ========================================
            // 步骤3：展开未完成的路径（使用缓存方法）
            // ========================================

            console.log(`      🔧 开始展开 ${pathsToExpand.length} 条路径...`)

            // 对每个路径展开1层（带缓存）
            const expandedPaths: string[][] = []

            // 🔧 优化：使用索引，为每个路径位置建立缓存
            for (let pathIndex = 0; pathIndex < pathsToExpand.length; pathIndex++) {
                const path = pathsToExpand[pathIndex]

                // 🔑 BFS 只做完整展开，不截取（firstK=∞）
                const expanded = this.expandSinglePathCached(
                    ruleName,
                    path,
                    actualCurrentLevel,
                    pathIndex,
                    EXPANSION_LIMITS.INFINITY  // BFS 始终完整展开
                )
                expandedPaths.push(...expanded)
            }

            console.log(`      📊 展开结果: ${expandedPaths.length} 条路径（展开前 ${pathsToExpand.length}）`)

            // 去重
            const beforeDedup = expandedPaths.length
            currentPaths = this.deduplicate(expandedPaths)
            console.log(`      🔄 去重: ${beforeDedup} → ${currentPaths.length}`)

            // 🔧 缓存当前层级的结果（BFS 只缓存完整版）
            if (nextLevel <= EXPANSION_LIMITS.LEVEL_K) {
                if (!this.bfsLevelCache.has(levelCacheKey)) {
                    this.bfsLevelCache.set(levelCacheKey, currentPaths)
                    console.log(`      💾 缓存设置: ${levelCacheKey} (${currentPaths.length} 条)`)
                }
            }

            expandedLevels++
        }

        // ========================================
        // 步骤4：合并已完成和未完成的路径
        // ========================================
        // BFS 只做完整合并，不截取
        const result = [...finishedPaths, ...currentPaths]
        console.log(`\n   📦 合并路径: 已完成=${finishedPaths.length}, 未完成=${currentPaths.length}, 总计=${result.length}`)

        // 只去重，不截取
        const finalResult = this.deduplicate(result)
        console.log(`   🔄 最终去重: ${result.length} → ${finalResult.length}`)

        // ========================================
        // 步骤5：缓存最终结果（BFS 只缓存完整版）
        // ========================================
        if (maxLevel <= EXPANSION_LIMITS.LEVEL_K) {
            if (!this.bfsLevelCache.has(cacheKey)) {
                this.bfsLevelCache.set(cacheKey, finalResult)
                console.log(`   💾 最终缓存设置: ${cacheKey} (${finalResult.length} 条路径)`)
            }
        }

        // 记录性能数据
        const duration = Date.now() - t0
        this.perfAnalyzer.record('expandPathsByBFS', duration, initialPathsCount, finalResult.length)

        console.log(`   ⏱️  耗时: ${duration}ms`)
        console.log(`   📊 优化效果: 从 level ${startLevel} 开始（跳过 ${startLevel - 1} 层），展开 ${expandedLevels} 层`)
        console.log(`   📈 路径变化: ${initialPathsCount} → ${finalResult.length}\n`)

        return finalResult
    }

    /**
     * 展开单个路径（带缓存版本，双层缓存策略）
     *
     * 缓存策略：
     * 1. 完整缓存（key="ruleName:level:pathIndex"）- 不截取的完整结果
     * 2. 截取缓存（key="ruleName:level:pathIndex:firstK"）- 截取到firstK的结果
     *
     * 查找顺序：
     * - 优先查找完整缓存（可复用于不同的firstK）
     * - 如果未命中，查找截取缓存
     * - 都未命中则计算
     *
     * @param ruleName 顶层规则名
     * @param path 当前路径
     * @param level 当前层级
     * @param pathIndex 路径在当前层级的索引
     * @param firstK 截取长度
     * @returns 展开后的路径列表
     */
    private expandSinglePathCached(
        ruleName: string,
        path: string[],
        level: number,
        pathIndex: number,
        firstK: number
    ): string[][] {
        // 🔑 构建缓存键
        const fullKey = `${ruleName}:${level}:${pathIndex}`
        const truncatedKey = `${ruleName}:${level}:${pathIndex}:${firstK}`

        // ========================================
        // 阶段1：查找完整缓存
        // ========================================
        if (this.expandSinglePathFullCache.has(fullKey)) {
            // ✅ 完整缓存命中
            this.perfAnalyzer.recordCacheHit('expandOneLevel')
            const fullResult = this.expandSinglePathFullCache.get(fullKey)!

            // 如果需要截取，截取后返回
            if (firstK !== EXPANSION_LIMITS.INFINITY) {
                // 截取并缓存截取结果（可选优化）
                const truncated = this.truncateAndDeduplicate(fullResult, firstK)
                // 缓存截取结果，下次可以直接命中
                this.expandSinglePathTruncatedCache.set(truncatedKey, truncated)
                return truncated
            }

            // 不需要截取，直接返回
            return fullResult
        }

        // ========================================
        // 阶段2：查找截取缓存（仅当需要截取时）
        // ========================================
        if (firstK !== EXPANSION_LIMITS.INFINITY) {
            if (this.expandSinglePathTruncatedCache.has(truncatedKey)) {
                // ✅ 截取缓存命中
                this.perfAnalyzer.recordCacheHit('expandOneLevelTruncated')
                return this.expandSinglePathTruncatedCache.get(truncatedKey)!
            }
        }

        // ========================================
        // 阶段3：缓存未命中，实际计算
        // ========================================

        // 🔧 修复：记录缓存未命中
        if (firstK !== EXPANSION_LIMITS.INFINITY) {
            this.perfAnalyzer.recordCacheMiss('expandOneLevelTruncated')
        } else {
            this.perfAnalyzer.recordCacheMiss('expandOneLevel')
        }

        // 始终计算完整结果（不截取）
        const fullResult = this.expandSinglePath(path, EXPANSION_LIMITS.INFINITY)

        // 缓存完整结果
        this.expandSinglePathFullCache.set(fullKey, fullResult)

        // 如果需要截取
        if (firstK !== EXPANSION_LIMITS.INFINITY) {
            const truncated = this.truncateAndDeduplicate(fullResult, firstK)
            // 缓存截取结果
            this.expandSinglePathTruncatedCache.set(truncatedKey, truncated)
            return truncated
        }

        // 不需要截取，返回完整结果
        return fullResult
    }

    /**
     * 展开单个路径中的规则名（展开1层）
     *
     * @param path 单个路径（可能包含 token 和规则名）
     * @param firstK 只展开前 firstK 个位置，后面的直接截断
     * @returns 展开后的所有可能路径
     *
     * 示例：
     * path = [If, LParen, Expression, RParen, Statement], firstK = 3
     * → 只展开前3个: [If, LParen, Expression]
     * → Expression 的直接子节点: [[Identifier], [BinaryExpr], ...]
     * → 笛卡尔积: [[If, LParen, Identifier], [If, LParen, BinaryExpr], ...]
     * → 后面的 RParen, Statement 被忽略（超过 firstK）
     *
     * 注意：只展开1层，使用 getDirectChildren
     */
    private expandSinglePath(path: string[], firstK: number): string[][] {
        const allBranches: string[][][] = []

        // ✅ 优化：只展开前 firstK 个位置
        const symbolsToExpand = path.slice(0, firstK)

        // 遍历需要展开的符号
        for (const symbol of symbolsToExpand) {
            if (this.ruleASTs.has(symbol)) {
                // 是规则名，获取其直接子节点（展开1层）
                const branches = this.getDirectChildren(symbol)
                allBranches.push(branches)
            } else {
                // 是 token，保持不变
                allBranches.push([[symbol]])
            }
        }

        // 笛卡尔积组合（已经只包含前 firstK 个位置）
        return this.cartesianProduct(allBranches)
    }

    /**
     * 获取规则的直接子节点（展开1层）
     *
     * @param ruleName 规则名
     * @returns 直接子节点的所有路径（展开1层）
     *
     * 优先级：
     * 1. 从 bfsLevelCache 获取 "ruleName:1"（如果已初始化）
     * 2. 动态计算并缓存
     *
     * 示例：
     * - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
     * - IfStatement → [[If, LParen, Expression, RParen, Statement]]
     */
    private getDirectChildren(ruleName: string): string[][] {
        console.log(`\n🔍 [getDirectChildren] 规则: ${ruleName}`)

        // 1. 优先从 bfsLevelCache 获取 level 1 的数据（懒加载缓存）
        const key = `${ruleName}:${EXPANSION_LIMITS.LEVEL_1}`
        if (this.bfsLevelCache.has(key)) {
            this.perfAnalyzer.recordCacheHit('getDirectChildren')
            const cached = this.bfsLevelCache.get(key)!
            console.log(`   ✅ 缓存命中: ${key} (${cached.length} 条路径)`)
            return cached
        }

        // 缓存未命中，需要动态计算
        this.perfAnalyzer.recordCacheMiss('getDirectChildren')
        console.log(`   ⚠️  缓存未命中: ${key}`)

        // 2. 检查是否是 token
        const tokenNode = this.tokenCache?.get(ruleName)
        if (tokenNode && tokenNode.type === 'consume') {
            const result = [[ruleName]]  // token 直接返回
            // 缓存 token 的结果
            this.bfsLevelCache.set(key, result)
            console.log(`   📌 Token: ${ruleName}，缓存结果`)
            return result
        }

        // 3. 获取规则的 AST 节点
        const subNode = this.getRuleNodeByAst(ruleName)
        if (!subNode) {
            throw new Error(`系统错误：规则不存在: ${ruleName}`)
        }

        console.log(`   🔧 动态计算: 展开1层...`)

        // 4. 动态计算：展开1层
        // expandPathsByDFS → subRuleHandler 会自动缓存到 "ruleName:1"
        const t0 = Date.now()
        const result = this.expandPathsByDFSCache(
            ruleName,
            EXPANSION_LIMITS.INFINITY,
            0,
            EXPANSION_LIMITS.LEVEL_1,
            false,
        )
        const duration = Date.now() - t0

        // 缓存计算结果（懒加载填充）
        if (!this.bfsLevelCache.has(key)) {
            this.bfsLevelCache.set(key, result)
            console.log(`   💾 缓存填充: ${key} (${result.length} 条路径，耗时 ${duration}ms)`)
        }

        return result
    }


    /**
     * 子规则处理器
     *
     * 职责：
     * 1. 递归防护（防止无限递归）
     * 2. 层级限制（控制展开深度）
     * 3. 获取规则 AST 并递归展开
     * 4. 左递归检测（检测规则是否在第一个位置递归）
     *
     * @param ruleName 规则名
     * @param firstK 截取长度
     * @param curLevel 当前层级
     * @param maxLevel 最大展开层级
     * @param isFirstPosition 是否在第一个位置（用于区分左递归和普通递归）
     */
    private subRuleHandler(
        ruleName: string,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true,
    ) {
        // 记录入口调用
        const t0 = Date.now()
        this.perfAnalyzer.cacheStats.subRuleHandlerTotal++

        // 层级+1（进入子规则）
        curLevel++

        // 防御：规则名不能为空
        if (!ruleName) {
            throw new Error('系统错误')
        }

        // 层级限制检查（BFS 需要）
        if (curLevel > maxLevel && maxLevel !== EXPANSION_LIMITS.INFINITY) {
            // 返回规则名本身（达到最大深度）
            this.perfAnalyzer.cacheStats.levelLimitReturn++
            return [[ruleName]]
        }

        // ========================================
        // 🎯 核心路由：尽早分流 DFS 和 BFS
        // ========================================

        if (maxLevel === EXPANSION_LIMITS.INFINITY) {
            // 🔴 DFS 模式：深度优先展开（无限层级）
            // 递归检测和左递归检测在 handleDFS 内部进行
            return this.expandPathsByDFSCache(ruleName, firstK, curLevel, maxLevel, isFirstPosition)
        } else {
            // 🔵 BFS 模式：广度优先展开（限制层级）
            // BFS 有层级限制，不需要递归检测
            return this.expandPathsByBFSCache(ruleName, maxLevel)
        }
    }

    /**
     * 处理 DFS 模式（深度优先展开，无限层级）
     *
     * @param ruleName 规则名
     * @param firstK 截取数量
     * @param curLevel 当前层级
     * @param maxLevel
     * @param isFirstPosition 是否在第一个位置（用于左递归检测）
     * @returns 展开结果
     */
    private expandPathsByDFSCache(
        ruleName: string,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean
    ): string[][] {
        const t0 = Date.now()

        // ========================================
        // 阶段1：DFS 缓存查找（在递归检测之前！）
        // ========================================

        if (firstK === EXPANSION_LIMITS.FIRST_1) {
            // 优先查找 first1 缓存
            if (this.dfsFirst1Cache.has(ruleName)) {
                this.perfAnalyzer.recordCacheHit('dfsFirst1')
                const duration = Date.now() - t0
                this.perfAnalyzer.record('subRuleHandler', duration)
                return this.dfsFirst1Cache.get(ruleName)!
            }

            // first1 未命中，尝试从 firstK 缓存截取
            if (this.dfsFirstKCache.has(ruleName)) {
                this.perfAnalyzer.recordCacheHit('dfsFirst1')
                const firstKData = this.dfsFirstKCache.get(ruleName)!
                // 从 firstK 截取到 first1
                const first1Data = firstKData.map(path => path.slice(0, 1))
                const result = this.deduplicate(first1Data)
                // 缓存 first1 结果
                this.dfsFirst1Cache.set(ruleName, result)
                const duration = Date.now() - t0
                this.perfAnalyzer.record('subRuleHandler', duration)
                return result
            }
            // 🔧 修复：记录缓存未命中
            this.perfAnalyzer.recordCacheMiss('dfsFirst1')

        } else if (firstK === EXPANSION_LIMITS.FIRST_K) {
            // 查找 firstK 缓存
            if (this.dfsFirstKCache.has(ruleName)) {
                this.perfAnalyzer.recordCacheHit('dfsFirstK')
                const duration = Date.now() - t0
                this.perfAnalyzer.record('subRuleHandler', duration)
                return this.dfsFirstKCache.get(ruleName)!
            }
            // 🔧 修复：记录缓存未命中
            this.perfAnalyzer.recordCacheMiss('dfsFirstK')
        } else if (firstK === EXPANSION_LIMITS.INFINITY) {
            if (maxLevel === EXPANSION_LIMITS.INFINITY) {
                throw new Error(`系统错误：不支持的参数组合 firstK=${firstK}, maxLevel=${maxLevel}`)
                // firstK=INFINITY, maxLevel=INFINITY 的情况暂不缓存
                // 这种情况通常只在特殊场景使用
            } else if (maxLevel !== EXPANSION_LIMITS.LEVEL_1) {
                throw new Error(`系统错误：不支持的参数组合 firstK=${firstK}, maxLevel=${maxLevel}`)
            }
        }

        // ========================================
        // 阶段2：递归检测（DFS 专属）
        // ========================================

        // 递归检测：如果规则正在计算中
        if (this.recursiveDetectionSet.has(ruleName)) {
            // 区分左递归和普通递归
            if (isFirstPosition) {
                // 在第一个位置递归 → 左递归！
                // 检查是否已经记录过这个规则的左递归错误
                if (!this.detectedLeftRecursionErrors.has(ruleName)) {
                    // 创建左递归错误对象
                    const error: LeftRecursionError = {
                        level: 'FATAL',
                        type: 'left-recursion',
                        ruleName,
                        branchIndices: [],
                        conflictPaths: {pathA: '', pathB: ''},
                        message: `规则 "${ruleName}" 存在左递归`,
                        suggestion: '' // 稍后在外层填充
                    }

                    // 添加到错误 Map
                    this.detectedLeftRecursionErrors.set(ruleName, error)
                }

                // 返回空数组，中断当前分支的计算
                this.perfAnalyzer.cacheStats.recursiveReturn++
                return []
            } else {
                // 不在第一个位置递归 → 普通递归
                // 返回规则名，防止无限递归
                this.perfAnalyzer.cacheStats.recursiveReturn++
                return [[ruleName]]
            }
        }

        // 标记当前规则正在计算（防止循环递归）
        this.recursiveDetectionSet.add(ruleName)

        try {
            // ========================================
            // 阶段3：DFS 实际计算（缓存未命中）
            // ========================================

            this.perfAnalyzer.recordActualCompute()

            // 使用 DFS 从头展开到 token
            const subNode = this.getRuleNodeByAst(ruleName)
            const finalResult = this.expandPathsByDFS(null, subNode, firstK, curLevel, maxLevel, isFirstPosition)

            // ========================================
            // 阶段4：DFS 缓存设置（在任何层级都缓存！）
            // ========================================

            if (firstK === EXPANSION_LIMITS.FIRST_K) {
                // DFS 主缓存：计算和缓存 firstK
                if (!this.dfsFirstKCache.has(ruleName)) {
                    // 🔧 注意：这里不应该 recordCacheMiss，因为未命中已经在前面记录过了
                    this.dfsFirstKCache.set(ruleName, finalResult)
                }

                // 顺便派生 first1 缓存（从 firstK 截取）
                if (!this.dfsFirst1Cache.has(ruleName)) {
                    const first1Data = finalResult.map(path => path.slice(0, 1))
                    const first1Result = this.deduplicate(first1Data)
                    this.dfsFirst1Cache.set(ruleName, first1Result)
                }
            } else if (firstK === EXPANSION_LIMITS.FIRST_1) {
                // first1 不应该单独计算，但为了向后兼容仍然缓存
                if (!this.dfsFirst1Cache.has(ruleName)) {
                    // 🔧 注意：这里不应该 recordCacheMiss，因为未命中已经在前面记录过了
                    this.dfsFirst1Cache.set(ruleName, finalResult)
                }
            }

            /*else if (firstK === EXPANSION_LIMITS.INFINITY) {
                if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
                    const key = ruleName + `:${EXPANSION_LIMITS.LEVEL_1}`
                    if (!this.bfsLevelCache.has(key)) {
                        // 🔧 注意：这里不应该 recordCacheMiss，因为未命中已经在前面记录过了
                        this.bfsLevelCache.set(key, finalResult)
                    }
                }
                // firstK=INFINITY, maxLevel=INFINITY 暂不缓存
            }*/

            // 记录性能
            const duration = Date.now() - t0
            this.perfAnalyzer.record('subRuleHandler', duration)

            return finalResult
        } finally {
            // 清除递归标记（确保即使异常也能清除）
            this.recursiveDetectionSet.delete(ruleName)
        }
    }

    /**
     * 处理 BFS 模式（广度优先展开，限制层级）
     *
     * @param ruleName 规则名
     * @param curLevel 当前层级
     * @param maxLevel 最大层级（具体值）
     * @returns 展开结果
     */
    private expandPathsByBFSCache(
        ruleName: string,
        maxLevel: number
    ): string[][] {
        const t0 = Date.now()

        // ========================================
        // 阶段1：BFS 缓存查找
        // ========================================

        let finalResult: string[][] | undefined

        // BFS 缓存：只在 maxLevel <= LEVEL_K 时查找
        if (maxLevel <= EXPANSION_LIMITS.LEVEL_K) {
            const fullKey = `${ruleName}:${maxLevel}`

            if (this.bfsLevelCache.has(fullKey)) {
                // BFS 缓存命中（完整版）
                this.perfAnalyzer.recordCacheHit('bfsLevel')
                finalResult = this.bfsLevelCache.get(fullKey)!
            } else {
                // 缓存未命中
                this.perfAnalyzer.recordCacheMiss('bfsLevel')
            }
        }

        // ========================================
        // 阶段2：BFS 实际计算（缓存未命中）
        // ========================================

        if (!finalResult) {
            this.perfAnalyzer.recordActualCompute()

            // 调用 BFS 展开（内部从 level 1 开始）
            const fullResult = this.expandPathsByBFS(ruleName, maxLevel)

            // 缓存完整版（BFS 专属）
            if (maxLevel <= EXPANSION_LIMITS.LEVEL_K) {
                const fullKey = `${ruleName}:${maxLevel}`
                if (!this.bfsLevelCache.has(fullKey)) {
                    this.bfsLevelCache.set(fullKey, fullResult)
                }
            }

            finalResult = fullResult
        }

        // ========================================
        // 阶段3：去重并返回
        // ========================================

        finalResult = this.deduplicate(finalResult)

        // 记录性能
        const duration = Date.now() - t0
        this.perfAnalyzer.record('subRuleHandler', duration)

        return finalResult
    }

    /**
     * 去重：移除重复的分支
     *
     * 例如：[[a,b], [c,d], [a,b]] → [[a,b], [c,d]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] 会被序列化为空字符串 ""
     * - 空分支不会被过滤，会正常参与去重
     * - 例如：[[], [a], []] → [[], [a]]
     */
    private deduplicate(branches: string[][]): string[][] {
        // 用于记录已经见过的分支（序列化为字符串）
        const seen = new Set<string>()
        // 存储去重后的结果
        const result: string[][] = []

        // 遍历所有分支
        for (const branch of branches) {
            // 将分支序列化为字符串（用作 Set 的 key）
            // ⚠️ 空分支 [] 会被序列化为 ""，不会被过滤
            const key = branch.join(',')
            // 检查是否已经存在
            if (!seen.has(key)) {
                // 未见过，添加到 Set 和结果中
                // ⚠️ 空分支 [] 也会被添加到结果中
                seen.add(key)
                result.push(branch)
            }
            // 已见过，跳过
        }

        // 返回去重后的结果（可能包含空分支 []）
        return result
    }

    /**
     * 截取并去重：先截取到 firstK，再去重
     *
     * 使用场景：笛卡尔积后路径变长，需要截取
     *
     * 例如：[[a,b,c], [d,e,f]], firstK=2 → [[a,b], [d,e]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] slice(0, firstK) 还是 []
     * - 空分支不会被过滤，会正常参与去重
     * - 例如：[[], [a,b,c]], firstK=2 → [[], [a,b]]
     *
     * 🔧 优化：如果 firstK=INFINITY，不需要截取，只去重
     */
    private truncateAndDeduplicate(branches: string[][], firstK: number): string[][] {
        // 如果 firstK 为 INFINITY，不需要截取，只去重
        if (firstK === EXPANSION_LIMITS.INFINITY) {
            return this.deduplicate(branches)
        }

        // 截取每个分支到 firstK
        const truncated = branches.map(branch => branch.slice(0, firstK))

        // 去重（截取后可能产生重复分支）
        return this.deduplicate(truncated)
    }

    /**
     * 展开 Or 节点
     *
     * 核心逻辑：合并所有分支的展开结果
     *
     * 例如：or(abc / de) firstK=2
     *   → abc 展开为 [[a,b]]
     *   → de 展开为 [[d,e]]
     *   → 合并为 [[a,b], [d,e]]
     *
     * ⚠️ 重要：空分支在 or 中的处理
     * - 如果某个分支是 option/many，可能包含空分支 []
     * - 例如：or(option(a) / b)
     *   → option(a) 展开为 [[], [a]]
     *   → b 展开为 [[b]]
     *   → 合并为 [[], [a], [b]]
     * - 空分支会被正常保留，不会被过滤
     *
     * 注意：不需要截取，因为子节点已保证长度≤firstK
     *
     * 🔴 关键：Or 分支中的每个替代也是"第一个位置"
     * - 在 PEG 的选择中，每个分支都是独立的起点
     * - Or 分支内的第一个规则需要检测左递归
     * - 例如：A → A '+' B | C
     *   - 第一个分支 A '+' B 中，A 在第一个位置，需要检测
     *   - 第二个分支 C 中，C 也在第一个位置
     */
    private expandOr(
        alternatives: RuleNode[],
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 Or 分支中的第一个规则也需要检测
    ): string[][] {
        // 防御：如果 or 没有分支
        if (alternatives.length === 0) {
            throw new Error('系统错误：Or 节点没有分支')
        }

        // 存储所有分支的展开结果
        let result: string[][] = []

        // 遍历 Or 的每个选择分支
        for (const alt of alternatives) {
            // 🔴 关键：每个 Or 分支都是独立的起点，第一个位置的规则需要检测左递归
            const branches = this.expandPathsByDFS(null, alt, firstK, curLevel, maxLevel, isFirstPosition)
            result = result.concat(branches)
        }

        // 防御：如果所有分支都没有结果
        if (result.length === 0) {
            throw new Error('系统错误：Or 节点所有分支都没有结果')
        }

        // 只去重，不截取（子节点已经处理过截取）
        return this.deduplicate(result)
    }


    /**
     * 展开 Option/Many 节点
     *
     * option(X) = ε | X（0次或1次）
     * many(X) = ε | X | XX | XXX...（0次或多次）
     *
     * First 集合：
     * First(option(X)) = {ε} ∪ First(X)
     * First(many(X)) = {ε} ∪ First(X)
     *
     * 例如：option(abc) firstK=2
     *   → abc 展开为 [[a,b]]
     *   → 结果为 [[], [a,b]]（空分支 + 内部分支）
     *
     * ⚠️⚠️⚠️ 关键：空分支 [] 的重要性 ⚠️⚠️⚠️
     * - 空分支 [] 表示 option/many 可以跳过（0次）
     * - 空分支在后续处理中不会被过滤：
     *   1. deduplicate：[] join(',') = ""，正常去重
     *   2. cartesianProduct：[...seq, ...[]] = [...seq]，正常拼接
     *   3. truncateAndDeduplicate：[] slice(0,k) = []，正常截取
     * - 空分支必须保留，否则 option/many 的语义就错了！
     *
     * 注意：不需要截取，因为子节点已保证长度≤firstK
     *
     * 🔴 关键：Option 内的规则也需要检测左递归
     * - 虽然 option(X) 可以跳过，但当内部有递归时也是左递归
     * - 例如：A → option(A) B
     *   - option(A) 中的 A 在第一个位置，需要检测左递归
     */
    private expandOption(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 Option 内的第一个规则也需要检测
    ): string[][] {
        // 递归展开内部节点，传递所有必需参数
        const innerBranches = this.expandPathsByDFS(null, node, firstK, curLevel, maxLevel, isFirstPosition)

        // ⚠️⚠️⚠️ 关键：添加空分支 [] 表示可以跳过（0次）
        // 空分支必须在第一个位置，表示优先匹配空（PEG 顺序选择）
        const result = [[], ...innerBranches]

        // 只去重，不截取（子节点已经处理过截取）
        return this.deduplicate(result)
    }

    /**
     * 展开 AtLeastOne 节点
     *
     * atLeastOne(X) = X | XX | XXX...（至少1次）
     *
     * First 集合：
     * First(atLeastOne(X)) = First(X) ∪ First(XX)
     *
     * 例如：atLeastOne(ab) firstK=3
     *   → ab 展开为 [[a,b]]
     *   → 1次：[[a,b]]
     *   → 2次：[[a,b,a,b]] 截取到3 → [[a,b,a]]
     *   → 结果为 [[a,b], [a,b,a]]
     *
     * ⚠️ 重要：空分支说明
     * - atLeastOne 至少执行1次，不会产生空分支 []
     * - 与 option/many 不同，atLeastOne 的结果不包含 []
     * - 但如果内部节点包含空分支（来自嵌套的 option/many）：
     *   例如：atLeastOne(option(a))
     *   → option(a) 展开为 [[], [a]]
     *   → 1次：[[], [a]]
     *   → 2次：[[], [a]] × 2 → [[], [a]]（空分支拼接还是空分支）
     *   → 结果为 [[], [a]]
     * - 空分支会被正常保留，不会被过滤
     *
     * 注意：doubleBranches 需要内部截取，因为拼接后会超过 firstK
     *
     * 🔴 关键：AtLeastOne 内的规则也需要检测左递归
     */
    private expandAtLeastOne(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 AtLeastOne 内的第一个规则也需要检测
    ): string[][] {
        // 递归展开内部节点（1次的情况），传递所有必需参数
        const innerBranches = this.expandPathsByDFS(null, node, firstK, curLevel, maxLevel, isFirstPosition)

        // 生成 doubleBranches（2次的情况）
        const doubleBranches = innerBranches.map(branch => {
            // 拼接两次（例如：[a,b] → [a,b,a,b]）
            // ⚠️ 如果 branch 是空分支 []，则 [...[], ...[]] = []
            const doubled = [...branch, ...branch]
            // 截取到 firstK（防止超长）
            // ⚠️ 空分支 [] slice(0, firstK) 还是 []
            return doubled.slice(0, firstK)
        })

        // 合并1次和2次的结果（可能包含空分支 []）
        const result = [...innerBranches, ...doubleBranches]

        // 只去重，不再截取（已经在内部截取过了）
        // ⚠️ deduplicate 不会过滤空分支 []
        return this.deduplicate(result)
    }

    /**
     * 生成左递归修复建议
     *
     * @param ruleName 规则名
     * @param node 规则节点
     * @param firstSet First 集合
     * @returns 修复建议
     */
    private getLeftRecursionSuggestion(
        ruleName: string,
        node: RuleNode,
        firstSet: Set<string>
    ): string {
        // 分析规则结构，提供具体建议
        if (node.type === 'or') {
            return `PEG 不支持左递归！请将左递归改为右递归，或使用 Many/AtLeastOne。

示例：
  ❌ 左递归（非法）：
     ${ruleName} → ${ruleName} '+' Term | Term

  ✅ 右递归（合法）：
     ${ruleName} → Term ('+' Term)*

  或使用 Many：
     ${ruleName} → Term
     ${ruleName}Suffix → '+' Term
     完整形式 → ${ruleName} ${ruleName}Suffix*

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(', ')}${firstSet.size > 5 ? ', ...' : ''}}
包含 ${ruleName} 本身，说明存在左递归。`
        }

        return `PEG 不支持左递归！请重构语法以消除左递归。

First(${ruleName}) = {${Array.from(firstSet).slice(0, 5).join(', ')}${firstSet.size > 5 ? ', ...' : ''}}
包含 ${ruleName} 本身，说明存在左递归。`
    }
}

