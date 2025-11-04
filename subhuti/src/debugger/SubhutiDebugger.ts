/**
 * Subhuti Debugger 接口
 * 
 * 设计理念：
 * - 接口化：Parser 核心不包含调试逻辑，通过接口解耦
 * - 零开销：不使用时只有一次属性检查（debugger?.method()）
 * - 可扩展：用户可以实现自定义调试器
 * - 完整追踪：记录规则完整生命周期（Enter + Exit）
 * - 缓存可见：区分缓存命中和实际执行
 * 
 * @version 2.0.0
 * @date 2025-11-04
 * 
 * 版本变更：
 * - v2.0.0: 新增 onRuleExit，支持缓存命中追踪和性能分析
 * - v1.0.0: 原始版本
 */

/**
 * Subhuti Debugger 接口（v2.0）
 * 
 * Parser 通过此接口通知调试器解析过程中的事件
 */
export interface SubhutiDebugger {
    /**
     * 规则进入事件（所有调用都会触发，包括缓存命中）
     * 
     * 用途：
     * - 记录规则调用轨迹
     * - 追踪嵌套层级
     * - 返回上下文供 onRuleExit 使用（如时间戳）
     * 
     * @param ruleName - 规则名称
     * @param tokenIndex - 当前 token 位置
     * @returns 观测上下文（用于 onRuleExit，可选）
     * 
     * 使用示例：
     * ```typescript
     * onRuleEnter(ruleName: string, tokenIndex: number): number {
     *   return Date.now()  // 返回时间戳用于计算耗时
     * }
     * ```
     */
    onRuleEnter(ruleName: string, tokenIndex: number): unknown
    
    /**
     * 规则退出事件（v2.0 新增）⭐
     * 
     * 关键特性：区分缓存命中和实际执行
     * - cacheHit = true: 从缓存返回（快速路径）
     * - cacheHit = false: 实际执行（完整路径）
     * 
     * 用途：
     * - 完整记录规则生命周期
     * - 标记缓存命中（⚡ CACHED）
     * - 计算耗时（配合 onRuleEnter 的上下文）
     * 
     * @param ruleName - 规则名称
     * @param tokenIndex - 结束时的 token 位置
     * @param cacheHit - 是否缓存命中
     * @param context - onRuleEnter 返回的上下文（可选）
     * 
     * 使用示例：
     * ```typescript
     * onRuleExit(ruleName: string, tokenIndex: number, cacheHit: boolean, context?: unknown): void {
     *   const duration = Date.now() - (context as number)
     *   const flag = cacheHit ? '⚡CACHED' : `${duration}ms`
     *   console.log(`← ${ruleName} @${tokenIndex} ${flag}`)
     * }
     * ```
     */
    onRuleExit(
        ruleName: string, 
        tokenIndex: number, 
        cacheHit: boolean,
        context?: unknown
    ): void
    
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

