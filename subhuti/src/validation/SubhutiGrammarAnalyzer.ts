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
 * 展开限制配置
 *
 * 用于防止笛卡尔积爆炸导致的内存溢出
 *
 * 设计理念：
 * - 使用动态分支数限制代替固定层级限制
 * - 分支少时可以展开更深，分支多时提前停止
 * - 循环引用检测防止无限递归
 * - 更加智能和灵活
 *
 * 三层防护：
 * 1. MAX_BRANCHES_BEFORE_EXPAND：展开前检查，分支数过多则提前停止
 * 2. MAX_ITEM_BRANCHES：限制单个 item 的展开结果，超过则截断
 * 3. MAX_OUTPUT_BRANCHES：限制最终输出分支数，超过则截断
 */
export const EXPANSION_LIMITS = {
    /**
     * 最大展开层级
     * - Infinity：无限制（完全依赖分支数限制和循环引用检测）
     * - 数字：固定层级限制（例如 3 表示最多展开 3 层）
     *
     * 默认值：Infinity（无层级限制）
     *
     * 说明：
     * - 循环引用检测会防止无限递归（栈溢出）
     * - 分支数限制会防止内存溢出
     * - 因此不需要固定层级限制
     * - 用户可以根据需要设置为具体数字（如 3）来限制展开深度
     */
    MAX_LEVEL: Infinity,

    /**
     * 展开前的分支数阈值（动态层级限制）
     * 如果当前规则的直接子节点分支数超过此值，则提前停止展开
     * 这样可以动态控制展开深度：分支少时展开更深，分支多时提前停止
     */
    MAX_BRANCHES_BEFORE_EXPAND: 100,

    /** 单个 item 展开结果的分支数上限（超过则截断） */
    MAX_ITEM_BRANCHES: 100,

    /** 单个规则的最终展开结果分支数上限（超过则截断） */
    MAX_OUTPUT_BRANCHES: 1000,
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
            maxLevel: options?.maxLevel ?? EXPANSION_LIMITS.MAX_LEVEL
        }
    }

    /**
     * 初始化缓存（遍历所有规则，计算直接子节点和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
     */
    initializeCaches(maxLevel = EXPANSION_LIMITS.MAX_LEVEL): void {
        // 遍历所有规则
        for (const ruleName of this.ruleASTs.keys()) {
            // 计算直接子节点缓存
            this.initDirectChildrenCache(ruleName)
        }
        for (const ruleName of this.directChildrenCache.keys()) {
            this.initExpansionCache(ruleName, maxLevel)
        }
    }

    private getExpandChildren(ruleName: string, maxLevel: number, curLevel: number): string[][] {
        // 只对特定规则启用详细日志
        const enableLog = ['MemberExpression', 'CallExpression', 'OptionalExpression'].includes(ruleName)
        const indent = '  '.repeat(curLevel)

        // 层级限制：达到最大层级时停止展开
        // 当 maxLevel = Infinity 时，curLevel 永远不会 >= Infinity，所以不会触发
        if (curLevel >= maxLevel) {
            if (enableLog) console.log(`${indent}[层级${curLevel}] ${ruleName} - 达到最大层级 (${maxLevel})，停止展开`)
            return [[ruleName]]
        }

        // 检测循环引用（递归规则）
        // 使用类成员 computing 来检测递归
        if (this.computing.has(ruleName)) {
            if (enableLog) console.log(`${indent}[层级${curLevel}] ${ruleName} - 检测到循环引用，停止展开`)
            return [[ruleName]]  // 遇到循环引用，停止展开
        }

        // 获取当前规则的直接子节点
        const branches = this.directChildrenCache.get(ruleName)
        if (!branches) {
            if (enableLog) console.log(`${indent}[层级${curLevel}] ${ruleName} - Token，不展开`)
            return [[ruleName]]  // 如果不在缓存中，说明是 token
        }

        if (enableLog) console.log(`${indent}[层级${curLevel}] 开始展开 ${ruleName}，直接子节点有 ${branches.length} 个分支`)

        // 🎯 动态分支数限制：基于分支数决定是否继续展开（截断点 1）
        // 如果分支数已经很多，说明继续展开会导致笛卡尔积爆炸，提前停止
        // 如果分支数很少，可以继续展开（受可选的固定层级限制约束）
        // 这样可以在分支数多时提前停止，避免浪费计算
        if (branches.length > EXPANSION_LIMITS.MAX_BRANCHES_BEFORE_EXPAND) {
            if (enableLog) console.warn(`${indent}规则 ${ruleName} 的分支数 (${branches.length}) 超过阈值 (${EXPANSION_LIMITS.MAX_BRANCHES_BEFORE_EXPAND})，提前停止展开`)
            return [[ruleName]]
        }

        // 标记当前规则正在计算
        this.computing.add(ruleName)

        try {
            // 对每个分支进行展开
            const expandedBranches: string[][] = []

            for (let branchIdx = 0; branchIdx < branches.length; branchIdx++) {
                const branch = branches[branchIdx]
                if (enableLog) console.log(`${indent}  处理分支 ${branchIdx + 1}/${branches.length}: [${branch.join(', ')}]`)

                // 对分支中的每个 item 进行展开
                const expandedItems: string[][][] = []

                for (const item of branch) {
                    // 递归展开规则，层级+1
                    const itemBranches = this.getExpandChildren(item, maxLevel, curLevel + 1)
                    if (enableLog) console.log(`${indent}    ${item} 展开后有 ${itemBranches.length} 个分支`)
                    expandedItems.push(itemBranches)

                    // 限制展开结果数量（截断点 2：单个 item 截断）
                    if (itemBranches.length > EXPANSION_LIMITS.MAX_ITEM_BRANCHES) {
                        console.warn(`${indent}    规则 ${item} 的展开结果过多 (${itemBranches.length})，截断到 ${EXPANSION_LIMITS.MAX_ITEM_BRANCHES}`)
                        expandedItems[expandedItems.length - 1] = itemBranches.slice(0, EXPANSION_LIMITS.MAX_ITEM_BRANCHES)
                    }
                }

                // 对当前分支的所有展开结果进行笛卡尔积
                const cartesianResult = this.cartesianProduct(expandedItems)
                if (enableLog) console.log(`${indent}    笛卡尔积后得到 ${cartesianResult.length} 个分支`)
                expandedBranches.push(...cartesianResult)
                if (enableLog) console.log(`${indent}    当前累积总分支数: ${expandedBranches.length}`)

                // 限制总分支数（截断点 3：输出截断）
                if (expandedBranches.length > EXPANSION_LIMITS.MAX_OUTPUT_BRANCHES) {
                    console.warn(`${indent}✂️ 规则 ${ruleName} 的展开分支数过多 (${expandedBranches.length})，截断到 ${EXPANSION_LIMITS.MAX_OUTPUT_BRANCHES}`)
                    console.warn(`${indent}   已处理 ${branchIdx + 1}/${branches.length} 个直接子节点分支`)
                    console.warn(`${indent}   当前分支: [${branch.join(', ')}]`)
                    return expandedBranches.slice(0, EXPANSION_LIMITS.MAX_OUTPUT_BRANCHES)
                }
            }

            if (enableLog) console.log(`${indent}[层级${curLevel}] ${ruleName} 展开完成，最终有 ${expandedBranches.length} 个分支`)
            return expandedBranches
        } finally {
            // 移除标记
            this.computing.delete(ruleName)
        }
    }


    /**
     * 获取规则的直接子节点（只缓存一层）
     *
     * @param ruleName 规则名称
     * @returns 直接子节点二维数组
     */
    private initDirectChildrenCache(ruleName: string) {
        if (this.directChildrenCache.has(ruleName)) {
            throw new Error('系统错误')
        }
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误')
        }
        const children = this.computeDirectChildren(ruleNode)

        this.directChildrenCache.set(ruleName, children)
    }

    private initExpansionCache(ruleName: string, maxLevel: number) {
        if (this.expansionCache.has(ruleName)) {
            throw new Error('系统错误')
        }
        const ruleNode = this.directChildrenCache.get(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误')
        }

        // 清空 computing 集合，开始新的展开计算
        this.computing.clear()

        const rulesBranches = this.getExpandChildren(ruleName, maxLevel, 0)

        this.expansionCache.set(ruleName, rulesBranches)
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
     * 从缓存中获取规则的展开结果
     *
     * 用于冲突检测时获取规则的完全展开结果
     *
     * @param ruleName 规则名称或 token 名称
     * @returns 展开结果（二维数组），如果不在缓存中返回 undefined
     */
    getExpansionFromCache(ruleName: string): string[][] | undefined {
        return this.expansionCache.get(ruleName)
    }

    /**
     * 计算节点的直接子节点（公开方法）
     *
     * 用于冲突检测时获取节点的直接子节点
     * - 展开所有辅助节点（sequence、or、option、many、atLeastOne）
     * - 保留 token 和 ruleName 不展开
     *
     * @param node AST 节点
     * @returns 直接子节点二维数组
     */
    computeDirectChildrenPublic(node: RuleNode): string[][] {
        return this.computeDirectChildren(node)
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
    public computeDirectChildren(rootNode: RuleNode): string[][] {
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

