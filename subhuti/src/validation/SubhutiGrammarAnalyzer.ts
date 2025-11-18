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
    /** 直接子节点缓存（二维数组：分支 × 节点序列） */
    private directChildrenCache = new Map<string, string[][]>()

    /** 分层展开缓存（二维数组：所有层级的分支 × 节点序列） */
    /** 路径展开缓存（规则名 → 展开路径，用于 Or 冲突详细检测） */
    private expansionCache = new Map<string, string[][]>()

    /** 完全展开的 First 集合缓存（规则名 → 叶子节点集合，用于 Or 冲突快速预检） */
    private expandedFirstCache = new Map<string, Set<string>>()

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
    preHandler(maxLevel = EXPANSION_LIMITS.MAX_LEVEL): LeftRecursionError[] {
        const leftRecursionErrors: LeftRecursionError[] = []

        // 1. 计算直接子节点缓存（First(2)）
        // ✅ 优化：跳过空 AST 的规则
        for (const ruleName of this.ruleASTs.keys()) {
            const ruleAST = this.ruleASTs.get(ruleName)
            if (!ruleAST || ruleAST.nodes.length === 0) {
                continue  // 跳过空 AST
            }
            this.initDirectChildrenCache(ruleName, EXPANSION_LIMITS.FIRST_K)
        }

        // 2. 左递归检测（不缓存，临时计算）
        // ✅ 优化：从 directChildrenCache 提取 First(1)，无需重新计算
        for (const ruleName of this.ruleASTs.keys()) {
            const ruleAST = this.ruleASTs.get(ruleName)
            if (!ruleAST || ruleAST.nodes.length === 0) {
                continue  // 跳过空 AST
            }

            // 从 directChildrenCache 获取 First(2)
            const directChildren = this.directChildrenCache.get(ruleName)

            if (!directChildren) {
                throw new Error(`系统错误：规则 "${ruleName}" 的 directChildrenCache 未初始化`)
            }

            // 临时计算 First(1)：每个分支的第一个符号（不展开，不缓存）
            const firstSet = new Set<string>()
            for (const branch of directChildren) {
                if (branch.length > 0) {
                    firstSet.add(branch[0])  // 只取第一个符号，不展开
                }
            }

            // 左递归检测：如果 First 集合包含规则名本身，就是左递归
            if (firstSet.has(ruleName)) {
                leftRecursionErrors.push({
                    level: 'FATAL',
                    type: 'left-recursion',
                    ruleName,
                    branchIndices: [],
                    conflictPaths: {pathA: '', pathB: ''},
                    message: `规则 "${ruleName}" 存在左递归`,
                    suggestion: this.getLeftRecursionSuggestion(ruleName, ruleAST, firstSet)
                })
            }
        }

        // 3. 初始化完全展开的 First 集合缓存（用于 Or 冲突快速预检）
        // ✅ firstK=1, maxLevel=Infinity（完全展开到叶子节点）
        for (const ruleName of this.ruleASTs.keys()) {
            const ruleAST = this.ruleASTs.get(ruleName)
            if (!ruleAST || ruleAST.nodes.length === 0) {
                continue  // 跳过空 AST
            }
            this.computeExpandedFirst(ruleName)
        }

        // 4. 计算路径展开缓存（用于详细的 Or 冲突检测）
        // ✅ firstK=2, maxLevel=配置值（按层级展开）
        let count = 0
        let skipped = 0
        const total = this.directChildrenCache.size
        for (const ruleName of this.directChildrenCache.keys()) {
            count++

            // 检查规则是否有 AST 节点
            const ruleAST = this.ruleASTs.get(ruleName)
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

    private getExpandChildren(ruleName: string, maxLevel: number, curLevel: number): string[][] {
        const indent = '  '.repeat(curLevel)

        // ⏱️ 性能监控：记录每次调用的时间
        const startTime = Date.now()
        const isTopLevel = curLevel === 0

        // 层级限制：达到最大层级时停止展开
        // 当 maxLevel = Infinity 时，curLevel 永远不会 >= Infinity，所以不会触发
        if (curLevel >= maxLevel) {
            SubhutiValidationLogger.debug(`${indent}[层级${curLevel}] ${ruleName} - 达到最大层级 (${maxLevel})，停止展开`, ruleName)
            return [[ruleName]]
        }

        // 检测循环引用（递归规则）
        // 使用类成员 computing 来检测递归
        if (this.computing.has(ruleName)) {
            console.log(`  🔄 ${ruleName} 检测到循环引用（层级${curLevel}），停止展开`)
            console.log(`     当前栈：[${Array.from(this.computing).join(' → ')}]`)
            SubhutiValidationLogger.debug(`${indent}[层级${curLevel}] ${ruleName} - 检测到循环引用，停止展开`, ruleName)
            return [[ruleName]]  // 遇到循环引用，停止展开
        }

        // 获取当前规则的直接子节点
        const branches = this.directChildrenCache.get(ruleName)
        if (!branches) {
            SubhutiValidationLogger.debug(`${indent}[层级${curLevel}] ${ruleName} - Token，不展开`, ruleName)
            return [[ruleName]]  // 如果不在缓存中，说明是 token
        }

        if (isTopLevel) {
            console.log(`  📊 ${ruleName} 开始展开：${branches.length} 个分支，层级${curLevel}`)
        }

        SubhutiValidationLogger.debug(`${indent}[层级${curLevel}] 开始展开 ${ruleName}，直接子节点有 ${branches.length} 个分支`, ruleName)

        // ⏱️ 如果分支数过多，输出警告
        if (isTopLevel && branches.length > 10) {
            console.log(`  ⚠️ ${ruleName} 有 ${branches.length} 个分支，可能会很慢...`)
        }

        // 标记当前规则正在计算
        this.computing.add(ruleName)

        // 🔍 调试：只在深度超过阈值时输出
        const stack = Array.from(this.computing)
        if (curLevel === 10) {
            console.log(`      ⚠️ 递归深度达到10层！规则：${ruleName}`)
            console.log(`      当前栈：[${stack.join(' → ')}]`)
        }
        if (curLevel === 20) {
            console.log(`      ❌ 递归深度达到20层！规则：${ruleName}`)
            console.log(`      当前栈：[${stack.join(' → ')}]`)
        }
        if (curLevel > 30) {
            console.error(`      💥 递归深度超过30层！规则：${ruleName}，强制停止`)
            return [[ruleName]]  // 强制停止
        }

        try {
            // 对每个分支进行展开
            const expandedBranches: string[][] = []

            for (let branchIdx = 0; branchIdx < branches.length; branchIdx++) {
                const branch = branches[branchIdx]
                const branchStartTime = Date.now()

                if (isTopLevel) {
                    console.log(`    🔹 分支 ${branchIdx + 1}/${branches.length}: [${branch.join(', ')}]`)
                }

                SubhutiValidationLogger.debug(`${indent}  处理分支 ${branchIdx + 1}/${branches.length}: [${branch.join(', ')}]`, ruleName)

                // 对分支中的每个 item 进行展开
                const expandedItems: string[][][] = []

                for (let itemIdx = 0; itemIdx < branch.length; itemIdx++) {
                    const item = branch[itemIdx]
                    const itemStartTime = Date.now()

                    if (isTopLevel) {
                        console.log(`      🔸 开始展开 ${item} (层级${curLevel + 1})`)
                    }

                    // 递归展开规则，层级+1
                    const itemBranches = this.getExpandChildren(item, maxLevel, curLevel + 1)

                    const itemElapsed = Date.now() - itemStartTime
                    if (isTopLevel) {
                        console.log(`      ⏱️ ${item} 展开完成：${itemBranches.length} 个分支，耗时 ${itemElapsed}ms`)
                    }
                    if (itemElapsed > 1000) {
                        console.warn(`      ❌ ${item} 展开耗时过长：${itemElapsed}ms (层级${curLevel + 1})`)
                    }

                    SubhutiValidationLogger.debug(`${indent}    ${item} 展开后有 ${itemBranches.length} 个分支`, ruleName)
                    expandedItems.push(itemBranches)
                }

                const branchElapsed = Date.now() - branchStartTime
                if (isTopLevel && branchElapsed > 500) {
                    console.log(`    ⚠️ 分支 ${branchIdx + 1} 处理耗时 ${branchElapsed}ms`)
                }

                // 对当前分支的所有展开结果进行笛卡尔积
                // ⏱️ 监控笛卡尔积计算
                const cartesianStartTime = Date.now()
                const cartesianResult = this.cartesianProduct(expandedItems)
                const cartesianElapsed = Date.now() - cartesianStartTime

                if (cartesianElapsed > 1000) {
                    console.log(`  ⚠️ ${ruleName} 分支${branchIdx + 1} 笛卡尔积计算耗时 ${cartesianElapsed}ms`)
                }

                SubhutiValidationLogger.debug(`${indent}    笛卡尔积后得到 ${cartesianResult.length} 个分支`, ruleName)
                expandedBranches.push(...cartesianResult)
                SubhutiValidationLogger.debug(`${indent}    当前累积总分支数: ${expandedBranches.length}`, ruleName)
            }

            SubhutiValidationLogger.debug(`${indent}[层级${curLevel}] ${ruleName} 展开完成，最终有 ${expandedBranches.length} 个分支`, ruleName)

            // ⏱️ 总体耗时统计
            const totalElapsed = Date.now() - startTime
            if (isTopLevel) {
                console.log(`  ✅ ${ruleName} 展开完成：${expandedBranches.length} 个分支，耗时 ${totalElapsed}ms`)
            }
            if (totalElapsed > 5000) {
                console.warn(`  ❌ ${ruleName} 展开耗时过长：${totalElapsed}ms (${(totalElapsed / 1000).toFixed(2)}s)`)
            }

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
     * @param firstK
     * @returns 直接子节点二维数组
     */
    private initDirectChildrenCache(ruleName: string, firstK: number) {
        if (this.directChildrenCache.has(ruleName)) {
            throw new Error('系统错误')
        }
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            throw new Error('系统错误')
        }
        const children = this.computeDirectChildren(ruleNode, firstK)

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
     * 计算节点的直接子节点
     * 返回：二维数组（分支 × 节点序列）
     *
     * 规则：
     * - token（consume）和规则名（subrule）不展开，直接返回
     * - 辅助节点（sequence、or、option、many、atLeastOne）无限递归展开
     * - 最终通过笛卡尔积合并所有分支
     *
     * @param rootNode AST 节点
     * @param firstK
     */
    public computeDirectChildren(rootNode: RuleNode, firstK: number): string[][] {
        // private computeDirectChildren(rootNode: RuleNode, maxLevel: number = 0, curLevel: number = maxLevel): string[][] {
        switch (rootNode.type) {
            case 'consume':
                return [[rootNode.tokenName]]

            case 'sequence':
                return this.computeSequenceDirectChildren(rootNode.nodes, firstK)

            case 'or':
                return this.computeOrDirectChildren(rootNode.alternatives, firstK)

            case 'option':
            case 'many':
                return this.computeOptionDirectChildren(rootNode.node, firstK)

            case 'atLeastOne':
                return this.computeAtLeastOneDirectChildren(rootNode.node, firstK)

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
    private computeOptionDirectChildren(node: SequenceNode, firstK: number): string[][] {
        const innerBranches = this.computeDirectChildren(node, firstK)
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
    private computeAtLeastOneDirectChildren(node: SequenceNode, firstK: number): string[][] {
        const innerBranches = this.computeDirectChildren(node, firstK)
        const doubleBranches = innerBranches.map(branch => [...branch, ...branch])
        return [...innerBranches, ...doubleBranches]
    }

    /**
     * 计算序列的直接子节点（需要笛卡尔积）
     * A B → 所有 A的分支 × B的分支 的组合
     */
    private computeSequenceDirectChildren(nodes: RuleNode[], firstK: number): string[][] {
        if (nodes.length === 0) {
            return [[]]
        }

        // 每个规则的每个分支，限制为 First(3)
        const allBranches = nodes.map(node => {
            const branches = this.computeDirectChildren(node, firstK)
            branches.forEach(branch => branch.splice(firstK))
            return branches
        })

        const res = this.cartesianProduct(allBranches)

        // 笛卡尔积结果也限制为 First(3)
        res.forEach(path => path.splice(firstK))

        return res
    }

    /**
     * 计算 Or 的直接子节点（直接合并，不需要笛卡尔积）
     * A / B → A的所有分支 + B的所有分支
     */
    private computeOrDirectChildren(alternatives: RuleNode[], firstK: number): string[][] {
        const result: string[][] = []

        for (const alt of alternatives) {
            const branches = this.computeDirectChildren(alt, firstK)
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
        this.expandedFirstCache.clear()
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

        // 检查是否是叶子节点（token）
        if (!this.ruleASTs.has(ruleName)) {
            const tokenSet = new Set([ruleName])
            this.expandedFirstCache.set(ruleName, tokenSet)
            return tokenSet
        }

        // 从 directChildrenCache 获取直接子节点
        const directChildren = this.directChildrenCache.get(ruleName)
        if (!directChildren) {
            throw new Error(`系统错误：规则 "${ruleName}" 的 directChildrenCache 未初始化`)
        }

        // 递归展开每个分支的第一个符号
        const expandedSet = new Set<string>()
        for (const branch of directChildren) {
            if (branch.length > 0) {
                const firstSymbol = branch[0]

                if (this.ruleASTs.has(firstSymbol)) {
                    // 是规则名：递归展开
                    const expanded = this.computeExpandedFirst(firstSymbol)
                    expanded.forEach(symbol => expandedSet.add(symbol))
                } else {
                    // 是叶子节点：直接添加
                    expandedSet.add(firstSymbol)
                }
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
        const branches = this.computeDirectChildren(node, 1)
        const expandedSet = new Set<string>()

        for (const branch of branches) {
            if (branch.length > 0) {
                const firstSymbol = branch[0]

                if (this.ruleASTs.has(firstSymbol)) {
                    // 从 expandedFirstCache 获取完全展开的 First 集合
                    const expanded = this.expandedFirstCache.get(firstSymbol)
                    if (expanded) {
                        expanded.forEach(symbol => expandedSet.add(symbol))
                    } else {
                        // 缓存未命中：计算并缓存
                        const computed = this.computeExpandedFirst(firstSymbol)
                        computed.forEach(symbol => expandedSet.add(symbol))
                    }
                } else {
                    // 是叶子节点
                    expandedSet.add(firstSymbol)
                }
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

