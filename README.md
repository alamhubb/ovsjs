# Test-Volar

> 一个编译器工具链 Monorepo 项目，包含多个独立的编程语言工具和 IDE 支持

## 📦 项目列表

### 核心编译器

| 项目 | 描述 | 文档 |
|------|------|------|
| **[ovs](./ovs/)** | OVS 语言编译器 - 声明式 UI 语法（类似 Flutter/SwiftUI） | [README](./ovs/.cursor/rules/project.mdc) |
| **[slime](./slime/)** | JavaScript/TypeScript 容错解析器和代码生成器 | [README](./slime/README.md) |
| **[subhuti](./subhuti/)** | Parser 生成器框架 - 使用装饰器定义语法规则 | [README](./subhuti/README.md) |
| **[objectScript](./objectScript/)** | ObjectScript 语言实现 | - |
| **[particula](./particula/)** | 可组合的模块化解析器库 | [设计文档](./particula/HYBRID_DESIGN.md) |

### IDE 支持

| 项目 | 描述 | 文档 |
|------|------|------|
| **[langServer](./langServer/)** | OVS Language Server (LSP) - 基于 Volar 2.4.0 | [README](./langServer/README.md) |
| **[ovs-lsp-intellij](./ovs-lsp-intellij/)** | IntelliJ IDEA 插件 - OVS 语言支持 | [README](./ovs-lsp-intellij/README.md) |

### 示例应用

| 项目 | 描述 | 文档 |
|------|------|------|
| **[guidebot](./guidebot/)** | OVS 完整应用示例 - AI 驱动的开发工具 UI | [README](./guidebot/README.md) |

### 共享包 (packages/)

- **language-core** - 语言核心
- **language-server** - 语言服务器基础
- **language-service** - 语言服务
- **typescript** - TypeScript 集成
- **source-map** - Source Map 支持
- **monaco** - Monaco Editor 集成
- **kit** - 工具集
- **eslint** - ESLint 集成

---

## 🚀 快速开始

### 安装依赖

```bash
# 根目录安装（使用 pnpm workspace）
pnpm install
```

### 运行示例项目

```bash
# OVS 示例
cd guidebot
npm run dev

# 语言服务器
cd langServer
tsx src/ovsserver.ts --stdio
```

### 构建 IntelliJ 插件

```bash
cd ovs-lsp-intellij
./gradlew buildPlugin
```

---

## 🏗️ 项目架构

```
编译器层次：
┌─────────────────────────────────────────┐
│  应用层: OVS, ObjectScript, Guidebot    │
├─────────────────────────────────────────┤
│  工具链: Slime (JS/TS Parser)           │
├─────────────────────────────────────────┤
│  框架层: Subhuti (Parser Generator)     │
└─────────────────────────────────────────┘

IDE 支持：
┌─────────────────────────────────────────┐
│  IntelliJ Plugin (LSP Client)           │
├─────────────────────────────────────────┤
│  Language Server (Volar-based)          │
├─────────────────────────────────────────┤
│  OVS Compiler (Virtual Code)            │
└─────────────────────────────────────────┘
```

---

## 📚 技术栈

- **TypeScript** - 主要开发语言
- **Node.js** - 运行时环境
- **Volar** - 语言服务器框架
- **Kotlin** - IntelliJ 插件开发
- **Gradle** - 构建工具（IntelliJ 插件）
- **Vite** - 前端构建工具
- **Vue 3** - UI 框架（OVS 运行时）
- **Lerna** - Monorepo 管理

---

## 🎯 核心特性

### OVS 语言

```javascript
// 声明式 UI，无需 JSX
export class App {
  render() {
    return div({ class: 'container' }) {
      h1 { 'Hello OVS' }
      button({ onClick: () => this.handleClick() }) {
        'Click Me'
      }
    }
  }
}
```

### 智能 IDE 支持

- ✅ 语法高亮
- ✅ 代码补全
- ✅ 类型推断
- ✅ 错误诊断
- ✅ 跳转定义
- ✅ 悬停提示

### 容错解析器

Slime 支持解析包含语法错误的代码，适用于编辑器场景。

---

## 📖 文档说明

每个子项目都有独立的文档：

- **README.md** - 用户指南和快速开始
- **.cursor/rules/project.mdc** - 完整技术文档（AI 协作用）

专题文档位于对应子项目目录下（如 `SOLUTION_*.md`、`*_GUIDE.md`）。

---

## 🔧 开发

### 项目结构

```
test-volar/
├── ovs/                    # OVS 编译器
├── langServer/             # LSP 服务器
├── ovs-lsp-intellij/       # IntelliJ 插件
├── guidebot/               # 示例应用
├── slime/                  # JS/TS 解析器
├── subhuti/                # Parser 框架
├── objectScript/           # ObjectScript 实现
├── particula/              # 模块化解析器
└── packages/               # 共享包
```

### 常用命令

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build

# 运行测试
pnpm run test

# 清理构建产物
pnpm run clean
```

---

## 📄 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

请先阅读对应子项目的文档了解技术细节。

---

**Test-Volar** - _构建下一代编程语言工具链_ ✨

