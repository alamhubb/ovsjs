/**
 * Java 17 Token 类型定义
 * 基于 ANTLR JavaLexer.g4 语法文件
 */

// ============================================
// 关键字 Token 类型
// ============================================

export const JavaKeywordTokenTypes = {
    ABSTRACT: 'ABSTRACT',
    ASSERT: 'ASSERT',
    BOOLEAN: 'BOOLEAN',
    BREAK: 'BREAK',
    BYTE: 'BYTE',
    CASE: 'CASE',
    CATCH: 'CATCH',
    CHAR: 'CHAR',
    CLASS: 'CLASS',
    CONST: 'CONST',
    CONTINUE: 'CONTINUE',
    DEFAULT: 'DEFAULT',
    DO: 'DO',
    DOUBLE: 'DOUBLE',
    ELSE: 'ELSE',
    ENUM: 'ENUM',
    EXPORTS: 'EXPORTS',
    EXTENDS: 'EXTENDS',
    FINAL: 'FINAL',
    FINALLY: 'FINALLY',
    FLOAT: 'FLOAT',
    FOR: 'FOR',
    GOTO: 'GOTO',
    IF: 'IF',
    IMPLEMENTS: 'IMPLEMENTS',
    IMPORT: 'IMPORT',
    INSTANCEOF: 'INSTANCEOF',
    INT: 'INT',
    INTERFACE: 'INTERFACE',
    LONG: 'LONG',
    MODULE: 'MODULE',
    NATIVE: 'NATIVE',
    NEW: 'NEW',
    NON_SEALED: 'NON_SEALED',
    OPEN: 'OPEN',
    OPENS: 'OPENS',
    PACKAGE: 'PACKAGE',
    PERMITS: 'PERMITS',
    PRIVATE: 'PRIVATE',
    PROTECTED: 'PROTECTED',
    PROVIDES: 'PROVIDES',
    PUBLIC: 'PUBLIC',
    RECORD: 'RECORD',
    REQUIRES: 'REQUIRES',
    RETURN: 'RETURN',
    SEALED: 'SEALED',
    SHORT: 'SHORT',
    STATIC: 'STATIC',
    STRICTFP: 'STRICTFP',
    SUPER: 'SUPER',
    SWITCH: 'SWITCH',
    SYNCHRONIZED: 'SYNCHRONIZED',
    THIS: 'THIS',
    THROW: 'THROW',
    THROWS: 'THROWS',
    TO: 'TO',
    TRANSIENT: 'TRANSIENT',
    TRANSITIVE: 'TRANSITIVE',
    TRY: 'TRY',
    USES: 'USES',
    VAR: 'VAR',
    VOID: 'VOID',
    VOLATILE: 'VOLATILE',
    WHEN: 'WHEN',
    WHILE: 'WHILE',
    WITH: 'WITH',
    YIELD: 'YIELD',
} as const

// ============================================
// 字面量 Token 类型
// ============================================

export const JavaLiteralTokenTypes = {
    DECIMAL_LITERAL: 'DECIMAL_LITERAL',
    HEX_LITERAL: 'HEX_LITERAL',
    OCT_LITERAL: 'OCT_LITERAL',
    BINARY_LITERAL: 'BINARY_LITERAL',
    FLOAT_LITERAL: 'FLOAT_LITERAL',
    HEX_FLOAT_LITERAL: 'HEX_FLOAT_LITERAL',
    BOOL_LITERAL: 'BOOL_LITERAL',
    CHAR_LITERAL: 'CHAR_LITERAL',
    STRING_LITERAL: 'STRING_LITERAL',
    TEXT_BLOCK: 'TEXT_BLOCK',
    NULL_LITERAL: 'NULL_LITERAL',
} as const

// ============================================
// 分隔符 Token 类型
// ============================================

export const JavaSeparatorTokenTypes = {
    LPAREN: 'LPAREN',     // (
    RPAREN: 'RPAREN',     // )
    LBRACE: 'LBRACE',     // {
    RBRACE: 'RBRACE',     // }
    LBRACK: 'LBRACK',     // [
    RBRACK: 'RBRACK',     // ]
    SEMI: 'SEMI',         // ;
    COMMA: 'COMMA',       // ,
    DOT: 'DOT',           // .
    AT: 'AT',             // @
    ELLIPSIS: 'ELLIPSIS', // ...
} as const


// ============================================
// 运算符 Token 类型
// ============================================

export const JavaOperatorTokenTypes = {
    // 赋值运算符
    ASSIGN: 'ASSIGN',             // =
    ADD_ASSIGN: 'ADD_ASSIGN',     // +=
    SUB_ASSIGN: 'SUB_ASSIGN',     // -=
    MUL_ASSIGN: 'MUL_ASSIGN',     // *=
    DIV_ASSIGN: 'DIV_ASSIGN',     // /=
    AND_ASSIGN: 'AND_ASSIGN',     // &=
    OR_ASSIGN: 'OR_ASSIGN',       // |=
    XOR_ASSIGN: 'XOR_ASSIGN',     // ^=
    MOD_ASSIGN: 'MOD_ASSIGN',     // %=
    LSHIFT_ASSIGN: 'LSHIFT_ASSIGN',   // <<=
    RSHIFT_ASSIGN: 'RSHIFT_ASSIGN',   // >>=
    URSHIFT_ASSIGN: 'URSHIFT_ASSIGN', // >>>=

    // 比较运算符
    GT: 'GT',           // >
    LT: 'LT',           // <
    EQUAL: 'EQUAL',     // ==
    LE: 'LE',           // <=
    GE: 'GE',           // >=
    NOTEQUAL: 'NOTEQUAL', // !=

    // 逻辑运算符
    BANG: 'BANG',       // !
    AND: 'AND',         // &&
    OR: 'OR',           // ||

    // 位运算符
    TILDE: 'TILDE',     // ~
    BITAND: 'BITAND',   // &
    BITOR: 'BITOR',     // |
    CARET: 'CARET',     // ^

    // 算术运算符
    ADD: 'ADD',         // +
    SUB: 'SUB',         // -
    MUL: 'MUL',         // *
    DIV: 'DIV',         // /
    MOD: 'MOD',         // %

    // 自增自减
    INC: 'INC',         // ++
    DEC: 'DEC',         // --

    // 其他运算符
    QUESTION: 'QUESTION', // ?
    COLON: 'COLON',       // :
    ARROW: 'ARROW',       // ->
    COLONCOLON: 'COLONCOLON', // ::
} as const

// ============================================
// 空白和注释 Token 类型
// ============================================

export const JavaWhitespaceTokenTypes = {
    WS: 'WS',
    COMMENT: 'COMMENT',
    LINE_COMMENT: 'LINE_COMMENT',
} as const

// ============================================
// 标识符 Token 类型
// ============================================

export const JavaIdentifierTokenTypes = {
    IDENTIFIER: 'IDENTIFIER',
} as const

// ============================================
// 合并所有 Token 类型
// ============================================

export const JavaTokenType = {
    ...JavaKeywordTokenTypes,
    ...JavaLiteralTokenTypes,
    ...JavaSeparatorTokenTypes,
    ...JavaOperatorTokenTypes,
    ...JavaWhitespaceTokenTypes,
    ...JavaIdentifierTokenTypes,
} as const

export type JavaTokenTypeValue = typeof JavaTokenType[keyof typeof JavaTokenType]
