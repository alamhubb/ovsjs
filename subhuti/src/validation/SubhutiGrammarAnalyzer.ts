/**
 * Subhuti Grammar Validation - 语法分析器
 * 
 * 功能：计算规则的所有可能路径（扁平化字符串）
 * 原理：递归遍历 AST，使用笛卡尔积拼接路径
 * 
 * @version 1.0.0
 */

import type { RuleNode, Path } from "./SubhutiValidationError"

/**
 * 语法分析器配置
 */
export interface GrammarAnalyzerOptions {
    /** 单规则路径数量上限（防止路径爆炸） */
    maxPaths?: number
    
    /** 单路径长度上限 */
    maxPathLength?: number
    
    /** 递归深度上限 */
    maxRecursionDepth?: number
}

/**
 * 语法分析器
 * 
 * 职责：
 * 1. 接收规则 AST
 * 2. 递归计算所有可能路径
 * 3. 路径直接存储为字符串（'Token1,Token2,'）
 * 4. 使用缓存避免重复计算
 */
export class SubhutiGrammarAnalyzer {
    /** 路径缓存 */
    private pathCache = new Map<string, Path[]>()
    
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
        this.options = {
            maxPaths: options?.maxPaths || 100,
            maxPathLength: options?.maxPathLength || 50,
            maxRecursionDepth: options?.maxRecursionDepth || 10
        }
    }
    
    /**
     * 计算规则的所有路径
     * 
     * @param ruleName 规则名称
     * @param visited 已访问的规则集合（用于循环检测）
     * @returns 路径数组
     */
    computePaths(ruleName: string, visited: Set<string> = new Set()): Path[] {
        // 1. 缓存检查
        if (this.pathCache.has(ruleName)) {
            return this.pathCache.get(ruleName)!
        }
        
        // 2. 循环检测
        if (visited.has(ruleName)) {
            // 检测到递归！返回特殊标记
            console.warn(`Recursive rule detected: ${ruleName}`)
            return ['<RECURSIVE>']
        }
        
        // 3. 获取 AST
        const ruleNode = this.ruleASTs.get(ruleName)
        if (!ruleNode) {
            console.warn(`Rule "${ruleName}" not found`)
            return []
        }
        
        // 4. 递归计算路径
        visited.add(ruleName)
        const paths = this.computeNodePaths(ruleNode, visited, 0)
        visited.delete(ruleName)
        
        // 5. 限制路径数量
        const limitedPaths = this.limitPaths(paths)
        
        // 6. 缓存结果
        this.pathCache.set(ruleName, limitedPaths)
        
        return limitedPaths
    }
    
    /**
     * 计算节点的所有路径
     * 
     * @param node AST 节点
     * @param visited 已访问的规则集合
     * @param depth 当前递归深度
     * @returns 路径数组
     */
    computeNodePaths(node: RuleNode, visited: Set<string>, depth: number): Path[] {
        // 深度限制
        if (depth > this.options.maxRecursionDepth) {
            console.warn(`Max recursion depth exceeded`)
            return ['<TOO_DEEP>']
        }
        
        switch (node.type) {
            case 'consume':
                // consume('Token') → ['Token,']
                return [node.tokenName + ',']
            
            case 'sequence':
                // sequence → 笛卡尔积拼接
                return this.computeSequencePaths(node.nodes, visited, depth)
            
            case 'or':
                // or → 合并所有分支
                return this.computeOrPaths(node.alternatives, visited, depth)
            
            case 'option':
                // option → ['', ...innerPaths]
                return this.computeOptionPaths(node.node, visited, depth)
            
            case 'many':
                // many → 近似为 option（0次或多次，我们只记录0次和1次）
                return this.computeOptionPaths(node.node, visited, depth)
            
            case 'atLeastOne':
                // atLeastOne → 至少1次，返回1次的路径
                return this.computeNodePaths(node.node, visited, depth + 1)
            
            case 'subrule':
                // subrule → 递归查询
                return this.computePaths(node.ruleName, visited)
            
            default:
                console.warn(`Unknown node type: ${(node as any).type}`)
                return []
        }
    }
    
    /**
     * 计算序列路径（笛卡尔积）
     */
    private computeSequencePaths(nodes: RuleNode[], visited: Set<string>, depth: number): Path[] {
        if (nodes.length === 0) {
            return ['']
        }
        
        // 计算每个节点的路径
        const nodePaths = nodes.map(node => this.computeNodePaths(node, visited, depth + 1))
        
        // 笛卡尔积拼接
        return this.cartesianProduct(nodePaths)
    }
    
    /**
     * 计算 Or 路径（合并所有分支）
     */
    private computeOrPaths(alternatives: RuleNode[], visited: Set<string>, depth: number): Path[] {
        const allPaths: Path[] = []
        
        for (const alt of alternatives) {
            const paths = this.computeNodePaths(alt, visited, depth + 1)
            allPaths.push(...paths)
        }
        
        return allPaths
    }
    
    /**
     * 计算 Option 路径（空路径 + 内部路径）
     */
    private computeOptionPaths(node: RuleNode, visited: Set<string>, depth: number): Path[] {
        const innerPaths = this.computeNodePaths(node, visited, depth + 1)
        
        // 空路径在前（表示跳过）
        return ['', ...innerPaths]
    }
    
    /**
     * 笛卡尔积（字符串拼接）
     * 
     * 示例：
     * ['a,'] × ['b,', 'c,'] = ['a,b,', 'a,c,']
     */
    private cartesianProduct(arrays: Path[][]): Path[] {
        if (arrays.length === 0) {
            return ['']
        }
        
        return arrays.reduce((acc, curr) => {
            const result: Path[] = []
            for (const a of acc) {
                for (const c of curr) {
                    const combined = a + c
                    
                    // 检查路径长度
                    if (this.countTokens(combined) <= this.options.maxPathLength) {
                        result.push(combined)
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

