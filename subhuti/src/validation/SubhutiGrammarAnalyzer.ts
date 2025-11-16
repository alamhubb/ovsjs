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

import type {RuleNode, Path, SequenceNode} from "./SubhutiValidationError"

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
    /** 直接子节点缓存（二维数组：分支 × 节点序列） */
    private directChildrenCache = new Map<string, string[][]>()

    /** 分层展开缓存（二维数组：所有层级的分支 × 节点序列） */
    private expansionCache = new Map<string, string[][]>()

    /** First集合缓存 */
    private firstCache = new Map<string, Set<string>>()

    /** 正在计算的规则（用于检测递归） */
    private computing = new Set<string>()

    /** 正在计算First集合的规则（用于检测递归） */
    private computingFirst = new Set<string>()

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
            maxLevel: options?.maxLevel ?? 3
        }
    }

    /**
     * 初始化缓存（遍历所有规则，计算直接子节点和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     */
    initializeCaches(maxLevel = 3): void {
        // 遍历所有规则
        for (const ruleName of this.ruleASTs.keys()) {
            // 计算直接子节点缓存
            this.getDirectChildren(ruleName)
        }
        for (const ruleName of this.directChildrenCache.keys()) {

            this.getExpandChildren(ruleName, maxLevel, 0)
        }
    }

    private getExpandChildren(ruleName: string, maxLevel: number = 0, curLevel: number = maxLevel): string[][] {

        if (curLevel >= maxLevel) return

        const ruleBranches = this.directChildrenCache.get(ruleName)

        const newRulesBranches = ruleBranches.map(branch => {
            const newAllRules = branch.map(item => this.directChildrenCache.get(item))
            const newBranch = this.cartesianProduct(newAllRules)
            return newBranch
        })

        return this.cartesianProduct(newRulesBranches)
    }


    /**
     * 获取规则的直接子节点（只缓存一层）
     *
     * @param ruleName 规则名称
     * @returns 直接子节点二维数组
     */
    private getDirectChildren(ruleName: string): string[][] {
        if (this.directChildrenCache.has(ruleName)) {
            return this.directChildrenCache.get(ruleName)
        }

        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            //token节点
            return []
        }

        const children = this.computeDirectChildren(ruleNode)

        this.directChildrenCache.set(ruleName, children)

        return children
    }

    /**
     * 计算规则的分层展开结果
     *
     * @param ruleName 规则名称
     * @returns 分层展开结果（二维数组，包含所有层级的所有分支）
     */
    computeExpansion(ruleName: string): string[][] {
        if (this.expansionCache.has(ruleName)) {
            return this.expansionCache.get(ruleName)!
        }

        if (this.computing.has(ruleName)) {
            return []
        }

        this.computing.add(ruleName)

        try {
            const ruleNode = this.ruleASTs.get(ruleName)
            if (!ruleNode) {
                return []
            }

            const expansion = this.computeNodeExpansion(ruleNode)
            this.expansionCache.set(ruleName, expansion)

            return expansion
        } finally {
            this.computing.delete(ruleName)
        }
    }

    /**
     * 计算节点的分层展开结果（公开方法）
     *
     * @param node AST 节点
     * @returns 分层展开结果
     */
    computeNodeExpansionPublic(node: RuleNode): string[][] {
        return this.computeNodeExpansion(node)
    }

    /**
     * 计算节点的分层展开（核心递归方法）
     * 返回：所有层级的所有分支（二维数组）
     */
    private computeNodeExpansion(node: RuleNode): string[][] {
        const directBranches = this.computeDirectChildren(node)
        const allBranches: string[][] = [...directBranches]
        let currentLevelBranches = directBranches

        for (let level = 1; level < this.options.maxLevel; level++) {
            const newBranches = this.expandOneLevelFrom(currentLevelBranches)
            if (newBranches.length === 0) break

            allBranches.push(...newBranches)
            currentLevelBranches = newBranches
        }

        return allBranches
    }

    /**
     * 从给定的分支展开一层
     */
    private expandOneLevelFrom(branches: string[][]): string[][] {
        const result: string[][] = []

        for (const branch of branches) {
            const expandedBranches = this.expandBranch(branch)
            result.push(...expandedBranches)
        }

        return result
    }

    /**
     * 展开一个分支（将其中的第一个可展开的规则名替换为子节点）
     *
     * 注意：只展开第一个规则，返回所有可能的新分支
     * 例如：[A, B] → 如果 A 有 2 个子节点 [a1, a2]，返回 [[a1, a2, B]]
     */
    private expandBranch(branch: string[]): string[][] {
        // 找到第一个可展开的规则
        for (let i = 0; i < branch.length; i++) {
            const node = branch[i]

            // 跳过空节点
            if (node === '') {
                continue
            }

            // 获取该规则的直接子节点
            // 如果是 token（不在 ruleASTs 中），getDirectChildren 会返回空数组
            if (children.length === 0) continue

            // 展开这个规则，生成所有可能的新分支
            const result: string[][] = []
            for (const childBranch of children) {
                const newBranch = [
                    ...branch.slice(0, i),      // 前面的部分
                    ...childBranch,              // 替换为子节点
                    ...branch.slice(i + 1)       // 后面的部分
                ]
                result.push(newBranch)
            }

            // 找到第一个可展开的规则后就返回
            return result
        }

        // 没有可展开的规则，返回空数组
        return []
    }


    /**
     * 计算节点的直接子节点
     * 返回：二维数组（分支 × 节点序列）
     *
     * 规则：
     * - token（consume）和规则名（subrule）不展开，直接返回
     * - 辅助节点（sequence、or、option、many、atLeastOne）无限递归展开
     * - 最终通过笛卡尔积合并所有分支
     *
     * @param rootNode AST 节点
     * @param maxLevel
     * @param curLevel
     */
    private computeDirectChildren(rootNode: RuleNode): string[][] {
        // private computeDirectChildren(rootNode: RuleNode, maxLevel: number = 0, curLevel: number = maxLevel): string[][] {
        switch (rootNode.type) {
            case 'consume':
                return [[rootNode.tokenName]]

            case 'sequence':
                return this.computeSequenceDirectChildren(rootNode.nodes)

            case 'or':
                return this.computeOrDirectChildren(rootNode.alternatives)

            case 'option':
            case 'many':
                return this.computeOptionDirectChildren(rootNode.node)

            case 'atLeastOne':
                return this.computeAtLeastOneDirectChildren(rootNode.node)

            case 'subrule':
                return [[rootNode.ruleName]]
            // if (curLevel >= maxLevel) {
            //     return [[rootNode.ruleName]]
            // } else {
            //     return this.directChildrenCache.get(rootNode.ruleName)
            // }
            default:
                console.warn(`Unknown node type: ${(rootNode as any).type}`)
                return []
        }
    }

    /**
     * 计算 Option/Many 的直接子节点
     * 0次或1次 → [[], ...内部分支]
     *
     * 例如：Option(A)
     * - 如果 A 有 2 个分支：[["a1"], ["a2"]]
     * - 返回：[[], ["a1"], ["a2"]]
     *
     * 在序列中使用时：
     * B Option(C) D → 笛卡尔积
     * [["B"]] × [[], ["C"]] × [["D"]]
     * = [["B", "D"], ["B", "C", "D"]]
     */
    private computeOptionDirectChildren(node: SequenceNode): string[][] {
        const innerBranches = this.computeDirectChildren(node)
        return [[], ...innerBranches]
    }

    /**
     * 计算 AtLeastOne 的直接子节点
     * 1次或2次 → [...内部分支, ...内部分支×2]
     *
     * 例如：AtLeastOne(A)
     * - 如果 A 有 1 个分支：[["a"]]
     * - 返回：[["a"], ["a", "a"]]
     */
    private computeAtLeastOneDirectChildren(node: SequenceNode): string[][] {
        const innerBranches = this.computeDirectChildren(node)
        const doubleBranches = innerBranches.map(branch => [...branch, ...branch])
        return [...innerBranches, ...doubleBranches]
    }

    /**
     * 计算序列的直接子节点（需要笛卡尔积）
     * A B → 所有 A的分支 × B的分支 的组合
     */
    private computeSequenceDirectChildren(nodes: RuleNode[]): string[][] {
        if (nodes.length === 0) {
            return [[]]
        }

        const allBranches = nodes.map(node => this.computeDirectChildren(node))
        return this.cartesianProduct(allBranches)
    }

    /**
     * 计算 Or 的直接子节点（直接合并，不需要笛卡尔积）
     * A / B → A的所有分支 + B的所有分支
     */
    private computeOrDirectChildren(alternatives: RuleNode[]): string[][] {
        const result: string[][] = []

        for (const alt of alternatives) {
            const branches = this.computeDirectChildren(alt)
            result.push(...branches)
        }

        return result
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
        this.expansionCache.clear()
        this.firstCache.clear()
    }
}

