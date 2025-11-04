/**
 * Subhuti Debug - 调试工具集
 * 
 * 包含：
 * - SubhutiDebugger: 调试器接口
 * - SubhutiTraceDebugger: 轨迹调试器
 * - SubhutiParserDebugger: 装饰器调试器
 * - SubhutiVisualizer: 可视化器
 * 
 * @version 2.0.0 - 文件合并重构
 * @date 2025-11-04
 */

import SubhutiParser from "./SubhutiParser.ts"
import type { SubhutiParserOr, RuleFunction } from "./SubhutiParser.ts"
import type { SubhutiMatchToken } from "./SubhutiTypes.ts"
import type SubhutiCst from "./SubhutiTypes.ts"

// ============================================
// [1] SubhutiDebugger - 调试器接口
// ============================================

/**
 * Subhuti Debugger 接口（v2.0）
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件
     */
    onRuleEnter(ruleName: string, tokenIndex: number): unknown
    
    /**
     * 规则退出事件
     */
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void
    
    /**
     * Token 消费事件
     */
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void
    
    /**
     * 获取格式化的执行轨迹
     */
    getTrace(): string
    
    /**
     * 清空记录
     */
    clear(): void
}

// ============================================
// [2] SubhutiTraceDebugger - 轨迹调试器
// ============================================

/**
 * 轨迹条目类型
 */
type TraceEntryType = 'rule-enter' | 'rule-exit' | 'token-consume'

/**
 * 轨迹条目基础接口
 */
interface TraceEntryBase {
    type: TraceEntryType
    depth: number
}

/**
 * 规则进入条目
 */
interface RuleEnterEntry extends TraceEntryBase {
    type: 'rule-enter'
    ruleName: string
    tokenIndex: number
}

/**
 * 规则退出条目
 */
interface RuleExitEntry extends TraceEntryBase {
    type: 'rule-exit'
    ruleName: string
    tokenIndex: number
    cacheHit: boolean
    duration?: number
}

/**
 * Token 消费条目
 */
interface TokenConsumeEntry extends TraceEntryBase {
    type: 'token-consume'
    tokenIndex: number
    tokenValue: string
    tokenName: string
    success: boolean
}

/**
 * 轨迹条目联合类型
 */
type TraceEntry = RuleEnterEntry | RuleExitEntry | TokenConsumeEntry

/**
 * Subhuti Trace Debugger 默认实现（v2.0）
 */
export class SubhutiTraceDebugger implements SubhutiDebugger {
    private trace: TraceEntry[] = []
    private depth = 0
    
    onRuleEnter(ruleName: string, tokenIndex: number): number {
        this.trace.push({
            type: 'rule-enter',
            ruleName,
            tokenIndex,
            depth: this.depth
        })
        this.depth++
        return performance.now()
    }
    
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void {
        this.depth--
        
        let duration: number | undefined
        if (context !== undefined && typeof context === 'number') {
            duration = performance.now() - context
        }
        
        this.trace.push({
            type: 'rule-exit',
            ruleName,
            tokenIndex,
            cacheHit,
            duration,
            depth: this.depth
        })
    }
    
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void {
        this.trace.push({
            type: 'token-consume',
            tokenIndex,
            tokenValue,
            tokenName,
            success,
            depth: this.depth
        })
    }
    
    getTrace(): string {
        const lines: string[] = []
        lines.push('📋 Rule Execution Trace')
        lines.push('')
        
        for (const entry of this.trace) {
            const indent = '  '.repeat(entry.depth)
            
            if (entry.type === 'rule-enter') {
                lines.push(`${indent}→ ${entry.ruleName} @${entry.tokenIndex}`)
            } else if (entry.type === 'rule-exit') {
                let exitInfo = `${indent}← ${entry.ruleName} @${entry.tokenIndex}`
                
                if (entry.cacheHit) {
                    exitInfo += ' ⚡CACHED'
                }
                
                if (entry.duration !== undefined) {
                    exitInfo += ` (${entry.duration.toFixed(2)}ms)`
                }
                
                lines.push(exitInfo)
            } else if (entry.type === 'token-consume') {
                if (entry.success) {
                    const status = '✓'
                    lines.push(`${indent}  ${status} ${entry.tokenName}="${entry.tokenValue}" @${entry.tokenIndex}`)
                }
            }
        }
        
        return lines.join('\n')
    }
    
    clear(): void {
        this.trace = []
        this.depth = 0
    }
}

// ============================================
// [3] SubhutiParserDebugger - 装饰器调试器
// ============================================

/**
 * 规则执行记录
 */
export interface RuleExecution {
    type: 'enter' | 'exit'
    ruleName: string
    tokenIndex: number
    timestamp: number
    success?: boolean
    depth: number
}

/**
 * Or 分支记录
 */
export interface OrBranchRecord {
    ruleName: string
    tokenIndex: number
    totalBranches: number
    triedBranches: Array<{
        index: number
        success: boolean
        tokensBefore: number
        tokensAfter: number
    }>
    successBranch?: number
    timestamp: number
}

/**
 * 回溯记录
 */
export interface BacktrackRecord {
    triggerRule: string
    fromTokenIndex: number
    toTokenIndex: number
    reason: string
    timestamp: number
}

/**
 * Token 消费记录
 */
export interface TokenConsumeRecord {
    tokenName: string
    tokenValue: string
    tokenIndex: number
    success: boolean
    ruleName: string
    timestamp: number
}

/**
 * 完整的调试数据
 */
export interface DebugData {
    ruleExecutions: RuleExecution[]
    orBranches: OrBranchRecord[]
    backtracks: BacktrackRecord[]
    tokenConsumes: TokenConsumeRecord[]
    startTime: number
    endTime: number
}

/**
 * Parser 调试装饰器
 */
export class SubhutiParserDebugger<T extends SubhutiParser = SubhutiParser> {
    private wrappedParser: T
    private data: DebugData
    private currentDepth: number = 0
    private startTime: number = 0
    
    constructor(ParserClass: new (...args: any[]) => T, tokens: SubhutiMatchToken[], ...args: any[]) {
        this.wrappedParser = new ParserClass(tokens, ...args) as T
        
        this.data = {
            ruleExecutions: [],
            orBranches: [],
            backtracks: [],
            tokenConsumes: [],
            startTime: 0,
            endTime: 0
        }
        
        this.wrapMethods()
    }
    
    private wrapMethods(): void {
        const parser = this.wrappedParser as any
        
        // 包装 subhutiRule
        const originalSubhutiRule = parser.subhutiRule.bind(parser)
        parser.subhutiRule = (targetFun: Function, ruleName: string, className: string) => {
            this.recordRuleEnter(ruleName, parser.tokenIndex)
            const result = originalSubhutiRule(targetFun, ruleName, className)
            this.recordRuleExit(ruleName, parser.tokenIndex, result !== undefined)
            return result
        }
        
        // 包装 Or
        const originalOr = parser.Or.bind(parser)
        parser.Or = (alternatives: SubhutiParserOr[]) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const startTokenIndex = parser.tokenIndex
            
            const orRecord: OrBranchRecord = {
                ruleName: currentRule,
                tokenIndex: startTokenIndex,
                totalBranches: alternatives.length,
                triedBranches: [],
                timestamp: performance.now()
            }
            
            const wrappedAlternatives = alternatives.map((alt, index) => ({
                alt: () => {
                    const tokensBefore = parser.tokenIndex
                    alt.alt()
                    const tokensAfter = parser.tokenIndex
                    const success = !parser._parseFailed
                    
                    orRecord.triedBranches.push({
                        index,
                        success,
                        tokensBefore,
                        tokensAfter
                    })
                    
                    if (success) {
                        orRecord.successBranch = index
                    }
                }
            }))
            
            const result = originalOr(wrappedAlternatives)
            this.data.orBranches.push(orRecord)
            return result
        }
        
        // 包装 consumeToken
        const originalConsumeToken = parser.consumeToken.bind(parser)
        parser.consumeToken = (tokenName: string) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const token = parser.curToken
            const tokenIndex = parser.tokenIndex
            
            const result = originalConsumeToken(tokenName)
            
            this.data.tokenConsumes.push({
                tokenName,
                tokenValue: token?.tokenValue || '',
                tokenIndex,
                success: result !== undefined,
                ruleName: currentRule,
                timestamp: performance.now()
            })
            
            return result
        }
        
        // 包装 restoreState
        const originalRestoreState = parser.restoreState.bind(parser)
        parser.restoreState = (backData: any) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const fromIndex = parser.tokenIndex
            const toIndex = backData.tokenIndex
            
            if (fromIndex !== toIndex) {
                this.data.backtracks.push({
                    triggerRule: currentRule,
                    fromTokenIndex: fromIndex,
                    toTokenIndex: toIndex,
                    reason: `Backtrack in ${currentRule}`,
                    timestamp: performance.now()
                })
            }
            
            return originalRestoreState(backData)
        }
    }
    
    private recordRuleEnter(ruleName: string, tokenIndex: number): void {
        this.data.ruleExecutions.push({
            type: 'enter',
            ruleName,
            tokenIndex,
            timestamp: performance.now(),
            depth: this.currentDepth
        })
        this.currentDepth++
    }
    
    private recordRuleExit(ruleName: string, tokenIndex: number, success: boolean): void {
        this.currentDepth--
        this.data.ruleExecutions.push({
            type: 'exit',
            ruleName,
            tokenIndex,
            timestamp: performance.now(),
            success,
            depth: this.currentDepth
        })
    }
    
    get parser(): T {
        return this.wrappedParser
    }
    
    start(): void {
        this.data.startTime = performance.now()
        this.startTime = this.data.startTime
    }
    
    end(): void {
        this.data.endTime = performance.now()
    }
    
    getData(): DebugData {
        return this.data
    }
    
    clear(): void {
        this.data = {
            ruleExecutions: [],
            orBranches: [],
            backtracks: [],
            tokenConsumes: [],
            startTime: 0,
            endTime: 0
        }
        this.currentDepth = 0
    }
    
    static create<T extends SubhutiParser>(
        ParserClass: new (...args: any[]) => T,
        tokens: SubhutiMatchToken[],
        ...args: any[]
    ): T & SubhutiParserDebugger<T> {
        const debugger = new SubhutiParserDebugger(ParserClass, tokens, ...args)
        
        return new Proxy(debugger, {
            get(target, prop) {
                if (prop in target) {
                    return (target as any)[prop]
                }
                
                const parser = target.parser as any
                const value = parser[prop]
                
                if (typeof value === 'function') {
                    return value.bind(parser)
                }
                
                return value
            },
            
            set(target, prop, value) {
                const parser = target.parser as any
                parser[prop] = value
                return true
            }
        }) as T & SubhutiParserDebugger<T>
    }
}

// ============================================
// [4] SubhutiVisualizer - 可视化器
// ============================================

/**
 * 调试数据类型
 */
export interface VisualizerDebugData {
    ruleExecutions: Array<{
        type: 'enter' | 'exit'
        ruleName: string
        tokenIndex: number
        timestamp: number
        success?: boolean
    }>
    orBranches: Array<{
        ruleName: string
        totalBranches: number
        successBranch?: number
        tokenIndex: number
    }>
    tokenConsumes: Array<{
        tokenName: string
        tokenIndex: number
        success: boolean
    }>
    startTime: number
    endTime: number
}

/**
 * 可视化选项
 */
export interface VisualizerOptions {
    mode?: 'timeline' | 'or-branches' | 'token-compare' | 'full'
    maxDepth?: number
    highlightRules?: string[]
    showTimestamps?: boolean
    showTokenIndex?: boolean
}

/**
 * SubhutiParser 可视化器
 */
export class SubhutiVisualizer {
    /**
     * 生成完整报告
     */
    static generateReport(
        data: VisualizerDebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined,
        options: VisualizerOptions = {}
    ): string {
        const {
            mode = 'full',
            maxDepth = Infinity,
            highlightRules = [],
            showTimestamps = false,
            showTokenIndex = true
        } = options
        
        const lines: string[] = []
        
        lines.push('═'.repeat(80))
        lines.push('🔍 SubhutiParser 调试报告')
        lines.push('═'.repeat(80))
        lines.push('')
        
        lines.push(...this.generateSummary(data, tokens, cst))
        lines.push('')
        
        if (mode === 'timeline' || mode === 'full') {
            lines.push(...this.generateTimeline(data, { maxDepth, highlightRules, showTimestamps, showTokenIndex }))
            lines.push('')
        }
        
        if (mode === 'or-branches' || mode === 'full') {
            lines.push(...this.generateOrBranchesReport(data))
            lines.push('')
        }
        
        if (mode === 'token-compare' || mode === 'full') {
            lines.push(...this.generateTokenComparison(tokens, data.tokenConsumes, cst))
            lines.push('')
        }
        
        return lines.join('\n')
    }
    
    private static generateSummary(
        data: VisualizerDebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined
    ): string[] {
        const lines: string[] = []
        const duration = data.endTime - data.startTime
        
        lines.push('📊 总体统计')
        lines.push('─'.repeat(80))
        lines.push(`  解析耗时:     ${duration.toFixed(2)}ms`)
        lines.push(`  输入Token数:  ${tokens.length}`)
        lines.push(`  规则执行数:   ${data.ruleExecutions.length / 2}`)
        lines.push(`  Or分支数:     ${data.orBranches.length}`)
        lines.push(`  Token消费数:  ${data.tokenConsumes.length}`)
        lines.push(`  解析状态:     ${cst ? '✅ 成功' : '❌ 失败'}`)
        
        return lines
    }
    
    static generateTimeline(
        data: VisualizerDebugData,
        options: Partial<VisualizerOptions> = {}
    ): string[] {
        const lines: string[] = []
        const { maxDepth = Infinity, highlightRules = [], showTimestamps = false, showTokenIndex = true } = options
        
        lines.push('📍 规则执行时间线')
        lines.push('═'.repeat(80))
        
        let currentDepth = 0
        
        for (const exec of data.ruleExecutions) {
            if (exec.type === 'exit') currentDepth--
            
            if (currentDepth >= maxDepth) {
                if (exec.type === 'enter') currentDepth++
                continue
            }
            
            const indent = '  '.repeat(currentDepth)
            const timestamp = showTimestamps ? `[${(exec.timestamp - data.startTime).toFixed(1)}ms]` : ''
            const tokenIdx = showTokenIndex ? `[${exec.tokenIndex}]` : ''
            const highlight = highlightRules.includes(exec.ruleName) ? '🔍' : ''
            
            if (exec.type === 'enter') {
                lines.push(`${indent}${timestamp}${tokenIdx} → ${highlight}${exec.ruleName}`)
                currentDepth++
            } else {
                const status = exec.success ? '✅' : '❌'
                lines.push(`${indent}${timestamp}${tokenIdx} ${status} ${highlight}${exec.ruleName}`)
            }
        }
        
        return lines
    }
    
    static generateOrBranchesReport(data: VisualizerDebugData): string[] {
        const lines: string[] = []
        
        lines.push('🔀 Or 分支选择分析')
        lines.push('═'.repeat(80))
        
        if (data.orBranches.length === 0) {
            lines.push('  （没有 Or 规则执行）')
            return lines
        }
        
        for (const orBranch of data.orBranches) {
            lines.push('')
            lines.push(`📌 ${orBranch.ruleName} @ token[${orBranch.tokenIndex}]`)
            lines.push(`   总分支数: ${orBranch.totalBranches}`)
            
            if (orBranch.successBranch !== undefined) {
                lines.push(`   ✅ 成功分支: ${orBranch.successBranch}`)
            } else {
                lines.push(`   ❌ 所有分支都失败`)
            }
        }
        
        return lines
    }
    
    static generateTokenComparison(
        inputTokens: SubhutiMatchToken[],
        tokenConsumes: Array<{ tokenName: string; tokenIndex: number; success: boolean }>,
        cst: SubhutiCst | undefined
    ): string[] {
        const lines: string[] = []
        
        lines.push('🔍 Token 完整性检查')
        lines.push('═'.repeat(80))
        
        const meaningfulTokens = inputTokens.filter((t: any) => {
            const tokenName = t.tokenType?.name || t.tokenName || ''
            return tokenName !== 'SingleLineComment' &&
                tokenName !== 'MultiLineComment' &&
                tokenName !== 'Spacing' &&
                tokenName !== 'LineBreak'
        })
        
        const cstTokens = cst ? this.collectCSTTokens(cst) : []
        
        lines.push(`输入 Token 数: ${meaningfulTokens.length}`)
        lines.push(`CST Token 数:  ${cstTokens.length}`)
        lines.push(`消费尝试数:    ${tokenConsumes.length}`)
        lines.push(`消费成功数:    ${tokenConsumes.filter(t => t.success).length}`)
        lines.push('')
        
        lines.push('详细对比:')
        const missing: string[] = []
        
        for (let i = 0; i < meaningfulTokens.length; i++) {
            const inputToken = meaningfulTokens[i]
            const tokenValue = (inputToken as any).tokenValue || ''
            const found = cstTokens.includes(tokenValue)
            const status = found ? '✅' : '❌'
            
            if (!found) {
                missing.push(tokenValue)
            }
            
            lines.push(`  [${i}] ${status} "${tokenValue}"`)
        }
        
        if (missing.length > 0) {
            lines.push('')
            lines.push(`⚠️  丢失的 Token (${missing.length}个):`)
            missing.forEach(token => {
                lines.push(`     ❌ "${token}"`)
            })
        } else {
            lines.push('')
            lines.push('✅ 所有 Token 都已保留！')
        }
        
        return lines
    }
    
    private static collectCSTTokens(node: SubhutiCst): string[] {
        const tokens: string[] = []
        
        if (node.value !== undefined && (!node.children || node.children.length === 0)) {
            tokens.push(node.value)
        }
        
        if (node.children) {
            for (const child of node.children) {
                tokens.push(...this.collectCSTTokens(child))
            }
        }
        
        return tokens
    }
    
    static generateShortReport(
        data: VisualizerDebugData,
        tokens: SubhutiMatchToken[],
        cst: SubhutiCst | undefined
    ): string {
        const duration = data.endTime - data.startTime
        const status = cst ? '✅' : '❌'
        const ruleCount = data.ruleExecutions.length / 2
        const orCount = data.orBranches.length
        const tokenCount = data.tokenConsumes.filter(t => t.success).length
        
        return `${status} Parse ${duration.toFixed(2)}ms | ${ruleCount} rules | ${orCount} ors | ${tokenCount} tokens consumed | ${tokens.length} tokens total`
    }
}

