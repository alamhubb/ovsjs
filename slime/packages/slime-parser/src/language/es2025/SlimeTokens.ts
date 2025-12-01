// ============================================
// Token 对象（用于 TokenConsumer 复用）
// ============================================
import {
    createEmptyValueRegToken, createKeywordToken,
    createValueRegToken, type SubhutiCreateToken,
} from "subhuti/src/struct/SubhutiCreateToken.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";

// ============================================
// 词法歧义处理说明
// ============================================
// ECMAScript 规范中，`/` 可以是除法运算符或正则表达式起始。
// 规范通过 InputElementDiv 和 InputElementRegExp 两种词法目标来区分。
//
// 我们的实现策略（方案 B：始终 Slash + 语法层 Rescan）：
// 1. 词法层：`/` 始终解析为 Slash（除法运算符）
// 2. 语法层：当期望表达式但遇到 Slash 时，调用 rescanSlashAsRegExp() 重新扫描
//
// 这种方式确保 100% 正确，因为只有语法分析器知道当前期望的是表达式还是运算符。
// ============================================

// ============================================
// ES2025 规范 12.7 标识符名称正则
//
// IdentifierStart ::
//     UnicodeIDStart | $ | _ | \ UnicodeEscapeSequence
//
// IdentifierPart ::
//     UnicodeIDContinue | $ | \ UnicodeEscapeSequence | <ZWNJ> | <ZWJ>
//
// 参考实现：Babel、Acorn、TypeScript
// ============================================

// IdentifierStart: UnicodeIDStart | $ | _ | \uXXXX | \u{XXXXX}
// 注意：Unicode 属性转义 \p{} 需要 'u' flag 才能正确工作
const ID_START_SOURCE = String.raw`[\p{ID_Start}$_]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`

// IdentifierPart: UnicodeIDContinue | $ | \uXXXX | \u{XXXXX} | ZWNJ(\u200C) | ZWJ(\u200D)
const ID_CONTINUE_SOURCE = String.raw`[\p{ID_Continue}$\u200C\u200D]|\\u[0-9a-fA-F]{4}|\\u\{[0-9a-fA-F]+\}`

// IdentifierName: IdentifierStart IdentifierPart*
const IDENTIFIER_NAME_PATTERN = new RegExp(
    `(?:${ID_START_SOURCE})(?:${ID_CONTINUE_SOURCE})*`,
    'u'
)

// PrivateIdentifier: # IdentifierName
const PRIVATE_IDENTIFIER_PATTERN = new RegExp(
    `#(?:${ID_START_SOURCE})(?:${ID_CONTINUE_SOURCE})*`,
    'u'
)

export const SlimeTokensObj = {

    // ============================================
    // A.1.2 注释 (Comments)
    // ============================================

    // HashbangComment 只能出现在文件开头（index === 0），不作为 skip token
    // 由 Parser 的 Program 规则显式处理
    // LineTerminator 包括: LF(\n), CR(\r), LS(\u2028), PS(\u2029)
    // 使用 onlyAtStart 约束确保只在文件开头匹配
    HashbangComment: createValueRegToken(
        SlimeTokenType.HashbangComment,
        /#![^\n\r\u2028\u2029]*/,
        '',
        false,
        undefined,  // lookahead
        {onlyAtStart: true}  // 只在文件开头匹配
    ),
    // SingleLineComment 和 MultiLineComment 也需要正确处理 LineTerminator
    MultiLineComment: createValueRegToken(SlimeTokenType.MultiLineComment, /\/\*[\s\S]*?\*\//, '', true),
    SingleLineComment: createValueRegToken(SlimeTokenType.SingleLineComment, /\/\/[^\n\r\u2028\u2029]*/, '', true),

    // B.1.1 HTML-like Comments (Web 兼容性扩展)
    // SingleLineHTMLCloseComment: --> 在行首时作为单行注释
    // 规范: HTMLCloseComment :: WhiteSpaceSequence_opt SingleLineDelimitedCommentSequence_opt --> SingleLineCommentChars_opt
    // 使用 onlyAtLineStart 约束：只有当前行号 > 上一个非 skip token 的行号时才匹配
    // 这确保 `x = y-->10;` 中的 --> 被解析为 -- 和 >，而 ` --> nothing` 被解析为注释
    SingleLineHTMLCloseComment: createValueRegToken(
        SlimeTokenType.SingleLineHTMLCloseComment,
        /-->[^\n\r\u2028\u2029]*/,  // --> 后跟到行尾的所有字符
        '',
        true,  // skip = true，作为注释跳过
        undefined,  // lookahead
        {onlyAtLineStart: true}  // 只在行首匹配
    ),

    // ============================================
    // A.1.1 空白符和换行符
    // ============================================

    // ECMAScript 12.2 White Space
    // 包含: TAB, VT, FF, SP, NBSP, BOM, 以及所有 Unicode Zs 类别字符
    // Zs 类别包括: U+0020 (SP), U+00A0 (NBSP), U+1680, U+2000-U+200A, U+202F, U+205F, U+3000
    WhiteSpace: createValueRegToken(SlimeTokenType.WhiteSpace, /[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/, '', true),
    LineTerminatorCRLF: createValueRegToken(SlimeTokenType.LineTerminator, /\r\n/, '', true),
    LineTerminator: createValueRegToken(SlimeTokenType.LineTerminator, /[\n\r\u2028\u2029]/, '', true),

    // ============================================
    // A.1.5 关键字和保留字
    // ============================================

    AwaitTok: createKeywordToken(SlimeTokenType.Await, 'await'),
    BreakTok: createKeywordToken(SlimeTokenType.Break, 'break'),
    CaseTok: createKeywordToken(SlimeTokenType.Case, 'case'),
    CatchTok: createKeywordToken(SlimeTokenType.Catch, 'catch'),
    ClassTok: createKeywordToken(SlimeTokenType.Class, 'class'),
    ConstTok: createKeywordToken(SlimeTokenType.Const, 'const'),
    ContinueTok: createKeywordToken(SlimeTokenType.Continue, 'continue'),
    DebuggerTok: createKeywordToken(SlimeTokenType.Debugger, 'debugger'),
    DefaultTok: createKeywordToken(SlimeTokenType.Default, 'default'),
    DeleteTok: createKeywordToken(SlimeTokenType.Delete, 'delete'),
    DoTok: createKeywordToken(SlimeTokenType.Do, 'do'),
    ElseTok: createKeywordToken(SlimeTokenType.Else, 'else'),
    EnumTok: createKeywordToken(SlimeTokenType.Enum, 'enum'),
    ExportTok: createKeywordToken(SlimeTokenType.Export, 'export'),
    ExtendsTok: createKeywordToken(SlimeTokenType.Extends, 'extends'),
    FalseTok: createKeywordToken(SlimeTokenType.False, 'false'),
    FinallyTok: createKeywordToken(SlimeTokenType.Finally, 'finally'),
    ForTok: createKeywordToken(SlimeTokenType.For, 'for'),
    FunctionTok: createKeywordToken(SlimeTokenType.Function, 'function'),
    IfTok: createKeywordToken(SlimeTokenType.If, 'if'),
    ImportTok: createKeywordToken(SlimeTokenType.Import, 'import'),
    InTok: createKeywordToken(SlimeTokenType.In, 'in'),
    InstanceofTok: createKeywordToken(SlimeTokenType.Instanceof, 'instanceof'),
    LetTok: createKeywordToken(SlimeTokenType.Let, 'let'),
    NewTok: createKeywordToken(SlimeTokenType.New, 'new'),
    NullTok: createKeywordToken(SlimeTokenType.NullLiteral, 'null'),
    ReturnTok: createKeywordToken(SlimeTokenType.Return, 'return'),
    SuperTok: createKeywordToken(SlimeTokenType.Super, 'super'),
    SwitchTok: createKeywordToken(SlimeTokenType.Switch, 'switch'),
    ThisTok: createKeywordToken(SlimeTokenType.This, 'this'),
    ThrowTok: createKeywordToken(SlimeTokenType.Throw, 'throw'),
    TrueTok: createKeywordToken(SlimeTokenType.True, 'true'),
    TryTok: createKeywordToken(SlimeTokenType.Try, 'try'),
    TypeofTok: createKeywordToken(SlimeTokenType.Typeof, 'typeof'),
    VarTok: createKeywordToken(SlimeTokenType.Var, 'var'),
    VoidTok: createKeywordToken(SlimeTokenType.Void, 'void'),
    WhileTok: createKeywordToken(SlimeTokenType.While, 'while'),
    WithTok: createKeywordToken(SlimeTokenType.With, 'with'),
    YieldTok: createKeywordToken(SlimeTokenType.Yield, 'yield'),
    // 软关键字（async, static, as, get, set, of, target, meta, from）
    // 在词法层作为 IdentifierName 处理，在 Parser 中通过值检查识别

    // ============================================
    // A.1.9 数字字面量
    // 规范: NumericLiteral :: DecimalLiteral | DecimalBigIntegerLiteral | NonDecimalIntegerLiteral | LegacyOctalIntegerLiteral
    // 所有数字变体都映射到 NumericLiteral
    // ============================================

    // BigInt 变体 (DecimalBigIntegerLiteral, NonDecimalIntegerLiteral BigIntLiteralSuffix)
    // DecimalBigIntegerLiteral :: 0n | NonZeroDigit DecimalDigits_opt n
    NumericLiteralBigIntHex: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
    NumericLiteralBigIntBinary: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[bB][01](_?[01])*n/),
    NumericLiteralBigIntOctal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[oO][0-7](_?[0-7])*n/),
    NumericLiteralBigIntDecimal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /(?:0|[1-9](_?[0-9])*)n/),

    // 非十进制整数 (NonDecimalIntegerLiteral)
    // HexIntegerLiteral :: 0x HexDigits | 0X HexDigits
    // BinaryIntegerLiteral :: 0b BinaryDigits | 0B BinaryDigits
    // OctalIntegerLiteral :: 0o OctalDigits | 0O OctalDigits
    NumericLiteralHex: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
    NumericLiteralBinary: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[bB][01](_?[01])*/),
    NumericLiteralOctal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[oO][0-7](_?[0-7])*/),

    // 传统八进制 (LegacyOctalIntegerLiteral, Annex B)
    // LegacyOctalIntegerLiteral :: 0 OctalDigit | LegacyOctalIntegerLiteral OctalDigit
    NumericLiteralLegacyOctal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /0[0-7]+/),

    // 十进制 (DecimalLiteral)
    // DecimalLiteral ::
    //     DecimalIntegerLiteral . DecimalDigits_opt ExponentPart_opt
    //     . DecimalDigits ExponentPart_opt
    //     DecimalIntegerLiteral ExponentPart_opt
    // DecimalIntegerLiteral ::
    //     0                                           -- 单独的 0
    //     NonZeroDigit                                -- 1-9
    //     NonZeroDigit NumericLiteralSeparator_opt DecimalDigits  -- 12, 1_2, 123
    //     NonOctalDecimalIntegerLiteral               -- 08, 09, 0189 (以0开头但包含8或9)
    //
    // 正则说明：
    // - DecimalIntegerLiteral = 0 | [1-9](_?[0-9])* | 0[0-7]*[89][0-9]*
    // - 注意：0 后面不能直接接 _ (如 0_1 是非法的)
    NumericLiteralDecimal: createEmptyValueRegToken(SlimeTokenType.NumericLiteral, /(?:(?:0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*)\.([0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*|(?:0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*))([eE][+-]?[0-9](_?[0-9])*)?/),

    // ============================================
    // A.1.10 字符串字面量
    // ============================================

    /**
     * StringLiteral :
     *     " DoubleStringCharacters_opt "
     *     ' SingleStringCharacters_opt '
     *
     * 注意：Lexer 会将双引号和单引号字符串都输出为 StringLiteral token
     */
    // 支持行续符 (LineContinuation): \ 后跟 \r\n | \r | \n
    // 参考 ES2025 规范 12.9.4 String Literals 和 Annex B
    // Annex B: 支持八进制转义序列 \0-\7, \00-\77, \000-\377
    DoubleStringCharacters: createEmptyValueRegToken(SlimeTokenType.StringLiteral, /"(?:[^\n\r"\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
    SingleStringCharacters: createEmptyValueRegToken(SlimeTokenType.StringLiteral, /'(?:[^\n\r'\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),

    // ============================================
    // A.1.12 模板字面量
    // ============================================

    TemplateHead: createEmptyValueRegToken(SlimeTokenType.TemplateHead, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
    TemplateMiddle: createEmptyValueRegToken(SlimeTokenType.TemplateMiddle, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
    TemplateTail: createEmptyValueRegToken(SlimeTokenType.TemplateTail, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
    NoSubstitutionTemplate: createEmptyValueRegToken(SlimeTokenType.NoSubstitutionTemplate, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),

    // ============================================
    // A.1.8 运算符和标点符号
    // ============================================

    // 4 字符
    UnsignedRightShiftAssign: createValueRegToken(SlimeTokenType.UnsignedRightShiftAssign, />>>=/, '>>>='),

    // 3 字符
    Ellipsis: createValueRegToken(SlimeTokenType.Ellipsis, /\.\.\./, '...'),
    UnsignedRightShift: createValueRegToken(SlimeTokenType.UnsignedRightShift, />>>/, '>>>'),
    StrictEqual: createValueRegToken(SlimeTokenType.StrictEqual, /===/, '==='),
    StrictNotEqual: createValueRegToken(SlimeTokenType.StrictNotEqual, /!==/, '!=='),
    LeftShiftAssign: createValueRegToken(SlimeTokenType.LeftShiftAssign, /<<=/, '<<='),
    RightShiftAssign: createValueRegToken(SlimeTokenType.RightShiftAssign, />>=/, '>>='),
    ExponentiationAssign: createValueRegToken(SlimeTokenType.ExponentiationAssign, /\*\*=/, '**='),
    LogicalAndAssign: createValueRegToken(SlimeTokenType.LogicalAndAssign, /&&=/, '&&='),
    LogicalOrAssign: createValueRegToken(SlimeTokenType.LogicalOrAssign, /\|\|=/, '||='),
    NullishCoalescingAssign: createValueRegToken(SlimeTokenType.NullishCoalescingAssign, /\?\?=/, '??='),

    // 2 字符
    Arrow: createValueRegToken(SlimeTokenType.Arrow, /=>/, '=>'),
    PlusAssign: createValueRegToken(SlimeTokenType.PlusAssign, /\+=/, '+='),
    MinusAssign: createValueRegToken(SlimeTokenType.MinusAssign, /-=/, '-='),
    MultiplyAssign: createValueRegToken(SlimeTokenType.MultiplyAssign, /\*=/, '*='),
    // DivideAssign 词法层始终匹配（无上下文约束）
    // /=xxx/g 的情况由语法层 rescanSlashAsRegExp() 处理
    DivideAssign: createValueRegToken(SlimeTokenType.DivideAssign, /\/=/, '/='),
    ModuloAssign: createValueRegToken(SlimeTokenType.ModuloAssign, /%=/, '%='),
    LeftShift: createValueRegToken(SlimeTokenType.LeftShift, /<</, '<<'),
    RightShift: createValueRegToken(SlimeTokenType.RightShift, />>/, '>>'),
    LessEqual: createValueRegToken(SlimeTokenType.LessEqual, /<=/, '<='),
    GreaterEqual: createValueRegToken(SlimeTokenType.GreaterEqual, />=/, '>='),
    Equal: createValueRegToken(SlimeTokenType.Equal, /==/, '=='),
    NotEqual: createValueRegToken(SlimeTokenType.NotEqual, /!=/, '!='),
    LogicalAnd: createValueRegToken(SlimeTokenType.LogicalAnd, /&&/, '&&'),
    LogicalOr: createValueRegToken(SlimeTokenType.LogicalOr, /\|\|/, '||'),
    NullishCoalescing: createValueRegToken(SlimeTokenType.NullishCoalescing, /\?\?/, '??'),
    Increment: createValueRegToken(SlimeTokenType.Increment, /\+\+/, '++'),
    Decrement: createValueRegToken(SlimeTokenType.Decrement, /--/, '--'),
    Exponentiation: createValueRegToken(SlimeTokenType.Exponentiation, /\*\*/, '**'),
    BitwiseAndAssign: createValueRegToken(SlimeTokenType.BitwiseAndAssign, /&=/, '&='),
    BitwiseOrAssign: createValueRegToken(SlimeTokenType.BitwiseOrAssign, /\|=/, '|='),
    BitwiseXorAssign: createValueRegToken(SlimeTokenType.BitwiseXorAssign, /\^=/, '^='),
    OptionalChaining: createValueRegToken(SlimeTokenType.OptionalChaining, /\?\./, '?.', false, {not: /^\d/}),

    // 1 字符
    LBrace: createValueRegToken(SlimeTokenType.LBrace, /\{/, '{'),
    RBrace: createValueRegToken(SlimeTokenType.RBrace, /\}/, '}'),
    LParen: createValueRegToken(SlimeTokenType.LParen, /\(/, '('),
    RParen: createValueRegToken(SlimeTokenType.RParen, /\)/, ')'),
    LBracket: createValueRegToken(SlimeTokenType.LBracket, /\[/, '['),
    RBracket: createValueRegToken(SlimeTokenType.RBracket, /\]/, ']'),
    Dot: createValueRegToken(SlimeTokenType.Dot, /\./, '.'),
    Semicolon: createValueRegToken(SlimeTokenType.Semicolon, /;/, ';'),
    Comma: createValueRegToken(SlimeTokenType.Comma, /,/, ','),
    Less: createValueRegToken(SlimeTokenType.Less, /</, '<'),
    Greater: createValueRegToken(SlimeTokenType.Greater, />/, '>'),
    Plus: createValueRegToken(SlimeTokenType.Plus, /\+/, '+'),
    Minus: createValueRegToken(SlimeTokenType.Minus, /-/, '-'),
    Asterisk: createValueRegToken(SlimeTokenType.Asterisk, /\*/, '*'),

    // ============================================
    // 除法运算符（词法层始终匹配为 Slash）
    // 正则表达式由语法层 rescanSlashAsRegExp() 处理
    // ============================================
    Slash: createValueRegToken(SlimeTokenType.Slash, /\//, '/'),

    // 注意：RegularExpressionLiteral 不在词法层定义
    // 正则表达式完全由语法层的 rescanSlashAsRegExp() 方法处理
    // 这确保了 100% 正确性，因为只有语法分析器知道当前上下文

    Modulo: createValueRegToken(SlimeTokenType.Modulo, /%/, '%'),
    BitwiseAnd: createValueRegToken(SlimeTokenType.BitwiseAnd, /&/, '&'),
    BitwiseOr: createValueRegToken(SlimeTokenType.BitwiseOr, /\|/, '|'),
    BitwiseXor: createValueRegToken(SlimeTokenType.BitwiseXor, /\^/, '^'),
    BitwiseNot: createValueRegToken(SlimeTokenType.BitwiseNot, /~/, '~'),
    LogicalNot: createValueRegToken(SlimeTokenType.LogicalNot, /!/, '!'),
    Question: createValueRegToken(SlimeTokenType.Question, /\?/, '?'),
    Colon: createValueRegToken(SlimeTokenType.Colon, /:/, ':'),
    Assign: createValueRegToken(SlimeTokenType.Assign, /=/, '='),

    // ============================================
    // A.1.5 标识符
    // ============================================
    // ES2025 规范 12.7 Identifier Names
    //
    // IdentifierName ::
    //     IdentifierStart
    //     IdentifierName IdentifierPart
    //
    // IdentifierStart ::
    //     UnicodeIDStart
    //     $
    //     _
    //     \ UnicodeEscapeSequence
    //
    // IdentifierPart ::
    //     UnicodeIDContinue
    //     $
    //     \ UnicodeEscapeSequence
    //     <ZWNJ>
    //     <ZWJ>
    //
    // UnicodeIDStart :: any Unicode code point with the Unicode property "ID_Start"
    // UnicodeIDContinue :: any Unicode code point with the Unicode property "ID_Continue"
    //
    // 参考实现：Babel、Acorn、TypeScript
    // ============================================

    PrivateIdentifier: createEmptyValueRegToken(SlimeTokenType.PrivateIdentifier, PRIVATE_IDENTIFIER_PATTERN),
    IdentifierName: createEmptyValueRegToken(SlimeTokenType.IdentifierName, IDENTIFIER_NAME_PATTERN),
}

export const slimeTokens: SubhutiCreateToken[] = Object.values(SlimeTokensObj)