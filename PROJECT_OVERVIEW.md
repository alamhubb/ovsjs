# Test-Volar 项目完整介绍

## 📋 项目概述

这是一个**编译器工具链项目**，核心目标是创建 **OVS（Object-oriented View Syntax）** —— 一个类似 Flutter/SwiftUI 的 JavaScript UI 框架。

**核心理念：**
> 用面向对象的语法编写声明式 UI，无需 JSX，无需 HTML

> 注：所有项目级执行约束、质量承诺与流程规范，统一以`.cursor/rules/project.mdc`为唯一信息源；
> 本文件仅保留架构与背景介绍，不再重复规则内容。

## 🏗️ 项目架构

这是一个 **Monorepo** 项目，使用 **Lerna** 管理多个子包：

```
test-volar/
├── subhuti/              # 编译器框架（Parser 生成器）
├── slime/                # JavaScript AST 工具链
│   ├── slime-ast/        # AST 类型定义
│   ├── slime-parser/     # JavaScript 解析器（ES5/ES6）
│   ├── slime-generator/  # 代码生成器
│   ├── slime-syntax/     # 语法类型
│   └── slime-token/      # Token 类型
├── ovs/                  # OVS 语言实现（核心）
│   ├── src/              # OVS 编译器源码
│   ├── example/          # 示例项目
│   └── docs/             # 文档
├── objectScript/         # ObjectScript 语言实现
├── particula/            # 混合架构设计（未完成）
├── runtime-type-system/  # 运行时类型系统（未完成）
└── langServer/           # 语言服务器（LSP）
```

---

## 🎯 核心模块详解

### 1. Subhuti - 编译器框架

**职责：** Parser 生成器，用于快速创建编程语言的解析器

**核心特性：**
- 使用装饰器定义语法规则
- 支持 Parser 继承和扩展
- 自动生成 CST（具体语法树）
- 支持错误恢复和容错

**示例：**
```typescript
@Subhuti
class MyParser extends SubhutiParser {
  @SubhutiRule
  Expression() {
    this.Or([
      {alt: () => this.Literal()},
      {alt: () => this.Identifier()}
    ])
  }
}
```

**技术栈：**
- TypeScript
- 装饰器模式
- 递归下降解析

---

### 2. Slime - JavaScript AST 工具链

**职责：** 提供完整的 JavaScript AST 操作能力

#### 2.1 slime-ast
- **AST 类型定义**（基于 ESTree 标准）
- **AST 工具类**（创建、修改、遍历）

#### 2.2 slime-parser
- **ES5 Parser**：解析 ES5 语法
- **ES6 Parser**：继承 ES5，支持 ES6+ 语法
- **CST → AST 转换**：将 CST 转换为标准 AST

#### 2.3 slime-generator
- **代码生成器**：AST → JavaScript 代码
- **Source Map 支持**：保留源码映射

#### 2.4 slime-syntax & slime-token
- **语法类型定义**
- **Token 类型定义**

**工作流程：**
```
代码字符串
  ↓ (Lexer)
Tokens
  ↓ (Parser)
CST
  ↓ (SlimeCstToAst)
AST
  ↓ (SlimeGenerator)
JavaScript 代码
```

---

### 3. OVS - 核心语言实现

**职责：** 实现 OVS 语言的完整编译器

#### 3.1 核心文件结构

```
ovs/src/
├── parser/
│   ├── OvsParser.ts              # OVS 语法解析器（继承 Es6Parser）
│   └── OvsConsumer.ts            # OVS Token 定义
├── factory/
│   ├── OvsCstToSlimeAstUtil.ts   # CST → AST 转换（核心）
│   ├── OvsVueRenderFactory.ts    # Vue 渲染工厂（旧）
│   └── ...
├── interface/
│   └── OvsInterface.d.ts         # OVS AST 类型定义
├── model/
│   └── OvsVueRenderAst.ts        # Vue 渲染 AST
├── index.ts                      # Vite 插件入口
└── OvsAPI.ts                     # 运行时 API
```

#### 3.2 核心语法

**OvsRenderDomViewDeclaration**：
```javascript
div {
  const abc = true
  if (abc) {
    123
  }
}
```

**编译为：**
```javascript
(function () {
  const children = []
  const abc = true
  if (abc) {
    children.push(123)
  }
  return OvsAPI.createVNode('div', children)
})()
```

#### 3.3 核心机制

**计数器机制：**
- 使用 `ovsRenderDomViewDepth` 计数器
- 进入 `div { }` 时 +1，退出时 -1
- 当 > 0 时，`ExpressionStatement` 转换为 `children.push()`

**作用域隔离：**
- 每个 `div { }` 生成独立的 IIFE
- 自动创建新的 `children` 作用域
- 支持无限嵌套

#### 3.4 Vite 插件

```typescript
// vite.config.ts
import vitePluginOvs from './src'

export default {
  plugins: [
    vue(),
    vitePluginOvs()  // 处理 .ovs 文件
  ]
}
```

---

### 4. ObjectScript - 另一个语言实现

**职责：** 实现 ObjectScript 语言（类似 Cache ObjectScript）

**特点：**
- 继承 ES6 Parser
- 添加 ObjectScript 特有语法
- 演示如何扩展 Slime Parser

---

### 5. LangServer - 语言服务器

**职责：** 提供 IDE 支持（LSP）

**功能：**
- 语法高亮
- 代码补全
- 错误诊断
- 跳转定义

**状态：** 开发中

---

## 🔄 完整的编译流程

### OVS 文件编译流程

```
hello.ovs (OVS 源代码)
  ↓
1. 词法分析 (SubhutiLexer + es6Tokens)
  ↓
Tokens (词法单元)
  ↓
2. 语法分析 (OvsParser extends Es6Parser)
  ↓
CST (具体语法树)
  ↓
3. 语法转换 (OvsCstToSlimeAst.toProgram)
   - 识别 OvsRenderDomViewDeclaration
   - 使用计数器机制转换 ExpressionStatement
  ↓
AST (抽象语法树 - JavaScript)
  ↓
4. 添加 import (ensureOvsAPIImport)
  ↓
AST (带 import OvsAPI)
  ↓
5. 代码生成 (SlimeGenerator.generator)
  ↓
JavaScript 代码
  ↓
6. 代码格式化 (Prettier)
  ↓
最终代码 (可在浏览器运行)
```

---

## 💡 核心技术亮点

### 1. 编译器继承链

```
SubhutiParser (基础框架)
  ↓
Es5Parser (ES5 语法)
  ↓
Es6Parser (ES6+ 语法)
  ↓
OvsParser (OVS 语法)
```

**优势：**
- 复用 JavaScript 语法
- 只需添加 OVS 特有语法
- 自动支持所有 ES6 特性

### 2. 计数器机制

**问题：** 如何区分是否在 `div { }` 内部？

**解决方案：**
```typescript
class OvsCstToSlimeAst {
  private ovsRenderDomViewDepth = 0;
  
  createOvsRenderDomViewDeclarationAst() {
    this.ovsRenderDomViewDepth++
    try {
      // 转换逻辑
    } finally {
      this.ovsRenderDomViewDepth--
    }
  }
  
  createExpressionStatementAst() {
    if (this.ovsRenderDomViewDepth > 0) {
      // 转换为 children.push()
    }
  }
}
```

**优势：**
- 简单：只需一个整数
- 自动传递：实例变量，嵌套调用自动继承
- 支持嵌套：多层 div 正确处理

### 3. IIFE 作用域隔离

**问题：** 嵌套的 `div { }` 如何避免 `children` 变量冲突？

**解决方案：**
```javascript
// 外层 div
(function() {
  const children = []  // 外层 children
  children.push(
    // 内层 div
    (function() {
      const children = []  // 内层 children（新作用域）
      return OvsAPI.createVNode('span', children)
    })()
  )
  return OvsAPI.createVNode('div', children)
})()
```

**优势：**
- 自动隔离：JavaScript 作用域机制
- 无需手动管理：不需要 children_1, children_2
- 性能好：无额外开销

### 4. AST 操作而非字符串处理

**优势：**
- 类型安全
- 易于操作
- 不易出错
- 可复用工具

---

## 📦 依赖关系

```
ovs (OVS 语言)
  ├─ depends on → slime-parser (JavaScript 解析)
  ├─ depends on → slime-ast (AST 工具)
  ├─ depends on → slime-generator (代码生成)
  └─ depends on → subhuti (Parser 框架)

slime-parser
  ├─ depends on → slime-ast
  └─ depends on → subhuti

slime-generator
  └─ depends on → slime-ast

objectScript
  ├─ depends on → slime-parser
  └─ depends on → subhuti
```

---

## 🚀 如何创建类似的项目

### 第一步：创建 Parser 框架（Subhuti）

```typescript
// 1. 定义 Token
export const myTokens = {
  Keyword: { name: 'Keyword', pattern: /if|else|while/ },
  Identifier: { name: 'Identifier', pattern: /[a-zA-Z_]\w*/ },
  // ...
}

// 2. 创建 Parser
@Subhuti
class MyParser extends SubhutiParser {
  @SubhutiRule
  Program() {
    this.Many(() => this.Statement())
  }
  
  @SubhutiRule
  Statement() {
    this.Or([
      {alt: () => this.IfStatement()},
      {alt: () => this.ExpressionStatement()}
    ])
  }
}
```

### 第二步：创建 AST 工具（Slime）

```typescript
// 1. 定义 AST 类型
export interface MyAstNode {
  type: string
  loc: SourceLocation
}

// 2. CST → AST 转换
class MyCstToAst {
  toProgram(cst: SubhutiCst): MyProgram {
    return {
      type: 'Program',
      body: this.createStatementListAst(cst.children[0])
    }
  }
}

// 3. 代码生成
class MyGenerator {
  static generate(ast: MyProgram): string {
    // AST → 代码
  }
}
```

### 第三步：创建语言扩展（OVS）

```typescript
// 1. 继承 JavaScript Parser
@Subhuti
class OvsParser extends Es6Parser {
  @SubhutiRule
  MyCustomSyntax() {
    // 自定义语法规则
  }
}

// 2. 扩展 AST 转换
class OvsCstToAst extends SlimeCstToAst {
  createMyCustomSyntaxAst(cst) {
    // 转换自定义语法
  }
}

// 3. 创建 Vite 插件
export function vitePluginMy() {
  return {
    name: 'vite-plugin-my',
    transform(code, id) {
      if (id.endsWith('.my')) {
        // 编译自定义语法
        return { code: compiled }
      }
    }
  }
}
```

### 第四步：集成到构建工具

```typescript
// vite.config.ts
import vitePluginMy from './src'

export default {
  plugins: [
    vitePluginMy()
  ]
}
```

---

## 🎨 设计模式和原则

### 1. 单一职责原则

每个模块只负责一件事：
- **Subhuti**：Parser 生成
- **Slime**：JavaScript AST 操作
- **OVS**：OVS 语法实现
- **Vite Plugin**：文件级别包装

### 2. 继承和组合

- **继承**：`Es5Parser → Es6Parser → OvsParser`
- **组合**：`OvsParser` 使用 `SlimeCstToAst` 和 `SlimeGenerator`

### 3. 开放封闭原则

- **对扩展开放**：可以继承 Parser 添加新语法
- **对修改封闭**：不需要修改基础 Parser

### 4. 依赖倒置原则

- 高层模块（OVS）不依赖低层模块（Subhuti）的实现细节
- 都依赖抽象（接口）

---

## 📚 关键概念

### CST vs AST

**CST（Concrete Syntax Tree）：**
- 包含所有语法细节（括号、分号、空格）
- 直接对应源代码
- 用于语法分析阶段

**AST（Abstract Syntax Tree）：**
- 只保留语义信息
- 去除语法细节
- 用于代码转换和生成

### Token vs Node

**Token：**
- 词法单元（关键字、标识符、运算符）
- 词法分析的输出

**Node：**
- 语法节点（表达式、语句、声明）
- 语法分析的输出

### Parser 继承

```
Es5Parser
  ├─ Statement()
  ├─ Expression()
  └─ ...

Es6Parser extends Es5Parser
  ├─ ArrowFunction()      # 新增
  ├─ ClassDeclaration()   # 新增
  └─ Statement()          # 重写（添加新的语句类型）

OvsParser extends Es6Parser
  ├─ OvsRenderDomViewDeclaration()  # 新增
  └─ AssignmentExpression()         # 重写（支持 OVS 语法）
```

---

## 🛠️ 技术栈

### 编译器技术
- **词法分析**：正则表达式、Token 匹配
- **语法分析**：递归下降、LL(k)
- **语义分析**：AST 转换、类型检查
- **代码生成**：AST 遍历、字符串拼接

### 开发工具
- **TypeScript**：类型安全
- **Vite**：构建工具
- **Prettier**：代码格式化
- **Lerna**：Monorepo 管理

### 运行时
- **Vue 3**：UI 框架
- **OvsAPI**：运行时 API（createVNode）

---

## 📖 核心文档

### 设计文档
- `particula/OVS_DESIGN_THINKING.md` - OVS 设计思考
- `particula/HYBRID_DESIGN.md` - 混合架构设计
- `ovs/docs/OVS_RENDER_DOM_VIEW_DECLARATION.md` - 渲染机制
- `ovs/docs/IMPLEMENTATION_SUMMARY.md` - 实现总结

### 使用文档
- `ovs/docs/USAGE_GUIDE.md` - 使用指南
- `slime/README.md` - Slime 工具链说明
- `subhuti/README.md` - Subhuti 框架说明

---

## 🎯 如何复现这个项目

### 步骤 1：理解编译原理基础

学习：
- 词法分析（Lexer）
- 语法分析（Parser）
- AST（抽象语法树）
- 代码生成（Generator）

### 步骤 2：创建 Parser 框架

实现类似 Subhuti 的框架：
- 装饰器定义规则
- 递归下降解析
- CST 生成
- 错误处理

### 步骤 3：实现 JavaScript Parser

实现 ES5/ES6 Parser：
- 参考 ECMAScript 规范
- 实现所有语法规则
- 生成标准 AST

### 步骤 4：创建 AST 工具

实现 AST 操作工具：
- AST 类型定义
- AST 创建工具
- AST 遍历工具
- 代码生成器

### 步骤 5：扩展自定义语法

基于 JavaScript Parser 扩展：
- 继承 Es6Parser
- 添加自定义语法规则
- 实现 CST → AST 转换
- 实现特殊的转换逻辑

### 步骤 6：集成到构建工具

创建 Vite/Webpack 插件：
- 拦截自定义文件扩展名
- 调用编译器转换
- 返回 JavaScript 代码

---

## 🌟 项目亮点

### 1. 完整的编译器工具链

从词法分析到代码生成，完整实现。

### 2. 可扩展的架构

- Parser 可继承
- AST 可扩展
- 插件可组合

### 3. 类型安全

全程 TypeScript，完整的类型定义。

### 4. 实用的语法

OVS 语法简洁、优雅，类似 Flutter/SwiftUI。

### 5. 与现有生态集成

- 兼容 Vue 3
- 支持 Vite
- 可用 Prettier 格式化

---

## 📊 项目规模

```
总代码行数：约 20,000+ 行
核心模块：
  - Subhuti: ~2,000 行
  - Slime: ~8,000 行
  - OVS: ~3,000 行
  - ObjectScript: ~1,000 行
  - LangServer: ~2,000 行
```

---

## 🎓 学习路径

### 初学者

1. 阅读 `ovs/docs/USAGE_GUIDE.md`
2. 运行示例项目
3. 修改 `hello.ovs` 试验

### 进阶

1. 阅读 `OVS_DESIGN_THINKING.md`
2. 理解编译流程
3. 查看 `OvsCstToSlimeAstUtil.ts` 源码

### 高级

1. 阅读 Subhuti 源码
2. 理解 Parser 生成机制
3. 创建自己的语言扩展

---

## 🔮 未来规划

### 短期
- [ ] 完善语言服务器（LSP）
- [ ] 添加更多语法糖
- [ ] 优化错误提示

### 中期
- [ ] 支持 TypeScript 类型推导
- [ ] 实现 @ovsView 函数
- [ ] 添加组件库

### 长期
- [ ] 完成 Particula 混合架构
- [ ] 支持其他框架（React、Solid.js）
- [ ] 运行时类型系统

---

## 💻 快速开始

### 安装依赖

```bash
npm install
```

### 运行示例

```bash
cd ovs
npm run dev
```

### 运行测试

```bash
cd langServer
npx tsx src/testovsplugin.ts
```

### 查看编译结果

访问 http://localhost:5173/

---

## 🤝 贡献指南

### 代码风格

- 使用 TypeScript
- 每个函数添加注释
- 保持单一职责
- 使用有意义的变量名

### 提交规范

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- refactor: 重构
- test: 测试相关

---

## 📞 联系方式

- GitHub: https://github.com/alamhubb/ovs
- 作者: alamhubb

---

## 📄 许可证

MIT License

---

## 🙏 致谢

感谢所有为编译器技术和开源社区做出贡献的开发者。

---

_用 OOP 语法写 UI，简洁、优雅、统一_ ✨

