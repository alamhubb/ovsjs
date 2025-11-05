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
    SubhutiCreateToken
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
    AsyncTok: 'AsyncTok',
    LetTok: 'LetTok',
    StaticTok: 'StaticTok',
    GetTok: 'GetTok',
    SetTok: 'SetTok',
    OfTok: 'OfTok',
    TargetTok: 'TargetTok',
    MetaTok: 'MetaTok',
    AsTok: 'AsTok',
    FromTok: 'FromTok',

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
    Identifier: 'Identifier',

    // 正则字面量
    RegularExpressionLiteral: 'RegularExpressionLiteral',
} as const

// ============================================
// Token 对象（用于 TokenConsumer 复用）
// ============================================
export const es2025TokensObj = {

    // ============================================
    // A.1.2 注释 (Comments)
    // ============================================

    HashbangComment: createValueRegToken(TokenNames.HashbangComment, /#![^\n\r]*/, '', true),
    MultiLineComment: createValueRegToken(TokenNames.MultiLineComment, /\/\*[\s\S]*?\*\//, '', true),
    SingleLineComment: createValueRegToken(TokenNames.SingleLineComment, /\/\/[^\n\r]*/, '', true),

    // ============================================
    // A.1.1 空白符和换行符
    // ============================================

    WhiteSpace: createValueRegToken(TokenNames.WhiteSpace, /[\t\v\f \u00A0\uFEFF]+/, '', true),
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

    AsyncTok: createKeywordToken(TokenNames.AsyncTok, 'async'),
    LetTok: createKeywordToken(TokenNames.LetTok, 'let'),
    StaticTok: createKeywordToken(TokenNames.StaticTok, 'static'),
    GetTok: createKeywordToken(TokenNames.GetTok, 'get'),
    SetTok: createKeywordToken(TokenNames.SetTok, 'set'),
    OfTok: createKeywordToken(TokenNames.OfTok, 'of'),
    TargetTok: createKeywordToken(TokenNames.TargetTok, 'target'),
    MetaTok: createKeywordToken(TokenNames.MetaTok, 'meta'),
    AsTok: createKeywordToken(TokenNames.AsTok, 'as'),
    FromTok: createKeywordToken(TokenNames.FromTok, 'from'),

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

    StringDoubleQuote: createEmptyValueRegToken(TokenNames.StringLiteral, /"(?:[^\n\r"\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),
    StringSingleQuote: createEmptyValueRegToken(TokenNames.StringLiteral, /'(?:[^\n\r'\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),

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
    DivideAssign: createValueRegToken(TokenNames.DivideAssign, /\/=/, '/='),
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
    Slash: createValueRegToken(TokenNames.Slash, /\//, '/'),
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

    PrivateIdentifier: createEmptyValueRegToken(TokenNames.PrivateIdentifier, /#[a-zA-Z_$][a-zA-Z0-9_$]*/),
    Identifier: createEmptyValueRegToken(TokenNames.Identifier, /[a-zA-Z_$][a-zA-Z0-9_$]*/),

    // ============================================
    // A.1.11 正则字面量
    // ============================================

    RegularExpressionLiteral: createEmptyValueRegToken(TokenNames.RegularExpressionLiteral, /\/(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])+\/[dgimsuvy]*/),
}

export const es2025Tokens: SubhutiCreateToken[] = Object.values(es2025TokensObj)

// ============================================
// 保留字集合（用于 Identifier 验证）
// ============================================

/**
 * ES2025 保留字集合
 * 来源：ECMAScript® 2025 规范 A.1.5 Keywords and Reserved Words
 *
 * 用途：在 Parser 中验证标识符是否为保留字
 * 实现：自动从所有关键字 token 中提取，确保单一数据源
 */
export const ReservedWords = new Set(
    es2025Tokens
        .filter(token => token.isKeyword)  // 过滤出所有关键字 token
        .map(token => token.value!)        // 提取 value（'await', 'break' 等）
)
