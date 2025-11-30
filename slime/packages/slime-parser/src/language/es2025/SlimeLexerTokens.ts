// ============================================
// Token 对象（用于 TokenConsumer 复用）
// ============================================
import {
    createEmptyValueRegToken, createKeywordToken,
    createValueRegToken,
    SubhutiCreateToken
} from "subhuti/src/struct/SubhutiCreateToken.ts";
import {TokenNames} from "slime-token/src/SlimeTokensName.ts";

// ============================================
// 表达式结尾 Token 集合
// 用于词法歧义处理：/ 在这些 token 后是除法，否则是正则表达式
// ============================================
export const EXPRESSION_END_TOKENS = new Set([
    // 标识符和字面量
    TokenNames.IdentifierName,
    TokenNames.NumericLiteral,  // 包含所有数字变体（十进制、BigInt、十六进制等）
    TokenNames.StringLiteral,
    TokenNames.RegularExpressionLiteral,
    TokenNames.NoSubstitutionTemplate,
    TokenNames.TemplateTail,

    // 关闭括号
    TokenNames.RParen,      // )
    TokenNames.RBracket,    // ]
    TokenNames.RBrace,      // }

    // 后缀运算符
    TokenNames.Increment,   // ++
    TokenNames.Decrement,   // --

    // 关键字字面量
    TokenNames.This,
    TokenNames.True,
    TokenNames.False,
    TokenNames.NullLiteral,
])

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

export const SlimeLexerTokensObj = {

    // ============================================
    // A.1.2 注释 (Comments)
    // ============================================

    // HashbangComment 只能出现在文件开头（index === 0），不作为 skip token
    // 由 Parser 的 Program 规则显式处理
    // LineTerminator 包括: LF(\n), CR(\r), LS(\u2028), PS(\u2029)
    // 使用 onlyAtStart 约束确保只在文件开头匹配
    HashbangComment: createValueRegToken(
        TokenNames.HashbangComment,
        /#![^\n\r\u2028\u2029]*/,
        '',
        false,
        undefined,  // lookahead
        {onlyAtStart: true}  // 只在文件开头匹配
    ),
    // SingleLineComment 和 MultiLineComment 也需要正确处理 LineTerminator
    MultiLineComment: createValueRegToken(TokenNames.MultiLineComment, /\/\*[\s\S]*?\*\//, '', true),
    SingleLineComment: createValueRegToken(TokenNames.SingleLineComment, /\/\/[^\n\r\u2028\u2029]*/, '', true),

    // ============================================
    // A.1.1 空白符和换行符
    // ============================================

    // ECMAScript 12.2 White Space
    // 包含: TAB, VT, FF, SP, NBSP, BOM, 以及所有 Unicode Zs 类别字符
    // Zs 类别包括: U+0020 (SP), U+00A0 (NBSP), U+1680, U+2000-U+200A, U+202F, U+205F, U+3000
    WhiteSpace: createValueRegToken(TokenNames.WhiteSpace, /[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/, '', true),
    LineTerminatorCRLF: createValueRegToken(TokenNames.LineTerminator, /\r\n/, '', true),
    LineTerminator: createValueRegToken(TokenNames.LineTerminator, /[\n\r\u2028\u2029]/, '', true),

    // ============================================
    // A.1.5 关键字和保留字
    // ============================================

    AwaitTok: createKeywordToken(TokenNames.Await, 'await'),
    BreakTok: createKeywordToken(TokenNames.Break, 'break'),
    CaseTok: createKeywordToken(TokenNames.Case, 'case'),
    CatchTok: createKeywordToken(TokenNames.Catch, 'catch'),
    ClassTok: createKeywordToken(TokenNames.Class, 'class'),
    ConstTok: createKeywordToken(TokenNames.Const, 'const'),
    ContinueTok: createKeywordToken(TokenNames.Continue, 'continue'),
    DebuggerTok: createKeywordToken(TokenNames.Debugger, 'debugger'),
    DefaultTok: createKeywordToken(TokenNames.Default, 'default'),
    DeleteTok: createKeywordToken(TokenNames.Delete, 'delete'),
    DoTok: createKeywordToken(TokenNames.Do, 'do'),
    ElseTok: createKeywordToken(TokenNames.Else, 'else'),
    EnumTok: createKeywordToken(TokenNames.Enum, 'enum'),
    ExportTok: createKeywordToken(TokenNames.Export, 'export'),
    ExtendsTok: createKeywordToken(TokenNames.Extends, 'extends'),
    FalseTok: createKeywordToken(TokenNames.False, 'false'),
    FinallyTok: createKeywordToken(TokenNames.Finally, 'finally'),
    ForTok: createKeywordToken(TokenNames.For, 'for'),
    FunctionTok: createKeywordToken(TokenNames.Function, 'function'),
    IfTok: createKeywordToken(TokenNames.If, 'if'),
    ImportTok: createKeywordToken(TokenNames.Import, 'import'),
    InTok: createKeywordToken(TokenNames.In, 'in'),
    InstanceofTok: createKeywordToken(TokenNames.Instanceof, 'instanceof'),
    LetTok: createKeywordToken(TokenNames.Let, 'let'),
    NewTok: createKeywordToken(TokenNames.New, 'new'),
    NullTok: createKeywordToken(TokenNames.NullLiteral, 'null'),
    ReturnTok: createKeywordToken(TokenNames.Return, 'return'),
    SuperTok: createKeywordToken(TokenNames.Super, 'super'),
    SwitchTok: createKeywordToken(TokenNames.Switch, 'switch'),
    ThisTok: createKeywordToken(TokenNames.This, 'this'),
    ThrowTok: createKeywordToken(TokenNames.Throw, 'throw'),
    TrueTok: createKeywordToken(TokenNames.True, 'true'),
    TryTok: createKeywordToken(TokenNames.Try, 'try'),
    TypeofTok: createKeywordToken(TokenNames.Typeof, 'typeof'),
    VarTok: createKeywordToken(TokenNames.Var, 'var'),
    VoidTok: createKeywordToken(TokenNames.Void, 'void'),
    WhileTok: createKeywordToken(TokenNames.While, 'while'),
    WithTok: createKeywordToken(TokenNames.With, 'with'),
    YieldTok: createKeywordToken(TokenNames.Yield, 'yield'),
    // 软关键字（async, static, as, get, set, of, target, meta, from）
    // 在词法层作为 IdentifierName 处理，在 Parser 中通过值检查识别

    // ============================================
    // A.1.9 数字字面量
    // 规范: NumericLiteral :: DecimalLiteral | DecimalBigIntegerLiteral | NonDecimalIntegerLiteral | LegacyOctalIntegerLiteral
    // 所有数字变体都映射到 NumericLiteral
    // ============================================

    // BigInt 变体 (DecimalBigIntegerLiteral, NonDecimalIntegerLiteral BigIntLiteralSuffix)
    // DecimalBigIntegerLiteral :: 0n | NonZeroDigit DecimalDigits_opt n
    NumericLiteralBigIntHex: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
    NumericLiteralBigIntBinary: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[bB][01](_?[01])*n/),
    NumericLiteralBigIntOctal: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[oO][0-7](_?[0-7])*n/),
    NumericLiteralBigIntDecimal: createEmptyValueRegToken(TokenNames.NumericLiteral, /(?:0|[1-9](_?[0-9])*)n/),

    // 非十进制整数 (NonDecimalIntegerLiteral)
    // HexIntegerLiteral :: 0x HexDigits | 0X HexDigits
    // BinaryIntegerLiteral :: 0b BinaryDigits | 0B BinaryDigits
    // OctalIntegerLiteral :: 0o OctalDigits | 0O OctalDigits
    NumericLiteralHex: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
    NumericLiteralBinary: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[bB][01](_?[01])*/),
    NumericLiteralOctal: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[oO][0-7](_?[0-7])*/),

    // 传统八进制 (LegacyOctalIntegerLiteral, Annex B)
    // LegacyOctalIntegerLiteral :: 0 OctalDigit | LegacyOctalIntegerLiteral OctalDigit
    NumericLiteralLegacyOctal: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[0-7]+/),

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
    NumericLiteralDecimal: createEmptyValueRegToken(TokenNames.NumericLiteral, /(?:(?:0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*)\.([0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*|(?:0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*))([eE][+-]?[0-9](_?[0-9])*)?/),

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
    DoubleStringCharacters: createEmptyValueRegToken(TokenNames.StringLiteral, /"(?:[^\n\r"\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
    SingleStringCharacters: createEmptyValueRegToken(TokenNames.StringLiteral, /'(?:[^\n\r'\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),

    // ============================================
    // A.1.12 模板字面量
    // ============================================

    TemplateHead: createEmptyValueRegToken(TokenNames.TemplateHead, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
    TemplateMiddle: createEmptyValueRegToken(TokenNames.TemplateMiddle, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),
    TemplateTail: createEmptyValueRegToken(TokenNames.TemplateTail, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),
    NoSubstitutionTemplate: createEmptyValueRegToken(TokenNames.NoSubstitutionTemplate, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),

    // ============================================
    // A.1.8 运算符和标点符号
    // ============================================

    // 4 字符
    UnsignedRightShiftAssign: createValueRegToken(TokenNames.UnsignedRightShiftAssign, />>>=/, '>>>='),

    // 3 字符
    Ellipsis: createValueRegToken(TokenNames.Ellipsis, /\.\.\./, '...'),
    UnsignedRightShift: createValueRegToken(TokenNames.UnsignedRightShift, />>>/, '>>>'),
    StrictEqual: createValueRegToken(TokenNames.StrictEqual, /===/, '==='),
    StrictNotEqual: createValueRegToken(TokenNames.StrictNotEqual, /!==/, '!=='),
    LeftShiftAssign: createValueRegToken(TokenNames.LeftShiftAssign, /<<=/, '<<='),
    RightShiftAssign: createValueRegToken(TokenNames.RightShiftAssign, />>=/, '>>='),
    ExponentiationAssign: createValueRegToken(TokenNames.ExponentiationAssign, /\*\*=/, '**='),
    LogicalAndAssign: createValueRegToken(TokenNames.LogicalAndAssign, /&&=/, '&&='),
    LogicalOrAssign: createValueRegToken(TokenNames.LogicalOrAssign, /\|\|=/, '||='),
    NullishCoalescingAssign: createValueRegToken(TokenNames.NullishCoalescingAssign, /\?\?=/, '??='),

    // 2 字符
    Arrow: createValueRegToken(TokenNames.Arrow, /=>/, '=>'),
    PlusAssign: createValueRegToken(TokenNames.PlusAssign, /\+=/, '+='),
    MinusAssign: createValueRegToken(TokenNames.MinusAssign, /-=/, '-='),
    MultiplyAssign: createValueRegToken(TokenNames.MultiplyAssign, /\*=/, '*='),
    // DivideAssign 有上下文约束，只有前一个 token 是表达式结尾才匹配
    // 否则 /=xxx/g 会被识别为正则表达式
    DivideAssign: createValueRegToken(
        TokenNames.DivideAssign,
        /\/=/,
        '/=',
        false,  // skip
        undefined,  // lookahead
        {onlyAfter: EXPRESSION_END_TOKENS}  // 上下文约束
    ),
    ModuloAssign: createValueRegToken(TokenNames.ModuloAssign, /%=/, '%='),
    LeftShift: createValueRegToken(TokenNames.LeftShift, /<</, '<<'),
    RightShift: createValueRegToken(TokenNames.RightShift, />>/, '>>'),
    LessEqual: createValueRegToken(TokenNames.LessEqual, /<=/, '<='),
    GreaterEqual: createValueRegToken(TokenNames.GreaterEqual, />=/, '>='),
    Equal: createValueRegToken(TokenNames.Equal, /==/, '=='),
    NotEqual: createValueRegToken(TokenNames.NotEqual, /!=/, '!='),
    LogicalAnd: createValueRegToken(TokenNames.LogicalAnd, /&&/, '&&'),
    LogicalOr: createValueRegToken(TokenNames.LogicalOr, /\|\|/, '||'),
    NullishCoalescing: createValueRegToken(TokenNames.NullishCoalescing, /\?\?/, '??'),
    Increment: createValueRegToken(TokenNames.Increment, /\+\+/, '++'),
    Decrement: createValueRegToken(TokenNames.Decrement, /--/, '--'),
    Exponentiation: createValueRegToken(TokenNames.Exponentiation, /\*\*/, '**'),
    BitwiseAndAssign: createValueRegToken(TokenNames.BitwiseAndAssign, /&=/, '&='),
    BitwiseOrAssign: createValueRegToken(TokenNames.BitwiseOrAssign, /\|=/, '|='),
    BitwiseXorAssign: createValueRegToken(TokenNames.BitwiseXorAssign, /\^=/, '^='),
    OptionalChaining: createValueRegToken(TokenNames.OptionalChaining, /\?\./, '?.', false, {not: /^\d/}),

    // 1 字符
    LBrace: createValueRegToken(TokenNames.LBrace, /\{/, '{'),
    RBrace: createValueRegToken(TokenNames.RBrace, /\}/, '}'),
    LParen: createValueRegToken(TokenNames.LParen, /\(/, '('),
    RParen: createValueRegToken(TokenNames.RParen, /\)/, ')'),
    LBracket: createValueRegToken(TokenNames.LBracket, /\[/, '['),
    RBracket: createValueRegToken(TokenNames.RBracket, /\]/, ']'),
    Dot: createValueRegToken(TokenNames.Dot, /\./, '.'),
    Semicolon: createValueRegToken(TokenNames.Semicolon, /;/, ';'),
    Comma: createValueRegToken(TokenNames.Comma, /,/, ','),
    Less: createValueRegToken(TokenNames.Less, /</, '<'),
    Greater: createValueRegToken(TokenNames.Greater, />/, '>'),
    Plus: createValueRegToken(TokenNames.Plus, /\+/, '+'),
    Minus: createValueRegToken(TokenNames.Minus, /-/, '-'),
    Asterisk: createValueRegToken(TokenNames.Asterisk, /\*/, '*'),

    // ============================================
    // 除法运算符 vs 正则表达式（词法歧义处理）
    // Slash 有上下文约束，只有前一个 token 是表达式结尾才匹配
    // 否则 fallback 到 RegularExpressionLiteral
    // ============================================
    Slash: createValueRegToken(
        TokenNames.Slash,
        /\//,
        '/',
        false,  // skip
        undefined,  // lookahead
        {onlyAfter: EXPRESSION_END_TOKENS}  // 上下文约束
    ),

    // 正则表达式字面量（无约束，作为 Slash 的 fallback）
    // 规范: RegularExpressionLiteral :: / RegularExpressionBody / RegularExpressionFlags
    //
    // RegularExpressionFirstChar :: 不能是 * \ / [ (避免与 /* 注释冲突)
    // RegularExpressionChar :: 不能是 \ / [
    // RegularExpressionFlags :: IdentifierPartChar* (任意标识符字符)
    //
    // 注意：无效标志（如 /x/abc）会在语义分析时报错，词法层面只需贪婪匹配
    RegularExpressionLiteral: createEmptyValueRegToken(
        TokenNames.RegularExpressionLiteral,
        /\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[a-zA-Z$_]*/
    ),

    Modulo: createValueRegToken(TokenNames.Modulo, /%/, '%'),
    BitwiseAnd: createValueRegToken(TokenNames.BitwiseAnd, /&/, '&'),
    BitwiseOr: createValueRegToken(TokenNames.BitwiseOr, /\|/, '|'),
    BitwiseXor: createValueRegToken(TokenNames.BitwiseXor, /\^/, '^'),
    BitwiseNot: createValueRegToken(TokenNames.BitwiseNot, /~/, '~'),
    LogicalNot: createValueRegToken(TokenNames.LogicalNot, /!/, '!'),
    Question: createValueRegToken(TokenNames.Question, /\?/, '?'),
    Colon: createValueRegToken(TokenNames.Colon, /:/, ':'),
    Assign: createValueRegToken(TokenNames.Assign, /=/, '='),

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

    PrivateIdentifier: createEmptyValueRegToken(TokenNames.PrivateIdentifier, PRIVATE_IDENTIFIER_PATTERN),
    IdentifierName: createEmptyValueRegToken(TokenNames.IdentifierName, IDENTIFIER_NAME_PATTERN),
}
