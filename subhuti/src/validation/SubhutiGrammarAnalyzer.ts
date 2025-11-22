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

/**
 * 左递归错误类型
 */
export type LeftRecursionError = ValidationError

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

    LEVEL_K: 5,
    LEVEL_1: 1,

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
     */
    MAX_BRANCHES: 1000,
} as const

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
    private first1LevelInfinityCache = new Map<string, string[][]>()
    private firstKLevelInfinityCache = new Map<string, string[][]>()
    private firstInfinityLevel1Cache = new Map<string, string[][]>()
    // 🔧 特殊：key 为 "ruleName:maxLevel"，因为不同层级返回不同结果
    private firstInfinityLevelKCache = new Map<string, string[][]>()
    private firstInfinityLevelKAllCache = new Map<string, string[][]>()
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
            maxLevel: options?.maxLevel ?? EXPANSION_LIMITS.LEVEL_K
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
     * - 遍历所有规则，调用 computeFirstMoreBranches 触发展开
     * - 在 subRuleHandler 中检测递归，区分左递归和普通递归
     * - 收集所有左递归错误
     *
     * @returns 左递归错误列表
     */
    public checkAllLeftRecursion(): LeftRecursionError[] {
        console.log(`\n📊 [左递归检测] 开始检测 ${this.ruleASTs.size} 个规则...`)

        // 清空错误 Map
        this.detectedLeftRecursionErrors.clear()

        // 遍历所有规则
        for (const ruleName of this.ruleASTs.keys()) {
            // 清空递归检测集合
            this.recursiveDetectionSet.clear()

            try {
                // 执行展开，使用无限层级以检测间接左递归
                // 注意：这里使用 computeFirst1ExpandBranches 而不是 computeFirstMoreBranches
                // 因为后者的 maxLevel=1 无法检测间接左递归
                this.computeFirst1ExpandBranches(ruleName)
            } catch (error) {
                // 处理其他系统错误（非左递归错误）
                console.error(`  ⚠️  ${ruleName}: ${error.message}`)
            }
        }

        // 为每个错误补充 suggestion
        for (const error of this.detectedLeftRecursionErrors.values()) {
            const ruleAST = this.getRuleNodeByAst(error.ruleName)
            error.suggestion = this.getLeftRecursionSuggestion(
                error.ruleName,
                ruleAST,
                new Set([error.ruleName])
            )
            console.log(`  ❌ ${error.ruleName}: 左递归`)
        }

        if (this.detectedLeftRecursionErrors.size === 0) {
            console.log(`  ✅ 未发现左递归`)
        } else {
            console.log(`  ⚠️  发现 ${this.detectedLeftRecursionErrors.size} 个左递归错误`)
        }

        // 返回收集到的错误（转换为数组）
        return Array.from(this.detectedLeftRecursionErrors.values())
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

        if (orConflictErrors.length === 0) {
            console.log(`  ✅ 未发现 Or 分支冲突`)
        } else {
            // 统计冲突类型
            const first1Only = orConflictErrors.filter(e => e.type === 'or-conflict' && e.level === 'WARNING').length
            const first5Also = orConflictErrors.filter(e => e.type === 'or-conflict-first5').length

            console.log(`  ⚠️  发现 ${orConflictErrors.length} 个 Or 分支冲突`)
            if (first1Only > 0) {
                console.log(`     💡 浅层冲突(仅 First(1)): ${first1Only} 个`)
            }
            if (first5Also > 0) {
                console.log(`     ❌ 深层冲突(First(5) 也冲突): ${first5Also} 个`)
            }
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

        console.log(`  🔍 [${ruleName}] 检测 Or 节点 First(1) 冲突...`)

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

                    // 记录 First(1) 冲突
                    const conflictTokens = Array.from(intersection).join(', ')
                    // errors.push({
                    //     level: 'WARNING',
                    //     type: 'or-conflict',
                    //     ruleName,
                    //     branchIndices: [i, j],
                    //     conflictPaths: {
                    //         pathA: `分支 ${i + 1} First(1): {${Array.from(branchFirst1Sets[i]).join(', ')}}`,
                    //         pathB: `分支 ${j + 1} First(1): {${Array.from(branchFirst1Sets[j]).join(', ')}}`
                    //     },
                    //     message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 在 First(1) 存在冲突`,
                    //     suggestion: "检测到 First(1) 冲突，正在深入分析 First(5)..."
                    // })

                    console.log(`    ⚠️  分支 ${i + 1} 和 ${j + 1} 在 First(1) 冲突 (${conflictTokens})`)
                }
            }
        }

        // Step 2: 如果有 First(1) 冲突，进一步检测 First(5)
        if (hasFirst1Conflict) {
            console.log(`    📊 [${ruleName}] 发现 First(1) 冲突，深入检测 First(5)...`)

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

                const tCompPairStart = Date.now()

                console.log(`    🔍 [DEBUG] 检测分支 ${i + 1} 和 ${j + 1} 的 First(${k}) 真实冲突...`)
                console.log(`    🔍 [DEBUG] ${ruleName}`)
                console.log(`       分支${i + 1} 有 ${branchFirst5Sets[i].size} 个序列`)
                console.log(`       分支${j + 1} 有 ${branchFirst5Sets[j].size} 个序列`)

                const estimatedComparisons = branchFirst5Sets[i].size * branchFirst5Sets[j].size
                console.log(`       预计比较次数: ${estimatedComparisons}`)

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

                const tCompPairEnd = Date.now()
                const pairCompTime = tCompPairEnd - tCompPairStart
                console.log(`       📊 ${conflictPairs.length > 0 ? '发现冲突' : '无冲突'} (耗时${pairCompTime}ms)`)

                // 优化：只要发现一个真实冲突，就报告并停止检测该Or节点的其他分支对
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

                    // 格式化冲突信息
                    const conflictDetails = `${typeLabel}
      分支${i + 1}: "${pair.frontSeq}"
      分支${j + 1}: "${pair.behindSeq}"`

                    // 🔧 不立即报告，先收集到数组
                    allRuleConflicts.push({
                        branchIndices: [i, j],
                        conflictPair: pair,
                        typeLabel
                    })

                    console.log(`    ❌ 分支 ${i + 1} 和 ${j + 1} 在 First(${k}) 存在真实冲突 (${typeLabel})`)
                    // ✅ 不要停止，继续检测其他分支对
                } else {
                    console.log(`    💡 分支 ${i + 1} 和 ${j + 1} 仅在 First(1) 冲突 (浅层冲突，可通过前瞻解决)`)
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

                console.log(`\n    📋 [${ruleName}] 共发现 ${allRuleConflicts.length} 对分支冲突，已合并报告`)
            }

            const tCompEnd = Date.now()
            if (perfStats) perfStats.comparisonTime += (tCompEnd - tCompStart)
        } else {
            console.log(`    ✅ [${ruleName}] 无 First(1) 冲突，跳过 First(5) 检测`)
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
        const allErrors: ValidationError[] = []

        // 0. 初始化各种组合的缓存
        console.log(`  📊 [0] 开始初始化缓存...`)
        const t0 = Date.now()
        this.initAllCaches()
        const t0End = Date.now()
        console.log(`  ✓ [0] 缓存初始化完成，耗时 ${t0End - t0}ms`)

        // 1. 左递归检测
        const leftRecursionErrors = this.checkAllLeftRecursion()
        allErrors.push(...leftRecursionErrors)

        // 2. Or 分支冲突检测（只有在没有左递归错误时才执行）
        const orConflictErrors = this.checkAllOrConflicts()
        allErrors.push(...orConflictErrors)


        return allErrors

        // 注释：暂时禁用所有缓存初始化
        /*
        console.log(`  📊 [3.3.1] 开始计算 firstMoreCache（First(2)，不展开规则名）`)
        const t1 = Date.now()

        // const ruleName = 'LetOrConst'

        // 1. 计算直接子节点缓存（First(2)）
        // ✅ 优化：跳过空 AST 的规则
        for (const ruleName of this.ruleASTs.keys()) {
            this.computing.clear()
            // 检查缓存是否已存在
            if (this.firstKCache.has(ruleName)) {
                throw new Error('系统错误：firstMoreCache 已存在')
            }

            // 调用 computeExpanded：firstK=2, maxLevel=0（不展开规则名）
            const children = this.computeFirstMoreBranches(ruleName)

            console.log(ruleName)

            console.log(children)
            // 缓存结果
            this.firstKCache.set(ruleName, children)


            const error = this.initFirstCache(ruleName)
            if (error) {
                leftRecursionErrors.push(error)
            }
        }
        */

        /*const t2 = Date.now()
        console.log(`  ✓ [3.3.1] firstMoreCache 计算完成，耗时 ${t2 - t1}ms`)

        console.log(`  📊 [3.3.2] 开始计算 first1ExpandCache（First(1)，完全展开）`)
        const t3 = Date.now()

        // 清空循环检测集合
        for (const ruleName of this.ruleASTs.keys()) {
            this.computing.clear()
            // ✅ firstK=1, maxLevel=Infinity（完全展开到叶子节点）
            this.initFirst1ExpandCache(ruleName)
        }

        const t4 = Date.now()
        console.log(`  ✓ [3.3.2] first1ExpandCache 计算完成，耗时 ${t4 - t3}ms`)

        console.log(`  📊 [3.3.3] 开始计算 firstMoreExpandCache（First(2)，按层级展开）`)
        const t5 = Date.now()

        const ruleTimings: Array<{ ruleName: string, time: number }> = []
        let ruleIndex = 0

        for (const ruleName of this.ruleASTs.keys()) {
            ruleIndex++
            const ruleStart = Date.now()

            // ✅ firstK=more, maxLevel=max 根据max层级展开
            this.computing.clear()
            this.initFirstMoreExpandCache(ruleName)

            const ruleTime = Date.now() - ruleStart
            ruleTimings.push({ruleName, time: ruleTime})

            // 输出耗时超过 100ms 的规则
            if (ruleTime > 100) {
                console.log(`    [${ruleIndex}/${this.ruleASTs.size}] ${ruleName}: ${ruleTime}ms ⚠️`)
            }
        }

        const t6 = Date.now()
        console.log(`  ✓ [3.3.3] firstMoreExpandCache 计算完成，耗时 ${t6 - t5}ms`)

        // 输出 Top 20 最耗时的规则
        console.log(`\n  📊 firstMoreExpandCache 计算统计（Top 20 最耗时）：`)
        const sortedTimings = ruleTimings.sort((a, b) => b.time - a.time).slice(0, 20)
        sortedTimings.forEach((stat, index) => {
            console.log(`    ${index + 1}. ${stat.ruleName}: ${stat.time}ms`)
        })
*/
        return leftRecursionErrors
    }

    /**
     * 初始化所有缓存组合
     *
     * 根据 firstK 和 maxLevel 的不同组合，初始化对应的缓存：
     * 1. firstK=INFINITY + maxLevel=LEVEL_1 → firstInfinityLevel1Cache
     * 2. firstK=INFINITY + maxLevel=LEVEL_K → firstInfinityLevelKCache
     * 3. firstK=FIRST_1 + maxLevel=INFINITY → first1LevelInfinityCache
     * 4. firstK=FIRST_K + maxLevel=INFINITY → firstKLevelInfinityCache
     */
    private initAllCaches(): void {
        const ruleNames = Array.from(this.ruleASTs.keys())

        console.log(`    初始化 firstInfinityLevel1Cache (firstK=∞, maxLevel=1)...`)
        for (const ruleName of ruleNames) {
            this.initFirstInfinityLevel1Cache(ruleName)
        }

        console.log(`    初始化 firstInfinityLevelKCache (firstK=∞, maxLevel=${EXPANSION_LIMITS.LEVEL_K})...`)
        for (const ruleName of ruleNames) {
            this.initFirstInfinityLevelKCache(ruleName)
        }

        console.log(`    初始化 first1LevelInfinityCache (firstK=1, maxLevel=∞)...`)
        for (const ruleName of ruleNames) {
            this.initFirst1LevelInfinityCache(ruleName)
        }

        console.log(`    初始化 firstKLevelInfinityCache (firstK=${EXPANSION_LIMITS.FIRST_K}, maxLevel=∞)...`)
        for (const ruleName of ruleNames) {
            this.initFirstKLevelInfinityCache(ruleName)
        }
    }

    /**
     * 初始化 firstInfinityLevel1Cache（firstK=INFINITY, maxLevel=LEVEL_1）
     *
     * 用途：触发计算，缓存由 subRuleHandler 内部设置
     */
    private initFirstInfinityLevel1Cache(ruleName: string): void {
        if (this.firstInfinityLevel1Cache.has(ruleName)) {
            return
        }

        // firstK=INFINITY, maxLevel=LEVEL_1
        // computeExpanded → subRuleHandler 会自动缓存结果
        this.computeExpanded(
            ruleName,
            null,
            EXPANSION_LIMITS.INFINITY,
            0,
            EXPANSION_LIMITS.LEVEL_1,
            true
        )
    }

    /**
     * 初始化 firstInfinityLevelKCache（firstK=INFINITY, maxLevel=LEVEL_K）
     *
     * 用途：获取规则的所有可能 token 序列，分层存储
     *
     * 🔧 特殊逻辑：
     * - computeExpanded 内部会自动缓存每个层级的单层结果（"ruleName:level"）
     * - 这里只负责聚合所有层级，缓存总条目（"ruleName"）
     * - 例如：
     *   - "Statement:0" → computeExpanded 内部缓存
     *   - "Statement:1" → computeExpanded 内部缓存
     *   - "Statement:2" → computeExpanded 内部缓存
     *   - "Statement" → 这里聚合并缓存（所有层级合并）
     */
    private initFirstInfinityLevelKCache(ruleName: string): void {
        // 存储每个层级的单层结果（用于最后聚合）
        const levelResults: Map<number, string[][]> = new Map()

        // 为每个层级 (0 到 LEVEL_K) 计算结果
        // computeExpanded 内部会自动缓存为 "ruleName:level"
        for (let level = 0; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
            const branches = this.computeExpanded(
                ruleName,
                null,
                EXPANSION_LIMITS.INFINITY,
                0,
                level,
                true
            )
            levelResults.set(level, branches)
        }

        // 🔧 聚合所有层级，缓存总条目
        const allLevelsBranches: string[][] = []
        for (let level = 0; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
            allLevelsBranches.push(...levelResults.get(level)!)
        }
        const allUnique = this.deduplicate(allLevelsBranches)

        // 缓存聚合结果，key 为 "ruleName"
        this.firstInfinityLevelKCache.set(ruleName, allUnique)
    }

    /**
     * 初始化 first1LevelInfinityCache（firstK=FIRST_1, maxLevel=INFINITY）
     *
     * 用途：触发计算，缓存由 subRuleHandler 内部设置
     */
    private initFirst1LevelInfinityCache(ruleName: string): void {
        if (this.first1LevelInfinityCache.has(ruleName)) {
            return
        }

        // firstK=FIRST_1, maxLevel=INFINITY
        // computeExpanded → subRuleHandler 会自动缓存结果
        this.computeExpanded(
            ruleName,
            null,
            EXPANSION_LIMITS.FIRST_1,
            0,
            EXPANSION_LIMITS.INFINITY,
            true
        )
    }

    /**
     * 初始化 firstKLevelInfinityCache（firstK=FIRST_K, maxLevel=INFINITY）
     *
     * 用途：触发计算，缓存由 subRuleHandler 内部设置
     */
    private initFirstKLevelInfinityCache(ruleName: string): void {
        if (this.firstKLevelInfinityCache.has(ruleName)) {
            return
        }

        // firstK=FIRST_K, maxLevel=INFINITY
        // computeExpanded → subRuleHandler 会自动缓存结果
        this.computeExpanded(
            ruleName,
            null,
            EXPANSION_LIMITS.FIRST_K,
            0,
            EXPANSION_LIMITS.INFINITY,
            true
        )
    }

    /**
     * 计算 First(1) 集合（完全展开到 token）
     *
     * 参数：firstK=1, maxLevel=Infinity
     *
     * 用途：获取规则的第1个 token，完全展开规则名
     */
    public computeFirst1ExpandBranches(ruleName: string, ruleNode: RuleNode = null) {
        // 调用通用展开方法（firstK=1, curLevel=0, maxLevel=Infinity）
        // 传入 isFirstPosition=true（顶层调用，用于左递归检测）
        return this.computeExpanded(ruleName, ruleNode, EXPANSION_LIMITS.FIRST_1, 0, EXPANSION_LIMITS.INFINITY, true)
    }

    /**
     * 计算 First(K) 集合（按配置层级展开）
     *
     * 参数：firstK=FIRST_K, maxLevel=MAX_LEVEL
     *
     * 用途：获取规则的前 K 个符号，按配置层级展开规则名
     */
    public computeFirstMoreExpandBranches(ruleName: string, ruleNode: RuleNode = null) {
        // 调用通用展开方法（firstK=FIRST_K, curLevel=0, maxLevel=MAX_LEVEL）
        // 传入 isFirstPosition=true（顶层调用，用于左递归检测）
        return this.computeExpanded(ruleName, ruleNode, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.LEVEL_K, true)
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
        // 空数组，返回包含一个空序列的数组
        if (arrays.length === 0) {
            return [[]]
        }

        // 只有一个数组，直接返回（可能包含空分支）
        if (arrays.length === 1) {
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

            console.log(result.length)
            // console.log(result.slice(0,10))
            console.log(currentArray.length)
            // console.log(currentArray.slice(0,10))
            console.log(currentArray.length * result.length)
            // 遍历当前结果的每个序列
            for (const seq of result) {
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
                console.log(`✅ 所有序列已达 FIRST_K，跳过剩余 ${arrays.length - i - 1} 个数组的计算`)
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
        if (perfStats.maxResultSize > 10000 || perfStats.skippedByDuplicate > 1000 || perfStats.movedToFinal > 1000 || perfStats.arrayDedupTotal > 0) {
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
        }

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
            // 使用 computeExpanded 方法，传入 firstK 参数
            paths = this.computeExpanded(null, node, k, 0, EXPANSION_LIMITS.INFINITY, false)

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
     * 通用展开方法：根据 firstK 和 maxLevel 展开规则
     *
     * @param node - AST 节点（可选）
     * @param ruleName - 规则名（可选）
     * @param firstK - 取前 K 个符号（1 或 2）
     * @param curLevel - 当前层级（默认 0）
     * @param maxLevel - 最大展开层级（0=不展开, 3=展开3层, Infinity=完全展开）
     * @param isFirstPosition
     * @returns 展开后的路径数组 string[][]
     *
     * 调用方式：
     * - computeExpanded(node, null, firstK, curLevel, maxLevel) - 传入节点
     * - computeExpanded(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
     *
     * 核心逻辑：
     * 1. 如果传入 ruleName，获取对应的 node
     * 2. 根据 node.type 分发处理：
     *    - consume: 返回 [[tokenName]]
     *    - subrule:
     *        - 如果 curLevel >= maxLevel，返回 [[ruleName]]（不展开）
     *        - 否则递归展开，curLevel + 1
     *    - sequence:
     *        - 如果 node.ruleName 存在（规则声明）：
     *            - 根据 (firstK, maxLevel) 组合，从对应缓存获取已截断的分支
     *            - 遍历分支中的每个符号，递归调用 computeExpanded(null, 符号, firstK, curLevel, maxLevel)
     *            - 对展开结果做笛卡尔积，截断到 firstK
     *        - 如果 node.ruleName 不存在（内联 sequence）：
     *            - 遍历 node.nodes，递归调用 computeExpanded(node, null, firstK, curLevel, maxLevel)
     *            - 对展开结果做笛卡尔积，截断到 firstK
     *    - or: 遍历所有分支，合并结果
     *    - option/many: 返回 [[], ...内部分支]
     *    - atLeastOne: 返回 [...内部分支, ...内部分支×2]
     *
     * 关键优化：
     * - 当 node.ruleName 存在时，从缓存获取已截断的分支，避免重复计算笛卡尔积
     * - 只展开 firstK 个符号，后续符号不展开
     *
     * 使用场景：
     * - firstK=2, maxLevel=0：firstMoreCache（不展开，取前2个符号）
     * - firstK=1, maxLevel=0：first1Cache（不展开，取第1个符号）
     * - firstK=1, maxLevel=Infinity：first1ExpandCache（完全展开到叶子节点）
     * - firstK=2, maxLevel=3：firstMoreExpandCache（展开3层，取前2个符号）
     */
    private computeExpanded(
        ruleName: string | null,
        node: RuleNode,
        firstK: number,
        curLevel: number = 0,
        maxLevel: number = EXPANSION_LIMITS.LEVEL_1,
        isFirstPosition: boolean = false  // 是否在第一个位置（用于左递归检测）
    ): string[][] {
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
    private expandSequenceNode(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true
    ) {
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
            // 展开当前子节点
            // 💡 传递累积的位置信息：父级是第1个 AND 当前也是第1个
            let branches = this.computeExpanded(
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

        // 笛卡尔积组合子节点（只对需要的节点做笛卡尔积）
        // 例如：[[a,b]] × [[c]] → [[a,b,c]]
        // ⚠️ 如果包含空分支：[[a]] × [[], [b]] → [[a], [a,b]]
        // ⚠️ cartesianProduct 不会过滤空分支，会正常拼接


        console.log(node.ruleName)

        const result = this.cartesianProduct(allBranches)

        console.log(result.length)
        // 笛卡尔积后路径可能超过 firstK，需要截取并去重
        // 注意：如果某些节点包含空分支，笛卡尔积后可能产生不同长度的路径
        // 例如：[[a,b]] × [[], [c]] → [[a,b], [a,b,c]]
        //       截取到2 → [[a,b], [a,b]] → 去重 → [[a,b]]
        // ⚠️ truncateAndDeduplicate 不会过滤空分支 []
        return this.truncateAndDeduplicate(result, firstK)
    }

    /**
     * 递归展开路径中的规则名到更深层级
     *
     * @param paths 当前层级的路径列表（level 1）
     * @param firstK 截取长度（由外层统一处理）
     * @param curLevel 当前层级（已经+1了）
     * @param maxLevel 最大层级
     * @param isFirstPosition 是否在第一个位置
     * @returns 展开到目标层级的路径（不截取，由外层统一截取）
     *
     * 核心逻辑（逐层展开）：
     * 1. 从 level 1 开始
     * 2. 每次展开1层，直到 curLevel >= maxLevel
     * 3. 利用 getDirectChildren 获取直接子节点
     * 4. 通过笛卡尔积替换路径中的规则名
     * 5. 不在内部截取，由外层统一处理
     *
     * 示例：
     * level 1: [[If, LParen, Expression, RParen, Statement]]
     * level 2: [[If, LParen, Identifier, RParen, BlockStatement], ...]
     * level 3: 继续展开...
     */
    private expandPathsToDeeper(
        paths: string[][],
        curLevel: number,
        maxLevel: number,
    ): string[][] {
        let currentPaths = paths

        // 从 level 1 逐层展开到 maxLevel
        // curLevel 表示已经展开的层数（开始是1）
        // 需要继续展开 (maxLevel - curLevel) 次
        const levelsToExpand = maxLevel - curLevel

        for (let i = 0; i < levelsToExpand; i++) {
            const expandedPaths: string[][] = []

            // 展开当前层的每个路径
            for (const path of currentPaths) {
                const expanded = this.expandSinglePath(path)
                expandedPaths.push(...expanded)
            }

            // 只去重，不截取（由外层统一截取）
            currentPaths = this.deduplicate(expandedPaths)
        }

        // 返回展开后的路径（不截取）
        return currentPaths
    }

    /**
     * 展开单个路径中的规则名（展开1层）
     *
     * @param path 单个路径（可能包含 token 和规则名）
     * @returns 展开后的所有可能路径
     *
     * 示例：
     * path = [If, LParen, Expression, RParen, Statement]
     * → Expression 的直接子节点: [[Identifier], [BinaryExpr], ...]
     * → Statement 的直接子节点: [[BlockStatement], [IfStatement], ...]
     * → 笛卡尔积: [[If, LParen, Identifier, RParen, BlockStatement], ...]
     *
     * 注意：只展开1层，使用 getDirectChildren
     */
    private expandSinglePath(path: string[]): string[][] {
        const allBranches: string[][][] = []

        // 遍历路径中的每个符号
        for (const symbol of path) {
            if (this.ruleASTs.has(symbol)) {
                // 是规则名，获取其直接子节点（展开1层）
                const branches = this.getDirectChildren(symbol)
                allBranches.push(branches)
            } else {
                // 是 token，保持不变
                allBranches.push([[symbol]])
            }
        }

        // 笛卡尔积组合
        return this.cartesianProduct(allBranches)
    }

    /**
     * 获取规则的直接子节点（展开1层）
     *
     * @param ruleName 规则名
     * @returns 直接子节点的所有路径（展开1层）
     *
     * 优先级：
     * 1. 从 firstInfinityLevel1Cache 获取（如果已初始化）
     * 2. 动态计算并缓存
     *
     * 示例：
     * - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
     * - IfStatement → [[If, LParen, Expression, RParen, Statement]]
     */
    private getDirectChildren(ruleName: string): string[][] {
        // 1. 优先从缓存获取
        if (this.firstInfinityLevel1Cache.has(ruleName)) {
            return this.firstInfinityLevel1Cache.get(ruleName)!
        }

        // 2. 检查是否是 token
        const tokenNode = this.tokenCache?.get(ruleName)
        if (tokenNode && tokenNode.type === 'consume') {
            return [[ruleName]]  // token 直接返回
        }

        // 3. 获取规则的 AST 节点
        const subNode = this.getRuleNodeByAst(ruleName)
        if (!subNode) {
            throw new Error(`系统错误：规则不存在: ${ruleName}`)
        }

        // 4. 动态计算：展开1层
        const result = this.computeExpanded(
            null,
            subNode,
            EXPANSION_LIMITS.INFINITY,
            0,
            EXPANSION_LIMITS.LEVEL_1,
            false
        )

        // 5. 缓存结果
        this.firstInfinityLevel1Cache.set(ruleName, result)

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
     * @param ruleName
     * @param firstK
     * @param curLevel
     * @param maxLevel
     * @param isFirstPosition 是否在第一个位置（用于区分左递归和普通递归）
     */
    private subRuleHandler(
        ruleName: string,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true
    ) {
        // 层级+1（进入子规则）
        curLevel++

        // 防御：规则名不能为空
        if (!ruleName) {
            throw new Error('系统错误')
        }

        console.log('ruleName:')
        console.log(ruleName)

        // 🔴 递归检测必须在层级检查之前，否则会被层级限制提前中断
        // 递归检测：如果规则正在计算中
        if (this.recursiveDetectionSet.has(ruleName)) {
            // 🔍 调试：输出关键信息
            // 💡 区分左递归和普通递归
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
                return []
            } else {
                // 不在第一个位置递归 → 普通递归
                // 返回规则名，防止无限递归
                return [[ruleName]]
            }
        }

        // 标记当前规则正在计算（防止循环递归）
        this.recursiveDetectionSet.add(ruleName)

        try {
            // 层级限制：超过最大层级，停止展开
            if (curLevel > maxLevel) {
                // 返回规则名本身（达到最大深度）
                return [[ruleName]]
            }


            if (firstK === EXPANSION_LIMITS.INFINITY) {
                if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
                    if (this.firstInfinityLevel1Cache.has(ruleName)) {
                        return this.firstInfinityLevel1Cache.get(ruleName)
                    }

                }
                // 否则获取对应 curLevel 的单层结果（不合并！）
                const key = `${ruleName}:${curLevel}`
                if (this.firstInfinityLevelKCache.has(key)) {
                    return this.firstInfinityLevelKCache.get(key)  // 只返回单层
                }
            } else if (maxLevel === EXPANSION_LIMITS.INFINITY) {
                if (firstK === EXPANSION_LIMITS.FIRST_1) {
                    if (this.first1LevelInfinityCache.has(ruleName)) {
                        return this.first1LevelInfinityCache.get(ruleName)
                    }
                } else if (firstK === EXPANSION_LIMITS.FIRST_K) {
                    if (this.firstKLevelInfinityCache.has(ruleName)) {
                        return this.firstKLevelInfinityCache.get(ruleName)  // 修复：应该返回 firstKCache
                    }
                } else {
                    throw new Error('系统错误')
                }
            } else {
                throw new Error('系统错误')
            }

            // 根据层级决定是否继续展开
            let result: string[][]

            // 🔧 优化：使用 getDirectChildren 获取直接子节点
            result = this.getDirectChildren(ruleName)

            if (curLevel < maxLevel) {
                // 需要继续递归展开
                // 递归展开每个子节点
                // 例如：[[BlockStatement], [If, LParen, Expression, RParen, Statement]]
                // 需要继续展开其中的规则名
                result = this.expandPathsToDeeper(result, curLevel, maxLevel)
            }

            // 🔧 统一在外层处理截取和去重
            const finalResult = this.truncateAndDeduplicate(result, firstK)

            // 🔧 缓存结果（统一在 subRuleHandler 中设置）
            if (firstK === EXPANSION_LIMITS.INFINITY) {
                if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
                    // firstK=INFINITY, maxLevel=LEVEL_1
                    if (!this.firstInfinityLevel1Cache.has(ruleName)) {
                        this.firstInfinityLevel1Cache.set(ruleName, finalResult)
                    }
                }
                // firstK=INFINITY, maxLevel=LEVEL_K
                // 缓存单层结果，key 为 "ruleName:curLevel"
                const key = `${ruleName}:${curLevel}`
                if (!this.firstInfinityLevelKCache.has(key)) {
                    this.firstInfinityLevelKCache.set(key, finalResult)
                }
            } else if (maxLevel === EXPANSION_LIMITS.INFINITY) {
                if (firstK === EXPANSION_LIMITS.FIRST_1) {
                    // firstK=FIRST_1, maxLevel=INFINITY
                    if (!this.first1LevelInfinityCache.has(ruleName)) {
                        this.first1LevelInfinityCache.set(ruleName, finalResult)
                    }
                } else if (firstK === EXPANSION_LIMITS.FIRST_K) {
                    // firstK=FIRST_K, maxLevel=INFINITY
                    if (!this.firstKLevelInfinityCache.has(ruleName)) {
                        this.firstKLevelInfinityCache.set(ruleName, finalResult)
                    }
                }
            }

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
        // 防御：如果 or 没有分支（理论上不应该发生）
        if (alternatives.length === 0) {
            throw new Error('系统错误')
            // 返回空分支（表示匹配失败）
            // return [[]]
        }

        // 存储所有分支的展开结果（可能包含空分支 []）
        let result: string[][] = []

        // 遍历 Or 的每个选择分支
        for (const alt of alternatives) {
            // 🔴 关键：每个 Or 分支都是独立的起点，第一个位置的规则需要检测左递归
            // 递归展开每个分支（可能包含空分支 []）
            const branches = this.computeExpanded(null, alt, firstK, curLevel, maxLevel, isFirstPosition)
            // 合并到结果中（空分支也会被合并）
            result = result.concat(branches)
        }

        // 防御：如果所有分支都没有结果（理论上不应该发生）
        if (result.length === 0) {
            throw new Error('系统错误')
            // return [[]]
        }

        // 只去重，不截取（子节点已经处理过截取）
        // ⚠️ deduplicate 不会过滤空分支 []
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
        // 递归展开内部节点
        // 🔴 关键：传递 isFirstPosition 用于递归检测
        const innerBranches = this.computeExpanded(null, node, firstK, curLevel, maxLevel, isFirstPosition)

        // ⚠️⚠️⚠️ 关键：添加空分支 [] 表示可以跳过（0次）
        // 空分支必须在第一个位置，表示优先匹配空（PEG 顺序选择）
        const result = [[], ...innerBranches]

        // 只去重，不截取（子节点已经处理过截取）
        // ⚠️ deduplicate 不会过滤空分支 []
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
        // 递归展开内部节点（1次的情况，可能包含空分支 []）
        // 🔴 关键：传递 isFirstPosition 用于递归检测
        const innerBranches = this.computeExpanded(null, node, firstK, curLevel, maxLevel, isFirstPosition)

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

