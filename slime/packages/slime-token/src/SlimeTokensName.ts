/**
 * ES2025 Token 名称 - 完全符合 ECMAScript® 2025 规范 A.1 词法语法
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. TokenNames 属性名和值与规范 A.1 顶层规则名称完全一致
 * 2. 关键字名与规范 ReservedWord 一致（首字母大写）
 * 3. 标点符号使用语义化名称
 */

// ============================================
// Token 名称常量（与规范 A.1 词法规则名一致）
// ============================================

export const TokenNames = {

    // ============================================
    // A.1.2 White Space
    // 规范: WhiteSpace :: <TAB> | <VT> | <FF> | <SP> | <NBSP> | <ZWNBSP> | <USP>
    // ============================================
    WhiteSpace: 'WhiteSpace',

    // ============================================
    // A.1.3 Line Terminators
    // 规范: LineTerminator :: <LF> | <CR> | <LS> | <PS>
    // ============================================
    LineTerminator: 'LineTerminator',

    // ============================================
    // A.1.4 Comments
    // 规范: Comment :: MultiLineComment | SingleLineComment
    // 规范: HashbangComment :: #! SingleLineCommentChars_opt
    // ============================================
    HashbangComment: 'HashbangComment',
    MultiLineComment: 'MultiLineComment',
    SingleLineComment: 'SingleLineComment',

    // ============================================
    // A.1.5 Tokens (CommonToken)
    // 规范: CommonToken :: IdentifierName | PrivateIdentifier | Punctuator | NumericLiteral | StringLiteral | Template
    // ============================================

    // --- IdentifierName ---
    IdentifierName: 'IdentifierName',

    // --- PrivateIdentifier ---
    PrivateIdentifier: 'PrivateIdentifier',

    // --- NumericLiteral ---
    NumericLiteral: 'NumericLiteral',

    // --- StringLiteral ---
    StringLiteral: 'StringLiteral',

    // --- Template ---
    NoSubstitutionTemplate: 'NoSubstitutionTemplate',
    TemplateHead: 'TemplateHead',
    TemplateMiddle: 'TemplateMiddle',
    TemplateTail: 'TemplateTail',

    // --- RegularExpressionLiteral ---
    RegularExpressionLiteral: 'RegularExpressionLiteral',

    // ============================================
    // A.1.6 Punctuators
    // 规范: Punctuator :: OptionalChainingPunctuator | OtherPunctuator
    // ============================================

    // 4字符运算符
    UnsignedRightShiftAssign: 'UnsignedRightShiftAssign',   // >>>=

    // 3字符运算符
    Ellipsis: 'Ellipsis',                                   // ...
    UnsignedRightShift: 'UnsignedRightShift',               // >>>
    StrictEqual: 'StrictEqual',                             // ===
    StrictNotEqual: 'StrictNotEqual',                       // !==
    LeftShiftAssign: 'LeftShiftAssign',                     // <<=
    RightShiftAssign: 'RightShiftAssign',                   // >>=
    ExponentiationAssign: 'ExponentiationAssign',           // **=
    LogicalAndAssign: 'LogicalAndAssign',                   // &&=
    LogicalOrAssign: 'LogicalOrAssign',                     // ||=
    NullishCoalescingAssign: 'NullishCoalescingAssign',     // ??=

    // 2字符运算符
    Arrow: 'Arrow',                                         // =>
    PlusAssign: 'PlusAssign',                               // +=
    MinusAssign: 'MinusAssign',                             // -=
    MultiplyAssign: 'MultiplyAssign',                       // *=
    DivideAssign: 'DivideAssign',                           // /=
    ModuloAssign: 'ModuloAssign',                           // %=
    LeftShift: 'LeftShift',                                 // <<
    RightShift: 'RightShift',                               // >>
    LessEqual: 'LessEqual',                                 // <=
    GreaterEqual: 'GreaterEqual',                           // >=
    Equal: 'Equal',                                         // ==
    NotEqual: 'NotEqual',                                   // !=
    LogicalAnd: 'LogicalAnd',                               // &&
    LogicalOr: 'LogicalOr',                                 // ||
    NullishCoalescing: 'NullishCoalescing',                 // ??
    Increment: 'Increment',                                 // ++
    Decrement: 'Decrement',                                 // --
    Exponentiation: 'Exponentiation',                       // **
    BitwiseAndAssign: 'BitwiseAndAssign',                   // &=
    BitwiseOrAssign: 'BitwiseOrAssign',                     // |=
    BitwiseXorAssign: 'BitwiseXorAssign',                   // ^=
    OptionalChaining: 'OptionalChaining',                   // ?.

    // 1字符运算符
    LBrace: 'LBrace',                                       // {
    RBrace: 'RBrace',                                       // }
    LParen: 'LParen',                                       // (
    RParen: 'RParen',                                       // )
    LBracket: 'LBracket',                                   // [
    RBracket: 'RBracket',                                   // ]
    Dot: 'Dot',                                             // .
    Semicolon: 'Semicolon',                                 // ;
    Comma: 'Comma',                                         // ,
    Less: 'Less',                                           // <
    Greater: 'Greater',                                     // >
    Plus: 'Plus',                                           // +
    Minus: 'Minus',                                         // -
    Asterisk: 'Asterisk',                                   // *
    Slash: 'Slash',                                         // /
    Modulo: 'Modulo',                                       // %
    BitwiseAnd: 'BitwiseAnd',                               // &
    BitwiseOr: 'BitwiseOr',                                 // |
    BitwiseXor: 'BitwiseXor',                               // ^
    BitwiseNot: 'BitwiseNot',                               // ~
    LogicalNot: 'LogicalNot',                               // !
    Question: 'Question',                                   // ?
    Colon: 'Colon',                                         // :
    Assign: 'Assign',                                       // =

    // ============================================
    // A.1.7 Reserved Words (关键字)
    // 规范: ReservedWord :: one of
    //   await break case catch class const continue debugger default
    //   delete do else enum export extends false finally for function
    //   if import in instanceof new null return super switch this
    //   throw true try typeof var void while with yield
    // ============================================
    Await: 'Await',
    Break: 'Break',
    Case: 'Case',
    Catch: 'Catch',
    Class: 'Class',
    Const: 'Const',
    Continue: 'Continue',
    Debugger: 'Debugger',
    Default: 'Default',
    Delete: 'Delete',
    Do: 'Do',
    Else: 'Else',
    Enum: 'Enum',
    Export: 'Export',
    Extends: 'Extends',
    False: 'False',
    Finally: 'Finally',
    For: 'For',
    Function: 'Function',
    If: 'If',
    Import: 'Import',
    In: 'In',
    Instanceof: 'Instanceof',
    Let: 'Let',
    New: 'New',
    Null: 'Null',
    Return: 'Return',
    Super: 'Super',
    Switch: 'Switch',
    This: 'This',
    Throw: 'Throw',
    True: 'True',
    Try: 'Try',
    Typeof: 'Typeof',
    Var: 'Var',
    Void: 'Void',
    While: 'While',
    With: 'With',
    Yield: 'Yield',

    // ============================================
    // 软关键字（Contextual Keywords）
    // 规范中这些在词法层是 IdentifierName，在语法层通过值检查识别
    // ============================================
    Async: 'Async',
    Static: 'Static',
    Get: 'Get',
    Set: 'Set',
    Of: 'Of',
    From: 'From',
    As: 'As',

} as const;

// ============================================
// SlimeTokenType 别名（供外部使用）
// ============================================
export const SlimeTokenType = TokenNames;

// ============================================
// 运算符 Token 类型分组
// ============================================

/**
 * 赋值运算符 Token 类型
 * 对应: = += -= *= /= %= **= <<= >>= >>>= &= |= ^= &&= ||= ??=
 */
export const SlimeAssignmentOperatorTokenTypes = {
    Assign: TokenNames.Assign,                                       // =
    PlusAssign: TokenNames.PlusAssign,                               // +=
    MinusAssign: TokenNames.MinusAssign,                             // -=
    MultiplyAssign: TokenNames.MultiplyAssign,                       // *=
    DivideAssign: TokenNames.DivideAssign,                           // /=
    ModuloAssign: TokenNames.ModuloAssign,                           // %=
    ExponentiationAssign: TokenNames.ExponentiationAssign,           // **=
    LeftShiftAssign: TokenNames.LeftShiftAssign,                     // <<=
    RightShiftAssign: TokenNames.RightShiftAssign,                   // >>=
    UnsignedRightShiftAssign: TokenNames.UnsignedRightShiftAssign,   // >>>=
    BitwiseAndAssign: TokenNames.BitwiseAndAssign,                   // &=
    BitwiseOrAssign: TokenNames.BitwiseOrAssign,                     // |=
    BitwiseXorAssign: TokenNames.BitwiseXorAssign,                   // ^=
    LogicalAndAssign: TokenNames.LogicalAndAssign,                   // &&=
    LogicalOrAssign: TokenNames.LogicalOrAssign,                     // ||=
    NullishCoalescingAssign: TokenNames.NullishCoalescingAssign,     // ??=
} as const;

/**
 * 更新运算符 Token 类型
 * 对应: ++ --
 */
export const SlimeUpdateOperatorTokenTypes = {
    Increment: TokenNames.Increment,   // ++
    Decrement: TokenNames.Decrement,   // --
} as const;

/**
 * 一元运算符 Token 类型
 * 对应: - + ! ~ typeof void delete
 */
export const SlimeUnaryOperatorTokenTypes = {
    Minus: TokenNames.Minus,           // -
    Plus: TokenNames.Plus,             // +
    LogicalNot: TokenNames.LogicalNot, // !
    BitwiseNot: TokenNames.BitwiseNot, // ~
    Typeof: TokenNames.Typeof,         // typeof
    Void: TokenNames.Void,             // void
    Delete: TokenNames.Delete,         // delete
} as const;

/**
 * 二元运算符 Token 类型
 * 对应: == != === !== < > <= >= << >> >>> + - * / % ** | ^ & in instanceof
 */
export const SlimeBinaryOperatorTokenTypes = {
    // 相等运算符
    Equal: TokenNames.Equal,                       // ==
    NotEqual: TokenNames.NotEqual,                 // !=
    StrictEqual: TokenNames.StrictEqual,           // ===
    StrictNotEqual: TokenNames.StrictNotEqual,     // !==
    // 关系运算符
    Less: TokenNames.Less,                         // <
    Greater: TokenNames.Greater,                   // >
    LessEqual: TokenNames.LessEqual,               // <=
    GreaterEqual: TokenNames.GreaterEqual,         // >=
    // 移位运算符
    LeftShift: TokenNames.LeftShift,               // <<
    RightShift: TokenNames.RightShift,             // >>
    UnsignedRightShift: TokenNames.UnsignedRightShift, // >>>
    // 算术运算符
    Plus: TokenNames.Plus,                         // +
    Minus: TokenNames.Minus,                       // -
    Asterisk: TokenNames.Asterisk,                 // *
    Slash: TokenNames.Slash,                       // /
    Modulo: TokenNames.Modulo,                     // %
    Exponentiation: TokenNames.Exponentiation,     // **
    // 位运算符
    BitwiseOr: TokenNames.BitwiseOr,               // |
    BitwiseXor: TokenNames.BitwiseXor,             // ^
    BitwiseAnd: TokenNames.BitwiseAnd,             // &
    // 关系关键字运算符
    In: TokenNames.In,                             // in
    Instanceof: TokenNames.Instanceof,             // instanceof
} as const;

/**
 * 逻辑运算符 Token 类型
 * 对应: || && ??
 */
export const SlimeLogicalOperatorTokenTypes = {
    LogicalOr: TokenNames.LogicalOr,               // ||
    LogicalAnd: TokenNames.LogicalAnd,             // &&
    NullishCoalescing: TokenNames.NullishCoalescing, // ??
} as const;

