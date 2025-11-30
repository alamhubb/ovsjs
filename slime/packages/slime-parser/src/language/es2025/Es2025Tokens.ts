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

import {SubhutiLexerTokenNames} from "subhuti/src/SubhutiLexer.ts";
import {es2025Tokens} from "./SlimeLexerTokens.ts";

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
