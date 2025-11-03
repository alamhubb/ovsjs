# SubhutiParser API 需求分析

**分析目标：** 提取 Es2020Parser/Es6Parser 使用的所有 API，确保新实现完全兼容

**分析日期：** 2025-11-02

---

## 📊 API 使用统计

### Parser 使用情况

| Parser | @SubhutiRule 数量 | Or 调用 | Many 调用 | Option 调用 | tokenConsumer 调用 |
|--------|------------------|---------|-----------|-------------|-------------------|
| **Es6Parser** | ~152 | ~150 | ~80 | ~60 | ~200 |
| **Es2020Parser** | ~10 | ~8 | ~5 | ~3 | ~20 |
| **总计** | ~162 | ~158 | ~85 | ~63 | ~220 |

---

## 🎯 必须保留的 API

### 1. 类装饰器

```typescript
// ✅ 必须保留
@Subhuti
export default class Es6Parser<T extends Es6TokenConsumer> extends SubhutiParser<T> {
    // ...
}
```

**需求：**
- 类装饰器标记 Parser 类
- 支持泛型（TokenConsumer 类型）
- 保存类名用于方法装饰器

---

### 2. 方法装饰器

```typescript
// ✅ 必须保留
@SubhutiRule
IdentifierReference() {
    this.Or([
        {alt: () => this.tokenConsumer.Identifier()},
    ])
}
```

**需求：**
- 方法装饰器标记规则方法
- 自动包装为规则执行器
- 保持方法名（用于 CST）

---

### 3. 构造函数签名

```typescript
// ✅ 必须保留
constructor(
    tokens?: SubhutiMatchToken[], 
    TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = Es6TokenConsumer as any
) {
    super(tokens, TokenConsumerClass);
}
```

**需求：**
- 接受 tokens 数组
- 接受 TokenConsumer 类（可选）
- 调用 super 初始化

---

### 4. Or 规则

```typescript
// ✅ 必须保留格式
this.Or([
    {alt: () => this.SomeRule()},
    {alt: () => this.AnotherRule()},
    {alt: () => {
        this.TokenA()
        this.TokenB()
    }}
])
```

**需求：**
- 接受数组，每个元素是 `{alt: Function}`
- 按顺序尝试分支
- 第一个成功即返回
- 支持内联函数

**使用模式：**
- 简单规则调用：`{alt: () => this.Rule()}`
- 复杂逻辑：`{alt: () => { ... }}`
- 长规则在前，短规则在后

---

### 5. Many 规则

```typescript
// ✅ 必须保留格式
this.Many(() => {
    this.tokenConsumer.Comma()
    this.Element()
})
```

**需求：**
- 接受函数作为参数
- 0次或多次匹配（总是成功）
- 支持循环中调用规则

**使用模式：**
- 列表元素：`this.Many(() => this.Item())`
- 分隔符列表：`this.Many(() => { this.Sep(); this.Item() })`

---

### 6. Option 规则

```typescript
// ✅ 必须保留格式
this.Option(() => {
    this.tokenConsumer.Question()
    this.AssignmentExpression()
    this.tokenConsumer.Colon()
    this.AssignmentExpression()
})
```

**需求：**
- 接受函数作为参数
- 0次或1次匹配（总是成功）
- 支持可选的复杂逻辑

---

### 7. tokenConsumer

```typescript
// ✅ 必须保留
this.tokenConsumer.Identifier()
this.tokenConsumer.Plus()
this.tokenConsumer.LParen()
```

**需求：**
- 通过 this.tokenConsumer 访问
- 每个 token 类型有对应方法
- 消费匹配的 token

---

### 8. 规则调用

```typescript
// ✅ 必须保留
this.MemberExpression()
this.Arguments()
this.AssignmentExpression()
```

**需求：**
- 直接调用规则方法（不需要 SUBRULE 前缀）
- 支持递归调用
- 支持嵌套调用

---

## 🔧 可以改进的 API

### 1. 返回值

```typescript
// 当前：无返回值
this.tokenConsumer.Plus()

// 改进：返回 token 对象
const token = this.tokenConsumer.Plus()
console.log(token.value, token.loc)
```

---

### 2. CST 访问

```typescript
// 当前：手动遍历
const children = cst.children
const left = children[0]
const right = children[2]

// 改进：辅助方法
const left = cst.getChild("Term", 0)
const right = cst.getChild("Term", 1)
```

---

### 3. 错误信息

```typescript
// 当前：简单字符串
throw new Error('syntax error expect：' + tokenName)

// 改进：详细错误对象
throw new ParsingError({
    expected: 'Plus',
    found: token,
    position: {line: 1, column: 5},
    ruleStack: ['Expression', 'Addition', 'Term']
})
```

---

## 📝 必须实现的核心方法

### SubhutiParser 基类

```typescript
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    // 必须的字段
    tokenConsumer: T
    
    // 必须的方法
    constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass?)
    Or(alternatives: Array<{alt: Function}>): SubhutiCst | undefined
    Many(fn: Function): SubhutiCst
    Option(fn: Function): SubhutiCst
    
    // 可选但有用的方法
    getMemoStats?(): object  // Packrat 统计
    clearMemoCache?(): void  // 清空缓存
    enableMemoization?: boolean  // 缓存开关
}
```

---

### 装饰器

```typescript
// 类装饰器
export function Subhuti(target, context)

// 方法装饰器
export function SubhutiRule(targetFun, context)

// 类型
export type SubhutiTokenConsumerConstructor<T> = new (parser: SubhutiParser<T>) => T
```

---

### SubhutiCst 节点

```typescript
// 必须的结构
interface SubhutiCst {
    name: string  // 规则名或 token 名
    children: SubhutiCst[]  // 子节点
    value?: string  // token 的值
    loc?: {  // 位置信息
        start: {index: number, line: number, column: number}
        end: {index: number, line: number, column: number}
    }
    
    // 新增辅助方法
    getChild?(name: string, index?: number): SubhutiCst | undefined
    getChildren?(name: string): SubhutiCst[]
    getToken?(tokenName: string): SubhutiCst | undefined
}
```

---

## 🔍 测试用例使用模式分析

### 模式1：创建 Parser

```typescript
// 词法分析
const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

// 创建 Parser
const parser = new Es2020Parser(tokens)

// 调用入口规则
const cst = parser.Program()
```

**需求：**
- 接受 tokens 数组
- 提供入口规则方法（Program）
- 返回 CST 根节点

---

### 模式2：访问 CST

```typescript
// 检查 CST
if (!cst || !cst.children || cst.children.length === 0) {
    throw new Error("解析失败")
}

// 遍历 children
const moduleItemList = cst.children[0]
```

**需求：**
- CST 必须有 children 数组
- children 可以为空（代表空规则）

---

### 模式3：错误处理

```typescript
try {
    const cst = parser.Program()
} catch (error) {
    console.log("解析错误:", error.message)
}
```

**需求：**
- 失败抛异常
- 异常有 message 属性

---

## ✅ API 兼容性清单

### 必须 100% 兼容

- ✅ `@Subhuti` 装饰器
- ✅ `@SubhutiRule` 装饰器  
- ✅ `Or([{alt: () => ...}])`
- ✅ `Many(() => ...)`
- ✅ `Option(() => ...)`
- ✅ `this.tokenConsumer.TokenName()`
- ✅ `this.RuleName()` - 调用其他规则
- ✅ `constructor(tokens, TokenConsumerClass)`
- ✅ `super(tokens, TokenConsumerClass)`

### 可以增强（不破坏兼容性）

- ✅ tokenConsumer 方法返回 token 对象
- ✅ CST 添加辅助方法（getChild 等）
- ✅ 更详细的错误对象
- ✅ Packrat Parsing 统计方法

### 可以移除（内部实现，外部不可见）

- ✅ `setCurCst` - 内部方法
- ✅ `setRuleMatchSuccess` - 内部标志
- ✅ `setLoopMatchSuccess` - 内部标志
- ✅ 各种内部工具方法

---

## 📋 最终 API 清单

### 公开 API（必须实现）

```typescript
// 装饰器
export function Subhuti(target, context)
export function SubhutiRule(targetFun, context)
export type SubhutiTokenConsumerConstructor<T>

// Parser 类
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    // 公开字段
    tokenConsumer: T
    enableMemoization?: boolean
    
    // 构造函数
    constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass?)
    
    // 规则组合方法
    Or(alternatives: Array<{alt: Function}>): any
    Many(fn: Function): any
    Option(fn: Function): any
    
    // Packrat 方法（可选）
    getMemoStats?(): object
    clearMemoCache?(): void
}

// CST 节点
class SubhutiCst {
    name: string
    children: SubhutiCst[]
    value?: string
    loc?: Location
    tokens?: SubhutiMatchToken[]  // 可选
    
    // 辅助方法（新增）
    getChild?(name: string, index?: number): SubhutiCst | undefined
    getChildren?(name: string): SubhutiCst[]
    getToken?(tokenName: string): SubhutiCst | undefined
    pushCstToken?(token: SubhutiMatchToken): void
}
```

---

## 🎯 设计约束

### 约束1：Es2020Parser 代码尽量不改

**允许的小改动：**
- ✅ import 路径调整（如果文件结构变化）
- ✅ 类型声明调整（如果增强了类型）

**不允许的大改动：**
- ❌ 改变规则方法的实现
- ❌ 改变 Or/Many/Option 的调用方式
- ❌ 改变装饰器语法

---

### 约束2：保持现有使用方式

**测试用例的使用方式必须继续工作：**
```typescript
const parser = new Es2020Parser(tokens)
const cst = parser.Program()

if (cst && cst.children && cst.children.length > 0) {
    // 成功
}
```

---

### 约束3：向后兼容

**如果某些 API 需要改进：**
- 保留旧 API（标记为 deprecated）
- 添加新 API（推荐使用）
- 文档说明迁移路径

---

## 💡 关键发现

### 1. 规则方法不返回值

**当前使用：**
```typescript
@SubhutiRule
Expression() {
    this.Or([...])  // Or 的返回值被忽略
}
```

**影响：**
- 规则方法主要靠副作用（修改 CST）
- 不依赖返回值
- 新实现也不强制要求返回值

---

### 2. Or/Many/Option 的返回值被忽略

**当前使用：**
```typescript
this.Many(() => {
    this.tokenConsumer.Comma()
})  // 返回值被忽略
```

**影响：**
- 可以返回 CST，但不强制使用
- 主要通过修改 this.curCst 工作

---

### 3. tokenConsumer 方法无返回值

**当前使用：**
```typescript
this.tokenConsumer.Plus()  // 无返回值
```

**改进空间：**
- 可以返回 token 对象
- 不破坏现有代码（忽略返回值即可）

---

## 📋 需求总结

### 核心需求（P0）

1. ✅ **装饰器系统** - @Subhuti, @SubhutiRule
2. ✅ **规则组合** - Or, Many, Option
3. ✅ **Token 消费** - this.tokenConsumer.TokenName()
4. ✅ **规则调用** - this.RuleName()
5. ✅ **CST 构建** - 自动构建 children 数组
6. ✅ **继承支持** - 子类可以 override 规则

### 增强需求（P1）

1. ✅ **Packrat Parsing** - 性能优化
2. ✅ **返回值** - Token 和规则可以返回值
3. ✅ **CST 辅助** - getChild 等方法
4. ✅ **详细错误** - ParsingError 对象

### 可选需求（P2）

1. ✅ **统计信息** - getMemoStats
2. ✅ **配置化** - enableMemoization
3. ✅ **调试工具** - getDebugContext

---

## ✅ 分析完成

**已识别的 API：**
- 装饰器：2个
- 规则组合：3个（Or, Many, Option）
- Token 消费：1个方式（tokenConsumer）
- CST 结构：1个类

**总计：** 7个核心 API 必须保留

**下一步：** 架构设计







