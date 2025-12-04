package com.alamhubb.ovs.testovs

import com.intellij.lexer.Lexer
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.fileTypes.SyntaxHighlighterBase
import com.intellij.psi.tree.IElementType
import com.alamhubb.ovs.testovs.lexer._Es6Lexer
import com.alamhubb.ovs.testovs.lexer.Es6TokenTypes

/**
 * ES6 语法高亮器
 * 使用 JFlex 生成的 Lexer 提供基础语法高亮
 */
class OvsSyntaxHighlighter : SyntaxHighlighterBase() {
    
    companion object {
        // 关键字
        val KEYWORD = TextAttributesKey.createTextAttributesKey(
            "ES6_KEYWORD",
            DefaultLanguageHighlighterColors.KEYWORD
        )
        
        // 字符串
        val STRING = TextAttributesKey.createTextAttributesKey(
            "ES6_STRING",
            DefaultLanguageHighlighterColors.STRING
        )
        
        // 数字
        val NUMBER = TextAttributesKey.createTextAttributesKey(
            "ES6_NUMBER",
            DefaultLanguageHighlighterColors.NUMBER
        )
        
        // 行注释
        val LINE_COMMENT = TextAttributesKey.createTextAttributesKey(
            "ES6_LINE_COMMENT",
            DefaultLanguageHighlighterColors.LINE_COMMENT
        )
        
        // 块注释
        val BLOCK_COMMENT = TextAttributesKey.createTextAttributesKey(
            "ES6_BLOCK_COMMENT",
            DefaultLanguageHighlighterColors.BLOCK_COMMENT
        )
    }
    
    override fun getHighlightingLexer(): Lexer {
        return com.intellij.lexer.FlexAdapter(_Es6Lexer(null))  // ← 使用 FlexAdapter 包装
    }

    override fun getTokenHighlights(tokenType: IElementType): Array<TextAttributesKey> {
        return when (tokenType) {
            // ========== 关键字 ==========
            Es6TokenTypes.VAR, Es6TokenTypes.LET, Es6TokenTypes.CONST,
            Es6TokenTypes.IF, Es6TokenTypes.ELSE, Es6TokenTypes.FOR, Es6TokenTypes.WHILE, Es6TokenTypes.DO,
            Es6TokenTypes.SWITCH, Es6TokenTypes.CASE, Es6TokenTypes.DEFAULT,
            Es6TokenTypes.BREAK, Es6TokenTypes.CONTINUE, Es6TokenTypes.RETURN,
            Es6TokenTypes.FUNCTION, Es6TokenTypes.CLASS, Es6TokenTypes.EXTENDS,
            Es6TokenTypes.NEW, Es6TokenTypes.THIS, Es6TokenTypes.SUPER,
            Es6TokenTypes.IMPORT, Es6TokenTypes.EXPORT, Es6TokenTypes.FROM, Es6TokenTypes.AS,
            Es6TokenTypes.TRY, Es6TokenTypes.CATCH, Es6TokenTypes.FINALLY, Es6TokenTypes.THROW,
            Es6TokenTypes.TYPEOF, Es6TokenTypes.INSTANCEOF, Es6TokenTypes.DELETE, Es6TokenTypes.VOID,
            Es6TokenTypes.IN, Es6TokenTypes.OF,
            Es6TokenTypes.STATIC, Es6TokenTypes.ASYNC, Es6TokenTypes.AWAIT, Es6TokenTypes.YIELD,
            Es6TokenTypes.WITH, Es6TokenTypes.DEBUGGER,
            Es6TokenTypes.NULL, Es6TokenTypes.TRUE, Es6TokenTypes.FALSE,
            Es6TokenTypes.GET, Es6TokenTypes.SET
            -> arrayOf(KEYWORD)
            
            // ========== 字符串 ==========
            Es6TokenTypes.STRING_LITERAL,
            Es6TokenTypes.TEMPLATE_NO_SUBSTITUTION,
            Es6TokenTypes.TEMPLATE_HEAD,
            Es6TokenTypes.TEMPLATE_MIDDLE,
            Es6TokenTypes.TEMPLATE_TAIL
            -> arrayOf(STRING)
            
            // ========== 数字 ==========
            Es6TokenTypes.NUMERIC_LITERAL
            -> arrayOf(NUMBER)
            
            // ========== 注释 ==========
            Es6TokenTypes.LINE_COMMENT
            -> arrayOf(LINE_COMMENT)
            
            Es6TokenTypes.BLOCK_COMMENT
            -> arrayOf(BLOCK_COMMENT)
            
            // ========== 其他 ==========
            else -> emptyArray()
        }
    }
}

