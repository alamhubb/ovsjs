# Inlay Hints 功能调研总结

## 📅 日期
2025-10-29

## 🎯 目标
为 OVS 语言添加 Inlay Hints（内联类型提示）功能，类似于：
```javascript
const name = "Alice"  // 显示为：const name: string = "Alice"
//        ↑↑↑↑↑↑↑ 不可编辑的类型提示
```

---

## 📊 调研结果

### 1. LSP 协议支持 ✅

**LSP 3.17+** 包含完整的 Inlay Hints 支持：
- 协议：`textDocument/inlayHint`
- 官方文档：https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_inlayHint

### 2. 服务端支持 ✅

**OVS Language Server（基于 Volar + TypeScript）**：
- ✅ 完整实现 `provideInlayHints`
- ✅ 正确声明能力：`"inlayHintProvider": {}`
- ✅ TypeScript 类型推断正常
- ✅ 配置默认启用所有类型提示

**测试日志：**
```
✅✅✅ InlayHint Provider IS DECLARED ✅✅✅
{
  "inlayHintProvider": {}
}
```

### 3. 客户端支持 ❌

**IntelliJ IDEA 2025.2.1**：
- ❌ 无 `LspInlayHintCustomizer` 接口
- ❌ 不发送 `textDocument/inlayHint` 请求
- ✅ 其他 LSP 功能正常（Semantic Tokens、Completion等）

**IntelliJ 当前支持的 LSP Customizers（共12个）：**
```kotlin
LspCustomization {
    ✅ goToDefinitionCustomizer
    ✅ goToTypeDefinitionCustomizer
    ✅ hoverCustomizer
    ✅ completionCustomizer
    ✅ semanticTokensCustomizer
    ✅ diagnosticsCustomizer
    ✅ codeActionsCustomizer
    ✅ commandsCustomizer
    ✅ formattingCustomizer
    ✅ findReferencesCustomizer
    ✅ documentColorCustomizer
    ✅ documentLinkCustomizer
    ❌ inlayHintCustomizer  // 不存在
}
```

---

## 🛠️ 解决方案

### 方案A：等待官方支持（✅ 已采用）

**理由：**
- IntelliJ LSP API 还在快速发展中
- JetBrains 可能在 6-12 个月内添加支持
- 零开发成本，零维护成本
- 现有功能（语法高亮 + Semantic Tokens）已足够

**时间线：** 预计 2025 Q2-Q3

### 方案B：使用 IntelliJ 原生 API（📝 已记录）

**详细方案：** 见 `INLAY_HINTS_PLAN_B.md`

**核心思路：**
1. 实现 `InlayHintsProvider`（IntelliJ 原生 API）
2. 调用 LSP 服务器获取类型信息
3. 手动转换并显示

**工作量：** 约 2 个工作日（9-14 小时）

**优劣分析：**
- ✅ 功能立即可用
- ✅ 复用现有 LSP 服务器
- ❌ 需要额外代码（约 300 行）
- ❌ 需要手动管理 LSP 通信
- ❌ 维护成本较高

---

## 📝 完成的工作

### 1. 测试验证
- ✅ 在服务端添加详细日志
- ✅ 在客户端检查 capabilities
- ✅ 完整测试流程验证
- ✅ 确认问题根源

### 2. 文档记录
- ✅ 创建方案B详细实现文档（`INLAY_HINTS_PLAN_B.md`）
- ✅ 更新客户端项目文档（`.cursor/rules/project.mdc`）
- ✅ 创建服务端项目文档（`langServer/.cursor/rules/project.mdc`）
- ✅ 更新 LSP 功能支持表格

### 3. 代码优化
- ✅ 升级 Gradle 8.11.1 → 8.13
- ✅ 修复构建问题（重复依赖）
- ✅ 添加测试日志（不影响功能）

---

## 🔗 相关文档

### 本项目文档
1. **`INLAY_HINTS_PLAN_B.md`** - 方案B详细实现（300行）
2. **`INLAY_HINTS_SUMMARY.md`** - 调研总结（本文件）
3. **`.cursor/rules/project.mdc`** - 客户端项目文档（已更新）

### 服务端文档
1. **`langServer/.cursor/rules/project.mdc`** - 服务端项目文档（新建）

### 参考资料
1. **LSP 协议规范**: https://microsoft.github.io/language-server-protocol/
2. **IntelliJ LSP API**: https://plugins.jetbrains.com/docs/intellij/language-server-protocol.html
3. **IntelliJ Inlay Hints**: https://plugins.jetbrains.com/docs/intellij/inlay-hints.html
4. **JetBrains Blog**: https://blog.jetbrains.com/platform/

---

## 📊 LSP 功能支持对比

| LSP 功能 | LSP 协议 | OVS Server | IntelliJ 客户端 | VS Code | 状态 |
|---------|---------|-----------|----------------|---------|------|
| **Semantic Tokens** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |
| **Completion** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |
| **Inlay Hints** | ✅ | ✅ | ❌ | ✅ | ⚠️ 客户端限制 |
| **Diagnostics** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |
| **Definition** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |
| **Hover** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |
| **Formatting** | ✅ | ✅ | ✅ | ✅ | 🎉 正常 |

---

## 🎯 决策

### 当前决策：方案A（等待官方支持）

**执行计划：**
1. ✅ 记录完整的方案B实现（供未来参考）
2. ✅ 更新所有项目文档
3. ⏳ 关注 IntelliJ Platform 更新日志
4. ⏳ 在 6-12 个月后重新评估

### 触发方案B的条件：
- IntelliJ 1 年内未添加 `LspInlayHintCustomizer`
- 团队强烈需要该功能
- 有充足的开发时间

---

## 💡 经验总结

### ✅ 成功经验
1. **分层测试**：先测服务端，再测客户端，快速定位问题
2. **详细日志**：在关键位置添加日志，便于调试
3. **文档先行**：先记录方案，再决定是否实施

### ⚠️ 注意事项
1. **LSP API 差异**：不同客户端支持程度不同
2. **版本依赖**：IntelliJ LSP API 还在快速演进
3. **成本权衡**：评估实施成本 vs 等待官方支持

### 📚 学习收获
1. 深入理解 LSP 协议和 Inlay Hints 机制
2. 掌握 IntelliJ Platform 的 LSP 集成方式
3. 了解 Volar 框架的工作原理

---

## 📞 后续跟进

### 监控渠道
- **IntelliJ Platform Blog**: https://blog.jetbrains.com/platform/
- **JetBrains YouTrack**: https://youtrack.jetbrains.com/
- **IntelliJ Platform SDK**: https://plugins.jetbrains.com/docs/intellij/

### 评估周期
- **2025 Q2**：检查 IntelliJ 2025.3 是否添加支持
- **2025 Q3**：检查 IntelliJ 2025.4 是否添加支持
- **2025 Q4**：如仍不支持，考虑实施方案B

---

**调研总结 | 决策：方案A（等待官方） | 最后更新: 2025-10-29**

