# 方案B：IntelliJ 原生 Inlay Hints 实现方案

## 📋 文档说明

**状态**：📝 规划文档（未实施）  
**原因**：当前采用方案A（等待 IntelliJ LSP API 官方支持）  
**用途**：保留完整实现方案，供未来参考  
**日期**：2025-10-29

---

## 🎯 背景

### 测试结论（2025-10-29）

经过完整测试，我们发现：

| 检查项 | 状态 | 说明 |
|--------|------|------|
| **LSP 协议支持** | ✅ | LSP 3.17+ 包含 `textDocument/inlayHint` |
| **服务端支持** | ✅ | Volar + TypeScript 完整支持 InlayHint |
| **服务端声明能力** | ✅ | `"inlayHintProvider": {}` 已声明 |
| **客户端接收能力** | ✅ | IntelliJ 收到了 capabilities |
| **客户端发送请求** | ❌ | **IntelliJ 不发送** `inlayHint` 请求 |
| **IntelliJ API 支持** | ❌ | **无** `LspInlayHintCustomizer` 接口 |

### 已验证的功能

✅ **正常工作的 LSP 功能：**
- Semantic Tokens（语义高亮）
- Code Completion（代码补全）
- Diagnostics（错误诊断）
- Go to Definition（跳转定义）

❌ **不工作的 LSP 功能：**
- Inlay Hints（内联类型提示）

---

## 🛠️ 方案B：原生 API 实现

### 核心思路

**不依赖 LSP 客户端**，直接使用 IntelliJ 原生的 `InlayHintsProvider` API：

```
IntelliJ Editor
  ↓ 请求 Inlay Hints
OvsInlayHintsProvider（原生 API）
  ↓ 调用 LSP 服务器
Language Server
  ↓ 返回类型信息
OvsInlayHintsProvider
  ↓ 转换为 IntelliJ Inlay Hints
Editor 显示
```

**优势：**
- 绕过 IntelliJ LSP API 的限制
- 复用现有的 LSP 服务器（TypeScript 类型推断）
- 功能立即可用

**劣势：**
- 需要额外代码（约 300 行）
- 需要手动管理 LSP 通信
- 维护成本较高

---

## 📐 架构设计

### 1. 新增文件

```
ovs-lsp-intellij/src/main/kotlin/com/alamhubb/ovs/testovs/
├── inlayHints/
│   ├── OvsInlayHintsProvider.kt        # 核心实现（150 行）
│   ├── OvsInlayHintsCollector.kt       # 数据收集器（100 行）
│   └── LspInlayHintsBridge.kt          # LSP 桥接（50 行）
```

### 2. 修改文件

```
ovs-lsp-intellij/src/main/resources/META-INF/plugin.xml
```

添加扩展点注册：
```xml
<codeInsight.inlayProvider
    language="ovs"
    implementationClass="com.alamhubb.ovs.testovs.inlayHints.OvsInlayHintsProvider"/>
```

---

## 💻 详细实现

### Step 1: OvsInlayHintsProvider.kt

```kotlin
package com.alamhubb.ovs.testovs.inlayHints

import com.intellij.codeInsight.hints.*
import com.intellij.openapi.editor.Editor
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import javax.swing.JPanel

/**
 * OVS Inlay Hints 提供者（原生 API）
 * 
 * 绕过 IntelliJ LSP API 的限制，直接调用 LSP 服务器获取类型信息
 */
class OvsInlayHintsProvider : InlayHintsProvider<OvsInlayHintsProvider.Settings> {
    
    // 设置 Key
    override val key = SettingsKey<Settings>("ovs.inlayHints")
    
    // 显示名称
    override val name = "OVS Type Hints"
    
    // 预览文本
    override val previewText = """
        const name = "Alice"
        let age = 25
        const isActive = true
    """.trimIndent()
    
    // 创建设置对象
    override fun createSettings() = Settings()
    
    // 创建配置面板
    override fun createConfigurable(settings: Settings): ImmediateConfigurable {
        return object : ImmediateConfigurable {
            override fun createComponent(listener: ChangeListener) = JPanel()
            override val mainCheckboxText = "Show type hints for:"
            override val cases = listOf(
                Case("Variables", "ovs.hints.variables", settings::showVariableTypes),
                Case("Parameters", "ovs.hints.parameters", settings::showParameterTypes),
                Case("Return types", "ovs.hints.returnTypes", settings::showReturnTypes)
            )
        }
    }
    
    // 创建收集器
    override fun getCollectorFor(
        file: PsiFile,
        editor: Editor,
        settings: Settings,
        sink: InlayHintsSink
    ): InlayHintsCollector? {
        // 仅对 .ovs 文件生效
        if (file.fileType.name != "Ovs File") return null
        
        return OvsInlayHintsCollector(editor, settings, sink)
    }
    
    // 设置类
    data class Settings(
        var showVariableTypes: Boolean = true,
        var showParameterTypes: Boolean = true,
        var showReturnTypes: Boolean = true
    )
}
```

### Step 2: OvsInlayHintsCollector.kt

```kotlin
package com.alamhubb.ovs.testovs.inlayHints

import com.intellij.codeInsight.hints.FactoryInlayHintsCollector
import com.intellij.codeInsight.hints.InlayHintsSink
import com.intellij.codeInsight.hints.presentation.InlayPresentation
import com.intellij.openapi.editor.Editor
import com.intellij.psi.PsiElement
import com.intellij.psi.util.elementType

/**
 * Inlay Hints 收集器
 * 
 * 遍历 PSI 树，调用 LSP 服务器获取类型信息
 */
class OvsInlayHintsCollector(
    editor: Editor,
    private val settings: OvsInlayHintsProvider.Settings,
    private val hintsSink: InlayHintsSink
) : FactoryInlayHintsCollector(editor) {
    
    private val bridge = LspInlayHintsBridge.getInstance(editor.project!!)
    
    override fun collect(
        element: PsiElement,
        editor: Editor,
        sink: InlayHintsSink
    ): Boolean {
        // 获取文档 URI
        val document = editor.document
        val file = element.containingFile.virtualFile ?: return true
        val uri = file.url
        
        // 获取可见范围
        val visibleArea = editor.scrollingModel.visibleArea
        val startOffset = editor.logicalPositionToOffset(
            editor.xyToLogicalPosition(visibleArea.location)
        )
        val endOffset = editor.logicalPositionToOffset(
            editor.xyToLogicalPosition(
                java.awt.Point(visibleArea.x + visibleArea.width, 
                              visibleArea.y + visibleArea.height)
            )
        )
        
        // 调用 LSP 服务器
        val hints = bridge.requestInlayHints(uri, startOffset, endOffset)
        
        // 转换并显示
        hints.forEach { hint ->
            val offset = hint.position
            val text = hint.label
            val presentation = createTypeHintPresentation(text)
            
            sink.addInlineElement(
                offset,
                relatesToPrecedingText = false,
                presentation = presentation,
                placeAtTheEndOfLine = false
            )
        }
        
        return true
    }
    
    private fun createTypeHintPresentation(text: String): InlayPresentation {
        return factory.smallText(text)
    }
}
```

### Step 3: LspInlayHintsBridge.kt

```kotlin
package com.alamhubb.ovs.testovs.inlayHints

import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import org.eclipse.lsp4j.*
import org.eclipse.lsp4j.jsonrpc.Launcher
import java.io.InputStream
import java.io.OutputStream
import java.util.concurrent.CompletableFuture

/**
 * LSP Inlay Hints 桥接器
 * 
 * 直接调用 LSP 服务器的 textDocument/inlayHint 方法
 */
@Service(Service.Level.PROJECT)
class LspInlayHintsBridge(private val project: Project) {
    
    private var languageServer: LanguageServer? = null
    
    companion object {
        fun getInstance(project: Project): LspInlayHintsBridge {
            return project.service()
        }
    }
    
    /**
     * 请求 Inlay Hints
     */
    fun requestInlayHints(
        uri: String,
        startOffset: Int,
        endOffset: Int
    ): List<InlayHintData> {
        val server = getOrStartServer() ?: return emptyList()
        
        try {
            // 构造请求参数
            val params = InlayHintParams().apply {
                textDocument = TextDocumentIdentifier(uri)
                range = Range(
                    Position(0, startOffset),
                    Position(0, endOffset)
                )
            }
            
            // 发送请求
            val future: CompletableFuture<List<InlayHint>> = 
                server.textDocumentService.inlayHint(params)
            
            // 等待响应（超时 1 秒）
            val hints = future.get(1, java.util.concurrent.TimeUnit.SECONDS)
            
            // 转换为内部格式
            return hints.map { hint ->
                InlayHintData(
                    position = hint.position.character,
                    label = hint.label.left ?: hint.label.right.toString(),
                    kind = hint.kind
                )
            }
        } catch (e: Exception) {
            println("LSP Inlay Hint request failed: ${e.message}")
            return emptyList()
        }
    }
    
    /**
     * 获取或启动 LSP 服务器
     */
    private fun getOrStartServer(): LanguageServer? {
        if (languageServer != null) return languageServer
        
        try {
            // 启动 Node.js 进程
            val processBuilder = ProcessBuilder(
                "node",
                findServerPath(),
                "--stdio"
            )
            val process = processBuilder.start()
            
            // 创建 LSP 连接
            val launcher = Launcher.createLauncher(
                this,
                LanguageServer::class.java,
                process.inputStream,
                process.outputStream
            )
            
            languageServer = launcher.remoteProxy
            
            // 初始化
            val initParams = InitializeParams().apply {
                processId = ProcessHandle.current().pid().toInt()
                rootUri = project.basePath
                capabilities = ClientCapabilities()
            }
            
            languageServer?.initialize(initParams)?.get()
            
            return languageServer
        } catch (e: Exception) {
            println("Failed to start LSP server: ${e.message}")
            return null
        }
    }
    
    private fun findServerPath(): String {
        // 与 OvsLspServerSupportProvider 相同的逻辑
        val possiblePaths = listOf(
            "D:/project/qkyproject/ovs-lsp-all/test-volar-copy/langServer/src/ovsserver.ts"
        )
        return possiblePaths.first()
    }
    
    data class InlayHintData(
        val position: Int,
        val label: String,
        val kind: InlayHintKind?
    )
}
```

### Step 4: plugin.xml 注册

```xml
<extensions defaultExtensionNs="com.intellij">
    <!-- 现有的扩展点... -->
    
    <!-- ✅ 新增：Inlay Hints 提供者 -->
    <codeInsight.inlayProvider
        language="ovs"
        implementationClass="com.alamhubb.ovs.testovs.inlayHints.OvsInlayHintsProvider"/>
</extensions>
```

---

## 🧪 测试步骤

### 1. 实现代码后测试

```bash
# 1. 构建插件
./gradlew buildPlugin

# 2. 运行测试 IDE
./gradlew runIde

# 3. 打开测试文件
# test-inlay-hints.ovs
```

### 2. 验证功能

**测试代码：**
```javascript
const name = "Alice"
let age = 25
const isActive = true

function greet(userName) {
  return "Hello " + userName
}
```

**预期显示：**
```javascript
const name: string = "Alice"
//        ↑ 灰色的类型提示

let age: number = 25
//     ↑

function greet(userName: any): string
//                      ↑         ↑
```

### 3. 性能测试

- 打开大文件（1000+ 行）
- 观察响应时间（应 < 500ms）
- 检查内存占用（应 < 20MB）

---

## ⚠️ 已知限制

### 1. 维护成本高

- 需要手动同步 LSP 协议更新
- 需要处理服务器崩溃/重启
- 需要管理进程生命周期

### 2. 可能的冲突

- 与 IntelliJ 内置的 TypeScript 插件可能冲突
- 需要确保 LSP 服务器只启动一次

### 3. 性能考虑

- 每次滚动都会触发 LSP 请求
- 需要实现缓存机制
- 需要防抖处理

---

## 📝 实现工作量估算

| 任务 | 工作量 | 说明 |
|------|--------|------|
| **核心实现** | 4-6 小时 | 3 个 Kotlin 文件 |
| **测试验证** | 2-3 小时 | 功能测试 + 性能测试 |
| **优化缓存** | 2-3 小时 | 防抖 + 缓存机制 |
| **文档编写** | 1-2 小时 | 代码注释 + 用户文档 |
| **总计** | **9-14 小时** | 约 2 个工作日 |

---

## 🎯 决策建议

### 当前建议：方案A（等待官方支持）

**理由：**
1. ✅ IntelliJ LSP API 还在快速发展
2. ✅ JetBrains 可能在 6-12 个月内添加 `LspInlayHintCustomizer`
3. ✅ 零开发成本，零维护成本
4. ✅ 现有的语法高亮 + Semantic Tokens 已经足够日常使用

### 何时考虑方案B？

**触发条件：**
- IntelliJ 1 年内未添加 `LspInlayHintCustomizer` 支持
- 团队强烈需要 Inlay Hints 功能
- 有充足的开发时间（2 个工作日）

---

## 📚 参考资料

### IntelliJ Platform API
- **Inlay Hints Provider**: https://plugins.jetbrains.com/docs/intellij/inlay-hints.html
- **PSI 树遍历**: https://plugins.jetbrains.com/docs/intellij/psi.html
- **LSP4J 文档**: https://github.com/eclipse-lsp4j/lsp4j

### LSP 协议
- **Inlay Hint 规范**: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_inlayHint
- **LSP 3.17**: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/

### 相关 Issue
- **IntelliJ LSP API Feature Request**: (待创建)
- **JetBrains YouTrack**: https://youtrack.jetbrains.com/

---

## 📞 联系方式

如果决定实施方案B，可以参考：
- 本文档的详细实现代码
- IntelliJ Platform SDK 文档
- LSP4J 示例项目

---

**文档状态**：📝 规划（未实施）  
**当前方案**：方案A（等待官方支持）  
**文档版本**：1.0  
**最后更新**：2025-10-29

