// ============================================
// Token 对象（用于 TokenConsumer 复用）
// ============================================
import {
    createEmptyValueRegToken, createKeywordToken,
    createValueRegToken,
} from "subhuti/src/struct/SubhutiCreateToken.ts";
import {SlimeTokenType} from "slime-token/src/SlimeTokenType.ts";

// ============================================
// 表达式结尾 Token 集合
// 用于词法歧义处理：/ 在这些 token 后是除法，否则是正则表达式
// ============================================
export const EXPRESSION_END_TOKENS = new Set([
    // 标识符和字面量
    SlimeTokenType.IdentifierName,
    SlimeTokenType.NumericLiteral,  // 包含所有数字变体（十进制、BigInt、十六进制等）
    SlimeTokenType.StringLiteral,
    SlimeTokenType.RegularExpressionLiteral,
    SlimeTokenType.NoSubstitutionTemplate,
    SlimeTokenType.TemplateTail,

    // 关闭括号
    SlimeTokenType.RParen,      // )
    SlimeTokenType.RBracket,    // ]
    SlimeTokenType.RBrace,      // }

    // 后缀运算符
    SlimeTokenType.Increment,   // ++
    SlimeTokenType.Decrement,   // --

    // 关键字字面量
    SlimeTokenType.This,
    SlimeTokenType.True,
    SlimeTokenType.False,
    SlimeTokenType.NullLiteral,
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
    // DivideAssign 有上下文约束，只有前一个 token 是表达式结尾才匹配
    // 否则 /=xxx/g 会被识别为正则表达式
    DivideAssign: createValueRegToken(
        SlimeTokenType.DivideAssign,
        /\/=/,
        '/=',
        false,  // skip
        undefined,  // lookahead
        {onlyAfter: EXPRESSION_END_TOKENS}  // 上下文约束
    ),
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
    // 除法运算符 vs 正则表达式（词法歧义处理）
    // Slash 有上下文约束，只有前一个 token 是表达式结尾才匹配
    // 否则 fallback 到 RegularExpressionLiteral
    // ============================================
    Slash: createValueRegToken(
        SlimeTokenType.Slash,
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
        SlimeTokenType.RegularExpressionLiteral,
        /\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[a-zA-Z$_]*/
    ),

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
