/**
 * SubhutiParser 调试装饰器（零侵入）
 * 
 * 设计理念：
 * - 完全不修改核心 SubhutiParser 代码
 * - 通过继承 + 方法重写收集数据
 * - 提供完整的解析过程追踪
 * - 智能诊断 + 可视化
 * 
 * 使用方式：
 * ```typescript
 * // 不调试时（零开销）
 * const parser = new Es6Parser(tokens)
 * 
 * // 调试时（包装一下）
 * const debugParser = new SubhutiParserDebugger(Es6Parser, tokens)
 * const cst = debugParser.Program()
 * console.log(debugParser.getReport())
 * ```
 * 
 * @version 1.0.0
 * @date 2025-11-04
 */

import SubhutiParser from "../parser/SubhutiParser.ts"
import type { SubhutiParserOr, RuleFunction } from "../parser/SubhutiParser.ts"
import type SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import type SubhutiCst from "../struct/SubhutiCst.ts"

// ============================================
// [1] 数据收集类型定义
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

// ============================================
// [2] 装饰器类（通过继承实现）
// ============================================

/**
 * Parser 调试装饰器
 * 
 * 通过继承 SubhutiParser 并重写关键方法来收集数据
 */
export class SubhutiParserDebugger<T extends SubhutiParser = SubhutiParser> {
    private wrappedParser: T
    private data: DebugData
    private currentDepth: number = 0
    private startTime: number = 0
    
    /**
     * 构造函数
     * 
     * @param ParserClass Parser 类（如 Es6Parser）
     * @param tokens Token 流
     * @param args 其他参数
     */
    constructor(ParserClass: new (...args: any[]) => T, tokens: SubhutiMatchToken[], ...args: any[]) {
        // 创建原始 Parser 实例
        this.wrappedParser = new ParserClass(tokens, ...args) as T
        
        // 初始化数据
        this.data = {
            ruleExecutions: [],
            orBranches: [],
            backtracks: [],
            tokenConsumes: [],
            startTime: 0,
            endTime: 0
        }
        
        // 包装关键方法
        this.wrapMethods()
    }
    
    /**
     * 包装 Parser 的关键方法
     */
    private wrapMethods(): void {
        const parser = this.wrappedParser as any
        
        // ========================================
        // 包装 subhutiRule（规则执行追踪）
        // ========================================
        const originalSubhutiRule = parser.subhutiRule.bind(parser)
        parser.subhutiRule = (targetFun: Function, ruleName: string, className: string) => {
            // 记录进入
            this.recordRuleEnter(ruleName, parser.tokenIndex)
            
            // 执行原始方法
            const result = originalSubhutiRule(targetFun, ruleName, className)
            
            // 记录退出
            this.recordRuleExit(ruleName, parser.tokenIndex, result !== undefined)
            
            return result
        }
        
        // ========================================
        // 包装 Or（分支选择追踪）
        // ========================================
        const originalOr = parser.Or.bind(parser)
        parser.Or = (alternatives: SubhutiParserOr[]) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const startTokenIndex = parser.tokenIndex
            
            // 创建 Or 记录
            const orRecord: OrBranchRecord = {
                ruleName: currentRule,
                tokenIndex: startTokenIndex,
                totalBranches: alternatives.length,
                triedBranches: [],
                timestamp: performance.now()
            }
            
            // 包装每个分支
            const wrappedAlternatives = alternatives.map((alt, index) => ({
                alt: () => {
                    const tokensBefore = parser.tokenIndex
                    
                    // 执行分支
                    alt.alt()
                    
                    const tokensAfter = parser.tokenIndex
                    const success = !parser._parseFailed
                    
                    // 记录分支结果
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
            
            // 执行原始 Or
            const result = originalOr(wrappedAlternatives)
            
            // 保存记录
            this.data.orBranches.push(orRecord)
            
            return result
        }
        
        // ========================================
        // 包装 consumeToken（Token 消费追踪）
        // ========================================
        const originalConsumeToken = parser.consumeToken.bind(parser)
        parser.consumeToken = (tokenName: string) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const token = parser.curToken
            const tokenIndex = parser.tokenIndex
            
            // 执行原始方法
            const result = originalConsumeToken(tokenName)
            
            // 记录消费
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
        
        // ========================================
        // 包装 restoreState（回溯追踪）
        // ========================================
        const originalRestoreState = parser.restoreState.bind(parser)
        parser.restoreState = (backData: any) => {
            const currentRule = parser.ruleStack[parser.ruleStack.length - 1] || 'unknown'
            const fromIndex = parser.tokenIndex
            const toIndex = backData.tokenIndex
            
            // 记录回溯
            if (fromIndex !== toIndex) {
                this.data.backtracks.push({
                    triggerRule: currentRule,
                    fromTokenIndex: fromIndex,
                    toTokenIndex: toIndex,
                    reason: `Backtrack in ${currentRule}`,
                    timestamp: performance.now()
                })
            }
            
            // 执行原始方法
            return originalRestoreState(backData)
        }
    }
    
    /**
     * 记录规则进入
     */
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
    
    /**
     * 记录规则退出
     */
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
    
    // ========================================
    // [3] 公开 API（代理到原始 Parser）
    // ========================================
    
    /**
     * 代理属性访问到原始 Parser
     */
    get parser(): T {
        return this.wrappedParser
    }
    
    /**
     * 开始调试（记录开始时间）
     */
    start(): void {
        this.data.startTime = performance.now()
        this.startTime = this.data.startTime
    }
    
    /**
     * 结束调试（记录结束时间）
     */
    end(): void {
        this.data.endTime = performance.now()
    }
    
    /**
     * 获取调试数据
     */
    getData(): DebugData {
        return this.data
    }
    
    /**
     * 清空调试数据
     */
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
    
    // ========================================
    // [4] 代理所有方法到原始 Parser
    // ========================================
    
    /**
     * 使用 Proxy 自动代理所有未定义的方法和属性
     */
    static create<T extends SubhutiParser>(
        ParserClass: new (...args: any[]) => T,
        tokens: SubhutiMatchToken[],
        ...args: any[]
    ): T & SubhutiParserDebugger<T> {
        const debugger = new SubhutiParserDebugger(ParserClass, tokens, ...args)
        
        return new Proxy(debugger, {
            get(target, prop) {
                // 如果是 debugger 自己的方法，返回
                if (prop in target) {
                    return (target as any)[prop]
                }
                
                // 否则代理到原始 parser
                const parser = target.parser as any
                const value = parser[prop]
                
                // 如果是方法，绑定 this
                if (typeof value === 'function') {
                    return value.bind(parser)
                }
                
                return value
            },
            
            set(target, prop, value) {
                // 设置到原始 parser
                const parser = target.parser as any
                parser[prop] = value
                return true
            }
        }) as T & SubhutiParserDebugger<T>
    }
}

