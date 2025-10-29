package com.alamhubb.ovs.testovs.lexer

import com.intellij.psi.tree.IElementType
import com.alamhubb.ovs.testovs.OvsLanguage

/**
 * ES6 Token Type 定义
 * 基于 ES2015 (ECMAScript 6) 标准
 */
class Es6TokenType(debugName: String) : IElementType(debugName, OvsLanguage.INSTANCE) {
    override fun toString(): String = "Es6TokenType." + super.toString()
}

object Es6TokenTypes {
    // ========== ES5 关键字 ==========
    @JvmField val VAR = Es6TokenType("VAR")
    @JvmField val BREAK = Es6TokenType("BREAK")
    @JvmField val DO = Es6TokenType("DO")
    @JvmField val INSTANCEOF = Es6TokenType("INSTANCEOF")
    @JvmField val TYPEOF = Es6TokenType("TYPEOF")
    @JvmField val CASE = Es6TokenType("CASE")
    @JvmField val ELSE = Es6TokenType("ELSE")
    @JvmField val NEW = Es6TokenType("NEW")
    @JvmField val CATCH = Es6TokenType("CATCH")
    @JvmField val FINALLY = Es6TokenType("FINALLY")
    @JvmField val RETURN = Es6TokenType("RETURN")
    @JvmField val VOID = Es6TokenType("VOID")
    @JvmField val CONTINUE = Es6TokenType("CONTINUE")
    @JvmField val FOR = Es6TokenType("FOR")
    @JvmField val SWITCH = Es6TokenType("SWITCH")
    @JvmField val WHILE = Es6TokenType("WHILE")
    @JvmField val DEBUGGER = Es6TokenType("DEBUGGER")
    @JvmField val FUNCTION = Es6TokenType("FUNCTION")
    @JvmField val THIS = Es6TokenType("THIS")
    @JvmField val WITH = Es6TokenType("WITH")
    @JvmField val DEFAULT = Es6TokenType("DEFAULT")
    @JvmField val IF = Es6TokenType("IF")
    @JvmField val THROW = Es6TokenType("THROW")
    @JvmField val DELETE = Es6TokenType("DELETE")
    @JvmField val IN = Es6TokenType("IN")
    @JvmField val TRY = Es6TokenType("TRY")
    
    // ========== ES6 新增关键字 ==========
    @JvmField val LET = Es6TokenType("LET")
    @JvmField val CONST = Es6TokenType("CONST")
    @JvmField val CLASS = Es6TokenType("CLASS")
    @JvmField val EXTENDS = Es6TokenType("EXTENDS")
    @JvmField val SUPER = Es6TokenType("SUPER")
    @JvmField val IMPORT = Es6TokenType("IMPORT")
    @JvmField val EXPORT = Es6TokenType("EXPORT")
    @JvmField val FROM = Es6TokenType("FROM")
    @JvmField val AS = Es6TokenType("AS")
    @JvmField val OF = Es6TokenType("OF")
    @JvmField val STATIC = Es6TokenType("STATIC")
    @JvmField val YIELD = Es6TokenType("YIELD")
    @JvmField val ASYNC = Es6TokenType("ASYNC")
    @JvmField val AWAIT = Es6TokenType("AWAIT")
    @JvmField val TARGET = Es6TokenType("TARGET")
    
    // ========== 字面量关键字 ==========
    @JvmField val NULL = Es6TokenType("NULL")
    @JvmField val TRUE = Es6TokenType("TRUE")
    @JvmField val FALSE = Es6TokenType("FALSE")
    
    // ========== 上下文关键字 ==========
    @JvmField val GET = Es6TokenType("GET")
    @JvmField val SET = Es6TokenType("SET")
    
    // ========== 标识符 ==========
    @JvmField val IDENTIFIER = Es6TokenType("IDENTIFIER")
    
    // ========== 字面量 ==========
    @JvmField val NUMERIC_LITERAL = Es6TokenType("NUMERIC_LITERAL")
    @JvmField val STRING_LITERAL = Es6TokenType("STRING_LITERAL")
    @JvmField val TEMPLATE_NO_SUBSTITUTION = Es6TokenType("TEMPLATE_NO_SUBSTITUTION")
    @JvmField val TEMPLATE_HEAD = Es6TokenType("TEMPLATE_HEAD")
    @JvmField val TEMPLATE_MIDDLE = Es6TokenType("TEMPLATE_MIDDLE")
    @JvmField val TEMPLATE_TAIL = Es6TokenType("TEMPLATE_TAIL")
    @JvmField val REGEX_LITERAL = Es6TokenType("REGEX_LITERAL")
    
    // ========== 运算符和符号 ==========
    // 括号
    @JvmField val LBRACE = Es6TokenType("LBRACE")         // {
    @JvmField val RBRACE = Es6TokenType("RBRACE")         // }
    @JvmField val LPAREN = Es6TokenType("LPAREN")         // (
    @JvmField val RPAREN = Es6TokenType("RPAREN")         // )
    @JvmField val LBRACKET = Es6TokenType("LBRACKET")     // [
    @JvmField val RBRACKET = Es6TokenType("RBRACKET")     // ]
    
    // 分隔符
    @JvmField val DOT = Es6TokenType("DOT")               // .
    @JvmField val ELLIPSIS = Es6TokenType("ELLIPSIS")     // ...
    @JvmField val SEMICOLON = Es6TokenType("SEMICOLON")   // ;
    @JvmField val COMMA = Es6TokenType("COMMA")           // ,
    @JvmField val COLON = Es6TokenType("COLON")           // :
    @JvmField val QUESTION = Es6TokenType("QUESTION")     // ?
    
    // 箭头
    @JvmField val ARROW = Es6TokenType("ARROW")           // =>
    
    // 算术运算符
    @JvmField val PLUS = Es6TokenType("PLUS")             // +
    @JvmField val MINUS = Es6TokenType("MINUS")           // -
    @JvmField val ASTERISK = Es6TokenType("ASTERISK")     // *
    @JvmField val SLASH = Es6TokenType("SLASH")           // /
    @JvmField val PERCENT = Es6TokenType("PERCENT")       // %
    @JvmField val PLUS_PLUS = Es6TokenType("PLUS_PLUS")   // ++
    @JvmField val MINUS_MINUS = Es6TokenType("MINUS_MINUS") // --
    
    // 赋值运算符
    @JvmField val EQ = Es6TokenType("EQ")                 // =
    @JvmField val PLUS_EQ = Es6TokenType("PLUS_EQ")       // +=
    @JvmField val MINUS_EQ = Es6TokenType("MINUS_EQ")     // -=
    @JvmField val ASTERISK_EQ = Es6TokenType("ASTERISK_EQ") // *=
    @JvmField val SLASH_EQ = Es6TokenType("SLASH_EQ")     // /=
    @JvmField val PERCENT_EQ = Es6TokenType("PERCENT_EQ") // %=
    @JvmField val AMPERSAND_EQ = Es6TokenType("AMPERSAND_EQ") // &=
    @JvmField val VERTICAL_BAR_EQ = Es6TokenType("VERTICAL_BAR_EQ") // |=
    @JvmField val CIRCUMFLEX_EQ = Es6TokenType("CIRCUMFLEX_EQ") // ^=
    @JvmField val LESS_LESS_EQ = Es6TokenType("LESS_LESS_EQ") // <<=
    @JvmField val MORE_MORE_EQ = Es6TokenType("MORE_MORE_EQ") // >>=
    @JvmField val MORE_MORE_MORE_EQ = Es6TokenType("MORE_MORE_MORE_EQ") // >>>=
    
    // 比较运算符
    @JvmField val EQ_EQ = Es6TokenType("EQ_EQ")           // ==
    @JvmField val NOT_EQ = Es6TokenType("NOT_EQ")         // !=
    @JvmField val EQ_EQ_EQ = Es6TokenType("EQ_EQ_EQ")     // ===
    @JvmField val NOT_EQ_EQ = Es6TokenType("NOT_EQ_EQ")   // !==
    @JvmField val LESS = Es6TokenType("LESS")             // <
    @JvmField val MORE = Es6TokenType("MORE")             // >
    @JvmField val LESS_EQ = Es6TokenType("LESS_EQ")       // <=
    @JvmField val MORE_EQ = Es6TokenType("MORE_EQ")       // >=
    
    // 逻辑运算符
    @JvmField val EXCLAMATION = Es6TokenType("EXCLAMATION") // !
    @JvmField val AMPERSAND_AMPERSAND = Es6TokenType("AMPERSAND_AMPERSAND") // &&
    @JvmField val VERTICAL_BAR_VERTICAL_BAR = Es6TokenType("VERTICAL_BAR_VERTICAL_BAR") // ||
    
    // 位运算符
    @JvmField val AMPERSAND = Es6TokenType("AMPERSAND")   // &
    @JvmField val VERTICAL_BAR = Es6TokenType("VERTICAL_BAR") // |
    @JvmField val CIRCUMFLEX = Es6TokenType("CIRCUMFLEX") // ^
    @JvmField val TILDE = Es6TokenType("TILDE")           // ~
    @JvmField val LESS_LESS = Es6TokenType("LESS_LESS")   // <<
    @JvmField val MORE_MORE = Es6TokenType("MORE_MORE")   // >>
    @JvmField val MORE_MORE_MORE = Es6TokenType("MORE_MORE_MORE") // >>>
    
    // ========== 注释和空白 ==========
    @JvmField val LINE_COMMENT = Es6TokenType("LINE_COMMENT")
    @JvmField val BLOCK_COMMENT = Es6TokenType("BLOCK_COMMENT")
    @JvmField val WHITE_SPACE = Es6TokenType("WHITE_SPACE")
    
    // ========== 错误处理 ==========
    @JvmField val BAD_CHARACTER = Es6TokenType("BAD_CHARACTER")
}

