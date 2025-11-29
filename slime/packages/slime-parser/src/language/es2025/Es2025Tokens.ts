/**
 * ES2025 Tokens - 完全符合 ECMAScript® 2025 规范
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. 完全独立，不继承任何其他版本
 * 2. 按规范 A.1 词法语法组织
 * 3. 只在词法层实现字符级 lookahead
 * 4. 长 token 在前，短 token 在后
 * 5. YAGNI - 只导出 tokens 数组，不需要对象、Map、Consumer 类
 */

import {
    createKeywordToken,
    createValueRegToken,
    createEmptyValueRegToken,
    SubhutiCreateToken,
    SubhutiTokenContextConstraint
} from 'subhuti/src/struct/SubhutiCreateToken.ts'
import {SubhutiLexerTokenNames} from "subhuti/src/SubhutiLexer.ts";

// ============================================
// Token 名称常量（避免魔法字符串）
// ============================================

export const TokenNames = {
    ...SubhutiLexerTokenNames,

    // 注释
    HashbangComment: 'HashbangComment',
    MultiLineComment: 'MultiLineComment',
    SingleLineComment: 'SingleLineComment',

    // 空白符和换行符
    WhiteSpace: 'WhiteSpace',
    LineTerminator: 'LineTerminator',

    // 关键字
    AwaitTok: 'AwaitTok',
    BreakTok: 'BreakTok',
    CaseTok: 'CaseTok',
    CatchTok: 'CatchTok',
    ClassTok: 'ClassTok',
    ConstTok: 'ConstTok',
    ContinueTok: 'ContinueTok',
    DebuggerTok: 'DebuggerTok',
    DefaultTok: 'DefaultTok',
    DeleteTok: 'DeleteTok',
    DoTok: 'DoTok',
    ElseTok: 'ElseTok',
    EnumTok: 'EnumTok',
    ExportTok: 'ExportTok',
    ExtendsTok: 'ExtendsTok',
    FalseTok: 'FalseTok',
    FinallyTok: 'FinallyTok',
    ForTok: 'ForTok',
    FunctionTok: 'FunctionTok',
    IfTok: 'IfTok',
    ImportTok: 'ImportTok',
    InTok: 'InTok',
    InstanceofTok: 'InstanceofTok',
    LetTok: 'LetTok',
    NewTok: 'NewTok',
    NullTok: 'NullTok',
    ReturnTok: 'ReturnTok',
    SuperTok: 'SuperTok',
    SwitchTok: 'SwitchTok',
    ThisTok: 'ThisTok',
    ThrowTok: 'ThrowTok',
    TrueTok: 'TrueTok',
    TryTok: 'TryTok',
    TypeofTok: 'TypeofTok',
    VarTok: 'VarTok',
    VoidTok: 'VoidTok',
    WhileTok: 'WhileTok',
    WithTok: 'WithTok',
    YieldTok: 'YieldTok',
    // 注意：async, static, as, get, set, of, target, meta, from 是软关键字
    // 按照 ES2025 规范，它们在词法层是 IdentifierName，不是独立的 token
    // 在 Parser 中通过值检查来识别（见 Es2025TokenConsumer）
    // let 虽然在非严格模式下可作为标识符，但为简化实现，作为独立 token 处理

    // 数字字面量
    BigIntLiteral: 'BigIntLiteral',
    NumericLiteral: 'NumericLiteral',
    LegacyOctalLiteral: 'LegacyOctalLiteral',

    // 字符串字面量
    StringLiteral: 'StringLiteral',


    NoSubstitutionTemplate: 'NoSubstitutionTemplate',

    // 运算符（4字符）
    UnsignedRightShiftAssign: 'UnsignedRightShiftAssign',

    // 运算符（3字符）
    Ellipsis: 'Ellipsis',
    UnsignedRightShift: 'UnsignedRightShift',
    StrictEqual: 'StrictEqual',
    StrictNotEqual: 'StrictNotEqual',
    LeftShiftAssign: 'LeftShiftAssign',
    RightShiftAssign: 'RightShiftAssign',
    ExponentiationAssign: 'ExponentiationAssign',
    LogicalAndAssign: 'LogicalAndAssign',
    LogicalOrAssign: 'LogicalOrAssign',
    NullishCoalescingAssign: 'NullishCoalescingAssign',

    // 运算符（2字符）
    Arrow: 'Arrow',
    PlusAssign: 'PlusAssign',
    MinusAssign: 'MinusAssign',
    MultiplyAssign: 'MultiplyAssign',
    DivideAssign: 'DivideAssign',
    ModuloAssign: 'ModuloAssign',
    LeftShift: 'LeftShift',
    RightShift: 'RightShift',
    LessEqual: 'LessEqual',
    GreaterEqual: 'GreaterEqual',
    Equal: 'Equal',
    NotEqual: 'NotEqual',
    LogicalAnd: 'LogicalAnd',
    LogicalOr: 'LogicalOr',
    NullishCoalescing: 'NullishCoalescing',
    Increment: 'Increment',
    Decrement: 'Decrement',
    Exponentiation: 'Exponentiation',
    BitwiseAndAssign: 'BitwiseAndAssign',
    BitwiseOrAssign: 'BitwiseOrAssign',
    BitwiseXorAssign: 'BitwiseXorAssign',
    OptionalChaining: 'OptionalChaining',

    // 运算符（1字符）
    LBrace: 'LBrace',
    RBrace: 'RBrace',
    LParen: 'LParen',
    RParen: 'RParen',
    LBracket: 'LBracket',
    RBracket: 'RBracket',
    Dot: 'Dot',
    Semicolon: 'Semicolon',
    Comma: 'Comma',
    Less: 'Less',
    Greater: 'Greater',
    Plus: 'Plus',
    Minus: 'Minus',
    Asterisk: 'Asterisk',
    Slash: 'Slash',
    Modulo: 'Modulo',
    BitwiseAnd: 'BitwiseAnd',
    BitwiseOr: 'BitwiseOr',
    BitwiseXor: 'BitwiseXor',
    BitwiseNot: 'BitwiseNot',
    LogicalNot: 'LogicalNot',
    Question: 'Question',
    Colon: 'Colon',
    Assign: 'Assign',

    // 标识符
    PrivateIdentifier: 'PrivateIdentifier',
    IdentifierNameTok: 'IdentifierNameTok',

    // 正则字面量
    RegularExpressionLiteral: 'RegularExpressionLiteral',
} as const

// ============================================
// 软关键字值常量（Contextual Keywords）
// 这些在词法层是 IdentifierName，在语法层通过值检查识别
// 注意：let 已作为独立 token 处理（LetTok）
// ============================================
export const ContextualKeywords = {
    ASYNC: 'async',
    STATIC: 'static',
    AS: 'as',
    GET: 'get',
    SET: 'set',
    OF: 'of',
    FROM: 'from',
    TARGET: 'target',
    META: 'meta',
} as const

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

// ============================================
// 表达式结尾 Token 集合
// 用于词法歧义处理：/ 在这些 token 后是除法，否则是正则表达式
// ============================================
export const EXPRESSION_END_TOKENS = new Set([
    // 标识符和字面量
    TokenNames.IdentifierNameTok,
    TokenNames.NumericLiteral,
    TokenNames.LegacyOctalLiteral,  // 传统八进制字面量 (Annex B)
    TokenNames.BigIntLiteral,
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
    TokenNames.ThisTok,
    TokenNames.TrueTok,
    TokenNames.FalseTok,
    TokenNames.NullTok,
])

// ============================================
// Token 对象（用于 TokenConsumer 复用）
// ============================================
export const es2025TokensObj = {

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
        { onlyAtStart: true }  // 只在文件开头匹配
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

    AwaitTok: createKeywordToken(TokenNames.AwaitTok, 'await'),
    BreakTok: createKeywordToken(TokenNames.BreakTok, 'break'),
    CaseTok: createKeywordToken(TokenNames.CaseTok, 'case'),
    CatchTok: createKeywordToken(TokenNames.CatchTok, 'catch'),
    ClassTok: createKeywordToken(TokenNames.ClassTok, 'class'),
    ConstTok: createKeywordToken(TokenNames.ConstTok, 'const'),
    ContinueTok: createKeywordToken(TokenNames.ContinueTok, 'continue'),
    DebuggerTok: createKeywordToken(TokenNames.DebuggerTok, 'debugger'),
    DefaultTok: createKeywordToken(TokenNames.DefaultTok, 'default'),
    DeleteTok: createKeywordToken(TokenNames.DeleteTok, 'delete'),
    DoTok: createKeywordToken(TokenNames.DoTok, 'do'),
    ElseTok: createKeywordToken(TokenNames.ElseTok, 'else'),
    EnumTok: createKeywordToken(TokenNames.EnumTok, 'enum'),
    ExportTok: createKeywordToken(TokenNames.ExportTok, 'export'),
    ExtendsTok: createKeywordToken(TokenNames.ExtendsTok, 'extends'),
    FalseTok: createKeywordToken(TokenNames.FalseTok, 'false'),
    FinallyTok: createKeywordToken(TokenNames.FinallyTok, 'finally'),
    ForTok: createKeywordToken(TokenNames.ForTok, 'for'),
    FunctionTok: createKeywordToken(TokenNames.FunctionTok, 'function'),
    IfTok: createKeywordToken(TokenNames.IfTok, 'if'),
    ImportTok: createKeywordToken(TokenNames.ImportTok, 'import'),
    InTok: createKeywordToken(TokenNames.InTok, 'in'),
    InstanceofTok: createKeywordToken(TokenNames.InstanceofTok, 'instanceof'),
    LetTok: createKeywordToken(TokenNames.LetTok, 'let'),
    NewTok: createKeywordToken(TokenNames.NewTok, 'new'),
    NullTok: createKeywordToken(TokenNames.NullTok, 'null'),
    ReturnTok: createKeywordToken(TokenNames.ReturnTok, 'return'),
    SuperTok: createKeywordToken(TokenNames.SuperTok, 'super'),
    SwitchTok: createKeywordToken(TokenNames.SwitchTok, 'switch'),
    ThisTok: createKeywordToken(TokenNames.ThisTok, 'this'),
    ThrowTok: createKeywordToken(TokenNames.ThrowTok, 'throw'),
    TrueTok: createKeywordToken(TokenNames.TrueTok, 'true'),
    TryTok: createKeywordToken(TokenNames.TryTok, 'try'),
    TypeofTok: createKeywordToken(TokenNames.TypeofTok, 'typeof'),
    VarTok: createKeywordToken(TokenNames.VarTok, 'var'),
    VoidTok: createKeywordToken(TokenNames.VoidTok, 'void'),
    WhileTok: createKeywordToken(TokenNames.WhileTok, 'while'),
    WithTok: createKeywordToken(TokenNames.WithTok, 'with'),
    YieldTok: createKeywordToken(TokenNames.YieldTok, 'yield'),
    // 软关键字（async, static, as, get, set, of, target, meta, from）
    // 在词法层作为 IdentifierNameTok 处理，在 Parser 中通过值检查识别

    // ============================================
    // A.1.9 数字字面量
    // ============================================

    BigIntHex: createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),
    BigIntBinary: createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[bB][01](_?[01])*n/),
    BigIntOctal: createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[oO][0-7](_?[0-7])*n/),
    BigIntDecimal: createEmptyValueRegToken(TokenNames.BigIntLiteral, /(?:0|[1-9](_?[0-9])*)n/),
    NumericHex: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),
    NumericBinary: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[bB][01](_?[01])*/),
    NumericOctal: createEmptyValueRegToken(TokenNames.NumericLiteral, /0[oO][0-7](_?[0-7])*/),
    LegacyOctalLiteral: createEmptyValueRegToken(TokenNames.LegacyOctalLiteral, /0[0-7]+/),
    NumericLiteral: createEmptyValueRegToken(TokenNames.NumericLiteral, /(?:[0-9](_?[0-9])*\.([0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*|[0-9](_?[0-9])*)([eE][+-]?[0-9](_?[0-9])*)?/),

    // ============================================
    // A.1.10 字符串字面量
    // ============================================

    // 支持行续符 (LineContinuation): \ 后跟 \r\n | \r | \n
    // 参考 ES2025 规范 12.9.4 String Literals 和 Annex B
    // Annex B: 支持八进制转义序列 \0-\7, \00-\77, \000-\377
    StringDoubleQuote: createEmptyValueRegToken(TokenNames.StringLiteral, /"(?:[^\n\r"\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
    StringSingleQuote: createEmptyValueRegToken(TokenNames.StringLiteral, /'(?:[^\n\r'\\]|\\(?:\r\n|\r|\n|['"\\bfnrtv]|[^'"\\bfnrtv\n\r]|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),

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
        { onlyAfter: EXPRESSION_END_TOKENS }  // 上下文约束
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
        { onlyAfter: EXPRESSION_END_TOKENS }  // 上下文约束
    ),

    // 正则表达式字面量（无约束，作为 Slash 的 fallback）
    // 根据 ECMAScript 规范，RegularExpressionFirstChar 不能是 * (避免与 /* 注释冲突)
    // 第一个字符：[^\n\r\/\\[*] 排除 *
    // 后续字符：[^\n\r\/\\[] 允许 *
    RegularExpressionLiteral: createEmptyValueRegToken(
        TokenNames.RegularExpressionLiteral,
        /\/(?:[^\n\r\/\\[*]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])*\/[dgimsuvy]*/
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
    IdentifierNameTok: createEmptyValueRegToken(TokenNames.IdentifierNameTok, IDENTIFIER_NAME_PATTERN),
}

export const es2025Tokens: SubhutiCreateToken[] = Object.values(es2025TokensObj)

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
 *    实现方式：识别为 IdentifierNameTok + consumeIdentifierValue()
 *
 * 用途：在 Parser 中验证标识符是否为保留字
 * 实现：自动从所有 isKeyword=true 的 token 中提取（仅包含硬关键字）
 */
export const ReservedWords = new Set(
    es2025Tokens
        .filter(token => token.isKeyword)  // 过滤出所有硬关键字 token
        .map(token => token.value!)        // 提取 value（'await', 'break' 等）
)
