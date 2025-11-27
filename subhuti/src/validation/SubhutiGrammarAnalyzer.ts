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
 * ⚠️⚠️⚠️ 关键：空分支 [] 的处理 ⚠️⚠️⚠️
 *
 * 空分支来源：
 * - option(X) 和 many(X) 会产生空分支 []，表示可以跳过（0次）
 * - 空分支在展开结果中表示为 []（空数组）
 *
 * 空分支的重要性：
 * - 空分支必须保留，否则 option/many 的语义就错了！
 * - 例如：option(a) 的 First 集合 = {ε, a}
 * - 如果过滤掉空分支，就变成 First 集合 = {a}，语义错误！
 *
 * 空分支在各个处理环节的行为：
 * 1. deduplicate：
 *  *    - [] join(RuleJoinSymbol) = ""（空字符串）
 *    - 空字符串是合法的 Set key，不会被过滤
 *    - 例如：[[], [a], []] → [[], [a]]（正常去重）
 *
 * 2. cartesianProduct：
 *    - [...seq, ...[]] = [...seq]（空分支拼接不影响结果）
 *    - [...[], ...branch] = [...branch]（空序列拼接）
 *    - 例如：[[a]] × [[], [b]] → [[a], [a,b]]（正常笛卡尔积）
 *
 * 3. truncateAndDeduplicate：
 *    - [] slice(0, firstK) = []（空分支截取还是空分支）
 *    - 例如：[[], [a,b]], firstK=1 → [[], [a]]（正常截取）
 *
 * 4. expandSequenceNode：
 *    - 空分支参与笛卡尔积和截取，不会被过滤
 *
 * 5. expandOr：
 *    - 空分支参与合并，不会被过滤
 *
 * 结论：
 * - 整个系统中没有任何地方会过滤空分支 []
 * - 空分支在所有处理环节都是一等公民
 * - 空分支的语义被完整保留
 *
 * 用途：为SubhutiConflictDetector提供路径数据，用于检测Or分支冲突
 *
 * @version 2.0.0 - 分层展开版本
 */

import type {
    RuleNode,
    Path,
    SequenceNode,
    ValidationError,
    SubruleNode,
    ConsumeNode,
    OrNode, ManyNode, OptionNode, AtLeastOneNode
} from "./SubhutiValidationError"
import {SubhutiValidationLogger} from './SubhutiValidationLogger'
import {list} from "@lerna-lite/publish";
import ArrayTrie from "./ArrayTria.ts";
import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import fastCartesian from "fast-cartesian";
import {Graph, alg} from '@dagrejs/graphlib'

/**
 * 左递归错误类型
 */
export type LeftRecursionError = ValidationError

/**
 * 性能分析器
 */
class PerformanceAnalyzer {
    private stats = new Map<string, {
        count: number
        totalTime: number      // 总耗时（包含子方法）
        netTime: number         // 净耗时（排除子方法）
        maxTime: number
        minTime: number
        inputSizes: number[]
        outputSizes: number[]
    }>()

    // 调用栈跟踪（用于计算净耗时）
    private callStack: Array<{ methodName: string, startTime: number, childTime: number }> = []

    // 缓存统计
    public cacheStats = {
        subRuleHandlerTotal: 0,  // subRuleHandler 总调用次数
        recursiveReturn: 0,  // 递归检测返回次数
        levelLimitReturn: 0,  // 层级限制返回次数
        // 独立的缓存统计（每个缓存都有自己的 hit/miss/total）
        dfsFirstKCache: {hit: 0, miss: 0, total: 0},  // DFS First(K) 缓存
        bfsAllCache: {hit: 0, miss: 0, total: 0},  // BFS 所有层级聚合缓存
        bfsLevelCache: {hit: 0, miss: 0, total: 0},  // BFS 按层级缓存
        getDirectChildren: {hit: 0, miss: 0, total: 0},  // getDirectChildren 懒加载缓存
        // 废弃的统计（保留用于兼容性）
        dfsFirst1: {hit: 0, miss: 0, total: 0},
        dfsFirstK: {hit: 0, miss: 0, total: 0},
        bfsLevel: {hit: 0, miss: 0, total: 0},
        expandOneLevel: {hit: 0, miss: 0, total: 0},
        expandOneLevelTruncated: {hit: 0, miss: 0, total: 0},
        actualCompute: 0,  // 实际计算次数（getDirectChildren）
        bfsOptimization: {
            totalCalls: 0,           // BFS 总调用次数
            skippedLevels: 0,        // 跳过的层级数（增量优化效果）
            fromLevel1: 0,           // 从 level 1 开始的次数
            fromCachedLevel: 0       // 从缓存层级开始的次数
        }
    }

    // 开始方法调用（返回调用ID，用于结束调用）
    startMethod(methodName: string): number {
        const callId = this.callStack.length
        this.callStack.push({
            methodName,
            startTime: Date.now(),
            childTime: 0
        })
        return callId
    }

    // 结束方法调用并记录（返回净耗时）
    endMethod(callId: number, inputSize?: number, outputSize?: number): number {
        const call = this.callStack[callId]
        if (!call) {
            throw new Error(`调用栈错误: callId ${callId} 不存在`)
        }

        const totalDuration = Date.now() - call.startTime
        const netDuration = totalDuration - call.childTime

        // 更新父方法的子方法耗时
        if (callId > 0) {
            const parentCall = this.callStack[callId - 1]
            parentCall.childTime += totalDuration
        }

        // 记录统计
        if (!this.stats.has(call.methodName)) {
            this.stats.set(call.methodName, {
                count: 0,
                totalTime: 0,
                netTime: 0,
                maxTime: 0,
                minTime: Infinity,
                inputSizes: [],
                outputSizes: []
            })
        }

        const stat = this.stats.get(call.methodName)!
        stat.count++
        stat.totalTime += totalDuration
        stat.netTime += netDuration
        stat.maxTime = Math.max(stat.maxTime, netDuration)
        stat.minTime = Math.min(stat.minTime, netDuration)

        if (inputSize !== undefined) {
            stat.inputSizes.push(inputSize)
        }
        if (outputSize !== undefined) {
            stat.outputSizes.push(outputSize)
        }

        // 从调用栈移除
        this.callStack.pop()

        return netDuration
    }

    // 记录方法调用（兼容旧接口，但使用净耗时）
    record(methodName: string, duration: number, inputSize?: number, outputSize?: number) {
        // 这个接口用于直接记录耗时（不通过调用栈）
        // 假设这是净耗时（已经排除了子方法）
        if (!this.stats.has(methodName)) {
            this.stats.set(methodName, {
                count: 0,
                totalTime: 0,
                netTime: 0,
                maxTime: 0,
                minTime: Infinity,
                inputSizes: [],
                outputSizes: []
            })
        }

        const stat = this.stats.get(methodName)!
        stat.count++
        stat.totalTime += duration
        stat.netTime += duration  // 假设传入的已经是净耗时
        stat.maxTime = Math.max(stat.maxTime, duration)
        stat.minTime = Math.min(stat.minTime, duration)

        if (inputSize !== undefined) {
            stat.inputSizes.push(inputSize)
        }
        if (outputSize !== undefined) {
            stat.outputSizes.push(outputSize)
        }
    }

    // 记录缓存命中/未命中
    recordCacheHit(cacheType: 'dfsFirstKCache' | 'bfsAllCache' | 'bfsLevelCache' | 'getDirectChildren' |
        'dfsFirst1' | 'dfsFirstK' | 'bfsLevel' | 'expandOneLevel' | 'expandOneLevelTruncated') {
        this.cacheStats[cacheType].hit++
        this.cacheStats[cacheType].total++
    }

    recordCacheMiss(cacheType: 'dfsFirstKCache' | 'bfsAllCache' | 'bfsLevelCache' | 'getDirectChildren' |
        'dfsFirst1' | 'dfsFirstK' | 'bfsLevel' | 'expandOneLevel' | 'expandOneLevelTruncated') {
        this.cacheStats[cacheType].miss++
        this.cacheStats[cacheType].total++
    }

    // 记录实际计算
    recordActualCompute() {
        this.cacheStats.actualCompute++
    }

    // 输出统计报告
    report() {
        console.log('\n📊 ===== 性能分析报告 =====\n')

        // 1. subRuleHandler 总体统计
        console.log('🎯 subRuleHandler 调用统计:')
        console.log(`   总调用次数: ${this.cacheStats.subRuleHandlerTotal}`)
        console.log(`   递归检测返回: ${this.cacheStats.recursiveReturn}`)
        console.log(`   层级限制返回: ${this.cacheStats.levelLimitReturn}`)
        console.log(`   正常处理: ${this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn}`)
        console.log('')

        // 2. 缓存统计
        console.log('💾 缓存命中率统计:')
        console.log(`   DFS_First1 (深度优先 First(1)):`)
        console.log(`     命中: ${this.cacheStats.dfsFirst1.hit}`)
        console.log(`     未命中: ${this.cacheStats.dfsFirst1.miss}`)
        console.log(`     总次数: ${this.cacheStats.dfsFirst1.total}`)
        console.log(`     命中率: ${this.cacheStats.dfsFirst1.total > 0 ? ((this.cacheStats.dfsFirst1.hit / this.cacheStats.dfsFirst1.total) * 100).toFixed(1) : 0}%`)

        console.log(`   DFS_FirstK (深度优先 First(K)):`)
        console.log(`     命中: ${this.cacheStats.dfsFirstK.hit}`)
        console.log(`     未命中: ${this.cacheStats.dfsFirstK.miss}`)
        console.log(`     总次数: ${this.cacheStats.dfsFirstK.total}`)
        console.log(`     命中率: ${this.cacheStats.dfsFirstK.total > 0 ? ((this.cacheStats.dfsFirstK.hit / this.cacheStats.dfsFirstK.total) * 100).toFixed(1) : 0}%`)

        console.log(`   GetDirectChildren (懒加载缓存):`)
        console.log(`     命中: ${this.cacheStats.getDirectChildren.hit}`)
        console.log(`     未命中: ${this.cacheStats.getDirectChildren.miss}`)
        console.log(`     总次数: ${this.cacheStats.getDirectChildren.total}`)
        console.log(`     命中率: ${this.cacheStats.getDirectChildren.total > 0 ? ((this.cacheStats.getDirectChildren.hit / this.cacheStats.getDirectChildren.total) * 100).toFixed(1) : 0}%`)

        // BFS 增量优化效果
        if (this.cacheStats.bfsOptimization.totalCalls > 0) {
            console.log(`\n   🚀 BFS 增量优化效果:`)
            console.log(`     总调用次数: ${this.cacheStats.bfsOptimization.totalCalls}`)
            console.log(`     从 level 1 开始: ${this.cacheStats.bfsOptimization.fromLevel1} (${((this.cacheStats.bfsOptimization.fromLevel1 / this.cacheStats.bfsOptimization.totalCalls) * 100).toFixed(1)}%)`)
            console.log(`     从缓存层级开始: ${this.cacheStats.bfsOptimization.fromCachedLevel} (${((this.cacheStats.bfsOptimization.fromCachedLevel / this.cacheStats.bfsOptimization.totalCalls) * 100).toFixed(1)}%)`)
            console.log(`     总计跳过层数: ${this.cacheStats.bfsOptimization.skippedLevels}`)
            if (this.cacheStats.bfsOptimization.fromCachedLevel > 0) {
                const avgSkipped = this.cacheStats.bfsOptimization.skippedLevels / this.cacheStats.bfsOptimization.fromCachedLevel
                console.log(`     平均每次跳过: ${avgSkipped.toFixed(2)} 层`)
            }
        }

        // 以下缓存仅在特殊场景使用，通常命中率较低
        if (this.cacheStats.bfsLevel.total > 0) {
            console.log(`   BFS_Level (handleDFS特殊场景: firstK=∞, maxLevel=1):`)
            console.log(`     命中: ${this.cacheStats.bfsLevel.hit}`)
            console.log(`     未命中: ${this.cacheStats.bfsLevel.miss}`)
            console.log(`     总次数: ${this.cacheStats.bfsLevel.total}`)
            console.log(`     命中率: ${((this.cacheStats.bfsLevel.hit / this.cacheStats.bfsLevel.total) * 100).toFixed(1)}%`)
        }

        if (this.cacheStats.expandOneLevel.total > 0) {
            console.log(`   ExpandOneLevel (BFS路径展开缓存):`)
            console.log(`     命中: ${this.cacheStats.expandOneLevel.hit}`)
            console.log(`     未命中: ${this.cacheStats.expandOneLevel.miss}`)
            console.log(`     总次数: ${this.cacheStats.expandOneLevel.total}`)
            console.log(`     命中率: ${((this.cacheStats.expandOneLevel.hit / this.cacheStats.expandOneLevel.total) * 100).toFixed(1)}%`)
        }

        console.log(`   实际计算次数 (getDirectChildren): ${this.cacheStats.actualCompute}`)
        console.log('')

        // 验证统计完整性
        const expectedNormalProcess = this.cacheStats.subRuleHandlerTotal - this.cacheStats.recursiveReturn - this.cacheStats.levelLimitReturn
        const actualCacheOperations = this.cacheStats.dfsFirst1.hit +
            this.cacheStats.dfsFirstK.hit +
            this.cacheStats.actualCompute
        console.log(`📈 统计验证:`)
        console.log(`   预期正常处理: ${expectedNormalProcess}`)
        console.log(`   实际缓存操作: ${actualCacheOperations}`)
        console.log(`   差异: ${expectedNormalProcess - actualCacheOperations} (应该接近0)`)
        console.log('')

        // 2. 方法调用统计（按净耗时排序）
        const sorted = Array.from(this.stats.entries())
            .sort((a, b) => b[1].netTime - a[1].netTime)
            .slice(0, 20)  // 只显示前20个

        // 计算总耗时
        const totalTime = Array.from(this.stats.values())
            .reduce((sum, stat) => sum + stat.totalTime, 0)

        // 计算净耗时总和（用于百分比计算）
        const totalNetTime = Array.from(this.stats.values())
            .reduce((sum, stat) => sum + stat.netTime, 0)

        console.log('⏱️  方法耗时统计 (按净耗时排序, Top 20):')
        console.log('='.repeat(80))
        for (const [method, stat] of sorted) {
            const avgNetTime = stat.netTime / stat.count
            const avgTotalTime = stat.totalTime / stat.count
            const percentage = totalNetTime > 0 ? (stat.netTime / totalNetTime * 100).toFixed(1) : '0.0'
            const avgInput = stat.inputSizes.length > 0
                ? stat.inputSizes.reduce((a, b) => a + b, 0) / stat.inputSizes.length
                : 0
            const avgOutput = stat.outputSizes.length > 0
                ? stat.outputSizes.reduce((a, b) => a + b, 0) / stat.outputSizes.length
                : 0

            console.log(`📌 ${method}:`)
            console.log(`   净耗时: ${stat.netTime.toFixed(0)}ms (${percentage}%) | 总耗时: ${stat.totalTime.toFixed(0)}ms`)
            console.log(`   调用次数: ${stat.count}次, 平均净耗时: ${avgNetTime.toFixed(2)}ms, 平均总耗时: ${avgTotalTime.toFixed(2)}ms`)
            console.log(`   最大耗时: ${stat.maxTime.toFixed(0)}ms, 最小耗时: ${stat.minTime === Infinity ? 0 : stat.minTime.toFixed(0)}ms`)

            if (stat.inputSizes.length > 0 && stat.outputSizes.length > 0) {
                console.log(`   输入→输出: ${avgInput.toFixed(1)} → ${avgOutput.toFixed(1)} (${(avgOutput / avgInput).toFixed(1)}x)`)
            }
            console.log('')
        }

        console.log(`⏱️  所有方法净耗时总和: ${totalNetTime.toFixed(2)}ms`)
        console.log(`⏱️  所有方法总耗时总和: ${totalTime.toFixed(2)}ms`)
        console.log('='.repeat(80))
        console.log('')
    }

    // 清空统计
    clear() {
        this.stats.clear()
        this.cacheStats = {
            subRuleHandlerTotal: 0,
            recursiveReturn: 0,
            levelLimitReturn: 0,
            // 新的独立缓存统计
            dfsFirstKCache: {hit: 0, miss: 0, total: 0},
            bfsAllCache: {hit: 0, miss: 0, total: 0},
            bfsLevelCache: {hit: 0, miss: 0, total: 0},
            getDirectChildren: {hit: 0, miss: 0, total: 0},
            // 废弃的统计（保留兼容性）
            dfsFirst1: {hit: 0, miss: 0, total: 0},
            dfsFirstK: {hit: 0, miss: 0, total: 0},
            bfsLevel: {hit: 0, miss: 0, total: 0},
            expandOneLevel: {hit: 0, miss: 0, total: 0},
            expandOneLevelTruncated: {hit: 0, miss: 0, total: 0},
            actualCompute: 0,
            bfsOptimization: {
                totalCalls: 0,
                skippedLevels: 0,
                fromLevel1: 0,
                fromCachedLevel: 0
            }
        }
    }
}

/**
 * 全局统一限制配置
 *
 * 设计理念：
 * - MAX_LEVEL：控制展开深度，防止无限递归
 * - MAX_BRANCHES：仅用于冲突检测时的路径比较优化
 */
export const EXPANSION_LIMITS = {
    FIRST_K: 3,
    FIRST_Max: 100,

    LEVEL_1: 1,
    LEVEL_K: 10,

    INFINITY: Infinity,
    RuleJoinSymbol: '\x1F',

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
     *
     * 当前设置：已取消限制（Infinity），可能导致性能问题
     */
    MAX_BRANCHES: Infinity,
} as const

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
    /** 正在计算的规则（用于检测循环依赖） */
    private recursiveDetectionSet = new Set<string>()

    /** 当前规则名（用于日志记录） */
    private currentRuleName: string | null = null

    /** 当前规则的日志文件描述符（使用同步写入） */
    private currentLogFd: number | null = null

    /** 当前规则的日志文件路径 */
    private currentLogFilePath: string | null = null

    /** 当前调用深度（用于缩进） */
    private currentDepth: number = 0

    /**
     * 写入日志（使用当前深度控制缩进，自动添加文件名前缀）
     * 使用同步写入确保日志立即刷新到磁盘
     */
    private writeLog(message: string, depth?: number): void {
        if (this.currentLogFd !== null && this.currentRuleName) {
            const indent = '  '.repeat(depth !== undefined ? depth : this.currentDepth)
            const logFileName = `${this.currentRuleName}-执行中.log`
            const logLine = `${indent}[${logFileName}] ${message}\n`
            try {
                // 使用同步写入，确保立即刷新到磁盘
                fs.writeSync(this.currentLogFd, logLine, null, 'utf8')
            } catch (error) {
                console.error(`写入日志失败: ${logFileName}`, error)
            }
        }
    }

    /**
     * 开始记录规则日志
     */
    private startRuleLogging(ruleName: string): void {
        console.log(`🔍 startRuleLogging 被调用: ${ruleName}`)
        // 结束之前的日志
        this.endRuleLogging()

        // 设置当前规则和深度
        this.currentRuleName = ruleName
        this.currentDepth = 0

        // 创建日志目录（相对于 subhuti 目录）
        // 从当前文件位置向上查找，找到 subhuti 目录
        // 获取当前文件的目录（兼容 CommonJS 和 ES modules）
        let currentDir: string
        try {
            // ES modules 方式
            const __filename = fileURLToPath(import.meta.url)
            currentDir = path.dirname(__filename)
        } catch {
            // CommonJS 方式（如果 __dirname 可用）
            currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
        }

        let subhutiDir = currentDir
        while (subhutiDir !== path.dirname(subhutiDir)) {
            const dirName = path.basename(subhutiDir)
            if (dirName === 'subhuti') {
                break
            }
            subhutiDir = path.dirname(subhutiDir)
        }
        const logDir = path.join(subhutiDir, 'logall')
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, {recursive: true})
            console.log(`📁 创建日志目录: ${logDir}`)
        } else {
            console.log(`📁 使用日志目录: ${logDir}`)
        }

        // 创建日志文件（执行中状态）
        const logFilePath = path.join(logDir, `${ruleName}-执行中.log`)
        this.currentLogFilePath = logFilePath
        console.log(`[DEBUG] 准备创建日志文件: ${logFilePath}`)

        // 使用同步方式创建文件并打开文件描述符
        try {
            console.log(`[DEBUG] 开始写入文件内容...`)
            const initialContent = `========== 开始处理规则: ${ruleName} ==========\n时间: ${new Date().toISOString()}\n\n`

            // 打开文件描述符（写入模式，如果文件存在则截断）
            this.currentLogFd = fs.openSync(logFilePath, 'w')

            // 写入初始内容
            fs.writeSync(this.currentLogFd, initialContent, null, 'utf8')
            console.log(`[DEBUG] 文件描述符已打开并写入初始内容`)

            // 验证文件是否创建成功
            if (fs.existsSync(logFilePath)) {
                const stats = fs.statSync(logFilePath)
                console.log(`✅ 日志文件已创建: ${logFilePath}, 大小: ${stats.size} bytes`)
            } else {
                console.error(`❌ 文件写入后不存在: ${logFilePath}`)
                if (this.currentLogFd !== null) {
                    fs.closeSync(this.currentLogFd)
                    this.currentLogFd = null
                }
                return
            }

        } catch (error: any) {
            console.error(`❌ 创建日志文件失败: ${logFilePath}`)
            console.error(`错误类型: ${error?.constructor?.name || typeof error}`)
            console.error(`错误消息: ${error?.message || String(error)}`)
            if (error?.stack) {
                console.error(`错误堆栈:`, error.stack)
            }
            if (this.currentLogFd !== null) {
                try {
                    fs.closeSync(this.currentLogFd)
                } catch (e) {
                    // 忽略关闭错误
                }
                this.currentLogFd = null
            }
        }
    }

    /**
     * 结束记录规则日志
     */
    private endRuleLogging(): void {
        if (this.currentLogFd !== null && this.currentRuleName && this.currentLogFilePath) {
            this.writeLog('', 0)
            this.writeLog(`========== 结束处理规则: ${this.currentRuleName} ==========`, 0)

            // 保存规则名和文件路径，用于重命名
            const ruleName = this.currentRuleName
            const executingFilePath = this.currentLogFilePath

            // 从当前文件位置向上查找，找到 subhuti 目录
            let currentDir: string
            try {
                // ES modules 方式
                const __filename = fileURLToPath(import.meta.url)
                currentDir = path.dirname(__filename)
            } catch {
                // CommonJS 方式（如果 __dirname 可用）
                currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd()
            }

            let subhutiDir = currentDir
            while (subhutiDir !== path.dirname(subhutiDir)) {
                const dirName = path.basename(subhutiDir)
                if (dirName === 'subhuti') {
                    break
                }
                subhutiDir = path.dirname(subhutiDir)
            }
            const logDir = path.join(subhutiDir, 'logall')
            const completedFilePath = path.join(logDir, `${ruleName}-执行完.log`)

            console.log(`[DEBUG] 准备关闭日志文件: ${ruleName}`)

            // 同步关闭文件描述符并重命名文件
            try {
                // 关闭文件描述符
                fs.closeSync(this.currentLogFd)
                this.currentLogFd = null
                this.currentLogFilePath = null

                console.log(`[DEBUG] 文件描述符已关闭，准备重命名文件`)
                console.log(`[DEBUG] 源文件: ${executingFilePath}`)
                console.log(`[DEBUG] 目标文件: ${completedFilePath}`)

                // 检查源文件是否存在
                if (fs.existsSync(executingFilePath)) {
                    console.log(`[DEBUG] 源文件存在，开始重命名`)
                    fs.renameSync(executingFilePath, completedFilePath)
                    console.log(`✅ 日志文件已重命名: ${ruleName}-执行中.log -> ${ruleName}-执行完.log`)
                } else {
                    console.error(`❌ 源文件不存在: ${executingFilePath}`)
                }
            } catch (error) {
                console.error(`❌ 关闭或重命名日志文件失败: ${executingFilePath} -> ${completedFilePath}`, error)
            }
        }
        this.currentRuleName = null
        this.currentDepth = 0
        this.currentLogFd = null
        this.currentLogFilePath = null
    }

    // ========================================
    // DFS（深度优先）专属缓存
    // 适用：maxLevel = INFINITY（无限层数，递归到token）
    // ========================================

    /** DFS 主缓存：key="ruleName"，First(K) + 无限层级 */
    private dfsFirstKCache = new Map<string, string[][]>()

    // ========================================
    // BFS（广度优先）专属缓存
    // 适用：maxLevel = 具体值（限制层数，按层级展开）
    // 特点：BFS 只负责按层级展开，不负责截取
    // ========================================

    //todo bfs无法全层展开，优化方向，使用图找到循环点，去环，计算深度，根据深度排序，浅层优先计算和缓存，深层调用的每一个都换存过的方式尝试解决问题
    /** BFS 缓存：key="ruleName"（完整展开，不截取，所有层级聚合） */
    private bfsAllCache = new Map<string, string[][]>()
    /** BFS 缓存：key="ruleName:level"（完整展开，不截取） */
    private bfsLevelCache = new Map<string, string[][]>()

    /** 性能分析器（包含所有缓存统计） */
    private perfAnalyzer = new PerformanceAnalyzer()

    /** 收集检测过程中发现的左递归错误（使用 Map 提高查重性能） */
    private detectedLeftRecursionErrors = new Map<string, LeftRecursionError>()

    /**
     * 封装的缓存 get 方法（统一管理所有缓存统计）
     *
     * ✅ 设计原则：
     * - 每次 get 调用都会增加 total 计数
     * - 如果缓存存在则 hit++，否则 miss++
     * - total 始终等于 hit + miss
     *
     * @param cacheType - 缓存类型
     * @param key - 缓存键
     * @returns 缓存的值，如果不存在返回 undefined
     */
    private getCacheValue(
        cacheType: 'dfsFirstKCache' | 'bfsAllCache' | 'bfsLevelCache',
        key: string
    ): string[][] | undefined {
        // 根据类型获取对应的缓存
        let result: string[][] | undefined
        switch (cacheType) {
            case 'dfsFirstKCache':
                result = this.dfsFirstKCache.get(key)
                break
            case 'bfsAllCache':
                result = this.bfsAllCache.get(key)
                break
            case 'bfsLevelCache':
                result = this.bfsLevelCache.get(key)
                break
        }

        // 统一记录命中/未命中统计
        if (result !== undefined) {
            this.perfAnalyzer.recordCacheHit(cacheType)
        } else {
            this.perfAnalyzer.recordCacheMiss(cacheType)
        }

        return result
    }

    /** 配置选项 */
    private options: Required<GrammarAnalyzerOptions>

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
            maxLevel: options?.maxLevel ?? 5
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
     * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * 实现方式：
     * - 遍历所有规则的 AST
     * - 递归查找所有 Or 节点
     * - 先计算每个分支的 First(1) 集合
     * - 如果有冲突，再深入检测 First(5)
     *
     * @returns Or 冲突错误列表
     */
    /**
     * 检测所有规则的 Or 分支冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * 实现方式：
     * - 遍历所有规则的 AST
     * - 递归查找所有 Or 节点
     * - 先计算每个分支的 First(1) 集合
     * - 如果有冲突，再深入检测 First(5)
     *
     * @returns Or 冲突错误列表
     */
    public checkAllOrConflicts(): ValidationError[] {
        const orConflictErrors: ValidationError[] = []

        // 详细的性能统计
        const perfStats = {
            totalTime: 0,
            ruleStats: new Map<string, {
                time: number,
                orNodeCount: number,
                pathCount: number,
                maxPathCount: number
            }>()
        }

        const startTime = Date.now()

        // 遍历所有规则
        for (const [ruleName, ruleAST] of this.ruleASTs.entries()) {
            const ruleStartTime = Date.now()

            const ruleStats = {
                time: 0,
                orNodeCount: 0,
                pathCount: 0,
                maxPathCount: 0
            }

            const error = this.checkOrConflictsInNodeSmart(ruleName, ruleAST, ruleStats)
            if (error) {
                orConflictErrors.push(error)
            }

            ruleStats.time = Date.now() - ruleStartTime
            perfStats.ruleStats.set(ruleName, ruleStats)
        }

        perfStats.totalTime = Date.now() - startTime

        return orConflictErrors
    }


    /**
     * 递归检查节点中的 Or 冲突（智能模式：先 First(1)，有冲突再 First(5)）
     *
     * @param ruleName 规则名
     * @param node 当前节点
     * @param ruleStats 规则统计信息
     */
    private checkOrConflictsInNodeSmart(
        ruleName: string,
        node: RuleNode,
        ruleStats?: any
    ) {
        let error
        switch (node.type) {
            case 'or':
                // 统计 Or 节点数量
                if (ruleStats) ruleStats.orNodeCount++

                // 执行冲突检测（带性能统计）
                error = this.detectOrBranchConflictsWithCache(ruleName, node, ruleStats)
                if (error) return error

                // 递归检查每个分支
                for (const alt of node.alternatives) {
                    error = this.checkOrConflictsInNodeSmart(ruleName, alt, ruleStats)
                    if (error) return error
                }
                break

            case 'sequence':
                // 递归检查序列中的每个节点
                for (const child of node.nodes) {
                    error = this.checkOrConflictsInNodeSmart(ruleName, child, ruleStats)
                    if (error) return error
                }
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // 递归检查内部节点
                error = this.checkOrConflictsInNodeSmart(ruleName, node.node, ruleStats)
                if (error) return error
                break

            case 'consume':
            case 'subrule':
                // 叶子节点，不需要递归
                break
        }
    }


    /**
     * 获取 Or 节点所有分支的完整路径（深度展开）
     *
     * 核心逻辑：
     * 1. 展开每个分支到第一层（得到规则名序列）
     * 2. 从 cache 获取每个规则的所有路径
     * 3. 笛卡尔积组合，得到分支的所有可能路径
     * 4. 返回每个分支的路径集合
     *
     * @param orNode - Or 节点
     * @param firstK - First(K) 的 K 值
     * @param cacheType - 缓存类型
     * @returns 每个分支的路径集合数组
     */
    getOrNodeAllBranchRules(
        ruleName: string,
        orNode: OrNode,
        firstK: number,
        cacheType: 'dfsFirstKCache' | 'bfsAllCache'
    ): string[][][] {
        // 存储每个分支的路径集合
        let allOrs: string[][][] = []

        // 遍历 Or 的每个分支
        for (const seqNode of orNode.alternatives) {
            // 步骤1：展开分支到第一层（得到规则名序列）
            // 例如：sequence(If, Expression, Block) → [['If', 'Expression', 'Block']]
            const nodeAllBranches = this.expandNode(seqNode, EXPANSION_LIMITS.INFINITY, 0, 1, false)

            let allBranchAllSeq: string[][] = []

            // 遍历第一层展开的每个可能性,每个分支的所有可能性
            for (const branch of nodeAllBranches) {
                // 步骤2：从 cache 获取每个规则的所有路径
                // 例如：['If', 'Expression'] → [[If的路径], [Expression的路径]]
                const seqAllBranches = branch.map(rule => {
                    const paths = this.getCacheValue(cacheType, rule)
                    // 防御：如果规则不在缓存中，返回 [[rule]]
                    return paths || [[rule]]
                })

                // 步骤3：笛卡尔积组合，得到当前分支的所有可能路径
                // 例如：[[a,b], [c,d]] × [[e], [f,g]] → [[a,b,e], [a,b,f,g], [c,d,e], [c,d,f,g]]
                const branchAllSeq = this.cartesianProduct(seqAllBranches, firstK)
                // 合并到结果中
                allBranchAllSeq = allBranchAllSeq.concat(branchAllSeq)
            }
            allOrs.push(this.deduplicate(allBranchAllSeq))
        }

        // 统一去重：多个分支可能产生相同的路径
        return allOrs
    }

    private removeDuplicatePaths(
        pathsFront: string[][],
        pathsBehind: string[][]
    ): string[][] {
        // 防御：如果输入为空，直接返回
        if (pathsBehind.length === 0) {
            return []
        }

        // 步骤1：将 pathsFront 转换为 Set<string>（用于快速查找）
        const frontSet = new Set<string>()
        for (const path of pathsFront) {
            // 将路径数组转换为字符串作为 key
            const key = path.join(EXPANSION_LIMITS.RuleJoinSymbol)
            frontSet.add(key)
        }

        // 步骤2：过滤 pathsBehind，只保留不在 Set 中的路径
        const uniqueBehind: string[][] = []
        for (const path of pathsBehind) {
            const key = path.join(EXPANSION_LIMITS.RuleJoinSymbol)
            if (!frontSet.has(key)) {
                uniqueBehind.push(path)
            }
        }
        return uniqueBehind
    }

    /**
     * 使用前缀树检测两个路径集合中是否存在完全相同的路径
     *
     * @param pathsFront - 前面分支的路径数组
     * @param pathsBehind - 后面分支的路径数组
     * @returns 如果找到完全相同的路径返回该路径，否则返回 null
     */
    private findEqualPath(
        pathsFront: string[][],
        pathsBehind: string[][]
    ): string[] | null {
        // 时间复杂度：O((m+n)*k)
        // 空间复杂度：O(m) - 只需要存储字符串
        const behindSet = new Set<string>()
        for (const path of pathsBehind) {
            behindSet.add(path.join(EXPANSION_LIMITS.RuleJoinSymbol))  // O(k)
        }
        for (const pathFront of pathsFront) {
            const key = pathFront.join(EXPANSION_LIMITS.RuleJoinSymbol)  // O(k)
            if (behindSet.has(key)) {  // O(1)
                return pathFront
            }
        }
    }

    /**
     * 使用前缀树检测两个路径集合中的前缀关系
     *
     * @param pathsFront - 前面分支的路径数组
     * @param pathsBehind - 后面分支的路径数组
     * @returns 如果找到前缀关系返回 { prefix, full }，否则返回 null
     */
    private trieTreeFindPrefixMatch(
        pathsFront: string[][],
        pathsBehind: string[][]
    ): { prefix: string[], full: string[] } | null {
        // 防御：如果没有可比较的路径，直接返回
        if (pathsBehind.length === 0 || pathsFront.length === 0) {
            return null
        }

        // 过滤掉与 pathsFront 完全相同的路径
        const uniqueBehind = this.removeDuplicatePaths(pathsFront, pathsBehind)

        // 如果过滤后没有路径，直接返回
        if (uniqueBehind.length === 0) {
            return null
        }

        // 步骤2：构建前缀树（O(m*k)，m=pathsBehind.length，k=平均路径长度）
        const trie = new ArrayTrie()
        for (const path of uniqueBehind) {
            // 将每个路径插入到前缀树中
            trie.insert(path)
        }

        // 步骤3：查询前缀关系（O(n*k)，n=pathsFront.length）
        for (const pathFront of pathsFront) {
            // 使用前缀树查找匹配
            // 查找是否有以 pathFront 为前缀的更长路径
            const fullPath = trie.findPrefixMatch(pathFront)

            if (fullPath) {
                // 找到前缀关系
                return {
                    prefix: pathFront,
                    full: fullPath
                }
            }
        }

        // 没有前缀关系
        return null
    }

    /**
     * 生成前缀冲突的修复建议
     *
     * @param ruleName - 规则名
     * @param branchA - 分支A索引
     * @param branchB - 分支B索引
     * @param conflict - 冲突信息
     * @returns 修复建议
     */
    private getPrefixConflictSuggestion(
        ruleName: string,
        branchA: number,
        branchB: number,
        conflict: { prefix: string, full: string, type: 'prefix' | 'equal' }
    ): string {
        if (conflict.type === 'equal') {
            return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`
        }

        return ``
    }

    /**
     * 线路1：使用 First(K) 检测 Or 分支冲突（智能检测）
     *
     * 检测逻辑：对每个路径对，根据长度选择检测方法
     * - 路径长度都等于 firstK：检测是否完全相同（findEqualPath）
     * - 前面路径长度 < firstK：检测是否是前缀（findPrefixRelation）
     *
     * 数据源：dfsFirstKCache（First(K) 的展开结果）
     *
     * @param ruleName 输出错误日志使用
     * @param orNode - Or 节点
     * @param ruleStats
     */
    detectOrBranchEqualWithFirstK(
        ruleName: string,
        orNode: OrNode,
        ruleStats?: any
    ) {
        // 防御：至少需要2个分支
        if (orNode.alternatives.length < 2) {
            return
        }

        // 获取每个分支的 First(K) 路径集合
        const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.FIRST_K, 'dfsFirstKCache')
        const firstK = EXPANSION_LIMITS.FIRST_K

        // 统计路径数量
        if (ruleStats) {
            const totalPaths = branchPathSets.reduce((sum, paths) => sum + paths.length, 0)
            const maxPaths = Math.max(...branchPathSets.map(paths => paths.length))
            ruleStats.pathCount += totalPaths
            ruleStats.maxPathCount = Math.max(ruleStats.maxPathCount, maxPaths)
        }

        // 单向遍历：检测前面的分支是否与后面的分支冲突
        for (let i = 0; i < branchPathSets.length; i++) {
            for (let j = i + 1; j < branchPathSets.length; j++) {
                const pathsFront = branchPathSets[i]
                const pathsBehind = branchPathSets[j]

                // 检测相等冲突
                const equalPath = this.findEqualPath(pathsFront, pathsBehind)
                if (equalPath) {
                    const equalPathStr = equalPath.join(EXPANSION_LIMITS.RuleJoinSymbol)
                    return {
                        level: 'ERROR',
                        type: 'or-identical-branches',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: equalPathStr,
                            pathB: equalPathStr
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 和分支 ${j + 1} 的前 ${firstK} 个 token 完全相同`,
                        suggestion: this.getEqualBranchSuggestion(ruleName, i, j, equalPathStr)
                    }
                }

                // 检测前缀冲突
                const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind)
                if (prefixRelation) {
                    const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol)
                    const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol)
                    return {
                        level: 'ERROR',
                        type: 'prefix-conflict',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: prefixStr,
                            pathB: fullStr
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}（在 First(${firstK}) 阶段检测到）`,
                        suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
                            prefix: prefixStr,
                            full: fullStr,
                            type: 'prefix'
                        })
                    }
                }
            }
        }
    }


    /**
     * 线路2：使用 MaxLevel 检测 Or 分支的前缀遮蔽关系
     *
     * 检测目标：前面的分支是否是后面分支的前缀
     * 数据源：bfsAllCache（深度展开的完整路径）
     * 检测方法：findPrefixRelation()
     * 性能：O(n²) - 深度检测
     *
     * 适用场景：
     * - 检测前缀遮蔽问题
     * - 需要深度展开才能发现的冲突
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     */
    detectOrBranchPrefixWithMaxLevel(
        ruleName: string,
        orNode: OrNode,
        ruleStats?: any
    ) {
        // 防御：至少需要2个分支
        if (orNode.alternatives.length < 2) {
            return
        }

        // 获取每个分支的深度展开路径集合
        const branchPathSets = this.getOrNodeAllBranchRules(ruleName, orNode, EXPANSION_LIMITS.INFINITY, 'bfsAllCache')

        // 统计路径数量（MaxLevel 的路径可能非常多）
        if (ruleStats) {
            const totalPaths = branchPathSets.reduce((sum, paths) => sum + paths.length, 0)
            const maxPaths = Math.max(...branchPathSets.map(paths => paths.length))

        }

        // 单向遍历：检测前面的分支是否遮蔽后面的分支
        for (let i = 0; i < branchPathSets.length; i++) {
            for (let j = i + 1; j < branchPathSets.length; j++) {
                const pathsFront = branchPathSets[i]
                const pathsBehind = branchPathSets[j]

                // 检测前缀关系（O(n²)）
                const prefixRelation = this.trieTreeFindPrefixMatch(pathsFront, pathsBehind)

                if (prefixRelation) {
                    // 将路径数组转换为字符串
                    const prefixStr = prefixRelation.prefix.join(EXPANSION_LIMITS.RuleJoinSymbol)
                    const fullStr = prefixRelation.full.join(EXPANSION_LIMITS.RuleJoinSymbol)

                    // 发现前缀遮蔽，报告错误
                    return ({
                        level: 'ERROR',
                        type: 'prefix-conflict',
                        ruleName,
                        branchIndices: [i, j],
                        conflictPaths: {
                            pathA: prefixStr,
                            pathB: fullStr
                        },
                        message: `规则 "${ruleName}" 的 Or 分支 ${i + 1} 会遮蔽分支 ${j + 1}`,
                        suggestion: this.getPrefixConflictSuggestion(ruleName, i, j, {
                            prefix: prefixStr,
                            full: fullStr,
                            type: 'prefix'
                        })
                    })
                }
            }
        }
    }

    /**
     * 生成相同分支的修复建议
     */
    private getEqualBranchSuggestion(
        ruleName: string,
        branchA: number,
        branchB: number,
        equalPath: string
    ): string {
        return `分支 ${branchA + 1} 和分支 ${branchB + 1} 的路径完全相同！

检测到的问题：
  相同路径: ${equalPath}

这意味着：
- 两个分支会匹配相同的输入
- 分支 ${branchB + 1} 永远不会被执行（因为分支 ${branchA + 1} 在前面）

修复建议：
1. **删除重复分支**：保留其中一个分支即可
2. **检查逻辑**：确认是否是复制粘贴错误
3. **合并分支**：如果语义相同，合并为一个分支

示例：
or([A, A, B]) → or([A, B])  // 删除重复的A`
    }

    /**
     * 完整的 Or 分支深度检测（使用缓存）- 带防御性校验
     *
     * 检测流程：
     * 1. 线路1：使用 First(K) 快速检测
     * 2. 如果发现"遮蔽"错误：使用 MaxLevel 深度检测进行验证（防御性编程）
     * 3. 如果发现"相同"错误：直接返回（不需要验证）
     *
     * 防御性编程：
     * - 如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
     * - 否则说明两个检测逻辑不一致，抛出错误
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     * @returns 检测到的错误，如果没有错误返回 undefined
     */
    /**
     * 完整的 Or 分支检测（First(K) 预检 + MaxLevel 深度检测）
     *
     * 业务逻辑：
     * 1. First(K) 预检：快速检测相同/遮蔽错误
     * 2. 有任何错误 → 执行 MaxLevel 深度检测
     * 3. 防御性检查：如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
     * 4. 返回结果：优先返回 MaxLevel 结果，如果没有则返回 First(K) 结果
     *
     * @param ruleName - 规则名
     * @param orNode - Or 节点
     * @returns 检测到的错误，如果没有错误返回 undefined
     */
    detectOrBranchConflictsWithCache(
        ruleName: string,
        orNode: OrNode,
        ruleStats?: any
    ) {
        const orStartTime = Date.now()

        // 🚀 线路1：First(K) 预检（快速）
        let firstKError = this.detectOrBranchEqualWithFirstK(ruleName, orNode, ruleStats)

        // 情况1：预检通过，没有发现错误
        if (!firstKError) {
            // 直接返回，无需深度检测
            return
        }

        // 情况2：预检发现错误（相同/遮蔽），执行深度检测
        const maxLevelError = this.detectOrBranchPrefixWithMaxLevel(ruleName, orNode, ruleStats)

        const orTime = Date.now() - orStartTime

        // 🛡️ 防御性编程：如果 First(K) 检测到遮蔽，MaxLevel 必须也能检测到
        if (firstKError.type === 'prefix-conflict') {
            if (!maxLevelError) {
                const errorMsg = `
🔴 ========== 防御性检查失败 ==========
规则: ${ruleName}
问题: First(K) 检测到遮蔽，但 MaxLevel 未检测到

First(K) 检测结果:
  类型: ${firstKError.type}
  分支: ${firstKError.branchIndices[0] + 1} → ${firstKError.branchIndices[1] + 1}
  前缀: ${firstKError.conflictPaths?.pathA}
  完整: ${firstKError.conflictPaths?.pathB}

MaxLevel 检测结果: 无冲突

可能原因:
1. First(K) 误报（检测逻辑错误）
2. MaxLevel 漏检（检测逻辑错误）
3. dfsFirstKCache 和 bfsAllCache 数据不一致
==========================================`
                console.error(errorMsg)
                throw new Error(`防御性检查失败: First(K) 检测到遮蔽但 MaxLevel 未检测到 (规则: ${ruleName})`)
            }
        }

        // 只返回遮蔽问题，非遮蔽不算问题
        return maxLevelError
    }

    depthMap = new Map()

    private findRuleDepth(
        ruleName: string,
    ) {
        // console.log('进入子规则')
        // console.log(ruleName)
        // 层级+1（进入子规则）
        // curLevel++
        // ========================================
        // 阶段2：递归检测（DFS 专属）
        // ========================================

        // 递归检测：如果规则正在计算中
        if (this.recursiveDetectionSet.has(ruleName)) {
            // 记录递归检测返回，用于分析为什么都是1
            return 1
        }

        // 标记当前规则正在计算（防止循环递归）
        this.recursiveDetectionSet.add(ruleName)

        try {
            const node = this.ruleASTs.get(ruleName)
            // 修复：node 不一定是 SequenceNode，应该调用 findNodeDepth 来正确处理所有类型

            const result = this.findNodeDepth(node)

            if (result > 1000000) {
                console.log(ruleName)
                console.log(result)
            }
            return result
        } finally {
            // 清除递归标记（确保即使异常也能清除）
            this.recursiveDetectionSet.delete(ruleName)
        }
    }

    //0和1好 1和2 ，都是两种可能性
    manyAndOptionDepth(node: ManyNode | OptionNode) {
        const num = this.findNodeDepth(node.node)
        // option 和 many 的 0 次都没有意义，只计算匹配的情况
        return num + num
    }


    atLeastOneDepth(node: AtLeastOneNode) {
        const num = this.findNodeDepth(node.node)
        return num + num
    }

    seqDepth(seq: SequenceNode) {
        if (seq.nodes.length < 1) {
            return 1
        }
        let all = 1
        for (let i = 0; i < seq.nodes.length; i++) {
            const node = seq.nodes[i]
            const depth = this.findNodeDepth(node)
            all = all * depth
        }
        return all
    }

    orDepth(or: OrNode) {
        if (or.alternatives.length < 1) {
            throw new Error('xitongcuowu')
        }
        let orPossibility: number = 0

        for (let i = 0; i < or.alternatives.length; i++) {
            const alternative = or.alternatives[i]
            const depth = this.findNodeDepth(alternative)

            orPossibility += depth
        }
        if (orPossibility === 0) {
            throw new Error('系统错误')
        }
        return orPossibility
    }

    findNodeDepth(
        node: RuleNode
    ): number {
        // 超时检测
        this.checkTimeout('findNodeDepth')
        const callId = this.perfAnalyzer.startMethod('findNodeDepth')

        // DFS 总是无限展开
        // 根据节点类型分发处理
        let result: number
        switch (node.type) {
            case 'consume':
                // Token 节点：直接返回 token 名
                result = 1
                break

            case 'subrule':
                // 子规则引用：转发给 subRuleHandler 处理
                result = this.findRuleDepth(node.ruleName)
                break

            case 'or':
                // Or 节点：遍历所有分支，合并结果
                // 🔴 关键：Or 分支中的第一个规则也需要传递 isFirstPosition
                result = this.orDepth(node)
                break

            case 'sequence':
                // Sequence 节点：笛卡尔积组合子节点
                result = this.seqDepth(node)
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                // Option/Many 节点：0次或多次，添加空分支
                // 🔴 关键：Option 内的第一个规则也需要传递 isFirstPosition
                result = this.manyAndOptionDepth(node)
                break

            default:
                // 未知节点类型，抛出错误
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, undefined)

        // 添加节点类型信息，便于分析
        return result
    }


    deepDepth(node: RuleNode, depth: number) {
        // 超时检测
        this.checkTimeout('deepDepth')
        const callId = this.perfAnalyzer.startMethod('findNodeDepth')

        // DFS 总是无限展开
        // 根据节点类型分发处理
        let result: number
        let tempary = []
        switch (node.type) {
            case 'consume':
                // Token 节点：直接返回 token 名
                result = depth
                break

            case 'subrule':
                const ruleName = (node as SubruleNode).ruleName

                if (this.depmap.has(ruleName)) {
                    return this.depmap.get(ruleName)
                }

                if (this.recursiveDetectionSet.has(ruleName)) {
                    // 记录递归检测返回，用于分析为什么都是1
                    return depth
                }
                depth++

                // 标记当前规则正在计算（防止循环递归）
                this.recursiveDetectionSet.add(ruleName)

                const subNode = this.ruleASTs.get(ruleName)

                result = this.deepDepth(subNode, depth)
                // 清除递归标记（确保即使异常也能清除）
                this.recursiveDetectionSet.delete(ruleName)
                break

            case 'or':
                tempary = []
                for (const alternative of node.alternatives) {
                    tempary.push(this.deepDepth(alternative, depth))
                }
                result = Math.max(...tempary)
                break

            case 'sequence':
                tempary = []
                for (const alternative of node.nodes) {
                    tempary.push(this.deepDepth(alternative, depth))
                }
                result = Math.max(...tempary)
                break

            case 'option':
            case 'many':
            case 'atLeastOne':
                result = this.deepDepth((node as OptionNode).node, depth)
                break

            default:
                // 未知节点类型，抛出错误
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, undefined)

        // 添加节点类型信息，便于分析
        return result
    }


    depmap = new Map<string, number>()


    private graph: Graph


    // 递归收集依赖
    collectDependencies(node: RuleNode, fromRule: string) {
        switch (node.type) {
            case 'consume':
                this.graph.setEdge(fromRule, node.tokenName)
                break
            case 'subrule':
                this.graph.setEdge(fromRule, node.ruleName)
                break
            case 'sequence':
                node.nodes.forEach(n => this.collectDependencies(n, fromRule))
                break
            case 'or':
                node.alternatives.forEach(alt => this.collectDependencies(alt, fromRule))
                break
            case 'option':
            case 'many':
            case 'atLeastOne':
                this.collectDependencies(node.node, fromRule)
                break
        }
    }

    graphToMermaid(g: Graph): string {
        const lines = ['graph TD']

        for (const edge of g.edges()) {
            lines.push(`    ${edge.v} --> ${edge.w}`)
        }

        return lines.join('\n')
    }

    grachScc(){
        this.graph = new Graph({ directed: true })

        for (const [ruleName, node] of this.ruleASTs) {
            this.graph.setNode(ruleName)
            this.collectDependencies(node, ruleName)
        }


        const dotString = write(this.graph)
        console.log(dotString)

        // Tarjan 算法找强连通分量
        const sccs = alg.tarjan(this.graph)

        console.log('=== 强连通分量（循环） ===')
        for (const scc of sccs) {
            if (scc.length > 1) {
                // 多个节点的 SCC = 有循环
                console.log('====================')
                console.log(`循环: `)
                console.log(`${scc.length}`)
            }
        }
    }

    computeRuleDepth() {
        for (const node of this.ruleASTs.values()) {
            this.recursiveDetectionSet.clear()
            const result = this.deepDepth(node, 1)
            console.log(node.ruleName)
            console.log(result)
            this.depmap.set(node.ruleName, result)
        }
    }

    computeRulePossibility(){
        for (const node of this.ruleASTs.values()) {
            this.recursiveDetectionSet.clear()
            const ruleName = node.ruleName
            console.log('进入规则：' + ruleName)
            const result = this.findNodeDepth(node)
            if (this.depthMap.has(ruleName)) {
                const num = this.depthMap.get(ruleName)
                if (result !== num) {
                    console.log('更新设置')
                    console.log(ruleName)
                    console.log('jiuzhi')
                    console.log(num)
                    console.log('心智')
                    console.log(result)
                    this.depthMap.set(ruleName, result)
                    throw new Error('系统错误')
                }
            } else {
                this.depthMap.set(ruleName, result)
                console.log('初次设置')
                console.log(ruleName)
                console.log(result)
            }
        }
    }

    /**
     * 初始化缓存（遍历所有规则，计算直接子节点、First 集合和分层展开）
     *
     * 应该在收集 AST 之后立即调用
     *
     * @returns { errors: 验证错误列表, stats: 统计信息 }
     */
    initCacheAndCheckLeftRecursion(): { errors: ValidationError[], stats: any } {
        // 启动超时检测（20秒）
        this.operationStartTime = Date.now()

        const totalStartTime = Date.now()

        // 统计对象
        const stats: any = {
            dfsFirstKTime: 0,  // First(K) 缓存生成用时
            bfsMaxLevelTime: 0,  // MaxLevel 缓存生成用时
            orDetectionTime: 0,  // Or 冲突检测用时
            leftRecursionCount: 0,  // 左递归错误数量
            orConflictCount: 0,  // Or 分支冲突数量
            totalTime: 0,  // 总用时
            dfsFirstKCacheSize: 0,  // dfsFirstKCache 大小
            bfsAllCacheSize: 0,  // bfsAllCache 大小
            firstK: 0,  // First(K) 的 K 值
            cacheUsage: {
                dfsFirstK: {hit: 0, miss: 0, total: 0, hitRate: 0},
                bfsLevelCache: {hit: 0, miss: 0, total: 0, hitRate: 0, size: 0},
                getDirectChildren: {hit: 0, miss: 0, total: 0, hitRate: 0}
            }
        }

        // 清空错误 Map
        this.detectedLeftRecursionErrors.clear()

        // 阶段1.2：BFS MaxLevel 缓存生成
        // 启动超时检测（在 BFS 缓存生成阶段）
        this.operationStartTime = Date.now()
        const t1_2_start = Date.now()
        console.log(`\n📦 ===== BFS MaxLevel 缓存生成开始 =====`)
        console.log(`目标层级: Level 1 到 Level ${EXPANSION_LIMITS.LEVEL_K}`)


        const ruleNames = this.ruleASTs.keys()

        //遍历检查左递归问题
        for (const ruleName of ruleNames) {
            this.recursiveDetectionSet.clear()
            this.expandPathsByDFSCache(ruleName, EXPANSION_LIMITS.FIRST_K, 0, EXPANSION_LIMITS.INFINITY, true)
        }

        // BFS 缓存预填充
        // 预填充 level 1 到 level_k
        for (let level = EXPANSION_LIMITS.LEVEL_K; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
            console.log(`\n📊 正在生成 Level ${level} 的缓存...`)
            let levelRuleIndex = 0
            for (const ruleName of ruleNames) {
                levelRuleIndex++
                const key = `${ruleName}:${level}`

                // 如果已经存在缓存，跳过
                if (this.bfsLevelCache.has(key)) {
                    continue
                }

                // 记录开始时间
                const ruleStartTime = Date.now()
                console.log(`  [${levelRuleIndex}/${ruleNames.length}] 开始生成: ${ruleName}, Level ${level}, Key: ${key}`)

                // 生成缓存
                this.expandPathsByBFSCache(ruleName, level)

                // 记录结束时间和耗时
                const ruleEndTime = Date.now()
                const ruleDuration = ruleEndTime - ruleStartTime
                const cachedPaths = this.bfsLevelCache.get(key)
                const pathCount = cachedPaths ? cachedPaths.length : 0

                // 如果耗时超过 10ms 或路径数量很多，输出详细信息
                if (ruleDuration > 10 || pathCount > 100) {
                    console.log(`  ✅ 生成完成: ${ruleName}, Level ${level} (耗时: ${ruleDuration}ms, 路径数: ${pathCount})`)
                }
            }
            console.log(`📊 Level ${level} 缓存生成完成`)
        }

        // 聚合所有层级的数据到 bfsAllCache
        console.log(`\n📦 正在聚合所有层级的数据到 bfsAllCache...`)
        let aggregateIndex = 0
        for (const ruleName of ruleNames) {
            aggregateIndex++
            const aggregateStartTime = Date.now()
            const allLevelPaths: string[][] = []

            // 收集该规则的所有层级数据
            for (let level = 1; level <= EXPANSION_LIMITS.LEVEL_K; level++) {
                const key = `${ruleName}:${level}`
                if (this.bfsLevelCache.has(key)) {
                    const levelPaths = this.getCacheValue('bfsLevelCache', key)!
                    allLevelPaths.push(...levelPaths)
                }
            }

            // 去重并存入 bfsAllCache
            const deduplicated = this.deduplicate(allLevelPaths)
            this.bfsAllCache.set(ruleName, deduplicated)

            // 如果聚合的数据很多，输出日志
            if (deduplicated.length > 1000) {
                const aggregateDuration = Date.now() - aggregateStartTime
                console.log(`  [${aggregateIndex}/${ruleNames.length}] 聚合完成: ${ruleName} (耗时: ${aggregateDuration}ms, 路径数: ${deduplicated.length})`)
            }
        }

        const t1_2_end = Date.now()
        stats.bfsMaxLevelTime = t1_2_end - t1_2_start
        console.log(`\n✅ BFS MaxLevel 缓存生成完成 (总耗时: ${stats.bfsMaxLevelTime}ms)`)
        console.log(`========================================\n`)

        // 重置超时检测
        this.operationStartTime = 0

        // 为每个错误补充 suggestion
        for (const error of this.detectedLeftRecursionErrors.values()) {
            const ruleAST = this.getRuleNodeByAst(error.ruleName)
            error.suggestion = this.getLeftRecursionSuggestion(
                error.ruleName,
                ruleAST,
                new Set([error.ruleName])
            )
        }
        stats.leftRecursionCount = this.detectedLeftRecursionErrors.size

        const leftRecursionErrors = Array.from(this.detectedLeftRecursionErrors.values())

        // 2. Or 分支冲突检测
        const t2 = Date.now()
        const orConflictErrors = this.checkAllOrConflicts()
        const t2End = Date.now()
        const stage2Time = t2End - t2

        // 记录 Or 检测统计
        stats.orDetectionTime = stage2Time
        stats.orConflictCount = orConflictErrors.length

        // 3. 合并所有错误（左递归优先）
        const allErrors: ValidationError[] = []
        allErrors.push(...leftRecursionErrors)
        allErrors.push(...orConflictErrors)

        // 5. 准备统计信息（不在这里输出，放到 error 对象中）
        stats.totalTime = Date.now() - totalStartTime
        stats.dfsFirstKCacheSize = this.dfsFirstKCache.size
        stats.bfsAllCacheSize = this.bfsAllCache.size
        stats.firstK = EXPANSION_LIMITS.FIRST_K

        // 收集缓存使用率统计（使用新的独立统计字段）
        const dfsFirstKCacheStats = this.perfAnalyzer.cacheStats.dfsFirstKCache
        const bfsAllCacheStats = this.perfAnalyzer.cacheStats.bfsAllCache
        const bfsLevelCacheStats = this.perfAnalyzer.cacheStats.bfsLevelCache
        const getDirectChildrenStats = this.perfAnalyzer.cacheStats.getDirectChildren

        stats.cacheUsage = {
            dfsFirstK: {
                hit: dfsFirstKCacheStats.hit,
                miss: dfsFirstKCacheStats.miss,
                total: dfsFirstKCacheStats.total,
                hitRate: dfsFirstKCacheStats.total > 0 ? (dfsFirstKCacheStats.hit / dfsFirstKCacheStats.total * 100) : 0,
                // total 就是查询次数（每次 getCacheValue 都会增加 total）
                getCount: dfsFirstKCacheStats.total
            },
            bfsAllCache: {
                hit: bfsAllCacheStats.hit,
                miss: bfsAllCacheStats.miss,
                total: bfsAllCacheStats.total,
                hitRate: bfsAllCacheStats.total > 0 ? (bfsAllCacheStats.hit / bfsAllCacheStats.total * 100) : 0,
                getCount: bfsAllCacheStats.total,
                size: this.bfsAllCache.size
            },
            bfsLevelCache: {
                hit: bfsLevelCacheStats.hit,
                miss: bfsLevelCacheStats.miss,
                total: bfsLevelCacheStats.total,
                hitRate: bfsLevelCacheStats.total > 0 ? (bfsLevelCacheStats.hit / bfsLevelCacheStats.total * 100) : 0,
                size: this.bfsLevelCache.size,
                getCount: bfsLevelCacheStats.total
            },
            getDirectChildren: {
                hit: getDirectChildrenStats.hit,
                miss: getDirectChildrenStats.miss,
                total: getDirectChildrenStats.total,
                hitRate: getDirectChildrenStats.total > 0 ? (getDirectChildrenStats.hit / getDirectChildrenStats.total * 100) : 0
            }
        }

        // 输出性能分析报告
        this.perfAnalyzer.report()

        // 返回错误列表和统计信息
        return {
            errors: [],
            stats: stats
        }
    }


    private cartesianProductInner1(arrays: string[][][], firstK: number): string[][] {
        const callId = this.perfAnalyzer.startMethod('cartesianProduct')

        // 空数组，返回包含一个空序列的数组
        if (arrays.length === 0) {
            return [[]]
        }

        // 只有一个数组，直接返回（可能包含空分支）
        if (arrays.length === 1) {
            const inputSize = arrays[0].length
            this.perfAnalyzer.endMethod(callId, inputSize, inputSize)
            return arrays[0]
        }

        // 性能监控统计
        const perfStats = {
            totalBranches: 0,           // 总分支数
            skippedByLength: 0,         // 因长度已满跳过的
            skippedByDuplicate: 0,      // 因重复跳过的（seq级别）
            actualCombined: 0,          // 实际拼接的
            maxResultSize: 0,           // 最大结果集大小
            movedToFinal: 0             // 移入最终结果集的数量
        }

        //第一个规则的每种可能性
        const arrayFirst = arrays[0]

        //第一层顺序，第二层可能性，第三层每种可能性的顺序
        // 初始结果为第一个数组
        let result = arrayFirst.filter(item => item.length < firstK)
        let finalResult = arrayFirst.filter(item => item.length >= firstK).map(item => item.join(EXPANSION_LIMITS.RuleJoinSymbol))

        // 最终结果集（长度已达 FIRST_K 的序列）
        const finalResultSet = new Set<string>(finalResult)

        // 逐个处理后续数组
        for (let i = 1; i < arrays.length; i++) {
            this.checkTimeout(`cartesianProduct-数组${i}/${arrays.length}`)

            //已经是去重的了，没必要去重了
            const arrilen = arrays[i].length
            // 数组层面去重：统一处理所有数组
            const currentArray = this.deduplicate(arrays[i])


            if (arrilen > currentArray.length) {
                throw new Error('系统错误')
            }

            const temp: string[][] = []

            // 遍历当前结果的每个序列
            let seqIndex = 0
            const totalSeqs = result.length
            const arrayIndex = i
            const shouldLogProgress = totalSeqs > 1000 || currentArray.length > 1000
            const cartesianStartTime = shouldLogProgress ? Date.now() : 0

            if (shouldLogProgress) {
                const estimatedTotal = totalSeqs * currentArray.length
            }

            for (const seq of result) {
                const pla = currentArray.length * seq.length
                if (pla > 30000) {

                }


                seqIndex++

                // 每处理1000个seq输出一次进度
                if (seqIndex % 1000 === 0 || seqIndex === totalSeqs) {
                    this.checkTimeout(`cartesianProduct-seq${seqIndex}/${totalSeqs}`)

                    if (shouldLogProgress) {
                        const elapsed = Date.now() - cartesianStartTime
                        const progress = ((seqIndex / totalSeqs) * 100).toFixed(1)
                    }
                }

                // 计算当前 seq 的可拼接长度
                const availableLength = firstK - seq.length

                // 情况2：seq 超过 firstK（不应该发生，已有防御检查）
                if (availableLength < 0) {
                    throw new Error('系统错误：序列长度超过限制')
                } else if (availableLength === 0) {
                    // 情况1：seq 已达到 firstK，直接放入最终结果集
                    const seqKey = seq.join(EXPANSION_LIMITS.RuleJoinSymbol)
                    finalResultSet.add(seqKey)
                    perfStats.movedToFinal++
                    perfStats.skippedByLength += currentArray.length
                    continue  // 不再参与后续计算
                }

                // seq 级别的去重集合
                const seqDeduplicateSet = new Set<string>()


                // 情况3：seq 长度 < FIRST_K，继续拼接
                // 🔧 性能优化：预计算 seq 的长度和 join 结果（如果达到 FIRST_K 时需要）
                const seqLength = seq.length
                const seqKey = seqLength > 0 ? seq.join(EXPANSION_LIMITS.RuleJoinSymbol) : ''

                for (const branch of currentArray) {
                    perfStats.totalBranches++

                    // 🔧 性能优化：减少不必要的 slice
                    // 如果 branch.length <= availableLength，直接使用 branch，避免 slice 开销
                    const branchLength = branch.length
                    const truncatedBranch = branchLength <= availableLength
                        ? branch
                        : branch.slice(0, availableLength)
                    const truncatedLength = truncatedBranch.length

                    // 🔧 性能优化：只在需要去重时才 join
                    // 如果 truncatedBranch === branch，可以复用（但为了安全，还是每次都 join）
                    const branchKey = truncatedBranch.join(EXPANSION_LIMITS.RuleJoinSymbol)

                    // seq 级别去重
                    if (seqDeduplicateSet.has(branchKey)) {
                        perfStats.skippedByDuplicate++
                        continue
                    }

                    seqDeduplicateSet.add(branchKey)

                    // 🔧 性能优化：先计算长度，避免创建数组后再检查
                    const combinedLength = seqLength + truncatedLength

                    // 检查拼接后的长度
                    if (combinedLength > firstK) {
                        throw new Error('系统错误：笛卡尔积拼接后长度超过限制')
                    }

                    // 判断拼接后是否达到 firstK
                    if (combinedLength === firstK) {
                        // 达到最大长度，放入最终结果集
                        // 🔧 性能优化：复用已计算的 seqKey 和 branchKey，避免重复 join
                        const combinedKey = seqKey
                            ? (seqKey + EXPANSION_LIMITS.RuleJoinSymbol + branchKey)
                            : branchKey
                        finalResultSet.add(combinedKey)
                        perfStats.movedToFinal++
                    } else {
                        // 未达到最大长度，放入 temp 继续参与后续计算
                        // 🔧 性能优化：使用预分配数组 + 循环赋值，比 concat 更快
                        const combined: string[] = new Array(combinedLength)
                        for (let j = 0; j < seqLength; j++) {
                            combined[j] = seq[j]
                        }
                        for (let j = 0; j < truncatedLength; j++) {
                            combined[seqLength + j] = truncatedBranch[j]
                        }
                        temp.push(combined)
                    }

                    perfStats.actualCombined++

                }
            }

            // 更新结果为本轮笛卡尔积（只包含未达到 FIRST_K 的）
            const dedupStartTime = Date.now()
            result = this.deduplicate(temp)
            const dedupDuration = Date.now() - dedupStartTime

            // 更新统计
            perfStats.maxResultSize = Math.max(perfStats.maxResultSize, result.length + finalResultSet.size)

            // 移除详细日志

            if (result.length + finalResultSet.size > 100000) {
                console.warn(`⚠️ 笛卡尔积中间结果较大: temp=${result.length}, final=${finalResultSet.size} (数组 ${i}/${arrays.length - 1})`)
            }

            // 优化：如果 result 为空且还有后续数组，可以提前结束
            if (result.length === 0 && finalResultSet.size > 0) {
                // console.log(`✅ 所有序列已达 FIRST_K，跳过剩余 ${arrays.length - i - 1} 个数组的计算`)
                break
            }
        }

        // 合并最终结果：finalResultSet + result
        let finalArray: string[][] = []

        // 1. 将 Set 中的字符串转回二维数组
        for (const seqStr of finalResultSet) {
            if (seqStr === '') {
                finalArray.push([])  // 空序列
            } else {
                finalArray.push(seqStr.split(EXPANSION_LIMITS.RuleJoinSymbol))
            }
        }

        // 2. 添加未达到 FIRST_K 的序列
        finalArray = finalArray.concat(result)


        // 3. 统一去重：使用 this.deduplicate 对最终结果去重
        const finalDedupStartTime = Date.now()
        const deduplicatedFinalArray = this.deduplicate(finalArray)
        const finalDedupDuration = Date.now() - finalDedupStartTime

        // 最终验证
        for (const resultElement of deduplicatedFinalArray) {
            if (resultElement.length > firstK) {
                throw new Error('系统错误：最终结果长度超过限制')
            }
        }
        // 记录性能数据
        const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0)
        this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length)

        return deduplicatedFinalArray
    }

    /**
     * 计算笛卡尔积（优化版：先截取再拼接 + seq级别去重 + 提前移入最终结果集）
     * [[a1, a2], [b1, b2]] → [[a1, b1], [a1, b2], [a2, b1], [a2, b2]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] 参与笛卡尔积时，会被正常拼接
     * - [...seq, ...[]] = [...seq]，相当于只保留 seq
     * - 例如：[[a]] × [[], [b]] → [[a], [a,b]]
     * - 这正是 option/many 需要的行为：可以跳过或执行
     *
     * 🔧 优化策略：
     * 1. 先计算可拼接长度，避免拼接超长数据
     * 2. seq 级别去重，提前跳过重复分支
     * 3. 修复循环逻辑，逐个数组处理
     * 4. 长度达到 firstK 的序列立即移入最终结果集，不再参与后续计算
     * 5. 所有序列都达到 firstK 时提前结束，跳过剩余数组
     */
    private cartesianProduct(arrays: string[][][], firstK: number): string[][] {
        // 将每个组合中的字符串 split 回数组，然后合并成一个完整路径
        // 最后截取到 firstK 长度
        let deduplicatedFinalArray = this.cartesianProductInner1(arrays, firstK)
        // let deduplicatedFinalArray = this.cartesianProductInner2(arrays,firstK)

        return deduplicatedFinalArray
    }

    private cartesianProductInner2(arrays: string[][][], firstK: number): string[][] {
        const callId = this.perfAnalyzer.startMethod('cartesianProduct')


        const tempr = fastCartesian(arrays)

        // 将每个组合中的字符串 split 回数组，然后合并成一个完整路径
        // 最后截取到 firstK 长度
        let deduplicatedFinalArray = tempr.map(item => {
            // item 是 string[]，每个元素是一个 join 后的路径字符串
            // 需要 split 每个字符串，然后 flat 成一个完整路径
            const combinedPath = item.flat()
            // 截取到 firstK 长度
            return combinedPath
        })
        const inputSize = arrays.reduce((sum, arr) => sum + arr.length, 0)

        this.perfAnalyzer.endMethod(callId, inputSize, deduplicatedFinalArray.length)

        return deduplicatedFinalArray
    }

    /**
     * 深度优先展开（DFS - Depth-First Search）
     *
     * 🚀 算法：递归深入，自然展开到token
     *
     * 适用场景：
     * - maxLevel = INFINITY（无限层级）
     * - 需要完全展开到token
     * - 适合 First(K) + 完全展开
     *
     * 优势：
     * - 递归处理AST，代码简洁
     * - 自然深入到叶子节点
     * - 配合 firstK 截取，可提前终止部分分支
     *
     * @param node - AST 节点（可选）
     * @param ruleName - 规则名（可选）
     * @param firstK - 取前 K 个符号
     * @param curLevel - 当前层级（默认 0）
     * @param maxLevel - 最大展开层级（通常为 Infinity）
     * @param isFirstPosition - 是否在第一个位置（用于左递归检测）
     * @returns 展开后的路径数组 string[][]
     *
     * 调用方式：
     * - expandPathsByDFS(node, null, firstK, curLevel, maxLevel) - 传入节点
     * - expandPathsByDFS(null, ruleName, firstK, curLevel, maxLevel) - 传入规则名
     *
     * 核心逻辑：递归处理 AST 节点
     * - consume: 返回 [[tokenName]]
     * - subrule: 递归展开
     * - sequence: 笛卡尔积组合子节点
     * - or: 合并所有分支
     * - option/many: 添加空分支
     */
    private expandNode(
        node: RuleNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = false
    ): string[][] {
        const callId = this.perfAnalyzer.startMethod('expandNode')

        // DFS 总是无限展开
        // 根据节点类型分发处理
        let result: string[][]
        switch (node.type) {
            case 'consume':
                // Token 节点：直接返回 token 名
                result = [[node.tokenName]]
                break

            case 'subrule':
                // 子规则引用：转发给 subRuleHandler 处理
                result = this.expandPathsByDFSCache(node.ruleName, firstK, curLevel, maxLevel, isFirstPosition)
                break

            case 'or':
                // Or 节点：遍历所有分支，合并结果
                // 🔴 关键：Or 分支中的第一个规则也需要传递 isFirstPosition
                result = this.expandOr(node.alternatives, firstK, curLevel, maxLevel, isFirstPosition)
                break

            case 'sequence':
                // Sequence 节点：笛卡尔积组合子节点
                result = this.expandSequenceNode(node, firstK, curLevel, maxLevel, isFirstPosition)
                break

            case 'option':
            case 'many':
                // Option/Many 节点：0次或多次，添加空分支
                // 🔴 关键：Option 内的第一个规则也需要传递 isFirstPosition
                result = this.expandOption(node.node, firstK, curLevel, maxLevel, isFirstPosition)
                break

            case 'atLeastOne':
                // AtLeastOne 节点：1次或多次，添加 double 分支
                // 🔴 关键：AtLeastOne 内的第一个规则也需要传递 isFirstPosition
                result = this.expandAtLeastOne(node.node, firstK, curLevel, maxLevel, isFirstPosition)
                break

            default:
                // 未知节点类型，抛出错误
                throw new Error(`未知节点类型: ${(node as any).type}`)
        }

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, undefined, result.length)

        return result
    }

    /**
     * 展开 Sequence 节点
     *
     * 核心逻辑：
     * - First(1)：只展开第1个子节点
     * - First(K)：笛卡尔积展开所有子节点，然后截取
     *
     * ⚠️ 重要：空分支在 sequence 中的处理
     * - 如果子节点包含空分支 []（来自 option/many）
     * - 笛卡尔积会正常处理：[[a]] × [[], [b]] → [[a], [a,b]]
     * - 空分支不会被过滤，会正常参与笛卡尔积
     *
     * @param node
     * @param firstK
     * @param curLevel
     * @param maxLevel
     * @param isFirstPosition 是否在第一个位置（用于左递归检测）
     */
        // 超时检测相关
    private operationStartTime: number = 0
    private currentProcessingRule: string = ''
    private timeoutSeconds: number = 1000

    private checkTimeout(location: string): void {
        if (!this.operationStartTime) return

        const elapsed = (Date.now() - this.operationStartTime) / 1000
        const remainingTime = this.timeoutSeconds - elapsed

        if (elapsed > this.timeoutSeconds) {
            const errorMsg = `
❌ ========== 操作超时 ==========
超时位置: ${location}
当前规则: ${this.currentProcessingRule}
已耗时: ${elapsed.toFixed(2)}秒
超时阈值: ${this.timeoutSeconds}秒

建议：
1. 检查是否存在笛卡尔积爆炸
2. 检查是否有循环递归未被检测
3. 查看日志最后处理的规则和子节点
================================`
            console.error(errorMsg)
            throw new Error(`操作超时: ${elapsed.toFixed(2)}秒 (超时位置: ${location})`)
        }
    }

    private expandSequenceNode(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true
    ) {
        const callId = this.perfAnalyzer.startMethod('expandSequenceNode')
        this.checkTimeout('expandSequenceNode-开始')

        // 检查是否为空序列
        if (node.nodes.length === 0) {
            // 空序列，返回包含一个空分支
            return [[]]
        }

        // First(K)：需要笛卡尔积
        // ⚠️⚠️⚠️ 双重优化策略：
        //
        // 优化1：硬性上限 - slice(0, firstK)
        // - 最多只展开前 firstK 个子节点
        // - 例如：firstK=2，最多展开前2个，后续节点完全不看
        //
        // 优化2：累加提前停止 - 在前 firstK 个节点内提前停止
        // - 原理：笛卡尔积后的最短路径 = 各子节点最短分支的拼接
        // - 如果累加的最短长度 >= firstK，后续节点不影响截取后的结果
        // - 可能只展开1个或几个节点就够了
        //
        // 示例1：sequence([a,b,c], [d], [e], [f])  firstK=2
        //   优化1：slice(0,2) → 最多展开 [a,b,c], [d]
        //   优化2：
        //     1. [a,b,c] → [[a,b,c]]，最短=3
        //        累加：3 >= 2 ✅ 停止！只展开1个节点
        //   笛卡尔积：[[a,b,c]]
        //   截取到2：[[a,b]]
        //
        // 示例2：sequence([a], or([b]/[c,d]), [e])  firstK=3
        //   优化1：slice(0,3) → 最多展开前3个
        //   优化2：
        //     1. [a] → [[a]]，最短=1，累加=1 < 3，继续
        //     2. or([b]/[c,d]) → [[b],[c,d]]，最短=1，累加=2 < 3，继续
        //     3. [e] → [[e]]，最短=1，累加=3 >= 3 ✅ 停止
        //   笛卡尔积：[[a]] × [[b],[c,d]] × [[e]] = [[a,b,e],[a,c,d,e]]
        //   截取到3：[[a,b,e],[a,c,d]]
        //
        // 示例3：包含空分支 sequence([a], option([b]), [c,d])  firstK=2
        //   优化1：slice(0,2) → 最多展开前2个
        //   优化2：
        //     1. [a] → [[a]]，最短=1，累加=1 < 2，继续
        //     2. option([b]) → [[],[b]]，最短=0（空分支！），累加=1 < 2，继续
        //   累加不够，需要展开第3个节点，但 slice(0,2) 限制了
        //   笛卡尔积：[[a]] × [[],[b]] = [[a],[a,b]]
        //   截取到2：[[a],[a,b]]（不需要截取）
        //
        // ✅ 双重保护：
        // - 最坏情况：展开 firstK 个节点（优化1）
        // - 最好情况：展开 1 个节点（优化2）
        // - 平均情况：展开 < firstK 个节点

        // ⚠️⚠️⚠️ 双重优化策略：
        // 1. 第一层保护：slice(0, firstK) - 最多展开 firstK 个节点
        // 2. 第二层优化：累加提前停止 - 在 firstK 个节点内提前停止

        // 🔴 新增：计算需要展开到的索引（考虑 option/many 不计入必需元素）
        let requiredCount = 0  // 非 option/many 的计数
        let expandToIndex = node.nodes.length  // 默认全部展开

        // 遍历找到第 firstK 个必需元素的位置
        for (let i = 0; i < node.nodes.length; i++) {
            const child = node.nodes[i]

            // 非 option/many 才计数
            if (child.type !== 'option' && child.type !== 'many') {
                requiredCount++

                // 找到第 firstK 个必需元素
                if (requiredCount >= firstK) {
                    // 包含当前元素，所以是 i + 1
                    expandToIndex = i + 1
                    break
                }
            }

        }

        // 使用计算出的索引进行截取（替换原来的简单 firstK）
        // const nodesToExpand = node.nodes.slice(0, firstK)
        const nodesToExpand = node.nodes.slice(0, expandToIndex)

        const allBranches: string[][][] = []
        let minLengthSum = 0  // 累加的最短长度

        // 遍历前 firstK 个子节点，累加最短分支长度
        for (let i = 0; i < nodesToExpand.length; i++) {
            this.checkTimeout(`expandSequenceNode-子节点${i + 1}`)

            const expandChildStartTime = Date.now()

            // 展开当前子节点
            // 💡 传递累积的位置信息：父级是第1个 AND 当前也是第1个
            let branches = this.expandNode(
                nodesToExpand[i],
                firstK,
                curLevel,
                maxLevel,
                isFirstPosition && i === 0  // 累积位置：只有当父级和当前都是第1个时才是 true
            )

            const expandChildDuration = Date.now() - expandChildStartTime

            // 如果 branches 为空（可能是左递归检测返回的空数组）
            if (branches.length === 0) {
                // 左递归情况，返回空分支
                return []
            }

            branches = branches.map(item => item.slice(0, firstK));
            allBranches.push(branches);


            // 找到当前子节点的最短分支长度（安全写法）
            let minLength = Infinity;
            for (const b of branches) {
                const len = b.length;
                if (len < minLength) {
                    minLength = len;
                    if (minLength === 0) break; // 已经最小，提前结束
                }
            }

            minLengthSum += minLength;

            // 如果累加的最短长度 >= firstK，可以停止
            if (minLengthSum >= firstK) {
                break;
            }
        }

        // 如果没有展开任何节点（可能是左递归检测返回的空数组）
        if (allBranches.length === 0) {
            // 左递归情况，返回空分支
            return []
        }

        // 调用笛卡尔积
        this.checkTimeout('expandSequenceNode-笛卡尔积前')
        const result = this.cartesianProduct(allBranches, firstK)
        this.checkTimeout('expandSequenceNode-笛卡尔积后')

        // 注意：如果某些节点包含空分支，笛卡尔积后可能产生不同长度的路径
        const finalResult = this.truncateAndDeduplicate(result, firstK)

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, node.nodes.length, finalResult.length)

        return finalResult
    }


    /**
     * 广度优先展开（BFS - Breadth-First Search）
     *
     * 🚀 算法：逐层循环，精确控制层数
     * 🔥 优化：增量复用 - 从最近的缓存层级开始，而非每次从 level 1 开始
     *
     * 适用场景：
     * - maxLevel = 具体值（如 3, 5）
     * - 需要展开到指定层级
     * - 适合 First(∞) + 限制层数
     *
     * 设计理念：
     * - BFS 只负责按层级完整展开（firstK=∞）
     * - 不负责截取操作
     * - 截取由外层调用者统一处理
     *
     * 优化策略：
     * - 增量复用：level3 = level2 + 展开1层
     * - 缓存查找：从 maxLevel-1 → maxLevel-2 → ... → level 1
     * - 跳过中间计算：避免重复展开低层级
     *
     * @param ruleName 顶层规则名
     * @param maxLevel 目标层级
     * @returns 展开到目标层级的完整路径（不截取）
     *
     * 核心逻辑（增量展开）：
     * 1. 查找最近的缓存层级（maxLevel-1, maxLevel-2, ..., 1）
     * 2. 从最近的缓存开始展开（而非总是从 level 1）
     * 3. 每次展开1层：调用 expandSinglePath
     * 4. 分离已完成（全token）和未完成（含规则名）的路径
     * 5. 继续展开未完成的路径
     * 6. 达到目标层级后停止
     *
     * 示例：
     * 展开 level 4：
     *   - 查找 level 3 缓存 → 找到 ✅
     *   - level 3 + 展开1层 = level 4
     *   - 节省：level 1→2→3 的计算
     */
    /**
     * BFS 展开（纯递归实现，智能缓存复用）
     *
     * 核心思想：
     * 1. 查找最大可用缓存块（如 level 3）
     * 2. 对缓存的每个路径中的规则名，递归调用自己
     * 3. 缓存并返回结果
     *
     * 示例：查找 A:10，缓存有 A:3
     * - 找到 A:3 = [a1, B, c1]
     * - 对 B 递归调用 expandPathsByBFSCache(B, 7, [B])
     *   - 找到 B:3 = [b1, C, c1]
     *   - 对 C 递归调用 expandPathsByBFSCache(C, 4, [C])
     *     - 找到 C:3 = [c1, D, c3]
     *     - 对 D 递归调用 expandPathsByBFSCache(D, 1, [D])
     *       - 返回 getDirectChildren(D)
     *     - 缓存 C:4 ✅
     *   - 缓存 B:7 ✅
     * - 缓存 A:10 ✅
     *
     * BFS 展开（纯净版，单方法递归实现）
     *
     * 核心逻辑：
     * 1. 查找 ruleName 的最近缓存
     * 2. 对缓存的每个路径中的规则名，递归调用自己
     * 3. 自动缓存中间结果
     *
     * 示例：查找 A:10，缓存有 A:3
     * - 查找 A:10 → 找到 A:3 = [[a1, B, c1]]
     * - 对 B 递归：expandPathsByBFSCacheClean(B, 7)
     *   - 查找 B:7 → 找到 B:3 = [[b1, C, d1]]
     *   - 对 C 递归：expandPathsByBFSCacheClean(C, 4)
     *     - 查找 C:4 → 找到 C:3 = [[c1, D, e1]]
     *     - 对 D 递归：expandPathsByBFSCacheClean(D, 1)
     *       → 返回 getDirectChildren(D)
     *     - 缓存 C:4 ✅
     *   - 缓存 B:7 ✅
     * - 缓存 A:10 ✅
     *
     * @param ruleName 规则名
     * @param targetLevel 目标层级
     * @returns 展开结果
     */
    private expandPathsByBFSCache(
        ruleName: string,
        targetLevel: number,
    ): string[][] {
        const depth = this.currentDepth

        // 防御检查
        if (targetLevel === 0) {
            throw new Error('系统错误')
        }

        // token，直接返回
        // 🔧 修复：确保 token 检查逻辑与 getDirectChildren 一致，并设置缓存
        const tokenNode = this.tokenCache?.get(ruleName)
        if (tokenNode && tokenNode.type === 'consume') {
            const result = [[ruleName]]
            // 🔧 修复：token 也需要设置缓存（无论 targetLevel 是多少，token 的结果都是 [[ruleName]]）
            // 设置 LEVEL_1 的缓存，因为这是 token 的固定结果
            const key = `${ruleName}:${EXPANSION_LIMITS.LEVEL_1}`
            if (!this.bfsLevelCache.has(key)) {
                this.bfsLevelCache.set(key, result)
                this.writeLog(`📦 存储缓存: ${key}, 路径数: 1 (Token节点)`, depth)
            }
            this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), Token节点, 路径数: 1 [执行完]`, depth)
            return result
        }

        // 基础情况：level 1
        if (targetLevel === EXPANSION_LIMITS.LEVEL_1) {
            this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth)
            this.currentDepth = depth + 1
            const result = this.getDirectChildren(ruleName)
            this.currentDepth = depth
            this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth)
            this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=1), 路径数: ${result.length} [执行完]`, depth)
            return result
        }

        const key = `${ruleName}:${targetLevel}`

        // 更新当前处理规则（用于超时日志）
        this.currentProcessingRule = `${ruleName}:Level${targetLevel}`

        // 超时检测
        this.checkTimeout(`expandPathsByBFSCache-${ruleName}-Level${targetLevel}`)

        // 检查是否已经存在缓存
        if (this.bfsLevelCache.has(key)) {
            const cached = this.getCacheValue('bfsLevelCache', key)!
            this.writeLog(`✅ BFS缓存命中: ${key}, 路径数: ${cached.length}`, depth)
            this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth)
            return cached
        }

        this.writeLog(`❌ BFS缓存未命中: ${key}`, depth)

        // 查找 ruleName 的最近缓存
        let cachedLevel = 1
        let cachedBranches: string[][] | null = null

        for (let level = Math.min(targetLevel, EXPANSION_LIMITS.LEVEL_K); level >= 2; level--) {
            const cacheKey = `${ruleName}:${level}`
            if (this.bfsLevelCache.has(cacheKey)) {
                cachedLevel = level
                cachedBranches = this.getCacheValue('bfsLevelCache', cacheKey)!
                this.writeLog(`✅ 找到缓存: ${cacheKey}, 路径数: ${cachedBranches.length}`, depth)

                // 提前返回：找到目标层级
                if (level === targetLevel) {
                    this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 使用缓存, 路径数: ${cachedBranches.length} [执行完]`, depth)
                    return cachedBranches
                }
                break
            } else {
                this.writeLog(`❌ 没有缓存: ${cacheKey}`, depth)
            }
        }

        // 没有找到缓存（不应该发生）
        if (!cachedBranches) {
            this.writeLog(`触发 getDirectChildren(${ruleName}) [执行中]`, depth)
            cachedLevel = EXPANSION_LIMITS.LEVEL_1
            this.currentDepth = depth + 1
            cachedBranches = this.getDirectChildren(ruleName)
            this.currentDepth = depth
            this.writeLog(`触发 getDirectChildren(${ruleName}) [执行完]`, depth)
        }

        // 计算剩余层数
        const remainingLevels = targetLevel - cachedLevel

        // 防御检查
        if (remainingLevels <= 0) {
            throw new Error('系统错误')
        }

        // 对 cachedPaths 的每个路径递归展开
        let expandedPaths: string[][] = []
        const totalPaths = cachedBranches.length

        // 如果是最终层级，记录每个分支的结果
        const branchResults: Array<{ branchName: string, paths: string[][] }> = []

        for (let branchIndex = 0; branchIndex < cachedBranches.length; branchIndex++) {
            const branchSeqRules = cachedBranches[branchIndex]

            // 超时检测
            if (branchIndex % 10 === 0 || branchIndex === cachedBranches.length - 1) {
                this.checkTimeout(`expandPathsByBFSCache-${ruleName}-处理路径${branchIndex + 1}/${totalPaths}`)
            }

            const branchAllRuleBranchSeqs: string[][][] = []

            // 遍历路径中的每个符号，递归展开
            for (let ruleIndex = 0; ruleIndex < branchSeqRules.length; ruleIndex++) {
                const subRuleName = branchSeqRules[ruleIndex]

                // 超时检测
                this.checkTimeout(`expandPathsByBFSCache-${ruleName}-展开符号${ruleIndex + 1}/${branchSeqRules.length}:${subRuleName}`)

                // 🔴 递归检测：如果当前路径中已经包含了这个规则名，不再展开
                // 这可以防止右递归导致的路径爆炸
                // 例如：AssignmentExpression → LeftHandSideExpression Assign AssignmentExpression
                //       如果路径中已经有 AssignmentExpression，就不再展开第二个 AssignmentExpression
                if (branchSeqRules.includes(subRuleName) && branchSeqRules.indexOf(subRuleName) < ruleIndex) {
                    // 路径中已经包含了这个规则名，直接返回规则名本身，不再展开
                    this.writeLog(`⚠️ 递归检测: ${subRuleName} 已在路径中，不再展开`, depth)
                    branchAllRuleBranchSeqs.push([[subRuleName]])
                    continue
                }

                // 展开子规则（会自动使用 bfsLevelCache 缓存）
                this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行中]`, depth)
                this.currentDepth = depth + 1
                const result = this.expandPathsByBFSCache(subRuleName, remainingLevels)
                this.currentDepth = depth
                branchAllRuleBranchSeqs.push(result)
                this.writeLog(`展开子规则: ${subRuleName}, 剩余层数: ${remainingLevels} [执行完], 结果数: ${result.length}`, depth)
            }

            // 计算笛卡尔积的总计算量
            const branchSizes = branchAllRuleBranchSeqs.map(b => b.length)
            const estimatedCombinations = branchSizes.reduce((a, b) => a * b, 1)
            const totalInputSize = branchSizes.reduce((a, b) => a + b, 0)
            this.writeLog(`笛卡尔积计算 [执行中]: 分支数: ${branchAllRuleBranchSeqs.length}, 各分支大小: [${branchSizes.join(', ')}], 预计组合数: ${estimatedCombinations}, 总输入大小: ${totalInputSize}`, depth)

            const pathResult = this.cartesianProduct(branchAllRuleBranchSeqs, EXPANSION_LIMITS.INFINITY)

            this.writeLog(`笛卡尔积计算 [执行完]: 结果数: ${pathResult.length}, 预计组合数: ${estimatedCombinations}`, depth)

            // 超时检测
            this.checkTimeout(`expandPathsByBFSCache-${ruleName}-路径${branchIndex + 1}-笛卡尔积后`)

            // 如果是最终层级，记录这个分支的结果
            if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
                const branchName = branchSeqRules.join(' ')
                branchResults.push({
                    branchName: branchName,
                    paths: pathResult
                })
            }

            expandedPaths = expandedPaths.concat(pathResult)
        }
        this.checkTimeout(`expandPathsByBFSCache-${ruleName}-去重前`)
        const finalResult = this.deduplicate(expandedPaths)

        if (targetLevel < EXPANSION_LIMITS.LEVEL_K) {
            // 复用之前定义的 key 变量
            if (this.bfsLevelCache.has(key)) {
                throw new Error('系统错误')
            }
            // 🔧 优化：如果结果是规则名本身（未展开），不加入缓存
            const shouldCache = !this.isRuleNameOnly(finalResult, ruleName)
            if (shouldCache) {
                this.bfsLevelCache.set(key, finalResult)
                this.writeLog(`📦 存储缓存: ${key}, 路径数: ${finalResult.length}`, depth)
            } else {
                this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth)
            }
        } else if (targetLevel === EXPANSION_LIMITS.LEVEL_K) {
            // 输出每个分支的结果
            this.writeLog(``, depth)
            this.writeLog(`📋 完整结果 (共 ${finalResult.length} 条路径, ${branchResults.length} 个语法分支):`, depth)
            this.writeLog(`${'='.repeat(80)}`, depth)

            for (let i = 0; i < branchResults.length; i++) {
                const branch = branchResults[i]
                this.writeLog(``, depth)
                this.writeLog(`分支 ${i + 1}: ${branch.branchName} (${branch.paths.length} 条路径)`, depth)
                this.writeLog(`${'-'.repeat(80)}`, depth)

                branch.paths.forEach((path, index) => {
                    this.writeLog(`   ${(index + 1).toString().padStart(4, ' ')}. ${path.join(' ')}`, depth)
                })
            }

            this.writeLog(`${'='.repeat(80)}`, depth)
            this.writeLog(``, depth)
        }
        this.writeLog(`◀ 返回: expandPathsByBFSCache(${ruleName}, targetLevel=${targetLevel}), 路径数: ${finalResult.length} [执行完]`, depth)
        return finalResult
    }

    /**
     * 获取规则的直接子节点（展开1层）
     *
     * @param ruleName 规则名
     * @returns 直接子节点的所有路径（展开1层）
     *
     * 优先级：
     * 1. 从 bfsLevelCache 获取 "ruleName:1"（如果已初始化）
     * 2. 动态计算并缓存
     *
     * 示例：
     * - Statement → [[BlockStatement], [IfStatement], [ExpressionStatement], ...]
     * - IfStatement → [[If, LParen, Expression, RParen, Statement]]
     */
    private getDirectChildren(ruleName: string): string[][] {
        // 1. 优先从 bfsLevelCache 获取 level 1 的数据（懒加载缓存）
        const key = `${ruleName}:${EXPANSION_LIMITS.LEVEL_1}`
        const depth = this.currentDepth

        if (this.bfsLevelCache.has(key)) {
            this.perfAnalyzer.recordCacheHit('getDirectChildren')
            const cached = this.getCacheValue('bfsLevelCache', key)!
            this.writeLog(`✅ getDirectChildren缓存命中: ${key}, 路径数: ${cached.length}`, depth)
            this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 缓存命中, 路径数: ${cached.length} [执行完]`, depth)
            return cached
        }

        // 缓存未命中，需要动态计算
        this.perfAnalyzer.recordCacheMiss('getDirectChildren')
        this.writeLog(`❌ getDirectChildren缓存未命中: ${key}`, depth)

        // 2. 检查是否是 token
        const tokenNode = this.tokenCache?.get(ruleName)
        if (tokenNode && tokenNode.type === 'consume') {
            const result = [[ruleName]]
            this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), Token节点, 路径数: 1 [执行完]`, depth)
            return result
        }

        // 3. 获取规则的 AST 节点
        const subNode = this.getRuleNodeByAst(ruleName)
        if (!subNode) {
            throw new Error(`系统错误：规则不存在: ${ruleName}`)
        }

        // 4. 动态计算：展开1层
        // expandPathsByDFS → subRuleHandler 会自动缓存到 "ruleName:1"
        const t0 = Date.now()
        const result = this.expandPathsByDFSCache(
            ruleName,
            EXPANSION_LIMITS.INFINITY,
            0,
            EXPANSION_LIMITS.LEVEL_1,
            false,
        )
        const duration = Date.now() - t0

        // 缓存计算结果（懒加载填充）
        // 🔧 优化：如果结果是规则名本身（未展开），不加入缓存
        const shouldCache = !this.isRuleNameOnly(result, ruleName)
        if (shouldCache && !this.bfsLevelCache.has(key)) {
            this.bfsLevelCache.set(key, result)
            this.writeLog(`📦 存储BFS缓存: ${key}, 路径数: ${result.length}`, depth)
        } else if (!shouldCache) {
            this.writeLog(`⚠️ 跳过缓存（规则名本身）: ${key}`, depth)
        }

        this.writeLog(`◀ 返回: getDirectChildren(${ruleName}), 路径数: ${result.length} [执行完]`, depth)
        return result
    }

    /**
     * 处理 DFS 模式（深度优先展开，无限层级）
     *
     * @param ruleName 规则名
     * @param firstK 截取数量
     * @param curLevel 当前层级
     * @param maxLevel
     * @param isFirstPosition 是否在第一个位置（用于左递归检测）
     * @returns 展开结果
     */
    private expandPathsByDFSCache(
        ruleName: string,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean
    ): string[][] {

        // 记录入口调用
        const t0 = Date.now()
        this.perfAnalyzer.cacheStats.subRuleHandlerTotal++

        // 层级+1（进入子规则）
        curLevel++

        // 防御：规则名不能为空
        if (!ruleName) {
            throw new Error('系统错误')
        }

        // 层级限制检查（BFS 需要）
        if (curLevel > maxLevel) {
            // 返回规则名本身（达到最大深度）
            this.perfAnalyzer.cacheStats.levelLimitReturn++
            return [[ruleName]]
        }

        // ========================================
        // 阶段1：DFS 缓存查找（在递归检测之前！）
        // ========================================

        if (firstK === EXPANSION_LIMITS.FIRST_K) {
            // 查找 firstK 缓存（getCacheValue 会自动记录命中/未命中统计）
            const cached = this.getCacheValue('dfsFirstKCache', ruleName)
            if (cached !== undefined) {
                // DFS 不需要日志
                const duration = Date.now() - t0
                this.perfAnalyzer.record('subRuleHandler', duration)
                return cached
            }
            // 缓存未命中，继续执行下面的逻辑
        } else if (firstK === EXPANSION_LIMITS.INFINITY) {
            if (maxLevel !== EXPANSION_LIMITS.LEVEL_1) {
                throw new Error(`系统错误：不支持的参数组合 firstK=${firstK}, maxLevel=${maxLevel}`)
            }
        }

        // ========================================
        // 阶段2：递归检测（DFS 专属）
        // ========================================

        // 递归检测：如果规则正在计算中
        if (this.recursiveDetectionSet.has(ruleName)) {
            // 区分左递归和普通递归
            if (isFirstPosition) {
                // 在第一个位置递归 → 左递归！
                // 检查是否已经记录过这个规则的左递归错误
                if (!this.detectedLeftRecursionErrors.has(ruleName)) {
                    // 创建左递归错误对象
                    const error: LeftRecursionError = {
                        level: 'FATAL',
                        type: 'left-recursion',
                        ruleName,
                        branchIndices: [],
                        conflictPaths: {pathA: '', pathB: ''},
                        message: `规则 "${ruleName}" 存在左递归`,
                        suggestion: '' // 稍后在外层填充
                    }

                    // 添加到错误 Map
                    this.detectedLeftRecursionErrors.set(ruleName, error)
                }

                // 返回空数组，中断当前分支的计算
                this.perfAnalyzer.cacheStats.recursiveReturn++
                return [[ruleName]]
            } else {
                // 不在第一个位置递归 → 普通递归
                // 返回规则名，防止无限递归
                this.perfAnalyzer.cacheStats.recursiveReturn++
                return [[ruleName]]
            }
        }

        // 标记当前规则正在计算（防止循环递归）
        this.recursiveDetectionSet.add(ruleName)

        try {
            // ========================================
            // 阶段3：DFS 实际计算（缓存未命中）
            // ========================================

            this.perfAnalyzer.recordActualCompute()

            // 使用 DFS 从头展开到 token
            const expandCallId = this.perfAnalyzer.startMethod('expandPathsByDFSCache')
            const subNode = this.getRuleNodeByAst(ruleName)
            const finalResult = this.expandNode(subNode, firstK, curLevel, maxLevel, isFirstPosition)
            this.perfAnalyzer.endMethod(expandCallId, undefined, finalResult.length)

            // ========================================
            // 阶段4：DFS 缓存设置（在任何层级都缓存！）
            // ========================================

            // 🔧 优化：如果结果是规则名本身（未展开），不加入缓存
            // 这样可以避免缓存污染，后续查找缓存时不会返回未展开的规则名
            const shouldCache = !this.isRuleNameOnly(finalResult, ruleName)

            if (firstK === EXPANSION_LIMITS.FIRST_K) {
                // DFS 主缓存：计算和缓存 firstK
                if (shouldCache && !this.dfsFirstKCache.has(ruleName)) {
                    // 🔧 注意：这里不应该 recordCacheMiss，因为未命中已经在前面记录过了
                    this.dfsFirstKCache.set(ruleName, finalResult)
                }
            } else if (firstK === EXPANSION_LIMITS.INFINITY) {
                if (maxLevel === EXPANSION_LIMITS.LEVEL_1) {
                    const key = ruleName + `:${EXPANSION_LIMITS.LEVEL_1}`
                    if (shouldCache && !this.bfsLevelCache.has(key)) {
                        this.bfsLevelCache.set(key, finalResult)
                    }
                }
            }

            return finalResult
        } finally {
            // 清除递归标记（确保即使异常也能清除）
            this.recursiveDetectionSet.delete(ruleName)
        }
    }


    /**
     * 判断展开结果是否是规则名本身（未展开）
     *
     * 规则名本身的情况：[[ruleName]] - 只有一个路径，且这个路径只有一个元素，就是这个规则名
     *
     * @param result 展开结果
     * @param ruleName 规则名
     * @returns 如果是规则名本身返回 true，否则返回 false
     */
    private isRuleNameOnly(result: string[][], ruleName: string): boolean {
        // 规则名本身的情况：[[ruleName]] - 只有一个路径，且这个路径只有一个元素
        if (result.length === 1 && result[0].length === 1 && result[0][0] === ruleName) {
            return true
        }
        return false
    }

    /**
     * 去重：移除重复的分支
     *
     * 例如：[[a,b], [c,d], [a,b]] → [[a,b], [c,d]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] 会被序列化为空字符串 ""
     * - 空分支不会被过滤，会正常参与去重
     * - 例如：[[], [a], []] → [[], [a]]
     */
    private deduplicate(branches: string[][]): string[][] {
        const callId = this.perfAnalyzer.startMethod('deduplicate')

        // 用于记录已经见过的分支（序列化为字符串）
        const seen = new Set<string>()
        // 存储去重后的结果
        const result: string[][] = []

        // 遍历所有分支
        for (const branch of branches) {
            // 将分支序列化为字符串（用作 Set 的 key）
            // ⚠️ 空分支 [] 会被序列化为 ""，不会被过滤
            const key = branch.join(EXPANSION_LIMITS.RuleJoinSymbol)
            // 检查是否已经存在
            if (!seen.has(key)) {
                // 未见过，添加到 Set 和结果中
                // ⚠️ 空分支 [] 也会被添加到结果中
                seen.add(key)
                result.push(branch)
            }
            // 已见过，跳过
        }

        // 返回去重后的结果（可能包含空分支 []）
        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, branches.length, result.length)

        return result
    }

    /**
     * 截取并去重：先截取到 firstK，再去重
     *
     * 使用场景：笛卡尔积后路径变长，需要截取
     *
     * 例如：[[a,b,c], [d,e,f]], firstK=2 → [[a,b], [d,e]]
     *
     * ⚠️ 重要：空分支处理
     * - 空分支 [] slice(0, firstK) 还是 []
     * - 空分支不会被过滤，会正常参与去重
     * - 例如：[[], [a,b,c]], firstK=2 → [[], [a,b]]
     *
     * 🔧 优化：如果 firstK=INFINITY，不需要截取，只去重
     */
    private truncateAndDeduplicate(branches: string[][], firstK: number): string[][] {
        const callId = this.perfAnalyzer.startMethod('truncateAndDeduplicate')

        // 如果 firstK 为 INFINITY，不需要截取，只去重
        if (firstK === EXPANSION_LIMITS.INFINITY) {
            const result = this.deduplicate(branches)
            this.perfAnalyzer.endMethod(callId, branches.length, result.length)
            return result
        }

        // 截取每个分支到 firstK
        const truncated = branches.map(branch => branch.slice(0, firstK))

        // 去重（截取后可能产生重复分支）
        const result = this.deduplicate(truncated)

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, branches.length, result.length)

        return result
    }

    /**
     * 展开 Or 节点
     *
     * 核心逻辑：合并所有分支的展开结果
     *
     * 例如：or(abc / de) firstK=2
     *   → abc 展开为 [[a,b]]
     *   → de 展开为 [[d,e]]
     *   → 合并为 [[a,b], [d,e]]
     *
     * ⚠️ 重要：空分支在 or 中的处理
     * - 如果某个分支是 option/many，可能包含空分支 []
     * - 例如：or(option(a) / b)
     *   → option(a) 展开为 [[], [a]]
     *   → b 展开为 [[b]]
     *   → 合并为 [[], [a], [b]]
     * - 空分支会被正常保留，不会被过滤
     *
     * 注意：不需要截取，因为子节点已保证长度≤firstK
     *
     * 🔴 关键：Or 分支中的每个替代也是"第一个位置"
     * - 在 PEG 的选择中，每个分支都是独立的起点
     * - Or 分支内的第一个规则需要检测左递归
     * - 例如：A → A '+' B | C
     *   - 第一个分支 A '+' B 中，A 在第一个位置，需要检测
     *   - 第二个分支 C 中，C 也在第一个位置
     */
    private expandOr(
        alternatives: RuleNode[],
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 Or 分支中的第一个规则也需要检测
    ): string[][] {
        const callId = this.perfAnalyzer.startMethod('expandOr')

        // 防御：如果 or 没有分支
        if (alternatives.length === 0) {
            throw new Error('系统错误：Or 节点没有分支')
        }

        // 存储所有分支的展开结果
        let result: string[][] = []

        // 遍历 Or 的每个选择分支
        for (const alt of alternatives) {
            // 🔴 关键：每个 Or 分支都是独立的起点，第一个位置的规则需要检测左递归
            const branches = this.expandNode(alt, firstK, curLevel, maxLevel, isFirstPosition)
            result = result.concat(branches)
        }

        // 防御：如果所有分支都没有结果
        if (result.length === 0) {
            throw new Error('系统错误：Or 节点所有分支都没有结果')
        }

        // 只去重，不截取（子节点已经处理过截取）
        const finalResult = this.deduplicate(result)

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, alternatives.length, finalResult.length)

        return finalResult
    }


    /**
     * 展开 Option/Many 节点
     *
     * option(X) = ε | X（0次或1次）
     * many(X) = ε | X | XX | XXX...（0次或多次）
     *
     * First 集合：
     * First(option(X)) = {ε} ∪ First(X)
     * First(many(X)) = {ε} ∪ First(X)
     *
     * 例如：option(abc) firstK=2
     *   → abc 展开为 [[a,b]]
     *   → 结果为 [[], [a,b]]（空分支 + 内部分支）
     *
     * ⚠️⚠️⚠️ 关键：空分支 [] 的重要性 ⚠️⚠️⚠️
     * - 空分支 [] 表示 option/many 可以跳过（0次）
     * - 空分支在后续处理中不会被过滤：
     *   1. deduplicate：[] join(',') = ""，正常去重
     *   2. cartesianProduct：[...seq, ...[]] = [...seq]，正常拼接
     *   3. truncateAndDeduplicate：[] slice(0,k) = []，正常截取
     * - 空分支必须保留，否则 option/many 的语义就错了！
     *
     * 注意：不需要截取，因为子节点已保证长度≤firstK
     *
     * 🔴 关键：Option 内的规则也需要检测左递归
     * - 虽然 option(X) 可以跳过，但当内部有递归时也是左递归
     * - 例如：A → option(A) B
     *   - option(A) 中的 A 在第一个位置，需要检测左递归
     */
    private expandOption(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 Option 内的第一个规则也需要检测
    ): string[][] {
        const callId = this.perfAnalyzer.startMethod('expandOption')

        // 递归展开内部节点，传递所有必需参数
        const innerBranches = this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition)

        // ⚠️⚠️⚠️ 关键：添加空分支 [] 表示可以跳过（0次）
        // 空分支必须在第一个位置，表示优先匹配空（PEG 顺序选择）
        const result = [[], ...innerBranches]

        // 只去重，不截取（子节点已经处理过截取）
        const finalResult = this.deduplicate(result)

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, undefined, finalResult.length)

        return finalResult
    }

    /**
     * 展开 AtLeastOne 节点
     *
     * atLeastOne(X) = X | XX | XXX...（至少1次）
     *
     * First 集合：
     * First(atLeastOne(X)) = First(X) ∪ First(XX)
     *
     * 例如：atLeastOne(ab) firstK=3
     *   → ab 展开为 [[a,b]]
     *   → 1次：[[a,b]]
     *   → 2次：[[a,b,a,b]] 截取到3 → [[a,b,a]]
     *   → 结果为 [[a,b], [a,b,a]]
     *
     * ⚠️ 重要：空分支说明
     * - atLeastOne 至少执行1次，不会产生空分支 []
     * - 与 option/many 不同，atLeastOne 的结果不包含 []
     * - 但如果内部节点包含空分支（来自嵌套的 option/many）：
     *   例如：atLeastOne(option(a))
     *   → option(a) 展开为 [[], [a]]
     *   → 1次：[[], [a]]
     *   → 2次：[[], [a]] × 2 → [[], [a]]（空分支拼接还是空分支）
     *   → 结果为 [[], [a]]
     * - 空分支会被正常保留，不会被过滤
     *
     * 注意：doubleBranches 需要内部截取，因为拼接后会超过 firstK
     *
     * 🔴 关键：AtLeastOne 内的规则也需要检测左递归
     */
    private expandAtLeastOne(
        node: SequenceNode,
        firstK: number,
        curLevel: number,
        maxLevel: number,
        isFirstPosition: boolean = true  // 🔴 AtLeastOne 内的第一个规则也需要检测
    ): string[][] {
        const callId = this.perfAnalyzer.startMethod('expandAtLeastOne')

        // 递归展开内部节点（1次的情况），传递所有必需参数
        const innerBranches = this.expandNode(node, firstK, curLevel, maxLevel, isFirstPosition)

        // 生成 doubleBranches（2次的情况）
        const doubleBranches = innerBranches.map(branch => {
            // 拼接两次（例如：[a,b] → [a,b,a,b]）
            // ⚠️ 如果 branch 是空分支 []，则 [...[], ...[]] = []
            const doubled = [...branch, ...branch]
            // 截取到 firstK（防止超长）
            // ⚠️ 空分支 [] slice(0, firstK) 还是 []
            return doubled.slice(0, firstK)
        })

        // 合并1次和2次的结果（可能包含空分支 []）
        const result = [...innerBranches, ...doubleBranches]

        // 只去重，不再截取（已经在内部截取过了）
        // ⚠️ deduplicate 不会过滤空分支 []
        const finalResult = this.deduplicate(result)

        // 记录性能统计
        this.perfAnalyzer.endMethod(callId, undefined, finalResult.length)

        return finalResult
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

