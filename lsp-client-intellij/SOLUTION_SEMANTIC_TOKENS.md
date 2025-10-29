# ✅ Semantic Tokens 问题解决方案

## 问题根源

当在 `plugin.xml` 中注册了 `lang.parserDefinition` 时：

```xml
<lang.parserDefinition
        language="ovs"
        implementationClass="com.alamhubb.ovs.testovs.OvsParserDefinition"/>
```

IntelliJ 认为你提供了**完整的本地语言实现**，因此：
- ❌ **不会向 LSP 服务器请求** `textDocument/semanticTokens`
- ❌ 优先使用本地的 PSI（Program Structure Interface）树
- ❌ 忽略 LSP 的语义高亮功能

## ✅ 解决方案

**移除 `parserDefinition` 注册**，使用纯 LSP 模式：

```xml
<extensions defaultExtensionNs="com.intellij">
    <fileType
            name="Ovs File"
            implementationClass="com.alamhubb.ovs.testovs.OvsFileType"
            fieldName="INSTANCE"
            language="ovs"
            extensions="ovs"/>
    
    <!-- LSP 服务器支持 -->
    <platform.lsp.serverSupportProvider 
            implementation="com.alamhubb.ovs.testovs.OvsLspServerSupportProvider"/>
    
    <!-- 类型处理器 -->
    <typedHandler 
            implementation="com.alamhubb.ovs.testovs.OvsTypedHandler"/>
    
    <!-- ❌ 移除这个 - 它会阻止 LSP semantic tokens
    <lang.parserDefinition
            language="ovs"
            implementationClass="com.alamhubb.ovs.testovs.OvsParserDefinition"/>
    -->
</extensions>
```

## 为什么这样可以工作

### IntelliJ 的语言支持优先级

1. **本地 PSI（最高优先级）**
   - 如果有 `parserDefinition`，IntelliJ 使用本地解析
   - 本地语法高亮优先
   - LSP semantic tokens **被忽略**

2. **LSP 模式**
   - 没有 `parserDefinition` 时
   - IntelliJ 依赖 LSP 服务器
   - ✅ **semantic tokens 正常工作**

3. **混合模式**
   - 同时有 `parserDefinition` 和 LSP
   - IntelliJ 使用本地解析
   - LSP 只提供补全、跳转等功能
   - ❌ semantic tokens 不工作

## 最终配置文件

### plugin.xml（推荐配置）

```xml
<idea-plugin>
    <id>org.example.test-ovs-lsp</id>
    <name>Test-ovs-lsp</name>
    <vendor email="support@yourcompany.com" url="https://www.yourcompany.com">YourCompany</vendor>
    
    <description>
        OVS Language Support with LSP
    </description>
    
    <depends>com.intellij.modules.platform</depends>
    <depends>com.intellij.modules.lsp</depends>
    
    <extensions defaultExtensionNs="com.intellij">
        <!-- 文件类型 -->
        <fileType
                name="Ovs File"
                implementationClass="com.alamhubb.ovs.testovs.OvsFileType"
                fieldName="INSTANCE"
                language="ovs"
                extensions="ovs"/>
        
        <!-- LSP 支持 -->
        <platform.lsp.serverSupportProvider 
                implementation="com.alamhubb.ovs.testovs.OvsLspServerSupportProvider"/>
        
        <!-- 输入处理器 -->
        <typedHandler 
                implementation="com.alamhubb.ovs.testovs.OvsTypedHandler"/>
    </extensions>
</idea-plugin>
```

## 可以删除的文件

既然不使用本地解析，以下文件可以删除（可选）：

- ❌ `OvsParserDefinition.kt`（不再需要）
- ❌ `OvsSyntaxHighlighter.kt`（如果有）
- ❌ `OvsSyntaxHighlighterFactory.kt`（如果有）

**注意**：保留 `OvsFile.kt` 和 `OvsLanguage.kt`，它们仍然需要。

## 测试验证

重新构建并运行：

```bash
cd ovs-lsp-intellij
./gradlew clean
./gradlew buildPlugin
./gradlew runIde
```

### 预期行为

1. **打开 `.ovs` 文件**
2. **在编辑器中输入代码**
3. **客户端日志中应该看到**：
   ```
   🎨🎨🎨 LspSemanticTokensSupport INITIALIZED! 🎨🎨🎨
   🔥🔥🔥 SEMANTIC TOKEN CALLED: type=variable, modifiers=[...] 🔥🔥🔥
   🔥🔥🔥 SEMANTIC TOKEN CALLED: type=class, modifiers=[...] 🔥🔥🔥
   ```

4. **服务端日志中应该看到**：
   ```
   🔥 Semantic Tokens FULL Request Received!
     URI: file:///...
     Returning tokens count: 42
   ```

5. **编辑器中应该有彩色高亮**：
   - 类名：蓝色
   - 方法名：黄色
   - 变量：紫色
   - 类型：青色

## 为什么之前的配置不工作

### 原来的 plugin.xml

```xml
<extensions defaultExtensionNs="com.intellij">
    <fileType ... />
    <platform.lsp.serverSupportProvider ... />
    
    <!-- ❌ 这行导致了问题 -->
    <lang.parserDefinition
            language="ovs"
            implementationClass="com.alamhubb.ovs.testovs.OvsParserDefinition"/>
</extensions>
```

### IntelliJ 的行为

1. 发现有 `parserDefinition`
2. 认为这是一个"完整实现的语言"
3. **不会向 LSP 请求 semantic tokens**
4. 尝试使用本地的语法高亮（但你的 `EmptyLexer` 没有提供）
5. 结果：**没有任何语义高亮**

## 经验教训

### ✅ 纯 LSP 语言

如果你的语言**完全依赖 LSP**：
- **不要注册** `parserDefinition`
- **不要注册** `syntaxHighlighterFactory`
- 只注册：
  - `fileType`
  - `platform.lsp.serverSupportProvider`
  - 其他辅助功能（typedHandler 等）

### ⚠️ 混合模式（高级）

如果需要混合使用本地 PSI 和 LSP：
- 实现完整的 Lexer 和 Parser
- 可能需要自定义 Annotator 来整合 LSP 数据
- 更复杂，通常不推荐

### 🎯 最佳实践

对于新语言的 IntelliJ 支持：

**简单方案**（推荐）：
```
文件类型 + LSP 服务器 = 完整的 IDE 支持
```

**复杂方案**（不推荐，除非有特殊需求）：
```
文件类型 + 本地 Parser + LSP 服务器 = 难以维护
```

## 相关资源

- [IntelliJ LSP API 文档](https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html)
- [JetBrains Blog - LSP Support](https://blog.jetbrains.com/platform/2025/09/the-lsp-api-is-now-available-to-all-intellij-idea-users-and-plugin-developers/)
- [LSP Specification - Semantic Tokens](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_semanticTokens)

## 总结

🎉 **问题解决**！移除 `parserDefinition` 后，IntelliJ 将：
- ✅ 正确地向 LSP 服务器请求 semantic tokens
- ✅ 使用 `LspSemanticTokensSupport` 配置的颜色映射
- ✅ 提供完整的语义高亮功能

这是 IntelliJ LSP 实现的**设计行为**，不是 bug！


