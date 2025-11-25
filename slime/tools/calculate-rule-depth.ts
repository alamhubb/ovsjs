/**
 * 计算规则最深层级工具
 * 
 * 功能：计算 Es2025Parser 中所有规则的最大深度，并显示到达最深度的完整路径
 * 
 * 深度定义：
 * - ConsumeNode（token）：深度 0（叶子节点）
 * - SequenceNode：max(子节点深度) + 1
 * - OrNode：max(分支深度)
 * - OptionNode/ManyNode/AtLeastOneNode：子节点深度
 * - SubruleNode：被调用规则的深度 + 1
 * 
 * 算法实现原理：
 * 
 * 1. **递归计算深度**：
 *    - 从根规则开始，递归遍历 AST
 *    - 对每个节点类型，计算其最大深度
 *    - 使用缓存避免重复计算
 * 
 * 2. **路径记录**：
 *    - 在计算深度的同时，记录到达最深度的完整路径
 *    - 对于 SequenceNode：找到深度最大的子节点，记录其路径
 *    - 对于 OrNode：找到深度最大的分支，记录其路径
 *    - 对于 SubruleNode：递归计算被调用规则，合并路径
 * 
 * 3. **循环检测**：
 *    - 使用 visitedPath 检测循环引用
 *    - 遇到循环时，返回当前路径长度作为深度
 * 
 * 4. **缓存优化**：
 *    - 缓存每个规则的深度和路径
 *    - 避免重复计算相同规则
 * 
 * 输出内容：
 * - Top 20 最深层级规则及其到达路径
 * - 深度分布统计
 * - 所有规则的完整列表
 * 
 * 使用示例：
 *   npx tsx slime/tools/calculate-rule-depth.ts
 */

import * as path from 'path'
import Es2025Parser from '../packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import {SubhutiRuleCollector} from '../../subhuti/src/validation/SubhutiRuleCollector.ts'
import type {RuleNode, SequenceNode, OrNode, OptionNode, ManyNode, AtLeastOneNode, SubruleNode, ConsumeNode} from '../../subhuti/src/validation/SubhutiValidationError.ts'

interface RuleDepthInfo {
    ruleName: string
    depth: number
    path: string[]  // 到达最深路径的完整规则链（从根规则到最深token）
}

interface DepthResult {
    depth: number
    path: string[]  // 到达最深度的完整路径
}

/**
 * 计算规则的最大深度
 * 
 * 实现原理：
 * 1. 递归遍历规则 AST，计算每个节点的深度
 * 2. 对于 SequenceNode：找到深度最大的子节点，记录其路径
 * 3. 对于 OrNode：找到深度最大的分支，记录其路径
 * 4. 对于 SubruleNode：递归计算被调用规则的深度，并合并路径
 * 5. 使用缓存避免重复计算
 * 6. 检测循环引用，避免无限递归
 */
class RuleDepthCalculator {
    private ruleASTs: Map<string, SequenceNode>
    private depthCache = new Map<string, DepthResult>()  // 缓存已计算的深度和路径
    private calculating = new Set<string>()  // 正在计算的规则（用于检测循环）

    constructor(ruleASTs: Map<string, SequenceNode>) {
        this.ruleASTs = ruleASTs
    }

    /**
     * 计算所有规则的深度
     */
    calculateAllDepths(): RuleDepthInfo[] {
        const results: RuleDepthInfo[] = []

        // 遍历所有规则
        for (const ruleName of this.ruleASTs.keys()) {
            const result = this.calculateDepth(ruleName, [])
            results.push({
                ruleName,
                depth: result.depth,
                path: result.path
            })
        }

        // 按深度排序
        results.sort((a, b) => b.depth - a.depth)

        return results
    }

    /**
     * 计算单个规则的深度（递归）
     * 
     * @param ruleName 规则名
     * @param visitedPath 已访问的路径（用于检测循环）
     * @returns 深度结果（包含深度和到达路径）
     */
    private calculateDepth(ruleName: string, visitedPath: string[]): DepthResult {
        // 检测循环引用
        if (visitedPath.includes(ruleName)) {
            // 循环引用，返回当前路径（表示循环深度）
            return {
                depth: visitedPath.length,
                path: [...visitedPath, ruleName]
            }
        }

        // 检查缓存
        if (this.depthCache.has(ruleName)) {
            const cached = this.depthCache.get(ruleName)!
            // 如果缓存中的路径不包含当前访问路径，需要合并
            if (visitedPath.length > 0) {
                return {
                    depth: cached.depth,
                    path: [...visitedPath, ...cached.path]
                }
            }
            return cached
        }

        // 获取规则 AST
        const ruleAST = this.ruleASTs.get(ruleName)
        if (!ruleAST) {
            throw new Error(`规则 ${ruleName} 不存在`)
        }

        // 标记正在计算
        this.calculating.add(ruleName)

        // 计算深度和路径
        const newPath = [...visitedPath, ruleName]
        const result = this.calculateNodeDepth(ruleAST, newPath)

        // 缓存结果（只缓存从当前规则开始的路径）
        this.depthCache.set(ruleName, {
            depth: result.depth,
            path: result.path.slice(visitedPath.length)  // 只保存从当前规则开始的路径
        })

        // 清除标记
        this.calculating.delete(ruleName)

        return result
    }

    /**
     * 计算节点的深度和到达路径
     * 
     * 核心算法：
     * - 对于每个节点类型，找到深度最大的子路径
     * - 记录从根到最深token的完整路径
     */
    private calculateNodeDepth(node: RuleNode, currentPath: string[]): DepthResult {
        switch (node.type) {
            case 'consume':
                // Token 节点：深度 0，路径就是当前路径
                return {
                    depth: 0,
                    path: [...currentPath]
                }

            case 'sequence':
                // Sequence 节点：max(子节点深度) + 1
                if (node.nodes.length === 0) {
                    return {
                        depth: 1,
                        path: [...currentPath]
                    }
                }
                
                // 计算每个子节点的深度和路径
                let maxDepth = -1
                let maxPath: string[] = []
                
                for (const child of node.nodes) {
                    const childResult = this.calculateNodeDepth(child, currentPath)
                    if (childResult.depth > maxDepth) {
                        maxDepth = childResult.depth
                        maxPath = childResult.path
                    }
                }
                
                return {
                    depth: maxDepth + 1,
                    path: maxPath
                }

            case 'or':
                // Or 节点：max(分支深度)
                if (node.alternatives.length === 0) {
                    return {
                        depth: 0,
                        path: [...currentPath]
                    }
                }
                
                // 找到深度最大的分支
                let maxOrDepth = -1
                let maxOrPath: string[] = []
                
                for (const alt of node.alternatives) {
                    const altResult = this.calculateNodeDepth(alt, currentPath)
                    if (altResult.depth > maxOrDepth) {
                        maxOrDepth = altResult.depth
                        maxOrPath = altResult.path
                    }
                }
                
                return {
                    depth: maxOrDepth,
                    path: maxOrPath
                }

            case 'option':
            case 'many':
            case 'atLeastOne':
                // Option/Many/AtLeastOne 节点：子节点深度
                return this.calculateNodeDepth(node.node, currentPath)

            case 'subrule':
                // Subrule 节点：被调用规则的深度 + 1
                const subruleResult = this.calculateDepth(node.ruleName, currentPath)
                return {
                    depth: subruleResult.depth + 1,
                    path: subruleResult.path
                }

            default:
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }
    }
}

/**
 * 主函数
 */
function main() {
    console.log('🔍 开始计算规则深度...\n')

    // 创建 Parser 实例
    const parser = new Es2025Parser([])

    // 收集规则 AST
    console.log('📦 收集规则 AST...')
    const {cstMap} = SubhutiRuleCollector.collectRules(parser)
    console.log(`✅ 收集到 ${cstMap.size} 个规则\n`)

    // 计算深度
    console.log('📊 计算规则深度...')
    const calculator = new RuleDepthCalculator(cstMap)
    const results = calculator.calculateAllDepths()

    // 输出结果
    console.log('='.repeat(80))
    console.log('📈 规则深度统计（按深度降序）')
    console.log('='.repeat(80))
    console.log()

    // 显示 Top 20
    const topN = Math.min(20, results.length)
    console.log(`🏆 Top ${topN} 最深层级规则：\n`)
    
    for (let i = 0; i < topN; i++) {
        const {ruleName, depth, path} = results[i]
        console.log(`${(i + 1).toString().padStart(2)}. ${ruleName.padEnd(40)} 深度: ${depth.toString().padStart(3)}`)
        if (path.length > 0) {
            // 显示完整路径，每行最多80字符
            const pathStr = path.join(' → ')
            if (pathStr.length <= 80) {
                console.log(`    📍 到达路径: ${pathStr}`)
            } else {
                // 路径太长，分段显示
                console.log(`    📍 到达路径:`)
                let currentLine = '      '
                for (let j = 0; j < path.length; j++) {
                    const segment = path[j] + (j < path.length - 1 ? ' → ' : '')
                    if (currentLine.length + segment.length > 80 && currentLine.trim() !== '') {
                        console.log(currentLine)
                        currentLine = '      ' + segment
                    } else {
                        currentLine += segment
                    }
                }
                if (currentLine.trim() !== '') {
                    console.log(currentLine)
                }
            }
        }
    }

    console.log()
    console.log('='.repeat(80))
    console.log('📊 深度分布统计')
    console.log('='.repeat(80))
    console.log()

    // 统计深度分布
    const depthStats = new Map<number, number>()
    for (const {depth} of results) {
        depthStats.set(depth, (depthStats.get(depth) || 0) + 1)
    }

    const sortedDepths = Array.from(depthStats.keys()).sort((a, b) => b - a)
    for (const depth of sortedDepths) {
        const count = depthStats.get(depth)!
        const bar = '█'.repeat(Math.floor(count / 2))
        console.log(`深度 ${depth.toString().padStart(3)}: ${count.toString().padStart(3)} 个规则 ${bar}`)
    }

    console.log()
    console.log('='.repeat(80))
    console.log('📋 完整列表（所有规则）')
    console.log('='.repeat(80))
    console.log()

    for (const {ruleName, depth, path} of results) {
        console.log(`${ruleName.padEnd(50)} 深度: ${depth.toString().padStart(3)}`)
        if (path.length > 0) {
            const pathStr = path.join(' → ')
            if (pathStr.length <= 100) {
                console.log(`  ${' '.repeat(50)}📍 ${pathStr}`)
            } else {
                // 路径太长，分段显示
                console.log(`  ${' '.repeat(50)}📍`)
                let currentLine = `  ${' '.repeat(52)}`
                for (let j = 0; j < path.length; j++) {
                    const segment = path[j] + (j < path.length - 1 ? ' → ' : '')
                    if (currentLine.length + segment.length > 100 && currentLine.trim() !== '') {
                        console.log(currentLine)
                        currentLine = `  ${' '.repeat(52)}` + segment
                    } else {
                        currentLine += segment
                    }
                }
                if (currentLine.trim() !== '') {
                    console.log(currentLine)
                }
            }
        }
    }
}

// 运行主函数
main()

