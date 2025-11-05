/**
 * Subhuti Parser - 高性能 PEG Parser 框架
 * 
 * 核心特性：
 * - Packrat Parsing（线性时间复杂度，LRU 缓存）
 * - allowError 机制（Or 前 N-1 分支允许失败，最后分支抛详细错误）
 * - 返回值语义（成功返回 CST，失败返回 undefined）
 * 
 * @version 4.4.0
 */

import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"
import SubhutiCst from "./struct/SubhutiCst.ts";
import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";
import {SubhutiErrorHandler} from "./SubhutiError.ts";
import {type SubhutiDebugger, SubhutiTraceDebugger} from "./SubhutiDebug.ts";
import {SubhutiPackratCache, type SubhutiPackratCacheResult} from "./SubhutiPackratCache.ts";

// ============================================
// 类型定义
// ============================================

export type RuleFunction = () => SubhutiCst | undefined

export interface SubhutiParserOr {
    alt: RuleFunction
}

export interface SubhutiBackData {
    tokenIndex: number
    curCstChildrenLength: number
}

// ============================================
// 装饰器系统
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
    const className = context.metadata.className

    const wrappedFunction = function(): SubhutiCst | undefined {
        return this.executeRuleWrapper(targetFun, ruleName, className)
    }

    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})
    return wrappedFunction
}

export type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> = 
    new (parser: SubhutiParser<T>) => T

// ============================================
// SubhutiParser 核心类
// ============================================

export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {
    // 核心字段
    readonly tokenConsumer: T
    private readonly _tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    
    /**
     * 核心状态：当前规则是否成功
     * - true: 成功，继续执行
     * - false: 失败，停止并返回 undefined
     */
    private _parseSuccess = true
    
    private readonly cstStack: SubhutiCst[] = []
    private readonly ruleStack: string[] = []
    private readonly className: string
    
    // 调试和错误处理
    private _debugger?: SubhutiDebugger
    private readonly _errorHandler = new SubhutiErrorHandler()
    
    // allowError 机制（智能错误管理）
    /**
     * allowError 深度计数器
     * - 深度 > 0：允许错误（Or/Many/Option 内部）
     * - 深度 = 0：不允许错误（最后分支抛详细错误）
     */
    private allowErrorDepth = 0
    
    get allowError(): boolean {
        return this.allowErrorDepth > 0
    }
    
    get outerHasAllowError(): boolean {
        return this.allowErrorDepth > 1
    }
    
    /**
     * RAII 模式：自动管理 allowError 状态
     * - 进入时 allowErrorDepth++
     * - 退出时自动恢复（try-finally 保证）
     */
    private withAllowError<T>(fn: () => T): T {
        this.allowErrorDepth++
        try {
            return fn()
        } finally {
            this.allowErrorDepth--
        }
    }
    
    // Packrat Parsing（默认 LRU 缓存）
    enableMemoization: boolean = true
    private readonly _cache: SubhutiPackratCache
    
    constructor(
        tokens: SubhutiMatchToken[] = [],
        TokenConsumerClass?: SubhutiTokenConsumerConstructor<T>,
    ) {
        this._tokens = tokens
        this.tokenIndex = 0
        this.className = this.constructor.name
        this._cache = new SubhutiPackratCache()
        
        if (TokenConsumerClass) {
            this.tokenConsumer = new TokenConsumerClass(this)
        } else {
            this.tokenConsumer = new SubhutiTokenConsumer(this) as T
        }
    }
    
    // Getter
    get curCst(): SubhutiCst | undefined {
        return this.cstStack[this.cstStack.length - 1]
    }
    
    get curToken(): SubhutiMatchToken | undefined {
        return this._tokens[this.tokenIndex]
    }
    
    get isAtEnd(): boolean {
        return this.tokenIndex >= this._tokens.length
    }
    
    /**
     * 检查当前 token 前是否有换行符（用于 ECMAScript [no LineTerminator here] 限制）
     * 
     * 实现方式：直接读取 Lexer 在词法阶段计算好的 hasLineBreakBefore 属性（Babel 风格）
     * - 性能优势：词法阶段计算一次，语法阶段直接读取
     * - 代码简洁：一行代码，无需边界检查
     */
    hasLineTerminatorBefore(): boolean {
        return this.curToken?.hasLineBreakBefore ?? false
    }
    
    // 公开方法
    setTokens(tokens: SubhutiMatchToken[]): void {
        (this._tokens as SubhutiMatchToken[]).length = 0
        ;(this._tokens as SubhutiMatchToken[]).push(...tokens)
        this.tokenIndex = 0
        this._cache.clear()
    }
    
    // 功能开关（链式调用）
    cache(enable: boolean = true): this {
        this.enableMemoization = enable
        return this
    }
    
    debug(enable: boolean = true): this {
        if (enable) {
            this._debugger = new SubhutiTraceDebugger()
        } else {
            this._debugger = undefined
        }
        return this
    }
    
    errorHandler(enable: boolean = true): this {
        this._errorHandler.setDetailed(enable)
        return this
    }
    
    /**
     * 规则执行入口（由 @SubhutiRule 装饰器调用）
     * 职责：前置检查 → Packrat 缓存 → 核心执行 → 后置处理
     */
    private executeRuleWrapper(targetFun: Function, ruleName: string, className: string): SubhutiCst | undefined {
        const isTopLevel = this.cstStack.length === 0 && this.ruleStack.length === 0
        if (!this._preCheckRule(ruleName, className, isTopLevel)) {
            return undefined
        }
        
        const observeContext = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)
        
        // Packrat Parsing 缓存查询
        if (!isTopLevel && this.enableMemoization) {
            const cached = this._cache.get(ruleName, this.tokenIndex)
            if (cached !== undefined) {
                this._debugger?.onRuleExit(ruleName, cached.endTokenIndex, true, observeContext)
                const result = this.applyCachedResult(cached)
                if (result && !result.children?.length) {
                    result.children = undefined
                }
                return result
            }
        }
        
        // 核心执行
        const startTokenIndex = this.tokenIndex
        const cst = this.executeRuleCore(ruleName, targetFun)
        
        // 缓存存储
        if (!isTopLevel && this.enableMemoization) {
            this._cache.set(ruleName, startTokenIndex, {
                success: cst !== undefined,
                endTokenIndex: this.tokenIndex,
                cst: cst,
                parseSuccess: this._parseSuccess
            })
        }
        
        this._postProcessRule(ruleName, cst, isTopLevel, observeContext)
        
        return cst
    }
    
    private _preCheckRule(ruleName: string, className: string, isTopLevel: boolean): boolean {
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return false
            }
        }
        
        if (isTopLevel) {
            this._parseSuccess = true
            this.cstStack.length = 0
            this.ruleStack.length = 0
            this.allowErrorDepth = 0
            return true
        }
        
        return this._parseSuccess
    }
    
    private _postProcessRule(
        ruleName: string,
        cst: SubhutiCst | undefined,
        isTopLevel: boolean,
        observeContext: any
    ): void {
        if (cst && !cst.children?.length) {
            cst.children = undefined
        }
        
        if (!isTopLevel) {
            this._debugger?.onRuleExit(ruleName, this.tokenIndex, false, observeContext)
        } else {
            (this._debugger as any)?.autoOutput?.()
        }
    }
    
    /**
     * 执行规则函数核心逻辑
     * 职责：创建 CST → 执行规则 → 成功则添加到父节点
     */
    private executeRuleCore(ruleName: string, targetFun: Function): SubhutiCst | undefined {
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []
        
        this.cstStack.push(cst)
        this.ruleStack.push(ruleName)
        
        targetFun.apply(this)
        
        this.cstStack.pop()
        this.ruleStack.pop()
        
        if (this._parseSuccess) {
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cst)
            }
            
            this.setLocation(cst)
            return cst
        }
        
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
    
    /**
     * Or 规则 - 顺序选择（PEG 风格）
     * 核心：前 N-1 分支允许失败，最后分支抛详细错误
     */
    Or(alternatives: SubhutiParserOr[]): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        return this.withAllowError(() => {
            const savedState = this.saveState()
            const totalCount = alternatives.length
            
            for (let i = 0; i < totalCount; i++) {
                const alt = alternatives[i]
                const isLast = i === totalCount - 1
                
                this._debugger?.onOrBranch?.(i, totalCount, this.tokenIndex)
                
                if (isLast) {
                    this.allowErrorDepth--
                }
                
                alt.alt()
                
                if (isLast) {
                    this.allowErrorDepth++
                }
                
                if (this._parseSuccess) {
                    return this.curCst
                }
                
                if (!isLast) {
                    this.restoreState(savedState, 'Or branch failed')
                    this._parseSuccess = true
                } else {
                    this.restoreState(savedState, 'Or all branches failed')
                }
            }
            
            return undefined
        })
    }
    
    /**
     * Many 规则 - 0次或多次（EBNF { ... }）
     */
    Many(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        return this.withAllowError(() => {
            while (this.tryAndRestore(fn, 'Many iteration failed')) {
            }
            return this.curCst
        })
    }
    
    /**
     * Option 规则 - 0次或1次（EBNF [ ... ]）
     */
    Option(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        return this.withAllowError(() => {
            this.tryAndRestore(fn, 'Option failed')
            return this.curCst
        })
    }
    
    /**
     * AtLeastOne 规则 - 1次或多次（第一次必须成功）
     */
    AtLeastOne(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        fn()
        if (!this._parseSuccess) {
            return undefined
        }
        
        return this.withAllowError(() => {
            while (this.tryAndRestore(fn, 'AtLeastOne iteration failed')) {
            }
            return this.curCst
        })
    }
    
    /**
     * 消费 token（智能错误管理）
     * - allowError=true: 失败返回 undefined
     * - allowError=false: 失败抛详细错误
     */
    consume(tokenName: string): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }
        
        const token = this.curToken
        
        if (!token || token.tokenName !== tokenName) {
            this._parseSuccess = false
            
            this._debugger?.onTokenConsume(
                this.tokenIndex,
                token?.tokenValue || 'EOF',
                token?.tokenName || 'EOF',
                false
            )
            
            if (this.outerHasAllowError || this.allowError) {
                return undefined
            }
            
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
    
    // 回溯机制
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
     * 尝试执行函数，失败时自动回溯并重置状态
     */
    private tryAndRestore(fn: () => void, reason: string = 'Try failed'): boolean {
        const savedState = this.saveState()
        fn()
        
        if (this._parseSuccess) {
            return true
        }
        
        this.restoreState(savedState, reason)
        this._parseSuccess = true
        return false
    }
    
    /**
     * 应用缓存结果（恢复状态）
     */
    private applyCachedResult(cached: SubhutiPackratCacheResult): SubhutiCst | undefined {
        this.tokenIndex = cached.endTokenIndex
        this._parseSuccess = cached.parseSuccess
        
        const parentCst = this.cstStack[this.cstStack.length - 1]
        if (cached.success && cached.cst && parentCst) {
            parentCst.children.push(cached.cst)
            return cached.cst
        }
        
        return undefined
    }
}

