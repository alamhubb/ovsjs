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
    AwaitTok: 'await',
    BreakTok: 'break',
    CaseTok: 'case',
    CatchTok: 'catch',
    ClassTok: 'class',
    ConstTok: 'const',
    ContinueTok: 'continue',
    DebuggerTok: 'debugger',
    DefaultTok: 'default',
    DeleteTok: 'delete',
    DoTok: 'do',
    ElseTok: 'else',
    EnumTok: 'enum',
    ExportTok: 'export',
    ExtendsTok: 'extends',
    FalseTok: 'false',
    FinallyTok: 'finally',
    ForTok: 'for',
    FunctionTok: 'function',
    IfTok: 'if',
    ImportTok: 'import',
    InTok: 'in',
    InstanceofTok: 'instanceof',
    LetTok: 'let',          // 注意：严格来说 let 是软关键字，但为简化实现作为独立 token
    NewTok: 'new',
    NullTok: 'null',
    ReturnTok: 'return',
    SuperTok: 'super',
    SwitchTok: 'switch',
    ThisTok: 'this',
    ThrowTok: 'throw',
    TrueTok: 'true',
    TryTok: 'try',
    TypeofTok: 'typeof',
    VarTok: 'var',
    VoidTok: 'void',
    WhileTok: 'while',
    WithTok: 'with',
    YieldTok: 'yield',
    // 注意：async, static, as, get, set, of, target, meta, from 是软关键字
    // 按照 ES2025 规范，它们在词法层是 IdentifierName，不是独立的 token
    // 在 Parser 中通过值检查来识别（见 Es2025TokenConsumer.consumeIdentifierValue）
} as const


