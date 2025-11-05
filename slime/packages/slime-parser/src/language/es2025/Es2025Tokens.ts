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

export const es2025Tokens: SubhutiCreateToken[] = [

    // ============================================
    // A.1.2 注释 (Comments)
    // 规范：§1.3 Line 90-123
    // ============================================

    // Hashbang 注释（必须在文件开头）
    createValueRegToken(TokenNames.HashbangComment, /#![^\n\r]*/, '', true),

    // 多行注释
    createValueRegToken(TokenNames.MultiLineComment, /\/\*[\s\S]*?\*\//, '', true),

    // 单行注释
    createValueRegToken(TokenNames.SingleLineComment, /\/\/[^\n\r]*/, '', true),

    // ============================================
    // A.1.1 空白符和换行符
    // 规范：§1.2 Line 60-86
    // ============================================

    // 空白符（跳过）
    createValueRegToken(TokenNames.WhiteSpace, /[\t\v\f \u00A0\uFEFF]+/, '', true),

    // 换行符：\r\n 必须整体匹配（优先）
    createValueRegToken(TokenNames.LineTerminator, /\r\n/, '', true),

    // 换行符：其他形式
    createValueRegToken(TokenNames.LineTerminator, /[\n\r\u2028\u2029]/, '', true),

    // ============================================
    // A.1.5 关键字和保留字
    // 规范：§1.5 Line 174-179
    // 优先级：关键字必须在标识符之前
    // ============================================

    createKeywordToken(TokenNames.AwaitTok, 'await'),
    createKeywordToken(TokenNames.BreakTok, 'break'),
    createKeywordToken(TokenNames.CaseTok, 'case'),
    createKeywordToken(TokenNames.CatchTok, 'catch'),
    createKeywordToken(TokenNames.ClassTok, 'class'),
    createKeywordToken(TokenNames.ConstTok, 'const'),
    createKeywordToken(TokenNames.ContinueTok, 'continue'),
    createKeywordToken(TokenNames.DebuggerTok, 'debugger'),
    createKeywordToken(TokenNames.DefaultTok, 'default'),
    createKeywordToken(TokenNames.DeleteTok, 'delete'),
    createKeywordToken(TokenNames.DoTok, 'do'),
    createKeywordToken(TokenNames.ElseTok, 'else'),
    createKeywordToken(TokenNames.EnumTok, 'enum'),
    createKeywordToken(TokenNames.ExportTok, 'export'),
    createKeywordToken(TokenNames.ExtendsTok, 'extends'),
    createKeywordToken(TokenNames.FalseTok, 'false'),
    createKeywordToken(TokenNames.FinallyTok, 'finally'),
    createKeywordToken(TokenNames.ForTok, 'for'),
    createKeywordToken(TokenNames.FunctionTok, 'function'),
    createKeywordToken(TokenNames.IfTok, 'if'),
    createKeywordToken(TokenNames.ImportTok, 'import'),
    createKeywordToken(TokenNames.InTok, 'in'),
    createKeywordToken(TokenNames.InstanceofTok, 'instanceof'),
    createKeywordToken(TokenNames.NewTok, 'new'),
    createKeywordToken(TokenNames.NullTok, 'null'),
    createKeywordToken(TokenNames.ReturnTok, 'return'),
    createKeywordToken(TokenNames.SuperTok, 'super'),
    createKeywordToken(TokenNames.SwitchTok, 'switch'),
    createKeywordToken(TokenNames.ThisTok, 'this'),
    createKeywordToken(TokenNames.ThrowTok, 'throw'),
    createKeywordToken(TokenNames.TrueTok, 'true'),
    createKeywordToken(TokenNames.TryTok, 'try'),
    createKeywordToken(TokenNames.TypeofTok, 'typeof'),
    createKeywordToken(TokenNames.VarTok, 'var'),
    createKeywordToken(TokenNames.VoidTok, 'void'),
    createKeywordToken(TokenNames.WhileTok, 'while'),
    createKeywordToken(TokenNames.WithTok, 'with'),
    createKeywordToken(TokenNames.YieldTok, 'yield'),

    // 上下文关键字
    createKeywordToken(TokenNames.AsyncTok, 'async'),
    createKeywordToken(TokenNames.LetTok, 'let'),
    createKeywordToken(TokenNames.StaticTok, 'static'),
    createKeywordToken(TokenNames.GetTok, 'get'),
    createKeywordToken(TokenNames.SetTok, 'set'),
    createKeywordToken(TokenNames.OfTok, 'of'),
    createKeywordToken(TokenNames.TargetTok, 'target'),  // new.target
    createKeywordToken(TokenNames.MetaTok, 'meta'),      // import.meta
    createKeywordToken(TokenNames.AsTok, 'as'),
    createKeywordToken(TokenNames.FromTok, 'from'),

    // ============================================
    // A.1.9 数字字面量
    // 规范：§1.9 Line 219-329
    // 优先级：BigInt > 特殊进制 > 十进制
    // ============================================

    // BigInt：十六进制 + n
    createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n/),

    // BigInt：二进制 + n
    createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[bB][01](_?[01])*n/),

    // BigInt：八进制 + n
    createEmptyValueRegToken(TokenNames.BigIntLiteral, /0[oO][0-7](_?[0-7])*n/),

    // BigInt：十进制 + n
    createEmptyValueRegToken(TokenNames.BigIntLiteral, /(?:0|[1-9](_?[0-9])*)n/),

    // 十六进制
    createEmptyValueRegToken(TokenNames.NumericLiteral, /0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/),

    // 二进制
    createEmptyValueRegToken(TokenNames.NumericLiteral, /0[bB][01](_?[01])*/),

    // 八进制
    createEmptyValueRegToken(TokenNames.NumericLiteral, /0[oO][0-7](_?[0-7])*/),

    // 遗留八进制（严格模式下不允许）
    createEmptyValueRegToken(TokenNames.LegacyOctalLiteral, /0[0-7]+/),

    // 十进制（含小数、科学计数法、数字分隔符）
    createEmptyValueRegToken(TokenNames.NumericLiteral, /(?:[0-9](_?[0-9])*\.([0-9](_?[0-9])*)?|\.[0-9](_?[0-9])*|[0-9](_?[0-9])*)([eE][+-]?[0-9](_?[0-9])*)?/),

    // ============================================
    // A.1.10 字符串字面量
    // 规范：§1.10 Line 331-413
    // ============================================

    // 双引号字符串
    createEmptyValueRegToken(TokenNames.StringLiteral, /"(?:[^\n\r"\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*"/),

    // 单引号字符串
    createEmptyValueRegToken(TokenNames.StringLiteral, /'(?:[^\n\r'\\]|\\(?:['"\\bfnrtv]|[^'"\\bfnrtv0-9xu\n\r]|0(?![0-9])|x[0-9a-fA-F]{2}|u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]+\})))*'/),

    // ============================================
    // A.1.12 模板字面量
    // 规范：§1.12 Line 461-518
    // 优先级：必须在字符串之前
    // ============================================

    createEmptyValueRegToken(TokenNames.TemplateHead, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),

    createEmptyValueRegToken(TokenNames.TemplateMiddle, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*\$\{/),

    createEmptyValueRegToken(TokenNames.TemplateTail, /\}(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),

    createEmptyValueRegToken(TokenNames.NoSubstitutionTemplate, /`(?:[^`\\$]|\\[\s\S]|\$(?!\{))*`/),

    // ============================================
    // A.1.8 运算符和标点符号
    // 规范：§1.8 Line 181-202
    // 优先级：4字符 > 3字符 > 2字符 > 1字符
    // ============================================

    // 4 字符
    createValueRegToken(TokenNames.UnsignedRightShiftAssign, />>>=/, '>>>='),

    // 3 字符
    createValueRegToken(TokenNames.Ellipsis, /\.\.\./, '...'),
    createValueRegToken(TokenNames.UnsignedRightShift, />>>/, '>>>'),
    createValueRegToken(TokenNames.StrictEqual, /===/, '==='),
    createValueRegToken(TokenNames.StrictNotEqual, /!==/, '!=='),
    createValueRegToken(TokenNames.LeftShiftAssign, /<<=/, '<<='),
    createValueRegToken(TokenNames.RightShiftAssign, />>=/, '>>='),
    createValueRegToken(TokenNames.ExponentiationAssign, /\*\*=/, '**='),
    createValueRegToken(TokenNames.LogicalAndAssign, /&&=/, '&&='),
    createValueRegToken(TokenNames.LogicalOrAssign, /\|\|=/, '||='),
    createValueRegToken(TokenNames.NullishCoalescingAssign, /\?\?=/, '??='),

    // 2 字符
    createValueRegToken(TokenNames.Arrow, /=>/, '=>'),
    createValueRegToken(TokenNames.PlusAssign, /\+=/, '+='),
    createValueRegToken(TokenNames.MinusAssign, /-=/, '-='),
    createValueRegToken(TokenNames.MultiplyAssign, /\*=/, '*='),
    createValueRegToken(TokenNames.DivideAssign, /\/=/, '/='),
    createValueRegToken(TokenNames.ModuloAssign, /%=/, '%='),
    createValueRegToken(TokenNames.LeftShift, /<</, '<<'),
    createValueRegToken(TokenNames.RightShift, />>/, '>>'),
    createValueRegToken(TokenNames.LessEqual, /<=/, '<='),
    createValueRegToken(TokenNames.GreaterEqual, />=/, '>='),
    createValueRegToken(TokenNames.Equal, /==/, '=='),
    createValueRegToken(TokenNames.NotEqual, /!=/, '!='),
    createValueRegToken(TokenNames.LogicalAnd, /&&/, '&&'),
    createValueRegToken(TokenNames.LogicalOr, /\|\|/, '||'),
    createValueRegToken(TokenNames.NullishCoalescing, /\?\?/, '??'),
    createValueRegToken(TokenNames.Increment, /\+\+/, '++'),
    createValueRegToken(TokenNames.Decrement, /--/, '--'),
    createValueRegToken(TokenNames.Exponentiation, /\*\*/, '**'),
    createValueRegToken(TokenNames.BitwiseAndAssign, /&=/, '&='),
    createValueRegToken(TokenNames.BitwiseOrAssign, /\|=/, '|='),
    createValueRegToken(TokenNames.BitwiseXorAssign, /\^=/, '^='),

    // 🔥 OptionalChaining: ?. [lookahead ∉ DecimalDigit]
    // 规范：§1.8 Line 189
    createValueRegToken(
        TokenNames.OptionalChaining,
        /\?\./,
        '?.',
        false,  // 不跳过
        {not: /^\d/}  // 后面不能是数字
    ),

    // 1 字符
    createValueRegToken(TokenNames.LBrace, /\{/, '{'),
    createValueRegToken(TokenNames.RBrace, /\}/, '}'),
    createValueRegToken(TokenNames.LParen, /\(/, '('),
    createValueRegToken(TokenNames.RParen, /\)/, ')'),
    createValueRegToken(TokenNames.LBracket, /\[/, '['),
    createValueRegToken(TokenNames.RBracket, /\]/, ']'),
    createValueRegToken(TokenNames.Dot, /\./, '.'),
    createValueRegToken(TokenNames.Semicolon, /;/, ';'),
    createValueRegToken(TokenNames.Comma, /,/, ','),
    createValueRegToken(TokenNames.Less, /</, '<'),
    createValueRegToken(TokenNames.Greater, />/, '>'),
    createValueRegToken(TokenNames.Plus, /\+/, '+'),
    createValueRegToken(TokenNames.Minus, /-/, '-'),
    createValueRegToken(TokenNames.Asterisk, /\*/, '*'),
    createValueRegToken(TokenNames.Slash, /\//, '/'),
    createValueRegToken(TokenNames.Modulo, /%/, '%'),
    createValueRegToken(TokenNames.BitwiseAnd, /&/, '&'),
    createValueRegToken(TokenNames.BitwiseOr, /\|/, '|'),
    createValueRegToken(TokenNames.BitwiseXor, /\^/, '^'),
    createValueRegToken(TokenNames.BitwiseNot, /~/, '~'),
    createValueRegToken(TokenNames.LogicalNot, /!/, '!'),
    createValueRegToken(TokenNames.Question, /\?/, '?'),
    createValueRegToken(TokenNames.Colon, /:/, ':'),
    createValueRegToken(TokenNames.Assign, /=/, '='),

    // ============================================
    // A.1.5 标识符
    // 规范：§1.5 Line 138-179
    // 优先级：私有标识符 > 普通标识符
    // ============================================

    // 私有标识符：# + IdentifierName
    createEmptyValueRegToken(TokenNames.PrivateIdentifier, /#[a-zA-Z_$][a-zA-Z0-9_$]*/),

    // 普通标识符
    createEmptyValueRegToken(TokenNames.Identifier, /[a-zA-Z_$][a-zA-Z0-9_$]*/),

    // ============================================
    // A.1.11 正则字面量（简化版）
    // 规范：§1.11 Line 415-458
    // 注意：完整实现需要上下文感知
    // ============================================

    createEmptyValueRegToken(TokenNames.RegularExpressionLiteral, /\/(?:[^\n\r\/\\[]|\\[^\n\r]|\[(?:[^\n\r\]\\]|\\[^\n\r])*\])+\/[dgimsuvy]*/),
]
