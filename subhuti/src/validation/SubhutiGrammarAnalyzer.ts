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

import type {RuleNode, Path, SequenceNode, ValidationError, SubruleNode, ConsumeNode} from "./SubhutiValidationError"
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
    MAX_LEVEL: Infinity,
    MIN_LEVEL: 1,
    INFINITY_LEVEL: Infinity,

    FIRST_K: 1000,
    FIRST_1: 1,

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
    /** 直接子节点缓存（First(2)，不展开规则名） */
    private firstKCache = new Map<string, string[][]>()
    /** 完全展开的 First 集合缓存（First(1)，完全展开到叶子节点，用于 Or 冲突快速预检） */
    private first1ExpandCache = new Map<string, string[][]>()

    /** 路径展开缓存（First(2)，按层级展开，用于 Or 冲突详细检测） */
    private firstKExpandCache = new Map<string, string[][]>()


    /** First(1) 集合缓存（不展开规则名，用于左递归检测） 一个规则内，各个分支的  第一个 规则  */
    private first1Cache = new Map<string, string[][]>()

    /** 正在计算的规则（用于检测递归） */
    private computing = new Set<string>()

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
            maxLevel: options?.maxLevel ?? EXPANSION_LIMITS.MAX_LEVEL
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
     * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @param maxLevel 最大展开层级（默认使用配置中的 MAX_LEVEL）
     * @returns 左递归错误列表
     */
    initCacheAndCheckLeftRecursion(): LeftRecursionError[] {
        const leftRecursionErrors: LeftRecursionError[] = []

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

            console.log(children)
            // 缓存结果
            this.firstKCache.set(ruleName, children)

            // 🔍 DEBUG: 输出特定规则的结果
            if (this.debugRules.has(ruleName)) {
                console.log(`\n📊 [preHandler] 规则 "${ruleName}" 的 firstMoreCache:`)
                console.log(`  结果: ${JSON.stringify(children)}`)
            }


            const error = this.initFirstCache(ruleName)
            if (error) {
                leftRecursionErrors.push(error)
            }
        }

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
     * 初始化 first1Cache（First(1)，不展开规则名）+ 左递归检测
     *
     * 目的：
     * 1. 生成每个规则的第 1 个符号（不展开规则名）
     * 2. 检测左递归
     *
     * 输入：从 firstMoreCache 提取
     *
     * 实现：
     * 1. 检查缓存是否已存在，存在则抛错
     * 2. 从 firstMoreCache 获取分支数组
     * 3. 遍历每个分支，提取第一个符号
     * 4. 存储为 string[][]（每个分支只有 1 个符号）
     * 5. 检测左递归：如果 Set(第一个符号) 包含 ruleName，则报错
     * 6. 缓存结果到 first1Cache
     *
     * 缓存格式：
     * Map<string, string[][]>
     * 例如："Expression" → [["Term"], ["Term"]]
     *
     * 关键：不调用 computeExpanded，直接从 firstMoreCache 提取
     *
     * @param ruleName 规则名
     * @returns 如果检测到左递归，返回错误对象；否则返回 null
     */
    private initFirstCache(ruleName: string): LeftRecursionError {
        // 检查缓存是否已存在
        if (this.first1Cache.has(ruleName)) {
            throw new Error('系统错误：first1Cache 已存在')
        }

        // 从 firstMoreCache 获取 First(2) 分支
        const directChildren = this.firstKCache.get(ruleName)
        if (!directChildren) {
            throw new Error(`系统错误：规则 "${ruleName}" 的 firstMoreCache 未初始化`)
        }

        // 🔍 DEBUG: 输出关键规则的 firstKCache
        const shouldDebug = ruleName === 'Statement' || ruleName === 'Expression' || ruleName === 'Script'
        if (shouldDebug) {
            console.log(`\n🔍 [initFirstCache] 规则: ${ruleName}`)
            console.log(`  firstKCache 分支数: ${directChildren.length}`)
            if (directChildren.length <= 15) {
                console.log(`  firstKCache 内容: ${JSON.stringify(directChildren)}`)
            } else {
                console.log(`  firstKCache 前5个分支: ${JSON.stringify(directChildren.slice(0, 5))}`)
            }
        }

        // 提取每个分支的第一个符号
        const firstAry: string[][] = []
        for (const branch of directChildren) {
            if (branch.length > 0) {
                firstAry.push([branch[0]])
            }
        }

        if (shouldDebug) {
            console.log(`  提取的 firstAry: ${JSON.stringify(firstAry)}`)
        }

        console.log(firstAry)
        // 缓存 First(1)（存储为 string[][]）
        this.first1Cache.set(ruleName, firstAry)

        // 转换为 Set 用于左递归检测
        const firstSet = new Set(firstAry.map(item => item[0]))

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
    }

    /**
     * 初始化 first1ExpandCache（First(1)，完全展开到叶子节点）
     *
     * 目的：生成每个规则的第 1 个符号（完全展开到叶子节点/token）
     *
     * 参数：
     * - firstK = 1
     * - maxLevel = Infinity（无限层级展开）
     *
     * 实现：
     * 1. 检查缓存是否已存在，存在则抛错
     * 2. 获取规则的 AST 节点
     * 3. 调用 computeExpanded(ruleNode, ruleName, 1, Infinity)
     *    - 内部会从 first1Cache 获取已截断的分支
     *    - 遍历分支中的符号，递归展开
     * 4. 缓存结果到 first1ExpandCache
     *
     * 缓存格式：
     * Map<string, string[][]>
     * 例如："Expression" → [["NUMBER"], ["IDENTIFIER"]]
     *
     * 关键：computeExpanded 内部从 first1Cache 获取数据，避免重复计算
     *
     * @param ruleName 规则名
     */
    private initFirst1ExpandCache(ruleName: string): void {
        // 检查缓存是否已存在
        if (this.first1ExpandCache.has(ruleName)) {
            return
            // throw new Error('系统错误：first1ExpandCache 已存在')
        }

        // 调用 computeExpanded：firstK=1, maxLevel=Infinity（完全展开）
        const children = this.computeFirst1ExpandBranches(ruleName)

        // 提取第一个符号（用于调试或验证）
        const firstSet = new Set<string>()
        for (const branch of children) {
            if (branch.length > 0) {
                firstSet.add(branch[0])
            }
        }

        // 🔍 DEBUG: 输出关键规则的 First(1) 结果
        const shouldDebug = ruleName === 'Statement' || ruleName === 'Expression' || ruleName === 'BlockStatement' || ruleName === 'Script' || ruleName === 'ForInOfStatement'
        if (shouldDebug) {
            console.log(`\n🔍 [initFirst1ExpandCache] 规则: ${ruleName}`)
            console.log(`  分支数: ${children.length}`)
            console.log(`  First(1) 集合大小: ${firstSet.size}`)
            console.log(`  First(1) 集合: {${Array.from(firstSet).join(', ')}}`)
            if (children.length <= 10) {
                console.log(`  所有分支:`)
                children.forEach((branch, idx) => {
                    console.log(`    [${idx}] ${JSON.stringify(branch)}`)
                })
            } else {
                console.log(`  前5个分支:`)
                children.slice(0, 5).forEach((branch, idx) => {
                    console.log(`    [${idx}] ${JSON.stringify(branch)}`)
                })
            }
        }

        // 缓存结果
        this.first1ExpandCache.set(ruleName, children)
    }


    /**
     * 初始化 firstMoreExpandCache（First(2)，按层级展开）
     *
     * 目的：生成每个规则的前 2 个符号（按配置的层级展开，例如 3 层）
     *
     * 参数：
     * - firstK = 2
     * - maxLevel = 3（或配置的最大层级）
     *
     * 实现：
     * 1. 检查缓存是否已存在，存在则抛错
     * 2. 获取规则的 AST 节点
     * 3. 调用 computeExpanded(ruleNode, null, 2, 3)
     *    - 内部会从 firstMoreCache 获取已截断的分支
     *    - 遍历分支中的符号，递归展开（最多 3 层）
     * 4. 缓存结果到 firstMoreExpandCache
     *
     * 缓存格式：
     * Map<string, string[][]>
     * 例如："Expression" → [["NUMBER", "+"], ["IDENTIFIER", "+"]]
     *
     * 关键：computeExpanded 内部从 firstMoreCache 获取数据，避免重复计算
     *
     * @param ruleName 规则名
     */
    private initFirstMoreExpandCache(ruleName: string) {
        // 检查缓存是否已存在
        if (this.firstKExpandCache.has(ruleName)) {
            // throw new Error('系统错误：firstMoreExpandCache 已存在：' + ruleName)
            return
        }

        // 调用 computeExpanded：firstK=2, maxLevel=配置值（按层级展开）
        const children = this.computeFirstMoreExpandBranches(ruleName)

        // 缓存结果
        this.firstKExpandCache.set(ruleName, children)
    }


    public computeFirstMoreBranches(ruleName: string, ruleNode: RuleNode = null) {
        const shouldDebug = this.debugRules.has(ruleName)

        if (shouldDebug) {
            console.log(`\n🔍 [DEBUG] computeFirstMoreBranches 开始`)
            console.log(`  规则名: ${ruleName}`)
            console.log(`  传入节点: ${ruleNode ? ruleNode.type : 'null'}`)
            console.log(`  参数: firstK=2, curLevel=0, maxLevel=0`)
        }

        const result = this.computeExpanded(ruleName, ruleNode, EXPANSION_LIMITS.FIRST_K)

        console.log(result)

        if (shouldDebug) {
            console.log(`  返回结果: ${JSON.stringify(result)}`)
            console.log(`🔍 [DEBUG] computeFirstMoreBranches 结束\n`)
        }

        return result
    }

    public computeFirst1ExpandBranches(ruleName: string, ruleNode: RuleNode = null) {
        return this.computeExpanded(ruleName, ruleNode, EXPANSION_LIMITS.FIRST_1, 0, EXPANSION_LIMITS.INFINITY_LEVEL)
    }

    public computeFirstMoreExpandBranches(ruleName: string, ruleNode: RuleNode = null) {
        return this.computeExpanded(ruleName, ruleNode, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.MAX_LEVEL)
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


    /**
     * 计算节点的完全展开 First 集合（用于 Or 冲突检测）
     *
     * @param node AST 节点
     * @returns 完全展开的 First 集合（只包含叶子节点）
     */
    public computeNodeFirst(node: SequenceNode): Set<string> {
        // 清空循环检测集合（即使没有规则名，子规则可能有）
        this.computing.clear()

        // 🔍 调试日志：检查节点结构
        const nodeRuleName = (node as any).ruleName
        console.log(`\n🔍🔍🔍 [computeNodeFirst] 被调用，规则名: ${nodeRuleName || 'null'}`)

        if (nodeRuleName && (nodeRuleName === 'BreakableStatement' || nodeRuleName === 'IterationStatement')) {
            console.log(`\n🔍 [computeNodeFirst] 规则: ${nodeRuleName}`)
            console.log(`   节点类型: ${node.type}`)
            console.log(`   节点结构: ${JSON.stringify(node, null, 2)}`)
        }

        // 调用内部递归方法（ruleName 为 null）
        let paths: string[][]
        try {
            paths = this.computeFirst1ExpandBranches(null, node)

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

        // 提取每个路径的第一个符号
        const expandedSet = new Set<string>()
        for (const path of paths) {
            if (path.length > 0) {
                expandedSet.add(path[0])
            }
        }

        // 🔍 调试日志：检查 First 集合
        if (nodeRuleName && (nodeRuleName === 'BreakableStatement' || nodeRuleName === 'IterationStatement')) {
            console.log(`   First(1) 集合: ${Array.from(expandedSet).join(', ')}`)
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
        maxLevel: number = EXPANSION_LIMITS.MIN_LEVEL
    ): string[][] {


        try {
            if (ruleName) {
                return this.subRuleHandler(ruleName, firstK, curLevel, maxLevel)
            }
            switch (node.type) {
                case 'consume':
                    return [[node.tokenName]]

                case 'subrule':
                    return this.subRuleHandler(node.ruleName, firstK, curLevel, maxLevel)

                case 'or':
                    // Or 节点：遍历所有分支，合并结果
                    return this.expandOr(node.alternatives, firstK, curLevel, maxLevel)

                case 'sequence':
                    return this.expandSequenceNode(node, firstK, curLevel, maxLevel);

                case 'option':
                case 'many':
                    // Option/Many 节点：0次或多次
                    return this.expandOption(node.node, firstK, curLevel, maxLevel)

                case 'atLeastOne':
                    // AtLeastOne 节点：1次或多次
                    return this.expandAtLeastOne(node.node, firstK, curLevel, maxLevel)

                default:
                    throw new Error(`未知节点类型: ${(node as any).type}`)
            }
        } finally {
            // 清除计算标记
            if (ruleName) {
                this.computing.delete(ruleName)
            }
        }
    }

    private expandSequenceNode(node: SequenceNode, firstK: number, curLevel: number, maxLevel: number) {
        // 内联 sequence：直接展开子节点
        if (node.nodes.length === 0) {
            console.log(111111)
            // throw new Error('错误的情况')
            //有可能有弃用的规则
            return [[]]
        }

        // 遍历子节点，递归展开（curLevel 不变，因为不是 subrule）
        const allBranches = node.nodes.map(node => this.computeExpanded(null, node, firstK, curLevel, maxLevel))

        //这些地方都加上缓存 todo
        // 笛卡尔积组合所有分支
        const result = this.cartesianProduct(allBranches)

        // 截断到 firstK（因为笛卡尔积可能组合出超过 firstK 的路径）
        result.forEach(path => path.splice(firstK))

        return result
    }

    private subRuleHandler(ruleName: string, firstK: number, curLevel: number, maxLevel: number) {
        curLevel++

        if (!ruleName) {
            throw new Error('系统错误')
        }

        const shouldDebug = this.debugRules.has(ruleName)

        if (shouldDebug) {
            console.log(`  🔸 [computeExpanded] 进入`)
            console.log(`    ruleName: ${ruleName}`)
            console.log(`    firstK: ${firstK}, curLevel: ${curLevel}, maxLevel: ${maxLevel}`)
        }

        // 循环检测：如果规则正在计算中，停止展开
        if (this.computing.has(ruleName)) {
            if (shouldDebug) {
                console.log(`    ⚠️ 检测到循环：${ruleName} 正在计算中，返回 [[${ruleName}]]`)
            }
            return [[ruleName]]
        }

        // 标记当前规则正在计算
        this.computing.add(ruleName)
        if (shouldDebug) {
            console.log(`    ✓ 标记 ${ruleName} 为正在计算`)
        }

        // Subrule 节点：检查层级限制
        // 🔍 调试日志：追踪 subrule 处理
        const isTargetSubrule = ruleName === 'BreakableStatement' || ruleName === 'IterationStatement'
        if (isTargetSubrule) {
            console.log(`\n🔍 [subrule] 处理子规则: ${ruleName}`)
            console.log(`   当前 ruleName 参数: ${ruleName}`)
            console.log(`   curLevel: ${curLevel}, maxLevel: ${maxLevel}`)
            console.log(`   firstK: ${firstK}`)
        }

        if (shouldDebug) {
            console.log(`    📍 subrule 节点：${ruleName}`)
            console.log(`      curLevel(${curLevel}) <= maxLevel(${maxLevel})? ${curLevel <= maxLevel}`)
        }

        if (curLevel > maxLevel) {
            // 达到最大层级，不再展开
            if (shouldDebug) {
                console.log(`      ⚠️ 达到最大层级，返回 [[${ruleName}]]（不展开）`)
            }
            return [[ruleName]]
        }

        // Sequence 节点：处理序列
        // 规则声明：从缓存获取已截断的分支
        if (firstK === EXPANSION_LIMITS.FIRST_1 && maxLevel === EXPANSION_LIMITS.INFINITY_LEVEL) {
            if (this.first1ExpandCache.has(ruleName)) {
                if (shouldDebug) {
                    console.log(`    ✓ 缓存命中：first1ExpandCache[${ruleName}]`)
                }
                return this.first1ExpandCache.get(ruleName)
            }

            // First(1) 完全展开：从 first1Cache 获取
            const allBranchesCache = this.first1Cache.get(ruleName)
            if (!allBranchesCache) {
                const tempNode = this.tokenCache.get(ruleName)
                if (tempNode.type === 'consume') {
                    return [[ruleName]]
                }
                throw new Error('系统错误：first1Cache 未初始化')
            }
            // 遍历每个分支，递归展开分支中的符号
            // 注意：这里是 Or 分支，应该合并所有分支的展开结果，而不是笛卡尔积
            const result: string[][] = []
            for (const branch of allBranchesCache) {
                if (branch.length !== firstK) {
                    throw new Error('系统错误')
                }
                const item = branch[0]
                // 递归展开符号（curLevel 不变，因为从缓存获取）
                const itemRes = this.subRuleHandler(item, firstK, curLevel, maxLevel)
                itemRes.forEach(order => order.splice(firstK))
                // 缓存展开结果
                if (!this.first1ExpandCache.has(item)) {
                    this.first1ExpandCache.set(item, itemRes)
                }
                // 合并所有展开结果
                result.push(...itemRes)
            }
            return result
        } else if (firstK === EXPANSION_LIMITS.FIRST_K && maxLevel === EXPANSION_LIMITS.MAX_LEVEL) {
            if (this.firstKExpandCache.has(ruleName)) {
                if (shouldDebug) {
                    console.log(`    ✓ 缓存命中：firstMoreExpandCache[${ruleName}]`)
                }
                return this.firstKExpandCache.get(ruleName)
            }

            // First(2) 按层级展开：从 firstMoreCache 获取
            const allBranchesCache = this.firstKCache.get(ruleName)
            if (!allBranchesCache) {
                const tempNode = this.tokenCache.get(ruleName)
                if (tempNode.type === 'consume') {
                    return [[ruleName]]
                }
                throw new Error('系统错误：firstMoreCache 未初始化:' + ruleName)
            }
            // 遍历每个分支，递归展开分支中的符号
            // 注意：这里是 Or 分支，应该合并所有分支的展开结果，而不是笛卡尔积
            const result: string[][] = []
            for (const branch of allBranchesCache) {
                if (branch.length > firstK) {
                    throw new Error('系统错误：firstMoreCache 未初始化')
                }
                const branchRules = branch.map(item => {
                    // 递归展开符号（curLevel 不变，因为从缓存获取）
                    const itemRes = this.subRuleHandler(item, firstK, curLevel, maxLevel)
                    itemRes.forEach(order => order.splice(firstK))
                    // 缓存展开结果
                    if (!this.firstKExpandCache.has(item)) {
                        this.firstKExpandCache.set(item, itemRes)
                    }
                    return itemRes
                })
                // 笛卡尔积组合分支中的符号（这是正确的，因为 branch 是一个序列）
                const branchExpanded = this.cartesianProduct(branchRules)
                // 合并所有分支的展开结果
                result.push(...branchExpanded)
            }
            return result
        }

        if (firstK === EXPANSION_LIMITS.FIRST_K && maxLevel === EXPANSION_LIMITS.MIN_LEVEL) {
            if (this.firstKCache.has(ruleName)) {
                return this.firstKCache.get(ruleName)
            }
        }

        // 未达到最大层级，递归展开子规则（curLevel + 1）09hl8k7mny98i7uyjknhg b
        if (shouldDebug) {
            console.log(`      ✓ 未达到最大层级，递归展开 ${ruleName}（curLevel + 1 = ${curLevel + 1}）`)
        }
        const subNode = this.getRuleNodeByAst(ruleName)
        if (!subNode) {
            throw new Error('系统错误：子规则不存在')
        }

        // 🔍 调试日志：追踪递归调用
        if (isTargetSubrule) {
            console.log(`   🔍 递归调用 computeExpanded(null, subNode, ${firstK}, ${curLevel + 1}, ${maxLevel})`)
            console.log(`   ⚠️ 注意：传入的 ruleName = null，无法使用缓存和循环检测！`)
        }


        // 根据节点类型分发处理
        if (shouldDebug) {
            console.log(`    📌 处理节点类型: ${subNode.type}`)
        }

        const result = this.expandSequenceNode(subNode, firstK, curLevel, maxLevel)

        if (firstK === EXPANSION_LIMITS.FIRST_K && maxLevel === EXPANSION_LIMITS.MIN_LEVEL) {
            if (!this.firstKCache.has(ruleName)) {
                this.firstKCache.set(ruleName, result)
            }
        }

        return result

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
            const branches = this.computeExpanded(null, alt, firstK, curLevel, maxLevel)
            result.push(...branches)
        }

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
        const innerBranches = this.computeExpanded(null, node, firstK, curLevel, maxLevel)
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
        const innerBranches = this.computeExpanded(null, node, firstK, curLevel, maxLevel)
        const doubleBranches = innerBranches.map(branch => [...branch, ...branch])
        return [...innerBranches, ...doubleBranches]
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

