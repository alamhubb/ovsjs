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
 *
 * TokenNames 命名规则：
 * - 与规范 A.1 词法语法中的顶层规则名称一致
 * - 如 StringLiteral, NumericLiteral, IdentifierName 等
 * - 关键字使用 xxxTok 后缀以区分语法规则
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
    UnsignedRightShiftAssign: '>>>=',   // >>>=

    // 3字符运算符
    Ellipsis: '...',                    // ...
    UnsignedRightShift: '>>>',          // >>>
    StrictEqual: '===',                 // ===
    StrictNotEqual: '!==',              // !==
    LeftShiftAssign: '<<=',             // <<=
    RightShiftAssign: '>>=',            // >>=
    ExponentiationAssign: '**=',        // **=
    LogicalAndAssign: '&&=',            // &&=
    LogicalOrAssign: '||=',             // ||=
    NullishCoalescingAssign: '??=',     // ??=

    // 2字符运算符
    Arrow: '=>',                        // =>
    PlusAssign: '+=',                   // +=
    MinusAssign: '-=',                  // -=
    MultiplyAssign: '*=',               // *=
    DivideAssign: '/=',                 // /=
    ModuloAssign: '%=',                 // %=
    LeftShift: '<<',                    // <<
    RightShift: '>>',                   // >>
    LessEqual: '<=',                    // <=
    GreaterEqual: '>=',                 // >=
    Equal: '==',                        // ==
    NotEqual: '!=',                     // !=
    LogicalAnd: '&&',                   // &&
    LogicalOr: '||',                    // ||
    NullishCoalescing: '??',            // ??
    Increment: '++',                    // ++
    Decrement: '--',                    // --
    Exponentiation: '**',               // **
    BitwiseAndAssign: '&=',             // &=
    BitwiseOrAssign: '|=',              // |=
    BitwiseXorAssign: '^=',             // ^=
    OptionalChaining: '?.',             // ?.

    // 1字符运算符
    LBrace: '{',                        // {
    RBrace: '}',                        // }
    LParen: '(',                        // (
    RParen: ')',                        // )
    LBracket: '[',                      // [
    RBracket: ']',                      // ]
    Dot: '.',                           // .
    Semicolon: ';',                     // ;
    Comma: ',',                         // ,
    Less: '<',                          // <
    Greater: '>',                       // >
    Plus: '+',                          // +
    Minus: '-',                         // -
    Asterisk: '*',                      // *
    Slash: '/',                         // /
    Modulo: '%',                        // %
    BitwiseAnd: '&',                    // &
    BitwiseOr: '|',                     // |
    BitwiseXor: '^',                    // ^
    BitwiseNot: '~',                    // ~
    LogicalNot: '!',                    // !
    Question: '?',                      // ?
    Colon: ':',                         // :
    Assign: '=',                        // =

    // ============================================
    // A.1.7 Reserved Words (关键字)
    // 规范: ReservedWord :: one of await break case ...
    // 使用 xxxTok 后缀以区分语法规则
    // ============================================
    Await: 'await',
    Break: 'break',
    Case: 'case',
    Catch: 'catch',
    Class: 'class',
    Const: 'const',
    Continue: 'continue',
    Debugger: 'debugger',
    Default: 'default',
    Delete: 'delete',
    Do: 'do',
    Else: 'else',
    Enum: 'enum',
    Export: 'export',
    Extends: 'extends',
    False: 'false',
    Finally: 'finally',
    For: 'for',
    Function: 'function',
    If: 'if',
    Import: 'import',
    In: 'in',
    Instanceof: 'instanceof',
    Let: 'let',          // 注意：严格来说 let 是软关键字，但为简化实现作为独立 token
    New: 'new',
    Null: 'null',
    Return: 'return',
    Super: 'super',
    Switch: 'switch',
    This: 'this',
    Throw: 'throw',
    True: 'true',
    Try: 'try',
    Typeof: 'typeof',
    Var: 'var',
    Void: 'void',
    While: 'while',
    With: 'with',
    Yield: 'yield',
    // 注意：async, static, as, get, set, of, target, meta, from 是软关键字
    // 按照 ES2025 规范，它们在词法层是 IdentifierName，不是独立的 token
    // 在 Parser 中通过值检查来识别（见 Es2025TokenConsumer.consumeIdentifierValue）
} as const




/**
 * Slime Token 类型常量
 * 用于标识 AST 中的各种 token 节点
 */

// ============================================
// 运算符 Token 类型（独立定义）
// ============================================

/** 赋值运算符 Token 类型 */
export const SlimeAssignmentOperatorTokenTypes = {
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
} as const;

/** 更新运算符 Token 类型 */
export const SlimeUpdateOperatorTokenTypes = {
    PlusPlus: "PlusPlus",                   // ++
    MinusMinus: "MinusMinus",               // --
} as const;

/** 一元运算符 Token 类型 */
export const SlimeUnaryOperatorTokenTypes = {
    Minus: "Minus",                         // -
    Plus: "Plus",                           // +
    Not: "Not",                             // !
    BitNot: "BitNot",                       // ~
    Typeof: "Typeof",                       // typeof
    Void: "Void",                           // void
    Delete: "Delete",                       // delete
} as const;

/** 二元运算符 Token 类型 */
export const SlimeBinaryOperatorTokenTypes = {
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
} as const;

/** 逻辑运算符 Token 类型 */
export const SlimeLogicalOperatorTokenTypes = {
    And: "And",                             // &&
    Or: "Or",                               // ||
    NullishCoalescing: "NullishCoalescing", // ??
} as const;

// ============================================
// 主 Token 类型（引用上面的运算符类型）
// ============================================

export const SlimeTokenType = {
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

    // ============ 运算符（引用独立定义）============
    ...SlimeAssignmentOperatorTokenTypes,
    ...SlimeUpdateOperatorTokenTypes,
    ...SlimeUnaryOperatorTokenTypes,
    ...SlimeBinaryOperatorTokenTypes,
    ...SlimeLogicalOperatorTokenTypes,
} as const;