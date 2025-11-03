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
 * - ✅ 双数组结构（children + tokens 分离，O(1) 访问）
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

import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import SubhutiCst from "../struct/SubhutiCst.ts"
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import { PackratCache } from "./PackratCache.ts"
import type { PackratCacheConfig } from "./PackratCache.ts"

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
 * 回溯数据（支持双数组结构）
 */
export interface SubhutiBackData {
    tokenIndex: number                    // tokens 读取位置
    curCstChildrenLength: number          // children 数组长度
    curCstTokensLength: number            // tokens 数组长度
}

/**
 * Packrat Parsing 缓存结果（完整状态）
 */
export interface SubhutiMemoResult {
    success: boolean                      // 解析是否成功
    endTokenIndex: number                 // 解析结束位置
    cst?: SubhutiCst                      // 成功时的 CST 节点
    ruleSuccess: boolean                  // ruleSuccess 状态（必须缓存）
}

/**
 * 解析错误类（详细错误信息）
 */
export class ParsingError extends Error {
    readonly expected: string
    readonly found?: SubhutiMatchToken
    readonly position: {
        readonly index: number
        readonly line: number
        readonly column: number
    }
    readonly ruleStack: readonly string[]
    
    constructor(message: string, details: {
        expected: string
        found?: SubhutiMatchToken
        position: { index: number, line: number, column: number }
        ruleStack: string[]
    }) {
        super(message)
        this.name = 'ParsingError'
        this.expected = details.expected
        this.found = details.found
        this.position = details.position
        this.ruleStack = Object.freeze([...details.ruleStack])
    }
    
    toString(): string {
        const location = `line ${this.position.line}, column ${this.position.column}`
        const expected = `Expected: ${this.expected}`
        const found = `Found: ${this.found?.tokenName || 'EOF'}`
        const context = `Context: ${this.ruleStack.join(' → ')}`
        return `Parsing Error at ${location}\n${expected}\n${found}\n${context}`
    }
}

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
     * 核心状态标志：ruleSuccess
     * 
     * 语义：当前规则是否成功
     * - true: 可以继续执行后续规则
     * - false: 停止执行，返回失败
     */
    private _ruleSuccess = true
    
    /**
     * CST 构建栈（私有，通过 getter 访问）
     */
    private readonly cstStack: SubhutiCst[] = []
    
    /**
     * 规则调用栈（用于错误报告和调试）
     */
    private readonly ruleStack: string[] = []
    
    /**
     * 初始化标志（用于第一次调用规则）
     */
    private isFirstRule = true
    
    /**
     * 类名（用于装饰器）
     */
    private readonly className: string
    
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
     * allowError 栈（支持嵌套）
     * 
     * 场景：嵌套 Or 规则
     * - 外层 Or：允许错误
     * - 内层 Or：也允许错误
     * - 栈式管理，自动恢复
     */
    private readonly allowErrorStack: string[] = []
    
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
     * - 长度 > 1：有外层上下文
     * - 长度 = 1：当前层
     * - 长度 = 0：顶层
     */
    get outerHasAllowError(): boolean {
        return this.allowErrorStack.length > 1
    }
    
    /**
     * 进入新的 allowError 上下文
     * 
     * 调用时机：Or/Many/Option 入口
     */
    private setAllowErrorNewState(): void {
        this.setAllowError(true)
        const currentCst = this.curCst
        this.allowErrorStack.push(currentCst?.name || 'unknown')
    }
    
    /**
     * 退出 allowError 上下文，恢复上一层状态
     * 
     * 调用时机：Or/Many/Option 出口
     */
    private allowErrorStackPopAndReset(): void {
        this.allowErrorStack.pop()
        this.setAllowError(this.allowErrorStack.length > 0)
    }
    
    // ========================================
    // Packrat Parsing（可插拔缓存 - 默认 LRU）
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
     * Packrat 缓存实例
     * 
     * 默认配置：LRU(10000)
     * - 内存安全：自动淘汰最久未使用的条目
     * - 高性能：10000 条足够大多数文件
     * - 长时间运行：内存不会无限增长
     */
    private readonly memoCache: PackratCache
    
    /**
     * 缓存统计信息
     */
    private memoStats = {
        hits: 0,
        misses: 0,
        stores: 0
    }
    
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
        
        // ⭐ 初始化缓存（默认 LRU 10000）
        this.memoCache = new PackratCache(cacheConfig)
        
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
    get currentToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }
    
    /**
     * 是否已解析完所有 token
     */
    get isAtEnd(): boolean {
        return this.tokenIndex >= this._tokens.length
    }
    
    /**
     * 规则成功状态（只读）
     */
    get ruleSuccess(): boolean {
        return this._ruleSuccess
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
        this.clearMemoCache()
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
        // 确定是本类的方法
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return undefined
            }
        }
        
        // 初始化检查
        if (this.isFirstRule) {
            this.isFirstRule = false
            this._ruleSuccess = true
            this.cstStack.length = 0
            this.ruleStack.length = 0
            this.allowErrorStack.length = 0
        } else {
            // 失败检查（快速返回）
            if (!this._ruleSuccess) {
                return undefined
            }
            
            // Packrat: 查询缓存
            if (this.enableMemoization) {
                const cached = this.getMemoized(ruleName, this.tokenIndex)
                if (cached !== undefined) {
                    this.memoStats.hits++
                    return this.applyMemoizedResult(cached)
                }
                this.memoStats.misses++
            }
        }
        
        // 执行规则
        const startTokenIndex = this.tokenIndex
        const wasFirstRule = this.isFirstRule
        const cst = this.processCst(ruleName, targetFun)
        
        // 恢复初始化标志
        if (wasFirstRule) {
            this.isFirstRule = true
        } else {
            // Packrat: 存储缓存
            if (this.enableMemoization) {
                this.storeMemoized(ruleName, startTokenIndex, cst, this.tokenIndex, this._ruleSuccess)
            }
            
            // 清理空数组（优化）
            if (cst) {
                if (!cst.children?.length) cst.children = undefined
                if (!cst.tokens?.length) cst.tokens = undefined
            }
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
        cst.tokens = []  // 双数组结构（快速访问）
        
        // 进入上下文
        this.cstStack.push(cst)
        this.ruleStack.push(ruleName)
        
        // 执行规则函数
        targetFun.apply(this)
        
        // 退出上下文
        this.cstStack.pop()
        this.ruleStack.pop()
        
        // 判断成功/失败
        if (this._ruleSuccess) {
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
        if (!this._ruleSuccess) {
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
            const result = alt.alt()
            
            // 判断成功（返回值 + 状态标志）
            if (result !== undefined && this._ruleSuccess) {
                // ✅ 成功：退出 allowError 上下文，返回结果
                this.allowErrorStackPopAndReset()
                return result
            }
            
            // ❌ 失败：回溯到 Or 进入时的状态
            if (!isLast) {
                // 非最后分支：回溯 + 重置状态，继续尝试
                this.restoreState(savedState)
                this._ruleSuccess = true
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
        if (!this._ruleSuccess) {
            return undefined
        }
        
        // 进入 allowError 上下文
        this.setAllowErrorNewState()
        
        while (true) {
            const savedState = this.saveState()
            const result = fn()
            
            if (!result || !this._ruleSuccess) {
                // 失败：回溯，退出循环
                this.restoreState(savedState)
                this._ruleSuccess = true  // Many 总是成功
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
        if (!this._ruleSuccess) {
            return undefined
        }
        
        // 进入 allowError 上下文
        this.setAllowErrorNewState()
        
        const savedState = this.saveState()
        const result = fn()
        
        if (!result || !this._ruleSuccess) {
            // 失败：回溯，重置状态
            this.restoreState(savedState)
            this._ruleSuccess = true  // Option 总是成功
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
        if (!this._ruleSuccess) {
            return undefined
        }
        
        // 第一次必须成功（不进入 allowError 上下文）
        const firstResult = fn()
        if (!firstResult || !this._ruleSuccess) {
            // 第一次失败：整个规则失败
            return undefined
        }
        
        // 后续：0次或多次（进入 allowError 上下文）
        this.setAllowErrorNewState()
        
        while (true) {
            const savedState = this.saveState()
            const result = fn()
            
            if (!result || !this._ruleSuccess) {
                // 失败：回溯，退出循环
                this.restoreState(savedState)
                this._ruleSuccess = true  // 至少成功1次，整体成功
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
     * 参考：旧版 OldSubhutiParser1.ts 的精妙设计
     */
    consumeToken(tokenName: string): SubhutiCst | undefined {
        if (!this._ruleSuccess) {
            return undefined
        }
        
        const token = this.currentToken
        
        if (!token || token.tokenName !== tokenName) {
            // 失败：设置标志
            this._ruleSuccess = false
            
            // ⭐ 核心：根据 allowError 决定行为
            if (this.outerHasAllowError || this.allowError) {
                // 允许失败：返回 undefined（不抛异常）
                return undefined
            }
            
            // 不允许失败：抛出详细错误
            throw new ParsingError(
                `Expected ${tokenName}`,
                {
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
                }
            )
        }
        
        // 成功：消费 token
        this._ruleSuccess = true
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
        
        // 添加到当前 CST（双数组）
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.push(cst)
            currentCst.pushCstToken(token)
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
            curCstChildrenLength: currentCst?.children?.length || 0,
            curCstTokensLength: currentCst?.tokens?.length || 0
        }
    }
    
    private restoreState(backData: SubhutiBackData): void {
        this.tokenIndex = backData.tokenIndex
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.length = backData.curCstChildrenLength
            currentCst.tokens.length = backData.curCstTokensLength
        }
    }
    
    // ========================================
    // Packrat Parsing（标准实现）
    // ========================================
    
    private getMemoized(ruleName: string, tokenIndex: number): SubhutiMemoResult | undefined {
        return this.memoCache.get(ruleName, tokenIndex)
    }
    
    /**
     * 应用缓存结果（完整状态恢复）
     * 
     * 关键：必须恢复 ruleSuccess 状态
     */
    private applyMemoizedResult(cached: SubhutiMemoResult): SubhutiCst | undefined {
        // 恢复 token 位置
        this.tokenIndex = cached.endTokenIndex
        
        // 恢复 ruleSuccess 状态（关键！）
        this._ruleSuccess = cached.ruleSuccess
        
        if (cached.success && cached.cst) {
            // 添加到父节点
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cached.cst)
            }
            return cached.cst
        }
        
        return undefined
    }
    
    /**
     * 存储缓存（完整状态）
     * 
     * 关键：必须缓存 ruleSuccess 状态
     */
    private storeMemoized(
        ruleName: string,
        startTokenIndex: number,
        cst: SubhutiCst | undefined,
        endTokenIndex: number,
        ruleSuccess: boolean
    ): void {
        this.memoCache.set(ruleName, startTokenIndex, {
            success: cst !== undefined,
            endTokenIndex: endTokenIndex,
            cst: cst,
            ruleSuccess: ruleSuccess  // 缓存状态标志
        })
        
        this.memoStats.stores++
    }
    
    /**
     * 清空所有缓存
     * 
     * 使用场景：
     * - 解析新文件前（通过 setTokens 自动调用）
     * - 手动清理内存
     * - 测试重置
     */
    clearMemoCache(): void {
        this.memoCache.clear()
        this.memoStats = { hits: 0, misses: 0, stores: 0 }
    }
    
    /**
     * 获取 Packrat Parsing 详细统计信息
     * 
     * 用途：
     * - 评估缓存效率（命中率）
     * - 监控内存使用（估算）
     * - 性能调优依据（智能建议）
     * 
     * 返回信息：
     * - 基础统计：hits、misses、命中率
     * - 缓存信息：规则数、总条目、平均条目
     * - 内存估算：字节、KB、MB
     * - 性能建议：根据数据自动生成
     * 
     * @returns 详细的缓存统计和性能建议
     */
    getMemoStats() {
        const total = this.memoStats.hits + this.memoStats.misses
        const hitRate = total > 0 ? (this.memoStats.hits / total * 100).toFixed(1) : '0.0'
        const hitRateNum = parseFloat(hitRate)
        
        const cacheSize = this.memoCache.size
        const totalEntries = this.memoCache.getTotalEntries()
        const avgEntriesPerRule = cacheSize > 0 ? (totalEntries / cacheSize).toFixed(1) : '0'
        
        // ✅ 内存估算
        // 假设：每个缓存条目平均占用 150 字节
        // - SubhutiMemoResult 结构：~50 字节
        // - CST 引用：~100 字节（平均）
        const estimatedBytes = totalEntries * 150
        const estimatedKB = (estimatedBytes / 1024).toFixed(2)
        const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(2)
        
        // ✅ 性能建议（智能分析）
        const suggestions: string[] = []
        
        if (hitRateNum >= 70) {
            suggestions.push('✅ 缓存命中率优秀（≥ 70%）')
        } else if (hitRateNum >= 50) {
            suggestions.push('✅ 缓存命中率良好（50-70%）')
        } else if (hitRateNum >= 30) {
            suggestions.push('⚠️ 缓存命中率偏低（30-50%），可能语法复杂')
        } else {
            suggestions.push('❌ 缓存命中率低（< 30%），建议检查语法规则')
        }
        
        // 检查缓存使用率（假设 LRU 默认 10000）
        if (totalEntries > 9000) {
            suggestions.push('⚠️ 缓存使用率高（> 90%），建议增加 maxSize')
        } else if (totalEntries > 7000) {
            suggestions.push('⚠️ 缓存使用率较高（70-90%），可考虑增加 maxSize')
        }
        
        if (totalEntries < 1000 && total > 10000) {
            suggestions.push('💡 缓存使用率低，可考虑减小 maxSize 节省内存')
        }
        
        return {
            // 基础统计
            hits: this.memoStats.hits,
            misses: this.memoStats.misses,
            stores: this.memoStats.stores,
            total,
            hitRate: `${hitRate}%`,
            
            // 缓存信息
            cacheSize,
            totalEntries,
            avgEntriesPerRule,
            
            // ✅ 新增：内存估算
            estimatedMemory: {
                bytes: estimatedBytes,
                kb: estimatedKB,
                mb: estimatedMB
            },
            
            // ✅ 新增：性能建议
            suggestions
        }
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
    
    /**
     * 代码生成（遍历 CST）
     */
    exec(cst: SubhutiCst | undefined = this.curCst, code = ''): string {
        if (!cst) return code.trim()
        
        if (cst.value) {
            code = (' ' + code + ' ' + cst.value)
        } else {
            if (cst.children) {
                const childrenCode = cst.children
                    .map(child => this.exec(child, code))
                    .join(' ')
                code = (code + ' ' + childrenCode)
            }
        }
        return code.trim()
    }
}

// ============================================
// [4] 导出配置类型（供高级用户使用）
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
export type { PackratCacheConfig } from "./PackratCache.ts"
