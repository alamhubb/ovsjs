import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import { Subhuti, SubhutiPackratCache, SubhutiRule } from 'subhuti'
// 使用包名导入
import { CssTsParser } from "cssts-compiler";
import {
    Alternative,
    ReservedWords,
    SlimeJavascriptContextualKeywordTokenTypes,
    SlimeTokenType
} from "@qin/generated-qin-parser-ts";
import type { ExpressionParams, StatementParams, DeclarationParams } from "@qin/generated-qin-parser-ts";
import { normalizeGeneratedTokens } from "cssts-compiler"

type OvsExpressionParams = OvsParserParams

/**
 * OVS 组件标签名黑名单
 * 包含 JavaScript 硬关键字 + 软关键字
 * 这些不能作为 OvsRenderFunction 的标签名
 */
const OVS_TAG_BLACKLIST = new Set([
    ...ReservedWords,
    ...Object.values(SlimeJavascriptContextualKeywordTokenTypes)
])

type OvsParserParamSource = OvsParserParams | ExpressionParams | StatementParams | DeclarationParams | undefined
type OvsParserParamOverrides = {
    Yield?: boolean
    Await?: boolean
    In?: boolean
    Tagged?: boolean
    Return?: boolean
    Default?: boolean
    DisableOvsRender?: boolean
}
type OvsParserProfileCounters = {
    laCalls: number
    tokenEntryCalls: number
    tokenEntryTime: number
    ruleCalls: number
    ruleTime: number
    saveStateCalls: number
    restoreStateCalls: number
    canStartOvsRenderCalls: number
    canStartOvsRenderTime: number
}
type OvsParserRuleProfile = { calls: number, ms: number, self: number }
type OvsParserRuleFrame = { name: string, started: number, child: number }

const PARSER_PARAM_CACHE = new Map<string, OvsParserParams>()
const SubhutiClass = Subhuti as ClassDecorator

class OvsParserParams {
    static DEFAULT = new OvsParserParams(true, false, false, false, false, false, false)
    readonly __qin_structural_object__ = true

    constructor(
        private readonly inEnabled: boolean,
        private readonly yieldEnabled: boolean,
        private readonly awaitEnabled: boolean,
        private readonly taggedEnabled: boolean,
        private readonly returnEnabled: boolean,
        private readonly defaultEnabled: boolean,
        private readonly disableRenderEnabled: boolean
    ) {}

    withIn(value: boolean): OvsParserParams {
        return withParserParams(this, {In: value})
    }

    expressionParams(): OvsParserParams {
        return withParserParams(this)
    }

    __qin_in(): boolean {
        return this.inEnabled
    }

    __qin_yield(): boolean {
        return this.yieldEnabled
    }

    __qin_await(): boolean {
        return this.awaitEnabled
    }

    tagged(): boolean {
        return this.taggedEnabled
    }

    returnAllowed(): boolean {
        return this.returnEnabled
    }

    isDefault(): boolean {
        return this.defaultEnabled
    }

    disableOvsRender(): boolean {
        return this.disableRenderEnabled
    }

    equals(other: OvsParserParams): boolean {
        return other instanceof OvsParserParams
            && this.inEnabled === other.inEnabled
            && this.yieldEnabled === other.yieldEnabled
            && this.awaitEnabled === other.awaitEnabled
            && this.taggedEnabled === other.taggedEnabled
            && this.returnEnabled === other.returnEnabled
            && this.defaultEnabled === other.defaultEnabled
            && this.disableRenderEnabled === other.disableRenderEnabled
    }

    hashCode(): number {
        let hash = 17
        hash = hash * 31 + (this.inEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.yieldEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.awaitEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.taggedEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.returnEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.defaultEnabled ? 1231 : 1237)
        hash = hash * 31 + (this.disableRenderEnabled ? 1231 : 1237)
        return hash
    }
}

const OVS_DEFAULT_PARAMS = OvsParserParams.DEFAULT

function hasInParam(params: OvsParserParamSource): params is ExpressionParams {
    return !!params && typeof (params as ExpressionParams).__qin_in === 'function'
}

function hasYieldAwaitParam(params: OvsParserParamSource): params is ExpressionParams | StatementParams | DeclarationParams {
    return !!params
        && typeof params.__qin_yield === 'function'
        && typeof params.__qin_await === 'function'
}

function hasTaggedParam(params: OvsParserParamSource): params is OvsParserParams {
    return !!params && typeof (params as OvsParserParams).tagged === 'function'
}

function hasReturnParam(params: OvsParserParamSource): params is StatementParams {
    return !!params && typeof (params as StatementParams).returnAllowed === 'function'
}

function hasDefaultParam(params: OvsParserParamSource): params is DeclarationParams {
    return !!params && typeof (params as DeclarationParams).isDefault === 'function'
}

function hasDisableRenderParam(params: OvsParserParamSource): params is OvsParserParams {
    return !!params && typeof (params as OvsParserParams).disableOvsRender === 'function'
}

function withParserParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS, overrides: OvsParserParamOverrides = {}): OvsParserParams {
    const source = params ?? OVS_DEFAULT_PARAMS
    if (!hasYieldAwaitParam(source)) {
        throw new Error("OvsParser expected fixed parser params with __qin_yield()/__qin_await()")
    }
    const inEnabled = overrides.In ?? (hasInParam(source) ? !!source.__qin_in() : true)
    const yieldEnabled = overrides.Yield ?? !!source.__qin_yield()
    const awaitEnabled = overrides.Await ?? !!source.__qin_await()
    const taggedEnabled = overrides.Tagged ?? (hasTaggedParam(source) ? !!source.tagged() : false)
    const returnEnabled = overrides.Return ?? (hasReturnParam(source) ? !!source.returnAllowed() : false)
    const defaultEnabled = overrides.Default ?? (hasDefaultParam(source) ? !!source.isDefault() : false)
    const disableRenderEnabled = overrides.DisableOvsRender
        ?? (hasDisableRenderParam(source) ? !!source.disableOvsRender() : false)
    const cacheKey = [
        inEnabled,
        yieldEnabled,
        awaitEnabled,
        taggedEnabled,
        returnEnabled,
        defaultEnabled,
        disableRenderEnabled
    ].map((value) => value ? '1' : '0').join('')
    const cached = PARSER_PARAM_CACHE.get(cacheKey)
    if (cached) return cached

    const stableParams = new OvsParserParams(
        inEnabled,
        yieldEnabled,
        awaitEnabled,
        taggedEnabled,
        returnEnabled,
        defaultEnabled,
        disableRenderEnabled
    )
    PARSER_PARAM_CACHE.set(cacheKey, stableParams)
    return stableParams
}

function declarationLexicalParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS): ExpressionParams {
    return withParserParams(params, {In: true}) as unknown as ExpressionParams
}

function declarationHoistableParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS): DeclarationParams {
    return withParserParams(params, {Default: false}) as unknown as DeclarationParams
}

function tokenNameOf(token: any): string {
    if (!token) return ''
    if (typeof token.getTokenName === 'function') return token.getTokenName()
    if (typeof token.tokenName === 'function') return token.tokenName()
    return token.tokenName || token.name || ''
}

function tokenValueOf(token: any): string {
    if (!token) return ''
    if (typeof token.getTokenValue === 'function') return token.getTokenValue()
    if (typeof token.value === 'function') return token.value()
    return token.tokenValue || token.value || ''
}

function tokenHasLineBreakBefore(token: any): boolean {
    if (!token) return false
    if (typeof token.hasLineBreakBefore === 'function') return !!token.hasLineBreakBefore()
    return !!token.lineBreakBefore
}

function tokenIndexOf(token: any): string {
    if (!token) return ''
    if (typeof token.getIndex === 'function') {
        const value = token.getIndex()
        if (value !== undefined && value !== null) return String(value)
    }
    if (token.codeIndex !== undefined && token.codeIndex !== null) return String(token.codeIndex)
    return `${tokenNameOf(token)}:${tokenValueOf(token)}`
}

/**
 * OvsParser - OVS 视图语法解析器
 * 
 * 继承链：SlimeParser -> CssTsParser -> OvsParser
 * 
 * 这样 OVS 文件中可以同时使用：
 * - ES2025 标准语法（来自 SlimeParser）
 * - CssTs 样式表达式语法（来自 CssTsParser）：css { colorRed, fontBold }
 * - OVS 视图语法：view ComponentName() { }, tag(class = "a"; onClick() {}) { children }
 * 
 * 注意：不支持 css 声明语法（如 `css colorRed`），只支持 css 表达式语法。
 * 详见 CssTsParser 和 ARCHITECTURE.md 的说明。
 */
@SubhutiClass
export default class OvsParser extends CssTsParser<OvsTokenConsumer> {
    private ovsRenderLookaheadCache = new Map<string, boolean>()
    private forInOfLookaheadCache = new Map<string, boolean>()
    private profileEnabled = false
    private profileCounters: OvsParserProfileCounters = {
        laCalls: 0,
        tokenEntryCalls: 0,
        tokenEntryTime: 0,
        ruleCalls: 0,
        ruleTime: 0,
        saveStateCalls: 0,
        restoreStateCalls: 0,
        canStartOvsRenderCalls: 0,
        canStartOvsRenderTime: 0,
    }
    private profileRuleStats = new Map<string, OvsParserRuleProfile>()
    private profileRuleStack: OvsParserRuleFrame[] = []

    declare getTokenConsumer: () => OvsTokenConsumer
    declare getCurCst: () => any
    declare isEof: () => boolean
    declare currentTokenIndex: () => number
    declare assertCondition: (condition: boolean) => void
    declare assertNoLineBreak: () => void
    declare match: (tokenType: any) => boolean
    declare curToken: any
    declare Or: (...alternatives: any[]) => any
    declare Many: (fn: () => any) => any
    declare Option: (fn: () => any) => any
    declare ImportDeclaration: (...args: any[]) => any
    declare Expression: (...args: any[]) => any
    declare IfStatementBody: (...args: any[]) => any
    declare ForInOfStatement: (...args: any[]) => any
    declare DoWhileStatement: (...args: any[]) => any
    declare WhileStatement: (...args: any[]) => any
    declare ForStatement: (...args: any[]) => any
    declare SwitchStatement: (...args: any[]) => any
    declare AssignmentExpression: (...args: any[]) => any
    declare PropertyName: (...args: any[]) => any
    declare MethodDefinition: (...args: any[]) => any
    declare IdentifierReference: (...args: any[]) => any
    declare ExpressionStatement: (...args: any[]) => any
    declare LabelledStatement: (...args: any[]) => any
    declare LeftHandSideExpression: (...args: any[]) => any
    declare consumeIdentifierValue: (value: string) => any
    declare ArrowFormalParameters: (...args: any[]) => any

    /**
     * 构造函数 - 使用按需词法分析模式
     * @param sourceCode 原始源码
     */
    constructor(sourceCode: string = '') {
        super(sourceCode, {
            tokenConsumer: OvsTokenConsumer,
            tokenDefinitions: ovs6Tokens
        })
        ;(this as any)._cache = new SubhutiPackratCache(100000)
    }

    enableProfile(): this {
        this.profileEnabled = true
        return this
    }

    getProfileReport(): string {
        const topRules = Array.from(this.profileRuleStats.entries())
            .sort((a, b) => b[1].ms - a[1].ms)
            .slice(0, 8)
            .map(([name, stat]) => `${name}:${stat.ms}ms,self=${stat.self}ms/${stat.calls}`)
            .join(", ")
        const topSelfRules = Array.from(this.profileRuleStats.entries())
            .sort((a, b) => b[1].self - a[1].self)
            .slice(0, 8)
            .map(([name, stat]) => `${name}:${stat.self}ms,total=${stat.ms}ms/${stat.calls}`)
            .join(", ")
        return [
            `rules=${this.profileCounters.ruleCalls}/${this.profileCounters.ruleTime}ms`,
            `la=${this.profileCounters.laCalls}`,
            `tokenEntry=${this.profileCounters.tokenEntryCalls}/${this.profileCounters.tokenEntryTime}ms`,
            `state=${this.profileCounters.saveStateCalls}/${this.profileCounters.restoreStateCalls}`,
            `ovsLookahead=${this.profileCounters.canStartOvsRenderCalls}/${this.profileCounters.canStartOvsRenderTime}ms`,
            `top=${topRules}`,
            `topSelf=${topSelfRules}`,
        ].join(", ")
    }

    LA(...args: any[]): any {
        if (this.profileEnabled) this.profileCounters.laCalls++
        return (CssTsParser.prototype as any).LA.apply(this, args)
    }

    _getOrParseTokenEntry(...args: any[]): any {
        const started = this.profileEnabled ? Date.now() : 0
        try {
            return (CssTsParser.prototype as any)._getOrParseTokenEntry.apply(this, args)
        } finally {
            if (this.profileEnabled) {
                this.profileCounters.tokenEntryCalls++
                this.profileCounters.tokenEntryTime += Date.now() - started
            }
        }
    }

    executeRuleWrapper(...args: any[]): any {
        const ruleName = typeof args[1] === 'string' ? args[1] : '<unknown>'
        const started = this.profileEnabled ? Date.now() : 0
        const frame = this.profileEnabled ? { name: ruleName, started, child: 0 } : null
        if (frame) this.profileRuleStack.push(frame)
        try {
            return (CssTsParser.prototype as any).executeRuleWrapper.apply(this, args)
        } finally {
            if (this.profileEnabled) {
                const elapsed = Date.now() - started
                const finished = this.profileRuleStack.pop() ?? frame
                const child = finished?.child ?? 0
                const self = Math.max(0, elapsed - child)
                const parent = this.profileRuleStack[this.profileRuleStack.length - 1]
                if (parent) parent.child += elapsed
                this.profileCounters.ruleCalls++
                this.profileCounters.ruleTime += elapsed
                const stat = this.profileRuleStats.get(ruleName) ?? { calls: 0, ms: 0, self: 0 }
                stat.calls++
                stat.ms += elapsed
                stat.self += self
                this.profileRuleStats.set(ruleName, stat)
            }
        }
    }

    saveState(...args: any[]): any {
        if (this.profileEnabled) this.profileCounters.saveStateCalls++
        return (CssTsParser.prototype as any).saveState.apply(this, args)
    }

    restoreState(...args: any[]): any {
        if (this.profileEnabled) this.profileCounters.restoreStateCalls++
        return (CssTsParser.prototype as any).restoreState.apply(this, args)
    }

    get parsedTokens(): any[] {
        const tokens = typeof (this as any).getParsedTokens === 'function'
            ? (this as any).getParsedTokens()
            : (this as any).__qin_field_parsedTokens
        return normalizeGeneratedTokens(tokens)
    }

    @SubhutiRule
    Program(..._args: any[]): any {
        return this.OvsProgram()
    }

    @SubhutiRule
    OvsProgram(): any {
        this.parseOvsModuleItemList()
        return this.getCurCst()
    }

    private canStartOvsRender(): boolean {
        const profileStarted = this.profileEnabled ? Date.now() : 0
        try {
        const first = this.LA(1)
        const cacheKey = tokenIndexOf(first)
        if (cacheKey) {
            const cached = this.ovsRenderLookaheadCache.get(cacheKey)
            if (cached !== undefined) return cached
        }
        const finish = (value: boolean) => {
            if (cacheKey) this.ovsRenderLookaheadCache.set(cacheKey, value)
            return value
        }
        if (tokenNameOf(first) !== 'IdentifierName') return false
        if (OVS_TAG_BLACKLIST.has(tokenValueOf(first))) return finish(false)

        const second = this.LA(2)
        const secondName = tokenNameOf(second)
        if (secondName === 'LBrace') return finish(!tokenHasLineBreakBefore(second))
        if (secondName !== 'LParen') return finish(false)

        let depth = 0
        for (let offset = 2; offset < 256; offset++) {
            const token = this.LA(offset)
            const name = tokenNameOf(token)
            if (!name) return finish(false)
            if (name === 'LParen') {
                depth++
            } else if (name === 'RParen') {
                depth--
                if (depth === 0) {
                    const after = this.LA(offset + 1)
                    return finish(tokenNameOf(after) === 'LBrace' && !tokenHasLineBreakBefore(after))
                }
            }
        }
        return finish(false)
        } finally {
            if (this.profileEnabled) {
                this.profileCounters.canStartOvsRenderCalls++
                this.profileCounters.canStartOvsRenderTime += Date.now() - profileStarted
            }
        }
    }

    private canStartForInOfStatement(): boolean {
        const first = this.LA(1)
        const cacheKey = tokenIndexOf(first)
        if (cacheKey) {
            const cached = this.forInOfLookaheadCache.get(cacheKey)
            if (cached !== undefined) return cached
        }
        const finish = (value: boolean) => {
            if (cacheKey) this.forInOfLookaheadCache.set(cacheKey, value)
            return value
        }
        if (tokenNameOf(first) !== 'For') return finish(false)
        let offset = 2
        if (tokenNameOf(this.LA(offset)) === 'Await') {
            offset++
        }
        if (tokenNameOf(this.LA(offset)) !== 'LParen') return finish(false)

        let parenDepth = 0
        let braceDepth = 0
        let bracketDepth = 0
        for (; offset < 160; offset++) {
            const token = this.LA(offset)
            const name = tokenNameOf(token)
            if (!name) return finish(false)

            if (name === 'LParen') {
                parenDepth++
            } else if (name === 'RParen') {
                parenDepth--
                if (parenDepth === 0) return finish(false)
            } else if (name === 'LBrace') {
                braceDepth++
            } else if (name === 'RBrace') {
                braceDepth--
            } else if (name === 'LBracket') {
                bracketDepth++
            } else if (name === 'RBracket') {
                bracketDepth--
            } else if (parenDepth === 1 && braceDepth === 0 && bracketDepth === 0) {
                if (name === 'Semicolon') return finish(false)
                if (name === 'In' || tokenValueOf(token) === 'of') return finish(true)
            }
        }
        return finish(false)
    }

    @SubhutiRule
    ModuleItemList() {
        this.parseOvsModuleItemList()
    }

    private parseOvsModuleItemList() {
        while (!this.isEof()) {
            const before = this.currentTokenIndex()
            this.ModuleItem()
            if (this.currentTokenIndex() === before) {
                this.assertCondition(false)
                return
            }
        }
    }

    @SubhutiRule
    ModuleItem(): any {
        const firstName = tokenNameOf(this.LA(1))
        if (this.canStartOvsRender()) {
            return this.StatementListItem(withParserParams(OVS_DEFAULT_PARAMS, {Await: true}) as unknown as StatementParams)
        }
        if (firstName === 'Import') {
            this.ImportDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Export') {
            this.ExportDeclaration()
            return this.getCurCst()
        }
        return this.StatementListItem(withParserParams(OVS_DEFAULT_PARAMS, {Await: true}) as unknown as StatementParams)
    }

    @SubhutiRule
    StatementListItem(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams): any {
        if (this.canStartOvsRender()) {
            return this.Statement(params)
        }
        const first = this.LA(1)
        const firstName = tokenNameOf(first)
        const firstValue = tokenValueOf(first)
        const canStartDeclaration = firstName === 'Function'
            || firstName === 'Class'
            || firstName === 'Let'
            || firstName === 'Const'
            || firstValue === 'async'
        if (!canStartDeclaration) {
            return this.Statement(params)
        }
        return this.Or(
            Alternative.of(() => this.Declaration(withParserParams(params, {Default: false}) as unknown as DeclarationParams)),
            Alternative.of(() => this.Statement(params))
        )
    }

    @SubhutiRule
    StatementList(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams, stopTokens: Array<{ tokenName: string; tokenValue?: string }> = []) {
        this.Many(() => this.StatementListItem(params))
    }

    @SubhutiRule
    IfStatement(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams) {
        this.getTokenConsumer().If()
        this.getTokenConsumer().LParen()
        this.Expression(withParserParams(params, {In: true}) as unknown as ExpressionParams)
        this.getTokenConsumer().RParen()
        this.IfStatementBody(params)
        this.Option(() => {
            this.getTokenConsumer().Else()
            return this.IfStatementBody(params)
        })
        return this.getCurCst()
    }

    @SubhutiRule
    IterationStatement(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams) {
        if (this.canStartForInOfStatement()) {
            return this.ForInOfStatement(params)
        }
        return this.Or(
            Alternative.of(() => this.DoWhileStatement(params)),
            Alternative.of(() => this.WhileStatement(params)),
            Alternative.of(() => this.ForStatement(params)),
            Alternative.of(() => this.ForInOfStatement(params))
        )
    }


    /**
     * OvsRenderFunction - OVS 视图渲染函数（表达式版本）
     * 语法: IdentifierReference [no LineTerminator here] OvsArguments? { StatementList? }
     *
     * 限制条件：
     * 1. 标签名不能是 JavaScript 关键字（硬关键字 + 软关键字）
     * 2. 标签名和 { 之间不能有换行符
     *
     * 采用和普通方法调用一样的策略：
     * - 使用 IdentifierReference 并正确传递 params
     * - 在 async 上下文中，await 是关键字，不会被匹配为标签名
     * - 在非 async 上下文中，await 可以作为标识符（虽然不常见）
     *
     * 注意：这是表达式版本，用于赋值场景如 `const x = div { }`
     * 语句版本请使用 OvsRenderStatement
     */
    @SubhutiRule
    OvsRenderFunction(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        const normalizedParams = withParserParams(params)
        this.assertCondition(this.canStartOvsRender())
        this.getTokenConsumer().IdentifierName()
        // 限制 1：组件标签名不能是 JavaScript 关键字
        const tagName = tokenValueOf(this.curToken)
        this.assertCondition(!OVS_TAG_BLACKLIST.has(tagName))

        this.Option(() => {
            // 使用 OVS 专属的参数语法
            return this.OvsArguments(normalizedParams)
        })
        // 限制 2：标签名和 { 之间不能有换行符 [no LineTerminator here]
        this.assertNoLineBreak()
        this.getTokenConsumer().LBrace()
        if (!this.match(SlimeTokenType.RBrace)) {
            // ✅ 正确：传递 params
            // OvsRenderFunction 的 body 类似于 FunctionBody，需要传递 Yield/Await 参数
            // 这样在 async 组件中可以使用 await，在 generator 组件中可以使用 yield
            this.StatementList(withParserParams(normalizedParams, {Return: false}) as unknown as StatementParams)
        }
        this.getTokenConsumer().RBrace()
        return this.getCurCst()
    }

    // ==================== OVS 专属参数语法 ====================
    
    /**
     * OvsArguments - OVS 专属参数列表
     * 语法: ( OvsPropertyDefinitionList? )
     * 
     * 与普通 Arguments 的区别：
     * - 使用 OvsPropertyDefinition 而非 AssignmentExpression
     * - 属性使用 = 而非 :
     * 
     * 示例：
     * - div() {} 等价于 div({}) {}
     * - div(class = "foo"; id = "bar") {}
     * - div(onClick() { console.log('clicked') }) {}
     */
    @SubhutiRule
    OvsArguments(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        const normalizedParams = withParserParams(params) as OvsExpressionParams
        this.getTokenConsumer().LParen()
        this.Option(() => {
            return this.OvsPropertyDefinitionList(normalizedParams)
        })
        this.getTokenConsumer().RParen()
        return this.getCurCst()
    }

    /**
     * OvsPropertyDefinitionList - OVS 属性定义列表
     * 语法: OvsPropertyDefinition (; OvsPropertyDefinition)* ;?
     */
    @SubhutiRule
    OvsPropertyDefinitionList(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        const normalizedParams = withParserParams(params)
        this.OvsPropertyDefinition(normalizedParams)
        this.Many(() => {
            this.getTokenConsumer().Semicolon()
            this.OvsPropertyDefinition(normalizedParams)
            return this.getCurCst()
        })
        this.Option(() => this.getTokenConsumer().Semicolon())
        return this.getCurCst()
    }

    /**
     * OvsPropertyDefinition - OVS 属性定义
     * 
     * 与 PropertyDefinition 类似，但使用 = 代替 :
     * 
     * 语法：
     * - ... AssignmentExpression          // 展开：...props
     * - PropertyName = AssignmentExpression  // 完整属性：class = "foo"
     * - MethodDefinition                   // 方法简写：onClick() {}
     * - IdentifierReference                // 简写属性：disabled
     */
    @SubhutiRule
    OvsPropertyDefinition(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        const normalizedParams = withParserParams(params)
        return this.Or(
            Alternative.of(() => {
                this.getTokenConsumer().Ellipsis()
                return this.AssignmentExpression(withParserParams(normalizedParams, {In: true}) as unknown as ExpressionParams)
            }),
            Alternative.of(() => {
                this.PropertyName(normalizedParams as unknown as ExpressionParams)
                this.getTokenConsumer().Assign()
                return this.AssignmentExpression(withParserParams(normalizedParams, {In: true}) as unknown as ExpressionParams)
            }),
            Alternative.of(() => this.MethodDefinition(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.IdentifierReference(normalizedParams as unknown as ExpressionParams))
        )
    }

    /**
     * OvsRenderStatement - OVS 视图渲染语句（语句版本）
     * 语法: IdentifierReference [no LineTerminator here] OvsArguments? { StatementList? }
     *
     * 与 OvsRenderFunction 的区别：
     * - OvsRenderStatement 是 Statement，以 } 结尾，不需要分号
     * - OvsRenderFunction 是 Expression，用于赋值等场景
     *
     * 这解决了 ASI（自动分号插入）问题：
     * - `div{"a"} div{"b"}` 现在可以正确解析为两个独立的语句
     * - 类似于 ES 中 FunctionDeclaration 和 BlockStatement 不需要分号
     */
    @SubhutiRule
    OvsRenderStatement(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams) {
        this.assertCondition(this.canStartOvsRender())
        this.getTokenConsumer().IdentifierName()
        // 限制 1：组件标签名不能是 JavaScript 关键字
        const tagName = tokenValueOf(this.curToken)
        this.assertCondition(!OVS_TAG_BLACKLIST.has(tagName))

        this.Option(() => {
            // 使用 OVS 专属的参数语法
            return this.OvsArguments(params)
        })
        // 限制 2：标签名和 { 之间不能有换行符 [no LineTerminator here]
        this.assertNoLineBreak()
        this.getTokenConsumer().LBrace()
        if (!this.match(SlimeTokenType.RBrace)) {
            // 传递 params，继承 Yield/Await/Return 上下文
            this.StatementList(params)
        }
        this.getTokenConsumer().RBrace()
        // 不需要 SemicolonASI！这是语句版本，以 } 结尾即可
        return this.getCurCst()
    }

    /**
     * ClassHeritage - 覆盖父类，禁用 OvsRenderFunction
     *
     * 在 `class A extends B {}` 中，`B {}` 不应该被解析为 OvsRenderFunction。
     * 通过传递 DisableOvsRender: true 参数来禁用。
     */
    @SubhutiRule
    ClassHeritage(params: OvsExpressionParams = OVS_DEFAULT_PARAMS): any {
        this.getTokenConsumer().Extends()
        return this.LeftHandSideExpression(withParserParams(params, {DisableOvsRender: true}) as any)
    }

    /**
     * OvsViewDeclaration - OVS 视图声明
     * 语法: view Identifier (params)? { StatementList }
     *
     * 示例:
     * view Card(state) {
     *   div({ class: 'card' }) {
     *     h2 { state.props.title }
     *   }
     * }
     *
     * 注意：view 是软关键字（上下文关键字），用户仍可使用 view 作为变量名
     * 例如：const view = someValue  // 合法
     *
     * ✅ 硬编码无参数是正确的：
     * 根据 ES 规范，顶层声明（如 FunctionDeclaration）不接收 Yield/Await 参数，
     * 而是在内部硬编码。
     */
    @SubhutiRule
    OvsViewDeclaration() {
        // view ComponentName (params)? { StatementList }
        this.consumeIdentifierValue("view")              // view 软关键字
        this.getTokenConsumer().IdentifierName()         // 组件名
        this.Option(() => {
            // 可选的参数列表 (state)
            return this.ArrowFormalParameters(withParserParams(OVS_DEFAULT_PARAMS, {Yield: false, Await: false}) as any)
        })
        // 函数体 { ... }
        this.getTokenConsumer().LBrace()
        this.Option(() => {
            // 内部是 StatementList，支持 Return 语句
            return this.StatementList(withParserParams(OVS_DEFAULT_PARAMS, {Yield: false, Await: false, Return: true}) as unknown as StatementParams)
        })
        this.getTokenConsumer().RBrace()
        return this.getCurCst()
    }

    /**
     * NoRenderBlock - 不渲染代码块
     * 语法: #{ StatementList? }
     *
     * ⚠️ 需要修复：NoRenderBlock 应该接收并传递 params
     * NoRenderBlock 可以出现在任何 Statement 位置，需要继承外层的 Yield/Await 上下文。
     * 例如在 async 函数中的 #{ await something } 需要正确解析 await。
     */
    @SubhutiRule
    NoRenderBlock(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams) {
        // #{ statements } - 不渲染代码块
        this.getTokenConsumer().Hash()
        this.getTokenConsumer().LBrace()
        this.Option(() => {
            // ✅ 正确：传递 params，继承外层的 Yield/Await/Return 上下文
            return this.StatementList(params)
        })
        this.getTokenConsumer().RBrace()
        return this.getCurCst()
    }

    /**
     * FunctionBody - 覆盖父类，让函数/箭头函数块体继续使用 OVS Statement 分发。
     *
     * Slime 的箭头函数 ConciseBody 块分支会调用无参 FunctionBody()。
     * 如果这里不覆盖，块体内的 `return div {}` 会回到父类 StatementList，
     * 绕过 OVS 的 OvsRenderStatement/OvsRenderFunction 扩展。
     */
    FunctionBody(...args: any[]): any {
        if (args.length === 0) return this.OvsFunctionBody(withParserParams(OVS_DEFAULT_PARAMS, {Yield: false, Await: false}) as unknown as ExpressionParams)
        if (args.length === 1) return this.OvsFunctionBody(args[0] as unknown as ExpressionParams)
        throw new Error(`Unsupported OVS FunctionBody arity: ${args.length}`)
    }

    @SubhutiRule
    OvsFunctionBody(params: ExpressionParams = OVS_DEFAULT_PARAMS as unknown as ExpressionParams) {
        this.Option(() => {
            return this.StatementList(withParserParams(params, {Return: true}) as unknown as StatementParams)
        })
        return this.getCurCst()
    }

    AsyncFunctionBody(...args: any[]): any {
        if (args.length === 0) return this.OvsAsyncFunctionBody(withParserParams(OVS_DEFAULT_PARAMS, {Yield: false, Await: true}) as unknown as ExpressionParams)
        if (args.length === 1) return this.OvsAsyncFunctionBody(args[0] as unknown as ExpressionParams)
        throw new Error(`Unsupported OVS AsyncFunctionBody arity: ${args.length}`)
    }

    @SubhutiRule
    OvsAsyncFunctionBody(params: ExpressionParams = OVS_DEFAULT_PARAMS as unknown as ExpressionParams) {
        this.Option(() => {
            return this.StatementList(withParserParams(params, {Await: true, Return: true}) as unknown as StatementParams)
        })
        return this.getCurCst()
    }

    /**
     * Statement - 覆盖父类，添加 OvsRenderStatement 和 NoRenderBlock 支持
     *
     * OvsRenderStatement 放在最前面，优先尝试：
     * - 解决 ASI 问题：`div{"a"} div{"b"}` 可以正确解析
     * - 类似 ES 中 FunctionDeclaration/BlockStatement 不需要分号的设计
     * - 如果不匹配（如普通函数调用 `foo()`），会回溯到 ExpressionStatement
     *
     * 参数传递说明：
     * - OvsRenderStatement(params): ✅ 传递 params，继承 Yield/Await/Return 上下文
     * - NoRenderBlock(params): ✅ 传递 params，继承 Yield/Await/Return 上下文
     * - EmptyStatement(): ✅ 无参数是正确的，空语句不需要上下文
     * - DebuggerStatement(): ✅ 无参数是正确的，debugger 语句不需要上下文
     * 
     * 注意：不再支持 CssDeclarationStatement（css 声明语法），
     * 只支持 css 表达式语法（css { colorRed }），通过 PrimaryExpression 中的 CssExpression 实现。
     */
    @SubhutiRule
    Statement(params: StatementParams = OVS_DEFAULT_PARAMS as unknown as StatementParams): any {
        const Return = !!params.returnAllowed()
        const firstName = tokenNameOf(this.LA(1))
        if (this.canStartOvsRender()) return this.OvsRenderStatement(params)
        if (firstName === 'Hash') return this.NoRenderBlock(params)
        if (firstName === 'LBrace') return this.BlockStatement(params)
        if (firstName === 'Var' || firstName === 'Let' || firstName === 'Const') return this.VariableStatement(params)
        if (firstName === 'Semicolon') return this.EmptyStatement()
        if (firstName === 'If') return this.IfStatement(params)
        if (firstName === 'Do' || firstName === 'While' || firstName === 'For') return this.IterationStatement(params)
        if (firstName === 'Switch') return this.SwitchStatement(params)
        if (firstName === 'Continue') return this.ContinueStatement(params)
        if (firstName === 'Break') return this.BreakStatement(params)
        if (firstName === 'Return' && Return) return this.ReturnStatement(params)
        if (firstName === 'With') return this.WithStatement(params)
        if (firstName === 'Throw') return this.ThrowStatement(params)
        if (firstName === 'Try') return this.TryStatement(params)
        if (firstName === 'Debugger') return this.DebuggerStatement()
        if (firstName === 'IdentifierName' && tokenNameOf(this.LA(2)) === 'Colon') return this.LabelledStatement(params)

        return this.ExpressionStatement(params)
    }

    /**
     * Declaration - 覆盖父类，添加 OvsViewDeclaration 支持
     * 
     * 注意：不再支持 CssDeclaration（css 声明语法），
     * 只支持 css 表达式语法（css { colorRed }），通过 PrimaryExpression 中的 CssExpression 实现。
     */
    @SubhutiRule
    Declaration(params: DeclarationParams = OVS_DEFAULT_PARAMS as unknown as DeclarationParams): any {
        const first = this.LA(1)
        const firstName = tokenNameOf(first)
        const firstValue = tokenValueOf(first)
        const qinObjectDeclaration = (this as any).QinObjectDeclaration
        const qinObjectAlternatives = typeof qinObjectDeclaration === 'function'
            ? [Alternative.of(() => qinObjectDeclaration.call(this, params))]
            : []
        if (firstValue === 'view') {
            this.OvsViewDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Interface') {
            ;(this as any).TSInterfaceDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Type') {
            ;(this as any).TSTypeAliasDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Enum') {
            ;(this as any).TSEnumDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Const' || firstName === 'Let') {
            this.LexicalDeclaration(declarationLexicalParams(params))
            return this.getCurCst()
        }
        if (firstName === 'Function' || firstName === 'Async') {
            this.HoistableDeclaration(declarationHoistableParams(params))
            return this.getCurCst()
        }
        if (firstName === 'Class') {
            this.ClassDeclaration(declarationHoistableParams(params))
            return this.getCurCst()
        }
        return this.Or(
            Alternative.of(() => this.OvsViewDeclaration()),
            Alternative.of(() => (this as any).TSInterfaceDeclaration()),
            Alternative.of(() => (this as any).TSTypeAliasDeclaration()),
            Alternative.of(() => (this as any).TSEnumDeclaration()),
            Alternative.of(() => (this as any).TSModuleDeclaration()),
            ...qinObjectAlternatives,
            Alternative.of(() => this.LexicalDeclaration(declarationLexicalParams(params))),
            Alternative.of(() => this.HoistableDeclaration(declarationHoistableParams(params))),
            Alternative.of(() => this.ClassDeclaration(declarationHoistableParams(params))),
            Alternative.of(() => (CssTsParser.prototype as any).Declaration.call(this, params))
        )
    }

    @SubhutiRule
    ExportDeclaration(): any {
        return this.Or(
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                this.getTokenConsumer().Default()
                this.OvsRenderFunction(withParserParams(OVS_DEFAULT_PARAMS, {In: true}))
                this.SemicolonASI()
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                this.VariableStatement(withParserParams(OVS_DEFAULT_PARAMS, {Await: true}) as unknown as StatementParams)
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                this.Declaration(withParserParams(OVS_DEFAULT_PARAMS, {Default: false}) as unknown as DeclarationParams)
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                ;(this as any).TSInterfaceDeclaration()
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                ;(this as any).TSTypeAliasDeclaration()
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                ;(this as any).TSEnumDeclaration()
            }),
            Alternative.of(() => {
                this.getTokenConsumer().Export()
                ;(this as any).TSModuleDeclaration()
            }),
            Alternative.of(() => (CssTsParser.prototype as any).ExportDeclaration.call(this))
        )
    }

    /**
     * PrimaryExpression - 覆盖父类，添加 OvsRenderFunction 和 CssExpression 支持
     * OvsRenderFunction 放在 IdentifierReference 之前，因为都以 IdentifierName 开头
     * 依靠 Or 的回溯机制：OvsRenderFunction 失败时会回溯并尝试 IdentifierReference
     *
     * 注意：当 DisableOvsRender 为 true 时，跳过 OvsRenderFunction 分支。
     * 这用于 ClassHeritage 等上下文，避免 `class A extends B {}` 中的 `B {}` 被误解析。
     */
    @SubhutiRule
    PrimaryExpression(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        const normalizedParams = withParserParams(params)
        const DisableOvsRender = normalizedParams.disableOvsRender()

        return this.Or(
            Alternative.of(() => this.getTokenConsumer().This()),
            Alternative.of(() => this.CssExpression(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.AsyncGeneratorExpression()),
            Alternative.of(() => this.AsyncFunctionExpression()),
            ...(!DisableOvsRender ? [Alternative.of(() => this.OvsRenderFunction(normalizedParams))] : []),
            Alternative.of(() => this.IdentifierReference(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.Literal()),
            Alternative.of(() => this.GeneratorExpression()),
            Alternative.of(() => this.FunctionExpression()),
            Alternative.of(() => this.ClassExpression(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.ArrayLiteral(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.ObjectLiteral(normalizedParams as unknown as ExpressionParams)),
            Alternative.of(() => this.consumeRegularExpressionLiteral()),
            Alternative.of(() => this.TemplateLiteral(withParserParams(normalizedParams, {Tagged: false}) as unknown as ExpressionParams)),
            Alternative.of(() => this.CoverParenthesizedExpressionAndArrowParameterList(normalizedParams as unknown as ExpressionParams))
        )
    }

}

