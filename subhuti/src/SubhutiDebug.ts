/**
 * Subhuti Debug - 简化调试系统（v3.0）
 * 
 * 设计理念：
 * - YAGNI：只实现实际需要的功能
 * - 简单优于复杂：单一类，清晰的输出
 * - 基于实际需求：规则追踪 + Token消费 + Or分支 + 回溯
 * 
 * 功能：
 * - ✅ 规则执行（进入/退出）
 * - ✅ Token 消费（成功/失败）
 * - ✅ 缓存命中标识
 * - ✅ 耗时信息
 * - ✅ 嵌套层级（缩进）
 * - ✅ Or 分支选择
 * - ✅ 回溯标识
 * 
 * @version 3.0.0 - 极简重构
 * @date 2025-11-04
 */

// ============================================
// SubhutiDebugger - 统一调试器
// ============================================

/**
 * 调试器接口
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件
     * @returns 上下文对象（用于计算耗时）
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
     * Or 分支尝试事件
     */
    onOrBranch?(
        branchIndex: number,
        totalBranches: number,
        tokenIndex: number
    ): void
    
    /**
     * 回溯事件
     */
    onBacktrack?(
        fromTokenIndex: number,
        toTokenIndex: number,
        reason: string
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
// SubhutiTraceDebugger - 默认实现
// ============================================

/**
 * Subhuti 轨迹调试器（v3.0 简化版）
 * 
 * 输出示例：
 * ```
 * ➡️  ImportDeclaration    ⚡CACHED  (0ms)
 *   🔹 Consume  token[0] - import - <ImportTok>  ✅  ⚡CACHED  (0ms)
 *   ➡️  ImportClause
 *     🔹 Consume  token[1] - { - <LBrace>  ✅
 *     🔀 Or[3 branches]  trying #1  ✅
 *     ⏪ Backtrack  token[5] → token[2]
 * ```
 */
export class SubhutiTraceDebugger implements SubhutiDebugger {
    private output: string[] = []
    private depth = 0
    private lineMap = new Map<string, number>()  // 规则名 -> 输出行号
    
    onRuleEnter(ruleName: string, tokenIndex: number): number {
        const line = `${'  '.repeat(this.depth)}➡️  ${ruleName}`
        this.output.push(line)
        this.lineMap.set(ruleName, this.output.length - 1)
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
        
        // 计算耗时
        let duration = 0
        if (context !== undefined && typeof context === 'number') {
            duration = performance.now() - context
        }
        
        // 更新对应的进入行，添加状态信息
        const lineIndex = this.lineMap.get(ruleName)
        if (lineIndex !== undefined) {
            const cacheTag = cacheHit ? '  ⚡CACHED' : ''
            const timeTag = `  (${duration.toFixed(0)}ms)`
            this.output[lineIndex] += cacheTag + timeTag
            this.lineMap.delete(ruleName)
        }
    }
    
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void {
        const indent = '  '.repeat(this.depth)
        const status = success ? '✅' : '❌'
        const value = tokenValue.length > 20 ? tokenValue.slice(0, 20) + '...' : tokenValue
        
        this.output.push(
            `${indent}🔹 Consume  token[${tokenIndex}] - ${value} - <${tokenName}>  ${status}`
        )
    }
    
    onOrBranch(
        branchIndex: number,
        totalBranches: number,
        tokenIndex: number
    ): void {
        const indent = '  '.repeat(this.depth)
        this.output.push(
            `${indent}🔀 Or[${totalBranches} branches]  trying #${branchIndex}  @token[${tokenIndex}]`
        )
    }
    
    onBacktrack(
        fromTokenIndex: number,
        toTokenIndex: number,
        reason: string
    ): void {
        const indent = '  '.repeat(this.depth)
        this.output.push(
            `${indent}⏪ Backtrack  token[${fromTokenIndex}] → token[${toTokenIndex}]  (${reason})`
        )
    }
    
    getTrace(): string {
        return this.output.join('\n')
    }
    
    clear(): void {
        this.output = []
        this.depth = 0
        this.lineMap.clear()
    }
}

// ============================================
// 导出
// ============================================

export { SubhutiTraceDebugger as default }
