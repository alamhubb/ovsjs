/**
 * Slime Token 类型常量
 * 用于标识 AST 中的各种 token 节点
 */
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
    In: "In",
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
    Typeof: "Typeof",
    Void: "Void",
    Delete: "Delete",
    Instanceof: "Instanceof",
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

    // ============ 赋值运算符 ============
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

    // ============ 算术运算符 ============
    Plus: "Plus",                           // +
    Minus: "Minus",                         // -
    Star: "Star",                           // *
    Slash: "Slash",                         // /
    Percent: "Percent",                     // %
    StarStar: "StarStar",                   // **
    PlusPlus: "PlusPlus",                   // ++
    MinusMinus: "MinusMinus",               // --

    // ============ 比较运算符 ============
    EqEq: "EqEq",                           // ==
    NotEq: "NotEq",                         // !=
    EqEqEq: "EqEqEq",                       // ===
    NotEqEq: "NotEqEq",                     // !==
    Lt: "Lt",                               // <
    Gt: "Gt",                               // >
    LtEq: "LtEq",                           // <=
    GtEq: "GtEq",                           // >=

    // ============ 逻辑运算符 ============
    And: "And",                             // &&
    Or: "Or",                               // ||
    Not: "Not",                             // !
    NullishCoalescing: "NullishCoalescing", // ??

    // ============ 位运算符 ============
    BitAnd: "BitAnd",                       // &
    BitOr: "BitOr",                         // |
    BitXor: "BitXor",                       // ^
    BitNot: "BitNot",                       // ~
    LShift: "LShift",                       // <<
    RShift: "RShift",                       // >>
    URShift: "URShift",                     // >>>

    // ============ 模板字符串 ============
    TemplateHead: "TemplateHead",           // `...${
    TemplateMiddle: "TemplateMiddle",       // }...${
    TemplateTail: "TemplateTail",           // }...`
    NoSubstitutionTemplate: "NoSubstitutionTemplate", // `...`
} as const;

export type SlimeTokenTypeValue = typeof SlimeTokenType[keyof typeof SlimeTokenType];

