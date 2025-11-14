/**
 * Subhuti Parser - 高性能 PEG Parser 框架
 *
 * 核心特性：
 * - Packrat Parsing（线性时间复杂度，LRU 缓存）
 * - allowError 机制（Or 前 N-1 分支允许失败，最后分支抛详细错误）
 * - 返回值语义（成功返回 CST，失败返回 undefined）
 *
 * 架构设计：
 * - 继承 SubhutiTokenLookahead（前瞻能力）
 * - 实现 ITokenConsumerContext（提供消费接口）
 * - 支持泛型扩展 SubhutiTokenConsumer
 *
 * @version 5.0.0
 */

import SubhutiTokenLookahead from "./SubhutiTokenLookahead.ts"
import SubhutiCst from "./struct/SubhutiCst.ts";
import type SubhutiMatchToken from "./struct/SubhutiMatchToken.ts";
import {SubhutiErrorHandler} from "./SubhutiError.ts";
import {SubhutiTraceDebugger} from "./SubhutiDebug.ts";
import {SubhutiPackratCache, type SubhutiPackratCacheResult} from "./SubhutiPackratCache.ts";
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts";

// Grammar Validation
import {SubhutiGrammarValidator} from "./validation/SubhutiGrammarValidator";

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

export function Subhuti<E extends SubhutiTokenLookahead, T extends new (...args: any[]) => SubhutiParser<E>>(
    target: T,
    context: ClassDecoratorContext
) {
    context.metadata.className = target.name
    return target
}

export function SubhutiRule(targetFun: any, context: ClassMethodDecoratorContext) {
    const ruleName = targetFun.name
    const className = context.metadata.className

    const wrappedFunction = function (): SubhutiCst | undefined {
        return this.executeRuleWrapper(targetFun, ruleName, className)
    }

    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})
    return wrappedFunction
}

export type SubhutiTokenConsumerConstructor<T extends SubhutiTokenConsumer> =
    new (parser: SubhutiParser) => T

/**
 * Parser 构造选项
 */
export interface SubhutiParserOptions<T extends SubhutiTokenConsumer = SubhutiTokenConsumer> {
    /** TokenConsumer 类（可选） */
    tokenConsumer?: SubhutiTokenConsumerConstructor<T>
}

// ============================================
// SubhutiParser 核心类
// ============================================

export default class SubhutiParser<T extends SubhutiTokenConsumer = SubhutiTokenConsumer>
    extends SubhutiTokenLookahead {
    // 核心字段
    readonly tokenConsumer: T

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
    private _debugger?: SubhutiTraceDebugger
    private readonly _errorHandler = new SubhutiErrorHandler()

    // 无限循环检测（调用栈状态检测）
    /**
     * 循环检测集合：O(1) 检测 (rule, position) 是否重复
     * 格式: "ruleName:position"
     */
    private readonly loopDetectionSet: Set<string> = new Set()

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
        optionsOrConsumer?: SubhutiTokenConsumerConstructor<T> | SubhutiParserOptions<T>,
    ) {
        super() // 调用父类构造函数
        this._tokens = tokens  // 赋值给父类的 _tokens
        this.tokenIndex = 0    // 赋值给父类的 tokenIndex
        this.className = this.constructor.name
        this._cache = new SubhutiPackratCache()

        // 解析参数（向后兼容）
        let TokenConsumerClass: SubhutiTokenConsumerConstructor<T> | undefined

        if (optionsOrConsumer) {
            // 判断是 Class 还是 Options 对象
            if (typeof optionsOrConsumer === 'function') {
                // 旧方式：直接传入 Class
                TokenConsumerClass = optionsOrConsumer
            } else {
                // 新方式：传入 options 对象
                TokenConsumerClass = optionsOrConsumer.tokenConsumer
            }
        }

        if (TokenConsumerClass) {
            this.tokenConsumer = new TokenConsumerClass(this)
        } else {
            this.tokenConsumer = new SubhutiTokenConsumer(this) as T
        }

        // 开发环境自动语法验证
        // @ts-ignore - Node.js 环境变量检查
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            this.validateGrammar()  // 静态方法验证
        }
    }

    // ============================================
    // 公开给 TokenConsumer 使用的方法
    // ============================================

    /**
     * 供 TokenConsumer 使用的 consume 方法
     */
    _consumeToken(tokenName: string): SubhutiCst | undefined {
        return this.consume(tokenName)
    }

    // ============================================
    // Parser 内部 Getter
    // ============================================

    get curCst(): SubhutiCst | undefined {
        return this.cstStack[this.cstStack.length - 1]
    }

    // 公开方法
    setTokens(tokens: SubhutiMatchToken[]): void {
        this._tokens.length = 0
        this._tokens.push(...tokens)
        this.tokenIndex = 0
        this._cache.clear()
    }

    // 功能开关（链式调用）
    cache(enable: boolean = true): this {
        this.enableMemoization = enable
        return this
    }

    debug(): this {
        this._debugger = new SubhutiTraceDebugger(this._tokens)
        return this
    }

    errorHandler(enable: boolean = true): this {
        this._errorHandler.setDetailed(enable)
        return this
    }

    /**
     * 抛出循环错误信息
     *
     * @param ruleName 当前规则名称
     */
    private throwLoopError(ruleName: string): never {
        // 获取当前 token 信息
        const currentToken = this.curToken

        // 获取 token 上下文（前后各 2 个）
        const tokenContext: SubhutiMatchToken[] = []
        const contextRange = 2
        for (let i = Math.max(0, this.tokenIndex - contextRange);
             i <= Math.min(this._tokens.length - 1, this.tokenIndex + contextRange);
             i++) {
            if (this._tokens[i]) {
                tokenContext.push(this._tokens[i])
            }
        }

        // 获取缓存统计
        const cacheStatsReport = this._cache.getStatsReport()

        // 创建循环错误（平铺结构）
        throw this._errorHandler.createError({
            type: 'loop',
            expected: '', // 循环错误不需要 expected
            found: currentToken,
            position: currentToken ? {
                index: currentToken.index || 0,
                line: currentToken.rowNum || 0,
                column: currentToken.columnStartNum || 0
            } : {
                index: this._tokens[this._tokens.length - 1]?.index || 0,
                line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
            },
            ruleStack: [...this.ruleStack],
            // Loop 专用字段（平铺）
            loopRuleName: ruleName,
            loopDetectionSet: Array.from(this.loopDetectionSet),
            loopCstDepth: this.cstStack.length,
            loopCacheStats: {
                hits: cacheStatsReport.hits,
                misses: cacheStatsReport.misses,
                hitRate: cacheStatsReport.hitRate,
                currentSize: cacheStatsReport.currentSize
            },
            loopTokenContext: tokenContext
        })
    }

    /**
     * 规则执行入口（由 @SubhutiRule 装饰器调用）
     * 职责：前置检查 → 顶层/非顶层分支 → Packrat 缓存 → 核心执行 → 后置处理
     */
    private executeRuleWrapper(targetFun: Function, ruleName: string, className: string): SubhutiCst | undefined {
        const isTopLevel = this.cstStack.length === 0 && this.ruleStack.length === 0
        if (!this._preCheckRule(ruleName, className, isTopLevel)) {
            return undefined
        }

        // 顶层规则：直接执行（无需缓存和循环检测）
        if (isTopLevel) {
            const startTime = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)
            const cst = this.executeRuleCore(ruleName, targetFun)
            this.onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime)
            return cst
        }

        // 非顶层规则：缓存 + 循环检测
        return this.executeRuleWithCacheAndLoopDetection(ruleName, targetFun)
    }

    /**
     * 非顶层规则执行（带缓存和循环检测）
     * 职责：循环检测 → Packrat 缓存查询 → 核心执行 → 缓存存储
     *
     * ✅ RAII 模式：自动管理循环检测（进入检测、执行、退出清理）
     */
    private executeRuleWithCacheAndLoopDetection(ruleName: string, targetFun: Function): SubhutiCst | undefined {
        const key = `${ruleName}:${this.tokenIndex}`

        // O(1) 快速检测是否重复
        if (this.loopDetectionSet.has(key)) {
            // 发现循环！抛出错误
            this.throwLoopError(ruleName)
        }

        // 入栈
        this.loopDetectionSet.add(key)

        try {
            const startTime = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)

            // Packrat Parsing 缓存查询
            if (this.enableMemoization) {
                const cached = this._cache.get(ruleName, this.tokenIndex)
                if (cached !== undefined) {
                    this._debugger?.onRuleExit(ruleName, true, startTime)
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
            if (this.enableMemoization) {
                this._cache.set(ruleName, startTokenIndex, {
                    success: cst !== undefined,
                    endTokenIndex: this.tokenIndex,
                    cst: cst,
                    parseSuccess: this._parseSuccess
                })
            }

            this.onRuleExitDebugHandler(ruleName, cst, false, startTime)

            return cst
        } finally {
            // 出栈（无论成功、return、异常都会执行）
            this.loopDetectionSet.delete(key)
        }
    }

    private _preCheckRule(ruleName: string, className: string, isTopLevel: boolean): boolean {
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return false
            }
        }

        // 【顶层规则开始】重置解析器状态
        if (isTopLevel) {
            // 重置 Parser 的内部状态
            this._parseSuccess = true
            this.cstStack.length = 0
            this.ruleStack.length = 0
            this.allowErrorDepth = 0
            this.loopDetectionSet.clear()

            // ============================================
            // 【新增】重置调试器的缓存和统计
            // ============================================
            // 这样每次新的顶层解析都有干净的环境
            this._debugger?.resetForNewParse?.(this._tokens)

            return true
        }

        // 非顶层规则继续执行
        return this._parseSuccess
    }

    private onRuleExitDebugHandler(
        ruleName: string,
        cst: SubhutiCst | undefined,
        isTopLevel: boolean,
        startTime?: number
    ): void {
        if (cst && !cst.children?.length) {
            cst.children = undefined
        }

        if (!isTopLevel) {
            this._debugger?.onRuleExit(ruleName, false, startTime)
        } else {
            // 顶层规则完成，输出调试信息
            if (this._debugger) {
                if ('setCst' in this._debugger) {
                    (this._debugger as any).setCst(cst)
                }
                (this._debugger as any)?.autoOutput?.()
            }
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
            const parentRuleName = this.curCst?.name || 'Unknown'

            // 进入 Or（整个 Or 调用开始）
            this._debugger?.onOrEnter?.(parentRuleName, this.tokenIndex)

            for (let i = 0; i < totalCount; i++) {
                const alt = alternatives[i]
                const isLast = i === totalCount - 1

                // 进入 Or 分支
                this._debugger?.onOrBranch?.(i, totalCount, parentRuleName)

                if (isLast) {
                    this.allowErrorDepth--
                }

                alt.alt()

                if (isLast) {
                    this.allowErrorDepth++
                }

                // 退出 Or 分支（无论成功还是失败）
                this._debugger?.onOrBranchExit?.(parentRuleName, i)

                if (this._parseSuccess) {
                    // 退出 Or（整个 Or 调用成功结束）
                    this._debugger?.onOrExit?.(parentRuleName)
                    return this.curCst
                }

                if (!isLast) {
                    this.restoreState(savedState)
                    this._parseSuccess = true
                } else {
                    this.restoreState(savedState)
                }
            }

            // 退出 Or（整个 Or 调用失败结束）
            this._debugger?.onOrExit?.(parentRuleName)
            return undefined
        })
    }

    /**
     * Many 规则 - 0次或多次（EBNF { ... }）
     *
     * ⚠️ 使用默认 checkLoop: true，自动检测循环
     */
    Many(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }

        return this.withAllowError(() => {
            while (this.tryAndRestore(fn)) {
                // 使用默认 checkLoop: true，自动检测循环
            }
            return this.curCst
        })
    }

    /**
     * Option 规则 - 0次或1次（EBNF [ ... ]）
     *
     * ⚠️ 注意：Option 允许成功但不消费 token（匹配 0 次），不检测循环
     */
    Option(fn: RuleFunction): SubhutiCst | undefined {
        if (!this._parseSuccess) {
            return undefined
        }

        return this.withAllowError(() => {
            // checkLoop: false - Option 允许匹配 0 次（不消费 token）
            this.tryAndRestore(fn, false)
            return this.curCst
        })
    }

    /**
     * AtLeastOne 规则 - 1次或多次（第一次必须成功）
     *
     * ⚠️ 使用默认 checkLoop: true，自动检测循环
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
            while (this.tryAndRestore(fn)) {
                // 使用默认 checkLoop: true，自动检测循环
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
                tokenName,
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
            token?.tokenValue,
            token?.tokenName,
            tokenName,
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

    private restoreState(backData: SubhutiBackData): void {
        const fromIndex = this.tokenIndex
        const toIndex = backData.tokenIndex

        if (fromIndex !== toIndex) {
            this._debugger?.onBacktrack?.(fromIndex, toIndex)
        }

        this.tokenIndex = backData.tokenIndex
        const currentCst = this.curCst
        if (currentCst) {
            currentCst.children.length = backData.curCstChildrenLength
        }
    }

    /**
     * 尝试执行函数，失败时自动回溯并重置状态
     *
     * @param fn 要执行的函数
     * @param checkLoop 是否检测循环（成功但不消费 token）
     *                  - true: 检测循环，用于 Many/AtLeastOne（防止无限循环）
     *                  - false: 不检测，用于 Option（允许匹配 0 次）
     */
    private tryAndRestore(fn: () => void, checkLoop: boolean = true): boolean {
        const savedState = this.saveState()
        const startTokenIndex = this.tokenIndex

        fn()

        if (this._parseSuccess) {
            // ✅ 成功：检查是否需要验证循环
            if (checkLoop && this.tokenIndex === startTokenIndex) {
                // ❌ 成功但没消费 token → 在 Many/AtLeastOne 中会无限循环
                const currentRuleName = this.ruleStack[this.ruleStack.length - 1] || 'Unknown'
                throw this._errorHandler.createError({
                    type: 'loop',
                    expected: '',
                    found: this.curToken,
                    position: this.curToken ? {
                        index: this.curToken.index || 0,
                        line: this.curToken.rowNum || 0,
                        column: this.curToken.columnStartNum || 0
                    } : {
                        index: this._tokens[this._tokens.length - 1]?.index || 0,
                        line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                        column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
                    },
                    ruleStack: [...this.ruleStack],
                    loopRuleName: currentRuleName,
                    loopDetectionSet: Array.from(this.loopDetectionSet),
                    loopCstDepth: this.cstStack.length,
                    loopCacheStats: {
                        hits: 0,
                        misses: 0,
                        hitRate: '0%',
                        currentSize: 0
                    },
                    loopTokenContext: []
                })
            }
            return true
        }

        // ❌ 失败：回溯
        this.restoreState(savedState)
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

    // ============================================
    // Grammar Validation API
    // ============================================

    /**
     * 验证语法（检测 Or 规则冲突）
     *
     * 有问题直接抛异常，无问题静默返回
     *
     * @example
     * ```typescript
     * const parser = new MyParser()
     * parser.validateGrammar()  // 有问题会抛 SubhutiGrammarValidationError
     * ```
     */
    validateGrammar(): void {
        SubhutiGrammarValidator.validate(this)
    }

    /**
     * 执行语法自检（Chevrotain 风格别名）
     *
     * @see validateGrammar
     */
    performSelfAnalysis(): void {
        this.validateGrammar()
    }
}

