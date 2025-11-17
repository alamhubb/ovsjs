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

import type { SubhutiGrammarAnalyzer } from "./SubhutiGrammarAnalyzer"
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
     * 检测所有冲突
     * 
     * @returns 错误列表
     */
    detectAllConflicts(): ValidationError[] {
        const errors: ValidationError[] = []
        
        // 遍历所有规则
        for (const [ruleName, ruleNode] of this.ruleASTs) {
            this.detectNodeConflicts(ruleName, ruleNode, errors)
        }
        
        return errors
    }
    
    /**
     * 递归检测节点冲突
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
     * 计算 Or 分支的完全展开结果（公共方法）
     *
     * 这是 Or 冲突检测的核心数据计算逻辑，被所有检测类型共用：
     * - 空路径检测
     * - 前缀冲突检测
     * - 未来可能的其他检测（如 LL(k) 检测）
     *
     * 核心步骤：
     * 1. 遍历 Or 节点的每个分支
     * 2. 对每个分支调用 computeDirectChildren 获取直接子节点（展开辅助节点，保留 token 和 ruleName）
     * 3. 对每个分支中的每个规则从 expansionCache 中获取其完全展开结果
     * 4. 通过笛卡尔积将规则替换为其展开结果，得到完整的 token 路径
     *
     * @param alternatives Or 节点的所有分支
     * @returns 每个分支的完全展开结果（三维数组）
     *          - 第一维：Or 的每个分支
     *          - 第二维：每个分支的所有可能路径
     *          - 第三维：每条路径的 token 序列
     */
    private computeOrBranchExpansions(alternatives: RuleNode[]): string[][][] {
        const branchExpansions: string[][][] = []

        for (const alternative of alternatives) {
            // 步骤1: 调用 computeDirectChildren 获取分支的直接子节点
            // 这会展开所有辅助节点（sequence、or、option、many、atLeastOne）
            // 但保留 token 和 ruleName 不展开
            // 返回二维数组，例如：[["RuleA", "TokenB"], ["RuleC"]]
            const directChildren = this.analyzer.computeDirectChildrenPublic(alternative)

            // 步骤2: 对每个直接子节点分支进行完全展开
            const expandedBranches: string[][] = []

            for (const branch of directChildren) {
                // branch 是一个一维数组，例如：["RuleA", "TokenB"]

                // 步骤3: 对分支中的每个 item（token 或 ruleName）获取其展开结果
                // 从 expansionCache 中获取规则的完全展开结果
                // 如果是 token（不在缓存中），则保持原样 [[item]]
                const expandedItems: string[][][] = branch.map(item => {
                    const cached = this.analyzer.getExpansionFromCache(item)
                    return cached || [[item]]  // token 返回 [[item]]，规则返回缓存的展开结果
                })

                // 步骤4: 通过笛卡尔积将所有规则的展开结果组合
                // 将三维数组转换为二维数组
                // 例如：[ [["a", "b"], ["c"]], [["TokenB"]] ]
                //    → [["a", "TokenB"], ["c", "TokenB"]]
                const cartesianResult = this.cartesianProduct(expandedItems)
                expandedBranches.push(...cartesianResult)
            }

            branchExpansions.push(expandedBranches)
        }

        return branchExpansions
    }

    /**
     * 检测 Or 规则的冲突
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
        // 公共部分：计算所有分支的完全展开结果
        // 这个方法被空路径检测和前缀冲突检测共用
        const branchExpansions = this.computeOrBranchExpansions(alternatives)

        // 两两比较 Or 分支，执行所有检测
        for (let i = 0; i < alternatives.length; i++) {
            const pathsA = this.expansionToPaths(branchExpansions[i])

            for (let j = i + 1; j < alternatives.length; j++) {
                const pathsB = this.expansionToPaths(branchExpansions[j])

                // Level 1: 空路径检测（FATAL 级别）
                if (this.hasEmptyPath(pathsA)) {
                    errors.push({
                        level: 'FATAL',
                        type: 'empty-path',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: '',
                            pathB: pathsB[0] || ''
                        },
                        message: `分支 ${i} 有空路径，后续所有分支都不可达`,
                        suggestion: '移除 Option/Many 或将其移到 Or 外部'
                    })

                    return  // FATAL 错误，停止检测
                }

                // Level 2: 前缀冲突检测（ERROR 级别）
                this.detectPrefixConflicts(ruleName, i, j, pathsA, pathsB, errors)
            }
        }
    }

    /**
     * 计算节点的展开结果
     */
    private computeNodeExpansion(node: RuleNode): string[][] {
        return this.analyzer.computeNodeExpansionPublic(node)
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
     * 计算笛卡尔积
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
     * @returns 二维数组（所有可能的组合）
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
}

