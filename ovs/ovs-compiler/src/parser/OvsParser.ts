import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import { Subhuti, SubhutiPackratCache, SubhutiRule } from 'subhuti'
import type { SubhutiParserOr } from 'subhuti'
// 使用包名导入
import CssTsParser, { CssTsParserOptions } from "cssts-compiler/src/parser/CssTsParser.ts";
import {
    DeclarationParams as DeclarationParamsClass,
    ExpressionParams as ExpressionParamsClass,
    ReservedWords,
    SlimeJavascriptContextualKeywordTokenTypes,
    SlimeTokenType,
    StatementParams as StatementParamsClass
} from "@qin/generated-qin-parser-ts";
import { normalizeGeneratedTokens } from "cssts-compiler"

type OvsExpressionParams = OvsParserParams
const ovsAlt = (alt: () => void): SubhutiParserOr => ({alt})

/**
 * OVS 组件标签名黑名单
 * 包含 JavaScript 硬关键字 + 软关键字
 * 这些不能作为 OvsRenderFunction 的标签名
 */
const OVS_TAG_BLACKLIST_VALUES: string[] = [
    ...ReservedWords,
    ...Object.values(SlimeJavascriptContextualKeywordTokenTypes)
]

type OvsParserParamSource = OvsParserParams | ExpressionParamsClass | StatementParamsClass | DeclarationParamsClass | undefined
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
        if (this.inEnabled === value) return this
        return new OvsParserParams(
            value,
            this.yieldEnabled,
            this.awaitEnabled,
            this.taggedEnabled,
            this.returnEnabled,
            this.defaultEnabled,
            this.disableRenderEnabled
        )
    }

    expressionParams(): OvsParserParams {
        return this
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

function hasInParam(params: OvsParserParamSource): params is ExpressionParamsClass {
    return !!params && typeof (params as ExpressionParamsClass).__qin_in === 'function'
}

function hasYieldAwaitParam(params: OvsParserParamSource): params is ExpressionParamsClass | StatementParamsClass | DeclarationParamsClass {
    return !!params
        && typeof params.__qin_yield === 'function'
        && typeof params.__qin_await === 'function'
}

function hasTaggedParam(params: OvsParserParamSource): params is OvsParserParams {
    return !!params && typeof (params as OvsParserParams).tagged === 'function'
}

function hasReturnParam(params: OvsParserParamSource): params is StatementParamsClass {
    return !!params && typeof (params as StatementParamsClass).returnAllowed === 'function'
}

function hasDefaultParam(params: OvsParserParamSource): params is DeclarationParamsClass {
    return !!params && typeof (params as DeclarationParamsClass).isDefault === 'function'
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
    const cacheKey = (inEnabled ? '1' : '0')
        + (yieldEnabled ? '1' : '0')
        + (awaitEnabled ? '1' : '0')
        + (taggedEnabled ? '1' : '0')
        + (returnEnabled ? '1' : '0')
        + (defaultEnabled ? '1' : '0')
        + (disableRenderEnabled ? '1' : '0')
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

function declarationLexicalParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS): ExpressionParamsClass {
    return expressionParams(params, {In: true})
}

function declarationHoistableParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS): DeclarationParamsClass {
    return declarationParams(params, {Default: false})
}

function expressionParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS, overrides: OvsParserParamOverrides = {}): ExpressionParamsClass {
    const normalized = withParserParams(params, overrides)
    return new ExpressionParamsClass(normalized.__qin_in(), normalized.__qin_yield(), normalized.__qin_await())
}

function statementParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS, overrides: OvsParserParamOverrides = {}): StatementParamsClass {
    const normalized = withParserParams(params, overrides)
    return new StatementParamsClass(normalized.__qin_yield(), normalized.__qin_await(), normalized.returnAllowed())
}

function declarationParams(params: OvsParserParamSource = OVS_DEFAULT_PARAMS, overrides: OvsParserParamOverrides = {}): DeclarationParamsClass {
    const normalized = withParserParams(params, overrides)
    return new DeclarationParamsClass(normalized.__qin_yield(), normalized.__qin_await(), normalized.isDefault())
}

function tokenNameOf(token: any): string {
    if (token === null || token === undefined) return ''
    if (typeof token.getTokenName === 'function') return token.getTokenName()
    if (typeof token.tokenName === 'function') return token.tokenName()
    if (token.tokenName !== null && token.tokenName !== undefined) return token.tokenName
    if (token.name !== null && token.name !== undefined) return token.name
    return ''
}

function tokenValueOf(token: any): string {
    if (token === null || token === undefined) return ''
    if (typeof token.getTokenValue === 'function') return token.getTokenValue()
    if (typeof token.value === 'function') return token.value()
    if (token.tokenValue !== null && token.tokenValue !== undefined) return token.tokenValue
    if (token.value !== null && token.value !== undefined) return token.value
    return ''
}

function tokenHasLineBreakBefore(token: any): boolean {
    if (token === null || token === undefined) return false
    if (typeof token.hasLineBreakBefore === 'function') return token.hasLineBreakBefore() === true
    return token.lineBreakBefore === true
}

function tokenIndexOf(token: any): string {
    if (token === null || token === undefined) return ''
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
    private ovsTagBlacklist: Set<string> = new Set<string>(OVS_TAG_BLACKLIST_VALUES)
    private ovsRenderLookaheadCache: Map<string, boolean> = new Map<string, boolean>()
    private forInOfLookaheadCache: Map<string, boolean> = new Map<string, boolean>()
    private ovsAwaitStatementParams: StatementParamsClass = new OvsParserParams(
        true,
        false,
        true,
        false,
        false,
        false,
        false
    ) as unknown as StatementParamsClass
    private ovsAwaitDeclarationParams: DeclarationParamsClass = new OvsParserParams(
        true,
        false,
        true,
        false,
        false,
        false,
        false
    ) as unknown as DeclarationParamsClass
    private ovsAwaitReturnStatementParams: StatementParamsClass = new OvsParserParams(
        true,
        false,
        true,
        false,
        true,
        false,
        false
    ) as unknown as StatementParamsClass
    private ovsAwaitInExpressionParams: ExpressionParamsClass = new ExpressionParamsClass(true, false, true)
    private ovsDisableRenderParams: ExpressionParamsClass = new ExpressionParamsClass(true, false, false)
    private profileEnabled: boolean = false
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

    declare tokenConsumer: OvsTokenConsumer
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
    declare ClassExpression: (...args: any[]) => any
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
        super(sourceCode, new CssTsParserOptions(new OvsTokenConsumer(), ovs6Tokens))
        ;(this as any)._cache = new SubhutiPackratCache(100000)
    }

    enableProfile(): this {
        this.profileEnabled = false
        return this
    }

    getProfileReport(): string {
        return "profile=disabled"
    }

    LA(...args: any[]): any {
        return super.LA(...args)
    }

    _getOrParseTokenEntry(...args: any[]): any {
        return super._getOrParseTokenEntry(...args)
    }

    executeRuleWrapper(...args: any[]): any {
        return super.executeRuleWrapper(...args)
    }

    saveState(...args: any[]): any {
        return super.saveState(...args)
    }

    restoreState(...args: any[]): any {
        return super.restoreState(...args)
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
        const first = this.LA(1)
        const cacheKey = tokenIndexOf(first)
        const hasCacheKey = cacheKey !== ''
        if (hasCacheKey) {
            const cached = this.ovsRenderLookaheadCache.get(cacheKey)
            if (cached !== undefined) return cached
        }
        if (tokenNameOf(first) !== 'IdentifierName') return false
        if (this.ovsTagBlacklist.has(tokenValueOf(first))) return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, false)

        const second = this.LA(2)
        const secondName = tokenNameOf(second)
        if (secondName === 'LBrace') return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, tokenHasLineBreakBefore(second) === false)
        if (secondName !== 'LParen') return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, false)

        let depth = 0
        for (let offset = 2; offset < 256; offset++) {
            const token = this.LA(offset)
            const name = tokenNameOf(token)
            if (name === '') return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, false)
            if (name === 'LParen') {
                depth++
            } else if (name === 'RParen') {
                depth--
                if (depth === 0) {
                    const after = this.LA(offset + 1)
                    return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, tokenNameOf(after) === 'LBrace' && tokenHasLineBreakBefore(after) === false)
                }
            }
        }
        return this.rememberOvsRenderLookahead(cacheKey, hasCacheKey, false)
    }

    private canStartIdentifierReference(params: ExpressionParamsClass, lookaheadOffset: number): boolean {
        if (lookaheadOffset !== 1) return false
        const token = this.LA(lookaheadOffset)
        if (token == null) return false
        const tokenName = tokenNameOf(token)
        return this.canStartIdentifier(lookaheadOffset)
            || (!params.yield() && tokenName === 'Yield')
            || (!params.await() && tokenName === 'Await')
    }

    private canStartForInOfStatement(): boolean {
        const first = this.LA(1)
        const cacheKey = tokenIndexOf(first)
        const hasCacheKey = cacheKey !== ''
        if (hasCacheKey) {
            const cached = this.forInOfLookaheadCache.get(cacheKey)
            if (cached !== undefined) return cached
        }
        if (tokenNameOf(first) !== 'For') return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)
        let offset = 2
        if (tokenNameOf(this.LA(offset)) === 'Await') {
            offset++
        }
        if (tokenNameOf(this.LA(offset)) !== 'LParen') return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)

        let parenDepth = 0
        let braceDepth = 0
        let bracketDepth = 0
        while (offset < 160) {
            const token = this.LA(offset)
            const name = tokenNameOf(token)
            if (!name) return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)

            if (name === 'LParen') {
                parenDepth++
            } else if (name === 'RParen') {
                parenDepth--
                if (parenDepth === 0) return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)
            } else if (name === 'LBrace') {
                braceDepth++
            } else if (name === 'RBrace') {
                braceDepth--
            } else if (name === 'LBracket') {
                bracketDepth++
            } else if (name === 'RBracket') {
                bracketDepth--
            } else if (parenDepth === 1 && braceDepth === 0 && bracketDepth === 0) {
                if (name === 'Semicolon') return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)
                if (name === 'In' || tokenValueOf(token) === 'of') return this.rememberForInOfLookahead(cacheKey, hasCacheKey, true)
            }
            offset++
        }
        return this.rememberForInOfLookahead(cacheKey, hasCacheKey, false)
    }

    private rememberOvsRenderLookahead(cacheKey: string, hasCacheKey: boolean, value: boolean): boolean {
        if (hasCacheKey) this.ovsRenderLookaheadCache.set(cacheKey, value)
        return value
    }

    private rememberForInOfLookahead(cacheKey: string, hasCacheKey: boolean, value: boolean): boolean {
        if (hasCacheKey) this.forInOfLookaheadCache.set(cacheKey, value)
        return value
    }

    private ovsTokenConsumer(): OvsTokenConsumer {
        return this.tokenConsumer
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
            return this.StatementListItem(this.ovsAwaitStatementParams)
        }
        if (firstName === 'Import') {
            this.ImportDeclaration()
            return this.getCurCst()
        }
        if (firstName === 'Export') {
            this.ExportDeclaration()
            return this.getCurCst()
        }
        return this.StatementListItem(this.ovsAwaitStatementParams)
    }

    @SubhutiRule
    StatementListItem(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass): any {
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
            || (firstValue === 'async' && tokenNameOf(this.LA(2)) === 'Function')
        if (!canStartDeclaration) {
            return this.Statement(params)
        }
        return this.Declaration(this.ovsAwaitDeclarationParams)
    }

    @SubhutiRule
    StatementList(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass) {
        while (!this.isEof() && tokenNameOf(this.LA(1)) !== 'RBrace') {
            const before = this.currentTokenIndex()
            this.StatementListItem(params)
            this.assertCondition(this.currentTokenIndex() > before)
        }
    }

    @SubhutiRule
    IfStatement(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass) {
        this.ovsTokenConsumer().If()
        this.ovsTokenConsumer().LParen()
        this.Expression(this.ovsAwaitInExpressionParams)
        this.ovsTokenConsumer().RParen()
        this.IfStatementBody(params)
        if (tokenNameOf(this.LA(1)) === 'Else') {
            this.ovsTokenConsumer().Else()
            this.IfStatementBody(params)
        }
        return this.getCurCst()
    }

    @SubhutiRule
    IterationStatement(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass) {
        const firstName = tokenNameOf(this.LA(1))
        if (firstName === 'Do') return this.DoWhileStatement(params)
        if (firstName === 'While') return this.WhileStatement(params)
        if (this.canStartForInOfStatement()) {
            return this.ForInOfStatement(params)
        }
        if (firstName === 'For') return this.ForStatement(params)
        this.assertCondition(false)
        return this.getCurCst()
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
        this.assertCondition(this.canStartOvsRender())
        this.ovsTokenConsumer().IdentifierName()
        // 限制 1：组件标签名不能是 JavaScript 关键字
        const tagName = tokenValueOf(this.curToken)
        this.assertCondition(!this.ovsTagBlacklist.has(tagName))

        if (tokenNameOf(this.LA(1)) === 'LParen') {
            // 使用 OVS 专属的参数语法
            this.OvsArguments(this.ovsAwaitInExpressionParams)
        }
        // 限制 2：标签名和 { 之间不能有换行符 [no LineTerminator here]
        this.assertNoLineBreak()
        this.ovsTokenConsumer().LBrace()
        if (!this.match(SlimeTokenType.RBrace)) {
            // ✅ 正确：传递 params
            // OvsRenderFunction 的 body 类似于 FunctionBody，需要传递 Yield/Await 参数
            // 这样在 async 组件中可以使用 await，在 generator 组件中可以使用 yield
            this.StatementList(this.ovsAwaitStatementParams)
        }
        this.ovsTokenConsumer().RBrace()
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
        this.ovsTokenConsumer().LParen()
        if (tokenNameOf(this.LA(1)) !== 'RParen') {
            this.OvsPropertyDefinitionList(this.ovsAwaitInExpressionParams)
        }
        this.ovsTokenConsumer().RParen()
        return this.getCurCst()
    }

    /**
     * OvsPropertyDefinitionList - OVS 属性定义列表
     * 语法: OvsPropertyDefinition (; OvsPropertyDefinition)* ;?
     */
    @SubhutiRule
    OvsPropertyDefinitionList(params: OvsParserParamSource = OVS_DEFAULT_PARAMS) {
        this.OvsPropertyDefinition(this.ovsAwaitInExpressionParams)
        while (tokenNameOf(this.LA(1)) === 'Semicolon') {
            this.ovsTokenConsumer().Semicolon()
            if (tokenNameOf(this.LA(1)) === 'RParen') break
            this.OvsPropertyDefinition(this.ovsAwaitInExpressionParams)
        }
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
        const firstName = tokenNameOf(this.LA(1))
        const secondName = tokenNameOf(this.LA(2))
        if (firstName === 'Ellipsis') {
            this.ovsTokenConsumer().Ellipsis()
            return this.AssignmentExpression(this.ovsAwaitInExpressionParams)
        }
        if (secondName === 'Assign') {
            this.PropertyName(this.ovsAwaitInExpressionParams)
            this.ovsTokenConsumer().Assign()
            return this.AssignmentExpression(this.ovsAwaitInExpressionParams)
        }
        if (secondName === 'LParen') {
            return this.MethodDefinition(this.ovsAwaitInExpressionParams)
        }
        return this.IdentifierReference(this.ovsAwaitInExpressionParams)
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
    OvsRenderStatement(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass) {
        this.assertCondition(this.canStartOvsRender())
        this.ovsTokenConsumer().IdentifierName()
        // 限制 1：组件标签名不能是 JavaScript 关键字
        const tagName = tokenValueOf(this.curToken)
        this.assertCondition(!this.ovsTagBlacklist.has(tagName))

        if (tokenNameOf(this.LA(1)) === 'LParen') {
            // 使用 OVS 专属的参数语法
            this.OvsArguments(params)
        }
        // 限制 2：标签名和 { 之间不能有换行符 [no LineTerminator here]
        this.assertNoLineBreak()
        this.ovsTokenConsumer().LBrace()
        if (!this.match(SlimeTokenType.RBrace)) {
            // 传递 params，继承 Yield/Await/Return 上下文
            this.StatementList(params)
        }
        this.ovsTokenConsumer().RBrace()
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
        this.ovsTokenConsumer().Extends()
        return this.LeftHandSideExpression(this.ovsDisableRenderParams)
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
        this.ovsTokenConsumer().IdentifierName()         // 组件名
        if (tokenNameOf(this.LA(1)) === 'LParen') {
            // 可选的参数列表 (state)
            this.ArrowFormalParameters(new ExpressionParamsClass(true, false, false))
        }
        // 函数体 { ... }
        this.ovsTokenConsumer().LBrace()
        if (tokenNameOf(this.LA(1)) !== 'RBrace') {
            // 内部是 StatementList，支持 Return 语句
            this.StatementList(this.ovsAwaitReturnStatementParams)
        }
        this.ovsTokenConsumer().RBrace()
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
    NoRenderBlock(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass) {
        // #{ statements } - 不渲染代码块
        this.ovsTokenConsumer().Hash()
        this.ovsTokenConsumer().LBrace()
        if (tokenNameOf(this.LA(1)) !== 'RBrace') {
            // ✅ 正确：传递 params，继承外层的 Yield/Await/Return 上下文
            this.StatementList(params)
        }
        this.ovsTokenConsumer().RBrace()
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
        if (args.length === 0) return this.OvsFunctionBody(this.ovsAwaitInExpressionParams)
        if (args.length === 1) return this.OvsFunctionBody(args[0] as unknown as ExpressionParamsClass)
        throw new Error(`Unsupported OVS FunctionBody arity: ${args.length}`)
    }

    @SubhutiRule
    OvsFunctionBody(params: ExpressionParamsClass = OVS_DEFAULT_PARAMS as unknown as ExpressionParamsClass) {
        if (tokenNameOf(this.LA(1)) !== 'RBrace') {
            this.StatementList(this.ovsAwaitReturnStatementParams)
        }
        return this.getCurCst()
    }

    AsyncFunctionBody(...args: any[]): any {
        if (args.length === 0) return this.OvsAsyncFunctionBody(this.ovsAwaitInExpressionParams)
        if (args.length === 1) return this.OvsAsyncFunctionBody(args[0] as unknown as ExpressionParamsClass)
        throw new Error(`Unsupported OVS AsyncFunctionBody arity: ${args.length}`)
    }

    @SubhutiRule
    OvsAsyncFunctionBody(params: ExpressionParamsClass = OVS_DEFAULT_PARAMS as unknown as ExpressionParamsClass) {
        if (tokenNameOf(this.LA(1)) !== 'RBrace') {
            this.StatementList(this.ovsAwaitReturnStatementParams)
        }
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
    Statement(params: StatementParamsClass = OVS_DEFAULT_PARAMS as unknown as StatementParamsClass): any {
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
        if (firstName === 'Return') return this.ReturnStatement(params)
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
    Declaration(params: DeclarationParamsClass = OVS_DEFAULT_PARAMS as unknown as DeclarationParamsClass): any {
        const first = this.LA(1)
        const firstName = tokenNameOf(first)
        const firstValue = tokenValueOf(first)
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
            this.LexicalDeclaration(this.ovsAwaitInExpressionParams)
            return this.getCurCst()
        }
        if (firstName === 'Function' || firstName === 'Async') {
            this.HoistableDeclaration(this.ovsAwaitDeclarationParams)
            return this.getCurCst()
        }
        if (firstName === 'Class') {
            this.ClassDeclaration(this.ovsAwaitDeclarationParams)
            return this.getCurCst()
        }
        this.assertCondition(false)
        return this.getCurCst()
    }

    @SubhutiRule
    ExportDeclaration(): any {
        this.ovsTokenConsumer().Export()
        const firstName = tokenNameOf(this.LA(1))
        if (firstName === 'Default') {
            this.ovsTokenConsumer().Default()
            this.OvsRenderFunction(this.ovsAwaitInExpressionParams)
            this.SemicolonASI()
            return this.getCurCst()
        }
        if (firstName === 'Var' || firstName === 'Let' || firstName === 'Const') {
            this.VariableStatement(this.ovsAwaitStatementParams)
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
        this.Declaration(this.ovsAwaitDeclarationParams)
        return this.getCurCst()
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
        const expressionParams = params as unknown as ExpressionParamsClass
        const disableOvsRender = params === this.ovsDisableRenderParams
        const firstName = tokenNameOf(this.LA(1))
        const firstValue = tokenValueOf(this.LA(1))
        const secondName = tokenNameOf(this.LA(2))

        if (firstName === 'This') return this.ovsTokenConsumer().This()
        if (firstValue === 'css') return this.CssExpression(expressionParams)
        if (this.canStartAsyncGeneratorExpressionAt(1)) return this.AsyncGeneratorExpression()
        if (this.canStartAsyncFunctionExpressionAt(1)) return this.AsyncFunctionExpression()
        if (!disableOvsRender && this.canStartOvsRender()) return this.OvsRenderFunction(OVS_DEFAULT_PARAMS)
        if (this.canStartIdentifierReference(expressionParams, 1)) return this.IdentifierReference(expressionParams)
        if (firstName === 'NullLiteral'
            || firstName === 'True'
            || firstName === 'False'
            || firstName === 'NumericLiteral'
            || firstName === 'StringLiteral') {
            return this.Literal()
        }
        if (firstName === 'Function' && secondName === 'Asterisk') return this.GeneratorExpression()
        if (firstName === 'Function') return this.FunctionExpression()
        if (firstName === 'Class') return this.ClassExpression(expressionParams)
        if (firstName === 'LBracket') return this.ArrayLiteral(expressionParams)
        if (firstName === 'LBrace') return this.ObjectLiteral(expressionParams)
        if (this.canStartRegularExpressionLiteralAt(1)) return this.consumeRegularExpressionLiteral()
        if (firstName === 'NoSubstitutionTemplate' || firstName === 'TemplateHead') {
            return this.TemplateLiteral(expressionParams)
        }
        if (firstName === 'LParen') {
            return this.CoverParenthesizedExpressionAndArrowParameterList(expressionParams)
        }

        this.assertCondition(false)
        return this.getCurCst()
    }

}

function __qin_mark_ovs_parser_rule(method: any, ruleName: string): any {
    if (typeof method !== 'function') return method
    __qin_mark_ovs_parser_rule_value(method, ruleName)
    const nestedMethod = __qin_clone_ovs_parser_rule(method, ruleName)
    nestedMethod.method = method
    method.method = nestedMethod
    return method
}

function __qin_mark_ovs_parser_rule_value(method: any, ruleName: string): any {
    if (typeof method !== 'function') return method
    method.__isSubhutiRule__ = true
    method.__qinSubhutiRuleWrapped = true
    method.__qinSubhutiRuleName = ruleName
    try {
        Object.defineProperty(method, 'name', {
            value: ruleName,
            writable: false,
            enumerable: false,
            configurable: true
        })
    } catch (error) {
    }
    return method
}

function __qin_clone_ovs_parser_rule(method: any, ruleName: string): any {
    const cloned = function (this: any, ...args: any[]) {
        return method.apply(this, args)
    }
    __qin_mark_ovs_parser_rule_value(cloned, ruleName)
    return cloned
}

__qin_mark_ovs_parser_rule((OvsParser as any).prototype.Program, 'Program')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsProgram, 'OvsProgram')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.ModuleItemList, 'ModuleItemList')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.ModuleItem, 'ModuleItem')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.StatementListItem, 'StatementListItem')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.StatementList, 'StatementList')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.IfStatement, 'IfStatement')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.IterationStatement, 'IterationStatement')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsRenderFunction, 'OvsRenderFunction')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsArguments, 'OvsArguments')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsPropertyDefinitionList, 'OvsPropertyDefinitionList')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsPropertyDefinition, 'OvsPropertyDefinition')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsRenderStatement, 'OvsRenderStatement')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.ClassHeritage, 'ClassHeritage')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsViewDeclaration, 'OvsViewDeclaration')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.NoRenderBlock, 'NoRenderBlock')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsFunctionBody, 'OvsFunctionBody')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.OvsAsyncFunctionBody, 'OvsAsyncFunctionBody')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.Statement, 'Statement')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.Declaration, 'Declaration')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.ExportDeclaration, 'ExportDeclaration')
__qin_mark_ovs_parser_rule((OvsParser as any).prototype.PrimaryExpression, 'PrimaryExpression')

