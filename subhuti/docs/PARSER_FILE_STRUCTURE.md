# SubhutiParser 模块化文件结构设计

## 🎯 设计原则

1. **层次清晰** - 核心、插件、工具分离
2. **易于查找** - 按功能分组，命名直观
3. **便于扩展** - 支持第三方插件
4. **符合习惯** - 参考主流项目（Babel, TypeScript, Rollup）

---

## 📁 方案A：扁平化插件目录（推荐）⭐⭐⭐

```
subhuti/
├── src/
│   ├── parser/                          # 解析器核心目录
│   │   ├── SubhutiParser.ts             # ⭐ 核心 Parser（800行）
│   │   ├── SubhutiTokenConsumer.ts      # Token 消费器
│   │   │
│   │   ├── plugins/                     # 插件目录（扁平）
│   │   │   ├── index.ts                 # 插件统一导出
│   │   │   ├── packrat.ts               # Packrat 缓存插件
│   │   │   ├── debugger.ts              # 调试插件
│   │   │   ├── profiler.ts              # 性能分析插件
│   │   │   ├── error-handler.ts         # 错误处理插件
│   │   │   └── utilities.ts             # 辅助工具插件
│   │   │
│   │   ├── types/                       # 类型定义
│   │   │   ├── index.ts                 # 类型统一导出
│   │   │   ├── parser.ts                # Parser 相关类型
│   │   │   ├── plugin.ts                # 插件接口
│   │   │   ├── error.ts                 # 错误类型
│   │   │   └── cst.ts                   # CST 类型
│   │   │
│   │   └── utils/                       # 内部工具（非插件）
│   │       ├── backtrack.ts             # 回溯工具
│   │       └── location.ts              # 位置计算
│   │
│   ├── lexer/                           # 词法分析器
│   │   └── SubhutiLexer.ts
│   │
│   ├── struct/                          # 数据结构
│   │   ├── SubhutiCst.ts
│   │   ├── SubhutiMatchToken.ts
│   │   └── SubhutiSourceLocation.ts
│   │
│   └── index.ts                         # 统一导出
│
├── docs/                                # 文档
│   ├── PARSER_MODULES_ANALYSIS.md       # 模块分析（已有）
│   ├── PARSER_FILE_STRUCTURE.md         # 文件结构（本文档）
│   └── PLUGIN_DEVELOPMENT.md            # 插件开发指南
│
└── tests/                               # 测试
    ├── cases/
    │   ├── 01-parser-core.ts            # 核心功能测试
    │   ├── 02-packrat-plugin.ts         # Packrat 插件测试
    │   ├── 03-debugger-plugin.ts        # 调试插件测试
    │   └── ...
    └── utils/
```

**优势：**
- ✅ 插件目录扁平，易于浏览
- ✅ 文件命名简洁（kebab-case）
- ✅ 类型独立目录，易于查找
- ✅ 核心文件在顶层，突出重要性

**导入示例：**
```typescript
// 核心
import SubhutiParser from './parser/SubhutiParser.ts'

// 插件
import { PackratPlugin } from './parser/plugins/packrat.ts'
import { DebuggerPlugin } from './parser/plugins/debugger.ts'

// 类型
import type { ParserPlugin, ParserOptions } from './parser/types/plugin.ts'

// 统一导出
import { SubhutiParser, PackratPlugin, DebuggerPlugin } from './index.ts'
```

---

## 📁 方案B：按功能分组的插件目录

```
subhuti/
├── src/
│   ├── parser/
│   │   ├── core/                        # 核心功能
│   │   │   ├── SubhutiParser.ts         # ⭐ 核心 Parser
│   │   │   ├── SubhutiTokenConsumer.ts
│   │   │   ├── backtrack.ts             # 回溯机制
│   │   │   └── state-manager.ts         # 状态管理
│   │   │
│   │   ├── plugins/                     # 插件（按类型分组）
│   │   │   ├── cache/                   # 缓存插件组
│   │   │   │   ├── packrat.ts
│   │   │   │   ├── lru-cache.ts
│   │   │   │   └── unlimited-cache.ts
│   │   │   │
│   │   │   ├── debug/                   # 调试插件组
│   │   │   │   ├── debugger.ts
│   │   │   │   ├── trace-debugger.ts
│   │   │   │   └── visual-debugger.ts
│   │   │   │
│   │   │   ├── profiling/               # 性能分析组
│   │   │   │   ├── profiler.ts
│   │   │   │   └── flamegraph.ts
│   │   │   │
│   │   │   └── error/                   # 错误处理组
│   │   │       ├── error-handler.ts
│   │   │       └── suggestion-engine.ts
│   │   │
│   │   ├── types/                       # 类型定义
│   │   │   ├── index.ts
│   │   │   ├── parser.ts
│   │   │   └── plugin.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── lexer/
│   ├── struct/
│   └── index.ts
│
├── docs/
└── tests/
```

**优势：**
- ✅ 功能分组，易于管理相关插件
- ✅ 支持多个缓存策略并存
- ✅ 支持多个调试器实现
- ✅ 便于扩展（新增同类插件）

**劣势：**
- ❌ 目录层次较深
- ❌ 单个插件时显得过度设计

---

## 📁 方案C：独立 plugins 包（适合大型项目）

```
subhuti/
├── packages/                            # Monorepo 风格
│   ├── core/                            # 核心包
│   │   ├── src/
│   │   │   ├── SubhutiParser.ts
│   │   │   ├── SubhutiTokenConsumer.ts
│   │   │   └── types.ts
│   │   └── package.json                 # @subhuti/core
│   │
│   ├── plugin-packrat/                  # Packrat 插件包
│   │   ├── src/
│   │   │   ├── packrat.ts
│   │   │   ├── lru-cache.ts
│   │   │   └── unlimited-cache.ts
│   │   └── package.json                 # @subhuti/plugin-packrat
│   │
│   ├── plugin-debugger/                 # 调试插件包
│   │   ├── src/
│   │   │   ├── debugger.ts
│   │   │   └── trace-debugger.ts
│   │   └── package.json                 # @subhuti/plugin-debugger
│   │
│   ├── plugin-profiler/                 # 性能分析插件包
│   │   └── ...
│   │
│   └── plugin-error-handler/            # 错误处理插件包
│       └── ...
│
├── docs/
└── tests/
```

**优势：**
- ✅ 插件完全独立，可单独发布
- ✅ 按需安装（npm install @subhuti/plugin-packrat）
- ✅ 版本独立管理
- ✅ 支持第三方插件生态

**劣势：**
- ❌ 复杂度高，适合大型项目
- ❌ 需要 Monorepo 工具（pnpm/nx）
- ❌ 开发调试较繁琐

---

## 📁 方案D：混合方案（推荐小型项目）⭐⭐⭐⭐

```
subhuti/
├── src/
│   ├── parser/
│   │   ├── SubhutiParser.ts             # ⭐ 核心（800行）
│   │   ├── SubhutiTokenConsumer.ts
│   │   ├── SubhutiErrorHandler.ts       # 错误处理（独立文件）
│   │   │
│   │   ├── plugins/                     # 插件（扁平）
│   │   │   ├── SubhutiPackratPlugin.ts
│   │   │   ├── SubhutiDebuggerPlugin.ts
│   │   │   ├── SubhutiProfilerPlugin.ts
│   │   │   └── index.ts
│   │   │
│   │   └── types.ts                     # 类型定义（单文件）
│   │
│   ├── lexer/
│   ├── struct/
│   └── index.ts
│
├── docs/
└── tests/
```

**优势：**
- ✅ 结构简单，易于理解
- ✅ 错误处理独立文件（高复用）
- ✅ 插件统一前缀（Subhuti*Plugin）
- ✅ 类型定义单文件（小型项目够用）
- ✅ 适合当前项目规模

---

## 🏆 推荐选择

### 小型项目（当前）→ 方案D（混合）⭐⭐⭐⭐

**理由：**
- ✅ 结构简单，无过度设计
- ✅ 核心文件清晰（SubhutiParser.ts）
- ✅ 插件易于查找（plugins/ 目录）
- ✅ 错误处理独立（复用价值高）

### 中型项目 → 方案A（扁平插件）⭐⭐⭐

**理由：**
- ✅ 类型独立目录（便于管理）
- ✅ 插件目录扁平（易于浏览）
- ✅ 支持更多插件（不拥挤）

### 大型项目 → 方案C（Monorepo）⭐⭐⭐⭐⭐

**理由：**
- ✅ 插件完全独立
- ✅ 可单独发布
- ✅ 版本独立管理
- ✅ 支持第三方生态

---

## 📝 文件命名规范

### 核心文件（PascalCase）
```
SubhutiParser.ts           # 主 Parser
SubhutiTokenConsumer.ts    # Token 消费器
SubhutiErrorHandler.ts     # 错误处理器
```

### 插件文件（方案A：kebab-case）
```
plugins/
├── packrat.ts             # 简洁
├── debugger.ts
├── profiler.ts
└── error-handler.ts
```

### 插件文件（方案D：PascalCase + Plugin 后缀）⭐
```
plugins/
├── SubhutiPackratPlugin.ts      # 统一前缀
├── SubhutiDebuggerPlugin.ts
├── SubhutiProfilerPlugin.ts
└── index.ts
```

### 类型文件
```
types/
├── index.ts               # 统一导出
├── parser.ts              # Parser 相关
├── plugin.ts              # 插件接口
└── error.ts               # 错误类型
```

或单文件：
```
parser/
└── types.ts               # 所有类型（小型项目）
```

---

## 📦 导出策略

### 方案D（推荐）- 统一导出

**src/parser/plugins/index.ts**
```typescript
// 插件统一导出
export { SubhutiPackratPlugin } from './SubhutiPackratPlugin.ts'
export { SubhutiDebuggerPlugin } from './SubhutiDebuggerPlugin.ts'
export { SubhutiProfilerPlugin } from './SubhutiProfilerPlugin.ts'

// 默认插件组合
export { default as DefaultPlugins } from './defaults.ts'
```

**src/parser/index.ts**
```typescript
// 核心
export { default as SubhutiParser } from './SubhutiParser.ts'
export { default as SubhutiTokenConsumer } from './SubhutiTokenConsumer.ts'
export { default as SubhutiErrorHandler } from './SubhutiErrorHandler.ts'

// 插件
export * from './plugins/index.ts'

// 类型
export type * from './types.ts'
```

**src/index.ts**
```typescript
// Parser
export * from './parser/index.ts'

// Lexer
export * from './lexer/index.ts'

// Struct
export * from './struct/index.ts'
```

---

## 🔄 迁移路径

### 阶段1：创建新文件（不删除旧代码）

```
subhuti/
├── src/
│   ├── parser/
│   │   ├── SubhutiParser.ts              # 旧文件（保留）
│   │   ├── SubhutiParser.new.ts          # 新核心（测试）
│   │   ├── SubhutiErrorHandler.ts        # 新文件
│   │   └── plugins/                      # 新目录
│   │       ├── SubhutiPackratPlugin.ts
│   │       └── ...
```

### 阶段2：测试通过后重命名

```
subhuti/
├── src/
│   ├── parser/
│   │   ├── SubhutiParser.ts              # ← 重命名 SubhutiParser.new.ts
│   │   ├── SubhutiParser.legacy.ts       # ← 重命名旧文件（备份）
│   │   ├── SubhutiErrorHandler.ts
│   │   └── plugins/
```

### 阶段3：删除旧文件

```
subhuti/
├── src/
│   ├── parser/
│   │   ├── SubhutiParser.ts              # 新实现
│   │   ├── SubhutiErrorHandler.ts
│   │   └── plugins/
```

---

## 📊 各方案对比表

| 特性 | 方案A<br>扁平插件 | 方案B<br>分组插件 | 方案C<br>Monorepo | 方案D<br>混合 |
|-----|----------------|----------------|----------------|-------------|
| **结构复杂度** | ⭐⭐⭐ 中等 | ⭐⭐ 较复杂 | ⭐ 复杂 | ⭐⭐⭐⭐ 简单 |
| **查找效率** | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中 | ⭐⭐ 低 | ⭐⭐⭐⭐⭐ 很高 |
| **扩展性** | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 很好 | ⭐⭐⭐⭐⭐ 完美 | ⭐⭐⭐ 中 |
| **维护成本** | ⭐⭐⭐⭐ 低 | ⭐⭐⭐ 中 | ⭐⭐ 高 | ⭐⭐⭐⭐⭐ 很低 |
| **学习曲线** | ⭐⭐⭐⭐ 平缓 | ⭐⭐⭐ 中等 | ⭐⭐ 陡峭 | ⭐⭐⭐⭐⭐ 平缓 |
| **适用场景** | 中型项目 | 大型项目 | 企业级 | 小型项目 |

---

## ✅ 最终推荐（当前项目）

**推荐：方案D（混合方案）**

```
subhuti/src/parser/
├── SubhutiParser.ts                  # 核心（800行）
├── SubhutiTokenConsumer.ts           # Token 消费器
├── SubhutiErrorHandler.ts            # 错误处理（独立）
├── types.ts                          # 类型定义
│
├── plugins/                          # 插件目录
│   ├── SubhutiPackratPlugin.ts       # Packrat 缓存
│   ├── SubhutiDebuggerPlugin.ts      # 调试
│   ├── SubhutiProfilerPlugin.ts      # 性能分析
│   ├── defaults.ts                   # 默认插件组合
│   └── index.ts                      # 统一导出
│
└── index.ts                          # Parser 导出
```

**命名规范：**
- ✅ 核心文件：`Subhuti*.ts`（PascalCase）
- ✅ 插件文件：`Subhuti*Plugin.ts`（统一后缀）
- ✅ 类型文件：`types.ts`（单文件，小型项目）
- ✅ 导出文件：`index.ts`（每层一个）

**理由：**
1. 结构简单，易于理解
2. 文件命名统一，易于识别
3. 插件目录清晰，易于扩展
4. 适合当前项目规模（3-5个插件）
5. 迁移成本低，风险可控

---

**下一步：** 确认文件结构后，制定详细的拆分计划？

