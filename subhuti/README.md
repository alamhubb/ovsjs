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
- **问题检测系统**：运行时检测左递归、无限循环等常见错误 ⭐ 新功能
- **语法验证**：自动检测 Or 规则冲突（前缀遮蔽、空路径）⭐ 新功能
- **CST 辅助方法**：`getChild()`, `getChildren()`, `getToken()` 等便捷方法
- **Token 前瞻**：完整支持 ECMAScript 规范的所有 `[lookahead ...]` 约束 ⭐ 新功能

## 📦 安装

```bash
npm install subhuti
# 或
yarn add subhuti
```

## 🚀 快速开始

### 1. 定义 Lexer（词法分析器）

```typescript
import { SubhutiLexer, createKeywordToken, createRegToken, createValueRegToken } from 'subhuti'

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

  // 跳过空格和注释（skip: true）
  createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
  createValueRegToken('Comment', /\/\/[^\n]*/, '', true),
]

// 创建 Lexer
const lexer = new SubhutiLexer(tokens)

// 分词
const sourceCode = 'if (x) return 42;'
const tokenStream = lexer.tokenize(sourceCode)
```

### 2. 定义 TokenConsumer（可选，简化 token 消费）

```typescript
import { SubhutiTokenConsumer } from 'subhuti'

// 自定义 TokenConsumer，为每个 token 创建便捷方法
class MyTokenConsumer extends SubhutiTokenConsumer {
  IfTok() { return this.consume(tokens.find(t => t.name === 'IfTok')!) }
  ElseTok() { return this.consume(tokens.find(t => t.name === 'ElseTok')!) }
  ReturnTok() { return this.consume(tokens.find(t => t.name === 'ReturnTok')!) }
  Identifier() { return this.consume(tokens.find(t => t.name === 'Identifier')!) }
  Number() { return this.consume(tokens.find(t => t.name === 'Number')!) }
  LParen() { return this.consume(tokens.find(t => t.name === 'LParen')!) }
  RParen() { return this.consume(tokens.find(t => t.name === 'RParen')!) }
  Semicolon() { return this.consume(tokens.find(t => t.name === 'Semicolon')!) }
}
```

### 3. 定义 Parser（语法分析器）

```typescript
import { SubhutiParser, SubhutiRule, Subhuti } from 'subhuti'

@Subhuti
class MyParser extends SubhutiParser<MyTokenConsumer> {
  constructor(tokens) {
    super(tokens, MyTokenConsumer)  // 传入自定义 TokenConsumer
  }

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
    this.tokenConsumer.IfTok()      // 使用 TokenConsumer 的便捷方法
    this.tokenConsumer.LParen()
    this.Expression()
    this.tokenConsumer.RParen()
    this.Statement()

    // 可选的 else 分支
    this.Option(() => {
      this.tokenConsumer.ElseTok()
      this.Statement()
    })
  }

  @SubhutiRule
  ReturnStatement() {
    this.tokenConsumer.ReturnTok()
    this.Expression()
    this.tokenConsumer.Semicolon()
  }

  @SubhutiRule
  Expression() {
    // 简化示例
    this.Or([
      { alt: () => this.tokenConsumer.Identifier() },
      { alt: () => this.tokenConsumer.Number() }
    ])
  }

  @SubhutiRule
  ExpressionStatement() {
    this.Expression()
    this.tokenConsumer.Semicolon()
  }
}
```

### 4. 解析代码

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

  // 访问位置信息（用于错误报告、源码映射）
  console.log('位置:', cst.loc.start.line, cst.loc.start.column)
}
```

## 📖 核心能力

### Lexer 高级特性

#### 词法层前瞻（Lexical Lookahead）

处理词法歧义，如 `?.` (可选链) vs `?` (三元运算符)：

```typescript
import { createValueRegToken } from 'subhuti'

const tokens = [
  // 可选链：?. 后面不能是数字
  createValueRegToken('OptionalChaining', /\?\./, '?.', false, {
    not: /[0-9]/  // lookaheadAfter: 后面不能是数字
  }),

  // 三元运算符
  createKeywordToken('Question', '?'),
  createKeywordToken('Dot', '.'),
]

// 代码: "obj?.prop" → OptionalChaining
// 代码: "a ? .5 : 1" → Question, Dot, Number
```

#### 模板字符串支持

自动处理 ECMAScript 的 InputElement 切换：

```typescript
// Lexer 自动识别模板字符串的上下文
const code = '`Hello ${name}!`'
const tokens = lexer.tokenize(code)
// → TemplateHead(`Hello ${`), Identifier(name), TemplateTail(`}!`)
```

#### 跳过 Token

自动过滤空格、注释等：

```typescript
createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),  // skip: true
createValueRegToken('LineComment', /\/\/[^\n]*/, '', true),
createValueRegToken('BlockComment', /\/\*[\s\S]*?\*\//, '', true),
```

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

### Token 前瞻（Lookahead）

Subhuti 提供了强大的 Token 前瞻功能，对应 ECMAScript 规范中的 `[lookahead ...]` 约束。

#### 查询方法（用于条件判断）

```typescript
// 检查下一个 token 是否匹配
if (this.lookahead('LBrace', 1)) {
  // 下一个是 {
}

// 检查下一个 token 是否不匹配
if (this.lookaheadNot('ElseTok', 1)) {
  // 下一个不是 else
}

// 检查是否在集合中
if (this.lookaheadIn(['FunctionTok', 'ClassTok'], 1)) {
  // 下一个是 function 或 class
}

// 检查是否不在集合中
if (this.lookaheadNotIn(['LBrace', 'FunctionTok'], 1)) {
  // 下一个既不是 { 也不是 function
}

// 检查 token 序列
if (this.lookaheadSequence(['AsyncTok', 'FunctionTok'])) {
  // 接下来是 async function
}

// 检查序列且中间无换行符
if (this.lookaheadSequenceNoLT(['AsyncTok', 'FunctionTok'])) {
  // async [no LineTerminator here] function
}
```

#### 断言方法（用于前瞻约束）

断言方法会自动设置解析状态，失败时标记当前分支失败：

```typescript
@SubhutiRule
ExpressionStatement() {
  // [lookahead ∉ {{, function, class}]
  this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])

  // [lookahead ≠ let []
  this.assertLookaheadNotSequence(['LetTok', 'LBracket'])

  this.Expression({ In: true })
  this.SemicolonASI()
}

@SubhutiRule
ArrowFunction() {
  this.AsyncTok()

  // [no LineTerminator here]
  this.assertNoLineBreak()

  this.ArrowParameters()
}
```

**对应 ECMAScript 规范：**
- `[lookahead = token]` → `assertLookahead('token')`
- `[lookahead ≠ token]` → `assertLookaheadNot('token')`
- `[lookahead ∈ {t1, t2}]` → `assertLookaheadIn(['t1', 't2'])`
- `[lookahead ∉ {t1, t2}]` → `assertLookaheadNotIn(['t1', 't2'])`
- `[lookahead = t1 t2]` → `assertLookaheadSequence(['t1', 't2'])`
- `[lookahead ≠ t1 t2]` → `assertLookaheadNotSequence(['t1', 't2'])`
- `[no LineTerminator here]` → `assertNoLineBreak()`

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

### 位置信息（Source Location）

每个 CST 节点都包含完整的位置信息，用于错误报告和源码映射：

```typescript
const cst = parser.Statement()

// 访问位置信息
console.log(cst.loc.start)  // { index: 0, line: 1, column: 0 }
console.log(cst.loc.end)    // { index: 15, line: 1, column: 15 }

// Token 节点还包含值
const identifier = cst.getToken('Identifier')
console.log(identifier?.value)  // token 的文本值
console.log(identifier?.loc.start.line)  // token 所在行号
```

### 自定义失败标记（parserFail）

在自定义验证逻辑中标记解析失败：

```typescript
@SubhutiRule
Identifier() {
  const cst = this.tokenConsumer.Identifier()

  // 自定义验证：保留字检查
  if (cst && ReservedWords.has(cst.value!)) {
    return this.parserFail()  // 标记失败，触发回溯
  }

  return cst
}
```

### 动态更换 Token 流

重用 Parser 实例解析多个文件：

```typescript
const parser = new MyParser([])

// 解析第一个文件
parser.setTokens(lexer.tokenize(code1))
const cst1 = parser.Script()

// 解析第二个文件
parser.setTokens(lexer.tokenize(code2))
const cst2 = parser.Script()
```

### 功能开关（链式调用）

```typescript
const parser = new MyParser(tokenStream)
  .cache(true)          // 启用 Packrat 缓存（默认开启）
  .debug(true)          // 启用调试输出
  .errorHandler(true)   // 启用详细错误信息
```

### 语法验证（Grammar Validation）⭐ 新功能

**自动检测 Or 规则冲突**，避免短规则遮蔽长规则的问题！

```typescript
// 检查语法是否正确
const result = parser.validateGrammar()

if (!result.success) {
  console.error('发现语法冲突:', result.errors)
  // [
  //   {
  //     level: 'ERROR',
  //     type: 'prefix-conflict',
  //     ruleName: 'Expression',
  //     branchIndices: [0, 1],
  //     conflictPaths: {
  //       pathA: 'Identifier,',               // 短路径
  //       pathB: 'Identifier,Dot,Identifier,' // 长路径（被遮蔽）
  //     },
  //     message: '分支 1 (MemberExpression) 被分支 0 (Identifier) 遮蔽',
  //     suggestion: '将 MemberExpression 移到 Identifier 前面'
  //   }
  // ]
}

// 严格模式（发现错误就抛出异常）
parser.validateGrammar({ strict: true })

// 详细输出（打印所有错误）
parser.validateGrammar({ verbose: true })

// 忽略特定规则
parser.validateGrammar({ ignoreRules: ['LegacyRule'] })
```

**检测规则：**
1. **空路径冲突（FATAL）**：`Option`/`Many` 在 Or 第一个分支，导致后续分支不可达
2. **前缀冲突（ERROR）**：短规则在前，遮蔽长规则

**推荐使用场景：**
- ✅ 开发阶段：在测试中自动验证语法
- ✅ CI/CD：防止错误的规则顺序合入代码
- ✅ 重构：确保修改不引入冲突

```typescript
// 示例：在测试中使用
describe('Parser Grammar', () => {
  it('should not have Or conflicts', () => {
    const parser = new MyParser([])
    const result = parser.validateGrammar()
    expect(result.success).toBe(true)
  })
})
```

## 🔬 Or 冲突检测系统 - 核心设计

Subhuti 的 Or 冲突检测系统是一个创新的静态分析工具，能够在开发阶段自动发现 PEG 语法中的常见问题。

### 设计理念

**问题**：PEG 的顺序选择特性使得规则顺序至关重要，但手动检查所有 Or 规则非常困难且容易出错。

**解决方案**：通过 AST 分析和路径展开，自动检测 Or 分支之间的冲突。

### 核心算法

#### 1. AST 收集（Rule Collection）

使用 Proxy 拦截规则调用，自动构建语法的 AST 表示：

```typescript
// 自动收集规则定义
const ruleASTs = SubhutiRuleCollector.collectRules(parser)

// 生成的 AST 结构
{
  "Expression": {
    type: "or",
    alternatives: [
      { type: "subrule", ruleName: "PrimaryExpression" },
      { type: "subrule", ruleName: "BinaryExpression" }
    ]
  }
}
```

**关键技术**：
- Proxy 拦截：无需修改 Parser 代码
- 错误容忍：即使规则执行失败也能收集 AST
- 完整性：捕获所有规则调用（Or、Many、Option、Sequence 等）

#### 2. 分支展开（Branch Expansion）

将每个 Or 分支展开为所有可能的 token 路径：

```typescript
// 规则定义
Or([
  { alt: () => {
    this.Identifier()
    this.Option(() => this.Dot())
    this.Identifier()
  }},
  { alt: () => this.Number() }
])

// 展开结果
分支 0: [
  ["Identifier", "Identifier"],      // 不匹配 Dot
  ["Identifier", "Dot", "Identifier"] // 匹配 Dot
]
分支 1: [
  ["Number"]
]
```

**展开策略**：
- **Token/Rule**：不展开，保持原样
- **Sequence**：笛卡尔积组合所有子节点
- **Or**：合并所有分支
- **Option/Many**：生成空路径 + 内部分支
- **AtLeastOne**：生成 1次 + 2次重复

**层级控制**：
```typescript
// 支持多层展开
getExpandChildren(ruleName, maxLevel, curLevel)

// 示例：maxLevel = 2
Rule1 → Rule2 → Token  // 展开 2 层
Rule1 → Rule2 → Rule3  // 第 3 层停止，保留 Rule3
```

#### 3. 冲突检测（Conflict Detection）

##### 3.1 前缀冲突检测

检测短规则是否遮蔽长规则：

```typescript
// 检测逻辑
for (pathA of branchA) {
  for (pathB of branchB) {
    if (pathA.length < pathB.length && pathB.startsWith(pathA)) {
      // 发现前缀冲突！
      // pathA 会先匹配，导致 pathB 永远无法完整匹配
    }
  }
}
```

**示例**：
```typescript
Or([
  { alt: () => this.Identifier() },           // 分支 0: ["Identifier"]
  { alt: () => {                              // 分支 1: ["Identifier", "Dot", "Identifier"]
    this.Identifier()
    this.Dot()
    this.Identifier()
  }}
])

// 检测结果：
// ❌ 分支 1 被分支 0 遮蔽
// Path A: Identifier,
// Path B: Identifier,Dot,Identifier,
```

##### 3.2 空路径冲突检测（顶层检测）

检测 Or 分支本身是否可以匹配空输入：

```typescript
/**
 * 顶层空路径检测 - 只检测分支的顶层结构
 *
 * 真正的问题：
 * Or([
 *   { alt: () => this.Option(() => this.A()) },  // ❌ 分支本身可以为空
 *   { alt: () => this.B() }                       // 永远不可达
 * ])
 *
 * 不是问题：
 * Or([
 *   { alt: () => {
 *     this.X()                                    // ✅ 必须先匹配 X
 *     this.Option(() => this.A())                 // 内部的 Option 不影响
 *   }},
 *   { alt: () => this.B() }
 * ])
 */
hasTopLevelEmptyPath(alternative) {
  switch (alternative.type) {
    case 'option':
    case 'many':
      return true  // 直接是 Option/Many，可以为空

    case 'sequence':
      // 检查第一个元素
      return this.hasTopLevelEmptyPath(alternative.nodes[0])

    case 'or':
      // 任一子分支可以为空
      return alternative.alternatives.some(alt =>
        this.hasTopLevelEmptyPath(alt)
      )

    default:
      return false  // token/rule/atLeastOne 不能为空
  }
}
```

**关键区别**：
- ❌ **旧逻辑**：检测展开后的路径中是否有空路径（误报）
- ✅ **新逻辑**：只检测分支顶层结构是否可以为空（精准）

#### 4. 代码复用设计

通过提取公共方法，实现代码复用：

```typescript
/**
 * 公共方法：计算 Or 分支的完全展开结果
 *
 * 被以下检测共用：
 * - 空路径检测
 * - 前缀冲突检测
 * - 未来的其他检测（LL(k)、二义性等）
 */
computeOrBranchExpansions(alternatives) {
  // 步骤1: 获取直接子节点（展开辅助节点）
  const directChildren = computeDirectChildren(alternative)

  // 步骤2: 对每个规则从缓存中获取展开结果
  const expandedItems = branch.map(item =>
    getExpansionFromCache(item) || [[item]]
  )

  // 步骤3: 笛卡尔积合并
  return cartesianProduct(expandedItems)
}

// 使用公共方法
detectOrConflicts(alternatives) {
  const branchExpansions = computeOrBranchExpansions(alternatives)

  // 执行各种检测
  checkEmptyPath(branchExpansions)
  checkPrefixConflict(branchExpansions)
}
```

**优势**：
- 数据计算逻辑统一
- 添加新检测类型时直接复用
- 修改展开逻辑时所有检测自动受益

### 性能优化

#### 1. 缓存机制

```typescript
// 直接子节点缓存
directChildrenCache: Map<ruleName, branches>

// 完全展开缓存
expansionCache: Map<ruleName, expandedBranches>
```

#### 2. 循环引用检测

```typescript
// 使用 computing 集合检测递归
computing: Set<ruleName>

getExpandChildren(ruleName) {
  if (computing.has(ruleName)) {
    return [[ruleName]]  // 遇到循环，停止展开
  }
  computing.add(ruleName)
  try {
    // 展开逻辑
  } finally {
    computing.delete(ruleName)
  }
}
```

#### 3. 分支数量限制

防止笛卡尔积爆炸：

```typescript
// 限制单个规则的分支数
if (branches.length > 1000) {
  console.warn(`规则 ${ruleName} 的分支数过多，截断`)
  return branches.slice(0, 1000)
}

// 限制展开结果数量
if (expandedBranches.length > 1000) {
  return expandedBranches.slice(0, 1000)
}
```

### 错误级别

- **FATAL**：空路径冲突 - 导致后续分支完全不可达
- **ERROR**：前缀冲突 - 导致长规则无法完整匹配
- **WARNING**：（未来）潜在性能问题

### 使用建议

**开发阶段**：
```typescript
// 在测试中自动验证
describe('Grammar Validation', () => {
  it('should not have Or conflicts', () => {
    const parser = new MyParser([])
    parser.validateGrammar()  // 有问题会抛异常
  })
})
```

**CI/CD**：
```typescript
// 在构建脚本中检查
const parser = new MyParser([])
const result = parser.validateGrammar()
if (!result.success) {
  process.exit(1)  // 阻止错误代码合入
}
```

**重构时**：
```typescript
// 确保修改不引入冲突
parser.validateGrammar({ verbose: true })
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

## 🛡️ 问题检测系统

Subhuti 内置了强大的问题检测系统，帮助你在开发阶段快速发现和修复常见错误。

### 运行时检测

#### 1. 左递归检测

自动检测并阻止左递归调用，避免栈溢出：

```typescript
@SubhutiRule
Expression() {
  this.Or([
    { alt: () => {
      this.Expression()  // ❌ 左递归！
      this.consume('Plus')
      this.Number()
    }},
    { alt: () => this.Number() }
  ])
}

// 运行时错误：
// ❌ 检测到左递归
// 规则 "Expression" 在 token[0] 处重复调用自己
// 💡 Hint: 检查规则定义，确保在递归前消费了 token
```

#### 2. 无限循环检测

检测规则成功但不消费 token 的情况：

```typescript
@SubhutiRule
Statement() {
  // ❌ 错误：成功但不消费任何 token
  return this.curCst
}

// 运行时错误：
// ❌ 检测到无限循环
// 规则成功时必须消费至少一个 token，或使用 this.parserFail() 标记失败
```

#### 3. 不正确的失败标记

检测返回 `undefined` 但未设置失败状态：

```typescript
@SubhutiRule
Identifier() {
  const cst = this.tokenConsumer.Identifier()
  if (cst && ReservedWords.has(cst.value!)) {
    // ❌ 错误：应该使用 this.parserFail()
    return undefined
  }
  return cst
}

// 正确做法：
@SubhutiRule
Identifier() {
  const cst = this.tokenConsumer.Identifier()
  if (cst && ReservedWords.has(cst.value!)) {
    return this.parserFail()  // ✅ 正确标记失败
  }
  return cst
}
```

### 静态语法验证

使用 `validateGrammar()` 在开发阶段检测 Or 规则冲突：

```typescript
// 在测试中验证语法
describe('Parser Grammar', () => {
  it('should not have Or conflicts', () => {
    const parser = new MyParser([])
    parser.validateGrammar()  // 有问题会抛异常
  })
})
```

**检测的问题类型：**

1. **前缀冲突**：短规则在前，遮蔽长规则
2. **空路径冲突**：Option/Many 在第一个分支导致后续不可达

### 调试模式统计信息

启用 `debug()` 模式可以查看详细的性能和解析统计：

```typescript
const parser = new MyParser(tokens).debug()
const cst = parser.Script()

// 自动输出性能摘要、缓存命中率、CST 验证等信息
```

**统计信息说明：**
- **缓存命中率**：越高越好（通常 > 50%）
- **Top 慢规则**：优化重点
- **CST 验证**：确保解析完整性

**注意**：统计信息仅供参考，不做"好坏"判断，由开发者根据实际场景分析。

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
使用 Subhuti 构建完整的 **JavaScript ES2025** 解析器：
- ✅ 支持最新 ECMAScript 2025 规范的所有语法特性
- ✅ 完整实现 import/export、async/await、装饰器、模板字符串等
- ✅ CST → AST 转换
- ✅ 代码生成和 Source Map 支持

## 📚 相关文档

- **[LOOKAHEAD_API.md](./LOOKAHEAD_API.md)** - Token 前瞻 API 完整参考
- **[DETECTION_IMPROVEMENT_SUMMARY.md](./DETECTION_IMPROVEMENT_SUMMARY.md)** - 问题检测系统详细说明
- **[RULE_PATH_IN_ERROR_SUMMARY.md](./RULE_PATH_IN_ERROR_SUMMARY.md)** - 错误信息中的规则路径显示

## 📄 License

MIT © [alamhubb](https://github.com/alamhubb)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Subhuti** - 让语言转换如七十二变般灵活 🎭

