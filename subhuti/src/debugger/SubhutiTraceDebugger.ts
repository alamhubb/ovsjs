/**
 * Subhuti Trace Debugger - 默认实现（v2.0）
 * 
 * 功能：记录规则执行路径和 Token 消费轨迹
 * 
 * 输出格式：
 * ```
 * 📋 Rule Execution Trace
 * 
 * → Program @0
 *   → Statement @0
 *     → IfStatement @0
 *       ✓ IfTok="if" @0
 *       → Expression @1
 *         → Identifier @1
 *         ← Identifier @2 ⚡CACHED (0ms)
 *       ← Expression @2 (5ms)
 *     ← IfStatement @10 (12ms)
 *   ← Statement @10 (15ms)
 * ← Program @15 (20ms)
 * ```
 * 
 * 新特性（v2.0）：
 * - 记录规则完整生命周期（Enter + Exit）
 * - 显示 token 位置（@N）
 * - 标记缓存命中（⚡CACHED）
 * - 显示耗时（毫秒）
 * - 嵌套缩进可视化
 * 
 * @version 2.0.0
 * @date 2025-11-04
 */

import type { SubhutiDebugger } from './SubhutiDebugger.ts'

/**
 * 轨迹条目类型
 */
type TraceEntryType = 'rule-enter' | 'rule-exit' | 'token-consume'

/**
 * 轨迹条目基础接口
 */
interface TraceEntryBase {
    type: TraceEntryType
    depth: number  // 嵌套深度
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
 * 规则退出条目（v2.0 新增）
 */
interface RuleExitEntry extends TraceEntryBase {
    type: 'rule-exit'
    ruleName: string
    tokenIndex: number
    cacheHit: boolean
    duration?: number  // 耗时（毫秒）
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
    private depth = 0  // 当前嵌套深度
    
    /**
     * 规则进入（v2.0 更新：返回时间戳上下文）
     * 
     * @param ruleName - 规则名称
     * @param tokenIndex - 当前 token 位置
     * @returns 时间戳（用于计算耗时）
     */
    onRuleEnter(ruleName: string, tokenIndex: number): number {
        this.trace.push({
            type: 'rule-enter',
            ruleName,
            tokenIndex,
            depth: this.depth
        })
        this.depth++
        return performance.now()  // 返回高精度时间戳
    }
    
    /**
     * 规则退出（v2.0 新增）⭐
     * 
     * @param ruleName - 规则名称
     * @param tokenIndex - 结束时的 token 位置
     * @param cacheHit - 是否缓存命中
     * @param context - onRuleEnter 返回的时间戳
     */
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void {
        this.depth--
        
        // 计算耗时
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
    
    /**
     * Token 消费
     */
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void {
        // Token 消费在当前规则内部，深度与当前规则相同
        this.trace.push({
            type: 'token-consume',
            tokenIndex,
            tokenValue,
            tokenName,
            success,
            depth: this.depth
        })
    }
    
    /**
     * 获取格式化的执行轨迹（v2.0 增强）
     */
    getTrace(): string {
        const lines: string[] = []
        lines.push('📋 Rule Execution Trace')
        lines.push('')
        
        for (const entry of this.trace) {
            const indent = '  '.repeat(entry.depth)
            
            if (entry.type === 'rule-enter') {
                lines.push(`${indent}→ ${entry.ruleName} @${entry.tokenIndex}`)
            } else if (entry.type === 'rule-exit') {
                // 构建退出信息
                let exitInfo = `${indent}← ${entry.ruleName} @${entry.tokenIndex}`
                
                // 缓存标记
                if (entry.cacheHit) {
                    exitInfo += ' ⚡CACHED'
                }
                
                // 耗时信息
                if (entry.duration !== undefined) {
                    exitInfo += ` (${entry.duration.toFixed(2)}ms)`
                }
                
                lines.push(exitInfo)
            } else if (entry.type === 'token-consume') {
                // 只显示成功的 token 消费
                if (entry.success) {
                    const status = '✓'
                    lines.push(`${indent}  ${status} ${entry.tokenName}="${entry.tokenValue}" @${entry.tokenIndex}`)
                }
            }
        }
        
        return lines.join('\n')
    }
    
    /**
     * 清空记录
     */
    clear(): void {
        this.trace = []
        this.depth = 0
    }
}

