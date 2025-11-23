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
    FIRST_K: 3,

    LEVEL_1: 1,
    LEVEL_K: 3,

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

    // ========================================
    // BFS（广度优先）专属缓存
    // 适用：maxLevel = 具体值（限制层数，按层级展开）
    // 特点：BFS 只负责按层级展开，不负责截取
    // ========================================

    /** BFS 缓存：key="ruleName"（完整展开，不截取，所有层级聚合） */
    private bfsAllCache = new Map<string, string[][]>()
    /** BFS 缓存：key="ruleName:level"（完整展开，不截取） */
    private bfsLevelCache = new Map<string, string[][]>()

    /** 性能分析器 */
    private perfAnalyzer = new PerformanceAnalyzer()

    /** 收集检测过程中发现的左递归错误（使用 Map 提高查重性能） */
    private detectedLeftRecursionErrors = new Map<string, LeftRecursionError>()

    /** 配置选项 */
    private options: Required<GrammarAnalyzerOptions>

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

        // 遍历所有规则
        for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
            perfStats.rulesChecked++
            const error = this.checkOrConflictsInNodeSmart(ruleName, ruleAST, perfStats)
            if (error) {
                orConflictErrors.push(error)
            }
        }

        perfStats.totalTime = Date.now() - startTime

        return orConflictErrors
    }


    /**
     * 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * @param ruleName 规则名
     * @param node 当前节点
     * @param perfStats 性能统计
     */
    private checkOrConflictsInNodeSmart(
        ruleName: string,
        node: RuleNode,
        perfStats?: any
    ) {
        let error
        switch (node.type) {
            case 'or':
                // 步骤2：使用智能检测（深度前缀冲突检测）
                if (perfStats) perfStats.orNodesChecked++
                error = this.detectOrBranchConflictsWithCache(ruleName, node)
                if (error) return error

                // 递归检查每个分支
                for (const alt of node.alternatives) {
                    error = this.checkOrConflictsInNodeSmart(ruleName, alt, perfStats)
                    if (error) return error
                }
                break

            case 'sequence':
                // 递归检查序列中的每个节点
                for (const child of node.nodes) {
                    error = this.checkOrConflictsInNodeSmart(ruleName, child, perfStats)
                    if (error) return error
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检查内部节点
                error = this.checkOrConflictsInNodeSmart(ruleName, node.node, perfStats)
                if (error) return error
                break

            case 'consume':
            case 'subrule':
                // 叶子节点，不需要递归
                break
        }
    }


    /**
     * 获取 Or 节点所有分支的完整路径（深度展开）
     *
     * 核心逻辑：
     * 1. 展开每个分支到第一层（得到规则名序列）
     * 2. 从 cache 获取每个规则的所有路径
     * 3. 笛卡尔积组合，得到分支的所有可能路径
     * 4. 返回每个分支的路径集合
     *
     * @param orNode - Or 节点
     * @param firstK
     * @param cache - 规则缓存（规则名 → 所有路径）
     * @returns 每个分支的路径集合数组
     */
    getOrNodeAllBranchRules(orNode: OrNode, firstK: number, cache: Map<string, string[][]>): string[][] {
        // 存储每个分支的路径集合
        const allOrs: string[][] = []

        // 遍历 Or 的每个分支
        for (const seqNode of orNode.alternatives) {
            // 步骤1：展开分支到第一层（得到规则名序列）
            // 例如：sequence(If, Expression, Block) → [['If', 'Expression', 'Block']]
            const nodeAllBranches = this.expandNode(seqNode, EXPANSION_LIMITS.INFINITY, 0, 1, false)

            // 存储当前分支的所有路径字符串
            let setAry: string[] = []

            // 遍历第一层展开的每个可能性
            for (const branch of nodeAllBranches) {
                // 步骤2：从 cache 获取每个规则的所有路径
                // 例如：['If', 'Expression'] → [[If的路径], [Expression的路径]]
                const seqAllBranches = branch.map(rule => {
                    const paths = cache.get(rule)
                    // 防御：如果规则不在缓存中，返回 [[rule]]
                    return paths || [[rule]]
                })

                // 步骤3：笛卡尔积组合，得到当前分支的所有可能路径
                // 例如：[[a,b], [c,d]] × [[e], [f,g]] → [[a,b,e], [a,b,f,g], [c,d,e], [c,d,f,g]]
                const branchAllSeq = this.cartesianProduct(seqAllBranches, firstK)

                // 步骤4：转换为字符串（用于 Set 去重）
                const branchAllSeqStrAry = branchAllSeq.map(item => item.join(','))

                // 🔴 修复：concat 不会修改原数组，需要用 push
                setAry = setAry.concat(branchAllSeqStrAry)
            }

            // 去重并添加到结果
            allOrs.push(Array.from(new Set(setAry)))
        }

        return allOrs
    }

    /**
     * 检测两个路径集合是否有完全相同的路径（单向检测）
     *
     * ⚠️ 检测方向：只检测 pathsFront 与 pathsBehind 是否有相同的路径
     *
     * 🚀 性能优化：使用 Set 实现 O(n) 时间复杂度
     *
     * 示例：
     * ```
     * pathsFront = ['A,B', 'C,D']
     * pathsBehind = ['A,B', 'E,F']
     * 结果：'A,B' 完全相同 → 返回 'A,B'
     * ```
     *
     * @param pathsFront - 前面分支的路径数组
     * @param pathsBehind - 后面分支的路径数组
     * @returns 第一个相同的路径，如果没有返回 null
     */
    private findEqualPath(
        pathsFront: string[],
        pathsBehind: string[]
    ): string | null {
        // 使用 Set 快速检测（O(n)）
        const setBehind = new Set(pathsBehind)

        for (const pathFront of pathsFront) {
            if (setBehind.has(pathFront)) {
                // 找到完全相同的路径
                return pathFront
            }
        }

        // 没有相同的路径
        return null
    }

    /**
     * 检测两个路径集合是否有前缀包含关系（单向检测）
     *
     * ⚠️ 检测方向：只检测 pathsFront 的某个路径是否是 pathsBehind 某个路径的前缀
     *
     * 前缀定义：
     * - 'A,B' 是 'A,B,C' 的前缀 ✅
     * - 'A,B' 不是 'A,B' 的前缀 ❌（完全相同不算前缀）
     * - 'A,B' 不是 'A' 的前缀 ❌（不检测反向）
     *
     * ⚠️ 性能：O(n²)，需要遍历所有路径对
     *
     * 示例：
     * ```
     * pathsFront = ['A,B']
     * pathsBehind = ['A,B,C', 'D,E']
     * 结果：'A,B' 是 'A,B,C' 的前缀 → 返回 { prefix: 'A,B', full: 'A,B,C' }
     * ```
     *
     * @param pathsFront - 前面分支的路径数组
     * @param pathsBehind - 后面分支的路径数组
     * @returns 第一个前缀关系，如果没有返回 null
     */
    private findPrefixRelation(
        pathsFront: string[],
        pathsBehind: string[]
    ): { prefix: string, full: string } | null {
        // 双层循环检测前缀关系（O(n²)）
        for (const pathFront of pathsFront) {
            for (const pathBehind of pathsBehind) {
                // 检测：前面的路径是否是后面路径的前缀
                // 注意：必须加 ',' 以确保是完整的 token 前缀
                // 例如：'If,LParen,Expression' 是 'If,LParen,Expression,RParen,Block' 的前缀
                if (pathBehind.startsWith(pathFront + ',')) {
                    return {
                        prefix: pathFront,
                        full: pathBehind
                    }
                }
            }
        }

        // 没有前缀关系
        return null
    }

    /**
     * 生成前缀冲突的修复建议
     *
     * @param ruleName - 规则名
     * @param branchA - 分支A索引
     * @param branchB - 分支B索引
     * @param conflict - 冲突信息
     * @returns 修复建议
     */
    private getPrefixConflictSuggestion(
        ruleName: string,
        branchA: number,
        branchB: number,
        conflict: { prefix: string, full: string, type: 'prefix' | 'equal' }
    ): string {
        if (conflict.type === 'equal') {
            return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`
        }

        return ``
    }

    /**
     * 线路1：使用 First(K) 检测 Or 分支冲突（智能检测）
     *
     * 检测逻辑：对每个路径对，根据长度选择检测方法
     * - 路径长度都等于 firstK：检测是否完全相同（findEqualPath）
     * - 前面路径长度 < firstK：检测是否是前缀（findPrefixRelation）
     *
     * 数据源：dfsFirstKCache（First(K) 的展开结果）
     *
     * @param ruleName 输出错误日志使用
     * @param orNode - Or 节点
     */
    detectOrBranchEqualWithFirstK(
        ruleName: string,
        orNode: OrNode
    ) {
        // 防御：至少需要2个分支
        if (orNode.alternatives.length < 2) {
            return
        }

        // 获取每个分支的 First(K) 路径集合
        const branchPathSets = this.getOrNodeAllBranchRules(orNode, EXPANSION_LIMITS.FIRST_K, this.dfsFirstKCache)
        const firstK = EXPANSION_LIMITS.FIRST_K

        // 单向遍历：检测前面的分支是否与后面的分支冲突
        for (let i = 0; i < branchPathSets.length; i++) {
            for (let j = i + 1; j < branchPathSets.length; j++) {
                const pathsFront = branchPathSets[i]
                const pathsBehind = branchPathSets[j]

                // 先尝试检测完全相同（快速，O(n)）
                const equalPath = this.findEqualPath(pathsFront, pathsBehind)
                if (equalPath) {
                    return {
                        level: 'ERROR',
                        type: 'or-identical-branches',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: equalPath,
                            pathB: equalPath
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 的前 ${firstK} 个 token 完全相同`,
                        suggestion: this.getEqualBranchSuggestion(ruleName, i, j, equalPath)
                    }
                }

                // 如果没有完全相同，再检测前缀关系（O(n²)）
                const prefixRelation = this.findPrefixRelation(pathsFront, pathsBehind)
                if (prefixRelation) {
                    return {
                        level: 'ERROR',
                        type: 'prefix-conflict',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: prefixRelation.prefix,
                            pathB: prefixRelation.full
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}（在 First(${firstK}) 阶段检测到）`,
                        suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
                            prefix: prefixRelation.prefix,
                            full: prefixRelation.full,
                            type: 'prefix'
                        })
                    }
                }
            }
        }
    }

    /**
     * 线路2：使用 MaxLevel 检测 Or 分支的前缀遮蔽关系
     *
     * 检测目标：前面的分支是否是后面分支的前缀
     * 数据源：bfsAllCache（深度展开的完整路径）
     * 检测方法：findPrefixRelation()
     * 性能：O(n²) - 深度检测
     *
     * 适用场景：
     * - 检测前缀遮蔽问题
     * - 需要深度展开才能发现的冲突
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     */
    detectOrBranchPrefixWithMaxLevel(
        ruleName: string,
        orNode: OrNode
    ) {
        // 防御：至少需要2个分支
        if (orNode.alternatives.length < 2) {
            return
        }

        // 获取每个分支的深度展开路径集合
        const branchPathSets = this.getOrNodeAllBranchRules(orNode, EXPANSION_LIMITS.INFINITY, this.bfsAllCache)

        // 单向遍历：检测前面的分支是否遮蔽后面的分支
        for (let i = 0; i < branchPathSets.length; i++) {
            for (let j = i + 1; j < branchPathSets.length; j++) {
                const pathsFront = branchPathSets[i]
                const pathsBehind = branchPathSets[j]

                // 检测前缀关系（O(n²)）
                const prefixRelation = this.findPrefixRelation(pathsFront, pathsBehind)

                if (prefixRelation) {
                    // 发现前缀遮蔽，报告错误
                    return ({
                        level: 'ERROR',
                        type: 'prefix-conflict',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: prefixRelation.prefix,
                            pathB: prefixRelation.full
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}`,
                        suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
                            prefix: prefixRelation.prefix,
                            full: prefixRelation.full,
                            type: 'prefix'
                        })
                    })
                }
            }
        }
    }

    /**
     * 生成相同分支的修复建议
     */
    private getEqualBranchSuggestion(
        ruleName: string,
        branchA: number,
        branchB: number,
        equalPath: string
    ): string {
        return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

检测到的问题：
  相同路径: ${equalPath}

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

修复建议：
1. **删除重复分支**：保留其中一个分支即可
2. **检查逻辑**：确认是否是复制粘贴错误
3. **合并分支**：如果语义相同，合并为一个分支

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`
    }

    /**
     * 完整的 Or 分支深度检测（使用缓存）- 带防御性校验
     *
     * 检测流程：
     * 1. 线路1：使用 First(K) 快速检测
     * 2. 如果发现"遮蔽"错误：使用 MaxLevel 深度检测进行验证（防御性编程）
     * 3. 如果发现"相同"错误：直接返回（不需要验证）
     *
     * 防御性编程：
     * - 如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
     * - 否则说明两个检测逻辑不一致，抛出错误
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     * @returns 检测到的错误，如果没有错误返回 undefined
     */
    /**
     * 完整的 Or 分支检测（First(K) 预检 + MaxLevel 深度检测）
     *
     * 业务逻辑：
     * 1. First(K) 预检：快速检测相同/遮蔽错误
     * 2. 有任何错误 → 执行 MaxLevel 深度检测
     * 3. 防御性检查：如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
     * 4. 返回结果：优先返回 MaxLevel 结果，如果没有则返回 First(K) 结果
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     * @returns 检测到的错误，如果没有错误返回 undefined
     */
    detectOrBranchConflictsWithCache(
        ruleName: string,
        orNode: OrNode
    ) {
        // 🚀 线路1：First(K) 预检（快速）
        let firstKError = this.detectOrBranchEqualWithFirstK(ruleName, orNode)

        // 情况1：预检通过，没有发现错误
        if (!firstKError) {
            // 直接返回，无需深度检测
            return
        }

        // 情况2：预检发现错误（相同/遮蔽），执行深度检测
        const maxLevelError = this.detectOrBranchPrefixWithMaxLevel(ruleName, orNode)

        // 🛡️ 防御性编程：如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
        if (firstKError.type === 'prefix-conflict') {
            if (!maxLevelError) {
                const errorMsg = `
🔴 ========== 防御性检查失败 ==========
规则: ${ruleName}
问题: First(K) 检测到遮蔽，但 MaxLevel 未检测到

First(K) 检测结果:
  类型: ${firstKError.type}
  分支: ${firstKError.branchIndices[0] + 1} → ${firstKError.branchIndices[1] + 1}
  前缀: ${firstKError.conflictPaths?.pathA}
  完整: ${firstKError.conflictPaths?.pathB}

MaxLevel 检测结果: 无冲突

可能原因:
1. First(K) 误报（检测逻辑错误）
2. MaxLevel 漏检（检测逻辑错误）
3. dfsFirstKCache 和 bfsAllCache 数据不一致
==========================================`
                console.error(errorMsg)
                throw new Error(`防御性检查失败: First(K) 检测到遮蔽但 MaxLevel 未检测到 (规则: ${ruleName})`)
            }
        }

        // 只返回遮蔽问题，非遮蔽不算问题
        return maxLevelError
    }


    /**
     * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @returns { errors: 验证错误列表, stats: 统计信息 }
     */
    initCacheAndCheckLeftRecursion(): { errors: ValidationError[], stats: any } {
        const totalStartTime = Date.now()
        
        // 统计对象
        const stats = {
            dfsFirstKTime: 0,  // First(K) 缓存生成用时
            bfsMaxLevelTime: 0,  // MaxLevel 缓存生成用时
            orDetectionTime: 0,  // Or 冲突检测用时
            leftRecursionCount: 0,  // 左递归错误数量
            orConflictCount: 0,  // Or 分支冲突数量
            totalTime: 0,  // 总用时
            dfsFirstKCacheSize: 0,  // dfsFirstKCache 大小
            bfsAllCacheSize: 0,  // bfsAllCache 大小
            firstK: 0,  // First(K) 的 K 值
            cacheUsage: {
                dfsFirstK: { hit: 0, miss: 0, total: 0, hitRate: 0 },
                getDirectChildren: { hit: 0, miss: 0, total: 0, hitRate: 0 }
            }
        }

        // 1. 左递归检测（内部会初始化 DFS 缓存和 BFS 缓存）
        const ruleNames = Array.from(this.ruleASTs.keys())
        const t1 = Date.now()

        // 清空错误 Map
        this.detectedLeftRecursionErrors.clear()

        // 启动超时检测
        this.operationStartTime = Date.now()

        for (const ruleName of ruleNames) {
            // 清空递归检测集合
            this.recursiveDetectionSet.clear()
            this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.INFINITY, true)
        }

        // BFS 缓存预填充
        let totalFilled = 0

        // 预填充 level 1 到 level_k
        for (let level = 1; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
            for (const ruleName of ruleNames) {
                this.expandPathsByBFSCache(ruleName, level)
            }
        }

        // 聚合所有层级的数据到 bfsAllCache
        for (const ruleName of ruleNames) {
            const allLevelPaths: string[][] = []

            // 收集该规则的所有层级数据
            for (let level = 1; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
                const key = `${ruleName}:${level}`
                if (this.bfsLevelCache.has(key)) {
                    const levelPaths = this.bfsLevelCache.get(key)!
                    allLevelPaths.push(...levelPaths)
                }
            }

            // 去重并存入 bfsAllCache
            const deduplicated = this.deduplicate(allLevelPaths)
            
            // ⚠️ 问题所在：无论 deduplicated 是否为空，都会 set
            // 这导致 BFS 为所有规则名（包括未被引用的和 Token）都创建了缓存
            this.bfsAllCache.set(ruleName, deduplicated)
        }

        // 🔍 调试：检查缓存差异（仅用于内部统计，不输出）
        const dfsKeys = new Set(this.dfsFirstKCache.keys())
        const bfsKeys = new Set(this.bfsAllCache.keys())
        const onlyInDFS = Array.from(dfsKeys).filter(key => !bfsKeys.has(key))
        const onlyInBFS = Array.from(bfsKeys).filter(key => !dfsKeys.has(key))

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
        const stage1Time = t1End - t1
        
        // 记录统计信息
        stats.dfsFirstKTime = stage1Time  // DFS 包含 First(K) 缓存生成
        stats.bfsMaxLevelTime = stage1Time  // BFS 包含 MaxLevel 缓存生成（两者同时进行）
        stats.leftRecursionCount = this.detectedLeftRecursionErrors.size

        const leftRecursionErrors = Array.from(this.detectedLeftRecursionErrors.values())

        // 2. Or 分支冲突检测
        const t2 = Date.now()
        const orConflictErrors = this.checkAllOrConflicts()
        const t2End = Date.now()
        const stage2Time = t2End - t2
        
        // 记录 Or 检测统计
        stats.orDetectionTime = stage2Time
        stats.orConflictCount = orConflictErrors.length

        // 3. 合并所有错误（左递归优先）
        const allErrors: ValidationError[] = []
        allErrors.push(...leftRecursionErrors)
        allErrors.push(...orConflictErrors)

        // 5. 准备统计信息（不在这里输出，放到 error 对象中）
        stats.totalTime = Date.now() - totalStartTime
        stats.dfsFirstKCacheSize = this.dfsFirstKCache.size
        stats.bfsAllCacheSize = this.bfsAllCache.size
        stats.firstK = EXPANSION_LIMITS.FIRST_K
        
        // 收集缓存使用率统计
        const dfsFirstKStats = this.perfAnalyzer.cacheStats.dfsFirstK
        const getDirectChildrenStats = this.perfAnalyzer.cacheStats.getDirectChildren
        
        stats.cacheUsage = {
            dfsFirstK: {
                hit: dfsFirstKStats.hit,
                miss: dfsFirstKStats.miss,
                total: dfsFirstKStats.total,
                hitRate: dfsFirstKStats.total > 0 ? (dfsFirstKStats.hit / dfsFirstKStats.total * 100) : 0
            },
            getDirectChildren: {
                hit: getDirectChildrenStats.hit,
                miss: getDirectChildrenStats.miss,
                total: getDirectChildrenStats.total,
                hitRate: getDirectChildrenStats.total > 0 ? (getDirectChildrenStats.hit / getDirectChildrenStats.total * 100) : 0
            }
        }

        // 返回错误列表和统计信息
        return {
            errors: allErrors,
            stats: stats
        }
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
    private cartesianProduct(arrays: string[][][], firstK: number): string[][] {
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
        let result = arrays[0].filter(item => item.length < firstK)
        let finalResult = arrays[0].filter(item => item.length >= firstK).map(item => item.join(','))

        // 最终结果集（长度已达 FIRST_K 的序列）
        const finalResultSet = new Set<string>(finalResult)

        // 逐个处理后续数组
        for (let i = 1; i < arrays.length; i++) {
            this.checkTimeout(`cartesianProduct-数组${i}/${arrays.length}`)

            let currentArray = arrays[i]

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

            // 遍历当前结果的每个序列
            let seqIndex = 0
            const totalSeqs = result.length
            for (const seq of result) {
                seqIndex++

                // 每处理1000个seq输出一次进度
                if (seqIndex % 1000 === 0 || seqIndex === totalSeqs) {
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
    private expandNode(
        node: RuleNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = false,
        // 是否在第一个位置（用于左递归检测）
    ): string[][] {
        // DFS 总是无限展开
        // 根据节点类型分发处理
        switch (node.type) {
            case 'consume':
                // Token 节点：直接返回 token 名
                return [[node.tokenName]]

            case 'subrule':
                // 子规则引用：转发给 subRuleHandler 处理
                return this.expandPathsByDFSCache(node.ruleName, firstK, curLevel, maxLevel, isFirstPosition)

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

            // 展开当前子节点
            // 💡 传递累积的位置信息：父级是第1个 AND 当前也是第1个
            let branches = this.expandNode(
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

            // 如果累加的最短长度 >= firstK，可以停止
            if (minLengthSum >= firstK) {
                break;
            }
        }

        // 如果没有展开任何节点（可能是左递归检测返回的空数组）
        if (allBranches.length === 0) {
            // 左递归情况，返回空分支
            return []
        }

        const result = this.cartesianProduct(allBranches, firstK)
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
    /**
     * BFS 展开（纯递归实现，智能缓存复用）
     *
     * 核心思想：
     * 1. 查找最大可用缓存块（如 level 3）
     * 2. 对缓存的每个路径中的规则名，递归调用自己
     * 3. 缓存并返回结果
     *
     * 示例：查找 A:10，缓存有 A:3
     * - 找到 A:3 = [a1, B, c1]
     * - 对 B 递归调用 expandPathsByBFSCache(B, 7, [B])
     *   - 找到 B:3 = [b1, C, c1]
     *   - 对 C 递归调用 expandPathsByBFSCache(C, 4, [C])
     *     - 找到 C:3 = [c1, D, c3]
     *     - 对 D 递归调用 expandPathsByBFSCache(D, 1, [D])
     *       - 返回 getDirectChildren(D)
     *     - 缓存 C:4 ✅
     *   - 缓存 B:7 ✅
     * - 缓存 A:10 ✅
     *
     * BFS 展开（纯净版，单方法递归实现）
     *
     * 核心逻辑：
     * 1. 查找 ruleName 的最近缓存
     * 2. 对缓存的每个路径中的规则名，递归调用自己
     * 3. 自动缓存中间结果
     *
     * 示例：查找 A:10，缓存有 A:3
     * - 查找 A:10 → 找到 A:3 = [[a1, B, c1]]
     * - 对 B 递归：expandPathsByBFSCacheClean(B, 7)
     *   - 查找 B:7 → 找到 B:3 = [[b1, C, d1]]
     *   - 对 C 递归：expandPathsByBFSCacheClean(C, 4)
     *     - 查找 C:4 → 找到 C:3 = [[c1, D, e1]]
     *     - 对 D 递归：expandPathsByBFSCacheClean(D, 1)
     *       → 返回 getDirectChildren(D)
     *     - 缓存 C:4 ✅
     *   - 缓存 B:7 ✅
     * - 缓存 A:10 ✅
     *
     * @param ruleName 规则名
     * @param targetLevel 目标层级
     * @returns 展开结果
     */
    private expandPathsByBFSCache(
        ruleName: string,
        targetLevel: number
    ): string[][] {
        // 防御检查
        if (targetLevel === 0) {
            throw new Error('系统错误')
        }
        // token，直接返回
        if (this.tokenCache.has(ruleName)) {
            return [[ruleName]]
        }
        // 基础情况：level 1
        if (targetLevel === EXPANSION_LIMITS.LEVEL_1) {
            return this.getDirectChildren(ruleName)
        }

        // 查找 ruleName 的最近缓存
        let cachedLevel = 1
        let cachedPaths: string[][] | null = null

        for (let level = Math.min(targetLevel, EXPANSION_LIMITS.LEVEL_K); level >= 2; level--) {
            const cacheKey = `${ruleName}:${level}`
            if (this.bfsLevelCache.has(cacheKey)) {
                cachedLevel = level
                cachedPaths = this.bfsLevelCache.get(cacheKey)!

                // 提前返回：找到目标层级
                if (level === targetLevel) {
                    return cachedPaths
                }
                break
            }
        }

        // 没有找到缓存（不应该发生）
        if (!cachedPaths) {
            cachedLevel = EXPANSION_LIMITS.LEVEL_1
            cachedPaths = this.getDirectChildren(ruleName)
        }

        // 计算剩余层数
        const remainingLevels = targetLevel - cachedLevel

        // 防御检查
        if (remainingLevels <= 0) {
            throw new Error('系统错误')
        }

        // 对 cachedPaths 的每个路径递归展开
        const expandedPaths: string[][] = []
        for (const path of cachedPaths) {
            const allBranches: string[][][] = []

            // 遍历路径中的每个符号，递归展开
            for (const symbol of path) {
                const result = this.expandPathsByBFSCache(symbol, remainingLevels)
                allBranches.push(result)
            }

            // 笛卡尔积组合
            const pathResult = this.cartesianProduct(allBranches, EXPANSION_LIMITS.INFINITY)
            expandedPaths.push(...pathResult)
        }

        // 去重并缓存
        const finalResult = this.deduplicate(expandedPaths)
        if (targetLevel <= EXPANSION_LIMITS.LEVEL_K) {
            const key = `${ruleName}:${targetLevel}`
            if (this.bfsLevelCache.has(key)) {
                throw new Error('系统错误')
            }
            this.bfsLevelCache.set(key, finalResult)
        }
        return finalResult
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
        // 1. 优先从 bfsLevelCache 获取 level 1 的数据（懒加载缓存）
        const key = `${ruleName}:${EXPANSION_LIMITS.LEVEL_1}`
        if (this.bfsLevelCache.has(key)) {
            this.perfAnalyzer.recordCacheHit('getDirectChildren')
            const cached = this.bfsLevelCache.get(key)!
            return cached
        }

        // 缓存未命中，需要动态计算
        this.perfAnalyzer.recordCacheMiss('getDirectChildren')

        // 2. 检查是否是 token
        const tokenNode = this.tokenCache?.get(ruleName)
        if (tokenNode && tokenNode.type === 'consume') {
            const result = [[ruleName]]  // token 直接返回
            // 缓存 token 的结果
            this.bfsLevelCache.set(key, result)
            return result
        }

        // 3. 获取规则的 AST 节点
        const subNode = this.getRuleNodeByAst(ruleName)
        if (!subNode) {
            throw new Error(`系统错误：规则不存在: ${ruleName}`)
        }

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
        }

        return result
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
        if (curLevel > maxLevel) {
            // 返回规则名本身（达到最大深度）
            this.perfAnalyzer.cacheStats.levelLimitReturn++
            return [[ruleName]]
        }

        // ========================================
        // 阶段1：DFS 缓存查找（在递归检测之前！）
        // ========================================

        if (firstK === EXPANSION_LIMITS.FIRST_K) {
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
            if (maxLevel !== EXPANSION_LIMITS.LEVEL_1) {
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
            const finalResult = this.expandNode(subNode, firstK, curLevel, maxLevel, isFirstPosition)

            // ========================================
            // 阶段4：DFS 缓存设置（在任何层级都缓存！）
            // ========================================

            if (firstK === EXPANSION_LIMITS.FIRST_K) {
                // DFS 主缓存：计算和缓存 firstK
                if (!this.dfsFirstKCache.has(ruleName)) {
                    // 🔧 注意：这里不应该 recordCacheMiss，因为未命中已经在前面记录过了
                    this.dfsFirstKCache.set(ruleName, finalResult)
                }
            } else if (firstK === EXPANSION_LIMITS.INFINITY) {
                if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
                    const key = ruleName + `:${EXPANSION_LIMITS.LEVEL_1}`
                    if (!this.bfsLevelCache.has(key)) {
                        this.bfsLevelCache.set(key, finalResult)
                    }
                }
            }

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
            const branches = this.expandNode(alt, firstK, curLevel, maxLevel, isFirstPosition)
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
        const innerBranches = this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition)

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
        const innerBranches = this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition)

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

