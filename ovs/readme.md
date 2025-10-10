# OVS

> 声明式 UI 框架 - 使用类似 Flutter/SwiftUI 的语法开发 Vue 应用

## 主要文档

**请查看：** [aireadme.md](aireadme.md)

---

## 技术笔记

### 编译流程关键点

1. **CST 生成** - 保留完整的 token 信息（括号位置等）
2. **CST → AST** - 语法转换，保留位置信息
3. **AST → Code** - 根据 AST 和原始 tokens 生成代码

### Source Map

CST 中包含了所有 token 的位置信息（`console.log( 1 )` 中括号和空格的位置），用于：
- 准确的错误提示
- Source map 生成
- 代码格式化

### 错误处理

语法错误直接报错，不做容错（如 `console.log(1,` 这种未完成的代码）。

---

**项目主文档：** [aireadme.md](aireadme.md)
