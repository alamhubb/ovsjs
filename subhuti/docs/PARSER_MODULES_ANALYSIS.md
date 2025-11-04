# SubhutiParser 模块化分析

## 🎯 核心功能（Core - 不可拆分）

### 1. 规则执行引擎
- **subhutiRule()** - 规则入口，装饰器调用
- **processCst()** - CST 节点构建
- **规则栈管理** - ruleStack
- **CST 栈管理** - cstStack

### 2. Token 消费
- **consumeToken()** - 消费 token，标记失败
- **generateCstByToken()** - 根据 token 生成 CST

### 3. 状态管理
- **_parseFailed** - 失败标志（核心状态）
- **markFailure()** - 标记失败
- **resetFailure()** - 重置失败
- **isSuccess** - 成功判断

### 4. 回溯机制
- **saveState()** - 保存状态（O(1)）
- **restoreState()** - 恢复状态
- **SubhutiBackData** - 回溯数据结构

### 5. 组合子（Combinators）
- **Or()** - 顺序选择（PEG）
- **Many()** - 0次或多次
- **Option()** - 0次或1次
- **AtLeastOne()** - 1次或多次

### 6. allowError 机制
- **_allowError** - 允许错误标志
- **allowErrorDepth** - 嵌套深度管理
- **setAllowErrorNewState()** - 进入上下文
- **allowErrorStackPopAndReset()** - 退出上下文

### 7. 基础访问器
- **curCst** - 当前 CST
- **curToken** - 当前 Token
- **isAtEnd** - 是否结束
- **isTopLevelCall** - 顶层调用判断

---

## 🔌 非核心功能（可拆分为插件）

### 1. Packrat Parsing（缓存模块）⭐

**职责：** 缓存规则执行结果，避免重复计算

**接口：**
```typescript
interface PackratPlugin {
  // 查询缓存
  get(ruleName: string, tokenIndex: number): MemoResult | undefined
  
  // 存储缓存
  set(ruleName: string, tokenIndex: number, result: MemoResult): void
  
  // 清空缓存
  clear(): void
  
  // 统计信息
  getStats(): PackratStats
  
  // 缓存大小
  size: number
  getTotalEntries(): number
}
```

**当前实现：**
- `enableMemoization` - 开关
- `memoCache` - PackratCache 实例
- `memoStats` - 统计信息
- `getMemoized()` - 查询
- `applyMemoizedResult()` - 应用缓存
- `storeMemoized()` - 存储
- `clearMemoCache()` - 清空
- `getMemoStats()` - 获取统计

**拆分收益：**
- ✅ 可选启用（零开销）
- ✅ 可替换缓存策略（LRU/LFU/Unlimited）
- ✅ 独立测试
- ✅ 降低核心复杂度

---

### 2. Debugging（调试模块）⭐

**职责：** 记录规则执行轨迹、Token 消费过程

**接口：**
```typescript
interface SubhutiDebugger {
  // 规则进入
  onRuleEnter(ruleName: string): void
  
  // 规则退出
  onRuleExit?(ruleName: string, success: boolean): void
  
  // Token 消费
  onTokenConsume(
    tokenIndex: number,
    tokenValue: string,
    tokenName: string,
    success: boolean
  ): void
  
  // 回溯事件
  onBacktrack?(fromIndex: number, toIndex: number): void
  
  // 获取轨迹
  getTrace?(): string
}
```

**当前实现：**
- `_debugger` - 调试器实例
- `debug()` - 启用调试
- `debuggerInstance` - 获取实例
- 钩子调用（onRuleEnter, onTokenConsume）

**拆分收益：**
- ✅ 可选启用（零开销）
- ✅ 可自定义调试器
- ✅ 独立测试
- ✅ 支持多种输出（Console/JSON/Visual）

---

### 3. Profiling（性能分析模块）⭐

**职责：** 统计规则执行时间、调用次数

**接口：**
```typescript
interface ProfilerPlugin {
  // 启动分析
  start(): void
  
  // 停止分析
  stop(): void
  
  // 记录规则执行
  recordRuleExecution(ruleName: string, duration: number): void
  
  // 获取统计
  getRuleStats(): Map<string, RuleStats>
  
  // 获取报告
  getReport(): string
  getShortReport(): string
}

interface RuleStats {
  calls: number         // 调用次数
  totalTime: number     // 总耗时
  avgTime: number       // 平均耗时
  maxTime: number       // 最大耗时
}
```

**当前实现：**
- `profiler` - SubhutiProfiler 实例
- `enableProfiling()` - 启用
- `stopProfiling()` - 停止
- `getProfilingReport()` - 详细报告
- `getProfilingShortReport()` - 简洁报告
- `getProfilingStats()` - 原始数据

**拆分收益：**
- ✅ 可选启用（零开销）
- ✅ 独立测试
- ✅ 可扩展（火焰图、时间线）

---

### 4. Error Handling（错误处理模块）⭐

**职责：** 生成详细错误信息、智能修复建议

**接口：**
```typescript
interface ErrorHandler {
  // 创建错误
  createError(details: ErrorDetails): ParsingError
  
  // 生成建议
  generateSuggestions(context: ErrorContext): string[]
  
  // 格式化错误
  formatError(error: ParsingError): string
  formatShortError(error: ParsingError): string
}

interface ErrorDetails {
  expected: string
  found?: SubhutiMatchToken
  position: { index: number, line: number, column: number }
  ruleStack: string[]
}

interface ErrorContext {
  expected: string
  found?: SubhutiMatchToken
  ruleStack: string[]
}
```

**当前实现：**
- `ParsingError` 类（336行，功能丰富）
- `generateSuggestions()` - 智能建议（108行）
- `toString()` - Rust 风格格式化
- `toShortString()` - 简洁格式

**拆分收益：**
- ✅ 独立测试（建议生成逻辑复杂）
- ✅ 可扩展（自定义格式）
- ✅ 降低核心复杂度（-200行）

---

### 5. Utilities（辅助工具模块）

**职责：** 提供便捷的辅助方法

**接口：**
```typescript
interface ParserUtilities {
  // 检查换行符
  hasLineTerminatorBefore(): boolean
  
  // Token 名称序列
  getTokensName(): string
  
  // 规则栈名称
  getRuleStackNames(): string
  
  // 设置位置信息
  setLocation(cst: SubhutiCst): void
}
```

**当前实现：**
- `hasLineTerminatorBefore()` - ECMAScript [no LineTerminator here]
- `tokensName` - Token 序列
- `ruleStackNames` - 规则栈序列
- `setLocation()` - 设置 CST 位置

**拆分收益：**
- ✅ 独立测试
- ✅ 可扩展（更多辅助方法）

---

## 🏗️ 推荐的模块化架构

### 方案A：插件化架构（推荐）⭐⭐⭐

```
SubhutiParser (核心)
├── Core 核心功能（~800行）
│   ├── 规则执行引擎
│   ├── Token 消费
│   ├── 状态管理
│   ├── 回溯机制
│   ├── 组合子
│   └── allowError 机制
│
└── Plugins 插件（可选）
    ├── PackratPlugin（缓存）
    ├── DebuggerPlugin（调试）
    ├── ProfilerPlugin（性能分析）
    ├── ErrorHandlerPlugin（错误处理）
    └── UtilitiesPlugin（辅助工具）
```

**使用方式：**
```typescript
// 零配置（默认最佳实践）
const parser = new SubhutiParser(tokens)

// 启用调试
const parser = new SubhutiParser(tokens)
  .use(new DebuggerPlugin())

// 启用性能分析
const parser = new SubhutiParser(tokens)
  .use(new ProfilerPlugin())

// 自定义缓存
const parser = new SubhutiParser(tokens)
  .use(new PackratPlugin({ maxSize: 50000 }))

// 组合多个插件
const parser = new SubhutiParser(tokens)
  .use(new DebuggerPlugin())
  .use(new ProfilerPlugin())
  .use(new CustomErrorHandler())
```

---

### 方案B：分层架构

```
SubhutiParser (核心)
├── SubhutiParserCore（核心层，~800行）
│   └── 纯粹的解析逻辑
│
├── SubhutiParserEnhanced（增强层，继承Core）
│   ├── + Packrat Parsing
│   └── + Utilities
│
└── SubhutiParserDebug（调试层，继承Enhanced）
    ├── + Debugging
    ├── + Profiling
    └── + Advanced Error Handling
```

**使用方式：**
```typescript
// 生产环境（最小）
const parser = new SubhutiParserCore(tokens)

// 标准使用（推荐）
const parser = new SubhutiParserEnhanced(tokens)

// 开发/调试
const parser = new SubhutiParserDebug(tokens)
  .enableDebug()
  .enableProfiling()
```

---

### 方案C：Mixin 模式

```typescript
// 核心 Parser
class SubhutiParserCore { ... }

// 可组合的 Mixin
function withPackrat(Base) { ... }
function withDebugger(Base) { ... }
function withProfiler(Base) { ... }

// 组合使用
class MyParser extends 
  withProfiler(
    withDebugger(
      withPackrat(SubhutiParserCore)
    )
  ) { ... }
```

---

## 📊 各方案对比

| 特性 | 方案A（插件） | 方案B（分层） | 方案C（Mixin） |
|-----|------------|------------|--------------|
| **易用性** | ⭐⭐⭐⭐⭐ 链式调用 | ⭐⭐⭐ 选择类 | ⭐⭐ 复杂 |
| **灵活性** | ⭐⭐⭐⭐⭐ 任意组合 | ⭐⭐⭐ 固定层次 | ⭐⭐⭐⭐ 灵活 |
| **零开销** | ⭐⭐⭐⭐⭐ 不用=零开销 | ⭐⭐⭐ 继承有开销 | ⭐⭐⭐⭐ 编译时 |
| **可测试性** | ⭐⭐⭐⭐⭐ 独立测试 | ⭐⭐⭐⭐ 分层测试 | ⭐⭐⭐ 组合复杂 |
| **可维护性** | ⭐⭐⭐⭐⭐ 清晰边界 | ⭐⭐⭐⭐ 层次清晰 | ⭐⭐⭐ 依赖复杂 |
| **扩展性** | ⭐⭐⭐⭐⭐ 第三方插件 | ⭐⭐⭐ 需继承 | ⭐⭐⭐⭐ 新Mixin |
| **TypeScript支持** | ⭐⭐⭐⭐ 接口清晰 | ⭐⭐⭐⭐⭐ 类型完美 | ⭐⭐⭐ 类型复杂 |

**推荐：方案A（插件化）**

---

## 🎯 具体拆分步骤

### 第一阶段：拆分错误处理（高收益）

**收益：** -200行，降低30%复杂度

```typescript
// 新文件：SubhutiErrorHandler.ts
export class SubhutiErrorHandler {
  createError(details: ErrorDetails): ParsingError { ... }
  generateSuggestions(context: ErrorContext): string[] { ... }
}

// SubhutiParser.ts 中
private errorHandler = new SubhutiErrorHandler()

consumeToken(tokenName: string) {
  // ...
  throw this.errorHandler.createError({ ... })
}
```

---

### 第二阶段：拆分 Packrat Parsing

**收益：** -150行，可选启用

```typescript
// 新文件：PackratPlugin.ts
export class PackratPlugin implements ParserPlugin {
  install(parser: SubhutiParser) {
    parser.beforeRule = this.checkCache.bind(this)
    parser.afterRule = this.storeCache.bind(this)
  }
  
  checkCache(ruleName, tokenIndex) { ... }
  storeCache(ruleName, result) { ... }
}

// 使用
const parser = new SubhutiParser(tokens)
  .use(new PackratPlugin({ maxSize: 10000 }))
```

---

### 第三阶段：拆分 Debugging & Profiling

**收益：** -100行，可选启用

```typescript
// 新文件：SubhutiProfilerPlugin.ts
export class SubhutiProfilerPlugin implements ParserPlugin {
  install(parser: SubhutiParser) {
    parser.beforeRule = this.startTimer.bind(this)
    parser.afterRule = this.endTimer.bind(this)
  }
}

// 使用
const parser = new SubhutiParser(tokens)
  .use(new DebuggerPlugin())
  .use(new ProfilerPlugin())
```

---

## 📋 拆分后的核心 SubhutiParser

**核心代码：** ~800行（当前1400行）

**包含：**
1. 规则执行引擎（subhutiRule, processCst）
2. Token 消费（consumeToken）
3. 状态管理（_parseFailed, markFailure, resetFailure）
4. 回溯机制（saveState, restoreState）
5. 组合子（Or, Many, Option, AtLeastOne）
6. allowError 机制（核心创新）
7. 基础访问器（curCst, curToken, isAtEnd）

**不包含（可选插件）：**
1. ❌ Packrat Parsing（PackratPlugin）
2. ❌ Debugging（DebuggerPlugin）
3. ❌ Profiling（ProfilerPlugin）
4. ❌ Error Handling（ErrorHandlerPlugin）
5. ❌ Utilities（UtilitiesPlugin）

---

## 🚀 迁移路径（向后兼容）

### 阶段1：保持兼容（当前）

```typescript
// 现有代码不变
const parser = new SubhutiParser(tokens)
parser.enableMemoization = true
parser.enableProfiling()
```

### 阶段2：新增插件 API（兼容共存）

```typescript
// 旧 API 继续工作
const parser1 = new SubhutiParser(tokens)
parser1.enableProfiling()

// 新 API 逐步迁移
const parser2 = new SubhutiParser(tokens)
  .use(new ProfilerPlugin())
```

### 阶段3：废弃旧 API（v2.0）

```typescript
// 仅支持插件 API
const parser = new SubhutiParser(tokens)
  .use(new PackratPlugin())
  .use(new ProfilerPlugin())
```

---

## 📝 总结

### 核心功能（不可拆分）
1. ✅ 规则执行引擎
2. ✅ Token 消费
3. ✅ 状态管理（_parseFailed）
4. ✅ 回溯机制
5. ✅ 组合子（Or/Many/Option/AtLeastOne）
6. ✅ allowError 机制

### 非核心功能（可拆分）
1. 🔌 Packrat Parsing（缓存）
2. 🔌 Debugging（调试）
3. 🔌 Profiling（性能分析）
4. 🔌 Error Handling（错误处理）
5. 🔌 Utilities（辅助工具）

### 推荐架构
**方案A：插件化架构**
- ✅ 最高灵活性
- ✅ 最佳可测试性
- ✅ 最强扩展性
- ✅ 零开销（不用=不加载）

### 收益
- 核心代码：1400行 → 800行（-43%）
- 清晰边界：功能独立，易于维护
- 零开销：可选启用，性能优化
- 可扩展：第三方插件生态

---

**下一步：** 是否开始实施拆分？从哪个模块开始？

