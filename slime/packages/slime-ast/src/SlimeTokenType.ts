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

export type SlimeTokenValueType = typeof SlimeTokenType[keyof typeof SlimeTokenType];

