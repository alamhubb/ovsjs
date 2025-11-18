/**
 * Subhuti Grammar Validation - 冲突检测器
 *
 * 功能：检测 Or 规则中的路径冲突
 *
 * 实现方案：方案A - 基于完全展开的token路径进行前缀检测
 *
 * 检测原理：
 *
 * Level 1: 空路径检测（FATAL - 致命错误）
 *   - 检测：分支是否可以匹配空（路径包含''）
 *   - 问题：如果前面的分支可以匹配空，后续所有分支都不可达
 *   - 示例：Or([Option(A), B]) → Option(A)可以匹配空，B永远不会被尝试
 *
 * Level 2: 前缀冲突检测（ERROR - 错误）
 *   - 检测：前面分支的路径是否是后面分支路径的前缀
 *   - 方法：使用字符串的startsWith检测
 *   - 示例：
 *     * 分支A路径：'=,'
 *     * 分支B路径：'==,'
 *     * '==,'.startsWith('=,') → true，有冲突！
 *     * 原因：PEG是贪婪匹配，分支A会先匹配'='，导致分支B的'=='无法完整匹配
 *
 * 关键点：
 * 1. 路径是实际的token序列（由SubhutiGrammarAnalyzer展开subrule得到）
 * 2. 使用字符串前缀检测，简单高效
 * 3. 能检测到真正的Or分支顺序问题
 *
 * 局限性：
 * - 依赖SubhutiGrammarAnalyzer的路径计算
 * - 复杂规则可能导致路径爆炸（已通过路径数量限制缓解）
 *
 * @version 1.0.0
 */

import type {SubhutiGrammarAnalyzer} from "./SubhutiGrammarAnalyzer"
import {EXPANSION_LIMITS} from "./SubhutiGrammarAnalyzer"
import type {RuleNode, ValidationError, Path, SequenceNode} from "./SubhutiValidationError"

/**
 * 冲突检测模式
 */
export type ConflictDetectionMode = 'paths' | 'first' | 'auto'

/**
 * 冲突检测器配置
 */
export interface ConflictDetectorOptions {
    /**
     * 检测模式
     * - 'paths': 使用完全展开路径检测（精确但可能慢）
     * - 'first': 使用First集合检测（快速但不够精确）
     * - 'auto': 自动选择（默认）
     */
    mode?: ConflictDetectionMode
}

/**
 * 冲突检测器
 *
 * 职责：
 * 1. 遍历所有 Or 规则
 * 2. 检测空路径（Level 1 - FATAL）
 * 3. 检测前缀冲突（Level 2 - ERROR）
 * 4. 生成详细的错误报告
 *
 * 两种检测模式：
 * - 完全展开路径：精确但可能路径爆炸
 * - First集合：快速但不够精确
 */
export class SubhutiConflictDetector {
    private mode: ConflictDetectionMode

    // 📊 笛卡尔积统计
    private cartesianStats = {
        totalCalls: 0,
        totalTime: 0,
        maxTime: 0,
        maxTimeRule: '',
        totalInputArrays: 0,
        totalOutputBranches: 0,
        truncatedCount: 0
    }

    // 📊 Or冲突检测调用统计
    private orConflictCallCount = new Map<string, number>()

    /**
     * 构造函数
     *
     * @param analyzer 语法分析器
     * @param ruleASTs 规则 AST 映射
     * @param options 配置选项
     */
    constructor(
        private analyzer: SubhutiGrammarAnalyzer,
        private ruleASTs: Map<string, RuleNode>,
        options: ConflictDetectorOptions = {}
    ) {
        this.mode = options.mode || 'auto'
    }

    /**
     * 检测所有冲突（新版本：使用分层检测策略）
     *
     * 检测策略：
     * 1. First(1) 快速预检：如果 First(1) 无冲突，跳过详细检测
     * 2. First(2) 详细检测：如果 First(1) 有冲突，使用 First(2) 详细检测
     *
     * 性能优化：
     * - 大部分规则的 Or 分支 First(1) 无冲突，可以快速跳过
     * - 只有少数规则需要 First(2) 详细检测
     *
     * @returns 错误列表
     */
    detectAllConflicts(): ValidationError[] {
        const errors: ValidationError[] = []

        // 📊 规则检测统计
        const ruleStats: Array<{
            ruleName: string
            time: number
            conflicts: number
            first1Skipped: boolean  // 是否通过 First(1) 跳过
        }> = []

        // 遍历所有规则
        let ruleIndex = 0
        let first1SkippedCount = 0

        for (const [ruleName, ruleNode] of this.ruleASTs) {
            ruleIndex++
            const ruleStartTime = Date.now()
            const errorsBefore = errors.length

            // 使用新的检测方法
            const skipped = this.detectNodeConflictsV2(ruleName, ruleNode, errors)

            const ruleElapsed = Date.now() - ruleStartTime
            const conflictsFound = errors.length - errorsBefore

            if (skipped) {
                first1SkippedCount++
            }

            ruleStats.push({
                ruleName,
                time: ruleElapsed,
                conflicts: conflictsFound,
                first1Skipped: skipped
            })

            // 输出每个规则的检测进度和耗时
            if (ruleElapsed > 50 || conflictsFound > 0) {
                const skipInfo = skipped ? ' [First(1)跳过]' : ''
                console.log(`  [${ruleIndex}/${this.ruleASTs.size}] ${ruleName}: ${ruleElapsed}ms${conflictsFound > 0 ? ` (发现${conflictsFound}个冲突)` : ''}${skipInfo}`)
            }
        }

        // 📊 输出规则检测统计（按耗时排序）
        console.log(`\n📊 规则检测统计（Top 20 最耗时）：`)
        const sortedStats = ruleStats.sort((a, b) => b.time - a.time).slice(0, 20)
        sortedStats.forEach((stat, index) => {
            const skipInfo = stat.first1Skipped ? ' [First(1)跳过]' : ''
            console.log(`  ${index + 1}. ${stat.ruleName}: ${stat.time}ms${stat.conflicts > 0 ? ` [${stat.conflicts}个冲突]` : ''}${skipInfo}`)
        })

        const totalRuleTime = ruleStats.reduce((sum, s) => sum + s.time, 0)
        console.log(`  总耗时: ${totalRuleTime}ms`)
        console.log(`  平均耗时: ${(totalRuleTime / ruleStats.length).toFixed(2)}ms`)
        console.log(`  First(1) 跳过: ${first1SkippedCount}/${ruleStats.length} (${(first1SkippedCount / ruleStats.length * 100).toFixed(1)}%)`)

        return errors
    }

    /**
     * 检测所有冲突（旧版本）
     *
     * @deprecated 使用 detectAllConflicts() 替代（新版本使用分层检测策略）
     *
     * 保留原因：
     * - 作为参考实现
     * - 用于性能对比测试
     *
     * @returns 错误列表
     */
    detectAllConflictsOld(): ValidationError[] {
        const errors: ValidationError[] = []

        // 📊 规则检测统计
        const ruleStats: Array<{ ruleName: string, time: number, conflicts: number }> = []

        // 遍历所有规则
        let ruleIndex = 0
        for (const [ruleName, ruleNode] of this.ruleASTs) {
            ruleIndex++
            const ruleStartTime = Date.now()
            const errorsBefore = errors.length

            this.detectNodeConflicts(ruleName, ruleNode, errors)

            const ruleElapsed = Date.now() - ruleStartTime
            const conflictsFound = errors.length - errorsBefore

            ruleStats.push({
                ruleName,
                time: ruleElapsed,
                conflicts: conflictsFound
            })

            // 输出每个规则的检测进度和耗时
            if (ruleElapsed > 50 || conflictsFound > 0) {
                console.log(`  [${ruleIndex}/${this.ruleASTs.size}] ${ruleName}: ${ruleElapsed}ms${conflictsFound > 0 ? ` (发现${conflictsFound}个冲突)` : ''}`)
            }

            // 📊 如果是AssignmentExpression，立即输出详细统计
            if (ruleName === 'AssignmentExpression' && ruleElapsed > 1000) {
                const callCount = this.orConflictCallCount.get(ruleName) || 0
                console.log(`    ⚠️ AssignmentExpression 耗时过长：${ruleElapsed}ms，Or冲突检测被调用${callCount}次`)
                console.log(`    平均每次调用：${(ruleElapsed / callCount).toFixed(2)}ms`)
            }
        }

        // 📊 输出规则检测统计（按耗时排序）
        console.log(`\n📊 规则检测统计（Top 20 最耗时）：`)
        const sortedStats = ruleStats.sort((a, b) => b.time - a.time).slice(0, 20)
        sortedStats.forEach((stat, index) => {
            const callCount = this.orConflictCallCount.get(stat.ruleName) || 0
            console.log(`  ${index + 1}. ${stat.ruleName}: ${stat.time}ms${callCount > 0 ? ` (调用${callCount}次)` : ''}${stat.conflicts > 0 ? ` [${stat.conflicts}个冲突]` : ''}`)
        })

        const totalRuleTime = ruleStats.reduce((sum, s) => sum + s.time, 0)
        console.log(`  总耗时: ${totalRuleTime}ms`)
        console.log(`  平均耗时: ${(totalRuleTime / ruleStats.length).toFixed(2)}ms`)

        // 📊 输出Or冲突检测调用统计（Top 10）
        console.log(`\n📊 Or冲突检测调用次数（Top 10）：`)
        const sortedCalls = Array.from(this.orConflictCallCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        sortedCalls.forEach(([ruleName, count], index) => {
            const stat = ruleStats.find(s => s.ruleName === ruleName)
            const avgTime = stat ? (stat.time / count).toFixed(2) : '0'
            console.log(`  ${index + 1}. ${ruleName}: ${count}次调用，平均${avgTime}ms/次`)
        })

        // 📊 输出笛卡尔积统计
        console.log(`\n📊 笛卡尔积统计：`)
        console.log(`  - 总调用次数：${this.cartesianStats.totalCalls}`)
        console.log(`  - 总耗时：${this.cartesianStats.totalTime}ms`)
        console.log(`  - 平均耗时：${(this.cartesianStats.totalTime / this.cartesianStats.totalCalls).toFixed(2)}ms`)
        console.log(`  - 最大耗时：${this.cartesianStats.maxTime}ms (规则: ${this.cartesianStats.maxTimeRule})`)
        console.log(`  - 总输入数组：${this.cartesianStats.totalInputArrays}`)
        console.log(`  - 总输出分支：${this.cartesianStats.totalOutputBranches}`)
        console.log(`  - 截断次数：${this.cartesianStats.truncatedCount}`)

        return errors
    }

    /**
     * 递归检测节点冲突（新版本：使用分层检测策略）
     *
     * 检测策略：
     * 1. First(1) 快速预检：如果 First(1) 无冲突，跳过详细检测
     * 2. First(2) 详细检测：如果 First(1) 有冲突，使用 First(2) 详细检测
     *
     * @param ruleName 规则名
     * @param node AST 节点
     * @param errors 错误列表
     * @returns 是否通过 First(1) 跳过了检测
     */
    private detectNodeConflictsV2(
        ruleName: string,
        node: RuleNode,
        errors: ValidationError[]
    ): boolean {
        let skipped = false

        switch (node.type) {
            case 'or':
                // 检测 Or 节点的冲突（使用新的分层检测）
                skipped = this.detectOrConflictsV2(ruleName, node.alternatives, errors)

                // 递归检测每个分支
                for (const alt of node.alternatives) {
                    this.detectNodeConflictsV2(ruleName, alt, errors)
                }
                break

            case 'sequence':
                // 递归检测序列中的每个节点
                for (const child of node.nodes) {
                    this.detectNodeConflictsV2(ruleName, child, errors)
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检测内部节点
                this.detectNodeConflictsV2(ruleName, node.node, errors)
                break

            // consume 和 subrule 不需要检测
            case 'consume':
            case 'subrule':
                break
        }

        return skipped
    }

    /**
     * 递归检测节点冲突（旧版本）
     *
     * @deprecated 使用 detectNodeConflictsV2() 替代
     */
    private detectNodeConflicts(
        ruleName: string,
        node: RuleNode,
        errors: ValidationError[]
    ): void {
        switch (node.type) {
            case 'or':
                // 检测 Or 节点的冲突
                this.detectOrConflicts(ruleName, node.alternatives, errors)

                // 递归检测每个分支
                for (const alt of node.alternatives) {
                    this.detectNodeConflicts(ruleName, alt, errors)
                }
                break

            case 'sequence':
                // 递归检测序列中的每个节点
                for (const child of node.nodes) {
                    this.detectNodeConflicts(ruleName, child, errors)
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检测内部节点
                this.detectNodeConflicts(ruleName, node.node, errors)
                break

            // consume 和 subrule 不需要检测
            case 'consume':
            case 'subrule':
                break
        }
    }

    /**
     * 检测 Or 规则的冲突（新版本：使用分层检测策略）
     *
     * 检测策略：
     * 1. First(1) 快速预检：如果 First(1) 无冲突，跳过详细检测
     * 2. First(2) 详细检测：如果 First(1) 有冲突，使用 First(2) 详细检测
     *
     * 执行两种检测：
     * 1. 空路径检测（FATAL）：检测是否有分支可以匹配空输入
     * 2. 前缀冲突检测（ERROR）：检测是否有分支被前面的分支遮蔽
     *
     * @param ruleName 规则名称
     * @param alternatives Or 节点的所有分支
     * @param errors 错误列表
     * @returns 是否通过 First(1) 跳过了检测
     */
    private detectOrConflictsV2(
        ruleName: string,
        alternatives: SequenceNode[],
        errors: ValidationError[]
    ): boolean {
        const t0 = Date.now()

        console.log(`  🔍 [detectOrConflictsV2] 规则: ${ruleName}, 分支数: ${alternatives.length}`)

        // 步骤 1：First(1) 快速预检
        const t1 = Date.now()
        const hasFirst1Conflict = this.quickCheckWithFirst1(alternatives)
        const first1Time = Date.now() - t1

        if (!hasFirst1Conflict) {
            // First(1) 无冲突，跳过详细检测
            const totalTime = Date.now() - t0
            console.log(`  ✅ [detectOrConflictsV2] ${ruleName}: First(1) 无冲突，跳过，耗时 ${totalTime}ms (First(1)预检: ${first1Time}ms)`)
            return true
        }

        console.log(`  ⚠️ [detectOrConflictsV2] ${ruleName}: First(1) 有冲突，进入 First(2) 详细检测`)

        // 步骤 2：First(2) 详细检测
        // 从 firstMoreExpandCache 获取展开结果
        const t2 = Date.now()
        const branchExpansions = this.computeOrBranchExpansionsFromCache(alternatives)
        const expansionTime = Date.now() - t2

        const totalPaths = branchExpansions.reduce((sum, exp) => sum + exp.length, 0)
        console.log(`    分支展开耗时: ${expansionTime}ms, 总路径数: ${totalPaths}`)

        // 限制路径数量
        const limitedBranchExpansions = branchExpansions.map((branchExp, idx) => {
            if (branchExp.length > EXPANSION_LIMITS.MAX_BRANCHES) {
                console.warn(`    [${ruleName}] 分支${idx}的展开结果过多 (${branchExp.length})，截断到 ${EXPANSION_LIMITS.MAX_BRANCHES}`)
                return branchExp.slice(0, EXPANSION_LIMITS.MAX_BRANCHES)
            }
            return branchExp
        })

        // 两两比较 Or 分支
        const t3 = Date.now()
        let totalComparisons = 0

        for (let i = 0; i < alternatives.length; i++) {
            const pathsA = this.expansionToPaths(limitedBranchExpansions[i])

            for (let j = i + 1; j < alternatives.length; j++) {
                const pathsB = this.expansionToPaths(limitedBranchExpansions[j])

                totalComparisons += pathsA.length * pathsB.length

                // Level 1: 空路径检测（FATAL 级别）
                if (this.hasTopLevelEmptyPath(alternatives[i])) {
                    errors.push({
                        level: 'FATAL',
                        type: 'empty-path',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: '',
                            pathB: pathsB[0] || ''
                        },
                        message: `分支 ${i} 可以匹配空输入，后续所有分支都不可达`,
                        suggestion: '移除 Option/Many 或将其移到 Or 外部'
                    })

                    return false  // FATAL 错误，停止检测
                }

                // Level 2: 前缀冲突检测（ERROR 级别）
                this.detectPrefixConflicts(ruleName, i, j, pathsA, pathsB, errors)
            }
        }

        const comparisonTime = Date.now() - t3
        const totalTime = Date.now() - t0

        console.log(`  ✅ [detectOrConflictsV2] ${ruleName}: 完成`)
        console.log(`    - First(1)预检: ${first1Time}ms`)
        console.log(`    - 分支展开: ${expansionTime}ms`)
        console.log(`    - 路径比较: ${comparisonTime}ms (${totalComparisons}次)`)
        console.log(`    - 总耗时: ${totalTime}ms`)

        return false  // 进行了详细检测
    }

    /**
     * 检测 Or 规则的冲突（旧版本）
     *
     * @deprecated 使用 detectOrConflictsV2() 替代
     *
     * 执行两种检测：
     * 1. 空路径检测（FATAL）：检测是否有分支可以匹配空输入
     * 2. 前缀冲突检测（ERROR）：检测是否有分支被前面的分支遮蔽
     *
     * @param ruleName 规则名称
     * @param alternatives Or 节点的所有分支
     * @param errors 错误列表
     */
    private detectOrConflicts(
        ruleName: string,
        alternatives: SequenceNode[],
        errors: ValidationError[]
    ): void {
        const t0 = Date.now()

        // 📊 统计调用次数
        const currentCount = this.orConflictCallCount.get(ruleName) || 0
        this.orConflictCallCount.set(ruleName, currentCount + 1)

        // 🚀 优化：使用 First 集合快速预检
        // 如果两个分支的 First 集合无交集，则肯定无前缀冲突，可以跳过详细检测
        const t1 = Date.now()
        const hasConflict = this.quickCheckWithFirst(alternatives)
        const t2 = Date.now()

        const firstCheckTime = t2 - t1

        if (!hasConflict) {
            // 无冲突，跳过详细检测
            const totalTime = Date.now() - t0
            if (totalTime > 10) {
                console.log(`    [${ruleName}] First集预检：无冲突，跳过详细检测，耗时${totalTime}ms`)
            }
            return
        }

        // 公共部分：计算所有分支的完全展开结果（只在可能有冲突时才计算）
        // 这个方法被空路径检测和前缀冲突检测共用
        const t3 = Date.now()
        const branchExpansions = this.computeOrBranchExpansions(ruleName, alternatives)
        const t4 = Date.now()

        const expansionTime = t4 - t3
        const totalPaths = branchExpansions.reduce((sum, exp) => sum + exp.length, 0)

        // 📊 输出每个分支的路径数（用于调试）
        if (ruleName === 'AssignmentExpression') {
            console.log(`    [${ruleName}] 各分支路径数：`)
            branchExpansions.forEach((exp, idx) => {
                console.log(`      分支${idx}: ${exp.length}条路径`)
            })
        }

        if (expansionTime > 50) {
            console.log(`    [${ruleName}] 分支展开：${alternatives.length}个分支 → ${totalPaths}条路径，耗时${expansionTime}ms`)
        }

        // 两两比较 Or 分支，执行所有检测
        const t5 = Date.now()
        let totalComparisons = 0

        // ⚠️ 预处理：限制所有分支的路径数量
        if (ruleName === 'AssignmentExpression') {
            console.log(`    [${ruleName}] 开始限制路径数量，MAX_BRANCHES=${EXPANSION_LIMITS.MAX_BRANCHES}`)
        }

        const limitedBranchExpansions = branchExpansions.map((branchExp, idx) => {
            if (branchExp.length > EXPANSION_LIMITS.MAX_BRANCHES) {
                console.warn(`    [${ruleName}] 分支${idx}的展开结果过多 (${branchExp.length})，截断到 ${EXPANSION_LIMITS.MAX_BRANCHES}`)
                return branchExp.slice(0, EXPANSION_LIMITS.MAX_BRANCHES)
            }
            return branchExp
        })

        for (let i = 0; i < alternatives.length; i++) {
            const pathsA = this.expansionToPaths(limitedBranchExpansions[i])

            for (let j = i + 1; j < alternatives.length; j++) {
                const pathsB = this.expansionToPaths(limitedBranchExpansions[j])

                totalComparisons += pathsA.length * pathsB.length

                // Level 1: 空路径检测（FATAL 级别）
                // 只检测 Or 分支本身是否可以为空（顶层空路径）
                // 不检测分支内部的 Option/Many 导致的空路径
                if (this.hasTopLevelEmptyPath(alternatives[i])) {
                    errors.push({
                        level: 'FATAL',
                        type: 'empty-path',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: '',
                            pathB: pathsB[0] || ''
                        },
                        message: `分支 ${i} 可以匹配空输入，后续所有分支都不可达`,
                        suggestion: '移除 Option/Many 或将其移到 Or 外部'
                    })

                    return  // FATAL 错误，停止检测
                }

                // Level 2: 前缀冲突检测（ERROR 级别）
                this.detectPrefixConflicts(ruleName, i, j, pathsA, pathsB, errors)
            }
        }

        const t6 = Date.now()
        const comparisonTime = t6 - t5
        const totalTime = t6 - t0

        // 📊 详细统计（AssignmentExpression 或耗时超过100ms时输出）
        if (ruleName === 'AssignmentExpression' || totalTime > 100) {
            console.log(`    [${ruleName}] 冲突检测详情：`)
            console.log(`      - First集预检：${firstCheckTime}ms`)
            console.log(`      - 分支展开：${expansionTime}ms (${alternatives.length}个分支 → ${totalPaths}条路径)`)
            console.log(`      - 路径比较：${comparisonTime}ms (${totalComparisons}次比较)`)
            console.log(`      - 总耗时：${totalTime}ms`)
            console.log(`      - 平均每次比较：${(comparisonTime / totalComparisons).toFixed(4)}ms`)
        }
    }

    /**
     * 使用 First(1) 集合快速预检 Or 分支冲突（新版本）
     *
     * 原理：
     * - 如果两个分支的 First(1) 集合无交集，则肯定无前缀冲突
     * - 如果有交集，则可能有冲突，需要 First(2) 详细检测
     *
     * 性能：
     * - First(1) 集合已在 first1ExpandCache 中缓存，查询非常快
     * - 对于无冲突的情况，可以跳过 First(2) 详细检测
     *
     * @param alternatives Or 分支列表
     * @returns 是否可能有冲突
     */
    private quickCheckWithFirst1(alternatives: SequenceNode[]): boolean {
        const startTime = Date.now()

        console.log(`    🔍 [quickCheckWithFirst1] 开始，分支数: ${alternatives.length}`)

        // 计算每个分支的 First(1) 集合（从 first1ExpandCache 获取）
        const firstSets = alternatives.map((alt, idx) => {
            const computeStart = Date.now()
            const result = this.analyzer.computeNodeFirst(alt)
            const computeTime = Date.now() - computeStart

            console.log(`      分支${idx}: computeNodeFirst 耗时 ${computeTime}ms, 结果大小: ${result.size}`)
            console.log(`        First(1) = {${Array.from(result).slice(0, 5).join(', ')}${result.size > 5 ? '...' : ''}}`)

            return result
        })

        // 检查任意两个分支的 First(1) 集合是否有交集
        for (let i = 0; i < firstSets.length; i++) {
            for (let j = i + 1; j < firstSets.length; j++) {
                const intersection = new Set(
                    [...firstSets[i]].filter(x => firstSets[j].has(x))
                )

                if (intersection.size > 0) {
                    // 有交集，可能有冲突，需要 First(2) 详细检测
                    const elapsed = Date.now() - startTime
                    console.log(`    ✓ [quickCheckWithFirst1] 发现冲突 (分支${i} ∩ 分支${j}), 耗时 ${elapsed}ms`)
                    console.log(`      交集: {${Array.from(intersection).slice(0, 5).join(', ')}${intersection.size > 5 ? '...' : ''}}`)
                    return true
                }
            }
        }

        // 所有分支的 First(1) 集合都不相交，肯定无冲突
        const elapsed = Date.now() - startTime
        console.log(`    ✓ [quickCheckWithFirst1] 无冲突，跳过详细检测，耗时 ${elapsed}ms`)
        return false
    }

    /**
     * 从缓存中计算 Or 分支的展开结果（新版本）
     *
     * 使用 firstMoreExpandCache 获取已展开的 First(2) 结果
     *
     * @param ruleName 规则名
     * @param alternatives Or 节点的所有分支
     * @returns 每个分支的展开结果（三维数组）
     */
    private computeOrBranchExpansionsFromCache(alternatives: RuleNode[]): string[][][] {
        const branchExpansions: string[][][] = []

        for (let i = 0; i < alternatives.length; i++) {
            const alternative = alternatives[i]
            const t0 = Date.now()
            const directChildren = this.analyzer.computeFirstMoreExpandBranches(null, alternative)
            const elapsed = Date.now() - t0

            if (elapsed > 10) {
                console.log(`      分支${i}: computeFirstMoreExpandBranches 耗时 ${elapsed}ms, 路径数: ${directChildren.length}`)
            }

            branchExpansions.push(directChildren)
        }

        return branchExpansions
    }

    /**
     * 使用 First 集合快速预检 Or 分支冲突（旧版本）
     *
     * @deprecated 使用 quickCheckWithFirst1() 替代
     *
     * 原理：
     * - 如果两个分支的 First 集合无交集，则肯定无前缀冲突
     * - 如果有交集，则可能有冲突，需要详细检测
     *
     * 性能：
     * - 对于无冲突的情况，可以跳过昂贵的路径展开
     * - 对于有冲突的情况，额外开销可忽略
     *
     * @param alternatives Or 分支列表
     * @returns 是否可能有冲突
     */
    private quickCheckWithFirst(alternatives: RuleNode[]): boolean {
        // 计算每个分支的 First 集合
        const firstSets = alternatives.map(alt =>
            this.analyzer.computeNodeFirst(alt)
        )

        // 检查任意两个分支的 First 集合是否有交集
        for (let i = 0; i < firstSets.length; i++) {
            for (let j = i + 1; j < firstSets.length; j++) {
                const intersection = new Set(
                    [...firstSets[i]].filter(x => firstSets[j].has(x))
                )

                if (intersection.size > 0) {
                    // 有交集，可能有冲突，需要详细检测
                    return true
                }
            }
        }

        // 所有分支的 First 集合都不相交，肯定无冲突
        return false
    }


    /**
     * 将展开结果（二维数组）转换为路径字符串数组
     *
     * 例如：
     * [["A", "B"], ["C"]] → ["A,B,", "C,"]
     */
    private expansionToPaths(expansion: string[][]): Path[] {
        return expansion.map(branch => {
            if (branch.length === 0) {
                return ''
            }
            return branch.join(',') + ','
        })
    }


    /**
     * 检测前缀冲突
     *
     * 原理：使用字符串的startsWith检测前缀关系
     *
     * 示例：
     * - pathA = '=,'
     * - pathB = '==,'
     * - pathB.startsWith(pathA) → true
     * - 结论：分支A会先匹配'='，导致分支B的'=='无法完整匹配
     *
     * 注意：这是PEG的特性（贪婪匹配 + 有序选择）
     */
    private detectPrefixConflicts(
        ruleName: string,
        indexA: number,
        indexB: number,
        pathsA: Path[],
        pathsB: Path[],
        errors: ValidationError[]
    ): void {
        // 检查 A 的路径是否是 B 的前缀
        for (const pathA of pathsA) {
            // 跳过空路径（已在 Level 1 检测）
            if (pathA === '') continue

            // 跳过特殊标记（递归规则、深度过深等）
            if (pathA.startsWith('<')) {
                // 递归规则的路径无法完整分析，跳过
                continue
            }

            for (const pathB of pathsB) {
                // 跳过空路径和特殊标记
                if (pathB === '' || pathB.startsWith('<')) continue

                // 前缀检测（方案A的核心：使用字符串startsWith）
                if (this.isPrefix(pathA, pathB)) {
                    errors.push({
                        level: 'ERROR',
                        type: 'prefix-conflict',
                        ruleName,
                        branchIndices: [indexA, indexB],
                        conflictPaths: {
                            pathA,
                            pathB
                        },
                        message: `分支 ${indexB} 被分支 ${indexA} 遮蔽`,
                        suggestion: `将分支 ${indexB} 移到分支 ${indexA} 前面（长规则在前，短规则在后）`
                    })

                    // 找到一个冲突就够了，不再继续检测
                    return
                }
            }
        }
    }

    /**
     * 检查路径集合中是否有空路径
     */
    private hasEmptyPath(paths: Path[]): boolean {
        return paths.includes('')
    }

    /**
     * 检查 Or 分支本身是否可以匹配空输入（顶层空路径检测）
     *
     * 只检测分支的顶层结构，不检测内部的 Option/Many
     *
     * 真正的空路径问题：
     * - Or 的分支直接是 Option/Many（分支本身可以为空）
     * - Or 的分支是 Sequence，且第一个元素是 Option/Many
     *
     * 不是问题的情况：
     * - Or 的分支是 Sequence，第一个元素不是 Option/Many（即使后面有 Option/Many）
     * - Or 的分支是具体的 token 或 rule
     *
     * @param alternative Or 的一个分支节点
     * @returns true 如果分支本身可以为空
     */
    private hasTopLevelEmptyPath(alternative: RuleNode): boolean {
        switch (alternative.type) {
            case 'option':
            case 'many':
                // Or 的分支直接是 Option/Many，可以为空
                return true

            case 'sequence':
                // 检查 sequence 的第一个元素
                if (alternative.nodes.length === 0) {
                    return true  // 空 sequence
                }
                // 递归检查第一个元素
                return this.hasTopLevelEmptyPath(alternative.nodes[0])

            case 'or':
                // 检查 or 的所有分支，只要有一个可以为空就返回 true
                return alternative.alternatives.some(alt => this.hasTopLevelEmptyPath(alt))

            case 'atLeastOne':
                // AtLeastOne 至少匹配 1 次，不能为空
                return false

            case 'consume':
            case 'subrule':
                // token 和 rule 不能为空
                return false

            default:
                return false
        }
    }

    /**
     * 判断 pathA 是否是 pathB 的前缀
     *
     * 这是方案A的核心检测方法：使用字符串的startsWith
     *
     * 条件：
     * 1. pathA.length > 0（非空）
     * 2. pathA.length < pathB.length（A比B短）
     * 3. pathB.startsWith(pathA)（B以A开头）
     *
     * 示例：
     * - isPrefix('a,b,', 'a,b,c,') → true（'a,b,'是'a,b,c,'的前缀）
     * - isPrefix('a,b,c,', 'a,b,') → false（A比B长）
     * - isPrefix('a,b,', 'a,b,') → false（长度相等，不是前缀）
     * - isPrefix('=,', '==,') → true（'='是'=='的前缀，这是典型的Or分支顺序问题）
     *
     * PEG语义：
     * - 如果pathA是pathB的前缀，且分支A在分支B前面
     * - 那么分支A会先匹配pathA对应的token序列
     * - 导致分支B永远无法完整匹配pathB对应的token序列
     */
    private isPrefix(pathA: Path, pathB: Path): boolean {
        return pathA.length > 0 && pathA.length < pathB.length && pathB.startsWith(pathA)
    }

    /**
     * 计算笛卡尔积（带限制和性能监控）
     *
     * 将三维数组通过笛卡尔积转换为二维数组
     *
     * 例如：
     * 输入：[ [["a", "b"], ["c"]], [["TokenB"]] ]
     * 输出：[["a", "TokenB"], ["c", "TokenB"]]
     *
     * 原理：
     * - 第一个数组的每个分支 × 第二个数组的每个分支 × ... × 第N个数组的每个分支
     * - 将每个组合拼接成一个新的分支
     *
     * @param arrays 三维数组（数组的数组的数组）
     * @param ruleName 规则名称（用于日志）
     * @param branchIndex 分支索引（用于日志）
     * @returns 二维数组（所有可能的组合）
     */
    private cartesianProduct(arrays: string[][][], ruleName?: string, branchIndex?: number): string[][] {
        // ⏱️ 入口：记录开始时间和输入信息
        const startTime = Date.now()
        const inputInfo = {
            arrayCount: arrays.length,
            branchCounts: arrays.map(arr => arr.length),
            totalInputBranches: arrays.reduce((sum, arr) => sum + arr.length, 0),
            estimatedOutput: arrays.reduce((product, arr) => product * arr.length, 1)
        }

        const logPrefix = ruleName ? `[${ruleName}#${branchIndex}]` : '[笛卡尔积]'

        // 📊 输入统计
        if (inputInfo.estimatedOutput > 1000) {
            console.log(`  ${logPrefix} 笛卡尔积输入：${inputInfo.arrayCount}个数组，分支数=[${inputInfo.branchCounts.join(', ')}]，预计输出=${inputInfo.estimatedOutput}`)
        }

        if (arrays.length === 0) {
            return [[]]
        }

        if (arrays.length === 1) {
            const elapsed = Date.now() - startTime
            if (elapsed > 10) {
                console.log(`  ${logPrefix} 笛卡尔积完成：单数组直接返回，耗时${elapsed}ms`)
            }
            return arrays[0]
        }

        let result = arrays[0]

        // 📊 迭代统计
        const iterationStats: Array<{
            iteration: number,
            inputSize: number,
            arraySize: number,
            outputSize: number,
            truncated: boolean
        }> = []

        for (let i = 1; i < arrays.length; i++) {
            const iterStartTime = Date.now()
            const inputSize = result.length
            const arraySize = arrays[i].length

            const temp: string[][] = []
            const truncated = false

            for (const seq of result) {
                for (const branch of arrays[i]) {
                    temp.push([...seq, ...branch])
                }
            }

            const iterElapsed = Date.now() - iterStartTime

            // 记录迭代统计
            iterationStats.push({
                iteration: i,
                inputSize,
                arraySize,
                outputSize: temp.length,
                truncated
            })

            if (truncated) {
                console.warn(`  ${logPrefix} ⚠️ 迭代${i}：${inputSize} × ${arraySize} → ${temp.length}（截断），耗时${iterElapsed}ms`)
            } else if (iterElapsed > 100) {
                console.log(`  ${logPrefix} 迭代${i}：${inputSize} × ${arraySize} = ${temp.length}，耗时${iterElapsed}ms`)
            }

            result = temp
        }

        // ⏱️ 出口：记录结束时间和输出信息
        const totalElapsed = Date.now() - startTime
        const outputInfo = {
            actualOutput: result.length,
            wasTruncated: iterationStats.some(s => s.truncated),
            totalIterations: iterationStats.length
        }

        // 📊 更新统计信息
        this.cartesianStats.totalCalls++
        this.cartesianStats.totalTime += totalElapsed
        this.cartesianStats.totalInputArrays += inputInfo.arrayCount
        this.cartesianStats.totalOutputBranches += outputInfo.actualOutput
        if (outputInfo.wasTruncated) {
            this.cartesianStats.truncatedCount++
        }
        if (totalElapsed > this.cartesianStats.maxTime) {
            this.cartesianStats.maxTime = totalElapsed
            this.cartesianStats.maxTimeRule = ruleName || '未知'
        }

        // 📊 输出统计（降低阈值，看到更多信息）
        if (totalElapsed > 5 || outputInfo.wasTruncated || inputInfo.estimatedOutput > 100) {
            console.log(`  ${logPrefix} 笛卡尔积完成：输入${inputInfo.arrayCount}个数组，输出${outputInfo.actualOutput}个分支，耗时${totalElapsed}ms${outputInfo.wasTruncated ? '（已截断）' : ''}`)
        }

        // 📊 详细统计（仅在耗时较长时输出）
        if (totalElapsed > 50) {
            console.log(`  ${logPrefix} 详细统计：`)
            console.log(`    - 输入数组数量：${inputInfo.arrayCount}`)
            console.log(`    - 各数组分支数：[${inputInfo.branchCounts.join(', ')}]`)
            console.log(`    - 预计输出：${inputInfo.estimatedOutput}`)
            console.log(`    - 实际输出：${outputInfo.actualOutput}`)
            console.log(`    - 迭代次数：${outputInfo.totalIterations}`)
            console.log(`    - 总耗时：${totalElapsed}ms`)
            iterationStats.forEach(stat => {
                console.log(`    - 迭代${stat.iteration}：${stat.inputSize} × ${stat.arraySize} = ${stat.outputSize}${stat.truncated ? '（截断）' : ''}`)
            })
        }

        return result
    }
}

