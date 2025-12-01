/**
 * 计算规则最深层级工具
 * 
 * 功能：计算 Es2025Parser 中所有规则的最大深度，并显示到达最深度的完整路径
 * 
 * 深度定义：
 * - ConsumeNode（token）：深度 0（叶子节点）
 * - SequenceNode：max(子节点深度)（序列结构本身不增加深度）
 * - OrNode：max(分支深度)
 * - OptionNode/ManyNode/AtLeastOneNode：子节点深度
 * - SubruleNode：被调用规则的深度 + 1（规则下探算一级）
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
import * as fs from 'fs'
import {fileURLToPath} from 'url'
import SlimeParser from 'slime-parser/src/language/es2025/SlimeParser.ts'
import {SubhutiRuleCollector} from '../../subhuti/src/validation/SubhutiRuleCollector.ts'
import type {RuleNode, SequenceNode, OrNode, OptionNode, ManyNode, AtLeastOneNode, SubruleNode, ConsumeNode} from '../../subhuti/src/validation/SubhutiValidationError.ts'

/**
 * 路径中的单个节点信息
 */
interface PathNode {
    name: string        // 规则名
    localCount: bigint  // 该规则本身的可能性（不包含子规则）
}

interface RuleDepthInfo {
    ruleName: string
    depth: number
    path: PathNode[]    // 到达最深路径的完整规则链（从根规则到最深token）
    pathCount: bigint   // 到达最深深度的可能路径数量
}

/**
 * 深度和路径计数结果
 */
interface DepthAndCount {
    depth: number       // 最大深度
    path: PathNode[]    // 到达最深的一条路径（示例）
    pathCount: bigint   // 到达最深深度的所有可能路径数量
}

/**
 * 计算规则的最大深度和到达最深路径的总可能性数量
 * 
 * 实现原理：
 * 1. 深度直接从路径长度推导：depth = path.length - 1
 * 2. 计算到达最深路径需要经过的总选择数（可能性的乘积）
 * 3. 缓存结果避免重复计算
 * 4. 检测循环引用，避免无限递归
 * 
 * 可能性计数规则（计算的是"N 种可能中有 1 种能到达最深"）：
 * - ConsumeNode：1（无选择）
 * - SequenceNode：各子节点可能数的乘积（每个子节点都要做选择）
 * - OrNode：总分支数 × 能达到最深的分支的可能数
 * - Option/Many：2 × 子节点可能数（选择走或不走）
 * - AtLeastOne：2 × 子节点可能数（选择执行1次或2次）
 * - SubruleNode：被调用规则的可能数
 */
class RuleDepthCalculator {
    private ruleASTs: Map<string, SequenceNode>
    private cache = new Map<string, DepthAndCount>()  // 缓存从该规则开始的结果

    constructor(ruleASTs: Map<string, SequenceNode>) {
        this.ruleASTs = ruleASTs
    }

    /**
     * 计算所有规则的深度和可能性数量
     */
    calculateAllDepths(): RuleDepthInfo[] {
        const results: RuleDepthInfo[] = []

        // 遍历所有规则
        for (const ruleName of this.ruleASTs.keys()) {
            const result = this.calculateDepthAndCount(ruleName, new Set())
            results.push({
                ruleName,
                depth: result.depth,
                path: result.path,
                pathCount: result.pathCount
            })
        }

        // 按深度排序
        results.sort((a, b) => b.depth - a.depth)

        return results
    }

    /**
     * 计算单个规则的深度和可能性数量（递归）
     * 
     * @param ruleName 规则名
     * @param visited 已访问的规则集合（用于检测循环）
     * @returns 深度、示例路径和可能性数量
     */
    private calculateDepthAndCount(ruleName: string, visited: Set<string>): DepthAndCount {
        // 检测循环引用
        if (visited.has(ruleName)) {
            // 循环引用，返回深度 0，1 种可能
            return {
                depth: 0,
                path: [{ name: ruleName + '(循环)', localCount: 1n }],
                pathCount: 1n
            }
        }

        // 使用缓存（缓存是基于空 visited 计算的）
        // 注意：这可能导致在有循环的情况下结果不完全准确
        // 但可以保证性能
        if (this.cache.has(ruleName)) {
            const cached = this.cache.get(ruleName)!
            return {
                depth: cached.depth,
                path: cached.path.map(p => ({ ...p })),  // 深拷贝
                pathCount: cached.pathCount
            }
        }

        // 获取规则 AST
        const ruleAST = this.ruleASTs.get(ruleName)
        if (!ruleAST) {
            throw new Error(`规则 ${ruleName} 不存在`)
        }

        // 标记已访问
        const newVisited = new Set(visited)
        newVisited.add(ruleName)

        // 计算节点的深度和可能性数量
        const nodeResult = this.calculateNodeDepthAndCount(ruleAST, newVisited)

        // 计算该规则本身的可能性（不包含子规则的可能性）
        // localCount = pathCount / 子规则的pathCount
        const childPathCount = nodeResult.path.length > 0 
            ? nodeResult.path.reduce((acc, p) => acc * p.localCount, 1n)
            : 1n
        const localCount = childPathCount > 0n ? nodeResult.pathCount / childPathCount : nodeResult.pathCount

        // 构建结果
        const result: DepthAndCount = {
            depth: nodeResult.depth,
            path: [{ name: ruleName, localCount }, ...nodeResult.path],
            pathCount: nodeResult.pathCount
        }

        // 只有在 visited 为空时才缓存结果
        if (visited.size === 0) {
            this.cache.set(ruleName, result)
        }

        return result
    }

    /**
     * 计算节点的深度和可能性数量
     */
    private calculateNodeDepthAndCount(node: RuleNode, visited: Set<string>): DepthAndCount {
        switch (node.type) {
            case 'consume':
                // Token 节点：深度 0，1 种可能（无选择）
                return {
                    depth: 0,
                    path: [],
                    pathCount: 1n
                }

            case 'sequence': {
                // Sequence 节点：
                // - 深度 = max(子节点深度)
                // - 可能数 = 各子节点可能数的乘积
                if (node.nodes.length === 0) {
                    return { depth: 0, path: [], pathCount: 1n }
                }
                
                let maxDepth = 0
                let maxPath: PathNode[] = []
                let totalPossibilities = 1n
                
                for (const child of node.nodes) {
                    const childResult = this.calculateNodeDepthAndCount(child, visited)
                    // 累乘所有子节点的可能性
                    totalPossibilities *= childResult.pathCount
                    // 记录最深路径
                    if (childResult.depth > maxDepth) {
                        maxDepth = childResult.depth
                        maxPath = childResult.path
                    }
                }
                
                return { depth: maxDepth, path: maxPath, pathCount: totalPossibilities }
            }

            case 'or': {
                // Or 节点：
                // - 深度 = max(分支深度)
                // - 可能数 = 总分支数 × 能达到最深的分支的可能数
                if (node.alternatives.length === 0) {
                    return { depth: 0, path: [], pathCount: 1n }
                }
                
                const branchCount = BigInt(node.alternatives.length)
                let maxDepth = 0
                let maxPath: PathNode[] = []
                let deepestBranchPossibilities = 1n
                
                for (const alt of node.alternatives) {
                    const altResult = this.calculateNodeDepthAndCount(alt, visited)
                    if (altResult.depth > maxDepth) {
                        // 发现更深的分支
                        maxDepth = altResult.depth
                        maxPath = altResult.path
                        deepestBranchPossibilities = altResult.pathCount
                    }
                }
                
                // 总可能数 = 分支数 × 最深分支的可能数
                return { 
                    depth: maxDepth, 
                    path: maxPath, 
                    pathCount: branchCount * deepestBranchPossibilities 
                }
            }

            case 'option':
            case 'many': {
                // Option/Many 节点：2 种选择（走或不走）
                // - 如果子节点深度 > 0，必须走才能达到最深
                // - 可能数 = 2 × 子节点可能数
                const childResult = this.calculateNodeDepthAndCount(node.node, visited)
                return {
                    depth: childResult.depth,
                    path: childResult.path,
                    pathCount: 2n * childResult.pathCount
                }
            }

            case 'atLeastOne': {
                // AtLeastOne 节点：2 种选择（执行 1 次或 2 次）
                // - 可能数 = 2 × 子节点可能数
                const childResult = this.calculateNodeDepthAndCount(node.node, visited)
                return {
                    depth: childResult.depth,
                    path: childResult.path,
                    pathCount: 2n * childResult.pathCount
                }
            }

            case 'subrule': {
                // Subrule 节点：递归计算被调用规则，深度 +1
                const subruleResult = this.calculateDepthAndCount(node.ruleName, visited)
                return {
                    depth: subruleResult.depth + 1,
                    path: subruleResult.path,
                    pathCount: subruleResult.pathCount
                }
            }

            default:
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }
    }
}

/**
 * 格式化大整数
 * 如果数字太大，显示科学计数法和位数
 */
function formatBigInt(n: bigint): string {
    const str = n.toString()
    if (str.length <= 20) {
        // 小数字，添加千位分隔符
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
        // 大数字，显示科学计数法
        const digits = str.length
        const firstDigits = str.slice(0, 5)
        return `${firstDigits[0]}.${firstDigits.slice(1)} × 10^${digits - 1} (${digits} 位数)`
    }
}

/**
 * 格式化大整数（简短版本）
 */
function formatBigIntShort(n: bigint): string {
    const str = n.toString()
    if (str.length <= 10) {
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
        const digits = str.length
        const firstDigits = str.slice(0, 3)
        return `${firstDigits[0]}.${firstDigits.slice(1)}e${digits - 1}`
    }
}

/**
 * 日志输出管理器
 * 同时输出到控制台和文件
 */
class Logger {
    private logFile: string
    private logStream: fs.WriteStream

    constructor(logFile: string) {
        this.logFile = logFile
        // 创建写入流，追加模式
        this.logStream = fs.createWriteStream(logFile, { encoding: 'utf-8', flags: 'w' })
    }

    /**
     * 输出日志（同时输出到控制台和文件）
     */
    log(message: string = '') {
        // 输出到控制台
        console.log(message)
        // 输出到文件
        this.logStream.write(message + '\n')
    }

    /**
     * 关闭日志流
     */
    close() {
        this.logStream.end()
    }
}

/**
 * 主函数
 */
function main() {
    // 获取当前文件所在目录
    const __filename = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(__filename)
    const logFile = path.join(currentDir, 'depth.log')
    
    // 创建日志管理器
    const logger = new Logger(logFile)
    
    try {
        logger.log('🔍 开始计算规则深度...\n')

    // 创建 Parser 实例
    const parser = new SlimeParser([])

        // 收集规则 AST
        logger.log('📦 收集规则 AST...')
        const {cstMap} = SubhutiRuleCollector.collectRules(parser)
        logger.log(`✅ 收集到 ${cstMap.size} 个规则\n`)

        // 计算深度
        logger.log('📊 计算规则深度...')
        const calculator = new RuleDepthCalculator(cstMap)
        const results = calculator.calculateAllDepths()

        // 输出结果
        logger.log('='.repeat(80))
        logger.log('📈 规则深度统计（按深度降序）')
        logger.log('='.repeat(80))
        logger.log()

        // 显示 Top 20
        const topN = Math.min(20, results.length)
        logger.log(`🏆 Top ${topN} 最深层级规则：\n`)
        
        for (let i = 0; i < topN; i++) {
            const {ruleName, depth, path, pathCount} = results[i]
            logger.log(`${(i + 1).toString().padStart(2)}. ${ruleName.padEnd(40)} 深度: ${depth.toString().padStart(3)} 路径数: ${formatBigInt(pathCount)}`)
            if (path.length > 0) {
                // 显示完整路径，每个规则带上可能性
                logger.log(`    📍 路径详情（规则名(本地可能数)）:`)
                for (let j = 0; j < path.length; j++) {
                    const node = path[j]
                    const arrow = j < path.length - 1 ? ' →' : ''
                    const countStr = formatBigIntShort(node.localCount)
                    logger.log(`      ${(j + 1).toString().padStart(2)}. ${node.name}(${countStr})${arrow}`)
                }
            }
        }

        logger.log()
        logger.log('='.repeat(80))
        logger.log('📊 深度分布统计')
        logger.log('='.repeat(80))
        logger.log()

        // 统计深度分布
        const depthStats = new Map<number, number>()
        for (const {depth} of results) {
            depthStats.set(depth, (depthStats.get(depth) || 0) + 1)
        }

        const sortedDepths = Array.from(depthStats.keys()).sort((a, b) => b - a)
        for (const depth of sortedDepths) {
            const count = depthStats.get(depth)!
            const bar = '█'.repeat(Math.floor(count / 2))
            logger.log(`深度 ${depth.toString().padStart(3)}: ${count.toString().padStart(3)} 个规则 ${bar}`)
        }

        logger.log()
        logger.log('='.repeat(80))
        logger.log('📋 按可能性排序（从小到大）')
        logger.log('='.repeat(80))
        logger.log()

        // 按可能性排序
        const sortedByCount = [...results].sort((a, b) => {
            if (a.pathCount < b.pathCount) return -1
            if (a.pathCount > b.pathCount) return 1
            return 0
        })

        for (const {ruleName, depth, pathCount} of sortedByCount) {
            logger.log(`${ruleName.padEnd(50)} 可能数: ${formatBigInt(pathCount).padStart(30)} 深度: ${depth}`)
        }
        
        logger.log()
        logger.log(`✅ 日志已保存到: ${logFile}`)
    } finally {
        // 关闭日志流
        logger.close()
    }
}

// 运行主函数
main()

