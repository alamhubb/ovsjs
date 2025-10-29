package com.alamhubb.ovs.testovs

import com.intellij.codeInsight.completion.CompletionData
import com.intellij.codeInsight.completion.CompletionParameters
import com.intellij.codeInsight.completion.CompletionService
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.platform.lsp.api.LspServerDescriptor
import com.intellij.platform.lsp.api.LspServerSupportProvider
import com.intellij.platform.lsp.api.LspServerSupportProvider.LspServerStarter
import com.intellij.platform.lsp.api.customization.LspCompletionCustomizer
import com.intellij.platform.lsp.api.customization.LspCompletionSupport
import com.intellij.platform.lsp.api.customization.LspCustomization
import com.intellij.platform.lsp.api.customization.LspSemanticTokensSupport
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.platform.lsp.api.customization.LspSemanticTokensCustomizer
import com.intellij.lang.javascript.highlighting.JSHighlighter

class OvsLspServerSupportProvider : LspServerSupportProvider {
    override fun fileOpened(project: Project, file: VirtualFile, serverStarter: LspServerStarter) {
        println("=== LSP FileOpened Event ===")
        println("File: ${file.name}")
        println("Extension: ${file.extension}")
        println("Path: ${file.path}")
        
        if (file.extension == "ovs") {
            println("✅ Starting LSP server for OVS file")
            serverStarter.ensureServerStarted(FooLspServerDescriptor(project))
            println("✅ LSP server start requested")
        } else {
            println("❌ Not an OVS file, skipping")
        }
    }
}


private class FooLspServerDescriptor(project: Project) : LspServerDescriptor(project, "Ovs") {
    fun suggestPrefix(parameters: CompletionParameters): String? {
        val position = parameters.getPosition()
        val offset = parameters.getOffset()
        val range = position.getTextRange()
        assert(range.containsOffset(offset)) { position.toString() + "; " + offset + " not in " + range }
        return CompletionData.findPrefixStatic(position, offset)
    }

    // 每次输入任意字符都触发补全请求
    override val lspCustomization: LspCustomization =
        object : LspCustomization() {
            //            override val completionCustomizer: LspCompletionCustomizer = BaseLspTypeScriptServiceCompletionSupport()
            override val completionCustomizer: LspCompletionCustomizer =
                object : LspCompletionSupport() {
                    override fun isTriggerCharacterRespected(charTyped: Char): Boolean {
                        println("LSP[client]: isTriggerCharacterRespected char='$charTyped'")
                        return true
                    }

                    override fun shouldRunCodeCompletion(parameters: com.intellij.codeInsight.completion.CompletionParameters): Boolean {
//                        val vFile = parameters.originalFile.virtualFile
//                        val doc = parameters.editor.document
//                        val offset = parameters.offset
//
//                        // 仅对 .ovs 生效（可选）
//                        if (vFile?.extension != "ovs") return true
//
//                        if (offset > 0 && offset <= doc.textLength) {
//                            val ch = doc.charsSequence[offset - 1]
//                            if (ch.isDigit()) return false  // 数字则不发起补全
//                        }

                        val prefix: String = suggestPrefix(parameters)!!
                        if ("" === prefix) {
                            // 前缀非空则不发起补全
                            return false
                        }
                        val vf = parameters.originalFile.virtualFile
                        println("LSP[client]: shouldRunCodeCompletion file=${vf?.path} offset=${parameters.offset}")
//                        throw RuntimeException("test exception")
                        return true
                    }

                    override fun getCompletionPrefix(
                        parameters: com.intellij.codeInsight.completion.CompletionParameters,
                        defaultPrefix: String
                    ): String {
                        println("LSP[client]: getCompletionPrefix default='$defaultPrefix'")
                        return defaultPrefix
                    }
                }

            override val semanticTokensCustomizer: LspSemanticTokensCustomizer =
                object : LspSemanticTokensSupport() {
                    
                    init {
                        println("🎨🎨🎨 LspSemanticTokensSupport INITIALIZED! 🎨🎨🎨")
                    }

                    // ✅ 只使用服务端支持的 tokenTypes（12个）
                    override val tokenTypes = listOf(
                        "namespace",
                        "class",
                        "enum",
                        "interface",
                        "typeParameter",
                        "type",
                        "parameter",
                        "variable",
                        "property",
                        "enumMember",
                        "function",
                        "method"
                    )

                    // ✅ 只使用服务端支持的 tokenModifiers（6个）
                    override val tokenModifiers = listOf(
                        "declaration",
                        "readonly",
                        "static",
                        "async",
                        "defaultLibrary",
                        "local"
                    )

                    // 3. 映射 semantic token type 到 TextAttributesKey（直接使用 JavaScript 的颜色配置）
                    override fun getTextAttributesKey(
                        tokenType: String,
                        modifiers: List<String>
                    ): TextAttributesKey? {
                        println("🔥🔥🔥 SEMANTIC TOKEN CALLED: type=$tokenType, modifiers=$modifiers 🔥🔥🔥")
                        
                        val result = when (tokenType) {
                            // ========== 类型相关 ==========
                            "namespace" -> JSHighlighter.JS_GLOBAL_VARIABLE  // namespace 用全局变量颜色
                            "class" -> JSHighlighter.JS_GLOBAL_FUNCTION  // class 用函数颜色（通常是黄色）
                            "interface" -> JSHighlighter.JS_GLOBAL_FUNCTION
                            "enum" -> JSHighlighter.JS_GLOBAL_FUNCTION
                            "typeParameter" -> JSHighlighter.JS_PARAMETER
                            "type" -> JSHighlighter.JS_GLOBAL_FUNCTION

                            // ========== 变量相关（关键！）==========
                            "variable" -> when {
                                modifiers.contains("readonly") -> JSHighlighter.JS_GLOBAL_VARIABLE  // const
                                modifiers.contains("static") -> JSHighlighter.JS_STATIC_MEMBER_VARIABLE
                                modifiers.contains("local") -> JSHighlighter.JS_LOCAL_VARIABLE  // 局部变量
                                modifiers.contains("declaration") -> JSHighlighter.JS_GLOBAL_VARIABLE  // let/const 声明
                                else -> JSHighlighter.JS_GLOBAL_VARIABLE  // 默认全局变量（紫色）
                            }

                            // ========== 参数 ==========
                            "parameter" -> JSHighlighter.JS_PARAMETER

                            // ========== 属性 ==========
                            "property" -> when {
                                modifiers.contains("static") -> JSHighlighter.JS_STATIC_MEMBER_VARIABLE
                                else -> JSHighlighter.JS_INSTANCE_MEMBER_VARIABLE
                            }

                            // ========== 枚举成员 ==========
                            "enumMember" -> JSHighlighter.JS_GLOBAL_VARIABLE

                            // ========== 函数相关 ==========
                            "function" -> when {
                                modifiers.contains("declaration") -> JSHighlighter.JS_GLOBAL_FUNCTION
                                else -> JSHighlighter.JS_GLOBAL_FUNCTION
                            }

                            // ========== 方法 ==========
                            "method" -> when {
                                modifiers.contains("static") -> JSHighlighter.JS_STATIC_MEMBER_FUNCTION
                                else -> JSHighlighter.JS_INSTANCE_MEMBER_FUNCTION
                            }

                            else -> null
                        }
                        
                        println("   → Returning JS color: $result")
                        return result
                    }
                }
        }

    override fun isSupportedFile(file: VirtualFile) = file.extension == "ovs"
    override fun createCommandLine(): GeneralCommandLine {
        val path = System.getenv("PATH")
        println("Current PATH: $path")
        val cmd = GeneralCommandLine(
            "tsx.cmd",
            "D:/project/qkyproject/ovs-lsp-all/test-volar-copy/langServer/src/ovsserver.ts",
//            "D:/project/qkyproject/test-volar/langServer/src/ovsserver.ts",
            "--stdio"
        )
//        cmd.charset = Charsets.UTF_8
//        cmd.withEnvironment(mapOf("LANG" to "en_US.UTF-8", "LC_ALL" to "en_US.UTF-8"))
        return cmd
    }
}