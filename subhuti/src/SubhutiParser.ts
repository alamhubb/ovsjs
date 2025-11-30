/**
 * Subhuti Parser - 高性能 PEG Parser 框架
 *
 * 核心特性：
 * - Packrat Parsing（线性时间复杂度，LRU 缓存）
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
import {SubhutiErrorHandler, ParsingError} from "./SubhutiError.ts";
import {SubhutiTraceDebugger} from "./SubhutiDebug.ts";
import {SubhutiPackratCache, type SubhutiPackratCacheResult} from "./SubhutiPackratCache.ts";
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts";
import {SubhutiDebugRuleTracePrint} from "./SubhutiDebugRuleTracePrint.ts";

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

/**
 * 部分匹配记录（用于容错模式）
 * 在回溯时记录已消费 token 的 CST 结构
 */
export interface PartialMatchRecord {
    children: SubhutiCst[]    // 部分匹配的 children（引用）
    parentCst: SubhutiCst     // 父节点（恢复时把 children 放到这里）
    endTokenIndex: number     // 消耗到的 token 位置
    startTokenIndex: number   // 起始 token 位置
}

/**
 * 解析记录树节点（用于容错模式）
 * 只增不删，记录所有解析尝试路径
 */
export interface ParseRecordNode {
    name: string                  // 规则名或 token 名
    children: ParseRecordNode[]   // 子节点（只增不删）
    startTokenIndex: number       // 该节点开始的 token 位置
    endTokenIndex: number         // 该节点消耗到的 token 位置
    token?: SubhutiMatchToken     // 如果是 token 叶子节点
    value?: string                // token 值
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

    const wrappedFunction = function (...args: any[]): SubhutiCst | undefined {
        return this.executeRuleWrapper(targetFun, ruleName, className, ...args)
    }

    Object.defineProperty(wrappedFunction, 'name', {value: ruleName})

    // ✅ 保存原始函数引用（供 SubhutiRuleCollector 使用）
    Object.defineProperty(wrappedFunction, '__originalFunction__', {
        value: targetFun,
        writable: false,
        enumerable: false,
        configurable: false
    })

    // ✅ 添加元数据标记，标识这是一个规则方法
    Object.defineProperty(wrappedFunction, '__isSubhutiRule__', {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    })

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

    private readonly cstStack: SubhutiCst[] = []
    private readonly className: string

    /**
     * 分析模式标志
     * - true: 分析模式（用于语法验证，不抛异常）
     * - false: 正常模式（用于解析，抛异常）
     */
    private _analysisMode: boolean = false

    /**
     * 容错模式标志
     * - true: 启用容错（解析失败时跳过 token 继续解析）
     * - false: 不启用容错（解析失败时停止）
     */
    private _errorRecoveryMode: boolean = false

    /**
     * 同步点 Token 名称集合
     * 这些 token 通常是语句的开始，用于容错模式下的恢复点
     */
    protected _syncTokens: Set<string> = new Set([
        'LetTok', 'ConstTok', 'VarTok',
        'FunctionTok', 'ClassTok', 'AsyncTok',
        'IfTok', 'ForTok', 'WhileTok', 'DoTok', 'SwitchTok',
        'TryTok', 'ThrowTok', 'ReturnTok', 'BreakTok', 'ContinueTok',
        'ImportTok', 'ExportTok',
        'DebuggerTok',
        'Semicolon',
    ])

    /**
     * 设置同步点 Token
     */
    setSyncTokens(tokens: string[]): this {
        this._syncTokens = new Set(tokens)
        return this
    }

    /**
     * 添加同步点 Token
     */
    addSyncTokens(tokens: string[]): this {
        for (const token of tokens) {
            this._syncTokens.add(token)
        }
        return this
    }

    /**
     * 启用容错模式
     */
    enableErrorRecovery(): this {
        this._errorRecoveryMode = true
        return this
    }

    /**
     * 获取容错模式状态
     */
    get errorRecoveryMode(): boolean {
        return this._errorRecoveryMode
    }

    getRuleStack() {
        return this.cstStack.map(item => item.name)
    }

    // 调试和错误处理
    private _debugger?: SubhutiTraceDebugger
    private readonly _errorHandler = new SubhutiErrorHandler()

    // 无限循环检测（调用栈状态检测）
    /**
     * 循环检测集合：O(1) 检测 (rule, position) 是否重复
     * 格式: "ruleName:position"
     */
    private readonly loopDetectionSet: Set<string> = new Set()

    // Packrat Parsing（默认 LRU 缓存）
    enableMemoization: boolean = true
    private readonly _cache: SubhutiPackratCache

    /**
     * 部分匹配候选列表（容错模式专用）
     * 记录在回溯时被删除但消费了 token 的 CST 片段
     */
    private _partialMatchCandidates: PartialMatchRecord[] = []

    /**
     * 未被解析的 tokens 列表（容错模式专用）
     * 用于最终判断解析是否完全成功
     */
    private _unparsedTokens: SubhutiMatchToken[] = []

    // ============================================
    // 解析记录树相关（容错模式专用）
    // ============================================

    /** 解析记录树根节点 */
    private _parseRecordRoot: ParseRecordNode | null = null

    /** 解析记录树节点栈（跟踪当前路径） */
    private _parseRecordStack: ParseRecordNode[] = []

    /**
     * 获取未被解析的 tokens 列表
     */
    get unparsedTokens(): SubhutiMatchToken[] {
        return this._unparsedTokens
    }

    /**
     * 是否有未被解析的 tokens
     */
    get hasUnparsedTokens(): boolean {
        return this._unparsedTokens.length > 0
    }

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

    /**
     * 供 TokenConsumer 使用的标记解析失败方法
     * 用于软关键字检查失败时标记解析失败
     */
    _markParseFail(): void {
        this._parseSuccess = false
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
     * 启用分析模式（用于语法验证，不抛异常）
     *
     * 在分析模式下：
     * - 不抛出左递归异常
     * - 不抛出无限循环异常
     * - 不抛出 Token 消费失败异常
     * - 不抛出 EOF 检测异常
     *
     * @internal 仅供 SubhutiRuleCollector 使用
     */
    enableAnalysisMode(): void {
        this._analysisMode = true
    }

    /**
     * 禁用分析模式（恢复正常模式）
     *
     * @internal 仅供 SubhutiRuleCollector 使用
     */
    disableAnalysisMode(): void {
        this._analysisMode = false
    }

    /**
     * 启用语法验证（链式调用），验证语法（检测 Or 规则冲突）
     *
     * 用法：
     * ```typescript
     * const parser = new Es2025Parser(tokens).validate()
     * const cst = parser.Script()
     * ```
     *
     * @returns this - 支持链式调用
     * @throws SubhutiGrammarValidationError - 语法有冲突时抛出
     */
    validate(): this {
        SubhutiGrammarValidator.validate(this)
        return this
    }

    /**
     * 检测是否是直接或间接左递归
     *
     * ✅ 这个方法可以准确判断左递归
     * ❌ 不能判断是否是 Or 分支遮蔽（返回 false 只表示不是左递归）
     *
     * @param ruleName 当前规则名称
     * @param ruleStack 规则调用栈
     * @returns true: 确定是左递归, false: 不是左递归（但不能确定是什么问题）
     */
    private isDirectLeftRecursion(ruleName: string, ruleStack: string[]): boolean {
        // 检查规则栈中是否有任何规则出现了 >= 2 次
        // 这可以检测直接左递归和间接左递归

        const ruleCounts = new Map<string, number>()

        for (const rule of ruleStack) {
            ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1)
        }

        // 如果任何规则出现 >= 2 次，说明有递归
        for (const count of ruleCounts.values()) {
            if (count >= 2) {
                return true  // ✅ 确定是左递归（直接或间接）
            }
        }

        // 否则，不是左递归
        // 但可能是其他问题：Or 分支遮蔽、规则实现错误、语法错误等
        return false  // ❌ 不是左递归（但不确定具体是什么问题）
    }

    /**
     * 抛出循环错误信息
     *
     * @param ruleName 当前规则名称
     */
    private throwLoopError(ruleName: string): never {
        // 🔍 分析模式：不抛异常，直接返回
        if (this._analysisMode) {
            // 标记解析失败，让 RuleCollector 知道这个规则有问题
            this._parseSuccess = false
            return undefined as never
        }

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

        // 🔍 分析循环类型：真正的左递归 vs Or 分支遮蔽
        const ruleStack = this.getRuleStack()
        const isDirectLeftRecursion = this.isDirectLeftRecursion(ruleName, ruleStack)
        const errorType = isDirectLeftRecursion ? 'left-recursion' : 'or-branch-shadowing'

        // 创建循环错误（平铺结构）
        throw this._errorHandler.createError({
            type: errorType,
            expected: '',
            found: currentToken,
            position: currentToken ? {
                tokenIndex: this.tokenIndex,
                charIndex: currentToken.index || 0,
                line: currentToken.rowNum || 0,
                column: currentToken.columnStartNum || 0
            } : {
                tokenIndex: this._tokens.length,
                charIndex: this._tokens[this._tokens.length - 1]?.index || 0,
                line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
            },
            ruleStack: [...ruleStack],
            loopRuleName: ruleName,
            loopDetectionSet: Array.from(this.loopDetectionSet),
            loopCstDepth: this.cstStack.length,
            loopCacheStats: {
                hits: cacheStatsReport.hits,
                misses: cacheStatsReport.misses,
                hitRate: cacheStatsReport.hitRate,
                currentSize: cacheStatsReport.currentSize
            },
            loopTokenContext: tokenContext,
            hint: '检查规则定义，确保在递归前消费了 token'
        })
    }

    /**
     * 规则执行入口（由 @SubhutiRule 装饰器调用）
     * 职责：前置检查 → 循环检测 → Packrat 缓存 → 核心执行 → 后置处理
     */
    private executeRuleWrapper(targetFun: Function, ruleName: string, className: string, ...args: any[]): SubhutiCst | undefined {
        if (this.checkRuleIsThisClass(ruleName, className)) {
            return
        }
        const isTopLevel = this.cstStack.length === 0

        if (isTopLevel) {
            this.initTopLevelData()
        }

        if (this.parserFail) {
            return
        }

        const key = `${ruleName}:${this.tokenIndex}`

        // O(1) 快速检测是否重复（循环检测）
        if (this.loopDetectionSet.has(key)) {
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

                    // 解析记录模式：缓存命中时也要记录节点，并更新整个祖先链的 endTokenIndex
                    if (this.errorRecoveryMode && cached.endTokenIndex > this.tokenIndex) {
                        // 创建记录节点，复制缓存中的 children
                        const recordNode: ParseRecordNode = {
                            name: ruleName,
                            startTokenIndex: this.tokenIndex,
                            endTokenIndex: cached.endTokenIndex,
                            children: cached.recordNode?.children ? [...cached.recordNode.children] : [],
                            token: false
                        }
                        const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1]
                        if (recordParent) {
                            recordParent.children.push(recordNode)
                        }
                        // 更新整个祖先链的 endTokenIndex（类似 consume 的行为）
                        for (let i = this._parseRecordStack.length - 1; i >= 0; i--) {
                            const ancestor = this._parseRecordStack[i]
                            if (cached.endTokenIndex > ancestor.endTokenIndex) {
                                ancestor.endTokenIndex = cached.endTokenIndex
                            }
                        }
                    }

                    const cst = this.applyCachedResult(cached)
                    if (!cst.children?.length) {
                        cst.children = undefined
                    }
                    return cst
                }
            }

            // 核心执行
            const startTokenIndex = this.tokenIndex

            // 解析记录树：创建节点并入栈（在 executeRuleCore 之前）
            let recordNode: ParseRecordNode | null = null
            if (this.errorRecoveryMode) {
                recordNode = {
                    name: ruleName,
                    children: [],
                    startTokenIndex: this.tokenIndex,
                    endTokenIndex: this.tokenIndex
                }
                this._parseRecordStack.push(recordNode)
            }

            const cst = this.executeRuleCore(ruleName, targetFun, ...args)

            // 解析记录树：出栈，只有消费了 token 才添加到父节点
            if (this.errorRecoveryMode && recordNode) {
                this._parseRecordStack.pop()
                if (recordNode.endTokenIndex > recordNode.startTokenIndex) {
                    const recordParent = this._parseRecordStack[this._parseRecordStack.length - 1]
                    if (recordParent) {
                        recordParent.children.push(recordNode)
                    }
                }
            }

            // 缓存存储
            // 注意：使用 recordNode.endTokenIndex（如果有），因为 this.tokenIndex 可能已被 Or 回滚
            if (this.enableMemoization) {
                const endTokenIndex = recordNode ? Math.max(recordNode.endTokenIndex, this.tokenIndex) : this.tokenIndex
                this._cache.set(ruleName, startTokenIndex, {
                    endTokenIndex: endTokenIndex,
                    cst: cst,
                    parseSuccess: this._parseSuccess,
                    recordNode: recordNode  // 直接存储 recordNode
                })
            }

            this.onRuleExitDebugHandler(ruleName, cst, isTopLevel, startTime)

            // 顶层规则：检查是否所有 token 都被消费
            // 如果成功但还有剩余 token，说明解析器逻辑有问题，直接抛错
            if (isTopLevel && this._parseSuccess && this.tokenIndex < this._tokens.length) {
                const remainingToken = this.curToken!
                throw new Error(
                    `Parser internal error: parsing succeeded but ${this._tokens.length - this.tokenIndex} tokens remain unconsumed. ` +
                    `Next token: "${remainingToken.tokenValue}" (${remainingToken.tokenName}) at line ${remainingToken.rowNum}, column ${remainingToken.columnStartNum}`
                )
            }

            // 顶层规则失败时的错误处理
            if (isTopLevel && this.parserFail) {
                this.handleTopLevelError(ruleName, startTokenIndex)
            }

            if (!cst.children?.length) {
                cst.children = undefined
            }
            return cst
        } finally {
            // 出栈（无论成功、return、异常都会执行）
            this.loopDetectionSet.delete(key)
        }
    }

    private initTopLevelData() {
        // 【顶层规则开始】重置解析器状态
        // 重置 Parser 的内部状态
        this._parseSuccess = true
        this.cstStack.length = 0
        this.loopDetectionSet.clear()
        this.tokenIndex = 0  // ✅ 重置 tokenIndex

        // ============================================
        // 【新增】重置调试器的缓存和统计
        // ============================================
        // 这样每次新的顶层解析都有干净的环境
        this._debugger?.resetForNewParse?.(this._tokens)
    }

    private checkRuleIsThisClass(ruleName: string, className: string): boolean {
        if (this.hasOwnProperty(ruleName)) {
            if (className !== this.className) {
                return true
            }
        }
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
    private executeRuleCore(ruleName: string, targetFun: Function, ...args: any[]): SubhutiCst {
        const cst = new SubhutiCst()
        cst.name = ruleName
        cst.children = []

        this.cstStack.push(cst)

        // 执行规则函数
        targetFun.apply(this, args)

        this.cstStack.pop()

        // 成功时添加到父节点并设置位置
        if (this._parseSuccess) {
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cst)
            }
            this.setLocation(cst)
        }

        return cst
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
     *
     * 核心逻辑：
     * - 依次尝试每个分支，第一个成功的分支生效
     * - 所有分支都失败则整体失败
     *
     * 优化：只有消费了 token 才需要回溯（没消费 = 状态没变）
     */
    Or(alternatives: SubhutiParserOr[]): void {
        if (this.parserFail) {
            return
        }

        const savedState = this.saveState()
        const startTokenIndex = this.tokenIndex
        const totalCount = alternatives.length
        const parentRuleName = this.curCst?.name || 'Unknown'

        // 进入 Or（整个 Or 调用开始）
        this._debugger?.onOrEnter?.(parentRuleName, this.tokenIndex)

        for (let i = 0; i < totalCount; i++) {
            const alt = alternatives[i]
            const isLast = i === totalCount - 1

            // 进入 Or 分支
            this._debugger?.onOrBranch?.(i, totalCount, parentRuleName)

            alt.alt()

            // 退出 Or 分支（无论成功还是失败）
            this._debugger?.onOrBranchExit?.(parentRuleName, i)

            if (this._parseSuccess) {
                // 退出 Or（整个 Or 调用成功结束）
                this._debugger?.onOrExit?.(parentRuleName)
                return
            }

            // 前 N-1 个分支：失败后回溯并重置状态，继续尝试下一个
            if (!isLast) {
                this.recordPartialMatchAndRestore(savedState, startTokenIndex)
                this._parseSuccess = true
            }
            // 最后一个分支：失败后不回溯，保持失败状态
        }

        // 退出 Or（整个 Or 调用失败结束）
        this._debugger?.onOrExit?.(parentRuleName)
    }

    /**
     * Many 规则 - 0次或多次（EBNF { ... }）
     *
     * 循环执行直到失败或没消费 token
     */
    Many(fn: RuleFunction): void {
        while (this.tryAndRestore(fn)) {
            // 继续循环
        }
    }

    /**
     * 带容错的 Many 规则（使用解析记录树）
     * - 当全局 errorRecoveryMode 开启时，解析失败会尝试恢复并继续
     * - 使用解析记录树记录所有解析尝试，只增不删
     * - 失败时从解析记录树提取最优路径恢复 CST
     * @param fn 要执行的规则函数
     */
    ManyWithRecovery(fn: RuleFunction): void {
        if (!this.errorRecoveryMode) {
            throw new Error('非容错模式不应该进入 ManyWithRecovery')
        }

        // 清理记录
        this._unparsedTokens.length = 0

        while (!this.parserFailOrIsEof) {
            const startTokenIndex = this.tokenIndex

            // 启用解析记录，为本次迭代创建根节点
            this._parseRecordRoot = {
                name: '__ParseRecordRoot__',
                children: [],
                startTokenIndex: startTokenIndex,
                endTokenIndex: startTokenIndex
            }
            this._parseRecordStack = [this._parseRecordRoot]

            const success = this.tryAndRestore(fn)

            if (success) {
                // 成功，清理解析记录树，继续下一个
                this._parseRecordRoot = null
                this._parseRecordStack = []
                continue
            }

            // 解析失败，尝试从解析记录树恢复
            const syncIndex = this.findNextSyncPoint(startTokenIndex + 1)
            const recoveredCST = this.recoverFromParseRecord(this._parseRecordRoot!, syncIndex)

            if (recoveredCST && recoveredCST.children && recoveredCST.children.length > 0) {
                // 恢复成功，将 CST 添加到当前节点
                const currentCst = this.curCst
                if (currentCst) {
                    currentCst.children.push(...recoveredCST.children)
                }
                // 从恢复的位置继续
                this.tokenIndex = this.getParseRecordMaxEndIndex(this._parseRecordRoot!, syncIndex)
            } else {
                // 没有可恢复的内容，记录当前 token 为未解析，跳过继续
                if (this.tokenIndex < this._tokens.length) {
                    this._unparsedTokens.push(this._tokens[this.tokenIndex])
                }
                this.tokenIndex++
            }

            // 清理解析记录树
            this._parseRecordRoot = null
            this._parseRecordStack = []
            this._parseSuccess = true
        }

        // 出口：如果有未解析的 tokens，标记解析失败
        if (this._unparsedTokens.length > 0) {
            this._parseSuccess = false
        }
    }

    /**
     * 从解析记录树恢复 CST
     * 找到 endTokenIndex <= maxIndex 的最深路径，转换为 CST
     */
    private recoverFromParseRecord(root: ParseRecordNode, maxIndex: number): SubhutiCst | null {
        if (!root || root.children.length === 0) {
            return null
        }

        const cst = new SubhutiCst()
        cst.name = root.name
        cst.children = this.parseRecordChildrenToCST(root.children, maxIndex)

        if (!cst.children || cst.children.length === 0) {
            return null
        }

        return cst
    }

    /**
     * 将解析记录树子节点转换为 CST 子节点
     *
     * 选择策略：
     * 1. 按 startTokenIndex 分组（同一位置开始的是 Or 的不同分支）
     * 2. 对于每组，选择 endTokenIndex <= maxIndex 且最大的
     * 3. 如果有多个相同深度的，选择最后一个
     */
    private parseRecordChildrenToCST(nodes: ParseRecordNode[], maxIndex: number): SubhutiCst[] {
        // 按 startTokenIndex 分组
        const groups = new Map<number, ParseRecordNode[]>()
        for (const node of nodes) {
            // 跳过超过同步点的节点
            if (node.endTokenIndex > maxIndex) {
                continue
            }
            const key = node.startTokenIndex
            if (!groups.has(key)) {
                groups.set(key, [])
            }
            groups.get(key)!.push(node)
        }

        // 对每组选择最优节点
        const selectedNodes: ParseRecordNode[] = []
        for (const [startIdx, group] of groups) {
            // 选择 endTokenIndex 最大的，如果相同则选最后一个（兜底分支，更通用）
            let best: ParseRecordNode | null = null
            for (const node of group) {
                if (!best || node.endTokenIndex >= best.endTokenIndex) {
                    best = node
                }
            }
            if (best) {
                selectedNodes.push(best)
            }
        }

        // 按 startTokenIndex 排序，保证顺序正确
        selectedNodes.sort((a, b) => a.startTokenIndex - b.startTokenIndex)

        // 转换为 CST
        return selectedNodes.map(node => this.parseRecordNodeToCST(node, maxIndex))
    }

    /**
     * 将单个解析记录节点转换为 CST 节点
     */
    private parseRecordNodeToCST(node: ParseRecordNode, maxIndex: number): SubhutiCst {
        const cst = new SubhutiCst()
        cst.name = node.name

        // 如果是 token 节点
        if (node.token) {
            cst.value = node.value
            cst.loc = {
                type: node.token.tokenName,
                value: node.token.tokenValue,
                start: {
                    index: node.token.index || 0,
                    line: node.token.rowNum || 0,
                    column: node.token.columnStartNum || 0
                },
                end: {
                    index: (node.token.index || 0) + node.token.tokenValue.length,
                    line: node.token.rowNum || 0,
                    column: node.token.columnEndNum || 0
                }
            }
        }

        // 递归转换子节点
        if (node.children.length > 0) {
            cst.children = this.parseRecordChildrenToCST(node.children, maxIndex)
            if (cst.children.length === 0) {
                cst.children = undefined
            } else {
                // 设置位置信息
                this.setLocation(cst)
            }
        }

        return cst
    }

    /**
     * 获取解析记录树中 <= maxIndex 的最大 endTokenIndex
     */
    private getParseRecordMaxEndIndex(root: ParseRecordNode, maxIndex: number): number {
        let maxEnd = root.endTokenIndex <= maxIndex ? root.endTokenIndex : 0

        for (const child of root.children) {
            const childMax = this.getParseRecordMaxEndIndex(child, maxIndex)
            if (childMax > maxEnd) {
                maxEnd = childMax
            }
        }

        return maxEnd
    }

    /**
     * 找到下一个同步点（语句开始 token）
     * @param fromIndex 从哪个索引开始查找
     * @returns 同步点的 token 索引，如果没找到返回 token 列表末尾
     */
    protected findNextSyncPoint(fromIndex: number): number {
        for (let i = fromIndex; i < this._tokens.length; i++) {
            const token = this._tokens[i]
            if (this._syncTokens.has(token.tokenName)) {
                return i
            }
        }
        return this._tokens.length  // 没找到，返回末尾
    }

    /**
     * 创建 ErrorNode，包含指定范围内的 token
     * @param startIndex 起始 token 索引（包含）
     * @param endIndex 结束 token 索引（不包含）
     * @returns ErrorNode CST 节点
     */
    protected createErrorNode(startIndex: number, endIndex: number): SubhutiCst {
        const errorNode = new SubhutiCst()
        errorNode.name = 'ErrorNode'
        errorNode.children = []

        // 将每个 token 转为叶子节点
        for (let i = startIndex; i < endIndex; i++) {
            const token = this._tokens[i]
            const tokenNode = new SubhutiCst()
            tokenNode.name = token.tokenName
            tokenNode.value = token.tokenValue
            tokenNode.loc = {
                type: token.tokenName,
                value: token.tokenValue,
                start: {
                    index: token.index,
                    line: token.rowNum,
                    column: token.columnStartNum
                },
                end: {
                    index: token.index + (token.tokenValue?.length || 0),
                    line: token.rowNum,
                    column: token.columnEndNum
                }
            }
            errorNode.children.push(tokenNode)
        }

        // 设置 ErrorNode 的位置信息
        if (errorNode.children.length > 0) {
            const first = errorNode.children[0]
            const last = errorNode.children[errorNode.children.length - 1]
            errorNode.loc = {
                type: 'ErrorNode',
                start: first.loc.start,
                end: last.loc.end
            }
        }

        return errorNode
    }

    /**
     * Option 规则 - 0次或1次（EBNF [ ... ]）
     *
     * 尝试执行一次，失败则回溯，不影响整体解析状态
     */
    Option(fn: RuleFunction): void {
        this.tryAndRestore(fn)
    }

    /**
     * AtLeastOne 规则 - 1次或多次
     *
     * 第一次必须成功，后续循环执行直到失败
     */
    AtLeastOne(fn: RuleFunction): void {
        if (this.parserFail) {
            return
        }

        fn()

        while (this.tryAndRestore(fn)) {
            // 继续循环
        }
    }

    /**
     * 顶层规则失败时的错误处理
     *
     * @param ruleName 规则名
     * @param startTokenIndex 规则开始时的 tokenIndex
     */
    private handleTopLevelError(ruleName: string, startTokenIndex: number): void {
        // 分析模式：不抛错，用于语法验证
        if (this._analysisMode) {
            return
        }

        // 正常模式：抛出解析错误
        const noTokenConsumed = this.tokenIndex === startTokenIndex
        const found = this.curToken

        throw this._errorHandler.createError({
            type: 'parsing',
            expected: noTokenConsumed ? 'valid syntax' : 'EOF (end of file)',
            found: found,
            position: {
                tokenIndex: this.tokenIndex,
                charIndex: found?.index ?? this._tokens[this._tokens.length - 1]?.index ?? 0,
                line: found?.rowNum ?? 1,
                column: found?.columnStartNum ?? 1
            },
            ruleStack: this.getRuleStack().length > 0 ? this.getRuleStack() : [ruleName]
        })
    }

    get parserFailOrIsEof() {
        return this.parserFail || this.isEof
    }

    /**
     * 消费 token（智能错误管理）
     * - 失败时返回 undefined，不抛异常
     */
    consume(tokenName: string): SubhutiCst | undefined {
        if (this.parserFail) {
            return
        }

        if (this.isEof) {
            this._parseSuccess = false
            return
        }

        // 已经检查了 EOF，token 一定存在
        const token = this.curToken!

        if (token.tokenName !== tokenName) {
            this._parseSuccess = false

            this._debugger?.onTokenConsume(
                this.tokenIndex,
                token.tokenValue,
                token.tokenName,
                tokenName,
                false
            )

            return
        }

        this._debugger?.onTokenConsume(
            this.tokenIndex,
            token.tokenValue,
            token.tokenName,
            tokenName,
            true
        )

        this.generateCstByToken(token)
        this.tokenIndex++
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

        // 解析记录树：记录 token 并更新祖先的 endTokenIndex
        if (this.errorRecoveryMode) {
            const newEndIndex = this.tokenIndex + 1  // consume 后 tokenIndex 会 +1
            const tokenNode: ParseRecordNode = {
                name: token.tokenName,
                children: [],
                startTokenIndex: this.tokenIndex,
                endTokenIndex: newEndIndex,
                token: token,
                value: token.tokenValue
            }
            const recordCurrent = this._parseRecordStack[this._parseRecordStack.length - 1]
            if (recordCurrent) {
                recordCurrent.children.push(tokenNode)
            }
            // 更新所有祖先的 endTokenIndex
            for (const ancestor of this._parseRecordStack) {
                ancestor.endTokenIndex = newEndIndex
            }
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
     * 【容错模式】记录部分匹配并回溯
     * - 先记录被回溯删除但消费了 token 的 CST 片段
     * - 再执行回溯
     *
     * @param savedState 保存的状态
     * @param startTokenIndex 起始 token 位置
     */
    private recordPartialMatchAndRestore(savedState: SubhutiBackData, startTokenIndex: number): void {
        // 注意：解析记录树方案中，部分匹配由 _parseRecordRoot 记录，这里只需要回溯 CST
        // 解析记录树是只增不删的，不受 restoreState 影响
        this.restoreState(savedState)
    }

    get isEof() {
        return this.tokenIndex === this._tokens.length
    }

    /**
     * 尝试执行函数，失败时自动回溯并重置状态
     *
     * @param fn 要执行的函数
     * @returns true: 成功且消费了 token，false: 失败或没消费 token
     */
    private tryAndRestore(fn: () => void): boolean {
        if (this.parserFailOrIsEof) {
            return false
        }
        const savedState = this.saveState()
        const startTokenIndex = this.tokenIndex

        fn()

        if (this.parserFail) {
            // 记录部分匹配并回溯
            this.recordPartialMatchAndRestore(savedState, startTokenIndex)
            this._parseSuccess = true
            return false
        }

        // 成功但没消费 token → 返回 false（防止无限循环）
        return this.tokenIndex !== startTokenIndex
    }

    /**
     * 应用缓存结果（恢复状态）
     */
    private applyCachedResult(cached: SubhutiPackratCacheResult): SubhutiCst {
        this.tokenIndex = cached.endTokenIndex
        this._parseSuccess = cached.parseSuccess

        // 成功时添加到父节点
        if (cached.parseSuccess) {
            const parentCst = this.cstStack[this.cstStack.length - 1]
            if (parentCst) {
                parentCst.children.push(cached.cst)
            }
        }

        return cached.cst
    }

    // ============================================
    // Error Helper Methods
    // ============================================

    /**
     * 获取 token 上下文（前后各 N 个 token）
     *
     * @param tokenIndex - 当前 token 索引
     * @param contextSize - 上下文大小（默认 2）
     * @returns token 上下文数组
     */
    private getTokenContext(tokenIndex: number, contextSize: number = 2): SubhutiMatchToken[] {
        const start = Math.max(0, tokenIndex - contextSize)
        const end = Math.min(this._tokens.length, tokenIndex + contextSize + 1)
        return this._tokens.slice(start, end)
    }

    /**
     * 生成当前规则路径的字符串（用于错误信息）
     *
     * @returns 格式化后的规则路径字符串数组
     */
    private formatCurrentRulePath(): string[] {
        if (!this._debugger) {
            // 如果没有调试器，使用简单格式
            return this.formatSimpleRulePath()
        }

        // 使用调试器的格式化方法
        const ruleStack = this._debugger.ruleStack
        if (!ruleStack || ruleStack.length === 0) {
            return ['  (empty)']
        }

        return SubhutiDebugRuleTracePrint.formatPendingOutputs_NonCache_Impl(ruleStack)
    }

    /**
     * 简单格式化规则路径（当没有调试器时）
     */
    private formatSimpleRulePath(): string[] {
        const ruleStack = this.getRuleStack()
        if (ruleStack.length === 0) {
            return ['  (empty)']
        }

        const lines: string[] = []
        for (let i = 0; i < ruleStack.length; i++) {
            const rule = ruleStack[i]
            const isLast = i === ruleStack.length - 1
            const indent = '  '.repeat(i)
            const connector = i === 0 ? '' : '└─ '
            const marker = isLast ? ' ← 当前位置' : ''

            lines.push(`  ${indent}${connector}${rule}${marker}`)
        }

        return lines
    }

    /**
     * 创建无限循环错误
     *
     * @param ruleName - 规则名称
     * @param hint - 修复提示
     * @returns ParsingError 实例（分析模式下返回 null）
     */
    private createInfiniteLoopError(ruleName: string, hint: string): ParsingError {
        // 🔍 分析模式：不创建错误，标记失败并返回 null
        if (this._analysisMode) {
            this._parseSuccess = false
            return null as any  // 分析模式下不会真正使用这个返回值
        }

        // 生成规则路径
        const rulePathLines = this.formatCurrentRulePath()
        const rulePath = rulePathLines.join('\n')

        // 🔍 检测是否是左递归（准确判断）
        const ruleStack = this.getRuleStack()
        const isLeftRecursion = this.isDirectLeftRecursion(ruleName, ruleStack)

        // ✅ 只有确定是左递归时才使用 'left-recursion' 类型
        // ❌ 不确定的情况使用 'infinite-loop'，不断言是 Or 遮蔽
        const errorType = isLeftRecursion ? 'left-recursion' : 'infinite-loop'

        return this._errorHandler.createError({
            type: errorType,
            expected: '',
            found: this.curToken,
            position: this.curToken ? {
                tokenIndex: this.tokenIndex,
                charIndex: this.curToken.index || 0,
                line: this.curToken.rowNum || 0,
                column: this.curToken.columnStartNum || 0
            } : {
                tokenIndex: this._tokens.length,
                charIndex: this._tokens[this._tokens.length - 1]?.index || 0,
                line: this._tokens[this._tokens.length - 1]?.rowNum || 0,
                column: this._tokens[this._tokens.length - 1]?.columnEndNum || 0
            },
            ruleStack: [...ruleStack],
            loopRuleName: ruleName,
            loopDetectionSet: [],
            loopCstDepth: this.cstStack.length,
            loopTokenContext: this.getTokenContext(this.tokenIndex, 2),
            hint: hint,
            rulePath: rulePath  // 🆕 添加规则路径
        })
    }
}

