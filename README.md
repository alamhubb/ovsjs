# Test-Volar - 编译器工具链项目

> 一个完整的编译器实现，展示如何创建自定义编程语言并集成到现代前端工具链

## 🌟 项目简介

**Test-Volar** 是一个 Monorepo 项目，实现了完整的编译器工具链，核心是 **OVS（Object-oriented View Syntax）** —— 一个类似 Flutter/SwiftUI 的 JavaScript UI 框架。

### 核心特性

- ✅ **完整的编译器**：词法分析 → 语法分析 → AST 转换 → 代码生成
- ✅ **可扩展架构**：基于继承和组合的设计
- ✅ **类型安全**：全程 TypeScript，完整类型定义
- ✅ **现代工具链**：集成 Vite、Vue 3、Prettier
- ✅ **生产就绪**：已在浏览器中运行验证

---

## 🚀 快速开始

### 安装

```bash
npm install
```

### 运行示例

```bash
cd ovs
npm run dev
```

访问 http://localhost:5173/ 查看效果

### 查看编译结果

```bash
cd langServer
npx tsx src/testovsplugin.ts
```

---

## 📖 OVS 语法示例

### 输入（hello.ovs）

```javascript
export const hello = div {
  const abc = true
  if (abc) {
    123
  }
}
```

### 输出（编译后）

```javascript
import OvsAPI from 'ovsjs/src/OvsAPI'
export const hello = (function () {
  const children = []
  const abc = true
  if (abc) {
    children.push(123)
  }
  return OvsAPI.createVNode('div', children)
})()
```

### 在 Vue 中使用

```javascript
import {hello} from './hello.ovs'

export const App = {
  render() {
    return hello
  }
}
```

---

## 🏗️ 项目结构

```
test-volar/
├── subhuti/              # Parser 生成器框架
├── slime/                # JavaScript AST 工具链
│   ├── slime-ast/        # AST 类型定义
│   ├── slime-parser/     # ES5/ES6 Parser
│   ├── slime-generator/  # 代码生成器
│   └── ...
├── ovs/                  # OVS 语言实现 ⭐
│   ├── src/              # 编译器源码
│   ├── example/          # 示例项目
│   └── docs/             # 文档
├── objectScript/         # ObjectScript 语言
├── langServer/           # 语言服务器（LSP）
└── particula/            # 混合架构（设计中）
```

---

## 💡 核心技术

### 1. Parser 继承链

```
SubhutiParser (框架)
  ↓
Es5Parser (ES5 语法)
  ↓
Es6Parser (ES6+ 语法)
  ↓
OvsParser (OVS 语法)
```

### 2. 计数器机制

使用计数器标记当前是否在 `div { }` 内部：

```typescript
private ovsRenderDomViewDepth = 0

// 进入 div { } 时 +1
// 退出时 -1
// 当 > 0 时，ExpressionStatement 转换为 children.push()
```

### 3. IIFE 作用域隔离

每个 `div { }` 生成独立的 IIFE，自动隔离 `children` 变量：

```javascript
(function () {
  const children = []  // 外层
  children.push(
    (function () {
      const children = []  // 内层（新作用域）
      return OvsAPI.createVNode('span', children)
    })()
  )
  return OvsAPI.createVNode('div', children)
})()
```

---

## 📚 文档

### 核心文档
- [项目概述](./PROJECT_OVERVIEW.md) - 完整的项目介绍
- [架构详解](./ARCHITECTURE.md) - 技术架构说明
- [快速复现指南](./QUICK_START_GUIDE.md) - 如何创建类似项目

### OVS 文档
- [使用指南](./ovs/docs/USAGE_GUIDE.md) - OVS 使用说明
- [渲染机制](./ovs/docs/OVS_RENDER_DOM_VIEW_DECLARATION.md) - 技术实现
- [实现总结](./ovs/docs/IMPLEMENTATION_SUMMARY.md) - 开发总结
- [设计思考](./particula/OVS_DESIGN_THINKING.md) - 设计理念

---

## 🎯 适用场景

### 1. 创建 DSL（领域特定语言）

为特定领域设计专用语言，提升开发效率。

### 2. 扩展 JavaScript

添加新的语法特性，增强 JavaScript 表达能力。

### 3. 实现模板语言

创建更强大的模板系统，超越传统模板引擎。

### 4. 代码转换工具

实现代码迁移、重构、优化等工具。

### 5. 学习编译原理

通过实践深入理解编译器工作原理。

---

## 🌟 技术亮点

### 1. 完整性

从词法分析到代码生成，完整实现所有阶段。

### 2. 可扩展性

- Parser 可继承
- AST 可扩展
- 插件可组合

### 3. 实用性

- 可在生产环境使用
- 与 Vue 3 完美集成
- 支持现代构建工具

### 4. 教育价值

- 展示编译器完整实现
- 演示设计模式应用
- 提供学习路径

---

## 🛠️ 技术栈

### 核心技术
- **TypeScript** - 类型安全
- **装饰器** - 元编程
- **递归下降** - 解析算法
- **AST 操作** - 代码转换

### 构建工具
- **Vite** - 构建工具
- **Lerna** - Monorepo 管理
- **Prettier** - 代码格式化

### 运行时
- **Vue 3** - UI 框架
- **OvsAPI** - 运行时 API

---

## 📊 项目规模

- **总代码行数**：20,000+
- **核心模块**：5 个
- **子包数量**：8 个
- **开发时间**：6+ 个月

---

## 🎓 学习路径

### 初学者
1. 运行示例项目
2. 修改 `hello.ovs` 文件
3. 查看编译结果
4. 阅读使用文档

### 进阶
1. 理解编译流程
2. 调试 Parser 和转换器
3. 阅读核心源码
4. 理解设计模式

### 高级
1. 扩展 OVS 语法
2. 创建自己的语言
3. 优化性能
4. 贡献代码

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript
- 添加注释
- 保持代码风格一致
- 编写测试

---

## 📄 许可证

MIT License

---

## 👨‍💻 作者

- **alamhubb** - [GitHub](https://github.com/alamhubb)

---

## 🙏 致谢

感谢所有为编译器技术和开源社区做出贡献的开发者。

---

## 🔗 相关链接

- [GitHub Repository](https://github.com/alamhubb/ovs)
- [OVS 设计文档](./particula/OVS_DESIGN_THINKING.md)
- [架构详解](./ARCHITECTURE.md)

---

_用 OOP 语法写 UI，简洁、优雅、统一_ ✨

**关键词：** 编译器、Parser、AST、DSL、Vue、TypeScript、Vite

