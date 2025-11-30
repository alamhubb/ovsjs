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
    TemplateHead: 'TemplateHead',
    TemplateMiddle: 'TemplateMiddle',
    TemplateTail: 'TemplateTail',

    // ============================================
    // A.1.1 Unicode Format-Control Characters
    // (内部使用，不产生 token)
    // ============================================

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
    // 规范: IdentifierName :: IdentifierStart | IdentifierName IdentifierPart
    IdentifierName: 'IdentifierName',

    // --- PrivateIdentifier ---
    // 规范: PrivateIdentifier :: # IdentifierName
    PrivateIdentifier: 'PrivateIdentifier',

    // --- NumericLiteral ---
    // 规范: NumericLiteral :: DecimalLiteral | DecimalBigIntegerLiteral | NonDecimalIntegerLiteral[+Sep] | NonDecimalIntegerLiteral[+Sep] BigIntLiteralSuffix | LegacyOctalIntegerLiteral
    // 实现：所有数字变体（十进制、十六进制、二进制、八进制、BigInt、传统八进制）都映射到 NumericLiteral
    NumericLiteral: 'NumericLiteral',

    // --- StringLiteral ---
    // 规范: StringLiteral :: " DoubleStringCharacters_opt " | ' SingleStringCharacters_opt '
    // 实现：双引号和单引号字符串都映射到 StringLiteral
    StringLiteral: 'StringLiteral',

    // --- Template ---
    // 规范: Template :: NoSubstitutionTemplate | TemplateHead
    // 规范: TemplateSubstitutionTail :: TemplateMiddle | TemplateTail
    NoSubstitutionTemplate: 'NoSubstitutionTemplate',
    TemplateHead: 'TemplateHead',
    TemplateMiddle: 'TemplateMiddle',
    TemplateTail: 'TemplateTail',

    // --- RegularExpressionLiteral ---
    // 规范: RegularExpressionLiteral :: / RegularExpressionBody / RegularExpressionFlags
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
    // 规范: OptionalChainingPunctuator :: ?. [lookahead ∉ DecimalDigit]
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
    // 注意：let 在规范中不是 ReservedWord，但为简化实现作为独立 token
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
    Assign: "Assign",                       // =
    PlusAssign: "PlusAssign",               // +=
    MinusAssign: "MinusAssign",             // -=
    StarAssign: "StarAssign",               // *=
    SlashAssign: "SlashAssign",             // /=
    PercentAssign: "PercentAssign",         // %=
    StarStarAssign: "StarStarAssign",       // **=
    LShiftAssign: "LShiftAssign",           // <<=
    RShiftAssign: "RShiftAssign",           // >>=
    URShiftAssign: "URShiftAssign",         // >>>=
    BitAndAssign: "BitAndAssign",           // &=
    BitOrAssign: "BitOrAssign",             // |=
    BitXorAssign: "BitXorAssign",           // ^=
    AndAssign: "AndAssign",                 // &&=
    OrAssign: "OrAssign",                   // ||=
    NullishAssign: "NullishAssign",         // ??=

    PlusPlus: "PlusPlus",                   // ++
    MinusMinus: "MinusMinus",               // --

    Minus: "Minus",                         // -
    Plus: "Plus",                           // +
    Not: "Not",                             // !
    BitNot: "BitNot",                       // ~
    Typeof: "Typeof",                       // typeof
    Void: "Void",                           // void
    Delete: "Delete",                       // delete

    Plus: "Plus",                           // +
    Minus: "Minus",                         // -
    Star: "Star",                           // *
    Slash: "Slash",                         // /
    Percent: "Percent",                     // %
    StarStar: "StarStar",                   // **
    EqEq: "EqEq",                           // ==
    NotEq: "NotEq",                         // !=
    EqEqEq: "EqEqEq",                       // ===
    NotEqEq: "NotEqEq",                     // !==
    Lt: "Lt",                               // <
    Gt: "Gt",                               // >
    LtEq: "LtEq",                           // <=
    GtEq: "GtEq",                           // >=
    LShift: "LShift",                       // <<
    RShift: "RShift",                       // >>
    URShift: "URShift",                     // >>>
    BitAnd: "BitAnd",                       // &
    BitOr: "BitOr",                         // |
    BitXor: "BitXor",                       // ^
    In: "In",                               // in
    Instanceof: "Instanceof",               // instanceof

    And: "And",                             // &&
    Or: "Or",                               // ||
    NullishCoalescing: "NullishCoalescing", // ??

    // ============ 变量声明关键字 ============
    Var: "Var",
    Let: "Let",
    Const: "Const",

    // ============ 函数/类关键字 ============
    Function: "Function",
    Async: "Async",
    Class: "Class",
    Extends: "Extends",
    Static: "Static",
    Get: "Get",
    Set: "Set",

    // ============ 控制流关键字 ============
    If: "If",
    Else: "Else",
    Switch: "Switch",
    Case: "Case",
    Default: "Default",
    For: "For",
    While: "While",
    Do: "Do",
    Of: "Of",
    Break: "Break",
    Continue: "Continue",
    Return: "Return",
    Throw: "Throw",
    Try: "Try",
    Catch: "Catch",
    Finally: "Finally",
    With: "With",
    Debugger: "Debugger",

    // ============ 操作符关键字 ============
    New: "New",
    Yield: "Yield",
    Await: "Await",

    // ============ 模块关键字 ============
    Import: "Import",
    Export: "Export",
    From: "From",
    As: "As",

    // ============ 标点符号 ============
    LParen: "LParen",                       // (
    RParen: "RParen",                       // )
    LBrace: "LBrace",                       // {
    RBrace: "RBrace",                       // }
    LBracket: "LBracket",                   // [
    RBracket: "RBracket",                   // ]
    Semicolon: "Semicolon",                 // ;
    Comma: "Comma",                         // ,
    Dot: "Dot",                             // .
    Spread: "Spread",                       // ...
    Arrow: "Arrow",                         // =>
    Question: "Question",                   // ?
    Colon: "Colon",                         // :
    OptionalChain: "OptionalChain",         // ?.

    // ============ 模板字符串 ============
    TemplateHead: "TemplateHead",           // `...${
    TemplateMiddle: "TemplateMiddle",       // }...${
    TemplateTail: "TemplateTail",           // }...`
    NoSubstitutionTemplate: "NoSubstitutionTemplate", // `...`

    // ============================================
    // A.1.1 Unicode Format-Control Characters
    // (内部使用，不产生 token)
    // ============================================

    // ============================================
    // A.1.2 White Space
    // ============================================
    WhiteSpace: 'WhiteSpace',

    // ============================================
    // A.1.3 Line Terminators
    // ============================================
    LineTerminator: 'LineTerminator',

    // ============================================
    // A.1.4 Comments
    // ============================================
    HashbangComment: 'HashbangComment',
    MultiLineComment: 'MultiLineComment',
    SingleLineComment: 'SingleLineComment',

    // ============================================
    // A.1.5 Tokens (CommonToken)
    // ============================================

    // --- IdentifierName ---
    // 规范: IdentifierName :: IdentifierStart | IdentifierName IdentifierPart
    IdentifierName: 'IdentifierName',

    // --- PrivateIdentifier ---
    // 规范: PrivateIdentifier :: # IdentifierName
    PrivateIdentifier: 'PrivateIdentifier',

    // --- NumericLiteral ---
    // 规范: NumericLiteral :: DecimalLiteral | DecimalBigIntegerLiteral | NonDecimalIntegerLiteral | ...
    // 实现：所有数字变体（十进制、十六进制、二进制、八进制、BigInt、传统八进制）
    //       都映射到 NumericLiteral，Parser 通过 token 值区分
    NumericLiteral: 'NumericLiteral',

    // --- StringLiteral ---
    // 规范: StringLiteral :: " DoubleStringCharacters_opt " | ' SingleStringCharacters_opt '
    // 实现：双引号和单引号字符串都映射到 StringLiteral
    StringLiteral: 'StringLiteral',

    // --- Template ---
    // 规范: Template :: NoSubstitutionTemplate | TemplateHead
    // 规范: TemplateSubstitutionTail :: TemplateMiddle | TemplateTail
    NoSubstitutionTemplate: 'NoSubstitutionTemplate',
    TemplateHead: 'TemplateHead',
    TemplateMiddle: 'TemplateMiddle',
    TemplateTail: 'TemplateTail',

    // --- RegularExpressionLiteral ---
    // 规范: RegularExpressionLiteral :: / RegularExpressionBody / RegularExpressionFlags
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
    // 注意：let 在规范中不是 ReservedWord，但为简化实现作为独立 token
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
}

