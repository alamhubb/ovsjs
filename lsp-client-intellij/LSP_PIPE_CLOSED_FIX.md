# 🔧 LSP 管道关闭错误诊断和修复指南

## ❌ 问题描述

在 IntelliJ IDEA 中打开 OVS 文件时报错：
```
Exception in thread "DefaultDispatcher-worker-30"
java.io.IOException: 管道正在被关闭
  at org.eclipse.lsp4j.jsonrpc.json.StreamMessageConsumer.consume(...)
```

**根本原因**：LSP 服务器进程意外崩溃或无法启动，导致 stdin/stdout 管道被关闭。

---

## 🔍 诊断步骤

### 1️⃣ 检查 LSP 服务器是否在运行

```bash
# 打开 IntelliJ 日志
Help > Show Log in Explorer

# 搜索以下关键词：
# - "Looking for LSP server"
# - "Found LSP server"
# - "ovsserver"
# - "tsx"
```

**预期日志：**
```
🔍 Looking for LSP server...
✅ Found LSP server at: D:/project/qkyproject/test-volar/langServer/src/ovsserver.ts
🚀 LSP Server Command: tsx D:/project/qkyproject/test-volar/langServer/src/ovsserver.ts --stdio
```

### 2️⃣ 手动启动 LSP 服务器测试

```bash
# 打开终端，进入 langServer 目录
cd D:/project/qkyproject/test-volar/langServer

# 方案 A：使用 tsx 运行（推荐）
npx tsx src/ovsserver.ts --stdio

# 方案 B：先编译再运行（如果 tsx 不工作）
npm run build
node dist/server.js --stdio
```

**预期输出：**
```
✅ createTypeScriptServices
✅ getLocalTsdkPath
✅ Found TypeScript at: D:/project/qkyproject/test-volar/langServer/node_modules/typescript
```

如果看到错误，继续下一步。

---

## 🛠️ 修复方案

### 问题 1：TypeScript 路径硬编码（最常见）

**症状：**
```
LSP Server Initialize Error:
❌ ENOENT: no such file or directory, open 'C:\\Users\\qinky\\...\\typescript\\lib\\typescript.d.ts'
```

**原因**：`langServer/src/ovsserver.ts` 第 22-26 行硬编码了本地路径

**✅ 已修复**（新代码使用动态路径查找）：
```typescript
function getLocalTsdkPath() {
  try {
    // 从项目 node_modules 中找到 TypeScript
    const tsdkPath = path.dirname(require.resolve('typescript/package.json'));
    return path.join(tsdkPath, 'lib').replace(/\\/g, '/');
  } catch (err) {
    return '';  // 降级方案
  }
}
```

---

### 问题 2：tsx 命令不在 PATH 中

**症状：**
```
Cannot find tsx command
Error: spawn tsx ENOENT
```

**原因**：`tsx` 是 langServer 的本地依赖，不是全局命令

**解决方案：**

✅ **方案 A（推荐）：安装 tsx**
```bash
cd langServer
npm install tsx
# or
pnpm add tsx
```

✅ **方案 B：编译后运行 JavaScript**
```bash
cd langServer
npm run build

# 编译后会生成 dist/server.js，IntelliJ 会自动使用 node 运行
```

---

### 问题 3：IntelliJ 启动命令错误

**原始代码问题：**
```kotlin
GeneralCommandLine("tsx.cmd", "D:/project/.../ovsserver.ts", "--stdio")
                  ↑ 错误：tsx.cmd 是 Windows 特定的，且不一定在 PATH 中
```

**✅ 已修复**（新代码自适应）：
```kotlin
val cmd = if (serverPath.endsWith(".ts")) {
    // 运行 TypeScript
    GeneralCommandLine("tsx", serverPath, "--stdio")
} else {
    // 运行编译后的 JavaScript
    GeneralCommandLine("node", serverPath, "--stdio")
}
```

---

## 📋 快速修复清单

### ✅ 步骤 1：安装依赖

```bash
cd D:/project/qkyproject/test-volar/langServer
npm install
# or
pnpm install
```

### ✅ 步骤 2：验证 TypeScript 可以被找到

```bash
# 测试 require.resolve
node -e "console.log(require.resolve('typescript/package.json'))"

# 输出应该类似：
# D:\project\qkyproject\test-volar\langServer\node_modules\typescript\package.json
```

### ✅ 步骤 3：重新构建 IntelliJ 插件

```bash
cd D:/project/qkyproject/test-volar/lsp-client-intellij

# 生成 Lexer
./gradlew generateLexer

# 构建插件
./gradlew buildPlugin

# 运行测试 IDE
./gradlew runIde
```

### ✅ 步骤 4：打开 OVS 文件测试

1. 在测试 IDE 中打开一个 `.ovs` 文件
2. 打开日志：`Help > Show Log in Explorer`
3. 搜索 "Found LSP server" 确认服务器启动成功
4. 验证代码补全、Semantic Tokens 等功能

---

## 🔧 调试技巧

### 启用详细的 LSP 日志

**在 IntelliJ IDEA 中：**
```
Help > Diagnostic Tools > Debug Log Settings

添加以下行：
#com.intellij.platform.lsp
#com.intellij.platform.lsp.impl.LspServerImpl
#org.eclipse.lsp4j
```

### 直接测试 LSP 服务器

**使用 stdio 测试：**
```bash
cd langServer
npx tsx src/ovsserver.ts --stdio

# 然后手动发送 LSP 初始化请求
# （输入复杂的 JSON，通常不推荐）
```

**推荐：使用 VS Code 测试**
```bash
# 使用成熟的 VS Code LSP 客户端测试服务器
# 如果在 VS Code 中工作，则在 IntelliJ 中也会工作
```

---

## 📊 诊断流程图

```
开启 .ovs 文件
    ↓
IntelliJ 调用 OvsLspServerSupportProvider
    ↓
查找服务器路径 (findServerPath)
    ├─ 找到编译的 JS → node 运行
    ├─ 找到 TS 源码 → tsx 运行
    └─ 都没找到 → 抛出异常 ❌
    ↓
启动 LSP 进程
    ├─ 进程启动成功 ✅
    │   └─ 发送 initialize 请求
    │       ├─ 成功 → LSP 正常通信 ✅
    │       └─ 失败 → TypeScript 加载失败 ❌
    └─ 进程启动失败 ❌
        └─ 管道被关闭（这就是你看到的错误）
```

---

## 🚨 常见错误消息及解决方案

### 错误 1：ENOENT: no such file or directory

```
❌ ENOENT: no such file or directory, open 'C:\Users\qinky\AppData\...'
```

**解决：** 升级 `langServer/src/ovsserver.ts` 中的 TypeScript 路径查找逻辑

### 错误 2：Cannot find module 'tsx'

```
❌ Cannot find module 'tsx'
```

**解决：**
```bash
cd langServer
npm install tsx
```

### 错误 3：spawn tsx ENOENT

```
❌ Error: spawn tsx ENOENT
```

**解决（有两个方法）：**

方法 1：确保 `tsx` 在 PATH 中
```bash
npx tsx --version  # 确认可以运行

# 如果不行，在 langServer 中安装
cd langServer && npm install tsx
```

方法 2：改用编译后的 JavaScript
```bash
cd langServer
npm run build
# 然后 IntelliJ 会自动使用 node 运行 dist/server.js
```

---

## 📝 更新记录

- ✅ 修复硬编码的 TypeScript 路径（动态 require.resolve）
- ✅ 改进 IntelliJ 启动命令（自适应 .ts / .js）
- ✅ 添加详细的错误信息和调试日志
- ✅ 支持 tsx 和 node 双启动方式
- ✅ 改进错误处理和提示

---

## 🤝 如果问题仍未解决

请检查以下信息并提供：

1. **IntelliJ 日志** - 搜索 "LSP" 和 "ovsserver"
2. **langServer 手动测试输出** - 运行 `npx tsx src/ovsserver.ts --stdio` 的完整输出
3. **TypeScript 查找测试** - 运行 `node -e "console.log(require.resolve('typescript/package.json'))"`
4. **Node 和 npm 版本** - `node --version && npm --version`

---

**最后更新：2025-10-31**















