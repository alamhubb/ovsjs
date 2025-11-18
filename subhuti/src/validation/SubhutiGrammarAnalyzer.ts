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
 * 用途：为SubhutiConflictDetector提供路径数据，用于检测Or分支冲突
 *
 * @version 2.0.0 - 分层展开版本
 */

import type {RuleNode, Path, SequenceNode, ValidationError} from "./SubhutiValidationError"
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
     * 最大展开层级
     * - Infinity：无限制（完全依赖循环引用检测）
     * - 数字：固定层级限制（例如 3 表示最多展开 3 层）
     *
     * 默认值：3（展开 3 层）
     *
     * 说明：
     * - 循环引用检测会防止无限递归（栈溢出）
     * - ✅ 实践中发现 Infinity 会导致性能问题（PrimaryExpression 等复杂规则会卡死）
     * - 3 层足够检测大部分 Or 分支冲突
     * - 用户可以根据需要设置为具体数字来限制展开深度
     */
    MAX_LEVEL: 3,

    FIRST_K: 2,

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
    MAX_BRANCHES: Infinity,
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
    /** 直接子节点缓存（First(2)，不展开规则名） */
    private first2Cache = new Map<string, string[][]>()

    /** First(1) 集合缓存（不展开规则名，用于左递归检测） */
    private firstCache = new Map<string, Set<string>>()

    /** 完全展开的 First 集合缓存（First(1)，完全展开到叶子节点，用于 Or 冲突快速预检） */
    private expandedFirstCache = new Map<string, Set<string>>()

    /** 路径展开缓存（First(2)，按层级展开，用于 Or 冲突详细检测） */
    private expansionFirst2Cache = new Map<string, string[][]>()

    /** 正在计算的规则（用于检测递归） */
    private computing = new Set<string>()

    /** 配置选项 */
    private options: Required<GrammarAnalyzerOptions>

    /**
     * 构造函数
     *
     * @param ruleASTs 规则名称 → AST 的映射
     * @param options 配置选项
     */
    constructor(
        private ruleASTs: Map<string, SequenceNode>,
        options?: GrammarAnalyzerOptions
    ) {
        this.options = {
            maxLevel: options?.maxLevel ?? EXPANSION_LIMITS.MAX_LEVEL
        }
    }

    /**
     * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
     * @returns 左递归错误列表
     */
    preHandler(): LeftRecursionError[] {
        const leftRecursionErrors: LeftRecursionError[] = []

        // 1. 计算直接子节点缓存（First(2)）
        // ✅ 优化：跳过空 AST 的规则
        for (const ruleName of this.ruleASTs.keys()) {
            this.initFirst2Cache(ruleName)
            const error = this.initFirstCache(ruleName)
            if (error) {
                leftRecursionErrors.push(error)
            }
        }

        // 3. 初始化完全展开的 First 集合缓存（用于 Or 冲突快速预检）
        // ✅ firstK=1, maxLevel=Infinity（完全展开到叶子节点）
        for (const ruleName of this.ruleASTs.keys()) {
            this.computeExpandedFirst(ruleName)
        }

        // 4. 计算路径展开缓存（用于详细的 Or 冲突检测）
        // ✅ firstK=2, maxLevel=配置值（按层级展开）
        let count = 0
        let skipped = 0
        const total = this.first2Cache.size
        for (const ruleName of this.first2Cache.keys()) {
            count++

            // 检查规则是否有 AST 节点
            const ruleAST = this.getRuleNodeByAst(ruleName)
            if (!ruleAST || ruleAST.nodes.length === 0) {
                skipped++
                console.log(`[${count}/${total}] 跳过 ${ruleName} (空 AST)`)
                continue
            }

            const startTime = Date.now()
            console.log(`[${count}/${total}] 初始化展开缓存: ${ruleName}`)
            this.initExpansionCache(ruleName, maxLevel)
            const elapsed = Date.now() - startTime

            if (elapsed > 1000) {
                console.log(`  ⚠️ ${ruleName} 耗时 ${elapsed}ms (${(elapsed / 1000).toFixed(2)}s)`)
            }

            if (elapsed > 10000) {
                console.error(`  ❌❌❌ ${ruleName} 耗时超过10秒！`)
            }
        }

        console.log(`✅ 展开缓存初始化完成：处理 ${count - skipped}/${total} 个规则，跳过 ${skipped} 个空 AST`)

        return leftRecursionErrors
    }


    /**
     * 获取规则的直接子节点（只缓存一层）
     *
     * @param ruleName 规则名称
     * @returns 直接子节点二维数组
     */
    private initFirst2Cache(ruleName: string) {
        if (this.first2Cache.has(ruleName)) {
            throw new Error('系统错误：directChildrenCache 已存在')
        }
        const ruleNode = this.getRuleNodeByAst(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误：规则不存在')
        }
        // 清空循环检测集合
        this.computing.clear()

        // firstK=2, maxLevel=0（不展开规则名）
        const children = this.computeExpanded(ruleNode, null, EXPANSION_LIMITS.FIRST_K)

        this.first2Cache.set(ruleName, children)
    }

    /**
     * 初始化 firstCache + 左递归检测
     * - 从 directChildrenCache 提取 First(1)
     * - 存储为 Set<string>
     * - 检测左递归
     *
     * @param ruleName 规则名
     * @returns 如果检测到左递归，返回错误对象；否则返回 null
     */
    private initFirstCache(ruleName: string): LeftRecursionError | null {
        if (this.firstCache.has(ruleName)) {
            throw new Error('系统错误：firstCache 已存在')
        }

        // 从 directChildrenCache 获取 First(2)
        const directChildren = this.first2Cache.get(ruleName)
        if (!directChildren) {
            throw new Error(`系统错误：规则 "${ruleName}" 的 directChildrenCache 未初始化`)
        }

        // 提取 First(1)：每个分支的第一个符号
        const firstSet = new Set<string>()
        for (const branch of directChildren) {
            if (branch.length > 0) {
                firstSet.add(branch[0])  // 只取第一个符号
            }
        }

        // 缓存 First(1) Set
        this.firstCache.set(ruleName, firstSet)

        // 左递归检测：如果 First 集合包含规则名本身，就是左递归
        if (firstSet.has(ruleName)) {
            const ruleAST = this.getRuleNodeByAst(ruleName)!
            return {
                level: 'FATAL',
                type: 'left-recursion',
                ruleName,
                branchIndices: [],
                conflictPaths: {pathA: '', pathB: ''},
                message: `规则 "${ruleName}" 存在左递归`,
                suggestion: this.getLeftRecursionSuggestion(ruleName, ruleAST, firstSet)
            }
        }

        return null  // 无左递归
    }

    private initExpansionCache(ruleName: string, maxLevel: number) {
        if (this.expansionFirst2Cache.has(ruleName)) {
            throw new Error('系统错误：展开缓存已存在')
        }

        // 使用通用展开方法：firstK=2, maxLevel=配置值
        const rulesBranches = this.expandFromRule(ruleName, EXPANSION_LIMITS.FIRST_K, maxLevel)

        this.expansionFirst2Cache.set(ruleName, rulesBranches)
    }

    /**
     * 从缓存中获取规则的展开结果
     *
     * 用于冲突检测时获取规则的完全展开结果
     *
     * @param ruleName 规则名称或 token 名称
     * @returns 展开结果（二维数组），如果不在缓存中返回 undefined
     */
    getExpansionFromCache(ruleName: string): string[][] | undefined {
        return this.expansionFirst2Cache.get(ruleName)
    }


    /**
     * 计算节点的直接子节点（不展开规则名）
     *
     * 等价于：expandFromNode(node, firstK, 0)
     * - firstK: 取前 K 个符号
     * - maxLevel=0: 不展开规则名
     *
     * @param rootNode AST 节点
     * @param firstK 取前 K 个符号
     * @returns 直接子节点路径数组
     */
    public computeDirectChildren(rootNode: RuleNode, firstK: number): string[][] {
        return this.expandFromNode(rootNode, firstK, 0)
    }

    /**
     * 计算笛卡尔积
     * [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
     */
    private cartesianProduct(arrays: string[][][]): string[][] {
        if (arrays.length === 0) {
            return [[]]
        }

        if (arrays.length === 1) {
            return arrays[0]
        }

        let result = arrays[0]

        for (let i = 1; i < arrays.length; i++) {
            const temp: string[][] = []
            for (const seq of result) {
                for (const branch of arrays[i]) {
                    temp.push([...seq, ...branch])
                }
            }
            result = temp
        }

        return result
    }

    clearCache(): void {
        cache.clear()
        this.first2Cache.clear()
        this.firstCache.clear()
        this.expandedFirstCache.clear()
        this.expansionFirst2Cache.clear()
    }

    // ============================================================================
    // 通用展开方法（支持 firstK 和 maxLevel 参数）
    // ============================================================================

    /**
     * 公开方法：从规则名开始展开
     *
     * @param ruleName - 规则名
     * @param firstK - 取前 K 个符号
     * @param maxLevel - 最大展开层级（0 = 不展开，Infinity = 完全展开）
     * @returns 展开后的路径数组
     */
    public expandFromRule(ruleName: string, firstK: number, maxLevel: number): string[][] {
        const node = this.getRuleNodeByAst(ruleName)
        if (!node) {
            // 是 token
            return [[ruleName]]
        }

        // 清空循环检测集合
        this.computing.clear()

        // 调用内部递归方法
        return this.computeExpanded(node, ruleName, firstK, maxLevel, 0)
    }

    /**
     * 公开方法：从节点开始展开
     *
     * @param node - AST 节点
     * @param firstK - 取前 K 个符号
     * @param maxLevel - 最大展开层级（0 = 不展开，Infinity = 完全展开）
     * @returns 展开后的路径数组
     */
    public expandFromNode(node: RuleNode, firstK: number, maxLevel: number): string[][] {
        // 清空循环检测集合（即使没有规则名，子规则可能有）
        this.computing.clear()

        // 调用内部递归方法（ruleName 为 null）
        return this.computeExpanded(node, null, firstK, maxLevel, 0)
    }


    getRuleNodeByAst(ruleName: string) {
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误')
        }
        return ruleNode
    }

    /**
     * 内部递归方法：通用展开逻辑（只接受 ruleNode）
     *
     * @param node - AST 节点
     * @param ruleName - 规则名（用于循环检测和缓存，可能为 null）
     * @param firstK - 取前 K 个符号
     * @param maxLevel - 最大展开层级( curLevel < maxLevel 就持续展开)
     * @param curLevel - 当前层级（从1开始）
     * @returns 展开后的路径数组
     *
     * 使用场景：
     * - firstK=1, maxLevel=EXPANSION_LIMITS.MAX_LEVEL：左递归检测（不展开，只取第一个符号）
     * - firstK=2, maxLevel=EXPANSION_LIMITS.MAX_LEVEL：first2Cache（不展开，取前两个符号）
     * - firstK=1, curLevel = 1, maxLevel=Infinity；完全展开的 First 集合（展开到叶子节点）
     * - firstK=2, curLevel = 1, maxLevel=EXPANSION_LIMITS.MAX_LEVEL：路径展开缓存（展开 maxLevel 层，取前两个符号）
     */
    private computeExpanded(
        node: RuleNode,
        ruleName: string | null,
        firstK: number,
        curLevel: number = EXPANSION_LIMITS.MAX_LEVEL,
        maxLevel: number = EXPANSION_LIMITS.MAX_LEVEL
    ): string[][] {
        // 1. 循环检测（只对有规则名的节点）
        if (ruleName && this.computing.has(ruleName)) {
            return [[ruleName]]
        }

        // 2. 标记正在计算
        if (ruleName) {
            this.computing.add(ruleName)
        }

        try {
            // 3. 根据节点类型处理
            switch (node.type) {
                case 'consume':
                    return [[node.tokenName]]

                case 'subrule':
                    // 检查层级限制（只对 subrule 检查，因为只有它会增加层级）
                    if (curLevel < maxLevel) {
                        // 递归展开子规则
                        const subNode = this.getRuleNodeByAst(node.ruleName)
                        if (!subNode) {
                            return [[node.ruleName]]  // token
                        }
                        return this.computeExpanded(subNode, node.ruleName, firstK, curLevel + 1, maxLevel)
                    }
                    return [[node.ruleName]]  // 达到最大层级，不再展开


                case 'or':
                    return this.expandOr(node.alternatives, firstK, curLevel, maxLevel)

                case 'sequence':
                    return this.expandSequence(node.nodes, firstK, curLevel, maxLevel)

                case 'option':
                case 'many':
                    return this.expandOption(node.node, firstK, curLevel, maxLevel)

                case 'atLeastOne':
                    return this.expandAtLeastOne(node.node, firstK, curLevel, maxLevel)

                default:
                    console.warn(`Unknown node type: ${(node as any).type}`)
                    return []
            }
        } finally {
            // 4. 清除标记
            if (ruleName) {
                this.computing.delete(ruleName)
            }
        }
    }

    /**
     * 展开 Or 节点
     */
    private expandOr(
        alternatives: RuleNode[],
        firstK: number,
        curLevel: number,
        maxLevel: number
    ): string[][] {
        const result: string[][] = []

        for (const alt of alternatives) {
            const branches = this.computeExpanded(alt, null, firstK, curLevel, maxLevel)
            result.push(...branches)
        }

        return result
    }

    /**
     * 展开 Sequence 节点
     */
    private expandSequence(
        nodes: RuleNode[],
        firstK: number,
        curLevel: number,
        maxLevel: number
    ): string[][] {
        if (nodes.length === 0) {
            return [[]]
        }

        // 展开每个节点
        const allBranches = nodes.map(node =>
            this.computeExpanded(node, null, firstK, curLevel, maxLevel)
        )

        // 笛卡尔积
        const result = this.cartesianProduct(allBranches)

        // 截断到 firstK
        result.forEach(path => path.splice(firstK))

        return result
    }

    /**
     * 展开 Option/Many 节点
     */
    private expandOption(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number
    ): string[][] {
        const innerBranches = this.computeExpanded(node, null, firstK, curLevel, maxLevel)
        return [[], ...innerBranches]
    }

    /**
     * 展开 AtLeastOne 节点
     */
    private expandAtLeastOne(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number
    ): string[][] {
        const innerBranches = this.computeExpanded(node, null, firstK, curLevel, maxLevel)
        const doubleBranches = innerBranches.map(branch => [...branch, ...branch])
        return [...innerBranches, ...doubleBranches]
    }

    // ============================================================================
    // First 集合计算（用于 Or 冲突快速预检）
    // ============================================================================

    /**
     * 递归计算完全展开的 First 集合（展开到叶子节点）
     *
     * 用于 Or 冲突快速预检：
     * - firstK = 1（只取第一个符号）
     * - maxLevel = Infinity（完全展开到叶子节点）
     *
     * @param ruleName 规则名
     * @returns 完全展开的 First 集合（只包含叶子节点/终结符）
     */
    private computeExpandedFirst(ruleName: string): Set<string> {
        // 检查缓存
        if (this.expandedFirstCache.has(ruleName)) {
            return this.expandedFirstCache.get(ruleName)!
        }

        // 使用通用展开方法：firstK=1, maxLevel=Infinity
        const paths = this.expandFromRule(ruleName, 1, Infinity)

        // 提取每个路径的第一个符号
        const expandedSet = new Set<string>()
        for (const path of paths) {
            if (path.length > 0) {
                expandedSet.add(path[0])
            }
        }

        // 缓存结果
        this.expandedFirstCache.set(ruleName, expandedSet)
        return expandedSet
    }

    /**
     * 计算节点的完全展开 First 集合（用于 Or 冲突检测）
     *
     * @param node AST 节点
     * @returns 完全展开的 First 集合（只包含叶子节点）
     */
    public computeNodeFirst(node: RuleNode): Set<string> {
        // 使用通用展开方法：firstK=1, maxLevel=Infinity
        const paths = this.expandFromNode(node, 1, Infinity)

        // 提取每个路径的第一个符号
        const expandedSet = new Set<string>()
        for (const path of paths) {
            if (path.length > 0) {
                expandedSet.add(path[0])
            }
        }

        return expandedSet
    }

    /**
     * 获取规则的完全展开 First 集合（公开方法）
     *
     * @param ruleName 规则名
     * @returns 完全展开的 First 集合（只包含叶子节点）
     */
    public getExpandedFirst(ruleName: string): Set<string> {
        const cached = this.expandedFirstCache.get(ruleName)

        if (cached) {
            return cached
        }

        // 缓存未命中：可能是 token（不在 ruleASTs 中）
        if (!this.ruleASTs.has(ruleName)) {
            // 是 token，返回包含自身的集合
            const tokenSet = new Set([ruleName])
            this.expandedFirstCache.set(ruleName, tokenSet)
            return tokenSet
        }

        // 规则存在但缓存未命中：系统错误
        throw new Error(`系统错误：规则 "${ruleName}" 的完全展开 First 集合未初始化，请先调用 preHandler()`)
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
        node: SequenceNode,
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

