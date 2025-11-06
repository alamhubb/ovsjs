/**
 * Subhuti Grammar Validation - 冲突检测器
 * 
 * 功能：检测 Or 规则中的路径冲突
 * 原理：
 *   - Level 1: 空路径检测（致命错误）
 *   - Level 2: 前缀冲突检测（使用 startsWith）
 * 
 * @version 1.0.0
 */

import type { SubhutiGrammarAnalyzer } from "./SubhutiGrammarAnalyzer"
import type { RuleNode, ValidationError, Path } from "./SubhutiValidationError"

/**
 * 冲突检测器
 * 
 * 职责：
 * 1. 遍历所有 Or 规则
 * 2. 检测空路径（Level 1 - FATAL）
 * 3. 检测前缀冲突（Level 2 - ERROR）
 * 4. 生成详细的错误报告
 */
export class SubhutiConflictDetector {
    /**
     * 构造函数
     * 
     * @param analyzer 语法分析器
     * @param ruleASTs 规则 AST 映射
     */
    constructor(
        private analyzer: SubhutiGrammarAnalyzer,
        private ruleASTs: Map<string, RuleNode>
    ) {}
    
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
     * 检测 Or 规则的冲突
     */
    private detectOrConflicts(
        ruleName: string,
        alternatives: RuleNode[],
        errors: ValidationError[]
    ): void {
        // 计算每个分支的路径
        const branchPaths: Path[][] = alternatives.map(alt => 
            this.analyzer.computeNodePaths(alt, new Set(), 0)
        )
        
        // 两两比较
        for (let i = 0; i < branchPaths.length; i++) {
            const pathsA = branchPaths[i]
            
            for (let j = i + 1; j < branchPaths.length; j++) {
                const pathsB = branchPaths[j]
                
                // Level 1: 空路径检测
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
                    
                    // 空路径是致命错误，后续分支全部不可达，不再检测
                    return
                }
                
                // Level 2: 前缀冲突检测
                this.detectPrefixConflicts(ruleName, i, j, pathsA, pathsB, errors)
            }
        }
    }
    
    /**
     * 检测前缀冲突
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
            
            // 跳过特殊标记
            if (pathA.startsWith('<')) continue
            
            for (const pathB of pathsB) {
                // 跳过空路径和特殊标记
                if (pathB === '' || pathB.startsWith('<')) continue
                
                // 前缀检测
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
     * 条件：
     * 1. pathA.length < pathB.length
     * 2. pathB.startsWith(pathA)
     * 
     * 示例：
     * - isPrefix('a,b,', 'a,b,c,') → true
     * - isPrefix('a,b,c,', 'a,b,') → false
     * - isPrefix('a,b,', 'a,b,') → false (长度相等)
     */
    private isPrefix(pathA: Path, pathB: Path): boolean {
        return pathA.length > 0 && pathA.length < pathB.length && pathB.startsWith(pathA)
    }
}

