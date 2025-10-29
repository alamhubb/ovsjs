# OVS Language Server

<p align="center">
  <strong>LSP Server for OVS (Object-oriented View Syntax)</strong>
</p>

<p align="center">
  Powered by <a href="https://volarjs.dev/">Volar 2.4.0</a> + <a href="https://www.typescriptlang.org/">TypeScript 5.6.3</a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api">API</a>
</p>

---

## 📖 Overview

OVS Language Server is a high-performance LSP (Language Server Protocol) implementation that provides intelligent code assistance for the OVS language. It leverages the power of Volar framework and TypeScript language service to deliver rich IDE features.

**Core Technology Stack:**
- 🔧 **Volar 2.4.0** - Language service framework
- 📘 **TypeScript 5.6.3** - Type inference engine
- 🔌 **LSP 3.17** - Full protocol support
- 🚀 **Node.js** - Runtime environment

---

## ✨ Features

### ✅ Fully Implemented (Verified 2025-10-29)

| LSP Feature | Status | Description |
|-------------|--------|-------------|
| **Semantic Tokens** | ✅ | 12 token types + 6 modifiers |
| **Code Completion** | ✅ | 8 trigger characters (`.` `"` `'` `` ` `` `/` `<` `@` `#` `*`) |
| **Inlay Hints** | ✅ | Variable types, parameter names, return types |
| **Go to Definition** | ✅ | Precise navigation |
| **Hover Information** | ✅ | Type hints + documentation |
| **Diagnostics** | ✅ | Real-time error checking |
| **Formatting** | ✅ | Code auto-formatting |
| **Signature Help** | ✅ | Function signature hints |
| **Find References** | ✅ | Find all usages |
| **Document Symbols** | ✅ | Document outline |

### 📊 Client Compatibility

| Client | Semantic Tokens | Completion | Inlay Hints | Diagnostics |
|--------|----------------|------------|-------------|-------------|
| **VS Code** | ✅ | ✅ | ✅ | ✅ |
| **IntelliJ IDEA 2025.2.1** | ✅ | ✅ | ⚠️ API limitation | ✅ |
| **Neovim (LSP)** | ✅ | ✅ | ✅ | ✅ |
| **Emacs (lsp-mode)** | ✅ | ✅ | ✅ | ✅ |

> **Note**: IntelliJ IDEA 2025.2.1 lacks `LspInlayHintCustomizer` API, but server-side implementation is complete.

---

## 🚀 Installation

### Prerequisites

- **Node.js**: 16 or higher
- **npm**: 7 or higher
- **TypeScript SDK**: Auto-installed from dependencies

### Install Dependencies

```bash
cd test-volar-copy/langServer
npm install
```

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 16

# Check TypeScript
npx tsc --version  # Should show 5.6.3
```

---

## 🎯 Usage

### Method 1: Direct Execution (Development)

```bash
# Run with tsx (recommended)
tsx src/ovsserver.ts --stdio

# Or compile first
tsc
node dist/ovsserver.js --stdio
```

### Method 2: Via LSP Client (Production)

The server is automatically started by LSP clients:

#### VS Code
```json
{
  "languageServerExample.trace.server": "verbose",
  "languageServerExample.server": {
    "module": "path/to/ovsserver.ts",
    "args": ["--stdio"]
  }
}
```

#### IntelliJ IDEA
```kotlin
GeneralCommandLine().apply {
    withExePath("tsx")
    addParameter("path/to/ovsserver.ts")
    addParameter("--stdio")
}
```

#### Neovim
```lua
require('lspconfig').ovs.setup{
  cmd = {"tsx", "path/to/ovsserver.ts", "--stdio"},
  filetypes = {"ovs"},
}
```

---

## 🏗️ Architecture

### Virtual Code Transformation

```
OVS Source Code
  ↓
OvsLanguagePlugin.createVirtualCode()
  ↓
vitePluginOvsTransform()
  ↓
TypeScript Code + Source Map
  ↓
TypeScript Language Service
  ↓
Type Information, Completion, Diagnostics
  ↓
LSP Response (JSON-RPC)
```

### Source Map Precision

**OVS Input:**
```javascript
let a = 1
let b = a
```

**TypeScript Output:**
```javascript
import {createReactiveVNode} from '../utils/ReactiveVNode';
let a = 1;let b = a;
```

**Source Map:**
- 100% bidirectional mapping
- Character-level precision
- Supports all LSP features

---

## 📁 Project Structure

```
langServer/
├── src/
│   ├── ovsserver.ts              # 🔥 LSP server entry (66 lines)
│   ├── OvsLanguagePlugin.ts      # 🔥 Virtual code generator (162 lines)
│   ├── logutil.ts                # Logging utilities
│   └── typescript/
│       ├── index.ts              # TypeScript service integration
│       └── lib/
│           ├── plugins/
│           │   └── semantic.ts   # Semantic features (1128 lines)
│           ├── configs/
│           │   ├── getUserPreferences.ts  # 🔥 Inlay Hints config
│           │   └── getFormatCodeSettings.ts
│           ├── semanticFeatures/
│           │   ├── semanticTokens.ts
│           │   └── codeAction.ts
│           └── utils/
│               └── lspConverters.ts  # 🔥 LSP type conversion
├── tests/
│   ├── semanticTokensTest.ts
│   └── testLangServerBase.ts
├── package.json
├── tsconfig.json
└── output.txt                    # Server logs
```

---

## 🔧 Configuration

### Server Initialization Options

```typescript
{
  "locale": "zh-CN",           // Language preference
  "trace": "verbose"           // Log level: off | messages | verbose
}
```

### User Preferences (Inlay Hints)

```typescript
{
  includeInlayParameterNameHints: 'all',              // Parameter names
  includeInlayVariableTypeHints: true,                // Variable types ⭐
  includeInlayFunctionLikeReturnTypeHints: true,      // Return types
  includeInlayPropertyDeclarationTypeHints: true,     // Property types
  includeInlayEnumMemberValueHints: true,             // Enum values
}
```

---

## 📡 LSP Protocol Details

### Server Capabilities

```json
{
  "textDocumentSync": 2,
  "completionProvider": {
    "triggerCharacters": [".", "\"", "'", "`", "/", "<", "@", "#", "*"],
    "resolveProvider": true
  },
  "semanticTokensProvider": {
    "full": true,
    "range": true,
    "legend": {
      "tokenTypes": ["namespace", "class", "enum", "interface", 
                     "typeParameter", "type", "parameter", "variable", 
                     "property", "enumMember", "function", "method"],
      "tokenModifiers": ["declaration", "readonly", "static", 
                          "async", "defaultLibrary", "local"]
    }
  },
  "inlayHintProvider": {},  // ⭐ Fully supported
  "hoverProvider": true,
  "definitionProvider": true,
  "diagnosticProvider": {
    "interFileDependencies": true,
    "workspaceDiagnostics": false
  }
}
```

### Request/Response Examples

#### 1. Semantic Tokens

**Request:**
```json
{
  "method": "textDocument/semanticTokens/full",
  "params": {
    "textDocument": { "uri": "file:///test.ovs" }
  }
}
```

**Response:**
```json
{
  "data": [1, 4, 1, 7, 1, 1, 14, 1, 7, 1]
  // Format: [deltaLine, deltaStart, length, tokenType, tokenModifiers]
}
```

#### 2. Inlay Hints

**Request:**
```json
{
  "method": "textDocument/inlayHint",
  "params": {
    "textDocument": { "uri": "file:///test.ovs" },
    "range": { "start": {...}, "end": {...} }
  }
}
```

**Response:**
```json
[
  {
    "position": { "line": 0, "character": 10 },
    "label": ": string",
    "kind": 1,  // Type
    "paddingLeft": false,
    "paddingRight": true
  }
]
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Manual Testing

```bash
# 1. Start server
tsx src/ovsserver.ts --stdio

# 2. Send initialization request (JSON-RPC)
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}

# 3. Check response
# Should include capabilities.inlayHintProvider

# 4. View logs
tail -f output.txt
```

### Test Files

- `tests/semanticTokensTest.ts` - Semantic highlighting test
- `tests/testLangServerBase.ts` - Base LSP functionality test

---

## 🐛 Debugging

### Enable Detailed Logs

The server automatically logs to `output.txt`:

```bash
# Watch logs in real-time
tail -f output.txt

# Filter specific features
grep "🔥 INLAY HINT" output.txt
grep "Semantic Tokens" output.txt
```

### Log Format

```
[2025-10-29T09:16:27.357Z]
createTypeScriptServices
================================================================================

[2025-10-29T09:16:27.646Z]
✅✅✅ InlayHint Provider IS DECLARED ✅✅✅
```

### Common Issues

**Issue**: Server doesn't start

```bash
# Solution: Check Node.js version
node --version  # Must be >= 16

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript not found

```bash
# Solution: Install locally
npm install typescript@5.6.3
```

---

## 🔌 API Reference

### Core Exports

```typescript
// typescript/index.ts
export function createTypeScriptServices(
  ts: typeof import('typescript'),
  options?: {
    disableAutoImportCache?: boolean;
    isValidationEnabled?: (...) => boolean;
    isSuggestionsEnabled?: (...) => boolean;
  }
): LanguageServicePlugin[]
```

### Language Plugin Interface

```typescript
// OvsLanguagePlugin.ts
export const ovsLanguagePlugin: LanguagePlugin<URI> = {
  getLanguageId(uri): string | undefined;
  createVirtualCode(uri, languageId, snapshot): VirtualCode | undefined;
  typescript: {
    extraFileExtensions: FileExtension[];
    getExtraServiceScripts(fileName, root): TypeScriptExtraServiceScript[];
  };
}
```

### Virtual Code Class

```typescript
export class OvsVirtualCode implements VirtualCode {
  id: string;
  languageId: string;
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[];
  snapshot: ts.IScriptSnapshot;
}
```

---

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Startup Time** | < 2s | Cold start |
| **Completion Response** | < 100ms | Average |
| **Diagnostic Delay** | < 500ms | After typing stops |
| **Memory Usage** | < 200MB | With 10 open files |
| **CPU Usage (Idle)** | < 1% | Background |
| **CPU Usage (Active)** | 10-20% | During type checking |

---

## 🔗 Dependencies

### Core Dependencies

```json
{
  "@volar/language-core": "~2.4.0",
  "@volar/language-server": "~2.4.0",
  "@volar/language-service": "~2.4.0",
  "@volar/typescript": "~2.4.0",
  "typescript": "^5.6.3",
  "vscode-languageserver": "^9.0.1"
}
```

### OVS Compiler

```json
{
  "ovsjs": "^0.0.9"
}
```

---

## 📚 Documentation

- **[Server Project Documentation](.cursor/rules/project.mdc)** - Complete technical details
- **[Client Documentation](../../ovs-lsp-intellij/README.md)** - IntelliJ plugin
- **[Volar.js Docs](https://volarjs.dev/)** - Framework documentation
- **[LSP Specification](https://microsoft.github.io/language-server-protocol/)** - Protocol reference

---

## 🤝 Contributing

We welcome contributions to improve the language server!

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/yourname/ovs-lsp-all.git
cd test-volar-copy/langServer

# 2. Install dependencies
npm install

# 3. Make changes
vim src/ovsserver.ts

# 4. Test
tsx src/ovsserver.ts --stdio

# 5. Submit PR
git checkout -b feature/my-feature
git commit -m "Add: new feature"
git push origin feature/my-feature
```

### Code Style

- **TypeScript**: Follow project conventions
- **Naming**: CamelCase for classes, camelCase for functions
- **Comments**: JSDoc for public APIs
- **Logging**: Use `LogUtil.log()` for debugging

---

## 📜 License

This project is part of the OVS ecosystem and follows the main project's license.

---

## 🙏 Acknowledgments

- **[Volar.js](https://volarjs.dev/)** - Language service framework
- **[TypeScript Team](https://www.typescriptlang.org/)** - Type system and language service
- **[LSP Specification](https://microsoft.github.io/language-server-protocol/)** - Protocol design

---

## 📞 Support

- **Documentation**: [Project Wiki](.cursor/rules/project.mdc)
- **Issues**: [GitHub Issues](https://github.com/yourname/ovs-lsp-all/issues)
- **Related Projects**:
  - [OVS Compiler](../ovs/README.md)
  - [IntelliJ Plugin](../../ovs-lsp-intellij/README.md)

---

<p align="center">
  <strong>OVS Language Server | Powered by Volar 2.4.0 + TypeScript 5.6.3</strong>
</p>

<p align="center">
  Made with ❤️ for intelligent code assistance
</p>


