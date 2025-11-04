/**
 * Subhuti Trace Debugger - 默认实现
 * 
 * 功能：记录规则执行路径和 Token 消费轨迹
 * 
 * 输出格式：
 * ```
 * 📋 Rule Execution Trace
 * 
 *   1. ➡️  ImportDeclaration
 *   2.   🔹 Consume                token[0] - import - <ImportTok>  ✅
 *   3.   ➡️  ImportClause
 *   4.     🔹 Consume              token[1] - { - <LBrace>  ✅
 * ```
 * 
 * @version 1.0.0
 * @date 2025-11-04
 */

import type { SubhutiDebugger } from './SubhutiDebugger.ts'

/**
 * 轨迹条目类型
 */
type TraceEntryType = 'rule-enter' | 'token-consume'

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
type TraceEntry = RuleEnterEntry | TokenConsumeEntry

/**
 * Subhuti Trace Debugger 默认实现
 */
export class SubhutiTraceDebugger implements SubhutiDebugger {
    private trace: TraceEntry[] = []
    private depth = 0  // 当前嵌套深度
    
    /**
     * 规则进入
     */
    onRuleEnter(ruleName: string): void {
        this.trace.push({
            type: 'rule-enter',
            ruleName,
            depth: this.depth
        })
        this.depth++
    }
    
    /**
     * 规则退出（内部使用，用于维护深度）
     * 
     * 注意：Parser 不会调用此方法，我们在 onTokenConsume 或下一个 onRuleEnter 时自动调整深度
     * 
     * 问题：如何知道规则何时退出？
     * 方案：通过深度栈来推断
     */
    private adjustDepth(): void {
        // 简化方案：Token 消费后深度不变
        // 下一个规则进入时，如果深度相同或更浅，说明上一个规则已退出
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
        // Token 消费与规则同深度
        this.trace.push({
            type: 'token-consume',
            tokenIndex,
            tokenValue,
            tokenName,
            success,
            depth: this.depth - 1  // Token 消费在规则内部，所以深度 -1
        })
    }
    
    /**
     * 获取格式化的执行轨迹
     */
    getTrace(): string {
        const lines: string[] = []
        lines.push('📋 Rule Execution Trace')
        lines.push('')
        
        let lineNum = 1
        
        for (const entry of this.trace) {
            const indent = '  '.repeat(entry.depth)
            const num = `${lineNum++}.`.padStart(4)

            if (entry.type === 'rule-enter') {
                lines.push(`${num} ${indent}➡️  ${entry.ruleName}`)
            } else if (entry.type === 'token-consume') {
                if (entry.success){
                    // 格式：token[0] - import - <ImportTok>  ✅
                    const status = entry.success ? '✅' : '❌'
                    const tokenInfo = `token[${entry.tokenIndex}] - ${entry.tokenValue} - <${entry.tokenName}>`
                    lines.push(`${num} ${indent}🔹 Consume                ${tokenInfo}  ${status}`)
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

