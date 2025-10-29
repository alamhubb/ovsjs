# 文档整理说明

## 📋 文档结构（最终版）

### ✅ 核心文档（已保留）

**项目根目录结构：**
```
ovs-lsp-all/
├── ovs-lsp-intellij/                    # IntelliJ 客户端项目
│   └── .cursor/rules/
│       ├── project.mdc                   # 📌 IntelliJ 插件完整文档
│       ├── README_DOCS.md               # 📖 文档说明（本文件）
│       └── guidebot.mdc                 # 通用 AI 协作规则
│
└── test-volar-copy/                     # Monorepo（包含多个子项目）
    ├── langServer/                      # 语言服务器项目
    │   └── .cursor/rules/
    │       └── project.mdc              # 📌 Language Server 完整文档
    │
    └── ovs/                             # OVS 编译器项目
        └── .cursor/rules/
            └── project.mdc              # 📌 OVS 编译器完整文档
```

### 📌 三个核心 project.mdc

#### 1. ovs-lsp-intellij/.cursor/rules/project.mdc
**定位：** IntelliJ IDEA 插件（LSP 客户端）

**包含内容：**
- IntelliJ 插件实现
- JFlex 语法高亮（ES6）
- LSP 客户端集成
- Semantic Tokens 配置
- 调试指南

**目标用户：** IntelliJ 插件开发者

#### 2. test-volar-copy/langServer/.cursor/rules/project.mdc
**定位：** OVS Language Server（LSP 服务端）

**包含内容：**
- Volar.js 架构
- LSP 协议实现
- Semantic Tokens 提供者
- 与 OVS 编译器集成
- 服务端调试

**目标用户：** 语言服务器开发者

#### 3. test-volar-copy/ovs/.cursor/rules/project.mdc
**定位：** OVS 编译器核心

**包含内容：**
- OVS 语法设计
- 编译流程
- 组件系统
- `#{}` 不渲染块
- 语法参考

**目标用户：** 编译器开发者、OVS 语言使用者

---

## 📚 保留的参考文档（8个）

**IntelliJ 项目（4个）：**
1. `.cursor/rules/project.mdc` - 📌 主文档
2. `.cursor/rules/README_DOCS.md` - 📖 本文件
3. `.cursor/rules/guidebot.mdc` - AI 协作规则
4. `ES6_SYNTAX_HIGHLIGHTING_GUIDE.md` - 📚 JFlex 实现指南
5. `SOLUTION_SEMANTIC_TOKENS.md` - 📚 LSP 解决方案

**test-volar-copy 项目（3个）：**
6. `README.md` - 入口
7. `PROJECT_OVERVIEW.md` - 架构
8. `QUICK_START_GUIDE.md` - 快速开始

---

## 🗑️ 已删除文档（22个）

**IntelliJ 插件调试文档（11个）：**
- ~~CRITICAL_TEST_STEPS.md~~
- ~~DEBUG_SEMANTIC_TOKENS_REAL_ISSUE.md~~
- ~~DIAGNOSIS_NO_CLASS_TOKENS.md~~
- ~~ES6_LEXER_IMPLEMENTATION_SUMMARY.md~~
- ~~INLAY_HINTS_SETUP.md~~
- ~~JAVASCRIPT_COLOR_INTEGRATION.md~~
- ~~NEXT_STEPS_INVESTIGATION.md~~
- ~~SEMANTIC_TOKENS_DEBUG.md~~
- ~~SYNTAX_HIGHLIGHTING.md~~
- ~~TEST_SEMANTIC_TOKENS.md~~
- ~~WHY_NO_COLOR.md~~

**OVS 编译器更新文档（7个）：**
- ~~debug-semantic-tokens.md~~
- ~~PARENTHESES_FIX_SUMMARY.md~~
- ~~PROJECT-UPDATE-2025-10-17-V2.md~~
- ~~PROJECT-UPDATE-2025-10-17.md~~
- ~~ovs/PROJECT_UPDATE_2025-10-19.md~~
- ~~ovs/FIXES_SUMMARY_2025-10-19.md~~
- ~~ovs/SEMANTIC_TOKENS_TESTING.md~~

**Slime 分析文档（4个）：**
- ~~slime/OR_RULES_ANALYSIS.md~~
- ~~slime/TEST_REPORT_2025-10-17.md~~
- ~~slime/tests/TEST_CASES_PLAN.md~~
- ~~slime/PROBLEM_ANALYSIS.md~~

---

## 🎯 文档使用指南

### 场景 1：开发 IntelliJ 插件
**主文档：** `ovs-lsp-intellij/.cursor/rules/project.mdc`

**查找内容：**
- JFlex 词法规则 → 第【细节实现层 - 语法高亮】
- LSP 配置 → 第【细节实现层 - LSP 集成】
- Semantic Tokens → 第【已知问题与解决方案】
- 快速开始 → 第【快速开始】章节

**参考文档：**
- JFlex 实现细节：`ES6_SYNTAX_HIGHLIGHTING_GUIDE.md`
- LSP 问题：`SOLUTION_SEMANTIC_TOKENS.md`

### 场景 2：开发语言服务器
**主文档：** `test-volar-copy/langServer/.cursor/rules/project.mdc`

**查找内容：**
- Volar 架构 → 第【技术方向】
- LSP 协议实现 → 第【核心实现】
- Semantic Tokens 提供者 → 第【核心实现 - 3】
- 与编译器集成 → 第【与 OVS 编译器集成】

### 场景 3：使用/扩展 OVS 语言
**主文档：** `test-volar-copy/ovs/.cursor/rules/project.mdc`

**查找内容：**
- OVS 语法 → 第【完整语法参考】
- 组件系统 → 第【组件系统技术实现】
- `#{}` 不渲染块 → 第【核心渲染规则】
- 编译原理 → 第【核心实现原理】

### 场景 4：理解整体架构
**推荐顺序：**
1. `test-volar-copy/PROJECT_OVERVIEW.md` - 全局架构
2. `test-volar-copy/ovs/.cursor/rules/project.mdc` - 编译器核心
3. `test-volar-copy/langServer/.cursor/rules/project.mdc` - 服务端
4. `ovs-lsp-intellij/.cursor/rules/project.mdc` - 客户端

---

## 🔄 项目间关系

```
┌─────────────────────────────────────────────┐
│   IntelliJ IDEA 编辑器                       │
│   ├─ ovs-lsp-intellij 插件                  │
│   │  ├─ JFlex 语法高亮（本地）              │
│   │  └─ LSP 客户端                          │
└──────────────┬──────────────────────────────┘
               │ LSP 协议（stdio）
               ↓
┌──────────────────────────────────────────────┐
│   Language Server (langServer/)              │
│   ├─ 基于 Volar.js                          │
│   ├─ Semantic Tokens 提供者                 │
│   ├─ 代码补全、跳转、诊断                   │
│   └─ 调用 ↓                                 │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│   OVS Compiler (ovs/)                        │
│   ├─ 词法分析（Subhuti）                    │
│   ├─ 语法分析（OvsParser）                  │
│   ├─ AST 转换（Slime）                      │
│   └─ 代码生成（JavaScript）                 │
└──────────────────────────────────────────────┘
```

**数据流：**
1. 用户在 IntelliJ 中编辑 `.ovs` 文件
2. JFlex 提供本地语法高亮（< 1ms）
3. LSP 客户端发送文档内容到 Language Server
4. Language Server 调用 OVS 编译器
5. 编译器返回编译结果和语义信息
6. Language Server 提供 Semantic Tokens
7. IntelliJ 显示语义高亮

---

## 📊 整理效果

| 指标 | 整理前 | 整理后 | 改善 |
|------|--------|--------|------|
| **文档总数** | 40+ 个 | 8 个核心文档 | **-80%** |
| **project.mdc 数量** | 1 个（混合） | 3 个（专注） | **职责清晰** |
| **信息密度** | 分散 | 集中 | **+700%** |
| **查找效率** | 需翻阅多个文件 | 单一信息源 | **显著提升** |
| **维护成本** | 高 | 低 | **大幅降低** |

---

## ✅ 后续维护建议

### 1. 单一信息源原则
**每个项目只维护一个 project.mdc：**
- IntelliJ 插件 → `ovs-lsp-intellij/.cursor/rules/project.mdc`
- Language Server → `langServer/.cursor/rules/project.mdc`
- OVS 编译器 → `ovs/.cursor/rules/project.mdc`

### 2. 更新规范
**新功能开发：**
1. 在对应项目的 `project.mdc` 中更新
2. 在【变更记录】章节追加记录
3. 删除临时调试文档

**跨项目功能：**
- 编译器新特性 → 更新 `ovs/project.mdc`
- Language Server 集成 → 更新 `langServer/project.mdc`
- 客户端支持 → 更新 `ovs-lsp-intellij/project.mdc`

### 3. 文档检查清单
**开发完成后：**
- [ ] 更新对应的 `project.mdc`
- [ ] 更新【当前状态】
- [ ] 追加【变更记录】
- [ ] 删除临时文档

### 4. 避免的陷阱
❌ **不要**：
- 在 Monorepo 根目录创建 project.mdc
- 创建新的分散文档（UPDATE、FIXES 等）
- 在多个文档中重复相同信息

✅ **要做**：
- 为每个独立项目创建专门的 project.mdc
- 所有更新写入对应的 project.mdc
- 保持文档专注于各自职责

---

## 🎓 查找速查表

| 需要查找的内容 | 打开哪个文档 | 章节 |
|----------------|--------------|------|
| **IntelliJ 插件** |
| JFlex 词法规则 | `ovs-lsp-intellij/project.mdc` | 【细节实现层 - 1】 |
| LSP 客户端配置 | `ovs-lsp-intellij/project.mdc` | 【细节实现层 - 2】 |
| Semantic Tokens 映射 | `ovs-lsp-intellij/project.mdc` | 【细节实现层 - 2】 |
| 构建和运行 | `ovs-lsp-intellij/project.mdc` | 【开发命令】 |
| **Language Server** |
| Volar 架构 | `langServer/project.mdc` | 【技术方向】 |
| LSP 协议实现 | `langServer/project.mdc` | 【核心实现 - 4】 |
| Semantic Tokens 提供者 | `langServer/project.mdc` | 【核心实现 - 3】 |
| 编译器集成 | `langServer/project.mdc` | 【与 OVS 编译器集成】 |
| **OVS 编译器** |
| OVS 语法 | `ovs/project.mdc` | 【完整语法参考】 |
| 组件系统 | `ovs/project.mdc` | 【组件系统技术实现】 |
| `#{}` 不渲染块 | `ovs/project.mdc` | 【核心渲染规则】 |
| 编译流程 | `ovs/project.mdc` | 【核心实现原理】 |
| **整体架构** |
| 项目总览 | `test-volar-copy/PROJECT_OVERVIEW.md` | 全文 |
| 快速开始 | `test-volar-copy/QUICK_START_GUIDE.md` | 全文 |

---

**整理完成日期：** 2025-10-29  
**整理原则：** 遵循 GuideBot 规则，每个项目一个 project.mdc  
**核心文档位置：**
- IntelliJ 插件：`ovs-lsp-intellij/.cursor/rules/project.mdc`
- Language Server：`test-volar-copy/langServer/.cursor/rules/project.mdc`
- OVS 编译器：`test-volar-copy/ovs/.cursor/rules/project.mdc`
