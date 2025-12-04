package com.alamhubb.ovs.testovs

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.colors.EditorColorsManager
import com.intellij.openapi.editor.ex.util.LexerEditorHighlighter
import com.intellij.openapi.editor.highlighter.HighlighterIterator
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.psi.PsiDocumentManager
import com.intellij.psi.PsiFile
import com.intellij.codeInsight.daemon.impl.DaemonCodeAnalyzerImpl
import com.intellij.openapi.fileTypes.SyntaxHighlighterFactory
import java.awt.Color

/**
 * 一个调试工具：显示光标下的语法/语义高亮信息
 * 
 * 支持两种高亮来源：
 * 1. Syntax Highlighting（语法高亮）- 通过 SyntaxHighlighter 实现，如关键字、字符串
 * 2. Semantic Highlighting（语义高亮）- 通过 HighlightInfo 实现，如变量、函数、类
 */
class InspectHighlightingInfoAction : AnAction("Inspect Highlighting Info") {

    override fun actionPerformed(e: AnActionEvent) {
        val project: Project = e.project ?: return
        val editor: Editor = e.getData(com.intellij.openapi.actionSystem.CommonDataKeys.EDITOR) ?: return
        val document = editor.document
        val offset = editor.caretModel.offset

        // 确保 PSI 最新
        PsiDocumentManager.getInstance(project).commitDocument(document)
        val psiFile: PsiFile = PsiDocumentManager.getInstance(project).getPsiFile(document) ?: run {
            Messages.showInfoMessage("无法获取 PSI 文件", "Inspect Highlighting Info")
            return
        }

        val messageBuilder = StringBuilder()
        var hasAnyHighlight = false

        // ========== 1. 检查语法高亮（Syntax Highlighting）==========
        val syntaxInfo = getSyntaxHighlightingInfo(editor, psiFile, offset)
        if (syntaxInfo != null) {
            messageBuilder.appendLine("📝 Syntax Highlighting (词法高亮)")
            messageBuilder.appendLine(syntaxInfo)
            hasAnyHighlight = true
        }

        // ========== 2. 检查语义高亮（Semantic Highlighting / HighlightInfo）==========
        val semanticInfo = getSemanticHighlightingInfo(document, project, offset)
        if (semanticInfo != null) {
            if (hasAnyHighlight) messageBuilder.appendLine("\n---\n")
            messageBuilder.appendLine("🧩 Semantic Highlighting (语义高亮)")
            messageBuilder.appendLine(semanticInfo)
            hasAnyHighlight = true
        }

        // 显示结果
        if (!hasAnyHighlight) {
            Messages.showInfoMessage("当前光标位置没有任何高亮信息", "Inspect Highlighting Info")
        } else {
            Messages.showInfoMessage(messageBuilder.toString(), "Highlighting Info")
        }
    }

    /**
     * 获取语法高亮信息（Syntax Highlighting）
     */
    private fun getSyntaxHighlightingInfo(editor: Editor, psiFile: PsiFile, offset: Int): String? {
        val highlighter = editor.highlighter
        if (highlighter !is LexerEditorHighlighter) return null

        val iterator: HighlighterIterator = highlighter.createIterator(offset)
        if (iterator.atEnd()) return null

        val scheme = EditorColorsManager.getInstance().globalScheme
        val tokenType = iterator.tokenType
        val textAttributesKey = highlighter.syntaxHighlighter.getTokenHighlights(tokenType).firstOrNull()
        val attributes = textAttributesKey?.let { scheme.getAttributes(it) }

        val foreground: Color? = attributes?.foregroundColor
        val background: Color? = attributes?.backgroundColor
        val fontType = when (attributes?.fontType) {
            java.awt.Font.BOLD -> "Bold"
            java.awt.Font.ITALIC -> "Italic"
            else -> "Normal"
        }

        val tokenText = editor.document.getText(
            com.intellij.openapi.util.TextRange(iterator.start, iterator.end)
        )

        return buildString {
            appendLine("Range: ${iterator.start} - ${iterator.end}")
            appendLine("Text: \"$tokenText\"")
            appendLine("TokenType: ${tokenType?.toString() ?: "N/A"}")
            appendLine("TextAttributesKey: ${textAttributesKey?.externalName ?: "N/A"}")
            appendLine("Foreground: ${colorToHex(foreground)}")
            appendLine("Background: ${colorToHex(background)}")
            appendLine("Font: $fontType")
        }
    }

    /**
     * 获取语义高亮信息（Semantic Highlighting / HighlightInfo）
     */
    private fun getSemanticHighlightingInfo(
        document: com.intellij.openapi.editor.Document,
        project: Project,
        offset: Int
    ): String? {
        val highlights = DaemonCodeAnalyzerImpl.getHighlights(document, null, project)
        val info = highlights.firstOrNull { it.startOffset <= offset && it.endOffset >= offset }
            ?: return null

        val scheme = EditorColorsManager.getInstance().globalScheme
        val attributes = info.forcedTextAttributes ?: scheme.getAttributes(info.forcedTextAttributesKey)
        val foreground: Color? = attributes?.foregroundColor
        val background: Color? = attributes?.backgroundColor
        val fontType = when (attributes?.fontType) {
            java.awt.Font.BOLD -> "Bold"
            java.awt.Font.ITALIC -> "Italic"
            else -> "Normal"
        }

        return buildString {
            appendLine("Range: ${info.startOffset} - ${info.endOffset}")
            appendLine("Description: ${info.description ?: "N/A"}")
            appendLine("Severity: ${info.severity}")
            appendLine("TextAttributesKey: ${info.forcedTextAttributesKey?.externalName ?: "N/A"}")
            appendLine("Foreground: ${colorToHex(foreground)}")
            appendLine("Background: ${colorToHex(background)}")
            appendLine("Font: $fontType")
        }
    }

    private fun colorToHex(color: Color?): String {
        return if (color == null) "N/A"
        else "#%02x%02x%02x".format(color.red, color.green, color.blue)
    }
}
