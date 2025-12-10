/**
 * Java 17 Token 定义
 * 基于 ANTLR JavaLexer.g4 语法文件
 */
import {
    createEmptyValueRegToken,
    createKeywordToken,
    createValueRegToken,
    type SubhutiCreateToken,
} from 'subhuti/src/struct/SubhutiCreateToken.ts'
import { JavaTokenType } from './JavaTokenType.ts'

// ============================================
// Java 标识符正则
// Java 规范: Letter (Letter | Digit)*
// Letter: [a-zA-Z$_] | Unicode 字符
// ============================================

const JAVA_IDENTIFIER_PATTERN = /[\p{ID_Start}$_][\p{ID_Continue}$]*/u

export const JavaTokensObj = {

    // ============================================
    // 注释 (Comments)
    // ============================================

    // 多行注释 /* ... */
    COMMENT: createValueRegToken(JavaTokenType.COMMENT, /\/\*[\s\S]*?\*\//, '', true),
    // 单行注释 // ...
    LINE_COMMENT: createValueRegToken(JavaTokenType.LINE_COMMENT, /\/\/[^\r\n]*/, '', true),

    // ============================================
    // 空白符 (Whitespace)
    // ============================================

    // 空白: 空格、制表符、换行符、换页符
    WS: createValueRegToken(JavaTokenType.WS, /[ \t\r\n\u000C]+/, '', true),

    // ============================================
    // 关键字 (Keywords)
    // 按字母顺序排列，使用 createKeywordToken 确保单词边界
    // ============================================

    ABSTRACT: createKeywordToken(JavaTokenType.ABSTRACT, 'abstract'),
    ASSERT: createKeywordToken(JavaTokenType.ASSERT, 'assert'),
    BOOLEAN: createKeywordToken(JavaTokenType.BOOLEAN, 'boolean'),
    BREAK: createKeywordToken(JavaTokenType.BREAK, 'break'),
    BYTE: createKeywordToken(JavaTokenType.BYTE, 'byte'),
    CASE: createKeywordToken(JavaTokenType.CASE, 'case'),
    CATCH: createKeywordToken(JavaTokenType.CATCH, 'catch'),
    CHAR: createKeywordToken(JavaTokenType.CHAR, 'char'),
    CLASS: createKeywordToken(JavaTokenType.CLASS, 'class'),
    CONST: createKeywordToken(JavaTokenType.CONST, 'const'),
    CONTINUE: createKeywordToken(JavaTokenType.CONTINUE, 'continue'),
    DEFAULT: createKeywordToken(JavaTokenType.DEFAULT, 'default'),
    DO: createKeywordToken(JavaTokenType.DO, 'do'),
    DOUBLE: createKeywordToken(JavaTokenType.DOUBLE, 'double'),
    ELSE: createKeywordToken(JavaTokenType.ELSE, 'else'),
    ENUM: createKeywordToken(JavaTokenType.ENUM, 'enum'),
    EXPORTS: createKeywordToken(JavaTokenType.EXPORTS, 'exports'),
    EXTENDS: createKeywordToken(JavaTokenType.EXTENDS, 'extends'),
    FINAL: createKeywordToken(JavaTokenType.FINAL, 'final'),
    FINALLY: createKeywordToken(JavaTokenType.FINALLY, 'finally'),
    FLOAT: createKeywordToken(JavaTokenType.FLOAT, 'float'),
    FOR: createKeywordToken(JavaTokenType.FOR, 'for'),
    GOTO: createKeywordToken(JavaTokenType.GOTO, 'goto'),
    IF: createKeywordToken(JavaTokenType.IF, 'if'),
    IMPLEMENTS: createKeywordToken(JavaTokenType.IMPLEMENTS, 'implements'),
    IMPORT: createKeywordToken(JavaTokenType.IMPORT, 'import'),
    INSTANCEOF: createKeywordToken(JavaTokenType.INSTANCEOF, 'instanceof'),
    INT: createKeywordToken(JavaTokenType.INT, 'int'),
    INTERFACE: createKeywordToken(JavaTokenType.INTERFACE, 'interface'),
    LONG: createKeywordToken(JavaTokenType.LONG, 'long'),
    MODULE: createKeywordToken(JavaTokenType.MODULE, 'module'),
    NATIVE: createKeywordToken(JavaTokenType.NATIVE, 'native'),
    NEW: createKeywordToken(JavaTokenType.NEW, 'new'),
    // non-sealed 是带连字符的关键字
    NON_SEALED: createValueRegToken(JavaTokenType.NON_SEALED, /non-sealed/, 'non-sealed'),
    OPEN: createKeywordToken(JavaTokenType.OPEN, 'open'),
    OPENS: createKeywordToken(JavaTokenType.OPENS, 'opens'),
    PACKAGE: createKeywordToken(JavaTokenType.PACKAGE, 'package'),
    PERMITS: createKeywordToken(JavaTokenType.PERMITS, 'permits'),
    PRIVATE: createKeywordToken(JavaTokenType.PRIVATE, 'private'),
    PROTECTED: createKeywordToken(JavaTokenType.PROTECTED, 'protected'),
    PROVIDES: createKeywordToken(JavaTokenType.PROVIDES, 'provides'),
    PUBLIC: createKeywordToken(JavaTokenType.PUBLIC, 'public'),
    RECORD: createKeywordToken(JavaTokenType.RECORD, 'record'),
    REQUIRES: createKeywordToken(JavaTokenType.REQUIRES, 'requires'),
    RETURN: createKeywordToken(JavaTokenType.RETURN, 'return'),
    SEALED: createKeywordToken(JavaTokenType.SEALED, 'sealed'),
    SHORT: createKeywordToken(JavaTokenType.SHORT, 'short'),
    STATIC: createKeywordToken(JavaTokenType.STATIC, 'static'),
    STRICTFP: createKeywordToken(JavaTokenType.STRICTFP, 'strictfp'),
    SUPER: createKeywordToken(JavaTokenType.SUPER, 'super'),
    SWITCH: createKeywordToken(JavaTokenType.SWITCH, 'switch'),
    SYNCHRONIZED: createKeywordToken(JavaTokenType.SYNCHRONIZED, 'synchronized'),
    THIS: createKeywordToken(JavaTokenType.THIS, 'this'),
    THROW: createKeywordToken(JavaTokenType.THROW, 'throw'),
    THROWS: createKeywordToken(JavaTokenType.THROWS, 'throws'),
    TO: createKeywordToken(JavaTokenType.TO, 'to'),
    TRANSIENT: createKeywordToken(JavaTokenType.TRANSIENT, 'transient'),
    TRANSITIVE: createKeywordToken(JavaTokenType.TRANSITIVE, 'transitive'),
    TRY: createKeywordToken(JavaTokenType.TRY, 'try'),
    USES: createKeywordToken(JavaTokenType.USES, 'uses'),
    VAR: createKeywordToken(JavaTokenType.VAR, 'var'),
    VOID: createKeywordToken(JavaTokenType.VOID, 'void'),
    VOLATILE: createKeywordToken(JavaTokenType.VOLATILE, 'volatile'),
    WHEN: createKeywordToken(JavaTokenType.WHEN, 'when'),
    WHILE: createKeywordToken(JavaTokenType.WHILE, 'while'),
    WITH: createKeywordToken(JavaTokenType.WITH, 'with'),
    YIELD: createKeywordToken(JavaTokenType.YIELD, 'yield'),


    // ============================================
    // 字面量 (Literals)
    // ============================================

    // 文本块 (Java 15+): """ ... """
    TEXT_BLOCK: createEmptyValueRegToken(JavaTokenType.TEXT_BLOCK, /"""[ \t]*[\r\n][\s\S]*?"""/),

    // 字符串字面量: "..."
    STRING_LITERAL: createEmptyValueRegToken(JavaTokenType.STRING_LITERAL, /"(?:[^"\\\r\n]|\\[\s\S])*"/),

    // 字符字面量: '.'
    CHAR_LITERAL: createEmptyValueRegToken(JavaTokenType.CHAR_LITERAL, /'(?:[^'\\\r\n]|\\[\s\S])'/),

    // 布尔字面量
    BOOL_LITERAL_TRUE: createKeywordToken(JavaTokenType.BOOL_LITERAL, 'true'),
    BOOL_LITERAL_FALSE: createKeywordToken(JavaTokenType.BOOL_LITERAL, 'false'),

    // null 字面量
    NULL_LITERAL: createKeywordToken(JavaTokenType.NULL_LITERAL, 'null'),

    // 十六进制浮点数: 0x1.0p10
    HEX_FLOAT_LITERAL: createEmptyValueRegToken(
        JavaTokenType.HEX_FLOAT_LITERAL,
        /0[xX](?:[0-9a-fA-F]+\.?|[0-9a-fA-F]*\.[0-9a-fA-F]+)[pP][+-]?[0-9]+[fFdD]?/
    ),

    // 十六进制整数: 0x1A
    HEX_LITERAL: createEmptyValueRegToken(
        JavaTokenType.HEX_LITERAL,
        /0[xX][0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?[lL]?/
    ),

    // 二进制整数: 0b1010
    BINARY_LITERAL: createEmptyValueRegToken(
        JavaTokenType.BINARY_LITERAL,
        /0[bB][01](?:[01_]*[01])?[lL]?/
    ),

    // 八进制整数: 0777
    OCT_LITERAL: createEmptyValueRegToken(
        JavaTokenType.OCT_LITERAL,
        /0_*[0-7](?:[0-7_]*[0-7])?[lL]?/
    ),

    // 浮点数: 1.0, .5, 1e10, 1.0f
    FLOAT_LITERAL: createEmptyValueRegToken(
        JavaTokenType.FLOAT_LITERAL,
        /(?:(?:[0-9]+\.(?:[0-9]+)?|\.(?:[0-9]+))(?:[eE][+-]?[0-9]+)?[fFdD]?|[0-9]+(?:[eE][+-]?[0-9]+[fFdD]?|[fFdD]))/
    ),

    // 十进制整数: 123, 123L
    DECIMAL_LITERAL: createEmptyValueRegToken(
        JavaTokenType.DECIMAL_LITERAL,
        /(?:0|[1-9](?:[0-9_]*[0-9])?)[lL]?/
    ),

    // ============================================
    // 运算符 (Operators) - 按长度降序排列
    // ============================================

    // 4 字符
    URSHIFT_ASSIGN: createValueRegToken(JavaTokenType.URSHIFT_ASSIGN, />>>=/, '>>>='),

    // 3 字符
    LSHIFT_ASSIGN: createValueRegToken(JavaTokenType.LSHIFT_ASSIGN, /<<=/, '<<='),
    RSHIFT_ASSIGN: createValueRegToken(JavaTokenType.RSHIFT_ASSIGN, />>=/, '>>='),
    ELLIPSIS: createValueRegToken(JavaTokenType.ELLIPSIS, /\.\.\./, '...'),

    // 2 字符
    EQUAL: createValueRegToken(JavaTokenType.EQUAL, /==/, '=='),
    NOTEQUAL: createValueRegToken(JavaTokenType.NOTEQUAL, /!=/, '!='),
    LE: createValueRegToken(JavaTokenType.LE, /<=/, '<='),
    GE: createValueRegToken(JavaTokenType.GE, />=/, '>='),
    AND: createValueRegToken(JavaTokenType.AND, /&&/, '&&'),
    OR: createValueRegToken(JavaTokenType.OR, /\|\|/, '||'),
    INC: createValueRegToken(JavaTokenType.INC, /\+\+/, '++'),
    DEC: createValueRegToken(JavaTokenType.DEC, /--/, '--'),
    ADD_ASSIGN: createValueRegToken(JavaTokenType.ADD_ASSIGN, /\+=/, '+='),
    SUB_ASSIGN: createValueRegToken(JavaTokenType.SUB_ASSIGN, /-=/, '-='),
    MUL_ASSIGN: createValueRegToken(JavaTokenType.MUL_ASSIGN, /\*=/, '*='),
    DIV_ASSIGN: createValueRegToken(JavaTokenType.DIV_ASSIGN, /\/=/, '/='),
    AND_ASSIGN: createValueRegToken(JavaTokenType.AND_ASSIGN, /&=/, '&='),
    OR_ASSIGN: createValueRegToken(JavaTokenType.OR_ASSIGN, /\|=/, '|='),
    XOR_ASSIGN: createValueRegToken(JavaTokenType.XOR_ASSIGN, /\^=/, '^='),
    MOD_ASSIGN: createValueRegToken(JavaTokenType.MOD_ASSIGN, /%=/, '%='),
    ARROW: createValueRegToken(JavaTokenType.ARROW, /->/, '->'),
    COLONCOLON: createValueRegToken(JavaTokenType.COLONCOLON, /::/, '::'),

    // 1 字符
    LPAREN: createValueRegToken(JavaTokenType.LPAREN, /\(/, '('),
    RPAREN: createValueRegToken(JavaTokenType.RPAREN, /\)/, ')'),
    LBRACE: createValueRegToken(JavaTokenType.LBRACE, /\{/, '{'),
    RBRACE: createValueRegToken(JavaTokenType.RBRACE, /\}/, '}'),
    LBRACK: createValueRegToken(JavaTokenType.LBRACK, /\[/, '['),
    RBRACK: createValueRegToken(JavaTokenType.RBRACK, /\]/, ']'),
    SEMI: createValueRegToken(JavaTokenType.SEMI, /;/, ';'),
    COMMA: createValueRegToken(JavaTokenType.COMMA, /,/, ','),
    DOT: createValueRegToken(JavaTokenType.DOT, /\./, '.'),
    AT: createValueRegToken(JavaTokenType.AT, /@/, '@'),
    ASSIGN: createValueRegToken(JavaTokenType.ASSIGN, /=/, '='),
    GT: createValueRegToken(JavaTokenType.GT, />/, '>'),
    LT: createValueRegToken(JavaTokenType.LT, /</, '<'),
    BANG: createValueRegToken(JavaTokenType.BANG, /!/, '!'),
    TILDE: createValueRegToken(JavaTokenType.TILDE, /~/, '~'),
    QUESTION: createValueRegToken(JavaTokenType.QUESTION, /\?/, '?'),
    COLON: createValueRegToken(JavaTokenType.COLON, /:/, ':'),
    ADD: createValueRegToken(JavaTokenType.ADD, /\+/, '+'),
    SUB: createValueRegToken(JavaTokenType.SUB, /-/, '-'),
    MUL: createValueRegToken(JavaTokenType.MUL, /\*/, '*'),
    DIV: createValueRegToken(JavaTokenType.DIV, /\//, '/'),
    BITAND: createValueRegToken(JavaTokenType.BITAND, /&/, '&'),
    BITOR: createValueRegToken(JavaTokenType.BITOR, /\|/, '|'),
    CARET: createValueRegToken(JavaTokenType.CARET, /\^/, '^'),
    MOD: createValueRegToken(JavaTokenType.MOD, /%/, '%'),

    // ============================================
    // 标识符 (Identifier) - 必须在关键字之后
    // ============================================

    IDENTIFIER: createEmptyValueRegToken(JavaTokenType.IDENTIFIER, JAVA_IDENTIFIER_PATTERN),
}

export const javaTokens: SubhutiCreateToken[] = Object.values(JavaTokensObj)
