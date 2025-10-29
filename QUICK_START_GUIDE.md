# 快速复现指南：从零创建一个类似的编译器项目

## 🎯 目标

创建一个自定义语言，编译为 JavaScript，并集成到 Vite。

## 📋 前置知识

### 必需
- TypeScript 基础
- 编译原理基础（词法分析、语法分析）
- AST（抽象语法树）概念

### 推荐
- 递归下降解析
- 装饰器模式
- Vite 插件开发

---

## 🏗️ 架构设计

### 核心模块

```
1. Parser 框架 (类似 Subhuti)
   ├─ 装饰器定义规则
   ├─ 递归下降解析
   └─ CST 生成

2. AST 工具链 (类似 Slime)
   ├─ AST 类型定义
   ├─ CST → AST 转换
   └─ AST → 代码生成

3. 语言实现 (类似 OVS)
   ├─ 继承基础 Parser
   ├─ 添加自定义语法
   └─ 实现转换逻辑

4. 构建工具集成 (Vite Plugin)
   ├─ 拦截文件
   ├─ 调用编译器
   └─ 返回 JavaScript
```

---

## 🚀 实现步骤

### 阶段 1：创建 Parser 框架（2-3 周）

#### 1.1 定义基础类

```typescript
// SubhutiParser.ts
export class SubhutiParser<T extends TokenConsumer> {
  protected tokenConsumer: T
  protected tokens: Token[]
  protected currentIndex: number = 0
  
  constructor(tokens: Token[], TokenConsumerClass) {
    this.tokens = tokens
    this.tokenConsumer = new TokenConsumerClass(this)
  }
  
  // 核心方法
  protected Or(alternatives: Alternative[]) { }
  protected Many(rule: () => void) { }
  protected Option(rule: () => void) { }
  protected Consume(tokenType: string) { }
}
```

#### 1.2 实现装饰器

```typescript
// SubhutiRule 装饰器
export function SubhutiRule(target: any, propertyKey: string) {
  // 将方法标记为规则
  // 自动生成 CST
}

// Subhuti 类装饰器
export function Subhuti(constructor: Function) {
  // 初始化 Parser
  // 收集所有规则
}
```

#### 1.3 实现 CST 生成

```typescript
export class SubhutiCst {
  name: string          // 规则名称
  value?: string        // Token 值
  children?: SubhutiCst[]  // 子节点
  loc?: SourceLocation  // 位置信息
}
```

**关键点：**
- 每个规则调用生成一个 CST 节点
- 自动记录位置信息
- 支持错误恢复

---

### 阶段 2：创建 AST 工具链（3-4 周）

#### 2.1 定义 AST 类型

```typescript
// 基于 ESTree 标准
export interface Program {
  type: 'Program'
  body: Statement[]
  sourceType: 'module' | 'script'
}

export interface ExpressionStatement {
  type: 'ExpressionStatement'
  expression: Expression
}

// ... 定义所有 ES6 节点类型
```

#### 2.2 实现 JavaScript Parser

```typescript
@Subhuti
export class Es5Parser extends SubhutiParser {
  @SubhutiRule
  Program() {
    this.Many(() => this.Statement())
  }
  
  @SubhutiRule
  Statement() {
    this.Or([
      {alt: () => this.VariableDeclaration()},
      {alt: () => this.ExpressionStatement()},
      {alt: () => this.IfStatement()},
      // ... 所有语句类型
    ])
  }
  
  @SubhutiRule
  Expression() {
    // 表达式规则
  }
}

@Subhuti
export class Es6Parser extends Es5Parser {
  @SubhutiRule
  ArrowFunction() {
    // ES6 箭头函数
  }
  
  @SubhutiRule
  ClassDeclaration() {
    // ES6 类声明
  }
}
```

#### 2.3 实现 CST → AST 转换

```typescript
export class CstToAst {
  toProgram(cst: SubhutiCst): Program {
    return {
      type: 'Program',
      body: this.createStatementListAst(cst.children[0]),
      sourceType: 'module'
    }
  }
  
  createExpressionStatementAst(cst: SubhutiCst): ExpressionStatement {
    return {
      type: 'ExpressionStatement',
      expression: this.createExpressionAst(cst.children[0])
    }
  }
  
  // ... 为每种 CST 节点实现转换方法
}
```

#### 2.4 实现代码生成器

```typescript
export class Generator {
  private static code: string = ''
  
  static generate(ast: Program): string {
    this.code = ''
    this.generateProgram(ast)
    return this.code
  }
  
  private static generateNode(node: Node) {
    switch (node.type) {
      case 'Program':
        return this.generateProgram(node)
      case 'ExpressionStatement':
        return this.generateExpressionStatement(node)
      // ... 为每种节点类型实现生成方法
    }
  }
}
```

---

### 阶段 3：实现自定义语言（2-3 周）

#### 3.1 定义自定义语法

```typescript
@Subhuti
export class MyParser extends Es6Parser {
  @SubhutiRule
  MyCustomSyntax() {
    this.tokenConsumer.Identifier()  // 元素名
    this.tokenConsumer.LBrace()      // {
    this.Option(() => {
      this.StatementList()           // 内容
    })
    this.tokenConsumer.RBrace()      // }
  }
  
  // 重写 AssignmentExpression，支持自定义语法
  @SubhutiRule
  AssignmentExpression() {
    this.Or([
      {alt: () => this.MyCustomSyntax()},  // 新增
      {alt: () => super.AssignmentExpression()}  // 原有
    ])
  }
}
```

#### 3.2 实现转换逻辑

```typescript
export class MyCstToAst extends CstToAst {
  // 添加计数器
  private myCustomDepth = 0
  
  // 重写 ExpressionStatement
  createExpressionStatementAst(cst: SubhutiCst) {
    if (this.myCustomDepth > 0) {
      // 在自定义语法内，特殊处理
      return this.createSpecialStatement(cst)
    } else {
      // 正常处理
      return super.createExpressionStatementAst(cst)
    }
  }
  
  // 处理自定义语法
  createMyCustomSyntaxAst(cst: SubhutiCst) {
    this.myCustomDepth++
    try {
      // 转换逻辑
      const body = this.createStatementListAst(...)
      return this.wrapAsIIFE(body)
    } finally {
      this.myCustomDepth--
    }
  }
}
```

#### 3.3 关键技术：计数器机制

**为什么需要计数器？**
```javascript
// 问题：如何知道当前是否在 custom { } 内部？
custom {
  123  // 需要特殊处理
}

function normal() {
  456  // 不需要特殊处理
}
```

**解决方案：**
```typescript
// 进入 custom { } 时 +1
// 退出时 -1
// 当 > 0 时，说明在内部
```

---

### 阶段 4：创建 Vite 插件（1 周）

#### 4.1 插件结构

```typescript
export function vitePluginMy(): Plugin {
  return {
    name: 'vite-plugin-my',
    enforce: 'pre',
    
    async transform(code, id) {
      // 只处理 .my 文件
      if (!id.endsWith('.my')) {
        return
      }
      
      // 编译
      const result = await compile(code, id)
      
      return {
        code: result.code,
        map: result.map
      }
    }
  }
}
```

#### 4.2 编译函数

```typescript
async function compile(code: string, filename: string) {
  // 1. 词法分析
  const tokens = lexer.lex(code)
  
  // 2. 语法分析
  const cst = parser.parse(tokens)
  
  // 3. AST 转换
  let ast = cstToAst.toProgram(cst)
  
  // 4. 添加必要的 import
  ast = ensureImports(ast)
  
  // 5. 代码生成
  const result = generator.generate(ast)
  
  // 6. 格式化（可选）
  result.code = await prettier.format(result.code)
  
  return result
}
```

---

## 🎨 核心设计模式

### 1. 装饰器模式

```typescript
@Subhuti
class MyParser {
  @SubhutiRule
  MyRule() { }
}
```

### 2. 访问者模式

```typescript
// CST → AST 转换
class Visitor {
  visit(node: CstNode): AstNode {
    switch (node.type) {
      case 'Expression':
        return this.visitExpression(node)
      // ...
    }
  }
}
```

### 3. 策略模式

```typescript
// 不同的转换策略
if (this.inCustomSyntax) {
  return this.customStrategy(node)
} else {
  return this.normalStrategy(node)
}
```

### 4. 工厂模式

```typescript
// AST 节点创建
class AstUtil {
  static createExpression(...) { }
  static createStatement(...) { }
}
```

---

## 🔧 关键技术细节

### 1. 如何支持继承？

```typescript
// 子类可以调用父类的规则
class ChildParser extends ParentParser {
  @SubhutiRule
  MyRule() {
    this.ParentRule()  // 调用父类规则
  }
}
```

### 2. 如何处理嵌套？

```typescript
// 使用计数器 + IIFE
depth++
try {
  // 生成 IIFE
  (function() {
    const children = []  // 新作用域
    // ...
  })()
} finally {
  depth--
}
```

### 3. 如何保持控制流？

```typescript
// 不是提取所有表达式
// 而是保留语句结构，只转换表达式

if (condition) {        // 保留 if
  expression           // 转换为 children.push()
}
```

### 4. 如何集成到 Vue？

```typescript
// 生成 Vue 兼容的代码
OvsAPI.createVNode('div', children)
// 等价于 Vue 的 h('div', children)
```

---

## 📚 推荐阅读顺序

### 第一天：理解整体架构
1. 阅读本文档
2. 查看 `PROJECT_OVERVIEW.md`
3. 运行示例项目

### 第二天：理解编译流程
1. 阅读 `OVS_RENDER_DOM_VIEW_DECLARATION.md`
2. 调试 `testovsplugin.ts`
3. 查看生成的代码

### 第三天：深入源码
1. 阅读 `OvsParser.ts`
2. 阅读 `OvsCstToSlimeAstUtil.ts`
3. 理解计数器机制

### 第四天：扩展实验
1. 修改 `hello.ovs`
2. 添加新的语法规则
3. 实现自己的转换逻辑

---

## 🎓 关键代码片段

### 1. Parser 定义

```typescript
@Subhuti
export class OvsParser extends Es6Parser {
  @SubhutiRule
  OvsRenderDomViewDeclaration() {
    this.tokenConsumer.Identifier()  // div
    this.tokenConsumer.LBrace()      // {
    this.Option(() => {
      this.StatementList()           // 内容
    })
    this.tokenConsumer.RBrace()      // }
  }
}
```

### 2. 计数器机制

```typescript
export class OvsCstToSlimeAst extends SlimeCstToAst {
  private ovsRenderDomViewDepth = 0
  
  createOvsRenderDomViewDeclarationAst(cst) {
    this.ovsRenderDomViewDepth++
    try {
      const body = this.createStatementListAst(...)
      return this.createIIFE(body)
    } finally {
      this.ovsRenderDomViewDepth--
    }
  }
  
  createExpressionStatementAst(cst) {
    if (this.ovsRenderDomViewDepth > 0) {
      // 转换为 children.push()
    } else {
      // 保持原样
    }
  }
}
```

### 3. Vite 插件

```typescript
export default function vitePluginOvs(): Plugin {
  return {
    name: 'vite-plugin-ovs',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.ovs')) return
      
      const result = await compile(code, id)
      return { code: result.code }
    }
  }
}
```

---

## 🎯 最小可行产品（MVP）

### 功能清单

#### 阶段 1：基础功能（1 个月）
- [x] 词法分析器
- [x] 语法分析器
- [x] CST 生成
- [x] 基础 AST 转换
- [x] 代码生成

#### 阶段 2：核心功能（1 个月）
- [x] 自定义语法支持
- [x] 计数器机制
- [x] IIFE 生成
- [x] 控制流支持

#### 阶段 3：工具集成（2 周）
- [x] Vite 插件
- [x] Prettier 集成
- [x] Source Map（部分）

#### 阶段 4：完善（1 个月）
- [x] 错误处理
- [x] 文档完善
- [ ] 测试覆盖
- [ ] 性能优化

---

## 💡 核心技巧

### 1. 继承 JavaScript Parser

**不要从零实现 JavaScript Parser！**

- 复用现有的 ES5/ES6 Parser
- 只添加自定义语法
- 节省 90% 的工作量

### 2. 使用计数器而非递归

**不要递归处理每种语句类型！**

- 使用计数器标记状态
- 只在需要的地方判断
- 代码简单、性能好

### 3. AST 操作而非字符串

**不要用正则处理代码！**

- 使用 AST 操作
- 类型安全
- 不易出错

### 4. 在合适的层次处理

**单一职责：**
- Parser 层：语法转换
- 插件层：文件包装
- 生成器层：代码生成

---

## 🐛 常见问题

### Q1: 如何处理嵌套？

**A:** 使用 IIFE 创建新作用域，自动隔离变量。

### Q2: 如何保持控制流？

**A:** 不提取表达式，而是在原地转换。

### Q3: 如何支持 TypeScript？

**A:** 扩展 Parser 支持 TypeScript 语法，或使用 TypeScript Compiler API。

### Q4: 性能如何优化？

**A:** 
- 编译时处理，运行时无开销
- 缓存编译结果
- 增量编译

### Q5: 如何调试？

**A:**
- 打印 CST/AST 查看结构
- 对比生成的代码
- 使用 Source Map

---

## 📊 工作量估算

### 完整项目（3-4 个月）

| 模块 | 工作量 | 难度 |
|------|--------|------|
| Parser 框架 | 2-3 周 | ⭐⭐⭐⭐ |
| JavaScript Parser | 3-4 周 | ⭐⭐⭐⭐⭐ |
| AST 工具 | 2-3 周 | ⭐⭐⭐ |
| 自定义语法 | 2-3 周 | ⭐⭐⭐⭐ |
| 代码生成 | 2-3 周 | ⭐⭐⭐ |
| Vite 集成 | 1 周 | ⭐⭐ |
| 测试和文档 | 2-3 周 | ⭐⭐ |

### 简化版（1-2 个月）

- 使用现有的 JavaScript Parser（如 Babel、Acorn）
- 只实现自定义语法部分
- 使用 Babel 插件而非完整编译器

---

## 🎁 可复用的代码

### 从本项目可以直接复用：

1. **Subhuti 框架**：完整的 Parser 生成器
2. **Slime 工具链**：JavaScript AST 操作
3. **计数器机制**：状态管理模式
4. **IIFE 生成**：作用域隔离技术
5. **Vite 插件模板**：文件处理框架

### 需要自己实现：

1. **自定义语法规则**：根据需求设计
2. **转换逻辑**：根据目标语言实现
3. **运行时 API**：根据框架实现

---

## 🚦 开始你的项目

### 1. 克隆并研究

```bash
git clone <this-repo>
cd test-volar
npm install
cd ovs
npm run dev
```

### 2. 修改和实验

- 修改 `ovs/example/src/views/hello.ovs`
- 查看编译结果
- 理解转换过程

### 3. 创建自己的语法

- 复制 `ovs/` 目录
- 重命名为你的语言名称
- 修改 Parser 规则
- 实现转换逻辑

### 4. 测试和完善

- 编写测试用例
- 处理边界情况
- 优化性能
- 完善文档

---

## 🎉 总结

### 核心价值

这个项目展示了：
1. **如何创建一个完整的编译器**
2. **如何扩展 JavaScript 语法**
3. **如何集成到现代构建工具**
4. **如何设计可扩展的架构**

### 适用场景

- 创建 DSL（领域特定语言）
- 扩展 JavaScript 语法
- 实现模板语言
- 创建配置语言
- 实现代码转换工具

### 学习收获

- 编译原理实践
- AST 操作技巧
- 设计模式应用
- 工程架构设计

---

## 📞 获取帮助

如果你在复现过程中遇到问题：

1. 查看文档：`ovs/docs/`
2. 运行测试：`langServer/src/testovsplugin.ts`
3. 查看示例：`ovs/example/`
4. 阅读源码：从 `ovs/src/index.ts` 开始

---

**祝你成功创建自己的编译器项目！** 🚀

