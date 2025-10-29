package com.alamhubb.ovs.testovs

import com.intellij.extapi.psi.ASTWrapperPsiElement
import com.intellij.lang.ASTNode
import com.intellij.lang.ParserDefinition
import com.intellij.lang.ParserDefinition.SpaceRequirements
import com.intellij.lang.PsiBuilder
import com.intellij.lang.PsiParser
import com.intellij.lexer.EmptyLexer
import com.intellij.lexer.Lexer
import com.intellij.openapi.project.Project
import com.intellij.psi.FileViewProvider
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import com.intellij.psi.TokenType
import com.intellij.psi.tree.IElementType
import com.intellij.psi.tree.IFileElementType
import com.intellij.psi.tree.TokenSet

class OvsParserDefinition : ParserDefinition {
    companion object {
        val FILE: IFileElementType = IFileElementType(OvsLanguage.INSTANCE)
    }

    override fun createLexer(project: Project?): Lexer {
        return EmptyLexer()
    }

    override fun createParser(project: Project?): PsiParser {
        // 极简 parser：把所有 token 吃掉，形成一个根节点
        return PsiParser { root: IElementType?, builder: PsiBuilder? ->
            val rootMarker = builder!!.mark()
            while (!builder.eof()) {
                builder.advanceLexer()
            }
            rootMarker.done(root!!)
            builder.getTreeBuilt()
        }
    }

    override fun getFileNodeType(): IFileElementType {
        return FILE
    }

    override fun getWhitespaceTokens(): TokenSet {
        return TokenSet.create(TokenType.WHITE_SPACE)
    }

    override fun getCommentTokens(): TokenSet {
        return TokenSet.EMPTY
    }

    override fun getStringLiteralElements(): TokenSet {
        return TokenSet.EMPTY
    }

    override fun createElement(node: ASTNode): PsiElement {
        return ASTWrapperPsiElement(node)
    }

    override fun createFile(viewProvider: FileViewProvider): PsiFile {
        return OvsFile(viewProvider)
    }

    override fun spaceExistenceTypeBetweenTokens(left: ASTNode?, right: ASTNode?): SpaceRequirements {
        return SpaceRequirements.MAY
    }
}