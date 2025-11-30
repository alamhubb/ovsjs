/**
 * ES2025 Token 名称 - 完全符合 ECMAScript® 2025 规范 A.1 词法语法
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. TokenNames 属性名和值与规范 A.1 顶层规则名称完全一致
 * 2. 值使用规范中的符号本身（如 '>>>=', 'await' 等）
 * 3. 关键字值使用小写形式（与规范 ReservedWord 一致）
 */

import {SubhutiLexerTokenNames} from "subhuti/src/SubhutiLexer.ts";

// ============================================
// Token 名称常量（与规范 A.1 词法规则名一致）
// ============================================

export const TokenNames = {
    ...SubhutiLexerTokenNames,

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

    // ============================================
    // 软关键字 (Contextual Keywords)
    // 规范中这些在词法层是 IdentifierName，在语法层通过值检查识别
    // async, static, as, get, set, of, target, meta, from
    // 不作为独立 token，见 Es2025TokenConsumer.consumeIdentifierValue()
    // ============================================
} as const


