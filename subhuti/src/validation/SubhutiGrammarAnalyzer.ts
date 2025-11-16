/**
 * Subhuti Grammar Validation - 语法分析器
 *
 * 功能：计算规则的所有可能路径（扁平化字符串）
 *
 * 实现方案：方案A - 完全展开subrule，计算实际token序列
 *
 * 核心原理：
 * 1. **展开subrule**：遇到subrule节点时，递归计算该规则的所有可能token序列
 *    - 不是记录subrule名称（如'Arguments'）
 *    - 而是展开为实际的token路径（如'LParen,Identifier,RParen,'）
 *
 * 2. **笛卡尔积拼接**：对于sequence节点，计算所有子节点路径的笛卡尔积
 *    - 示例：['a,'] × ['b,', 'c,'] = ['a,b,', 'a,c,']
 *
 * 3. **路径格式**：使用逗号分隔的字符串表示token序列
 *    - 示例：'LParen,RParen,' 表示 LParen → RParen
 *    - 优点：可以直接使用字符串的startsWith检测前缀关系
 *
 * 4. **缓存机制**：每个规则的路径只计算一次，避免重复计算
 *
 * 5. **性能优化**：
 *    - 路径数量限制：默认10000条（防止路径爆炸）
 *    - 路径长度限制：默认1000个token（防止过长路径）
 *    - 渐进式终止：达到限制立即停止，避免不必要的计算
 *
 * 用途：为SubhutiConflictDetector提供路径数据，用于检测Or分支冲突
 *
 * @version 1.0.0
 */

import type { RuleNode, Path } from "./SubhutiValidationError"

/**
 * 语法分析器配置
 */
export interface GrammarAnalyzerOptions {
    /** 
     * 单规则路径数量上限（防止路径爆炸）
     * 默认: 10000
     */
    maxPaths?: number
    
    /** 
     * 单路径长度上限（token数量）
     * 默认: maxPaths / 10 (例如：10000 → 1000)
     * 
     * 说明：路径长度与路径数量自动关联，简化配置
     */
    maxPathLength?: number
}

/**
 * 语法分析器
 *
 * 职责：
 * 1. 接收规则 AST
 * 2. 递归计算所有可能路径（完全展开）
 * 3. 递归计算First集合（只计算第一个token）
 * 4. 路径直接存储为字符串（'Token1,Token2,'）
 * 5. 使用缓存避免重复计算
 *
 * 性能：
 * - 默认限制：10000条路径，每条最多1000个token
 * - 渐进式终止：达到限制立即停止，避免不必要计算
 * - 缓存机制：规则路径只计算一次
 *
 * 两种模式：
 * - 完全展开模式：computeNodePaths() - 精确但可能路径爆炸
 * - First集合模式：computeNodeFirst() - 快速但不够精确
 */
export class SubhutiGrammarAnalyzer {
    /** 路径缓存（完全展开） */
    private pathCache = new Map<string, Path[]>()

    /** First集合缓存 */
    private firstCache = new Map<string, Set<string>>()

    /** 正在计算路径的规则（用于检测递归） */
    private computingPaths = new Set<string>()

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
        private ruleASTs: Map<string, RuleNode>,
        options?: GrammarAnalyzerOptions
    ) {
        const maxPaths = options?.maxPaths || 100000
        this.options = {
            maxPaths,
            // maxPathLength 默认为 maxPaths / 10（除非用户明确指定）
            maxPathLength: options?.maxPathLength ?? Math.ceil(maxPaths / 10)
        }
    }
    
    /**
     * 计算规则的所有路径
     *
     * 注意：不需要循环检测，因为Parser在收集AST时已经检测过了
     *
     * 切换模式：
     * - 完全展开模式：使用 computeNodePaths(ruleNode)
     * - First集合模式：使用 computeNodeFirst(ruleNode)，然后转换为路径格式
     *
     * @param ruleName 规则名称
     * @returns 路径数组
     */
    computePaths(ruleName: string): Path[] {
        // 1. 缓存检查
        if (this.pathCache.has(ruleName)) {
            return this.pathCache.get(ruleName)!
        }

        // 2. 获取 AST
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            console.warn(`Rule "${ruleName}" not found`)
            return []
        }

        // 3. 递归计算路径
        // ============================================
        // 🔄 切换点：在这里切换使用哪种模式
        // ============================================

        // 模式1：完全展开（精确但可能路径爆炸）
        const paths = this.computeNodePaths(ruleNode)

        // 模式2：First集合（快速但不够精确）
        // const firstSet = this.computeNodeFirst(ruleNode)
        // const paths = this.convertFirstSetToPaths(firstSet)

        // ============================================

        // 4. 限制路径数量
        const limitedPaths = this.limitPaths(paths)

        // 5. 缓存结果
        this.pathCache.set(ruleName, limitedPaths)

        return limitedPaths
    }

    /**
     * 将First集合转换为路径格式
     *
     * 用于First集合模式
     *
     * @param firstSet First集合
     * @returns 路径数组
     */
    private convertFirstSetToPaths(firstSet: Set<string>): Path[] {
        const paths: Path[] = []

        for (const token of firstSet) {
            if (token === 'ε') {
                // 空路径
                paths.push('')
            } else {
                // token路径
                paths.push(token + ',')
            }
        }

        return paths
    }

    // ============================================
    // First集合计算（新增）
    // ============================================

    /**
     * 计算规则的First集合
     *
     * First集合：规则可能匹配的第一个token的集合
     * 特殊值 'ε' 表示规则可以为空
     *
     * @param ruleName 规则名称
     * @returns First集合
     */
    computeRuleFirst(ruleName: string): Set<string> {
        // 1. 缓存检查
        if (this.firstCache.has(ruleName)) {
            return this.firstCache.get(ruleName)!
        }

        // 2. 检测递归
        if (this.computingFirst.has(ruleName)) {
            // 递归规则：返回空集合（避免无限递归）
            return new Set()
        }

        // 3. 标记为正在计算
        this.computingFirst.add(ruleName)

        try {
            // 4. 获取 AST
            const ruleNode = this.ruleASTs.get(ruleName)
            if (!ruleNode) {
                console.warn(`Rule "${ruleName}" not found`)
                return new Set()
            }

            // 5. 递归计算First集合
            const first = this.computeNodeFirst(ruleNode)

            // 6. 缓存结果
            this.firstCache.set(ruleName, first)

            return first
        } finally {
            // 7. 清除计算标记
            this.computingFirst.delete(ruleName)
        }
    }

    /**
     * 计算节点的First集合
     *
     * @param node AST 节点
     * @returns First集合
     */
    computeNodeFirst(node: RuleNode): Set<string> {
        switch (node.type) {
            case 'consume':
                // consume('Token') → { 'Token' }
                return new Set([node.tokenName])

            case 'subrule':
                // subrule → 递归计算子规则的First
                return this.computeRuleFirst(node.ruleName)

            case 'sequence':
                // sequence → 第一个非空节点的First
                return this.computeSequenceFirst(node.nodes)

            case 'or':
                // or → 所有分支的First的并集
                return this.computeOrFirst(node.alternatives)

            case 'option':
                // option → 内部节点的First ∪ { ε }
                const optionFirst = this.computeNodeFirst(node.node)
                optionFirst.add('ε')  // 可以为空
                return optionFirst

            case 'many':
                // many → 内部节点的First ∪ { ε }
                const manyFirst = this.computeNodeFirst(node.node)
                manyFirst.add('ε')  // 可以为空（0次重复）
                return manyFirst

            case 'atLeastOne':
                // atLeastOne → 内部节点的First
                return this.computeNodeFirst(node.node)
        }
    }

    /**
     * 计算序列的First集合
     */
    private computeSequenceFirst(nodes: RuleNode[]): Set<string> {
        const first = new Set<string>()

        for (const node of nodes) {
            const nodeFirst = this.computeNodeFirst(node)

            // 添加非空的First
            for (const token of nodeFirst) {
                if (token !== 'ε') {
                    first.add(token)
                }
            }

            // 如果当前节点不可空，停止
            if (!nodeFirst.has('ε')) {
                break
            }
        }

        // 如果所有节点都可空，则序列也可空
        if (nodes.length === 0 || nodes.every(node => this.computeNodeFirst(node).has('ε'))) {
            first.add('ε')
        }

        return first
    }

    /**
     * 计算Or的First集合
     */
    private computeOrFirst(alternatives: RuleNode[]): Set<string> {
        const first = new Set<string>()

        for (const alt of alternatives) {
            const altFirst = this.computeNodeFirst(alt)

            // 合并所有分支的First
            for (const token of altFirst) {
                first.add(token)
            }
        }

        return first
    }

    // ============================================
    // 完全展开路径计算（原有方法）
    // ============================================

    /**
     * 计算节点的所有路径
     * 
     * 注意：不需要深度限制，通过 cartesianProduct 的渐进式终止来控制
     * 
     * @param node AST 节点
     * @returns 路径数组
     */
    computeNodePaths(node: RuleNode): Path[] {
        switch (node.type) {
            case 'consume':
                // consume('Token') → ['Token,']
                return [node.tokenName + ',']
            
            case 'sequence':
                // sequence → 笛卡尔积拼接
                return this.computeSequencePaths(node.nodes)
            
            case 'or':
                // or → 合并所有分支
                return this.computeOrPaths(node.alternatives)
            
            case 'option':
                // option → ['', ...innerPaths]
                return this.computeOptionPaths(node.node)
            
            case 'many':
                // many → 近似为 option（0次或多次，我们只记录0次和1次）
                return this.computeOptionPaths(node.node)
            
            case 'atLeastOne':
                // atLeastOne → 至少1次，返回1次的路径
                return this.computeNodePaths(node.node)
            
            case 'subrule':
                // subrule → 递归展开，计算该规则的所有可能token序列
                // 这是方案A的核心：不记录subrule名称，而是完全展开为实际token
                // 示例：subrule('Arguments') → ['LParen,RParen,', 'LParen,Identifier,RParen,', ...]
                return this.computePaths(node.ruleName)
            
            default:
                console.warn(`Unknown node type: ${(node as any).type}`)
                return []
        }
    }
    
    /**
     * 计算序列路径（笛卡尔积）
     */
    private computeSequencePaths(nodes: RuleNode[]): Path[] {
        if (nodes.length === 0) {
            return ['']
        }

        // 渐进式计算：逐个节点计算并拼接，而不是先全部计算再拼接
        // 这样可以在达到限制时提前终止
        let result: Path[] = ['']

        for (const node of nodes) {
            const nodePaths = this.computeNodePaths(node)

            // 与当前结果做笛卡尔积
            const newResult: Path[] = []
            for (const prefix of result) {
                for (const suffix of nodePaths) {
                    newResult.push(prefix + suffix)

                    // 检查路径数量限制
                    if (newResult.length >= this.options.maxPaths) {
                        console.warn(`Path count reached limit (${this.options.maxPaths}) in sequence paths`)
                        return newResult
                    }
                }
            }

            result = newResult

            // 如果当前结果为空，提前终止
            if (result.length === 0) {
                return []
            }
        }

        return result
    }
    
    /**
     * 计算 Or 路径（合并所有分支）
     */
    private computeOrPaths(alternatives: RuleNode[]): Path[] {
        const allPaths: Path[] = []

        for (const alt of alternatives) {
            const paths = this.computeNodePaths(alt)
            // 避免使用 push(...paths)，因为当paths很大时会导致栈溢出
            // 使用 concat 或循环代替
            for (const path of paths) {
                allPaths.push(path)

                // 检查路径数量限制
                if (allPaths.length >= this.options.maxPaths) {
                    console.warn(`Path count reached limit (${this.options.maxPaths}) in Or paths`)
                    return allPaths
                }
            }
        }

        return allPaths
    }
    
    /**
     * 计算 Option 路径（空路径 + 内部路径）
     */
    private computeOptionPaths(node: RuleNode): Path[] {
        const innerPaths = this.computeNodePaths(node)

        // 空路径在前（表示跳过）
        // 避免使用展开运算符，防止栈溢出
        const result: Path[] = ['']
        for (const path of innerPaths) {
            result.push(path)
        }
        return result
    }
    
    /**
     * 笛卡尔积（字符串拼接）+ 渐进式路径限制
     * 
     * 优化：在计算过程中就检查路径数量，达到上限立即停止
     * 
     * 示例：
     * ['a,'] × ['b,', 'c,'] = ['a,b,', 'a,c,']
     */
    private cartesianProduct(arrays: Path[][]): Path[] {
        if (arrays.length === 0) {
            return ['']
        }
        
        return arrays.reduce((acc, curr) => {
            // ⭐ 提前终止：如果累积路径已达上限，不再计算
            if (acc.length >= this.options.maxPaths) {
                console.warn(`Path count reached limit (${this.options.maxPaths}), stopping cartesian product`)
                return acc
            }
            
            const result: Path[] = []
            
            for (const a of acc) {
                for (const c of curr) {
                    const combined = a + c
                    
                    // 检查路径长度
                    if (this.countTokens(combined) <= this.options.maxPathLength) {
                        result.push(combined)
                        
                        // ⭐ 实时检查：达到上限立即返回
                        if (result.length >= this.options.maxPaths) {
                            console.warn(`Path count reached limit (${this.options.maxPaths}) during calculation`)
                            return result
                        }
                    }
                }
            }
            return result
        }, [''])
    }
    
    /**
     * 限制路径数量
     */
    private limitPaths(paths: Path[]): Path[] {
        if (paths.length <= this.options.maxPaths) {
            return paths
        }
        
        console.warn(`Path count (${paths.length}) exceeds limit (${this.options.maxPaths}), truncating`)
        return paths.slice(0, this.options.maxPaths)
    }
    
    /**
     * 计算路径中的 token 数量
     */
    private countTokens(path: Path): number {
        if (path === '') return 0
        // 'Token1,Token2,' → 2个逗号 → 2个token
        return (path.match(/,/g) || []).length
    }
    
    /**
     * 清除缓存
     */
    clearCache(): void {
        this.pathCache.clear()
    }
}

