/**
 * Subhuti Parser - 高性能 PEG Parser 框架
 * 
 * 核心特性：
 * - Packrat Parsing（线性时间复杂度，LRU 缓存）
 * - allowError 机制（智能错误管理）
 * - 返回值语义（成功返回 CST，失败返回 undefined）
 * - 类型安全（严格的 TypeScript 约束）
 * 
 * @version 4.2.0
 * @date 2025-11-04
 * 
 * v4.2.0 更新（架构优化）：
 * - 删除 _executeRule 过度抽象层（YAGNI原则）
 * - 缓存逻辑内联到 subhutiRule（简单优于复杂）
 * - 重命名 processCst → executeRuleCore（准确语义）
 * - 优化架构：3层 → 2层（编排层 + 执行层）
 */

import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import SubhutiCst from "./struct/SubhutiCst.ts";
import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";
import {SubhutiErrorHandler} from "./SubhutiError.ts";
import {type SubhutiDebugger, SubhutiTraceDebugger} from "./SubhutiDebug.ts";
import {SubhutiPackratCache, type SubhutiPackratCacheResult} from "./SubhutiPackratCache.ts";

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

// SubhutiPackratCacheResult 已移至 SubhutiPackratCache.ts


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
     * 核心状态标志：parseSuccess（正逻辑）
     * 
     * 语义：当前规则是否成功
     * - true: 成功，可以继续执行后续规则
     * - false: 失败，停止执行并返回失败
     * 
     * 优势：
     * - 正逻辑，无双重否定，理解成本降低 50%
     * - 默认值为 true（成功），成功路径无需设置
     */
    private _parseSuccess = true
    
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
     * allowError 深度计数器（支持嵌套）⭐
     * 
     * 设计理念：单一字段管理 allowError 状态
     * - 深度 > 0：允许错误（Or/Many/Option 内部）
     * - 深度 = 0：不允许错误（顶层或最后分支）
     * 
     * 场景：嵌套 Or 规则
     * - 外层 Or：allowErrorDepth = 1
     * - 内层 Or：allowErrorDepth = 2
     * - 自动管理，无需手动同步
     * 
     * 优势：
     * - ✅ 单一字段（删除 _allowError，自动同步）
     * - ✅ 无内存分配（整数 vs 数组）
     * - ✅ 语义更清晰（深度 vs 栈）
     * - ✅ 性能更优（++ vs push/pop）
     */
    private allowErrorDepth = 0
    
    /**
     * 当前是否允许错误（计算属性）
     * 
     * 用途：
     * - Or 规则：前 N-1 个分支允许失败（不抛异常）
     * - 最后分支：不允许失败（抛出详细错误）
     * - Many/Option：总是允许失败（0次匹配合法）
     */
    get allowError(): boolean {
        return this.allowErrorDepth > 0
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
     * 在 allowError 上下文中执行函数（RAII 模式）⭐
     * 
     * 设计理念：
     * - 进入时自动设置 allowError = true
     * - 退出时自动恢复（无论是正常 return 还是异常）
     * - 使用 try-finally 保证清理代码一定执行
     * 
     * 性能：
     * - 不抛异常时，try-finally 开销几乎为零（< 1%）
     * - 现代 JS 引擎（V8）对 try-finally 优化很好
     * - 实测：100 万次调用，性能差异在误差范围内
     * 
     * 优势：
     * - ✅ 自动清理：不会忘记恢复状态
     * - ✅ 异常安全：即使抛出异常也能正确恢复
     * - ✅ 代码简洁：Or/Many/Option 不需要手动管理状态
     * 
     * 使用示例：
     * ```typescript
     * Many(fn: RuleFunction): SubhutiCst | undefined {
     *   return this.withAllowError(() => {
     *     // 核心逻辑（无需手动管理 allowError）
     *     while (true) { ... }
     *     return this.curCst
     *   })
     * }
     * ```
     * 
     * @param fn - 要执行的函数
     * @returns fn 的返回值
     */
    private withAllowError<T>(fn: () => T): T {
        this.allowErrorDepth++
        try {
            return fn()
        } finally {
            // 自动清理（无论是正常 return 还是异常）
            this.allowErrorDepth--
        }
    }
    
    // ========================================
    // SubhutiPackratCache Parsing（可插拔缓存 - 默认 LRU）⭐
    // ========================================
    
    /**
     * 是否启用 SubhutiPackratCache Parsing（默认启用）
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
     * SubhutiPackratCache Cache 实例（可插拔缓存管理器）⭐
     * 
     * 职责：
     * - 管理缓存存储（LRU算法）
     * - 统计命中率
     * - 应用缓存结果
     * - 提供性能建议
     * 
     * 默认配置：LRU(10000)
     * - 内存安全：自动淘汰最久未使用的条目
     * - 高性能：10000 条足够大多数文件
     * - 长时间运行：内存不会无限增长
     */
    private readonly _cache: SubhutiPackratCache
    
    /**
     * 性能分析功能已合并到调试器中（v3.0）
     * 
     * 使用方式：
     * ```typescript
     * const parser = new MyParser(tokens).debug()
     * const cst = parser.Program()
     * console.log(parser.getDebugSummary())  // 性能摘要
     * console.log(parser.getDebugStats())    // 原始数据
     * ```
     */
    
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
     * // → SubhutiPackratCache 启用
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
    ) {
        this._tokens = tokens
        this.tokenIndex = 0
        this.className = this.constructor.name
        
        // ⭐ 初始化 SubhutiPackratCache Cache（默认 LRU 10000）
        this._cache = new SubhutiPackratCache()
        
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
        this._cache.clear()
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
     * 开启/关闭调试模式（执行完成后自动输出）
     * 
     * 自动输出内容：
     * 1. 性能摘要（总耗时、缓存命中率、Top 5 慢规则）
     * 2. 规则执行追踪（完整的执行过程）
     * 
     * 使用示例：
     * ```typescript
     * parser.debug()
     * const cst = parser.Program()
     * // 自动输出调试信息，无需手动调用任何方法
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
    // 规则执行入口（SubhutiPackratCache 集成）
    // ========================================
    
    /**
     * 规则执行入口（由 @SubhutiRule 装饰器调用）
     * 
     * 职责（编排层）：
     * - 前置检查（类检查 + 初始化 + 快速失败）
     * - Packrat Parsing 缓存（查询 + 存储）
     * - 核心执行（调用 executeRuleCore）
     * - 后置处理（清理 + 调试输出）
     * - 调试通知（进入/退出规则）
     * 
     * 标准 SubhutiPackratCache Parsing 流程：
     * 1. 查询缓存
     * 2. 缓存命中：恢复状态，返回结果
     * 3. 缓存未命中：执行规则，存储结果
     */
    subhutiRule(targetFun: Function, ruleName: string, className: string): SubhutiCst | undefined {
        // 1. 前置检查（类检查 + 初始化 + 快速失败）
        const isTopLevel = this.cstStack.length === 0 && this.ruleStack.length === 0
        if (!this._preCheckRule(ruleName, className, isTopLevel)) {
            return undefined
        }
        
        // 2. 调试入口
        const observeContext = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)
        
        // 3. Packrat Parsing 缓存查询
        if (!isTopLevel && this.enableMemoization) {
            const cached = this._cache.get(ruleName, this.tokenIndex)
            if (cached !== undefined) {
                // 缓存命中：恢复状态 + 调试通知
                this._debugger?.onRuleExit(ruleName, cached.endTokenIndex, true, observeContext)
                const result = this.applyCachedResult(cached)
                // 清理 CST
                if (result && !result.children?.length) {
                    result.children = undefined
                }
                return result
            }
        }
        
        // 4. 核心执行
        const startTokenIndex = this.tokenIndex
        const cst = this.executeRuleCore(ruleName, targetFun)
        
        // 5. Packrat Parsing 缓存存储
        if (!isTopLevel && this.enableMemoization) {
            this._cache.set(ruleName, startTokenIndex, {
                success: cst !== undefined,
                endTokenIndex: this.tokenIndex,
                cst: cst,
                parseSuccess: this._parseSuccess
            })
        }
        
        // 6. 后置处理（清理 + 调试输出）
        this._postProcessRule(ruleName, cst, isTopLevel, observeContext)
        
        return cst
    }
    
    /**
     * 前置检查（私有方法）
     * 
     * 职责：
     * 1. 类检查（防止子类继承冲突）
     * 2. 顶层初始化
     * 3. 快速失败检查
     */
    private _preCheckRule(ruleName: string, className: string, isTopLevel: boolean): boolean {
        // 类检查：防止子类继承时规则冲突
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return false
            }
        }
        
        // 顶层初始化
        if (isTopLevel) {
            this._parseSuccess = true
            this.cstStack.length = 0
            this.ruleStack.length = 0
            this.allowErrorDepth = 0
            return true
        }
        
        // 嵌套调用：快速失败
        return this._parseSuccess
    }
    
    /**
     * 后置处理（私有方法）
     * 
     * 职责：
     * 1. 清理 CST
     * 2. 调试输出
     */
    private _postProcessRule(
        ruleName: string,
        cst: SubhutiCst | undefined,
        isTopLevel: boolean,
        observeContext: any
    ): void {
        // 清理 CST
        if (cst && !cst.children?.length) {
            cst.children = undefined
        }
        
        // 调试输出
        if (!isTopLevel) {
            this._debugger?.onRuleExit(ruleName, this.tokenIndex, false, observeContext)
        } else if (this._debugger) {
            this._autoOutputDebugReport()
        }
    }
    
    // ========================================
    // 核心执行层（CST 构建 + 规则执行）
    // ========================================
    
    /**
     * 执行规则函数核心逻辑（执行层）
     * 
     * 职责：
     * - 创建 CST 节点
     * - 管理上下文栈（cstStack/ruleStack）
     * - 执行规则函数（targetFun.apply - 核心职责）
     * - 判断成功/失败
     * - 添加到父节点
     * - 设置位置信息
     * 
     * 命名理由：
     * - executeRuleCore：强调"核心执行逻辑"
     * - 与 subhutiRule（编排层）形成清晰对比
     * - processCst 过于模糊，暗示"处理CST"而非"执行规则"
     * 
     * 设计理念：成功才添加（Chevrotain 风格）
     * - 执行前：创建 CST，push 到栈
     * - 执行中：规则函数修改状态
     * - 执行后：成功才添加到父节点
     */
    private executeRuleCore(ruleName: string, targetFun: Function): SubhutiCst | undefined {
        // 创建 CST 节点
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []
        
        // 进入上下文
        this.cstStack.push(cst)
        this.ruleStack.push(ruleName)
        
        // ⭐ 核心：执行规则函数
        targetFun.apply(this)
        
        // 退出上下文
        this.cstStack.pop()
        this.ruleStack.pop()
        
        // 判断成功/失败
        if (this._parseSuccess) {
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
        if (!this._parseSuccess) {
            return undefined
        }
        
        // ⭐ 使用 withAllowError 自动管理状态
        return this.withAllowError(() => {
            // 保存 Or 进入时的状态（标准 PEG 做法）
            const savedState = this.saveState()
            const totalCount = alternatives.length
            
            for (let i = 0; i < totalCount; i++) {
                const alt = alternatives[i]
                const isLast = i === totalCount - 1
                
                // ⭐ 调试：记录 Or 分支尝试
                this._debugger?.onOrBranch?.(i, totalCount, this.tokenIndex)
                
                // ⭐ 核心：最后一个分支不允许错误
                if (isLast) {
                    this.allowErrorDepth--  // 临时减少深度，使 allowError 变为 false
                }
                
                // 尝试分支
                alt.alt()
                
                // ⭐ 恢复深度（如果是最后分支）
                if (isLast) {
                    this.allowErrorDepth++  // 恢复深度
                }
                
                // ⭐ 修复：只根据 _parseSuccess 判断，不依赖返回值
                if (this._parseSuccess) {
                    // ✅ 成功：返回当前CST（withAllowError 会自动清理）
                    return this.curCst
                }
                
                // ❌ 失败：回溯到 Or 进入时的状态
                if (!isLast) {
                    // 非最后分支：回溯 + 重置状态，继续尝试
                    this.restoreState(savedState, 'Or branch failed')
                    this._parseSuccess = true  // 重置失败状态
                } else {
                    // 最后分支：回溯，保持失败状态
                    this.restoreState(savedState, 'Or all branches failed')
                }
            }
            
            // 所有分支都失败
            return undefined
        })
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
        if (!this._parseSuccess) {
            return undefined
        }
        
        // ⭐ 使用 withAllowError 自动管理状态
        return this.withAllowError(() => {
            // 循环尝试，直到失败
            while (this.tryAndRestore(fn, 'Many iteration failed')) {
                // 继续循环
            }
            return this.curCst
        })
    }
    
    /**
     * Option 规则 - 0次或1次（总是成功）
     * 
     * 核心：允许错误（0次匹配合法）
     * 
     * 参考：EBNF [ ... ]
     */
    Option(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        // ⭐ 使用 withAllowError 自动管理状态
        return this.withAllowError(() => {
            // 尝试一次（成功或失败都继续）
            this.tryAndRestore(fn, 'Option failed')
            return this.curCst
        })
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
        if (!this._parseSuccess) {
            return undefined
        }
        
        // 第一次必须成功（不进入 allowError 上下文）
        fn()  // 执行函数
        if (!this._parseSuccess) {
            // 第一次失败：整个规则失败
            return undefined
        }
        
        // 后续：0次或多次（使用 withAllowError 自动管理状态）
        return this.withAllowError(() => {
            // 循环尝试，直到失败
            while (this.tryAndRestore(fn, 'AtLeastOne iteration failed')) {
                // 继续循环
            }
            return this.curCst
        })
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
    consume(tokenName: string): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        const token = this.curToken
        
        if (!token || token.tokenName !== tokenName) {
            // 失败：标记失败状态
            this._parseSuccess = false
            
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
    
    private restoreState(backData: SubhutiBackData, reason: string = 'backtrack'): void {
        const fromIndex = this.tokenIndex
        const toIndex = backData.tokenIndex
        
        // ⭐ 调试：记录回溯
        if (fromIndex !== toIndex) {
            this._debugger?.onBacktrack?.(fromIndex, toIndex, reason)
        }
        
        this.tokenIndex = backData.tokenIndex
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.length = backData.curCstChildrenLength
        }
    }
    
    /**
     * 尝试执行函数，失败时自动回溯并重置失败状态
     * 
     * 设计理念：
     * - 保存状态 → 执行函数 → 判断成功
     * - 失败时：回溯 + 重置失败状态
     * - 成功时：保持状态
     * 
     * 用途：简化 Many/Option/AtLeastOne 中的重复代码
     * 
     * @param fn - 要执行的函数
     * @param reason - 回溯原因（用于调试）
     * @returns 是否成功
     */
    private tryAndRestore(fn: () => void, reason: string = 'Try failed'): boolean {
        const savedState = this.saveState()
        fn()
        
        if (this._parseSuccess) {
            return true  // 成功
        }
        
        // 失败：回溯 + 重置
        this.restoreState(savedState, reason)
        this._parseSuccess = true
        return false
    }
    
    // ========================================
    // SubhutiPackratCache Parsing（委托给 SubhutiPackratCache）⭐
    // ========================================
    
    /**
     * 应用缓存结果（完整状态恢复）
     * 
     * 关键：必须恢复 parseSuccess 状态
     */
    private applyCachedResult(cached: SubhutiPackratCacheResult): SubhutiCst | undefined {
        // 恢复 token 位置
        this.tokenIndex = cached.endTokenIndex
        
        // 恢复 parseSuccess 状态（关键！）
        this._parseSuccess = cached.parseSuccess
        
        // 应用 CST 到父节点
        const parentCst = this.cstStack[this.cstStack.length - 1]
        if (cached.success && cached.cst && parentCst) {
            parentCst.children.push(cached.cst)
            return cached.cst
        }
        
        return undefined
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
    // 调试自动输出（⭐ 私有方法）
    // ========================================
    
    /**
     * 自动输出调试报告（私有方法）
     * 
     * 在顶层规则执行完成后自动调用
     * 输出内容：
     * 1. 性能摘要（总耗时、缓存命中率、Top 5 慢规则）
     * 2. 规则执行追踪（完整的执行过程）
     */
    private _autoOutputDebugReport(): void {
        if (!this._debugger) return
        
        const lines: string[] = []
        
        // 1. 性能摘要
        if ('getSummary' in this._debugger && typeof this._debugger.getSummary === 'function') {
            const summary = (this._debugger as any).getSummary()
            lines.push(summary)
            lines.push('')  // 空行分隔
        }
        
        // 2. 规则执行追踪
        if ('getTrace' in this._debugger && typeof this._debugger.getTrace === 'function') {
            lines.push('📋 规则执行追踪')
            lines.push('─'.repeat(40))
            const trace = (this._debugger as any).getTrace()
            lines.push(trace)
        }
        
        // 输出到控制台
        console.log('\n' + lines.join('\n'))
    }
}

// ============================================
// [4] 导出类型和类（供用户使用）
// ============================================

