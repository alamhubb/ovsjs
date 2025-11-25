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
import Es2025Parser from '../packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import {SubhutiRuleCollector} from '../../subhuti/src/validation/SubhutiRuleCollector.ts'
import type {RuleNode, SequenceNode, OrNode, OptionNode, ManyNode, AtLeastOneNode, SubruleNode, ConsumeNode} from '../../subhuti/src/validation/SubhutiValidationError.ts'

interface RuleDepthInfo {
    ruleName: string
    depth: number
    path: string[]  // 到达最深路径的完整规则链（从根规则到最深token）
}

/**
 * 计算规则的最大深度
 * 
 * 修复后的实现原理：
 * 1. 深度直接从路径长度推导：depth = path.length - 1（因为路径包含起始规则）
 * 2. 只需要追踪最长路径，深度自然就是正确的
 * 3. 缓存只保存从当前规则开始的相对路径
 * 4. 检测循环引用，避免无限递归
 */
class RuleDepthCalculator {
    private ruleASTs: Map<string, SequenceNode>
    private pathCache = new Map<string, string[]>()  // 缓存从该规则开始的最长路径（相对路径）

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
            const path = this.calculatePath(ruleName, [])
            results.push({
                ruleName,
                depth: path.length - 1,  // 深度 = 路径长度 - 1（起始规则不算深度）
                path
            })
        }

        // 按深度排序
        results.sort((a, b) => b.depth - a.depth)

        return results
    }

    /**
     * 计算单个规则的最长路径（递归）
     * 
     * @param ruleName 规则名
     * @param visitedPath 已访问的路径（用于检测循环）
     * @returns 从起始规则到最深处的完整路径
     */
    private calculatePath(ruleName: string, visitedPath: string[]): string[] {
        // 检测循环引用
        if (visitedPath.includes(ruleName)) {
            // 循环引用，返回当前路径加上循环点
            return [...visitedPath, ruleName]
        }

        // 检查缓存
        if (this.pathCache.has(ruleName)) {
            const cachedRelativePath = this.pathCache.get(ruleName)!
            // 合并：当前访问路径 + 缓存的相对路径
            return [...visitedPath, ...cachedRelativePath]
        }

        // 获取规则 AST
        const ruleAST = this.ruleASTs.get(ruleName)
        if (!ruleAST) {
            throw new Error(`规则 ${ruleName} 不存在`)
        }

        // 计算路径
        const newPath = [...visitedPath, ruleName]
        const fullPath = this.calculateNodePath(ruleAST, newPath)

        // 缓存结果（只缓存从当前规则开始的相对路径）
        const relativePath = fullPath.slice(visitedPath.length)
        this.pathCache.set(ruleName, relativePath)

        return fullPath
    }

    /**
     * 计算节点的最长路径
     * 
     * 核心算法：
     * - 对于每个节点类型，找到最长的子路径
     * - 返回从根到最深处的完整路径
     */
    private calculateNodePath(node: RuleNode, currentPath: string[]): string[] {
        switch (node.type) {
            case 'consume':
                // Token 节点：叶子节点，路径就是当前路径
                return [...currentPath]

            case 'sequence':
                // Sequence 节点：找最长的子路径
                if (node.nodes.length === 0) {
                    return [...currentPath]
                }
                
                let maxPath: string[] = currentPath
                
                for (const child of node.nodes) {
                    const childPath = this.calculateNodePath(child, currentPath)
                    if (childPath.length > maxPath.length) {
                        maxPath = childPath
                    }
                }
                
                return maxPath

            case 'or':
                // Or 节点：找最长的分支路径
                if (node.alternatives.length === 0) {
                    return [...currentPath]
                }
                
                let maxOrPath: string[] = currentPath
                
                for (const alt of node.alternatives) {
                    const altPath = this.calculateNodePath(alt, currentPath)
                    if (altPath.length > maxOrPath.length) {
                        maxOrPath = altPath
                    }
                }
                
                return maxOrPath

            case 'option':
            case 'many':
            case 'atLeastOne':
                // Option/Many/AtLeastOne 节点：递归计算子节点
                return this.calculateNodePath(node.node, currentPath)

            case 'subrule':
                // Subrule 节点：递归计算被调用规则的路径
                return this.calculatePath(node.ruleName, currentPath)

            default:
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }
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
    const parser = new Es2025Parser([])

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
            const {ruleName, depth, path} = results[i]
            logger.log(`${(i + 1).toString().padStart(2)}. ${ruleName.padEnd(40)} 深度: ${depth.toString().padStart(3)} 路径长度: ${path.length.toString().padStart(3)}`)
            if (path.length > 0) {
                // 显示完整路径，每行最多80字符
                const pathStr = path.join(' → ')
                if (pathStr.length <= 80) {
                    logger.log(`    📍 到达路径: ${pathStr}`)
                } else {
                    // 路径太长，分段显示
                    logger.log(`    📍 到达路径:`)
                    let currentLine = '      '
                    for (let j = 0; j < path.length; j++) {
                        const segment = path[j] + (j < path.length - 1 ? ' → ' : '')
                        if (currentLine.length + segment.length > 80 && currentLine.trim() !== '') {
                            logger.log(currentLine)
                            currentLine = '      ' + segment
                        } else {
                            currentLine += segment
                        }
                    }
                    if (currentLine.trim() !== '') {
                        logger.log(currentLine)
                    }
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
        logger.log('📋 完整列表（所有规则）')
        logger.log('='.repeat(80))
        logger.log()

        for (const {ruleName, depth, path} of results) {
            logger.log(`${ruleName.padEnd(50)} 深度: ${depth.toString().padStart(3)}`)
            if (path.length > 0) {
                const pathStr = path.join(' → ')
                if (pathStr.length <= 100) {
                    logger.log(`  ${' '.repeat(50)}📍 ${pathStr}`)
                } else {
                    // 路径太长，分段显示
                    logger.log(`  ${' '.repeat(50)}📍`)
                    let currentLine = `  ${' '.repeat(52)}`
                    for (let j = 0; j < path.length; j++) {
                        const segment = path[j] + (j < path.length - 1 ? ' → ' : '')
                        if (currentLine.length + segment.length > 100 && currentLine.trim() !== '') {
                            logger.log(currentLine)
                            currentLine = `  ${' '.repeat(52)}` + segment
                        } else {
                            currentLine += segment
                        }
                    }
                    if (currentLine.trim() !== '') {
                        logger.log(currentLine)
                    }
                }
            }
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

