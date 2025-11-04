/**
 * Subhuti Debugger 接口
 * 
 * 设计理念：
 * - 接口化：Parser 核心不包含调试逻辑，通过接口解耦
 * - 零开销：不使用时只有一次属性检查（debugger?.method()）
 * - 可扩展：用户可以实现自定义调试器
 * 
 * @version 1.0.0
 * @date 2025-11-04
 */

/**
 * Subhuti Debugger 接口
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件
     * 
     * @param ruleName - 规则名称
     */
    onRuleEnter(ruleName: string): void
    
    /**
     * Token 消费事件
     * 
     * @param tokenIndex - token 索引
     * @param tokenValue - token 值
     * @param tokenName - token 类型名
     * @param success - 是否成功消费
     */
    onTokenConsume(
        tokenIndex: number,
        tokenValue: string,
        tokenName: string,
        success: boolean
    ): void
    
    /**
     * 获取格式化的执行轨迹
     * 
     * @returns 格式化的轨迹字符串
     */
    getTrace(): string
    
    /**
     * 清空记录
     */
    clear(): void
}

