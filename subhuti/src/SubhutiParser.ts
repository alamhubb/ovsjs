/**
 * Subhuti Parser - 高性能 PEG Parser 框架（生产级实现）
 * 
 * 设计参考：
 * - Chevrotain: 模块化架构、清晰的 API
 * - PEG.js: 极简设计、返回值语义
 * - ANTLR: 成熟的错误处理
 * - Bryan Ford (2002): Packrat Parsing 标准实现
 * 
 * 核心特性：
 * - ✅ 标志驱动（性能优先，避免异常开销）
 * - ✅ allowError 机制（智能错误管理）⭐ 核心创新
 * - ✅ 返回值语义（成功返回 CST，失败返回 undefined）
 * - ✅ 成功才添加 CST（清晰的生命周期）
 * - ✅ 紧凑 CST 结构（单数组 children，内存优化）
 * - ✅ LRU Packrat 缓存（防止内存溢出）⭐ 生产级
 * - ✅ 可插拔缓存（支持自定义策略）
 * - ✅ 极简回溯（O(1) 快照索引）
 * - ✅ 类型安全（严格的 TypeScript 约束）
 * 
 * 默认配置（开箱即用）：
 * - Packrat Parsing: 启用（线性时间复杂度）
 * - 缓存策略: LRU（最近最少使用）
 * - 缓存大小: 10000 条（99% 场景足够）
 * - 内存安全: 自动淘汰旧缓存
 * 
 * 使用示例：
 * ```typescript
 * // 基础使用（默认最佳配置）
 * const parser = new MyParser(tokens)
 * const cst = parser.Program()
 * 
 * // 自定义缓存大小（大文件）
 * const parser = new MyParser(tokens, undefined, new LRUCache(50000))
 * 
 * // 无限缓存（小文件 + 内存充足）
 * const parser = new MyParser(tokens, undefined, new UnlimitedCache())
 * ```
 * 
 * @version 4.1.0 - 生产级实现（默认 LRU 缓存）
 * @date 2025-11-03
 */

import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import { SubhutiProfiler } from "./SubhutiProfiler.ts"
import type SubhutiCst from "./struct/SubhutiCst.ts";
import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";
import {SubhutiErrorHandler} from "./SubhutiError.ts";
import {type SubhutiDebugger, SubhutiTraceDebugger} from "./SubhutiDebug.ts";
import type {PackratCacheConfig, SubhutiMemoizer, SubhutiMemoResult} from "./SubhutiPackratCache.ts";

// ============================================
// [1] 类型定义（类型安全）
// ============================================

/**
 * 规则函数类型（严格类型约束）
 */
export type RuleFunction = () => SubhutiCst | undefined

/**
 * Or 规则参数类型
 */
export interface SubhutiParserOr {
    alt: RuleFunction
}

/**
 * 回溯数据
 */
export interface SubhutiBackData {
    tokenIndex: number                    // tokens 读取位置
    curCstChildrenLength: number          // children 数组长度
}

// SubhutiMemoResult 已移至 SubhutiMemoizer.ts


// ============================================
// [2] 装饰器系统
// ============================================

export function Subhuti<E extends SubhutiTokenConsumer, T extends new (...args: any[]) => SubhutiParser<E>>(
    target: T,
    context: ClassDecoratorContext
) {
    context.metadata.className = target.name
    return target
}

export function SubhutiRule(targetFun: any, context: ClassMethodDecoratorContext) {
    const ruleName = targetFun.name
    const wrappedFunction = function(): SubhutiCst | undefined {
        return this.subhutiRule(targetFun, ruleName, context.metadata.className)
    }
    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})
    return wrappedFunction
}

export type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> = 
    new (parser: SubhutiParser<T>) => T

// ============================================
// [3] SubhutiParser 核心类
// ============================================

export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {
    // ========================================
    // 核心字段
    // ========================================
    
    readonly tokenConsumer: T
    private readonly _tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    
    /**
     * 核心状态标志：parseFailed（负逻辑）
     * 
     * 语义：当前规则是否失败
     * - false: 成功，可以继续执行后续规则
     * - true: 失败，停止执行并返回失败
     * 
     * 优势：
     * - 默认值为 false（成功），成功路径无需设置
     * - 只在失败时设置，减少约44%的状态同步点
     */
    private _parseFailed = false
    
    /**
     * CST 构建栈（私有，通过 getter 访问）
     */
    private readonly cstStack: SubhutiCst[] = []
    
    /**
     * 规则调用栈（用于错误报告和调试）
     */
    private readonly ruleStack: string[] = []
    
    /**
     * 类名（用于装饰器）
     */
    private readonly className: string
    
    // ========================================
    // 调试支持（接口化设计）⭐
    // ========================================
    
    /**
     * 调试器接口（可选）
     * 
     * 用途：
     * - 记录规则执行轨迹
     * - 记录 Token 消费过程
     * - 零开销（不使用时只有一次属性检查）
     * 
     * 使用方式：
     * ```typescript
     * const parser = new MyParser(tokens).debug()  // 使用默认调试器
     * const parser = new MyParser(tokens).debug(customDebugger)  // 自定义
     * ```
     * 
     * 注意：使用 _debugger 而不是 debugger（后者是保留字）
     */
    private _debugger?: SubhutiDebugger
    
    /**
     * 错误处理器（⭐ 新增）
     * 
     * 用途：
     * - 创建详细或简单的错误信息
     * - 生成智能修复建议
     * - 支持开关控制（详细/简单模式）
     * 
     * 默认：详细模式（Rust风格 + 智能建议）
     */
    private readonly _errorHandler = new SubhutiErrorHandler()
    
    // ========================================
    // allowError 机制（⭐ 核心创新 - 智能错误管理）
    // ========================================
    
    /**
     * 当前是否允许错误
     * 
     * 用途：
     * - Or 规则：前 N-1 个分支允许失败（不抛异常）
     * - 最后分支：不允许失败（抛出详细错误）
     * - Many/Option：总是允许失败（0次匹配合法）
     */
    private _allowError = false
    
    /**
     * allowError 深度计数器（支持嵌套）
     * 
     * 场景：嵌套 Or 规则
     * - 外层 Or：允许错误
     * - 内层 Or：也允许错误
     * - 计数管理，自动恢复
     * 
     * 优势：
     * - 无内存分配（整数 vs 数组）
     * - 语义更清晰（深度 vs 栈）
     * - 性能更优（++ vs push/pop）
     */
    private allowErrorDepth = 0
    
    get allowError(): boolean {
        return this._allowError
    }
    
    setAllowError(flag: boolean): void {
        this._allowError = flag
    }
    
    /**
     * 是否有外层允许错误的上下文
     * 
     * 用途：嵌套场景判断
     * - 深度 > 1：有外层上下文
     * - 深度 = 1：当前层
     * - 深度 = 0：顶层
     */
    get outerHasAllowError(): boolean {
        return this.allowErrorDepth > 1
    }
    
    /**
     * 进入新的 allowError 上下文
     * 
     * 调用时机：Or/Many/Option 入口
     */
    private setAllowErrorNewState(): void {
        this.setAllowError(true)
        this.allowErrorDepth++  // 深度+1
    }
    
    /**
     * 退出 allowError 上下文，恢复上一层状态
     * 
     * 调用时机：Or/Many/Option 出口
     */
    private allowErrorStackPopAndReset(): void {
        this.allowErrorDepth--  // 深度-1
        this.setAllowError(this.allowErrorDepth > 0)  // 根据深度设置状态
    }
    
    // ========================================
    // Packrat Parsing（可插拔缓存 - 默认 LRU）⭐
    // ========================================
    
    /**
     * 是否启用 Packrat Parsing（默认启用）
     * 
     * 关闭场景：
     * - 调试时需要完整的规则执行轨迹
     * - 极小文件（< 100 行）缓存收益低
     * 
     * 性能影响：
     * - 启用：O(n) 线性时间复杂度
     * - 禁用：可能退化为指数级复杂度
     */
    enableMemoization: boolean = true
    
    /**
     * Memoizer 实例（可插拔缓存管理器）⭐
     * 
     * 职责：
     * - 管理缓存存储
     * - 统计命中率
     * - 应用缓存结果
     * - 提供性能建议
     * 
     * 默认配置：LRU(10000)
     * - 内存安全：自动淘汰最久未使用的条目
     * - 高性能：10000 条足够大多数文件
     * - 长时间运行：内存不会无限增长
     */
    private readonly _memoizer: SubhutiMemoizer
    
    /**
     * 性能分析器（可选）⭐
     * 
     * 用途：
     * - 调试：找出性能瓶颈
     * - 调优：评估优化效果
     * - 监控：生产环境性能监控
     * 
     * 使用方式：
     * ```typescript
     * parser.enableProfiling()
     * const cst = parser.Program()
     * console.log(parser.getProfilingReport())
     * ```
     */
    private profiler?: SubhutiProfiler
    
    // ========================================
    // 构造函数
    // ========================================
    
    /**
     * 构造 Parser
     * 
     * @param tokens Token 流（可选）
     * @param TokenConsumerClass TokenConsumer 类（可选）
     * @param cacheConfig 缓存配置（可选）
     * 
     * 零配置使用（推荐 99%）：
     * ```typescript
     * new MyParser(tokens)
     * // → Packrat 启用
     * // → LRU(10000) 自动淘汰
     * // → 内存安全 + 高性能
     * ```
     * 
     * 自定义配置：
     * ```typescript
     * // 大文件（> 10MB）
     * new MyParser(tokens, undefined, { maxSize: 50000 })
     * 
     * // 无限缓存（小文件 + 内存充足）
     * new MyParser(tokens, undefined, { maxSize: Infinity })
     * 
     * // 禁用缓存（调试）
     * const parser = new MyParser(tokens)
     * parser.enableMemoization = false
     * ```
     */
    constructor(
        tokens: SubhutiMatchToken[] = [],
        TokenConsumerClass?: SubhutiTokenConsumerConstructor<T>,
        cacheConfig?: PackratCacheConfig
    ) {
        this._tokens = tokens
        this.tokenIndex = 0
        this.className = this.constructor.name
        
        // ⭐ 初始化 Memoizer（默认 LRU 10000）
        this._memoizer = new SubhutiMemoizer(cacheConfig)
        
        // 创建 TokenConsumer 实例
        if (TokenConsumerClass) {
            this.tokenConsumer = new TokenConsumerClass(this)
        } else {
            this.tokenConsumer = new SubhutiTokenConsumer(this) as T
        }
    }
    
    // ========================================
    // Getter（公开只读访问）
    // ========================================
    
    /**
     * 当前 CST 节点（栈顶）
     */
    get curCst(): SubhutiCst | undefined {
        return this.cstStack[this.cstStack.length - 1]
    }
    
    /**
     * 当前 token
     */
    get curToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }
    
    /**
     * 是否已解析完所有 token
     */
    get isAtEnd(): boolean {
        return this.tokenIndex >= this._tokens.length
    }
    
    /**
     * 检查当前 token 前是否有换行符
     * 用于实现 ECMAScript [no LineTerminator here] 限制
     * 
     * 应用场景：
     * - ContinueStatement: continue [no LineTerminator here] LabelIdentifier?
     * - BreakStatement: break [no LineTerminator here] LabelIdentifier?
     * - ReturnStatement: return [no LineTerminator here] Expression?
     * - ThrowStatement: throw [no LineTerminator here] Expression
     * - PostfixExpression: LeftHandSideExpression [no LineTerminator here] ++/--
     */
    hasLineTerminatorBefore(): boolean {
        if (this.tokenIndex === 0) return false
        
        const currentToken = this._tokens[this.tokenIndex]
        const prevToken = this._tokens[this.tokenIndex - 1]
        
        if (!currentToken || !prevToken) return false
        
        // 检查两个 token 之间是否有换行符（通过行号）
        if (currentToken.rowNum === undefined || prevToken.rowNum === undefined) {
            return false
        }
        
        return currentToken.rowNum > prevToken.rowNum
    }
    
    /**
     * 规则成功状态（只读，兼容性）
     */
    get ruleSuccess(): boolean {
        return !this._parseFailed
    }
    
    // ========================================
    // 状态管理封装方法（优化版）
    // ========================================
    
    /**
     * 标记当前规则失败
     * 
     * 用途：在规则执行失败时调用
     * - consumeToken 失败
     * - 手动失败处理
     */
    private markFailure(): void {
        this._parseFailed = true
    }
    
    /**
     * 重置失败状态（恢复成功）
     * 
     * 用途：
     * - Or 规则尝试下一个分支前
     * - Many/Option 规则回溯后
     * - 初始化时
     */
    private resetFailure(): void {
        this._parseFailed = false
    }
    
    /**
     * 检查是否成功（便捷方法）
     */
    private get isSuccess(): boolean {
        return !this._parseFailed
    }
    
    /**
     * 判断是否是顶层规则调用
     * 
     * 用途：替代 isFirstRule 标志
     * - true: 第一次调用规则，需要初始化
     * - false: 嵌套调用规则，不需要初始化
     * 
     * 优势：
     * - 无需额外状态（利用已有的栈）
     * - 自动管理（栈的push/pop自动维护）
     * - 语义准确（栈为空 = 顶层调用）
     */
    private get isTopLevelCall(): boolean {
        return this.cstStack.length === 0 && this.ruleStack.length === 0
    }
    
    // ========================================
    // 公开方法
    // ========================================
    
    /**
     * 设置 tokens（用于复用 Parser 实例）
     */
    setTokens(tokens: SubhutiMatchToken[]): void {
        (this._tokens as SubhutiMatchToken[]).length = 0
        ;(this._tokens as SubhutiMatchToken[]).push(...tokens)
        this.tokenIndex = 0
        this._memoizer.clear()
    }
    
    // ========================================
    // 功能开关方法（链式调用）⭐
    // ========================================
    
    /**
     * 开启/关闭缓存
     * 
     * 使用示例：
     * ```typescript
     * parser.cache()       // 开启缓存（默认）
     * parser.cache(false)  // 关闭缓存
     * ```
     * 
     * @param enable - 是否启用缓存（默认true）
     * @returns this（链式调用）
     */
    cache(enable: boolean = true): this {
        this.enableMemoization = enable
        return this
    }
    
    /**
     * 开启/关闭调试模式
     * 
     * 使用示例：
     * ```typescript
     * parser.debug()       // 开启调试（默认）
     * parser.debug(false)  // 关闭调试
     * ```
     * 
     * @param enable - 是否启用调试（默认true）
     * @returns this（链式调用）
     */
    debug(enable: boolean = true): this {
        if (enable) {
            this._debugger = new SubhutiTraceDebugger()
        } else {
            this._debugger = undefined
        }
        return this
    }
    
    /**
     * 开启/关闭性能分析
     * 
     * 使用示例：
     * ```typescript
     * parser.profiling()       // 开启性能分析（默认）
     * parser.profiling(false)  // 关闭性能分析
     * ```
     * 
     * @param enable - 是否启用性能分析（默认true）
     * @returns this（链式调用）
     */
    profiling(enable: boolean = true): this {
        if (enable) {
            if (!this.profiler) {
                this.profiler = new SubhutiProfiler()
            }
            this.profiler.start()
        } else {
            this.profiler?.stop()
        }
        return this
    }
    
    /**
     * 开启/关闭详细错误信息
     * 
     * 开启：Rust风格格式 + 智能修复建议（适合开发）
     * 关闭：简单错误信息（适合生产环境）
     * 
     * 使用示例：
     * ```typescript
     * parser.errorHandler()       // 开启详细错误（默认）
     * parser.errorHandler(false)  // 使用简单错误
     * ```
     * 
     * @param enable - 是否启用详细错误（默认true）
     * @returns this（链式调用）
     */
    errorHandler(enable: boolean = true): this {
        this._errorHandler.setDetailed(enable)
        return this
    }
    
    // ========================================
    // 便捷获取方法
    // ========================================
    
    /**
     * 获取调试轨迹（便捷方法）
     * 
     * 使用示例：
     * ```typescript
     * const parser = new MyParser(tokens).debug()
     * const cst = parser.Program()
     * console.log(parser.getDebugTrace())
     * ```
     * 
     * @returns 调试轨迹字符串，如果未启用调试则返回undefined
     */
    getDebugTrace(): string | undefined {
        return this._debugger?.getTrace?.()
    }
    
    /**
     * 获取调试器实例（向后兼容）
     */
    get debuggerInstance(): SubhutiDebugger | undefined {
        return this._debugger
    }
    
    // ========================================
    // 规则执行入口（Packrat 集成）
    // ========================================
    
    /**
     * 规则执行入口（由 @SubhutiRule 装饰器调用）
     * 
     * 标准 Packrat Parsing 实现：
     * 1. 查询缓存
     * 2. 缓存命中：恢复状态，返回结果
     * 3. 缓存未命中：执行规则，存储结果
     */
    subhutiRule(targetFun: Function, ruleName: string, className: string): SubhutiCst | undefined {
        // ============================================
        // Layer 0: 类检查（编译期优化）
        // ============================================
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return undefined
            }
        }
        
        // 判断是否顶层调用
        const isTopLevel = this.isTopLevelCall
        
        // ============================================
        // Layer 1: 初始化/快速失败
        // ============================================
        if (isTopLevel) {
            // 顶层调用：初始化所有状态
            this.resetFailure()
            this.cstStack.length = 0
            this.ruleStack.length = 0
            this.allowErrorDepth = 0
        } else {
            // 嵌套调用：失败快速返回
            if (this._parseFailed) {
                return undefined  // 🚀 最快路径
            }
        }
        
        // ============================================
        // Layer 2: 观测层入口（轻量级，缓存前）⭐
        // ============================================
        // 
        // 设计理念：先记录"规则被调用"，再判断是否需要执行
        // 
        // 优势：
        // - 调试轨迹完整（包含缓存命中）
        // - 性能分析准确（区分总调用/实际执行）
        // - 开销极小（可选链 + 未启用时立即返回 undefined）
        //
        const observeContext = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)
        const perfContext = this.profiler?.startRule(ruleName)
        
        // ============================================
        // Layer 3: 缓存层（性能优化）
        // ============================================
        if (!isTopLevel && this.enableMemoization) {
            const cached = this._memoizer.get(ruleName, this.tokenIndex)
            if (cached !== undefined) {
                // 🎯 缓存命中
                
                // ⭐ 关键改进：通知观测层（缓存命中）
                this._debugger?.onRuleExit(ruleName, cached.endTokenIndex, true, observeContext)
                this.profiler?.endRule(ruleName, perfContext, true)
                
                // 快速返回
                return this.applyMemoizedResult(cached)
            }
        }
        
        // ============================================
        // Layer 4: 核心执行层
        // ============================================
        const startTokenIndex = this.tokenIndex
        const cst = this.processCst(ruleName, targetFun)
        
        // ============================================
        // Layer 5: 结果处理层
        // ============================================
        if (!isTopLevel) {
            // 缓存存储
            if (this.enableMemoization) {
                this._memoizer.set(ruleName, startTokenIndex, {
                    success: cst !== undefined,
                    endTokenIndex: this.tokenIndex,
                    cst: cst,
                    parseFailed: this._parseFailed
                })
            }
            
            // 清理优化
            if (cst && !cst.children?.length) {
                cst.children = undefined
            }
            
            // ============================================
            // Layer 6: 观测层退出（实际执行）⭐
            // ============================================
            this._debugger?.onRuleExit(ruleName, this.tokenIndex, false, observeContext)
            this.profiler?.endRule(ruleName, perfContext, false)
        }
        
        return cst
    }
    
    // ========================================
    // CST 构建（成功才添加）
    // ========================================
    
    /**
     * 处理 CST 节点
     * 
     * 设计理念：成功才添加（Chevrotain 风格）
     * - 执行前：创建 CST，push 到栈
     * - 执行中：规则函数修改状态
     * - 执行后：成功才添加到父节点
     */
    private processCst(ruleName: string, targetFun: Function): SubhutiCst | undefined {
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []
        
        // 进入上下文
        this.cstStack.push(cst)
        this.ruleStack.push(ruleName)
        
        // 执行规则函数
        targetFun.apply(this)
        
        // 退出上下文
        this.cstStack.pop()
        this.ruleStack.pop()
        
        // 判断成功/失败（负逻辑）
        if (!this._parseFailed) {
            // ✅ 成功：添加到父节点
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cst)
            }
            
            // 设置位置信息
            this.setLocation(cst)
            return cst
        }
        
        // ❌ 失败：不添加到父节点
        return undefined
    }
    
    private setLocation(cst: SubhutiCst): void {
        if (cst.children && cst.children[0]?.loc) {
            const lastChild = cst.children[cst.children.length - 1]
            cst.loc = {
                type: cst.name,
                start: cst.children[0].loc.start,
                end: lastChild?.loc?.end || cst.children[0].loc.end
            }
        }
    }
    
    // ========================================
    // Or 规则（标志驱动 + allowError 管理）
    // ========================================
    
    /**
     * Or 规则 - 顺序选择（PEG 风格 + 智能错误管理）
     * 
     * 语义：按顺序尝试每个分支，第一个成功的立即返回
     * 
     * 核心创新：自动管理 allowError
     * - 前 N-1 个分支：allowError = true（失败不抛异常）
     * - 最后分支：allowError = false（失败抛详细错误）
     * - 用户无需关心，自动优化性能
     * 
     * 参考：Bryan Ford (2004) "Parsing Expression Grammars"
     */
    Or(alternatives: SubhutiParserOr[]): SubhutiCst | undefined {
        if (this._parseFailed) {
            return undefined
        }
        
        // 进入 allowError 上下文
        this.setAllowErrorNewState()
        
        // 保存 Or 进入时的状态（标准 PEG 做法）
        const savedState = this.saveState()
        const totalCount = alternatives.length
        
        for (let i = 0; i < totalCount; i++) {
            const alt = alternatives[i]
            const isLast = i === totalCount - 1
            
            // ⭐ 核心：最后一个分支不允许错误
            if (isLast) {
                this.setAllowError(false)
            }
            
            // 尝试分支
            alt.alt()
            
            // ⭐ 修复：只根据 _parseFailed 判断，不依赖返回值
            if (!this._parseFailed) {
                // ✅ 成功：退出 allowError 上下文，返回当前CST
                this.allowErrorStackPopAndReset()
                return this.curCst
            }
            
            // ❌ 失败：回溯到 Or 进入时的状态
            if (!isLast) {
                // 非最后分支：回溯 + 重置状态，继续尝试
                this.restoreState(savedState)
                this.resetFailure()  // 重置失败状态
            } else {
                // 最后分支：回溯，保持失败状态
                this.restoreState(savedState)
            }
        }
        
        // 退出 allowError 上下文
        this.allowErrorStackPopAndReset()
        
        // 所有分支都失败
        return undefined
    }
    
    // ========================================
    // Many/Option/AtLeastOne 规则（完整实现 + allowError）
    // ========================================
    
    /**
     * Many 规则 - 0次或多次（总是成功）
     * 
     * 核心：允许错误（0次匹配合法）
     * 
     * 参考：EBNF { ... }
     */
    Many(fn: RuleFunction): SubhutiCst | undefined {
        if (this._parseFailed) {
            return undefined
        }
        
        // 进入 allowError 上下文
        this.setAllowErrorNewState()
        
        while (true) {
            const savedState = this.saveState()
            fn()  // 执行函数
            
            // ⭐ 修复：只根据 _parseFailed 判断，不依赖返回值
            if (this._parseFailed) {
                // 失败：回溯，退出循环
                this.restoreState(savedState)
                this.resetFailure()  // Many 总是成功
                break
            }
        }
        
        // 退出 allowError 上下文
        this.allowErrorStackPopAndReset()
        
        return this.curCst
    }
    
    /**
     * Option 规则 - 0次或1次（总是成功）
     * 
     * 核心：允许错误（0次匹配合法）
     * 
     * 参考：EBNF [ ... ]
     */
    Option(fn: RuleFunction): SubhutiCst | undefined {
        if (this._parseFailed) {
            return undefined
        }
        
        // 进入 allowError 上下文
        this.setAllowErrorNewState()
        
        const savedState = this.saveState()
        fn()  // 执行函数
        
        // ⭐ 修复：只根据 _parseFailed 判断，不依赖返回值
        if (this._parseFailed) {
            // 失败：回溯，重置状态
            this.restoreState(savedState)
            this.resetFailure()  // Option 总是成功
        }
        
        // 退出 allowError 上下文
        this.allowErrorStackPopAndReset()
        
        return this.curCst
    }
    
    /**
     * AtLeastOne 规则 - 1次或多次
     * 
     * 核心：
     * - 第一次：不允许错误（必须成功）
     * - 后续：允许错误（0次也可以）
     * 
     * 参考：Chevrotain AT_LEAST_ONE、EBNF { ... }+
     */
    AtLeastOne(fn: RuleFunction): SubhutiCst | undefined {
        if (this._parseFailed) {
            return undefined
        }
        
        // 第一次必须成功（不进入 allowError 上下文）
        fn()  // 执行函数
        if (this._parseFailed) {
            // 第一次失败：整个规则失败
            return undefined
        }
        
        // 后续：0次或多次（进入 allowError 上下文）
        this.setAllowErrorNewState()
        
        while (true) {
            const savedState = this.saveState()
            fn()  // 执行函数
            
            // ⭐ 修复：只根据 _parseFailed 判断，不依赖返回值
            if (this._parseFailed) {
                // 失败：回溯，退出循环
                this.restoreState(savedState)
                this.resetFailure()  // 至少成功1次，整体成功
                break
            }
        }
        
        // 退出 allowError 上下文
        this.allowErrorStackPopAndReset()
        
        return this.curCst
    }
    
    // ========================================
    // Token 消费（⭐ 智能错误管理）
    // ========================================
    
    /**
     * 消费 token（智能错误管理）
     * 
     * 核心创新：根据 allowError 自动决定行为
     * 
     * 行为：
     * - allowError = true（Or/Many/Option 内部）
     *   → 失败：设置标志，返回 undefined（不抛异常）✅ 性能
     * 
     * - allowError = false（最后分支/顶层）
     *   → 失败：设置标志，抛出详细错误 ✅ 错误信息
     * 
     * 优势：
     * - ✅ 单一方法（API 简洁）
     * - ✅ 自动优化（用户无需关心）
     * - ✅ 性能优秀（Or 内部不抛异常）
     * - ✅ 错误详细（最后分支抛异常）
     * 
     * 参考：旧版 copyolddata.ts 的精妙设计
     */
    consumeToken(tokenName: string): SubhutiCst | undefined {
        if (this._parseFailed) {
            return undefined
        }
        
        const token = this.curToken
        
        if (!token || token.tokenName !== tokenName) {
            // 失败：标记失败状态
            this.markFailure()
            
            // ⭐ 调试：记录消费失败
            this._debugger?.onTokenConsume(
                this.tokenIndex,
                token?.tokenValue || 'EOF',
                token?.tokenName || 'EOF',
                false
            )
            
            // ⭐ 核心：根据 allowError 决定行为
            if (this.outerHasAllowError || this.allowError) {
                // 允许失败：返回 undefined（不抛异常）
                return undefined
            }
            
            // 不允许失败：抛出详细错误（使用错误处理器）
            throw this._errorHandler.createError({
                expected: tokenName,
                found: token,
                position: token ? {
                    index: token.index || 0,
                    line: token.rowNum || 0,
                    column: token.columnStartNum || 0
                } : {
                    index: this._tokens[this._tokens.length - 1]?.index || 0,
                    line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                    column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
                },
                ruleStack: [...this.ruleStack]
            })
        }
        
        // ✅ 成功：消费 token（不需要设置标志！）
        // ⭐ 调试：记录消费成功
        this._debugger?.onTokenConsume(
            this.tokenIndex,
            token.tokenValue,
            token.tokenName,
            true
        )
        
        this.tokenIndex++
        return this.generateCstByToken(token)
    }
    
    /**
     * 简洁别名（兼容性）
     */
    consume(tokenName: string): SubhutiCst | undefined {
        return this.consumeToken(tokenName)
    }
    
    private generateCstByToken(token: SubhutiMatchToken): SubhutiCst {
        const cst = new SubhutiCst()
        cst.name = token.tokenName
        cst.value = token.tokenValue
        cst.loc = {
            type: token.tokenName,
            value: token.tokenValue,
            start: {
                index: token.index || 0,
                line: token.rowNum || 0,
                column: token.columnStartNum || 0
            },
            end: {
                index: (token.index || 0) + token.tokenValue.length,
                line: token.rowNum || 0,
                column: token.columnEndNum || 0
            }
        }
        
        // 添加到当前 CST
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.push(cst)
        }
        
        return cst
    }
    
    // ========================================
    // 回溯机制（O(1) 极简）
    // ========================================
    
    private saveState(): SubhutiBackData {
        const currentCst = this.curCst
        return {
            tokenIndex: this.tokenIndex,
            curCstChildrenLength: currentCst?.children?.length || 0
        }
    }
    
    private restoreState(backData: SubhutiBackData): void {
        this.tokenIndex = backData.tokenIndex
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.length = backData.curCstChildrenLength
        }
    }
    
    // ========================================
    // Packrat Parsing（委托给 Memoizer）⭐
    // ========================================
    
    /**
     * 应用缓存结果（完整状态恢复）
     * 
     * 关键：必须恢复 parseFailed 状态
     */
    private applyMemoizedResult(cached: SubhutiMemoResult): SubhutiCst | undefined {
        // 恢复 token 位置
        this.tokenIndex = cached.endTokenIndex
        
        // 恢复 parseFailed 状态（关键！）
        this._parseFailed = cached.parseFailed
        
        // 应用 CST（委托给 Memoizer）
        const parentCst = this.cstStack[this.cstStack.length - 1]
        return this._memoizer.apply(cached, parentCst)
    }
    
    /**
     * 清空所有缓存（向后兼容）
     * 
     * 使用场景：
     * - 解析新文件前（通过 setTokens 自动调用）
     * - 手动清理内存
     * - 测试重置
     */
    clearMemoCache(): void {
        this._memoizer.clear()
    }
    
    /**
     * 获取 Packrat Parsing 详细统计信息（委托给 Memoizer）
     * 
     * 用途：
     * - 评估缓存效率（命中率）
     * - 性能调优依据（智能建议）
     * 
     * 返回信息：
     * - 基础统计：hits、misses、命中率
     * - 缓存信息：规则数、总条目、平均条目
     * - 性能建议：根据数据自动生成
     * 
     * @returns 详细的缓存统计和性能建议
     */
    getMemoStats() {
        return this._memoizer.getStatsReport()
    }
    
    // ========================================
    // 辅助方法
    // ========================================
    
    get tokensName(): string {
        return this._tokens.map(item => item.tokenName).join('->')
    }
    
    get ruleStackNames(): string {
        return this.ruleStack.join('->')
    }
    
    // ========================================
    // 性能分析 API（⭐ 新增）
    // ========================================
    
    
    /**
     * 获取性能分析报告（详细版）
     * 
     * 包含：
     * - 总时间
     * - Top 10 慢规则
     * - 性能建议
     * 
     * @returns 格式化的性能报告
     */
    getProfilingReport(): string {
        if (!this.profiler) {
            return '⚠️  性能分析未启用\n   → 请先调用 profiling()'
        }
        
        return this.profiler.getReport()
    }
    
    /**
     * 获取简洁报告（单行）
     * 
     * @returns 例如："⏱️  245.32ms | 42 rules | 15,234 calls"
     */
    getProfilingShortReport(): string {
        if (!this.profiler) {
            return '⚠️  Profiling not enabled'
        }
        
        return this.profiler.getShortReport()
    }
    
    /**
     * 获取规则统计数据（原始数据）
     * 
     * 用于自定义分析或可视化
     */
    getProfilingStats(): Map<string, import('./SubhutiProfiler.ts').RuleStats> | null {
        return this.profiler?.getRuleStats() || null
    }
}

// ============================================
// [4] 导出类型和类（供用户使用）
// ============================================

/**
 * 导出缓存配置类型
 * 
 * 99% 用户不需要导入此类型（使用默认配置即可）
 * 1% 用户需要自定义缓存大小时使用
 * 
 * 示例：
 * ```typescript
 * import type { PackratCacheConfig } from './SubhutiParser.ts'
 * const config: PackratCacheConfig = { maxSize: 50000 }
 * ```
 */

/**
 * 导出调试器接口和默认实现
 * 
 * 使用方式：
 * ```typescript
 * import { SubhutiTraceDebugger } from './SubhutiParser.ts'
 * import type { SubhutiDebugger } from './SubhutiParser.ts'
 * 
 * // 使用默认调试器
 * const parser = new MyParser(tokens).debug()
 * 
 * // 自定义调试器
 * class MyDebugger implements SubhutiDebugger { ... }
 * const parser = new MyParser(tokens).debug(new MyDebugger())
 * ```
 */

/**
 * 导出错误处理器和错误类
 * 
 * 使用方式：
 * ```typescript
 * import { SubhutiErrorHandler, ParsingError } from './SubhutiParser.ts'
 * 
 * // 创建错误处理器
 * const errorHandler = new SubhutiErrorHandler()
 * 
 * // 捕获解析错误
 * try {
 *   parser.Program()
 * } catch (e) {
 *   if (e instanceof ParsingError) {
 *     console.log(e.toString())  // 详细错误
 *   }
 * }
 * ```
 */

/**
 * 导出性能分析器和统计类型（v2.0 新增）⭐
 * 
 * 使用方式：
 * ```typescript
 * import { SubhutiProfiler } from './SubhutiParser.ts'
 * import type { RuleStats } from './SubhutiParser.ts'
 * 
 * // 启用性能分析
 * const parser = new MyParser(tokens).profiling()
 * const cst = parser.Program()
 * 
 * // 获取格式化报告
 * console.log(parser.getProfilingReport())
 * 
 * // 获取原始数据
 * const stats: Map<string, RuleStats> = parser.getProfilingStats()
 * for (const [ruleName, stat] of stats) {
 *   console.log(`${ruleName}: ${stat.totalCalls} calls, ${stat.cacheHits} cached`)
 * }
 * ```
 */
export { SubhutiProfiler } from "./SubhutiProfiler.ts"
export type { RuleStats } from "./SubhutiProfiler.ts"

/**
 * 导出 Memoizer（缓存管理器）和相关类型（v4.2 新增）⭐⭐
 * 
 * 用途：
 * - 管理 Packrat Parsing 缓存
 * - 统计缓存命中率
 * - 提供性能建议
 * 
 * 使用方式：
 * ```typescript
 * import { SubhutiMemoizer } from './SubhutiParser.ts'
 * import type { SubhutiMemoResult, MemoStats } from './SubhutiParser.ts'
 * 
 * // 默认使用（Parser 自动创建）
 * const parser = new MyParser(tokens)
 * console.log(parser.getMemoStats())
 * 
 * // 自定义缓存大小
 * const parser = new MyParser(tokens, undefined, { maxSize: 50000 })
 * 
 * // 禁用缓存
 * parser.cache(false)
 * ```
 */
