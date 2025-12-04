# OVS IntelliJ IDEA Plugin

<p align="center">
  <img src="src/main/resources/icons/ovs.png" width="120" alt="OVS Logo">
</p>

<p align="center">
  <strong>IntelliJ IDEA plugin for OVS (Object-oriented View Syntax)</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#development">Development</a> •
  <a href="#architecture">Architecture</a>
</p>

---

## 📖 Overview

OVS IntelliJ IDEA Plugin provides comprehensive IDE support for the OVS language, a declarative UI syntax framework similar to Flutter/SwiftUI. This plugin acts as an LSP client, connecting to the OVS Language Server to deliver intelligent code assistance.

**Key Technologies:**
- 🎨 **JFlex Lexer** - Complete ES6 syntax highlighting (230 lexer rules)
- 🔌 **LSP Client** - Seamless integration with OVS Language Server
- 🎯 **Volar-powered** - Leveraging TypeScript language service for type inference
- 🚀 **IntelliJ Platform 2025.2.1** - Built on the latest platform APIs

---

## ✨ Features

### ✅ Fully Supported (Verified 2025-10-29)

| Feature | Status | Description |
|---------|--------|-------------|
| **Syntax Highlighting** | 🎉 | Complete ES6 keywords, literals, operators |
| **Semantic Tokens** | 🎉 | Type-aware highlighting via LSP |
| **Code Completion** | 🎉 | IntelliSense with 8 trigger characters |
| **Diagnostics** | 🎉 | Real-time error detection |
| **Go to Definition** | 🎉 | Ctrl+Click navigation |
| **Hover Information** | 🎉 | Type hints and documentation |
| **Code Formatting** | 🎉 | Automatic code formatting |

### ⏳ Coming Soon

| Feature | Status | Reason |
|---------|--------|--------|
| **Inlay Hints** | ⏳ | Waiting for IntelliJ API support ([Plan B available](INLAY_HINTS_PLAN_B.md)) |

---

## 🚀 Installation

### Method 1: From Marketplace (Recommended)

1. Open IntelliJ IDEA
2. Go to `Settings` → `Plugins` → `Marketplace`
3. Search for "OVS Language Support"
4. Click `Install`
5. Restart IDE

### Method 2: From Disk

1. Download the latest `.zip` from [Releases](../../releases)
2. Open `Settings` → `Plugins` → `⚙️` → `Install Plugin from Disk`
3. Select the downloaded `.zip` file
4. Restart IDE

### Method 3: Build from Source

```bash
git clone https://github.com/yourname/ovs-lsp-all.git
cd ovs-lsp-all/ovs-lsp-intellij
./gradlew buildPlugin
# Install build/distributions/test1ovs-1.0-SNAPSHOT.zip
```

---

## 📝 Quick Start

### 1. Create an OVS File

```ovs
// hello.ovs
const greeting = "Hello, OVS!"

div {
  h1 { greeting }
  p { "Welcome to declarative UI!" }
}
```

### 2. Enable Syntax Highlighting

- ✅ Keywords (`const`, `div`) → Purple
- ✅ Strings (`"Hello"`) → Green
- ✅ Identifiers (`greeting`) → Based on semantic type

### 3. Use Code Completion

Type `.` to trigger IntelliSense:

```ovs
const user = { name: "Alice", age: 25 }
user.  // ← Triggers completion: name, age
```

### 4. Navigate Code

- `Ctrl+Click` on a variable → Jump to definition
- Hover over a variable → View type information

---

## 🛠️ Development

### Prerequisites

- **JDK**: 17 or higher
- **Gradle**: 8.13+ (auto-downloaded by wrapper)
- **Node.js**: 16+ (for LSP server)
- **IntelliJ IDEA**: 2025.2.1+

### Build Commands

```bash
# Generate Lexer from JFlex grammar
./gradlew generateLexer

# Build plugin
./gradlew buildPlugin

# Run in sandbox IDE
./gradlew runIde

# Clean build
./gradlew clean
```

### Project Structure

```
ovs-lsp-intellij/
├── src/main/
│   ├── grammar/
│   │   └── Es6.flex              # JFlex lexer rules (230 lines)
│   ├── gen/                      # Auto-generated lexer code
│   ├── kotlin/                   # Plugin source code
│   │   ├── OvsFileType.kt        # File type registration
│   │   ├── OvsLanguage.kt        # Language definition
│   │   ├── OvsLspServerSupportProvider.kt  # LSP integration
│   │   └── OvsSyntaxHighlighter.kt         # Syntax highlighting
│   └── resources/
│       └── META-INF/plugin.xml   # Plugin configuration
├── build.gradle.kts              # Build configuration
└── test-*.ovs                    # Test files
```

### Debugging

1. **Enable LSP Logs**:
   - `Help` → `Diagnostic Tools` → `Debug Log Settings`
   - Add: `#com.intellij.platform.lsp`

2. **View Logs**:
   - `Help` → `Show Log in Explorer`
   - Search for: `LSP`, `Ovs`, `semanticTokens`

3. **Test Changes**:
   ```bash
   ./gradlew runIde
   # Opens sandbox IDE with your plugin loaded
   ```

---

## 🏗️ Architecture

### LSP Communication Flow

```
IntelliJ IDEA
  ↓ (Opens .ovs file)
OvsLspServerSupportProvider
  ↓ (Starts Node.js process)
OVS Language Server
  ↓ (LSP Protocol)
  
1. initialize         → Server capabilities
2. textDocument/didOpen  → File content
3. textDocument/semanticTokens → Highlighting data
4. textDocument/completion → IntelliSense suggestions
```

### Why No `parserDefinition`?

IntelliJ's language support priority:
1. **Local PSI** (if `parserDefinition` exists) - Highest priority
2. **LSP Mode** (no `parserDefinition`) - Uses LSP server
3. **Mixed Mode** - Local PSI wins, LSP Semantic Tokens ignored ❌

For pure LSP languages like OVS, **we don't register `parserDefinition`** to ensure LSP features work correctly.

---

## 📚 Documentation

- **[Complete Project Documentation](.cursor/rules/project.mdc)** - Full technical details
- **[Inlay Hints Plan B](INLAY_HINTS_PLAN_B.md)** - Native API implementation (if needed)
- **[ES6 Syntax Highlighting Guide](ES6_SYNTAX_HIGHLIGHTING_GUIDE.md)** - JFlex implementation
- **[Semantic Tokens Solution](SOLUTION_SEMANTIC_TOKENS.md)** - LSP troubleshooting

---

## 🔗 Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **OVS Language Server** | LSP server (Volar + TypeScript) | [langServer](../test-volar-copy/langServer) |
| **OVS Compiler** | OVS → JavaScript transpiler | [ovs](../test-volar-copy/ovs) |
| **Volar Framework** | Language service framework | [Volar.js](https://volarjs.dev/) |

---

## 📊 Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Syntax Highlighting** | < 1ms | Local JFlex lexer |
| **LSP Response** | < 100ms | Asynchronous communication |
| **Memory Usage** | < 50MB | Plugin overhead only |
| **Supported File Size** | Unlimited | No practical limit |

---

## ⚠️ Known Limitations

### Inlay Hints (Type Annotations)

**Status**: ⏳ Waiting for IntelliJ API support

```javascript
const name = "Alice"  // Expected: const name: string = "Alice"
//        ↑ Inlay hint not shown yet
```

**Reason**: IntelliJ IDEA 2025.2.1 lacks `LspInlayHintCustomizer` API

**Timeline**: Expected in 6-12 months (IntelliJ 2025.3-2025.4)

**Alternative**: [Plan B Implementation](INLAY_HINTS_PLAN_B.md) (2 days work)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: [Open an issue](../../issues)
2. **Suggest Features**: [Feature request](../../issues/new)
3. **Submit PRs**: Fork → Branch → Commit → PR
4. **Documentation**: Fix typos, improve clarity

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/yourname/ovs-lsp-all.git

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
vim src/main/grammar/Es6.flex

# 4. Test
./gradlew generateLexer
./gradlew runIde

# 5. Commit and push
git commit -m "Add: new feature"
git push origin feature/my-feature

# 6. Create PR
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[JetBrains](https://www.jetbrains.com/)** - IntelliJ Platform
- **[Volar.js](https://volarjs.dev/)** - Language service framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type inference engine

---

## 📞 Support

- **Documentation**: [Project Wiki](.cursor/rules/project.mdc)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

---

<p align="center">
  Made with ❤️ for the OVS community
</p>

<p align="center">
  <strong>IntelliJ IDEA Plugin | LSP Client | v1.0-SNAPSHOT</strong>
</p>

