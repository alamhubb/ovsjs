import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import { Alternative, Subhuti, SubhutiPackratCache, SubhutiRule } from 'subhuti'
// 使用包名导入
import { CssTsParser } from "cssts-compiler";
import {
    ReservedWords,
    SlimeJavascriptContextualKeywordTokenTypes,
    SlimeTokenType
} from "@qin/generated-qin-parser-ts";
import type { ExpressionParams, StatementParams, DeclarationParams } from "@qin/generated-qin-parser-ts";
import { normalizeGeneratedTokens } from "cssts-compiler"

/** OVS 扩展的表达式参数 */
interface OvsExpressionParams extends ExpressionParams {
    /** 禁用 OvsRenderFunction（用于 ClassHeritage 等上下文） */
    DisableOvsRender?: boolean
}

/**
 * OVS 组件标签名黑名单
 * 包含 JavaScript 硬关键字 + 软关键字
 * 这些不能作为 OvsRenderFunction 的标签名
 */
const OVS_TAG_BLACKLIST = new Set([
    ...ReservedWords,
    ...Object.values(SlimeJavascriptContextualKeywordTokenTypes)
])

type OvsParserParams = ExpressionParams & StatementParams & DeclarationParams & OvsExpressionParams
type OvsParserParamFlags = Record<string, boolean>

const PARSER_PARAM_KEYS = ['Yield', 'Await', 'In', 'Tagged', 'Return', 'Default', 'DisableOvsRender']
const PARSER_PARAM_CACHE = new Map<string, OvsParserParams>()

function readParamFlag(params: any, key: string, defaultValue = false): boolean {
    if (!params) return defaultValue
    const direct = params[key]
    if (typeof direct === 'boolean') return direct
    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1)
    const lowerDirect = params[lowerKey]
    if (typeof lowerDirect === 'boolean') return lowerDirect
    if (typeof lowerDirect === 'function') return !!lowerDirect.call(params)
    const javaGetterKey = key === 'Default' ? 'isDefault' : lowerKey
    const javaGetter = params[javaGetterKey]
    if (typeof javaGetter === 'function') return !!javaGetter.call(params)
    return defaultValue
}

function withParserParams(params: any = {}, overrides: Record<string, any> = {}): OvsParserParams {
    const normalized: OvsParserParamFlags = {
        Yield: readParamFlag(params, 'Yield'),
        Await: readParamFlag(params, 'Await'),
        In: readParamFlag(params, 'In'),
        Tagged: readParamFlag(params, 'Tagged'),
        Return: readParamFlag(params, 'Return'),
        Default: readParamFlag(params, 'Default'),
        DisableOvsRender: readParamFlag(params, 'DisableOvsRender')
    }
    for (const key of PARSER_PARAM_KEYS) {
        if (Object.prototype.hasOwnProperty.call(overrides, key)) {
            normalized[key] = !!overrides[key]
        }
    }
    const cacheKey = PARSER_PARAM_KEYS.map((key) => normalized[key] ? '1' : '0').join('')
    const cached = PARSER_PARAM_CACHE.get(cacheKey)
    if (cached) return cached

    const stableParams: Record<string, any> = {...normalized}
    stableParams.yield = () => stableParams.Yield
    stableParams.await = () => stableParams.Await
    stableParams.in = () => stableParams.In
    stableParams.tagged = () => stableParams.Tagged
    stableParams.return = () => stableParams.Return
    stableParams.isDefault = () => stableParams.Default
    stableParams.disableOvsRender = () => stableParams.DisableOvsRender
    stableParams.withIn = (value: boolean) => withParserParams(stableParams, {In: value})
    stableParams.expressionParams = () => withParserParams(stableParams)
    stableParams.hashCode = () => {
        let hash = 17
        for (const key of PARSER_PARAM_KEYS) {
            hash = hash * 31 + (stableParams[key] ? 1231 : 1237)
        }
        return hash
    }
    stableParams.equals = (other: any) => {
        if (!other) return false
        for (const key of PARSER_PARAM_KEYS) {
            if (readParamFlag(other, key) !== stableParams[key]) return false
        }
        return true
    }
    PARSER_PARAM_CACHE.set(cacheKey, stableParams as OvsParserParams)
    return stableParams as OvsParserParams
}

function declarationLexicalParams(params: any = {}): ExpressionParams {
    return withParserParams(params, {In: true}) as ExpressionParams
}

function declarationHoistableParams(params: any = {}): DeclarationParams {
    return withParserParams(params, {Default: false}) as DeclarationParams
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
 * - OVS 视图语法：view ComponentName() { }, tag({ props }) { children }
 * 
 * 注意：不支持 css 声明语法（如 `css colorRed`），只支持 css 表达式语法。
 * 详见 CssTsParser 和 ARCHITECTURE.md 的说明。
 */
@Subhuti
export default class OvsParser extends CssTsParser<OvsTokenConsumer> {
    private ovsRenderLookaheadCache = new Map<string, boolean>()
    private forInOfLookaheadCache = new Map<string, boolean>()

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

    get parsedTokens(): any[] {
        const tokens = typeof (this as any).getParsedTokens === 'function'
            ? (this as any).getParsedTokens()
            : (this as any).__qin_field_parsedTokens
        return normalizeGeneratedTokens(tokens)
    }

    private canStartOvsRender(): boolean {
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
        this.ModuleItem()
        this.Many(() => this.ModuleItem())
    }

    @SubhutiRule
    StatementList(params: StatementParams = {}, stopTokens: Array<{ tokenName: string; tokenValue?: string }> = []) {
        this.Many(() => this.StatementListItem(params))
    }

    @SubhutiRule
    IfStatement(params: StatementParams = {}) {
        this.getTokenConsumer().If()
        this.getTokenConsumer().LParen()
        this.Expression(withParserParams(params, {In: true}) as ExpressionParams)
        this.getTokenConsumer().RParen()
        this.IfStatementBody(params)
        this.Option(() => {
            this.getTokenConsumer().Else()
            return this.IfStatementBody(params)
        })
        return this.getCurCst()
    }

    @SubhutiRule
    IterationStatement(params: StatementParams = {}) {
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
    OvsRenderFunction(params: OvsExpressionParams = {}) {
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
            // ✅ 正确：传递 params
            // OvsRenderFunction 的 body 类似于 FunctionBody，需要传递 Yield/Await 参数
            // 这样在 async 组件中可以使用 await，在 generator 组件中可以使用 yield
            this.StatementList(params)
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
     * - div(class = "foo", id = "bar") {}
     * - div(onClick() { console.log('clicked') }) {}
     */
    @SubhutiRule
    OvsArguments(params: OvsExpressionParams = {}) {
        this.getTokenConsumer().LParen()
        this.Option(() => {
            return this.Or(
                Alternative.of(() => this.ObjectLiteral(params)),
                Alternative.of(() => this.OvsPropertyDefinitionList(params))
            )
        })
        this.getTokenConsumer().RParen()
        return this.getCurCst()
    }

    /**
     * OvsPropertyDefinitionList - OVS 属性定义列表
     * 语法: OvsPropertyDefinition (, OvsPropertyDefinition)*
     */
    @SubhutiRule
    OvsPropertyDefinitionList(params: OvsExpressionParams = {}) {
        this.OvsPropertyDefinition(params)
        this.Many(() => {
            this.getTokenConsumer().Comma()
            this.OvsPropertyDefinition(params)
            return this.getCurCst()
        })
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
    OvsPropertyDefinition(params: OvsExpressionParams = {}) {
        return this.Or(
            Alternative.of(() => {
                this.getTokenConsumer().Ellipsis()
                return this.AssignmentExpression(withParserParams(params, {In: true}))
            }),
            Alternative.of(() => {
                this.PropertyName(params)
                this.getTokenConsumer().Assign()
                return this.AssignmentExpression(withParserParams(params, {In: true}))
            }),
            Alternative.of(() => this.MethodDefinition(params)),
            Alternative.of(() => this.IdentifierReference(params))
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
    OvsRenderStatement(params: StatementParams = {}) {
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
    ClassHeritage(params: OvsExpressionParams = {}): any {
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
            return this.ArrowFormalParameters(withParserParams({}, {Yield: false, Await: false}) as any)
        })
        // 函数体 { ... }
        this.getTokenConsumer().LBrace()
        this.Option(() => {
            // 内部是 StatementList，支持 Return 语句
            return this.StatementList(withParserParams({}, {Yield: false, Await: false, Return: true}) as StatementParams)
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
    NoRenderBlock(params: StatementParams = {}) {
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
    @SubhutiRule
    FunctionBody(params: ExpressionParams = {}) {
        this.Option(() => {
            return this.StatementList(withParserParams(params, {Return: true}) as StatementParams)
        })
        return this.getCurCst()
    }

    @SubhutiRule
    AsyncFunctionBody(params: ExpressionParams = {}) {
        this.Option(() => {
            return this.StatementList(withParserParams(params, {Await: true, Return: true}) as StatementParams)
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
    Statement(params: StatementParams = {}): any {
        const Return = readParamFlag(params, 'Return')
        const firstName = tokenNameOf(this.LA(1))
        if (this.canStartOvsRender()) return this.OvsRenderStatement(params)
        if (firstName === 'Hash') return this.NoRenderBlock(params)
        if (firstName === 'LBrace') return this.BlockStatement(params)
        if (firstName === 'Var' || firstName === 'Let' || firstName === 'Const') return this.VariableStatement(params)
        if (firstName === 'Semicolon') return this.EmptyStatement()
        if (firstName === 'If') return this.IfStatement(params)
        if (firstName === 'Do' || firstName === 'While' || firstName === 'For') return this.IterationStatement(params)
        if (firstName === 'Continue') return this.ContinueStatement(params)
        if (firstName === 'Break') return this.BreakStatement(params)
        if (firstName === 'Return' && Return) return this.ReturnStatement(params)
        if (firstName === 'With') return this.WithStatement(params)
        if (firstName === 'Throw') return this.ThrowStatement(params)
        if (firstName === 'Try') return this.TryStatement(params)
        if (firstName === 'Debugger') return this.DebuggerStatement()

        return this.Or(
            Alternative.of(() => this.OvsRenderStatement(params)),
            Alternative.of(() => this.NoRenderBlock(params)),
            Alternative.of(() => this.BlockStatement(params)),
            Alternative.of(() => this.VariableStatement(params)),
            Alternative.of(() => this.EmptyStatement()),
            Alternative.of(() => this.ExpressionStatement(params)),
            Alternative.of(() => this.IfStatement(params)),
            Alternative.of(() => this.BreakableStatement(params)),
            Alternative.of(() => this.ContinueStatement(params)),
            Alternative.of(() => this.BreakStatement(params)),
            ...(Return ? [Alternative.of(() => this.ReturnStatement(params))] : []),
            Alternative.of(() => this.WithStatement(params)),
            Alternative.of(() => this.LabelledStatement(params)),
            Alternative.of(() => this.ThrowStatement(params)),
            Alternative.of(() => this.TryStatement(params)),
            Alternative.of(() => this.DebuggerStatement())
        )
    }

    /**
     * Declaration - 覆盖父类，添加 OvsViewDeclaration 支持
     * 
     * 注意：不再支持 CssDeclaration（css 声明语法），
     * 只支持 css 表达式语法（css { colorRed }），通过 PrimaryExpression 中的 CssExpression 实现。
     */
    @SubhutiRule
    Declaration(params: DeclarationParams = {}): any {
        return this.Or(
            Alternative.of(() => this.OvsViewDeclaration()),
            Alternative.of(() => (this as any).QinObjectDeclaration(params)),
            Alternative.of(() => this.LexicalDeclaration(declarationLexicalParams(params))),
            Alternative.of(() => this.HoistableDeclaration(declarationHoistableParams(params))),
            Alternative.of(() => this.ClassDeclaration(declarationHoistableParams(params)))
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
    PrimaryExpression(params: OvsExpressionParams = {}) {
        const DisableOvsRender = readParamFlag(params, 'DisableOvsRender')

        return this.Or(
            Alternative.of(() => this.getTokenConsumer().This()),
            Alternative.of(() => this.CssExpression(params)),
            Alternative.of(() => this.AsyncGeneratorExpression()),
            Alternative.of(() => this.AsyncFunctionExpression()),
            ...(!DisableOvsRender ? [Alternative.of(() => this.OvsRenderFunction(params))] : []),
            Alternative.of(() => this.IdentifierReference(params)),
            Alternative.of(() => this.Literal()),
            Alternative.of(() => this.GeneratorExpression()),
            Alternative.of(() => this.FunctionExpression()),
            Alternative.of(() => this.ClassExpression(params)),
            Alternative.of(() => this.ArrayLiteral(params)),
            Alternative.of(() => this.ObjectLiteral(params)),
            Alternative.of(() => this.consumeRegularExpressionLiteral()),
            Alternative.of(() => this.TemplateLiteral(withParserParams(params, {Tagged: false}))),
            Alternative.of(() => this.CoverParenthesizedExpressionAndArrowParameterList(params))
        )
    }

}

