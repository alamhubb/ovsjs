# Subhuti

[![npm version](https://img.shields.io/npm/v/subhuti.svg)](https://www.npmjs.com/package/subhuti)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Subhuti (सुभूति)** - 轻量级、高性能的 PEG Parser Generator 框架，用 TypeScript 构建，专为快速开发编程语言解析器而设计。

**名称由来：** Subhuti（菩提祖师）是孙悟空的师父，寓意让编程语言转换如七十二变般灵活。

## ✨ 核心特性

### 🚀 高性能 Packrat Parsing
- **线性时间复杂度 O(n)**：通过 LRU 缓存避免重复解析
- **智能缓存管理**：自动清理过期缓存，内存占用可控
- **可选开关**：根据需求灵活启用/禁用缓存

### 🎯 PEG 风格语法（Parsing Expression Grammar）
- **顺序选择**：`Or` 规则按顺序尝试，第一个成功即返回
- **自动回溯**：失败时自动恢复状态，支持复杂语法
- **清晰语义**：程序员完全控制规则顺序，无二义性

### 🛡️ 智能错误管理（allowError 机制）
- **前 N-1 分支允许失败**：在 `Or` 规则中优雅处理失败
- **最后分支抛详细错误**：精确定位语法错误，附带完整上下文
- **RAII 模式管理**：自动恢复错误状态，避免手动管理

### 🎨 优雅的 TypeScript API
- **装饰器模式**：使用 `@SubhutiRule` 定义规则，代码简洁
- **强类型支持**：完整的 TypeScript 类型定义
- **链式调用**：流畅的 API 设计（`.cache().debug().errorHandler()`）

### 🔧 开发友好
- **调试支持**：内置 Trace Debugger，可视化规则匹配过程
- **错误处理**：详细的错误信息（位置、期望、实际、规则栈）
- **CST 辅助方法**：`getChild()`, `getChildren()`, `getToken()` 等便捷方法

## 📦 安装

```bash
npm install subhuti
# 或
yarn add subhuti
```

## 🚀 快速开始

### 1. 定义 Lexer（词法分析器）

```typescript
import { SubhutiLexer, createKeywordToken, createRegToken } from 'subhuti'

// 定义 Token
const tokens = [
  // 关键字
  createKeywordToken('IfTok', 'if'),
  createKeywordToken('ElseTok', 'else'),
  createKeywordToken('ReturnTok', 'return'),
  
  // 标识符和字面量
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createRegToken('Number', /[0-9]+/),
  
  // 符号
  createKeywordToken('LParen', '('),
  createKeywordToken('RParen', ')'),
  createKeywordToken('Semicolon', ';'),
]

// 创建 Lexer
const lexer = new SubhutiLexer(tokens)

// 分词
const sourceCode = 'if (x) return 42;'
const tokenStream = lexer.tokenize(sourceCode)
```

### 2. 定义 Parser（语法分析器）

```typescript
import { SubhutiParser, SubhutiRule, Subhuti } from 'subhuti'

@Subhuti
class MyParser extends SubhutiParser {
  @SubhutiRule
  Statement() {
    this.Or([
      { alt: () => this.IfStatement() },
      { alt: () => this.ReturnStatement() },
      { alt: () => this.ExpressionStatement() }
    ])
  }
  
  @SubhutiRule
  IfStatement() {
    this.consume('IfTok')
    this.consume('LParen')
    this.Expression()
    this.consume('RParen')
    this.Statement()
    
    // 可选的 else 分支
    this.Option(() => {
      this.consume('ElseTok')
      this.Statement()
    })
  }
  
  @SubhutiRule
  ReturnStatement() {
    this.consume('ReturnTok')
    this.Expression()
    this.consume('Semicolon')
  }
  
  @SubhutiRule
  Expression() {
    // 简化示例
    this.Or([
      { alt: () => this.consume('Identifier') },
      { alt: () => this.consume('Number') }
    ])
  }
  
  @SubhutiRule
  ExpressionStatement() {
    this.Expression()
    this.consume('Semicolon')
  }
}
```

### 3. 解析代码

```typescript
const parser = new MyParser(tokenStream)
  .cache(true)          // 启用 Packrat 缓存
  .debug(false)         // 生产环境关闭调试
  .errorHandler(true)   // 启用详细错误信息

// 解析
const cst = parser.Statement()

// 访问 CST
if (cst) {
  console.log('规则名称:', cst.name)
  console.log('子节点数量:', cst.childCount)
  
  // 使用便捷方法访问
  const condition = cst.getChild('Expression')
  const returnValue = cst.getToken('Number')
}
```

## 📖 核心 API

### Parser 组合器

#### `Or` - 顺序选择（**规则顺序很重要！**）

```typescript
this.Or([
  { alt: () => { /* 长规则：优先尝试 */ } },
  { alt: () => { /* 短规则：作为回退 */ } }
])
```

⚠️ **关键原则**：**长规则必须在短规则前面**

```typescript
// ❌ 错误示例（短规则在前）
ImportSpecifier() {
  this.Or([
    { alt: () => this.ImportedBinding() },        // 短：name
    { alt: () => {                                 // 长：name as userName
      this.Identifier()
      this.AsTok()
      this.ImportedBinding()
    }}
  ])
}
// 问题：遇到 "name as userName" 时，第一个分支匹配 "name" 后立即返回
// 剩余 "as userName" 导致上层规则失败

// ✅ 正确示例（长规则在前）
ImportSpecifier() {
  this.Or([
    { alt: () => {                                 // 长规则优先
      this.Identifier()
      this.AsTok()
      this.ImportedBinding()
    }},
    { alt: () => this.ImportedBinding() }         // 短规则回退
  ])
}
```

#### `Many` - 0 次或多次

```typescript
this.Many(() => {
  this.Statement()
})
```

#### `AtLeastOne` - 1 次或多次

```typescript
this.AtLeastOne(() => {
  this.Parameter()
})
```

#### `Option` - 0 次或 1 次

```typescript
this.Option(() => {
  this.ElseClause()
})
```

### CST 辅助方法

```typescript
// 获取第 N 个指定名称的子节点
const leftExpr = cst.getChild('Expression', 0)
const rightExpr = cst.getChild('Expression', 1)

// 获取所有指定名称的子节点
const allStatements = cst.getChildren('Statement')

// 获取 Token 节点
const identifier = cst.getToken('Identifier')
console.log(identifier?.value)  // token 的值

// 检查是否存在子节点
if (cst.hasChild('ElseClause')) {
  // 处理 else 分支
}

// 属性
cst.childCount  // 子节点数量
cst.isToken     // 是否为 token 节点
cst.isEmpty     // 是否为空节点
```

### 功能开关（链式调用）

```typescript
const parser = new MyParser(tokenStream)
  .cache(true)          // 启用 Packrat 缓存（默认开启）
  .debug(true)          // 启用调试输出
  .errorHandler(true)   // 启用详细错误信息
```

## 🎯 核心概念

### 1. PEG 顺序选择 vs 传统最长匹配

| 特性 | Subhuti (PEG) | 传统 LR/LALR |
|------|---------------|--------------|
| 匹配策略 | **第一个成功** | 最长匹配 |
| 规则顺序 | ⭐⭐⭐ **关键** | 不重要 |
| 回溯 | ✅ 支持 | ❌ 不支持 |
| 二义性处理 | 程序员控制 | 自动检测/报错 |
| 性能 | 快（Packrat缓存） | 中等 |

### 2. allowError 机制（智能错误管理）

在 `Or` 规则中：
- **前 N-1 分支**：允许失败，失败时返回 `undefined`（不抛异常）
- **最后分支**：失败时抛出详细错误（精确定位问题）

```typescript
Or([
  { alt: () => { /* 分支1：失败 → undefined */ } },
  { alt: () => { /* 分支2：失败 → undefined */ } },
  { alt: () => { /* 分支3：失败 → 抛异常！ */ } }
])
```

### 3. Packrat Parsing（记忆化解析）

Subhuti 使用 **LRU 缓存** 避免重复解析：

```typescript
// 同一位置的规则只解析一次
Expression()  // 首次解析，耗时 10ms
              // 缓存结果：{ success: true, endTokenIndex: 5, cst: ... }

Expression()  // 再次调用，直接返回缓存，耗时 < 1ms
```

**性能提升**：
- 复杂语法：5-10x 加速
- 递归规则：100x+ 加速（避免指数级时间复杂度）

## 📊 与其他工具对比

| 工具 | Subhuti | ANTLR | PEG.js | Chevrotain |
|------|---------|-------|--------|------------|
| **语言** | TypeScript | Java/多语言 | JavaScript | TypeScript |
| **风格** | PEG | LL(*) | PEG | LL(k) |
| **定义方式** | 装饰器 | 独立语法文件 | 独立语法文件 | TypeScript API |
| **回溯** | ✅ | ❌ | ✅ | ❌ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **调试** | 内置 | 外部工具 | 中等 | 良好 |

## 🎓 最佳实践

### ✅ 推荐

1. **长规则优先**：在 `Or` 中始终把长规则放在前面
2. **添加注释**：说明每个 `Or` 分支的用途和长度
3. **使用 Option**：比 `Or` 更清晰地表达可选部分
4. **启用缓存**：生产环境保持 `.cache(true)`
5. **拆分复杂规则**：提高可读性和可维护性

### ❌ 避免

1. **短规则在前**：会导致解析失败（最常见错误）
2. **复杂的 Or 嵌套**：难以理解和调试
3. **过度回溯**：影响性能，优化分支顺序

### 📝 代码风格建议

```typescript
// ✅ 推荐：清晰的注释和结构
PropertyDefinition() {
  this.Or([
    // 长规则：{ key: value }
    { alt: () => {
      this.PropertyName()
      this.Colon()
      this.AssignmentExpression()
    }},
    // 中规则：方法定义
    { alt: () => this.MethodDefinition() },
    // 短规则：{ key } 简写
    { alt: () => this.IdentifierReference() }
  ])
}

// 或者使用 Option 简化
PropertyDefinition() {
  this.PropertyName()
  this.Option(() => {
    this.Colon()
    this.AssignmentExpression()
  })
}
```

## 🔍 调试技巧

### 1. 启用调试输出

```typescript
const parser = new MyParser(tokenStream).debug(true)
const cst = parser.Statement()
// 输出：
// → RuleEnter: Statement (tokenIndex: 0)
//   → OrBranch: 1/3
//   → RuleEnter: IfStatement (tokenIndex: 0)
//   ✓ TokenConsume: IfTok "if"
//   ...
```

### 2. 检查 CST 结构

```typescript
console.log(JSON.stringify(cst, null, 2))
```

### 3. 查看错误详情

```typescript
try {
  const cst = parser.Statement()
} catch (error) {
  console.error('解析失败:', error.message)
  console.error('位置:', error.position)
  console.error('期望:', error.expected)
  console.error('实际:', error.found)
  console.error('规则栈:', error.ruleStack)
}
```

## 🎯 实际应用

### Slime 项目
使用 Subhuti 构建完整的 JavaScript ES5/ES6 解析器：
- ✅ 支持所有核心语法（import/export、箭头函数、模板字符串等）
- ✅ CST → AST 转换
- ✅ 代码生成和 Source Map

## 📄 License

MIT © [alamhubb](https://github.com/alamhubb)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Subhuti** - 让语言转换如七十二变般灵活 🎭

