/**
 * Parser 事件系统 - 支持外置调试工具
 * 
 * 设计理念：
 * - 核心代码只发出事件，不关心谁在监听
 * - 零监听器 = 零开销（性能优先）
 * - 完全可插拔（调试工具外置）
 * 
 * 使用示例：
 * ```typescript
 * const parser = new Es6Parser(tokens)
 * const debugger = new SubhutiDebugger()
 * parser.addEventListener(debugger)  // 插入调试器
 * const cst = parser.Program()
 * console.log(debugger.analyze())
 * ```
 */

/**
 * Parser 事件类型（完整的解析过程追踪）
 */
export type ParserEvent = 
    // 规则执行
    | { type: 'rule-enter'; ruleName: string; tokenIndex: number; timestamp: number }
    | { type: 'rule-exit'; ruleName: string; tokenIndex: number; success: boolean; timestamp: number }
    
    // Or 规则分支选择
    | { type: 'or-enter'; ruleName: string; branchCount: number; tokenIndex: number }
    | { type: 'or-branch-try'; ruleName: string; branchIndex: number; tokenIndex: number }
    | { type: 'or-branch-result'; ruleName: string; branchIndex: number; success: boolean; tokenIndex: number }
    | { type: 'or-exit'; ruleName: string; successBranch?: number; tokenIndex: number }
    
    // 回溯
    | { type: 'backtrack'; triggerRule: string; fromTokenIndex: number; toTokenIndex: number; reason: string }
    
    // Token 消费
    | { type: 'token-consume'; tokenName: string; tokenValue: string; tokenIndex: number; success: boolean; ruleName: string }
    
    // 缓存操作
    | { type: 'cache-hit'; ruleName: string; tokenIndex: number }
    | { type: 'cache-miss'; ruleName: string; tokenIndex: number }
    | { type: 'cache-store'; ruleName: string; tokenIndex: number; success: boolean }

/**
 * Parser 事件监听器接口
 */
export interface ParserEventListener {
    /**
     * 事件回调
     * @param event 事件对象
     */
    onEvent(event: ParserEvent): void
}

/**
 * 事件发射器（最小实现）
 */
export class ParserEventEmitter {
    private listeners: ParserEventListener[] = []
    
    /**
     * 添加监听器
     */
    addEventListener(listener: ParserEventListener): void {
        this.listeners.push(listener)
    }
    
    /**
     * 移除监听器
     */
    removeEventListener(listener: ParserEventListener): void {
        const index = this.listeners.indexOf(listener)
        if (index !== -1) {
            this.listeners.splice(index, 1)
        }
    }
    
    /**
     * 移除所有监听器
     */
    removeAllListeners(): void {
        this.listeners.length = 0
    }
    
    /**
     * 发出事件（零监听器 = 零开销）
     */
    emit(event: ParserEvent): void {
        if (this.listeners.length === 0) return  // 零开销优化
        
        for (const listener of this.listeners) {
            try {
                listener.onEvent(event)
            } catch (error) {
                // 监听器错误不应影响核心解析
                console.error('[ParserEventEmitter] Listener error:', error)
            }
        }
    }
    
    /**
     * 是否有监听器
     */
    hasListeners(): boolean {
        return this.listeners.length > 0
    }
    
    /**
     * 获取监听器数量
     */
    get listenerCount(): number {
        return this.listeners.length
    }
}

