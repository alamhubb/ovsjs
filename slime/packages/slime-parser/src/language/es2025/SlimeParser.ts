/**
 * ES2025 Parser - 完全符合 ECMAScript® 2025 规范的 Parser
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. 完全按照规范语法实现，一对一映射
 * 2. 每个规则都是独立的方法，使用 @SubhutiRule 装饰器
 * 3. 使用 Es2025TokenConsumer 提供类型安全的 token 消费
 * 4. 支持所有参数化规则 [Yield, Await, In, Return, Default, Tagged]
 *
 * @version 1.0.0
 */
import SubhutiParser, {Subhuti, SubhutiRule} from "subhuti/src/SubhutiParser.ts"
import type SubhutiCst from "subhuti/src/struct/SubhutiCst.ts"
import type SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts"
import SubhutiLexer, {matchRegExpLiteral, LexicalGoal} from "subhuti/src/SubhutiLexer.ts"
import SlimeTokenConsumer from "./SlimeTokenConsumer.ts"
import {
    SlimeContextualKeywordTokenTypes,
    SlimeReservedWordTokenTypes,
    SlimeTokenType
} from "slime-token/src/SlimeTokenType.ts";
import {slimeTokens} from "./SlimeTokens.ts";

// ============================================
// 保留字集合（用于 Identifier 验证）
// ============================================

/**
 * ES2025 保留字集合
 * 来源：ECMAScript® 2025 规范 12.7.2 Keywords and Reserved Words
 *
 * 分类说明：
 * 1. 硬关键字（永久保留，在此集合中）：
 *    break, case, catch, class, const, continue, debugger, default,
 *    delete, do, else, enum, export, extends, false, finally, for, function,
 *    if, import, in, instanceof, new, null, return, super, switch, this,
 *    throw, true, try, typeof, var, void, while, with, await, yield
 *    实现方式：createKeywordToken + 独立 Token
 *
 * 2. 软关键字（不在此集合中，可作标识符）：
 *    async, let, static, as, get, set, of, from, target, meta
 *    - async: 可作变量名，如 `let async = 1`
 *    - let, static: 非严格模式下可作标识符
 *    - 其他: 仅在特定语法位置是关键字
 *    实现方式：识别为 IdentifierName + consumeIdentifierValue()
 *
 * 用途：在 Parser 中验证标识符是否为保留字
 * 实现：自动从所有 isKeyword=true 的 token 中提取（仅包含硬关键字）
 */


export const ReservedWords = new Set(
    slimeTokens
        .filter(token => token.isKeyword)  // 过滤出所有硬关键字 token
        .map(token => token.value!)        // 提取 value（'await', 'break' 等）
)

// ============================================
// 参数化规则的参数接口
// ============================================

interface ExpressionParams {
    In?: boolean      // 是否允许 in 运算符
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
}

interface StatementParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Return?: boolean  // 是否允许 return 语句
}

interface DeclarationParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Default?: boolean // 是否是默认导出
}

interface TemplateLiteralParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Tagged?: boolean  // 是否是 Tagged 模板
}

// ============================================
// Unicode 转义标识符验证
// 参考 Acorn 实现：https://github.com/acornjs/acorn
//
// 根据 ECMAScript 规范 12.7:
// - IdentifierStart: UnicodeIDStart | $ | _ | \ UnicodeEscapeSequence
// - IdentifierPart: UnicodeIDContinue | $ | \ UnicodeEscapeSequence | ZWNJ | ZWJ
//
// 当标识符包含 \uXXXX 或 \u{XXXXX} 转义时，需要验证解码后的字符
// 是否满足 ID_Start（第一个字符）或 ID_Continue（后续字符）属性
// ============================================

// ID_Start 和 ID_Continue 的正则表达式（使用 Unicode 属性）
const ID_START_REGEX = /^[\p{ID_Start}$_]$/u
const ID_CONTINUE_REGEX = /^[\p{ID_Continue}$\u200C\u200D]$/u

/**
 * 解码 Unicode 转义序列
 * 支持 \uXXXX 和 \u{XXXXX} 格式
 */
function decodeUnicodeEscape(escape: string): number | null {
    if (escape.startsWith('\\u{') && escape.endsWith('}')) {
        // \u{XXXXX} 格式
        const hex = escape.slice(3, -1)
        const codePoint = parseInt(hex, 16)
        if (isNaN(codePoint) || codePoint > 0x10FFFF) return null
        return codePoint
    } else if (escape.startsWith('\\u') && escape.length === 6) {
        // \uXXXX 格式
        const hex = escape.slice(2)
        const codePoint = parseInt(hex, 16)
        if (isNaN(codePoint)) return null
        return codePoint
    }
    return null
}

/**
 * 解码标识符中的 Unicode 转义序列
 * 返回解码后的字符串，如果解码失败返回 null
 */
function decodeIdentifier(name: string): string | null {
    // 解析标识符，提取每个字符（包括转义序列）
    const chars: string[] = []
    let i = 0

    while (i < name.length) {
        if (name[i] === '\\' && name[i + 1] === 'u') {
            // Unicode 转义序列
            if (name[i + 2] === '{') {
                // \u{XXXXX} 格式
                const endBrace = name.indexOf('}', i + 3)
                if (endBrace === -1) return null
                const escape = name.slice(i, endBrace + 1)
                const codePoint = decodeUnicodeEscape(escape)
                if (codePoint === null) return null
                chars.push(String.fromCodePoint(codePoint))
                i = endBrace + 1
            } else {
                // \uXXXX 格式
                if (i + 6 > name.length) return null
                const escape = name.slice(i, i + 6)
                const codePoint = decodeUnicodeEscape(escape)
                if (codePoint === null) return null
                chars.push(String.fromCodePoint(codePoint))
                i += 6
            }
        } else {
            // 普通字符（可能是多字节 Unicode）
            const codePoint = name.codePointAt(i)!
            chars.push(String.fromCodePoint(codePoint))
            i += codePoint > 0xFFFF ? 2 : 1
        }
    }

    return chars.join('')
}

/**
 * 验证包含 Unicode 转义的标识符是否有效
 *
 * 按照 ECMAScript 规范，Unicode 转义解码后的字符必须满足：
 * - 第一个字符：ID_Start | $ | _
 * - 后续字符：ID_Continue | $ | ZWNJ | ZWJ
 */
function isValidIdentifierWithEscapes(name: string): boolean {
    const decoded = decodeIdentifier(name)
    if (decoded === null || decoded.length === 0) return false

    // 验证第一个字符是否满足 ID_Start
    if (!ID_START_REGEX.test(decoded[0])) {
        return false
    }

    // 验证后续字符是否满足 ID_Continue
    for (let j = 1; j < decoded.length; j++) {
        if (!ID_CONTINUE_REGEX.test(decoded[j])) {
            return false
        }
    }

    return true
}

// ============================================
// Es2025Parser 主类
// ============================================

@Subhuti
export default class SlimeParser extends SubhutiParser<SlimeTokenConsumer> {
    /**
     * 构造函数
     * @param sourceCode 原始源码，使用按需词法分析模式
     */
    constructor(sourceCode: string = '') {
        // 使用按需词法分析模式（On-Demand Lexing）
        // Parser 在需要 token 时告诉 Lexer 期望什么（InputElementDiv 或 InputElementRegExp）
        super([], {
            tokenConsumer: SlimeTokenConsumer,
            sourceCode: sourceCode,
            tokenDefinitions: slimeTokens
        })
    }

    // ============================================
    // Token 匹配方法 (Token Matching)
    // 符合 Babel/Acorn 的 match/isContextual 设计模式
    // ============================================
    /**
     * 检查当前 token 是否是指定的上下文关键字（软关键字）
     * @param value 软关键字的值（如 SlimeContextualKeywordTokenTypes.LET）
     */
    protected isContextual(value: string): boolean {
        return this.match(SlimeTokenType.IdentifierName) && this.curToken?.tokenValue === value
    }

    /**
     * 检查从当前位置开始是否是：上下文关键字 + 后续 token 序列
     * @param contextualValue 软关键字的值
     * @param nextTokenNames 后续 token 名称列表
     */
    protected isContextualSequence(contextualValue: string, ...nextTokenNames: string[]): boolean {
        if (!this.isContextual(contextualValue)) return false
        for (let i = 0; i < nextTokenNames.length; i++) {
            const token = this.peek(i + 1)
            if (token?.tokenName !== nextTokenNames[i]) return false
        }
        return true
    }

    /**
     * 检查从当前位置开始是否是：上下文关键字 + 后续 token 序列（中间无换行符）
     * @param contextualValue 软关键字的值
     * @param nextTokenNames 后续 token 名称列表
     */
    protected isContextualSequenceNoLT(contextualValue: string, ...nextTokenNames: string[]): boolean {
        if (!this.isContextual(contextualValue)) return false
        for (let i = 0; i < nextTokenNames.length; i++) {
            const token = this.peek(i + 1)
            if (token?.tokenName !== nextTokenNames[i]) return false
            if (token.hasLineBreakBefore) return false
        }
        return true
    }

    /**
     * 断言：当前 token 不能是指定的上下文关键字
     * @param value 软关键字的值
     */
    protected assertNotContextual(value: string): boolean {
        if (!this._parseSuccess) return false
        if (this.isContextual(value)) {
            this._parseSuccess = false
            return false
        }
        return true
    }

    /**
     * 断言：不能是上下文关键字 + 后续 token 序列
     * @param contextualValue 软关键字的值
     * @param nextTokenNames 后续 token 名称列表
     */
    protected assertNotContextualSequence(contextualValue: string, ...nextTokenNames: string[]): boolean {
        if (!this._parseSuccess) return false
        if (this.isContextualSequence(contextualValue, ...nextTokenNames)) {
            this._parseSuccess = false
            return false
        }
        return true
    }

    /**
     * 断言：不能是上下文关键字 + 后续 token 序列（考虑换行符约束）
     * @param contextualValue 软关键字的值
     * @param nextTokenNames 后续 token 名称列表
     */
    protected assertNotContextualSequenceNoLT(contextualValue: string, ...nextTokenNames: string[]): boolean {
        if (!this._parseSuccess) return false
        if (this.isContextualSequenceNoLT(contextualValue, ...nextTokenNames)) {
            this._parseSuccess = false
            return false
        }
        return true
    }

    /**
     * 检查从当前位置开始是否是两个连续的上下文关键字
     * 用于 [lookahead ∉ {async of}] 这样的约束
     * @param first 第一个软关键字的值
     * @param second 第二个软关键字的值
     */
    protected isContextualPair(first: string, second: string): boolean {
        if (!this.isContextual(first)) return false
        const nextToken = this.peek(1)
        return nextToken?.tokenName === SlimeTokenType.IdentifierName && nextToken.tokenValue === second
    }

    /**
     * 断言：不能是两个连续的上下文关键字
     * @param first 第一个软关键字的值
     * @param second 第二个软关键字的值
     */
    protected assertNotContextualPair(first: string, second: string): boolean {
        if (!this._parseSuccess) return false
        if (this.isContextualPair(first, second)) {
            this._parseSuccess = false
            return false
        }
        return true
    }

    // ============================================
    // 正则表达式重扫描 (RegExp Rescan)
    // 解决 `/` 在词法阶段的歧义问题
    // ============================================

    /**
     * 将当前 Slash 或 DivideAssign token 重新扫描为 RegularExpressionLiteral
     *
     * 当词法分析阶段将正则表达式误判为除法时调用。
     * 例如:
     *   `if(1)/  foo/` 中的 `/  foo/` 被误判为 Slash, foo, Slash
     *   `} /42/i` 中的 `/42/i` 被误判为 Slash, 42, Slash, i
     *   `x = /=foo/g` 中的 `/=foo/g` 被误判为 DivideAssign, foo, Slash, g
     *
     * 工作原理：
     * 1. 从原始源码的当前 token 位置开始，直接匹配正则表达式
     * 2. 如果匹配成功，计算覆盖了多少个原始 tokens
     * 3. 替换这些 tokens 为一个 RegularExpressionLiteral
     *
     * @returns 是否成功重新扫描
     */
    private rescanSlashAsRegExp(): boolean {
        const curToken = this.curToken
        if (!curToken || (curToken.tokenName !== SlimeTokenType.Slash && curToken.tokenName !== SlimeTokenType.DivideAssign)) {
            return false
        }

        // 1. 从源码位置直接匹配正则表达式
        const sourceFromSlash = this._sourceCode.slice(curToken.index)
        const regexpMatch = matchRegExpLiteral(sourceFromSlash)
        if (!regexpMatch) {
            return false
        }

        // 2. 计算正则表达式结束位置（在源码中的绝对位置）
        const regexpEndIndex = curToken.index + regexpMatch.length

        // 3. 计算需要替换多少个 tokens（覆盖到 regexpEndIndex 之前的所有 tokens）
        const startTokenIndex = this.tokenIndex
        let tokensToReplace = 1
        for (let i = startTokenIndex + 1; i < this._tokens.length; i++) {
            const token = this._tokens[i]
            // 如果 token 的起始位置在正则表达式范围内，需要替换
            if (token.index < regexpEndIndex) {
                tokensToReplace++
            } else {
                break
            }
        }

        // 4. 创建新的 RegularExpressionLiteral token
        const newToken: SubhutiMatchToken = {
            tokenName: SlimeTokenType.RegularExpressionLiteral,
            tokenValue: regexpMatch,
            index: curToken.index,
            rowNum: curToken.rowNum,
            columnStartNum: curToken.columnStartNum,
            columnEndNum: curToken.columnStartNum + regexpMatch.length - 1,
            hasLineBreakBefore: curToken.hasLineBreakBefore
        }

        // 5. 替换 tokens 数组
        this._tokens.splice(startTokenIndex, tokensToReplace, newToken)

        return true
    }

    // ============================================
    // A.2 Expressions
    // ============================================

    // ----------------------------------------
    // A.2.1 Identifier References
    // ----------------------------------------

    /**
     * IdentifierReference[Yield, Await] :
     *     Identifier
     *     [~Yield] yield
     *     [~Await] await
     */
    @SubhutiRule
    IdentifierReference(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false, Await = false} = params

        return this.Or([
            // Identifier (排除保留字)
            {alt: () => this.Identifier()},
            // [~Yield] yield - 条件展开
            ...(!Yield ? [{alt: () => this.tokenConsumer.Yield()}] : []),
            // [~Await] await - 条件展开
            ...(!Await ? [{alt: () => this.tokenConsumer.Await()}] : [])
        ])
    }

    /**
     * BindingIdentifier[Yield, Await] :
     *     Identifier
     *     yield
     *     await
     *
     * 注意：根据 ES2025 规范，BindingIdentifier 语法上允许 yield 和 await 作为标识符。
     * 与 LabelIdentifier 不同，这里没有 [~Yield]/[~Await] 条件限制。
     * yield/await 在特定上下文中是否合法，由静态语义（Static Semantics）检查决定。
     */
    @SubhutiRule
    BindingIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Identifier()},
            {alt: () => this.tokenConsumer.Yield()},
            {alt: () => this.tokenConsumer.Await()}
        ])
    }

    /**
     * LabelIdentifier[Yield, Await] :
     *     Identifier
     *     [~Yield] yield
     *     [~Await] await
     */
    @SubhutiRule
    LabelIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false, Await = false} = params

        return this.Or([
            {alt: () => this.Identifier()},
            // [~Yield] yield - 条件展开
            ...(!Yield ? [{alt: () => this.tokenConsumer.Yield()}] : []),
            // [~Await] await - 条件展开
            ...(!Await ? [{alt: () => this.tokenConsumer.Await()}] : [])
        ])
    }

    /**
     * Identifier :
     *     IdentifierName but not ReservedWord
     *
     * 根据 ECMAScript 规范 12.7，当标识符包含 Unicode 转义序列时，
     * 解码后的字符必须满足 ID_Start（第一个字符）或 ID_Continue（后续字符）属性。
     * 参考 Acorn 实现。
     */
    @SubhutiRule
    Identifier(): SubhutiCst | undefined {
        const cst = this.tokenConsumer.IdentifierName()
        if (!cst) return undefined

        const value = cst.value!

        // 防御性检查：如果词法器正确实现，保留字应该被识别为独立 token，不会到达这里
        // 如果触发此条件，说明词法器存在 bug
        if (ReservedWords.has(value)) {
            throw new Error(`[Lexer Bug] 保留字 "${value}" 被错误识别为 IdentifierName，应该是独立的关键字 token`)
        }

        // 如果包含 Unicode 转义
        if (value.includes('\\u')) {
            // 验证解码后的字符是否有效
            if (!isValidIdentifierWithEscapes(value)) {
                return this.setParseFail()
            }
            // 解码后检查是否是保留字（如 bre\u0061k -> break）
            const decoded = decodeIdentifier(value)
            if (decoded !== null && ReservedWords.has(decoded)) {
                return this.setParseFail()
            }
        }

        return cst
    }

    /**
     * IdentifierName - 语法层规则
     *
     * 按照 ES2025 规范，IdentifierName 包括所有标识符字符序列（包括关键字）
     * 用于：属性名、成员访问、ModuleExportName 等场景
     *
     * 注意：词法层的 IdentifierName token 只匹配非关键字标识符，
     * 所以这里需要显式包含所有关键字 token
     *
     * 同样需要验证 Unicode 转义的有效性
     */
    @SubhutiRule
    IdentifierName(): SubhutiCst | undefined {
        return this.Or([
            // 普通标识符（需要验证 Unicode 转义）
            {alt: () => {
                const cst = this.tokenConsumer.IdentifierName()
                if (!cst) return undefined
                const value = cst.value!
                // 如果包含 Unicode 转义，验证解码后的字符是否有效
                if (value.includes('\\u')) {
                    if (!isValidIdentifierWithEscapes(value)) {
                        return this.setParseFail()
                    }
                }
                return cst
            }},
            // 所有 ReservedWord 都可以作为 IdentifierName
            {alt: () => this.tokenConsumer.Await()},
            {alt: () => this.tokenConsumer.Break()},
            {alt: () => this.tokenConsumer.Case()},
            {alt: () => this.tokenConsumer.Catch()},
            {alt: () => this.tokenConsumer.Class()},
            {alt: () => this.tokenConsumer.Const()},
            {alt: () => this.tokenConsumer.Continue()},
            {alt: () => this.tokenConsumer.Debugger()},
            {alt: () => this.tokenConsumer.Default()},
            {alt: () => this.tokenConsumer.Delete()},
            {alt: () => this.tokenConsumer.Do()},
            {alt: () => this.tokenConsumer.Else()},
            {alt: () => this.tokenConsumer.Enum()},
            {alt: () => this.tokenConsumer.Export()},
            {alt: () => this.tokenConsumer.Extends()},
            {alt: () => this.tokenConsumer.False()},
            {alt: () => this.tokenConsumer.Finally()},
            {alt: () => this.tokenConsumer.For()},
            {alt: () => this.tokenConsumer.Function()},
            {alt: () => this.tokenConsumer.If()},
            {alt: () => this.tokenConsumer.Import()},
            {alt: () => this.tokenConsumer.In()},
            {alt: () => this.tokenConsumer.Instanceof()},
            {alt: () => this.tokenConsumer.New()},
            {alt: () => this.tokenConsumer.NullLiteral()},
            {alt: () => this.tokenConsumer.Return()},
            {alt: () => this.tokenConsumer.Super()},
            {alt: () => this.tokenConsumer.Switch()},
            {alt: () => this.tokenConsumer.This()},
            {alt: () => this.tokenConsumer.Throw()},
            {alt: () => this.tokenConsumer.True()},
            {alt: () => this.tokenConsumer.Try()},
            {alt: () => this.tokenConsumer.Typeof()},
            {alt: () => this.tokenConsumer.Var()},
            {alt: () => this.tokenConsumer.Void()},
            {alt: () => this.tokenConsumer.While()},
            {alt: () => this.tokenConsumer.With()},
            {alt: () => this.tokenConsumer.Yield()},
            // 上下文关键字（虽然在词法层是 keyword token，但也可能出现在这些场景）
            {alt: () => this.tokenConsumer.Async()},
            {alt: () => this.tokenConsumer.Let()},
            {alt: () => this.tokenConsumer.Static()},
            {alt: () => this.tokenConsumer.As()},
            // 软关键字（get, set, of, target, meta, from）
            // 这些已经返回 IdentifierName，所以被第一个分支覆盖
        ])
    }

    // ----------------------------------------
    // A.2.2 Primary Expressions
    // ----------------------------------------
    // 注意：PrivateIdentifier 是词法规则（A.1 Lexical Grammar），
    // 直接使用 tokenConsumer.PrivateIdentifier() 消费 token，不需要定义语法规则方法

    /**
     * PrimaryExpression[Yield, Await] :
     *     this
     *     IdentifierReference[?Yield, ?Await]
     *     Literal
     *     ArrayLiteral[?Yield, ?Await]
     *     ObjectLiteral[?Yield, ?Await]
     *     FunctionExpression
     *     ClassExpression[?Yield, ?Await]
     *     GeneratorExpression
     *     AsyncFunctionExpression
     *     AsyncGeneratorExpression
     *     RegularExpressionLiteral
     *     TemplateLiteral[?Yield, ?Await, ~Tagged]
     *     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
     */
    @SubhutiRule
    PrimaryExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 新架构：在 PrimaryExpression 中，使用 InputElementRegExp 模式前瞻
        // 这样词法分析器遇到 `/` 时会尝试匹配正则表达式而不是除法
        // 通过 LA(1, [InputElementRegExp]) 实现

        return this.Or([
            // === 1. 硬关键字表达式（不会被标识符遮蔽）===
            {alt: () => this.tokenConsumer.This()},

            // === 2. async 开头（软关键字，必须在 IdentifierReference 之前）===
            // 更具体的先匹配：async function* 比 async function 更具体
            {alt: () => this.AsyncGeneratorExpression()},
            {alt: () => this.AsyncFunctionExpression()},

            // === 3. 标识符（在所有软关键字表达式之后）===
            {alt: () => this.IdentifierReference(params)},

            // === 4. 字面量（null/true/false 是硬关键字，数字/字符串有独特首 token）===
            {alt: () => this.Literal()},

            // === 5. function 开头（硬关键字，按特异性排序）===
            {alt: () => this.GeneratorExpression()},
            {alt: () => this.FunctionExpression()},

            // === 6. class 表达式（硬关键字）===
            {alt: () => this.ClassExpression(params)},

            // === 7. 符号开头（各有独特首 token，不会互相遮蔽）===
            {alt: () => this.ArrayLiteral(params)},
            {alt: () => this.ObjectLiteral(params)},
            // RegularExpressionLiteral - 使用 InputElementRegExp 模式消费
            {alt: () => this.consumeRegularExpressionLiteral()},
            {alt: () => this.TemplateLiteral({...params, Tagged: false})},
            {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params)}
        ])
    }

    /**
     * 消费正则表达式字面量（使用 InputElementRegExp 模式）
     */
    private consumeRegularExpressionLiteral(): SubhutiCst | undefined {
        return this.consume(SlimeTokenType.RegularExpressionLiteral, LexicalGoal.InputElementRegExp)
    }

    /**
     * CoverParenthesizedExpressionAndArrowParameterList[Yield, Await] :
     *     ( Expression[+In, ?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , )
     *     ( )
     *     ( ... BindingIdentifier[?Yield, ?Await] )
     *     ( ... BindingPattern[?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
     */
    @SubhutiRule
    CoverParenthesizedExpressionAndArrowParameterList(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // ( Expression[+In, ?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RParen()
                }
            },
            // ( )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ... BindingIdentifier[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( ... BindingPattern[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * ParenthesizedExpression[Yield, Await] :
     *     ( Expression[+In, ?Yield, ?Await] )
     *
     * Supplemental Syntax:
     * When processing PrimaryExpression : CoverParenthesizedExpressionAndArrowParameterList,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    ParenthesizedExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        return this.tokenConsumer.RParen()
    }

    // ----------------------------------------
    // A.2.3 Literals
    // ----------------------------------------

    /**
     * Literal :
     *     NullLiteral
     *     BooleanLiteral
     *     NumericLiteral
     *     StringLiteral
     *
     * 注意：NullLiteral、NumericLiteral、StringLiteral 是词法规则（A.1 Lexical Grammar），
     * 直接使用 tokenConsumer 消费 token
     */
    @SubhutiRule
    Literal(): SubhutiCst | undefined {
        return this.Or([
            // NullLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
            {alt: () => this.tokenConsumer.NullLiteral()},
            {alt: () => this.BooleanLiteral()},
            // NumericLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.NumericLiteral()},
            // StringLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.StringLiteral()}
        ])
    }

    /**
     * BooleanLiteral :
     *     true
     *     false
     */
    @SubhutiRule
    BooleanLiteral(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.True()},
            {alt: () => this.tokenConsumer.False()}
        ])
    }

    /**
     * ArrayLiteral[Yield, Await] :
     *     [ Elision_opt ]
     *     [ ElementList[?Yield, ?Await] ]
     *     [ ElementList[?Yield, ?Await] , Elision_opt ]
     */
    @SubhutiRule
    ArrayLiteral(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.tokenConsumer.RBracket()
                }
            },
            // [ ElementList[?Yield, ?Await] , Elision_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.ElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.tokenConsumer.RBracket()
                }
            },
            // [ ElementList[?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.ElementList(params)
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * ElementList[Yield, Await] :
     *     Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
     *     Elision_opt SpreadElement[?Yield, ?Await]
     *     ElementList[?Yield, ?Await] , Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
     *     ElementList[?Yield, ?Await] , Elision_opt SpreadElement[?Yield, ?Await]
     */
    @SubhutiRule
    ElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个元素
        this.Option(() => this.Elision())
        this.Or([
            {alt: () => this.AssignmentExpression({...params, In: true})},
            {alt: () => this.SpreadElement(params)}
        ])

        // 后续元素 (0个或多个)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Option(() => this.Elision())
            this.Or([
                {alt: () => this.AssignmentExpression({...params, In: true})},
                {alt: () => this.SpreadElement(params)}
            ])
        })

        return this.curCst
    }

    /**
     * Elision :
     *     ,
     *     Elision ,
     */
    @SubhutiRule
    Elision(): SubhutiCst | undefined {
        this.tokenConsumer.Comma()
        this.Many(() => this.tokenConsumer.Comma())
        return this.curCst
    }

    /**
     * SpreadElement[Yield, Await] :
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    SpreadElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.AssignmentExpression({...params, In: true})
    }

    /**
     * ObjectLiteral[Yield, Await] :
     *     { }
     *     { PropertyDefinitionList[?Yield, ?Await] }
     *     { PropertyDefinitionList[?Yield, ?Await] , }
     */
    @SubhutiRule
    ObjectLiteral(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { PropertyDefinitionList[?Yield, ?Await] , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.PropertyDefinitionList(params)
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { PropertyDefinitionList[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.PropertyDefinitionList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * PropertyDefinitionList[Yield, Await] :
     *     PropertyDefinition[?Yield, ?Await]
     *     PropertyDefinitionList[?Yield, ?Await] , PropertyDefinition[?Yield, ?Await]
     */
    @SubhutiRule
    PropertyDefinitionList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.PropertyDefinition(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.PropertyDefinition(params)
        })
        return this.curCst
    }

    /**
     * PropertyDefinition[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await]
     *     CoverInitializedName[?Yield, ?Await]
     *     PropertyName[?Yield, ?Await] : AssignmentExpression[+In, ?Yield, ?Await]
     *     MethodDefinition[?Yield, ?Await]
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     *
     * ⚠️ Or 顺序调整：
     * 为了正确处理 PEG 的贪婪匹配，将更具体的规则（带明确分隔符的）放在前面：
     * 1. ... AssignmentExpression - 有明确的 `...` 前缀
     * 2. PropertyName : AssignmentExpression - 有明确的 `:` 分隔符
     * 3. CoverInitializedName - 有明确的 `=` 分隔符
     * 4. MethodDefinition - 有明确的函数签名
     * 5. IdentifierReference - 简写属性，最宽松，放最后
     */
    @SubhutiRule
    PropertyDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // 1. ... AssignmentExpression - 扩展属性（最明确）
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.AssignmentExpression({...params, In: true})
                }
            },
            // 2. PropertyName : AssignmentExpression - 完整属性（有 : 分隔符）
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.AssignmentExpression({...params, In: true})
                }
            },
            // 3. CoverInitializedName - 带默认值的简写（有 = 分隔符）
            {alt: () => this.CoverInitializedName(params)},
            // 4. MethodDefinition - 方法定义
            {alt: () => this.MethodDefinition(params)},
            // 5. IdentifierReference - 简写属性（最后尝试）
            {alt: () => this.IdentifierReference(params)}
        ])
    }

    /**
     * PropertyName[Yield, Await] :
     *     LiteralPropertyName
     *     ComputedPropertyName[?Yield, ?Await]
     */
    @SubhutiRule
    PropertyName(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.LiteralPropertyName()},
            {alt: () => this.ComputedPropertyName(params)}
        ])
    }

    /**
     * LiteralPropertyName :
     *     IdentifierName
     *     StringLiteral
     *     NumericLiteral
     *
     * 注意：StringLiteral、NumericLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    LiteralPropertyName(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            // StringLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.StringLiteral()},
            // NumericLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.NumericLiteral()}
        ])
    }

    /**
     * ComputedPropertyName[Yield, Await] :
     *     [ AssignmentExpression[+In, ?Yield, ?Await] ]
     */
    @SubhutiRule
    ComputedPropertyName(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LBracket()
        this.AssignmentExpression({...params, In: true})
        return this.tokenConsumer.RBracket()
    }

    /**
     * CoverInitializedName[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    CoverInitializedName(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.IdentifierReference(params)
        return this.Initializer({...params, In: true})
    }

    /**
     * Initializer[In, Yield, Await] :
     *     = AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    Initializer(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Assign()
        return this.AssignmentExpression(params)
    }

    // ----------------------------------------
    // A.2.4 Template Literals
    // ----------------------------------------

    /**
     * TemplateLiteral[Yield, Await, Tagged] :
     *     NoSubstitutionTemplate
     *     SubstitutionTemplate[?Yield, ?Await, ?Tagged]
     */
    @SubhutiRule
    TemplateLiteral(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        return this.Or([
            // NoSubstitutionTemplate 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.NoSubstitutionTemplate()},
            {alt: () => this.SubstitutionTemplate(params)}
        ])
    }

    // 注意：以下是词法规则（A.1 Lexical Grammar），直接使用 tokenConsumer 消费 token：
    // - NoSubstitutionTemplate -> tokenConsumer.NoSubstitutionTemplate()
    // - TemplateHead -> tokenConsumer.TemplateHead()
    // - TemplateTail -> tokenConsumer.TemplateTail()
    // - TemplateMiddle -> tokenConsumer.TemplateMiddle()

    /**
     * SubstitutionTemplate[Yield, Await, Tagged] :
     *     TemplateHead Expression[+In, ?Yield, ?Await] TemplateSpans[?Yield, ?Await, ?Tagged]
     */
    @SubhutiRule
    SubstitutionTemplate(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        // TemplateHead 是词法规则，直接消费 token
        this.tokenConsumer.TemplateHead()
        this.Expression({...params, In: true})
        return this.TemplateSpans(params)
    }

    /**
     * TemplateSpans[Yield, Await, Tagged] :
     *     TemplateTail
     *     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateTail
     */
    @SubhutiRule
    TemplateSpans(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        return this.Or([
            // TemplateTail 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.TemplateTail()},
            {
                alt: () => {
                    this.TemplateMiddleList(params)
                    // TemplateTail 是词法规则，直接消费 token
                    this.tokenConsumer.TemplateTail()
                }
            }
        ])
    }

    /**
     * TemplateMiddleList[Yield, Await, Tagged] :
     *     TemplateMiddle Expression[+In, ?Yield, ?Await]
     *     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateMiddle Expression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    TemplateMiddleList(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        // TemplateMiddle 是词法规则，直接消费 token
        this.tokenConsumer.TemplateMiddle()
        this.Expression({...params, In: true})

        this.Many(() => {
            // TemplateMiddle 是词法规则，直接消费 token
            this.tokenConsumer.TemplateMiddle()
            this.Expression({...params, In: true})
        })

        return this.curCst
    }

    // ----------------------------------------
    // A.2.5 Member Expressions
    // ----------------------------------------

    /**
     * MemberExpression[Yield, Await] :
     *     PrimaryExpression[?Yield, ?Await]
     *     MemberExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     MemberExpression[?Yield, ?Await] . IdentifierName
     *     MemberExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     SuperProperty[?Yield, ?Await]
     *     MetaProperty
     *     new MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     MemberExpression[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    MemberExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础表达式
        this.Or([
            {alt: () => this.PrimaryExpression(params)},
            {alt: () => this.SuperProperty(params)},
            {alt: () => this.MetaProperty()},
            {
                alt: () => {
                    this.tokenConsumer.New()
                    this.MemberExpression(params)
                    this.Arguments(params)
                }
            }
        ])

        // 新架构：默认词法目标就是 InputElementDiv，不需要显式设置

        // 后缀操作符 (0个或多个)
        this.Many(() => this.Or([
            // [ Expression[+In, ?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            // . IdentifierName
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            // TemplateLiteral[?Yield, ?Await, +Tagged]
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            // . PrivateIdentifier
            // PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * SuperProperty[Yield, Await] :
     *     super [ Expression[+In, ?Yield, ?Await] ]
     *     super . IdentifierName
     */
    @SubhutiRule
    SuperProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Super()
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Super()
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            }
        ])
    }

    /**
     * MetaProperty :
     *     NewTarget
     *     ImportMeta
     */
    @SubhutiRule
    MetaProperty(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.NewTarget()},
            {alt: () => this.ImportMeta()}
        ])
    }

    /**
     * NewTarget :
     *     new . target
     */
    @SubhutiRule
    NewTarget(): SubhutiCst | undefined {
        this.tokenConsumer.New()
        this.tokenConsumer.Dot()
        return this.tokenConsumer.Target()
    }

    /**
     * ImportMeta :
     *     import . meta
     */
    @SubhutiRule
    ImportMeta(): SubhutiCst | undefined {
        this.tokenConsumer.Import()
        this.tokenConsumer.Dot()
        return this.tokenConsumer.Meta()
    }

    /**
     * NewExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await]
     *     new NewExpression[?Yield, ?Await]
     */
    @SubhutiRule
    NewExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.MemberExpression(params)},
            {
                alt: () => {
                    this.tokenConsumer.New()
                    this.NewExpression(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.2.6 Call Expressions
    // ----------------------------------------

    /**
     * CallExpression[Yield, Await] :
     *     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await]
     *     SuperCall[?Yield, ?Await]
     *     ImportCall[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     CallExpression[?Yield, ?Await] . IdentifierName
     *     CallExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     CallExpression[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    CallExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础调用表达式
        this.Or([
            {alt: () => this.CoverCallExpressionAndAsyncArrowHead(params)},
            {alt: () => this.SuperCall(params)},
            {alt: () => this.ImportCall(params)}
        ])

        // 后缀操作符 (0个或多个)
        this.Many(() => this.Or([
            // Arguments[?Yield, ?Await]
            {alt: () => this.Arguments(params)},
            // [ Expression[+In, ?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            // . IdentifierName
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            // TemplateLiteral[?Yield, ?Await, +Tagged]
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            // . PrivateIdentifier
            // PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *
     * 这是一个 Cover Grammar，用于覆盖：
     * 1. 函数调用：func(args)
     * 2. Async 箭头函数头：async (args) => {}
     */
    @SubhutiRule
    CoverCallExpressionAndAsyncArrowHead(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MemberExpression(params)
        return this.Arguments(params)
    }

    /**
     * CallMemberExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *
     * Supplemental Syntax:
     * When processing CallExpression : CoverCallExpressionAndAsyncArrowHead,
     * the interpretation is refined using this rule.
     *
     * 注意：虽然此方法与 CoverCallExpressionAndAsyncArrowHead 实现完全相同，
     * 但为了与 ES2025 规范完全一致，保留此方法。
     * 规范中 CallMemberExpression 是 Supplemental Syntax，用于语义分析时精化 Cover Grammar。
     */
    @SubhutiRule
    CallMemberExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MemberExpression(params)
        return this.Arguments(params)
    }

    /**
     * SuperCall[Yield, Await] :
     *     super Arguments[?Yield, ?Await]
     */
    @SubhutiRule
    SuperCall(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Super()
        return this.Arguments(params)
    }

    /**
     * ImportCall[Yield, Await] :
     *     import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
     *     import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
     */
    @SubhutiRule
    ImportCall(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
            {
                alt: () => {
                    this.tokenConsumer.Import()
                    this.tokenConsumer.LParen()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.AssignmentExpression({...params, In: true})
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RParen()
                }
            },
            // import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
            {
                alt: () => {
                    this.tokenConsumer.Import()
                    this.tokenConsumer.LParen()
                    this.AssignmentExpression({...params, In: true})
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * Arguments[Yield, Await] :
     *     ( )
     *     ( ArgumentList[?Yield, ?Await] )
     *     ( ArgumentList[?Yield, ?Await] , )
     */
    @SubhutiRule
    Arguments(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // ( )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ArgumentList[?Yield, ?Await] , )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.ArgumentList(params)
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ArgumentList[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.ArgumentList(params)
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * ArgumentList[Yield, Await] :
     *     AssignmentExpression[+In, ?Yield, ?Await]
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     *     ArgumentList[?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await]
     *     ArgumentList[?Yield, ?Await] , ... AssignmentExpression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    ArgumentList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个参数
        this.Or([
            {alt: () => this.AssignmentExpression({...params, In: true})},
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.AssignmentExpression({...params, In: true})
                }
            }
        ])

        // 后续参数 (0个或多个)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Or([
                {alt: () => this.AssignmentExpression({...params, In: true})},
                {
                    alt: () => {
                        this.tokenConsumer.Ellipsis()
                        this.AssignmentExpression({...params, In: true})
                    }
                }
            ])
        })

        return this.curCst
    }

    // ----------------------------------------
    // A.2.7 Optional Chaining
    // ----------------------------------------

    /**
     * OptionalExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *
     * PEG 实现注意事项：
     * - CallExpression 必须在 MemberExpression 之前，因为 CallExpression 包含 Arguments
     * - 例如 `fn()?.value`：CallExpression 匹配 `fn()`，然后 OptionalChain 匹配 `?.value`
     * - 如果 MemberExpression 在前，它只会匹配 `fn`，导致 `()` 无法消费
     */
    @SubhutiRule
    OptionalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Or([
            {alt: () => this.CallExpression(params)},     // CallExpression 在前，包含 Arguments
            {alt: () => this.MemberExpression(params)}    // MemberExpression 在后
        ])

        this.OptionalChain(params)

        this.Many(() => this.OptionalChain(params))

        return this.curCst
    }

    /**
     * OptionalChain[Yield, Await] :
     *     ?. Arguments[?Yield, ?Await]
     *     ?. [ Expression[+In, ?Yield, ?Await] ]
     *     ?. IdentifierName
     *     ?. TemplateLiteral[?Yield, ?Await, +Tagged]
     *     ?. PrivateIdentifier
     *     OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     OptionalChain[?Yield, ?Await] . IdentifierName
     *     OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     OptionalChain[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    OptionalChain(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个 ?. 操作
        this.Or([
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.Arguments(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.IdentifierName()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.TemplateLiteral({...params, Tagged: true})
                }
            },
            // PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ])

        // 后续操作 (0个或多个)
        this.Many(() => this.Or([
            {alt: () => this.Arguments(params)},
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            // PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * LeftHandSideExpression[Yield, Await] :
     *     NewExpression[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await]
     *
     * PEG 实现注意事项：
     *
     * 规范中的三个产生式在语义上是互斥的：
     * - CallExpression: 必须包含至少一个 Arguments（函数调用 `()`）
     * - OptionalExpression: 必须包含至少一个 OptionalChain（可选链 `?.`）
     * - NewExpression: 不包含 Arguments 或 OptionalChain
     *
     * 但在 PEG 中，由于顺序选择的特性，如果按规范顺序实现会导致问题：
     * - NewExpression 包含 MemberExpression，会匹配 `console.log`
     * - 然后 NewExpression 结束，`(x)` 无法被消耗
     * - 导致解析失败或无限循环
     *
     * 解决方案：调整分支顺序，将"更长"的规则放在前面
     * - OptionalExpression 在前：最长匹配，包含 CallExpression/MemberExpression + OptionalChain
     *   例如：`fn()?.value`、`obj?.method()`
     * - CallExpression 次之：包含 Arguments（如 `console.log(x)`）
     * - NewExpression 最后：匹配其他情况（如 `this`、`obj.prop`）
     *
     * 这与规范顺序不一致，但在 PEG 中是必要的。
     */
    @SubhutiRule
    LeftHandSideExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.OptionalExpression(params)},  // 第1位 - 最长，包含 OptionalChain
            {alt: () => this.CallExpression(params)},      // 第2位 - 包含 Arguments
            {alt: () => this.NewExpression(params)},       // 第3位 - 最短，仅 MemberExpression
        ])
    }

    // ----------------------------------------
    // A.2.8 Update Expressions
    // ----------------------------------------

    /**
     * UpdateExpression[Yield, Await] :
     *     LeftHandSideExpression[?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
     *     ++ UnaryExpression[?Yield, ?Await]
     *     -- UnaryExpression[?Yield, ?Await]
     */
    @SubhutiRule
    UpdateExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    // [no LineTerminator here]
                    this.assertNoLineBreak()
                    this.tokenConsumer.Increment()
                }
            },
            // LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    // [no LineTerminator here]
                    this.assertNoLineBreak()
                    this.tokenConsumer.Decrement()
                }
            },
            // ++ UnaryExpression[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Increment()
                    this.UnaryExpression(params)
                }
            },
            // -- UnaryExpression[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Decrement()
                    this.UnaryExpression(params)
                }
            },
            // LeftHandSideExpression[?Yield, ?Await]
            {alt: () => this.LeftHandSideExpression(params)}
        ])
    }

    // ----------------------------------------
    // A.2.9 Unary Expressions
    // ----------------------------------------

    /**
     * UnaryExpression[Yield, Await] :
     *     UpdateExpression[?Yield, ?Await]
     *     delete UnaryExpression[?Yield, ?Await]
     *     void UnaryExpression[?Yield, ?Await]
     *     typeof UnaryExpression[?Yield, ?Await]
     *     + UnaryExpression[?Yield, ?Await]
     *     - UnaryExpression[?Yield, ?Await]
     *     ~ UnaryExpression[?Yield, ?Await]
     *     ! UnaryExpression[?Yield, ?Await]
     *     [+Await] AwaitExpression[?Yield]
     */
    @SubhutiRule
    UnaryExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Await = false} = params

        return this.Or([
            {alt: () => this.UpdateExpression(params)},
            {
                alt: () => {
                    this.tokenConsumer.Delete()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Void()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Typeof()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Plus()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Minus()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.BitwiseNot()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LogicalNot()
                    this.UnaryExpression(params)
                }
            },
            // [+Await] AwaitExpression - 条件展开
            ...(Await ? [{alt: () => this.AwaitExpression(params)}] : [])
        ])
    }

    /**
     * AwaitExpression[Yield] :
     *     await UnaryExpression[?Yield, +Await]
     */
    @SubhutiRule
    AwaitExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Await()
        return this.UnaryExpression({...params, Await: true})
    }

    // ----------------------------------------
    // A.2.10 Binary Expressions
    // ----------------------------------------

    /**
     * ExponentiationExpression[Yield, Await] :
     *     UnaryExpression[?Yield, ?Await]
     *     UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ExponentiationExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.UpdateExpression(params)
                    this.tokenConsumer.Exponentiation()
                    this.ExponentiationExpression(params)
                }
            },
            {alt: () => this.UnaryExpression(params)}
        ])
    }

    /**
     * MultiplicativeExpression[Yield, Await] :
     *     ExponentiationExpression[?Yield, ?Await]
     *     MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]
     */
    @SubhutiRule
    MultiplicativeExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ExponentiationExpression(params)

        this.Many(() => {
            this.MultiplicativeOperator()
            this.ExponentiationExpression(params)
        })

        return this.curCst
    }

    /**
     * MultiplicativeOperator : one of
     *     * / %
     */
    @SubhutiRule
    MultiplicativeOperator(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.Asterisk()},
            {alt: () => this.tokenConsumer.Slash()},
            {alt: () => this.tokenConsumer.Modulo()}
        ])
    }

    /**
     * AdditiveExpression[Yield, Await] :
     *     MultiplicativeExpression[?Yield, ?Await]
     *     AdditiveExpression[?Yield, ?Await] + MultiplicativeExpression[?Yield, ?Await]
     *     AdditiveExpression[?Yield, ?Await] - MultiplicativeExpression[?Yield, ?Await]
     */
    @SubhutiRule
    AdditiveExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MultiplicativeExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Plus()},
                {alt: () => this.tokenConsumer.Minus()}
            ])
            this.MultiplicativeExpression(params)
        })

        return this.curCst
    }

    /**
     * ShiftExpression[Yield, Await] :
     *     AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] << AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] >> AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] >>> AdditiveExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ShiftExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AdditiveExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.LeftShift()},
                {alt: () => this.tokenConsumer.RightShift()},
                {alt: () => this.tokenConsumer.UnsignedRightShift()}
            ])
            this.AdditiveExpression(params)
        })

        return this.curCst
    }

    /**
     * RelationalExpression[In, Yield, Await] :
     *     ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] < ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] > ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] <= ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] >= ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] instanceof ShiftExpression[?Yield, ?Await]
     *     [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
     *     [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]
     */
    @SubhutiRule
    RelationalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {In = false} = params

        // 处理 [+In] PrivateIdentifier in ShiftExpression
        // PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
        if (In && this.lookahead(SlimeTokenType.PrivateIdentifier, 1)) {
            this.tokenConsumer.PrivateIdentifier()
            this.tokenConsumer.In()
            this.ShiftExpression(params)
            return this.curCst
        }

        this.ShiftExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Less()},
                {alt: () => this.tokenConsumer.Greater()},
                {alt: () => this.tokenConsumer.LessEqual()},
                {alt: () => this.tokenConsumer.GreaterEqual()},
                {alt: () => this.tokenConsumer.Instanceof()},
                // [+In] in - 条件展开，只在 In=true 时才有这个分支
                ...(In ? [{alt: () => this.tokenConsumer.In()}] : [])
            ])
            this.ShiftExpression(params)
        })

        return this.curCst
    }

    /**
     * EqualityExpression[In, Yield, Await] :
     *     RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] == RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] != RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] === RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] !== RelationalExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    EqualityExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.RelationalExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.StrictEqual()},
                {alt: () => this.tokenConsumer.StrictNotEqual()},
                {alt: () => this.tokenConsumer.Equal()},
                {alt: () => this.tokenConsumer.NotEqual()}
            ])
            this.RelationalExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseANDExpression[In, Yield, Await] :
     *     EqualityExpression[?In, ?Yield, ?Await]
     *     BitwiseANDExpression[?In, ?Yield, ?Await] & EqualityExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseANDExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.EqualityExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseAnd()
            this.EqualityExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseXORExpression[In, Yield, Await] :
     *     BitwiseANDExpression[?In, ?Yield, ?Await]
     *     BitwiseXORExpression[?In, ?Yield, ?Await] ^ BitwiseANDExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseXORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseANDExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseXor()
            this.BitwiseANDExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseORExpression[In, Yield, Await] :
     *     BitwiseXORExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await] | BitwiseXORExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseXORExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseOr()
            this.BitwiseXORExpression(params)
        })

        return this.curCst
    }

    /**
     * LogicalANDExpression[In, Yield, Await] :
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *     LogicalANDExpression[?In, ?Yield, ?Await] && BitwiseORExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LogicalANDExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseORExpression(params)

        this.Many(() => {
            this.tokenConsumer.LogicalAnd()
            this.BitwiseORExpression(params)
        })

        return this.curCst
    }

    /**
     * LogicalORExpression[In, Yield, Await] :
     *     LogicalANDExpression[?In, ?Yield, ?Await]
     *     LogicalORExpression[?In, ?Yield, ?Await] || LogicalANDExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LogicalORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LogicalANDExpression(params)

        this.Many(() => {
            this.tokenConsumer.LogicalOr()
            this.LogicalANDExpression(params)
        })

        return this.curCst
    }

    /**
     * CoalesceExpression[In, Yield, Await] :
     *     CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * CoalesceExpressionHead[In, Yield, Await] :
     *     CoalesceExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * ⚠️ 左递归改写说明：
     *
     * 规范使用左递归表达左结合性：
     *   CoalesceExpression → CoalesceExpressionHead → CoalesceExpression (循环！)
     *
     * PEG Parser 不支持左递归，需改写为迭代形式：
     *   原语义：a ?? b ?? c ?? d  (左结合)
     *   PEG改写：BaseExpression ( ?? BaseExpression )*
     *
     * 改写方案：
     *   1. 先匹配基础表达式（BitwiseORExpression）
     *   2. 使用 Many 循环匹配后续的 ?? BitwiseORExpression
     *   3. 删除 CoalesceExpressionHead（不再需要）
     *
     * 这样既符合 PEG 语法，又保持了左结合语义。
     */
    @SubhutiRule
    CoalesceExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础表达式
        this.BitwiseORExpression(params)

        // 后续的 ?? 运算符（0次或多次）
        this.Many(() => {
            this.tokenConsumer.NullishCoalescing()  // ??
            this.BitwiseORExpression(params)        // 右操作数
        })

        return this.curCst
    }

    /**
     * CoalesceExpressionHead[In, Yield, Await] :
     *     CoalesceExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * ⚠️ PEG 改写说明：
     *
     * 在 ECMAScript 规范中，CoalesceExpressionHead 用于表达左递归：
     *   CoalesceExpression : CoalesceExpressionHead ?? BitwiseORExpression
     *   CoalesceExpressionHead : CoalesceExpression | BitwiseORExpression
     *
     * 这种左递归形式在 PEG 解析器中无法直接使用。
     *
     * 解决方案：将左递归改写为迭代形式
     *   CoalesceExpression → BitwiseORExpression ( ?? BitwiseORExpression )*
     *
     * 改写后，CoalesceExpressionHead 的功能已被 CoalesceExpression 中的
     * Many 循环吸收，因此此规则不再需要独立实现。
     *
     * 保留此方法是为了：
     * 1. 保持与规范的一一对应关系（便于代码审查）
     * 2. 作为文档说明 PEG 改写的原因
     */
    @SubhutiRule
    CoalesceExpressionHead(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 此方法在 PEG 实现中不会被调用，功能已合并到 CoalesceExpression
        throw new Error('CoalesceExpressionHead 在 PEG 实现中已被 CoalesceExpression 吸收，不应直接调用')
    }

    /**
     * ShortCircuitExpression[In, Yield, Await] :
     *     LogicalORExpression[?In, ?Yield, ?Await]
     *     CoalesceExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    ShortCircuitExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.LogicalORExpression(params)},
            {alt: () => this.CoalesceExpression(params)}
        ])
    }

    /**
     * ConditionalExpression[In, Yield, Await] :
     *     ShortCircuitExpression[?In, ?Yield, ?Await]
     *     ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    ConditionalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.ShortCircuitExpression(params)
                    this.tokenConsumer.Question()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.Colon()
                    this.AssignmentExpression(params)
                }
            },
            {alt: () => this.ShortCircuitExpression(params)}
        ])
    }

    // ----------------------------------------
    // A.2.11 Assignment Expressions
    // ----------------------------------------

    /**
     * AssignmentExpression[In, Yield, Await] :
     *     ConditionalExpression[?In, ?Yield, ?Await]
     *     [+Yield] YieldExpression[?In, ?Await]
     *     ArrowFunction[?In, ?Yield, ?Await]
     *     AsyncArrowFunction[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] AssignmentOperator AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] &&= AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] ||= AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] ??= AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false} = params

        return this.Or([
            // ⚠️ 箭头函数必须在 ConditionalExpression 之前！
            // 因为 (a, b) 可以同时匹配括号表达式和箭头函数参数，
            // 只有通过后续的 => 才能区分，所以需要先尝试箭头函数
            {alt: () => this.ArrowFunction(params)},
            {alt: () => this.AsyncArrowFunction(params)},
            // [+Yield] YieldExpression
            ...(Yield ? [{alt: () => this.YieldExpression(params)}] : []),
            // 赋值表达式放在 ConditionalExpression 之前，防止其抢先匹配 LeftHandSideExpression
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.Assign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.AssignmentOperator()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.LogicalAndAssign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.LogicalOrAssign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.NullishCoalescingAssign()
                    this.AssignmentExpression(params)
                }
            },
            // 条件表达式放在最后作为兜底
            {alt: () => this.ConditionalExpression(params)}
        ])
    }

    /**
     * AssignmentOperator : one of
     *     *= /= %= += -= <<= >>= >>>= &= ^= |= **=
     */
    @SubhutiRule
    AssignmentOperator(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.MultiplyAssign()},
            {alt: () => this.tokenConsumer.DivideAssign()},
            {alt: () => this.tokenConsumer.ModuloAssign()},
            {alt: () => this.tokenConsumer.PlusAssign()},
            {alt: () => this.tokenConsumer.MinusAssign()},
            {alt: () => this.tokenConsumer.LeftShiftAssign()},
            {alt: () => this.tokenConsumer.RightShiftAssign()},
            {alt: () => this.tokenConsumer.UnsignedRightShiftAssign()},
            {alt: () => this.tokenConsumer.BitwiseAndAssign()},
            {alt: () => this.tokenConsumer.BitwiseXorAssign()},
            {alt: () => this.tokenConsumer.BitwiseOrAssign()},
            {alt: () => this.tokenConsumer.ExponentiationAssign()}
        ])
    }

    // ----------------------------------------
    // A.2.12 Comma Expression
    // ----------------------------------------

    /**
     * Expression[In, Yield, Await] :
     *     AssignmentExpression[?In, ?Yield, ?Await]
     *     Expression[?In, ?Yield, ?Await] , AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    Expression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentExpression(params)

        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentExpression(params)
        })

        return this.curCst
    }

    // ============================================
    // A.3 Statements
    // ============================================

    // ----------------------------------------
    // A.3.1 General
    // ----------------------------------------

    /**
     * Statement[Yield, Await, Return] :
     *     BlockStatement[?Yield, ?Await, ?Return]
     *     VariableStatement[?Yield, ?Await]
     *     EmptyStatement
     *     ExpressionStatement[?Yield, ?Await]
     *     IfStatement[?Yield, ?Await, ?Return]
     *     BreakableStatement[?Yield, ?Await, ?Return]
     *     ContinueStatement[?Yield, ?Await]
     *     BreakStatement[?Yield, ?Await]
     *     [+Return] ReturnStatement[?Yield, ?Await]
     *     WithStatement[?Yield, ?Await, ?Return]
     *     LabelledStatement[?Yield, ?Await, ?Return]
     *     ThrowStatement[?Yield, ?Await]
     *     TryStatement[?Yield, ?Await, ?Return]
     *     DebuggerStatement
     */
    @SubhutiRule
    Statement(params: StatementParams = {}): SubhutiCst | undefined {
        const {Return = false} = params

        return this.Or([
            {alt: () => this.BlockStatement(params)},
            {alt: () => this.VariableStatement(params)},
            {alt: () => this.EmptyStatement()},
            {alt: () => this.ExpressionStatement(params)},
            {alt: () => this.IfStatement(params)},
            {alt: () => this.BreakableStatement(params)},
            {alt: () => this.ContinueStatement(params)},
            {alt: () => this.BreakStatement(params)},
            // [+Return] ReturnStatement - 条件展开
            ...(Return ? [{alt: () => this.ReturnStatement(params)}] : []),
            {alt: () => this.WithStatement(params)},
            {alt: () => this.LabelledStatement(params)},
            {alt: () => this.ThrowStatement(params)},
            {alt: () => this.TryStatement(params)},
            {alt: () => this.DebuggerStatement()}
        ])
    }

    /**
     * Declaration[Yield, Await] :
     *     HoistableDeclaration[?Yield, ?Await, ~Default]
     *     ClassDeclaration[?Yield, ?Await, ~Default]
     *     LexicalDeclaration[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    Declaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.HoistableDeclaration({...params, Default: false})},
            {alt: () => this.ClassDeclaration({...params, Default: false})},
            {alt: () => this.LexicalDeclaration({...params, In: true})}
        ])
    }

    /**
     * HoistableDeclaration[Yield, Await, Default] :
     *     FunctionDeclaration[?Yield, ?Await, ?Default]
     *     GeneratorDeclaration[?Yield, ?Await, ?Default]
     *     AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
     *     AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]
     */
    @SubhutiRule
    HoistableDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.FunctionDeclaration(params)},
            {alt: () => this.GeneratorDeclaration(params)},
            {alt: () => this.AsyncFunctionDeclaration(params)},
            {alt: () => this.AsyncGeneratorDeclaration(params)}
        ])
    }

    /**
     * BreakableStatement[Yield, Await, Return] :
     *     IterationStatement[?Yield, ?Await, ?Return]
     *     SwitchStatement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    BreakableStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IterationStatement(params)},
            {alt: () => this.SwitchStatement(params)}
        ])
    }

    // ----------------------------------------
    // A.3.2 Block
    // ----------------------------------------

    /**
     * BlockStatement[Yield, Await, Return] :
     *     Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    BlockStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Block(params)
    }

    /**
     * Block[Yield, Await, Return] :
     *     { StatementList[?Yield, ?Await, ?Return]_opt }
     */
    @SubhutiRule
    Block(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LBrace()
        this.Option(() => this.StatementList(params))
        return this.tokenConsumer.RBrace()
    }

    /**
     * StatementList[Yield, Await, Return] :
     *     StatementListItem[?Yield, ?Await, ?Return]
     *     StatementList[?Yield, ?Await, ?Return] StatementListItem[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    StatementList(params: StatementParams = {}): SubhutiCst | undefined {
        // 根据容错模式选择解析方式
        if (this.errorRecoveryMode) {
            this.ManyWithRecovery(() => this.StatementListItem(params))
        } else {
            this.Many(() => this.StatementListItem(params))
        }
        return this.curCst
    }

    /**
     * StatementListItem[Yield, Await, Return] :
     *     Statement[?Yield, ?Await, ?Return]
     *     Declaration[?Yield, ?Await]
     */
    @SubhutiRule
    StatementListItem(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Statement(params)},
            {alt: () => this.Declaration(params)}
        ])
    }

    // ----------------------------------------
    // A.3.3 Variable Declarations
    // ----------------------------------------

    /**
     * LexicalDeclaration[In, Yield, Await] :
     *     LetOrConst BindingList[?In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    LexicalDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LetOrConst()
        this.BindingList(params)
        return this.SemicolonASI()
    }

    /**
     * LetOrConst :
     *     let
     *     const
     */
    @SubhutiRule
    LetOrConst(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.Let()},
            {alt: () => this.tokenConsumer.Const()}
        ])
    }

    /**
     * BindingList[In, Yield, Await] :
     *     LexicalBinding[?In, ?Yield, ?Await]
     *     BindingList[?In, ?Yield, ?Await] , LexicalBinding[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BindingList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LexicalBinding(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.LexicalBinding(params)
        })
        return this.curCst
    }

    /**
     * LexicalBinding[In, Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
     *     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LexicalBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.BindingIdentifier(params)
                    this.Option(() => this.Initializer(params))
                }
            },
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Initializer(params)
                }
            }
        ])
    }

    /**
     * VariableStatement[Yield, Await] :
     *     var VariableDeclarationList[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    VariableStatement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Var()
        this.VariableDeclarationList({...params, In: true})
        return this.SemicolonASI()
    }

    /**
     * VariableDeclarationList[In, Yield, Await] :
     *     VariableDeclaration[?In, ?Yield, ?Await]
     *     VariableDeclarationList[?In, ?Yield, ?Await] , VariableDeclaration[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    VariableDeclarationList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.VariableDeclaration(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.VariableDeclaration(params)
        })
        return this.curCst
    }

    /**
     * VariableDeclaration[In, Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
     *     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    VariableDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.BindingIdentifier(params)
                    this.Option(() => this.Initializer(params))
                }
            },
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Initializer(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.4 Binding Patterns
    // ----------------------------------------

    /**
     * BindingPattern[Yield, Await] :
     *     ObjectBindingPattern[?Yield, ?Await]
     *     ArrayBindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    BindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ObjectBindingPattern(params)},
            {alt: () => this.ArrayBindingPattern(params)}
        ])
    }

    /**
     * ObjectBindingPattern[Yield, Await] :
     *     { }
     *     { BindingRestProperty[?Yield, ?Await] }
     *     { BindingPropertyList[?Yield, ?Await] }
     *     { BindingPropertyList[?Yield, ?Await] , BindingRestProperty[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ObjectBindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingRestProperty(params)
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingPropertyList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.BindingRestProperty(params))
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingPropertyList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ArrayBindingPattern[Yield, Await] :
     *     [ Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
     *     [ BindingElementList[?Yield, ?Await] ]
     *     [ BindingElementList[?Yield, ?Await] , Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
     */
    @SubhutiRule
    ArrayBindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt BindingRestElement_opt ] - 空数组或只有 rest
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ BindingElementList ] - 普通解构，必须在带尾逗号的分支之前
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.BindingElementList(params)
                    this.tokenConsumer.RBracket()
                }
            },
            // [ BindingElementList , Elision_opt BindingRestElement_opt ] - 带尾逗号
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.BindingElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * BindingRestProperty[Yield, Await] :
     *     ... BindingIdentifier[?Yield, ?Await]
     */
    @SubhutiRule
    BindingRestProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.BindingIdentifier(params)
    }

    /**
     * BindingPropertyList[Yield, Await] :
     *     BindingProperty[?Yield, ?Await]
     *     BindingPropertyList[?Yield, ?Await] , BindingProperty[?Yield, ?Await]
     */
    @SubhutiRule
    BindingPropertyList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingProperty(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingProperty(params)
        })
        return this.curCst
    }

    /**
     * BindingElementList[Yield, Await] :
     *     BindingElisionElement[?Yield, ?Await]
     *     BindingElementList[?Yield, ?Await] , BindingElisionElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingElisionElement(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingElisionElement(params)
        })
        return this.curCst
    }

    /**
     * BindingElisionElement[Yield, Await] :
     *     Elision_opt BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingElisionElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.Elision())
        return this.BindingElement(params)
    }

    /**
     * BindingProperty[Yield, Await] :
     *     SingleNameBinding[?Yield, ?Await]
     *     PropertyName[?Yield, ?Await] : BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.BindingElement(params)
                }
            },
            {alt: () => this.SingleNameBinding(params)}
        ])
    }

    /**
     * BindingElement[Yield, Await] :
     *     SingleNameBinding[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    BindingElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.SingleNameBinding(params)},
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Option(() => this.Initializer({...params, In: true}))
                }
            }
        ])
    }

    /**
     * SingleNameBinding[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    SingleNameBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingIdentifier(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * BindingRestElement[Yield, Await] :
     *     ... BindingIdentifier[?Yield, ?Await]
     *     ... BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    BindingRestElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.5 Simple Statements
    // ----------------------------------------

    /**
     * Automatic Semicolon Insertion (ASI)
     *
     * ECMAScript 规范 11.9: Automatic Semicolon Insertion
     *
     * 在以下情况下允许省略分号（自动插入）：
     * 1. 遇到换行符（Line Terminator）
     * 2. 遇到文件结束符（EOF）
     * 3. 遇到右大括号 }
     *
     * 实现方式：
     * - 如果有显式分号，消费它
     * - 否则检查是否满足 ASI 条件
     * - 如果不满足 ASI 条件，则失败
     */
    @SubhutiRule
    SemicolonASI(): SubhutiCst | undefined {
        // 检查当前 token 是否是分号
        if (this.match(SlimeTokenType.Semicolon)) {
            this.tokenConsumer.Semicolon()
            return this.curCst
        }

        // 没有显式分号，检查是否满足 ASI 条件
        const canInsertSemicolon = this.canAutoInsertSemicolon()

        if (!canInsertSemicolon) {
            // 不满足 ASI 条件，标记失败
            return this.setParseFail()
        }

        // 满足 ASI 条件，返回成功
        return this.curCst
    }

    /**
     * 检查是否可以自动插入分号
     *
     * ASI 条件：
     * 1. 当前 token 前有换行符
     * 2. 当前 token 是 }
     * 3. 已到达文件末尾（EOF）
     */
    private canAutoInsertSemicolon(): boolean {
        // 条件 3：EOF
        if (this.tokenIndex >= this._tokens.length) {
            return true
        }

        if (!this.curToken) {
            return true
        }

        // 条件 1：当前 token 前有换行符
        if (this.curToken.hasLineBreakBefore) {
            return true
        }

        // 条件 2：当前 token 是 }
        if (this.match(SlimeTokenType.RBrace)) {
            return true
        }

        return false
    }

    /**
     * EmptyStatement :
     *     ;
     */
    @SubhutiRule
    EmptyStatement(): SubhutiCst | undefined {
        return this.tokenConsumer.Semicolon()
    }

    /**
     * ExpressionStatement[Yield, Await] :
     *     [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
     *     Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ExpressionStatement(params: StatementParams = {}): SubhutiCst | undefined {
        // [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
        this.assertLookaheadNotIn([SlimeTokenType.LBrace, SlimeTokenType.Function, SlimeTokenType.Class])
        this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes.Async, SlimeTokenType.Function)
        this.assertNotContextualSequence(SlimeReservedWordTokenTypes.Let, SlimeTokenType.LBracket)

        this.Expression({...params, In: true})
        return this.SemicolonASI()
    }

    // ----------------------------------------
    // A.3.6 If Statement
    // ----------------------------------------

    /**
     * IfStatement[Yield, Await, Return] :
     *     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
     *     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] [lookahead ≠ else]
     *
     * Annex B.3.4:
     *     if ( Expression ) FunctionDeclaration else Statement
     *     if ( Expression ) Statement else FunctionDeclaration
     *     if ( Expression ) FunctionDeclaration else FunctionDeclaration
     *     if ( Expression ) FunctionDeclaration [lookahead ≠ else]
     */
    @SubhutiRule
    IfStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.If()
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.IfStatementBody(params)
                    this.tokenConsumer.Else()
                    this.IfStatementBody(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.If()
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.IfStatementBody(params)
                    this.assertLookaheadNot(SlimeTokenType.Else)  // [lookahead ≠ else]
                }
            }
        ])
    }

    /**
     * IfStatementBody - 辅助规则（非规范正式定义）
     *
     * ⚠️ 注意：此规则不是 ECMAScript 规范的正式语法规则，
     * 而是为了支持 Annex B.3.4（Web 兼容性附录）而添加的辅助规则。
     *
     * Annex B.3.4 规定，在非严格模式的 Web 浏览器环境中，
     * IfStatement 的 body 位置允许直接放置 FunctionDeclaration：
     *
     *   if ( Expression ) FunctionDeclaration else Statement
     *   if ( Expression ) Statement else FunctionDeclaration
     *   if ( Expression ) FunctionDeclaration else FunctionDeclaration
     *   if ( Expression ) FunctionDeclaration [lookahead ≠ else]
     *
     * 这是历史遗留行为，严格模式下不允许。
     *
     * 参考：ECMAScript 2025 Annex B.3.4 FunctionDeclarations in IfStatement Statement Clauses
     */
    @SubhutiRule
    IfStatementBody(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Statement(params)},
            // Annex B.3.4: 非严格模式下允许 FunctionDeclaration
            {alt: () => this.FunctionDeclaration({...params, Default: false})}
        ])
    }

    // ----------------------------------------
    // A.3.7 Iteration Statements
    // ----------------------------------------

    /**
     * IterationStatement[Yield, Await, Return] :
     *     DoWhileStatement[?Yield, ?Await, ?Return]
     *     WhileStatement[?Yield, ?Await, ?Return]
     *     ForStatement[?Yield, ?Await, ?Return]
     *     ForInOfStatement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    IterationStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.DoWhileStatement(params)},
            {alt: () => this.WhileStatement(params)},
            {alt: () => this.ForStatement(params)},
            {alt: () => this.ForInOfStatement(params)}
        ])
    }

    /**
     * DoWhileStatement[Yield, Await, Return] :
     *     do Statement[?Yield, ?Await, ?Return] while ( Expression[+In, ?Yield, ?Await] ) ;
     *
     * 注意：根据 ECMAScript 规范 11.9.1 ASI 规则：
     * "The previous token is ) and the inserted semicolon would then be parsed as
     *  the terminating semicolon of a do-while statement"
     * 因此 do-while 语句末尾的分号支持 ASI
     */
    @SubhutiRule
    DoWhileStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Do()
        this.Statement(params)
        this.tokenConsumer.While()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.SemicolonASI()
    }

    /**
     * WhileStatement[Yield, Await, Return] :
     *     while ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    WhileStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.While()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.Statement(params)
    }

    /**
     * ForStatement[Yield, Await, Return] :
     *     for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     *     for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     *     for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    ForStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            // for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Var()
                    this.VariableDeclarationList({...params, In: false})
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.LexicalDeclaration({...params, In: false})
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    // [lookahead ≠ let []
                    // 注意：let 在本解析器中按严格模式处理，作为保留字定义在 SlimeReservedWordTokenTypes
                    this.assertNotContextualSequence(SlimeReservedWordTokenTypes.Let, SlimeTokenType.LBracket)
                    this.Option(() => this.Expression({...params, In: false}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }
        ])
    }

    /**
     * ForInOfStatement[Yield, Await, Return] :
     *     for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    ForInOfStatement(params: StatementParams = {}): SubhutiCst | undefined {
        const {Await = false} = params

        return this.Or([
            // for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Var()
                    this.ForBinding(params)
                    this.tokenConsumer.In()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    // 注意：let 在本解析器中按严格模式处理，作为保留字定义在 SlimeReservedWordTokenTypes
                    this.assertNotContextualSequence(SlimeReservedWordTokenTypes.Let, SlimeTokenType.LBracket)
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.In()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.In()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Var()
                    this.ForBinding(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.LParen()
                    // [lookahead ∉ {let, async of}]
                    // 注意：let 在本解析器中按严格模式处理，作为保留字定义在 SlimeReservedWordTokenTypes
                    this.assertNotContextual(SlimeReservedWordTokenTypes.Let)
                    this.assertNotContextualPair(SlimeContextualKeywordTokenTypes.Async, SlimeContextualKeywordTokenTypes.Of)
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.Await()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Var()
                    this.ForBinding(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : []),
            // [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.Await()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : []),
            // [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.For()
                    this.tokenConsumer.Await()
                    this.tokenConsumer.LParen()
                    // [lookahead ≠ let]
                    // 注意：let 在本解析器中按严格模式处理，作为保留字定义在 SlimeReservedWordTokenTypes
                    this.assertNotContextual(SlimeReservedWordTokenTypes.Let)
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.Of()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : [])
        ])
    }

    /**
     * ForDeclaration[Yield, Await] :
     *     LetOrConst ForBinding[?Yield, ?Await]
     */
    @SubhutiRule
    ForDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LetOrConst()
        return this.ForBinding(params)
    }

    /**
     * ForBinding[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    ForBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.BindingPattern(params)}
        ])
    }

    // ----------------------------------------
    // A.3.8 Control Flow Statements
    // ----------------------------------------

    /**
     * ContinueStatement[Yield, Await] :
     *     continue ;
     *     continue [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
     */
    @SubhutiRule
    ContinueStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Continue()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.LabelIdentifier(params)
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Continue()
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * BreakStatement[Yield, Await] :
     *     break ;
     *     break [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
     */
    @SubhutiRule
    BreakStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Break()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.LabelIdentifier(params)
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Break()
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ReturnStatement[Yield, Await] :
     *     return ;
     *     return [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ReturnStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Return()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.Expression({...params, In: true})
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Return()
                    this.SemicolonASI()
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.9 With Statement
    // ----------------------------------------

    /**
     * WithStatement[Yield, Await, Return] :
     *     with ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    WithStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.With()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.Statement(params)
    }

    // ----------------------------------------
    // A.3.10 Switch Statement
    // ----------------------------------------

    /**
     * SwitchStatement[Yield, Await, Return] :
     *     switch ( Expression[+In, ?Yield, ?Await] ) CaseBlock[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    SwitchStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Switch()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.CaseBlock(params)
    }

    /**
     * CaseBlock[Yield, Await, Return] :
     *     { CaseClauses[?Yield, ?Await, ?Return]_opt }
     *     { CaseClauses[?Yield, ?Await, ?Return]_opt DefaultClause[?Yield, ?Await, ?Return] CaseClauses[?Yield, ?Await, ?Return]_opt }
     */
    @SubhutiRule
    CaseBlock(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.Option(() => this.CaseClauses(params))
                    this.DefaultClause(params)
                    this.Option(() => this.CaseClauses(params))
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.Option(() => this.CaseClauses(params))
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * CaseClauses[Yield, Await, Return] :
     *     CaseClause[?Yield, ?Await, ?Return]
     *     CaseClauses[?Yield, ?Await, ?Return] CaseClause[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    CaseClauses(params: StatementParams = {}): SubhutiCst | undefined {
        this.AtLeastOne(() => this.CaseClause(params))
        return this.curCst
    }

    /**
     * CaseClause[Yield, Await, Return] :
     *     case Expression[+In, ?Yield, ?Await] : StatementList[?Yield, ?Await, ?Return]_opt
     */
    @SubhutiRule
    CaseClause(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Case()
        this.Expression({...params, In: true})
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList(params))
        return this.curCst
    }

    /**
     * DefaultClause[Yield, Await, Return] :
     *     default : StatementList[?Yield, ?Await, ?Return]_opt
     */
    @SubhutiRule
    DefaultClause(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Default()
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList(params))
        return this.curCst
    }

    // ----------------------------------------
    // A.3.11 Labelled Statement
    // ----------------------------------------

    /**
     * LabelledStatement[Yield, Await, Return] :
     *     LabelIdentifier[?Yield, ?Await] : LabelledItem[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    LabelledStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.LabelIdentifier(params)
        this.tokenConsumer.Colon()
        return this.LabelledItem(params)
    }

    /**
     * LabelledItem[Yield, Await, Return] :
     *     Statement[?Yield, ?Await, ?Return]
     *     FunctionDeclaration[?Yield, ?Await, ~Default]
     */
    @SubhutiRule
    LabelledItem(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Statement(params)},
            {alt: () => this.FunctionDeclaration({...params, Default: false})}
        ])
    }

    // ----------------------------------------
    // A.3.12 Throw Statement
    // ----------------------------------------

    /**
     * ThrowStatement[Yield, Await] :
     *     throw [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ThrowStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Throw()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.Expression({...params, In: true})
        return this.SemicolonASI()
    }

    // ----------------------------------------
    // A.3.13 Try Statement
    // ----------------------------------------

    /**
     * TryStatement[Yield, Await, Return] :
     *     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return]
     *     try Block[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
     *     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    TryStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Try()
                    this.Block(params)
                    this.Catch(params)
                    this.Finally(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Try()
                    this.Block(params)
                    this.Catch(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Try()
                    this.Block(params)
                    this.Finally(params)
                }
            }
        ])
    }

    /**
     * Catch[Yield, Await, Return] :
     *     catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
     *     catch Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    Catch(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Catch()
                    this.tokenConsumer.LParen()
                    this.CatchParameter(params)
                    this.tokenConsumer.RParen()
                    this.Block(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Catch()
                    this.Block(params)
                }
            }
        ])
    }

    /**
     * Finally[Yield, Await, Return] :
     *     finally Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    Finally(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Finally()
        return this.Block(params)
    }

    /**
     * CatchParameter[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    CatchParameter(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.BindingPattern(params)}
        ])
    }

    // ----------------------------------------
    // A.3.14 Debugger Statement
    // ----------------------------------------

    /**
     * DebuggerStatement :
     *     debugger ;
     */
    @SubhutiRule
    DebuggerStatement(): SubhutiCst | undefined {
        this.tokenConsumer.Debugger()
        return this.SemicolonASI()
    }

    // ============================================
    // A.4 Functions and Classes
    // ============================================

    /**
     * YieldExpression[In, Await] :
     *     yield
     *     yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
     *     yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
     */
    @SubhutiRule
    YieldExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Yield()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Asterisk()
                    this.AssignmentExpression({...params, Yield: true})
                }
            },
            // yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Yield()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.AssignmentExpression({...params, Yield: true})
                }
            },
            // yield
            {alt: () => this.tokenConsumer.Yield()}
        ])
    }

    /**
     * ArrowFunction[In, Yield, Await] :
     *     ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]
     */
    @SubhutiRule
    ArrowFunction(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ArrowParameters(params)
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Arrow()
        this.ConciseBody(params)
        return this.curCst
    }

    /**
     * ArrowParameters[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
     */
    @SubhutiRule
    ArrowParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params)}
        ])
    }

    /**
     * ArrowFormalParameters[Yield, Await] :
     *     ( UniqueFormalParameters[?Yield, ?Await] )
     *
     * Supplemental Syntax:
     * When processing ArrowParameters : CoverParenthesizedExpressionAndArrowParameterList,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    ArrowFormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters(params)
        return this.tokenConsumer.RParen()
    }

    /**
     * ConciseBody[In] :
     *     [lookahead ≠ {] ExpressionBody[?In, ~Await]
     *     { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    ConciseBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    // [lookahead ≠ {]
                    this.assertLookaheadNot(SlimeTokenType.LBrace)
                    this.ExpressionBody({...params, Await: false})
                }
            }
        ])
    }

    /**
     * ExpressionBody[In, Await] :
     *     AssignmentExpression[?In, ~Yield, ?Await]
     */
    @SubhutiRule
    ExpressionBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.AssignmentExpression({...params, Yield: false})
    }

    /**
     * AsyncArrowFunction[In, Yield, Await] :
     *     async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
     *     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]
     */
    @SubhutiRule
    AsyncArrowFunction(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
            {
                alt: () => {
                    this.tokenConsumer.Async()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.AsyncArrowBindingIdentifier(params)
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Arrow()
                    this.AsyncConciseBody(params)
                }
            },
            // CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]
            {
                alt: () => {
                    this.CoverCallExpressionAndAsyncArrowHead(params)
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Arrow()
                    this.AsyncConciseBody(params)
                }
            }
        ])
    }

    /**
     * AsyncArrowBindingIdentifier[Yield] :
     *     BindingIdentifier[?Yield, +Await]
     */
    @SubhutiRule
    AsyncArrowBindingIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingIdentifier({...params, Await: true})
    }

    /**
     * AsyncConciseBody[In] :
     *     [lookahead ≠ {] ExpressionBody[?In, +Await]
     *     { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncConciseBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    // [lookahead ≠ {]
                    this.assertLookaheadNot(SlimeTokenType.LBrace)
                    this.ExpressionBody({...params, Await: true})
                }
            }
        ])
    }

    /**
     * AsyncArrowHead :
     *     async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
     *
     * Supplemental Syntax:
     * When processing AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead [no LineTerminator here] => AsyncConciseBody,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    AsyncArrowHead(): SubhutiCst | undefined {
        this.tokenConsumer.Async()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.ArrowFormalParameters({Yield: false, Await: true})
        return this.curCst
    }

    // ============================================
    // Function Parameters
    // ============================================

    /**
     * UniqueFormalParameters[Yield, Await] :
     *     FormalParameters[?Yield, ?Await]
     */
    @SubhutiRule
    UniqueFormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.FormalParameters(params)
    }

    /**
     * FormalParameters[Yield, Await] :
     *     [empty]
     *     FunctionRestParameter[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await] ,
     *     FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]
            {
                alt: () => {
                    this.FormalParameterList(params)
                    this.tokenConsumer.Comma()
                    this.FunctionRestParameter(params)
                }
            },
            // FormalParameterList[?Yield, ?Await] ,
            {
                alt: () => {
                    this.FormalParameterList(params)
                    this.tokenConsumer.Comma()
                }
            },
            // FormalParameterList[?Yield, ?Await]
            {alt: () => this.FormalParameterList(params)},
            // FunctionRestParameter[?Yield, ?Await]
            {alt: () => this.FunctionRestParameter(params)},
            // [empty]
            {alt: () => this.curCst}
        ])
    }

    /**
     * FormalParameterList[Yield, Await] :
     *     FormalParameter[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await] , FormalParameter[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameterList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.FormalParameter(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.FormalParameter(params)
        })
        return this.curCst
    }

    /**
     * FunctionRestParameter[Yield, Await] :
     *     BindingRestElement[?Yield, ?Await]
     */
    @SubhutiRule
    FunctionRestParameter(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingRestElement(params)
    }

    /**
     * FormalParameter[Yield, Await] :
     *     BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameter(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingElement(params)
    }

    // ============================================
    // Function Definitions
    // ============================================

    /**
     * FunctionBody[Yield, Await] :
     *     FunctionStatementList[?Yield, ?Await]
     */
    @SubhutiRule
    FunctionBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.FunctionStatementList(params)
    }

    /**
     * FunctionStatementList[Yield, Await] :
     *     StatementList[?Yield, ?Await, +Return]_opt
     */
    @SubhutiRule
    FunctionStatementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 注意：必须显式构造参数对象，确保 Return: true 被正确传递
        const statementParams: StatementParams = {
            Yield: params.Yield,
            Await: params.Await,
            Return: true  // FunctionStatementList 总是设置 Return: true
        }
        this.Option(() => this.StatementList(statementParams))
        return this.curCst
    }

    /**
     * FunctionExpression :
     *     function BindingIdentifier[~Yield, ~Await]_opt ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    FunctionExpression(): SubhutiCst | undefined {
        this.tokenConsumer.Function()
        this.Option(() => this.BindingIdentifier({Yield: false, Await: false}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: false, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.FunctionBody({Yield: false, Await: false})
        return this.tokenConsumer.RBrace()
    }

    /**
     * FunctionDeclaration[Yield, Await, Default] :
     *     function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     *     [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    FunctionDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.Function()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.Function()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    // ============================================
    // Generator Functions
    // ============================================

    /**
     * GeneratorDeclaration[Yield, Await, Default] :
     *     function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     *     [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
            {
                alt: () => {
                    this.tokenConsumer.Function()
                    this.tokenConsumer.Asterisk()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.GeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.Function()
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.GeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * GeneratorExpression :
     *     function * BindingIdentifier[+Yield, ~Await]_opt ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorExpression(): SubhutiCst | undefined {
        this.tokenConsumer.Function()
        this.tokenConsumer.Asterisk()
        this.Option(() => this.BindingIdentifier({Yield: true, Await: false}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: true, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.GeneratorBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * GeneratorMethod[Yield, Await] :
     *     * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Asterisk()
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: true, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.GeneratorBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * GeneratorBody :
     *     FunctionBody[+Yield, ~Await]
     */
    @SubhutiRule
    GeneratorBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: true, Await: false})
    }

    // ============================================
    // Async Functions
    // ============================================

    /**
     * AsyncFunctionDeclaration[Yield, Await, Default] :
     *     async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     *     [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncFunctionDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
            {
                alt: () => {
                    this.tokenConsumer.Async()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Function()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.Async()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Function()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * AsyncFunctionExpression :
     *     async [no LineTerminator here] function BindingIdentifier[~Yield, +Await]_opt ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncFunctionExpression(): SubhutiCst | undefined {
        this.tokenConsumer.Async()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Function()
        this.Option(() => this.BindingIdentifier({Yield: false, Await: true}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: false, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncFunctionBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncMethod[Yield, Await] :
     *     async [no LineTerminator here] ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Async()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: false, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncFunctionBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncFunctionBody :
     *     FunctionBody[~Yield, +Await]
     */
    @SubhutiRule
    AsyncFunctionBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: false, Await: true})
    }

    // ============================================
    // Async Generator Functions
    // ============================================

    /**
     * AsyncGeneratorDeclaration[Yield, Await, Default] :
     *     async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     *     [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
            {
                alt: () => {
                    this.tokenConsumer.Async()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Function()
                    this.tokenConsumer.Asterisk()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncGeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.Async()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Function()
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncGeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * AsyncGeneratorExpression :
     *     async [no LineTerminator here] function * BindingIdentifier[+Yield, +Await]_opt ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorExpression(): SubhutiCst | undefined {
        this.tokenConsumer.Async()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Function()
        this.tokenConsumer.Asterisk()
        this.Option(() => this.BindingIdentifier({Yield: true, Await: true}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: true, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncGeneratorBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncGeneratorMethod[Yield, Await] :
     *     async [no LineTerminator here] * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Async()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Asterisk()
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: true, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncGeneratorBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncGeneratorBody :
     *     FunctionBody[+Yield, +Await]
     */
    @SubhutiRule
    AsyncGeneratorBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: true, Await: true})
    }

    // ============================================
    // Method Definitions
    // ============================================

    /**
     * MethodDefinition[Yield, Await] :
     *     ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     *     GeneratorMethod[?Yield, ?Await]
     *     AsyncMethod[?Yield, ?Await]
     *     AsyncGeneratorMethod[?Yield, ?Await]
     *     get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
     *     set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    MethodDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // GeneratorMethod[?Yield, ?Await]
            {alt: () => this.GeneratorMethod(params)},
            // AsyncGeneratorMethod[?Yield, ?Await]
            {alt: () => this.AsyncGeneratorMethod(params)},
            // AsyncMethod[?Yield, ?Await]
            {alt: () => this.AsyncMethod(params)},
            // get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.Get()
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.Set()
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.PropertySetParameterList()
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.UniqueFormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * PropertySetParameterList :
     *     FormalParameter[~Yield, ~Await]
     *
     * 注意：ES2025 规范中 PropertySetParameterList 直接定义为单个 FormalParameter，
     * 而不是使用 FormalParameters，这是为了强制 setter 必须恰好有一个参数。
     * 但现代引擎（V8、SpiderMonkey）和解析器（Babel、Acorn）为了与函数参数尾随逗号
     * 特性（ES2017）保持一致，都允许 setter 参数后有可选的尾随逗号。
     * 例如：set foo(a,) {} 是被接受的。
     */
    @SubhutiRule
    PropertySetParameterList(): SubhutiCst | undefined {
        this.FormalParameter({Yield: false, Await: false})
        this.Option(() => this.tokenConsumer.Comma())  // 可选尾随逗号（引擎扩展）
        return this.curCst
    }

    // ============================================
    // Class Definitions
    // ============================================

    /**
     * ClassDeclaration[Yield, Await, Default] :
     *     class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
     *     [+Default] class ClassTail[?Yield, ?Await]
     */
    @SubhutiRule
    ClassDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Class()
                    this.BindingIdentifier(params)
                    this.ClassTail(params)
                }
            },
            // [+Default] class ClassTail[?Yield, ?Await] - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.Class()
                    this.ClassTail(params)
                }
            }] : [])
        ])
    }

    /**
     * ClassExpression[Yield, Await] :
     *     class BindingIdentifier[?Yield, ?Await]_opt ClassTail[?Yield, ?Await]
     */
    @SubhutiRule
    ClassExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Class()
        this.Option(() => this.BindingIdentifier(params))
        return this.ClassTail(params)
    }

    /**
     * ClassTail[Yield, Await] :
     *     ClassHeritage[?Yield, ?Await]_opt { ClassBody[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ClassTail(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.ClassHeritage(params))
        this.tokenConsumer.LBrace()
        this.Option(() => this.ClassBody(params))
        return this.tokenConsumer.RBrace()
    }

    /**
     * ClassHeritage[Yield, Await] :
     *     extends LeftHandSideExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ClassHeritage(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Extends()
        return this.LeftHandSideExpression(params)
    }

    /**
     * ClassBody[Yield, Await] :
     *     ClassElementList[?Yield, ?Await]
     */
    @SubhutiRule
    ClassBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.ClassElementList(params)
    }

    /**
     * ClassElementList[Yield, Await] :
     *     ClassElement[?Yield, ?Await]
     *     ClassElementList[?Yield, ?Await] ClassElement[?Yield, ?Await]
     */
    @SubhutiRule
    ClassElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AtLeastOne(() => this.ClassElement(params))
        return this.curCst
    }

    /**
     * ClassElement[Yield, Await] :
     *     MethodDefinition[?Yield, ?Await]
     *     static MethodDefinition[?Yield, ?Await]
     *     FieldDefinition[?Yield, ?Await] ;
     *     static FieldDefinition[?Yield, ?Await] ;
     *     ClassStaticBlock
     *     ;
     */
    @SubhutiRule
    ClassElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // static MethodDefinition[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Static()
                    this.MethodDefinition(params)
                }
            },
            // static FieldDefinition[?Yield, ?Await] ;
            {
                alt: () => {
                    this.tokenConsumer.Static()
                    this.FieldDefinition(params)
                    this.SemicolonASI()  // 类字段支持 ASI
                }
            },
            // ClassStaticBlock
            {alt: () => this.ClassStaticBlock()},
            // FieldDefinition[?Yield, ?Await] ;
            {
                alt: () => {
                    this.FieldDefinition(params)
                    this.SemicolonASI()  // 类字段支持 ASI
                }
            },
            // MethodDefinition[?Yield, ?Await]
            {alt: () => this.MethodDefinition(params)},
            // ;
            {alt: () => this.tokenConsumer.Semicolon()}
        ])
    }

    /**
     * FieldDefinition[Yield, Await] :
     *     ClassElementName[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    FieldDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ClassElementName(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * ClassElementName[Yield, Await] :
     *     PropertyName[?Yield, ?Await]
     *     PrivateIdentifier
     *
     * 注意：PrivateIdentifier 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    ClassElementName(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.PropertyName(params)},
            // PrivateIdentifier 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.PrivateIdentifier()}
        ])
    }

    /**
     * ClassStaticBlock :
     *     static { ClassStaticBlockBody }
     */
    @SubhutiRule
    ClassStaticBlock(): SubhutiCst | undefined {
        this.tokenConsumer.Static()
        this.tokenConsumer.LBrace()
        this.ClassStaticBlockBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * ClassStaticBlockBody :
     *     ClassStaticBlockStatementList
     */
    @SubhutiRule
    ClassStaticBlockBody(): SubhutiCst | undefined {
        return this.ClassStaticBlockStatementList()
    }

    /**
     * ClassStaticBlockStatementList :
     *     StatementList[~Yield, +Await, ~Return]_opt
     */
    @SubhutiRule
    ClassStaticBlockStatementList(): SubhutiCst | undefined {
        this.Option(() => this.StatementList({Yield: false, Await: true, Return: false}))
        return this.curCst
    }

    // ============================================
    // A.5 Scripts and Modules
    // ============================================

    /**
     * Program - 统一的解析入口
     *
     * 根据 sourceType 参数决定按 Script 还是 Module 模式解析。
     * Hashbang 注释只能出现在文件开头（参考 Acorn/Babel 实现）。
     *
     * @param sourceType - 'script' | 'module'，默认为 'module'
     */
    @SubhutiRule
    Program(sourceType: 'script' | 'module' = 'module'): SubhutiCst | undefined {
        // Hashbang 注释只能出现在文件开头
        this.Option(() => this.tokenConsumer.HashbangComment())

        if (sourceType === 'module') {
            // ModuleBody_opt
            this.Option(() => this.ModuleBody())
        } else {
            // ScriptBody_opt
            this.Option(() => this.ScriptBody())
        }
        return this.curCst
    }

    /**
     * Script :
     *     ScriptBody_opt
     */
    @SubhutiRule
    Script(): SubhutiCst | undefined {
        // Hashbang 注释只能出现在文件开头
        this.Option(() => this.tokenConsumer.HashbangComment())
        // ScriptBody_opt
        this.Option(() => this.ScriptBody())
        return this.curCst
    }

    /**
     * ScriptBody :
     *     StatementList[~Yield, ~Await, ~Return]
     */
    @SubhutiRule
    ScriptBody(): SubhutiCst | undefined {
        return this.StatementList({Yield: false, Await: false, Return: false})
    }

    /**
     * Module :
     *     ModuleBody_opt
     */
    @SubhutiRule
    Module(): SubhutiCst | undefined {
        // Hashbang 注释只能出现在文件开头
        this.Option(() => this.tokenConsumer.HashbangComment())
        // ModuleBody_opt
        this.Option(() => this.ModuleBody())
        return this.curCst
    }

    /**
     * ModuleBody :
     *     ModuleItemList
     */
    @SubhutiRule
    ModuleBody(): SubhutiCst | undefined {
        return this.ModuleItemList()
    }

    /**
     * ModuleItemList :
     *     ModuleItem
     *     ModuleItemList ModuleItem
     */
    @SubhutiRule
    ModuleItemList(): SubhutiCst | undefined {
        // 根据容错模式选择解析方式
        if (this.errorRecoveryMode) {
            this.ManyWithRecovery(() => this.ModuleItem())
        } else {
            this.Many(() => this.ModuleItem())
        }
        return this.curCst
    }

    /**
     * ModuleItem :
     *     ImportDeclaration
     *     ExportDeclaration
     *     StatementListItem[~Yield, +Await, ~Return]
     */
    @SubhutiRule
    ModuleItem(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ImportDeclaration()},
            {alt: () => this.ExportDeclaration()},
            {alt: () => this.StatementListItem({Yield: false, Await: true, Return: false})}
        ])
    }

    // ============================================
    // A.5.3 Imports
    // ============================================

    /**
     * ImportDeclaration :
     *     import ImportClause FromClause WithClause_opt ;
     *     import ModuleSpecifier WithClause_opt ;
     */
    @SubhutiRule
    ImportDeclaration(): SubhutiCst | undefined {
        return this.Or([
            // import ImportClause FromClause WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.Import()
                    this.ImportClause()
                    this.FromClause()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            },
            // import ModuleSpecifier WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.Import()
                    this.ModuleSpecifier()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ImportClause :
     *     ImportedDefaultBinding
     *     NameSpaceImport
     *     NamedImports
     *     ImportedDefaultBinding , NameSpaceImport
     *     ImportedDefaultBinding , NamedImports
     */
    @SubhutiRule
    ImportClause(): SubhutiCst | undefined {
        return this.Or([
            // ImportedDefaultBinding , NameSpaceImport
            {
                alt: () => {
                    this.ImportedDefaultBinding()
                    this.tokenConsumer.Comma()
                    this.NameSpaceImport()
                }
            },
            // ImportedDefaultBinding , NamedImports
            {
                alt: () => {
                    this.ImportedDefaultBinding()
                    this.tokenConsumer.Comma()
                    this.NamedImports()
                }
            },
            // ImportedDefaultBinding
            {alt: () => this.ImportedDefaultBinding()},
            // NameSpaceImport
            {alt: () => this.NameSpaceImport()},
            // NamedImports
            {alt: () => this.NamedImports()}
        ])
    }

    /**
     * ImportedDefaultBinding :
     *     ImportedBinding
     */
    @SubhutiRule
    ImportedDefaultBinding(): SubhutiCst | undefined {
        return this.ImportedBinding()
    }

    /**
     * NameSpaceImport :
     *     * as ImportedBinding
     */
    @SubhutiRule
    NameSpaceImport(): SubhutiCst | undefined {
        this.tokenConsumer.Asterisk()
        this.tokenConsumer.As()
        return this.ImportedBinding()
    }

    /**
     * NamedImports :
     *     { }
     *     { ImportsList }
     *     { ImportsList , }
     */
    @SubhutiRule
    NamedImports(): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ImportsList , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ImportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ImportsList }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ImportsList()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * FromClause :
     *     from ModuleSpecifier
     */
    @SubhutiRule
    FromClause(): SubhutiCst | undefined {
        this.tokenConsumer.From()
        return this.ModuleSpecifier()
    }

    /**
     * ImportsList :
     *     ImportSpecifier
     *     ImportsList , ImportSpecifier
     */
    @SubhutiRule
    ImportsList(): SubhutiCst | undefined {
        this.ImportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ImportSpecifier()
        })
        return this.curCst
    }

    /**
     * ImportSpecifier :
     *     ImportedBinding
     *     ModuleExportName as ImportedBinding
     */
    @SubhutiRule
    ImportSpecifier(): SubhutiCst | undefined {
        return this.Or([
            // ModuleExportName as ImportedBinding
            {
                alt: () => {
                    this.ModuleExportName()
                    this.tokenConsumer.As()
                    this.ImportedBinding()
                }
            },
            // ImportedBinding
            {alt: () => this.ImportedBinding()}
        ])
    }

    /**
     * ModuleSpecifier :
     *     StringLiteral
     *
     * 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    ModuleSpecifier(): SubhutiCst | undefined {
        return this.tokenConsumer.StringLiteral()
    }

    /**
     * ImportedBinding :
     *     BindingIdentifier[~Yield, +Await]
     */
    @SubhutiRule
    ImportedBinding(): SubhutiCst | undefined {
        return this.BindingIdentifier({Yield: false, Await: true})
    }

    /**
     * WithClause :
     *     with { }
     *     with { WithEntries ,_opt }
     */
    @SubhutiRule
    WithClause(): SubhutiCst | undefined {
        return this.Or([
            // with { }
            {
                alt: () => {
                    this.tokenConsumer.With()
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // with { WithEntries ,_opt }
            {
                alt: () => {
                    this.tokenConsumer.With()
                    this.tokenConsumer.LBrace()
                    this.WithEntries()
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * WithEntries :
     *     AttributeKey : StringLiteral
     *     AttributeKey : StringLiteral , WithEntries
     *
     * 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    WithEntries(): SubhutiCst | undefined {
        this.AttributeKey()
        this.tokenConsumer.Colon()
        // StringLiteral 是词法规则，直接消费 token
        this.tokenConsumer.StringLiteral()

        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AttributeKey()
            this.tokenConsumer.Colon()
            // StringLiteral 是词法规则，直接消费 token
            this.tokenConsumer.StringLiteral()
        })

        return this.curCst
    }

    /**
     * AttributeKey :
     *     IdentifierName
     *     StringLiteral
     *
     * 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    AttributeKey(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            // StringLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.StringLiteral()}
        ])
    }

    // ============================================
    // A.5.4 Exports
    // ============================================

    /**
     * ExportDeclaration :
     *     export ExportFromClause FromClause WithClause_opt ;
     *     export NamedExports ;
     *     export VariableStatement[~Yield, +Await]
     *     export Declaration[~Yield, +Await]
     *     export default HoistableDeclaration[~Yield, +Await, +Default]
     *     export default ClassDeclaration[~Yield, +Await, +Default]
     *     export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
     */
    @SubhutiRule
    ExportDeclaration(): SubhutiCst | undefined {
        return this.Or([
            // export ExportFromClause FromClause WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.ExportFromClause()
                    this.FromClause()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            },
            // export NamedExports ;
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.NamedExports()
                    this.SemicolonASI()
                }
            },
            // export VariableStatement[~Yield, +Await]
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.VariableStatement({Yield: false, Await: true})
                }
            },
            // export Declaration[~Yield, +Await]
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.Declaration({Yield: false, Await: true})
                }
            },
            // export default HoistableDeclaration[~Yield, +Await, +Default]
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.tokenConsumer.Default()
                    this.HoistableDeclaration({Yield: false, Await: true, Default: true})
                }
            },
            // export default ClassDeclaration[~Yield, +Await, +Default]
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.tokenConsumer.Default()
                    this.ClassDeclaration({Yield: false, Await: true, Default: true})
                }
            },
            // export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
            {
                alt: () => {
                    this.tokenConsumer.Export()
                    this.tokenConsumer.Default()
                    // [lookahead ∉ {function, async [no LineTerminator here] function, class}]
                    this.assertLookaheadNotIn([SlimeTokenType.Function, SlimeTokenType.Class])
                    this.assertNotContextualSequenceNoLT(SlimeContextualKeywordTokenTypes.Async, SlimeTokenType.Function)
                    this.AssignmentExpression({In: true, Yield: false, Await: true})
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ExportFromClause :
     *     *
     *     * as ModuleExportName
     *     NamedExports
     */
    @SubhutiRule
    ExportFromClause(): SubhutiCst | undefined {
        return this.Or([
            // * as ModuleExportName
            {
                alt: () => {
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.As()
                    this.ModuleExportName()
                }
            },
            // *
            {alt: () => this.tokenConsumer.Asterisk()},
            // NamedExports
            {alt: () => this.NamedExports()}
        ])
    }

    /**
     * NamedExports :
     *     { }
     *     { ExportsList }
     *     { ExportsList , }
     */
    @SubhutiRule
    NamedExports(): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ExportsList , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ExportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ExportsList }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ExportsList()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ExportsList :
     *     ExportSpecifier
     *     ExportsList , ExportSpecifier
     */
    @SubhutiRule
    ExportsList(): SubhutiCst | undefined {
        this.ExportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ExportSpecifier()
        })
        return this.curCst
    }

    /**
     * ExportSpecifier :
     *     ModuleExportName
     *     ModuleExportName as ModuleExportName
     */
    @SubhutiRule
    ExportSpecifier(): SubhutiCst | undefined {
        return this.Or([
            // ModuleExportName as ModuleExportName
            {
                alt: () => {
                    this.ModuleExportName()
                    this.tokenConsumer.As()
                    this.ModuleExportName()
                }
            },
            // ModuleExportName
            {alt: () => this.ModuleExportName()}
        ])
    }

    /**
     * ModuleExportName :
     *     IdentifierName
     *     StringLiteral
     *
     * 注意：StringLiteral 是词法规则（A.1 Lexical Grammar），直接消费 token
     */
    @SubhutiRule
    ModuleExportName(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            // StringLiteral 是词法规则，直接消费 token
            {alt: () => this.tokenConsumer.StringLiteral()}
        ])
    }

    // ============================================
    // AssignmentPattern (Supplemental Syntax)
    // ============================================

    /**
     * AssignmentPattern[Yield, Await] :
     *     ObjectAssignmentPattern[?Yield, ?Await]
     *     ArrayAssignmentPattern[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ObjectAssignmentPattern(params)},
            {alt: () => this.ArrayAssignmentPattern(params)}
        ])
    }

    /**
     * ObjectAssignmentPattern[Yield, Await] :
     *     { }
     *     { AssignmentRestProperty[?Yield, ?Await] }
     *     { AssignmentPropertyList[?Yield, ?Await] }
     *     { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ObjectAssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentRestProperty[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentRestProperty(params)
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentPropertyList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.AssignmentRestProperty(params))
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentPropertyList[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentPropertyList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ArrayAssignmentPattern[Yield, Await] :
     *     [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
     *     [ AssignmentElementList[?Yield, ?Await] ]
     *     [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
     */
    @SubhutiRule
    ArrayAssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.Option(() => this.AssignmentRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.AssignmentElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.Option(() => this.AssignmentRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ AssignmentElementList[?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.AssignmentElementList(params)
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * AssignmentRestProperty[Yield, Await] :
     *     ... DestructuringAssignmentTarget[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentRestProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.DestructuringAssignmentTarget(params)
    }

    /**
     * AssignmentPropertyList[Yield, Await] :
     *     AssignmentProperty[?Yield, ?Await]
     *     AssignmentPropertyList[?Yield, ?Await] , AssignmentProperty[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentPropertyList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentProperty(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentProperty(params)
        })
        return this.curCst
    }

    /**
     * AssignmentElementList[Yield, Await] :
     *     AssignmentElisionElement[?Yield, ?Await]
     *     AssignmentElementList[?Yield, ?Await] , AssignmentElisionElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentElisionElement(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentElisionElement(params)
        })
        return this.curCst
    }

    /**
     * AssignmentElisionElement[Yield, Await] :
     *     Elision_opt AssignmentElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentElisionElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.Elision())
        return this.AssignmentElement(params)
    }

    /**
     * AssignmentProperty[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     *     PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.AssignmentElement(params)
                }
            },
            // IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
            {
                alt: () => {
                    this.IdentifierReference(params)
                    this.Option(() => this.Initializer({...params, In: true}))
                }
            }
        ])
    }

    /**
     * AssignmentElement[Yield, Await] :
     *     DestructuringAssignmentTarget[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    AssignmentElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.DestructuringAssignmentTarget(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * AssignmentRestElement[Yield, Await] :
     *     ... DestructuringAssignmentTarget[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentRestElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.DestructuringAssignmentTarget(params)
    }

    /**
     * DestructuringAssignmentTarget[Yield, Await] :
     *     LeftHandSideExpression[?Yield, ?Await]
     */
    @SubhutiRule
    DestructuringAssignmentTarget(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.LeftHandSideExpression(params)
    }
}

/**
 * === ES2025 Parser 完整实现 ===
 *
 * 本 Parser 完全基于 ECMAScript® 2025 规范（https://tc39.es/ecma262/2025/#sec-grammar-summary）
 *
 * ✅ 已完整实现的部分：
 *
 * A.2 Expressions（表达式）：
 * - IdentifierReference、BindingIdentifier、LabelIdentifier
 * - PrimaryExpression（this、Literal、ArrayLiteral、ObjectLiteral 等）
 * - TemplateLiteral（模板字面量）
 * - MemberExpression、NewExpression、CallExpression
 * - OptionalExpression（可选链）
 * - UpdateExpression、UnaryExpression
 * - 所有二元运算符表达式（乘法、加法、位移、关系、相等、位运算、逻辑运算）
 * - ConditionalExpression（三元运算符）
 * - AssignmentExpression（赋值表达式）
 * - YieldExpression、ArrowFunction、AsyncArrowFunction
 * - Expression（逗号表达式）
 *
 * A.3 Statements（语句）：
 * - BlockStatement、VariableStatement、EmptyStatement
 * - ExpressionStatement、IfStatement
 * - IterationStatement（DoWhile、While、For、ForInOf）
 * - ContinueStatement、BreakStatement、ReturnStatement
 * - WithStatement、SwitchStatement、LabelledStatement
 * - ThrowStatement、TryStatement、DebuggerStatement
 * - LexicalDeclaration、VariableDeclaration
 * - BindingPattern（解构绑定）
 *
 * A.4 Functions and Classes（函数和类）：
 * - FormalParameters、UniqueFormalParameters
 * - FunctionBody、FunctionExpression、FunctionDeclaration
 * - GeneratorExpression、GeneratorDeclaration、GeneratorBody
 * - AsyncFunctionExpression、AsyncFunctionDeclaration、AsyncFunctionBody
 * - AsyncGeneratorExpression、AsyncGeneratorDeclaration、AsyncGeneratorBody
 * - ArrowFunction、AsyncArrowFunction
 * - MethodDefinition（普通方法、Generator、Async、AsyncGenerator、getter、setter）
 * - ClassExpression、ClassDeclaration、ClassTail、ClassBody
 * - ClassElement、FieldDefinition、ClassStaticBlock
 *
 * A.5 Scripts and Modules（脚本和模块）：
 * - Script、Module、ModuleItem
 * - ImportDeclaration、ImportClause、NameSpaceImport、NamedImports
 * - ExportDeclaration、ExportFromClause、NamedExports
 * - WithClause（Import Assertions）
 *
 * Supplemental Syntax（补充语法）：
 * - AssignmentPattern、ObjectAssignmentPattern、ArrayAssignmentPattern
 * - AssignmentProperty、AssignmentElement、DestructuringAssignmentTarget
 *
 * ✅ 语法特性覆盖：
 * 1. 参数化规则：完整支持 [Yield, Await, In, Return, Default, Tagged]
 * 2. 前瞻约束：实现所有 [lookahead =, ≠, ∈, ∉] 规则
 * 3. 换行符约束：实现所有 [no LineTerminator here] 规则
 * 4. Cover Grammar：支持 CoverParenthesizedExpression、CoverCallExpression 等
 *
 * ✅ 设计特点：
 * 1. 完全符合 ES2025 规范，一对一映射语法规则
 * 2. 使用 SubhutiParser 的 PEG 能力（Or, Many, Option, AtLeastOne）
 * 3. 类型安全的 TokenConsumer 接口
 * 4. 继承 SubhutiTokenLookahead 提供完整的前瞻能力
 * 5. 支持所有现代 JavaScript 特性（async/await、class、module、optional chaining 等）
 *
 * 📝 实现说明：
 * - 本实现专注于语法结构的完全符合性
 * - 不考虑运行结果，只保证与规范一致
 * - 所有规则都使用 @SubhutiRule 装饰器
 * - 参数传递严格遵循规范的参数化规则
 *
 * @version 2.0.0 - 完整实现版本
 * @specification ECMAScript® 2025 Language Specification
 * @url https://tc39.es/ecma262/2025/#sec-grammar-summary
 */


