# SubhutiParser 调试功能实现总结

## 📋 实现方案

采用**极简方案**，最少代码改动，完全基于 `if (debug)` 判断实现。

---

## ✅ 已完成的修改

### 1. SubhutiParser.ts 核心修改

#### 新增字段（2个）
```typescript
private _debugMode: boolean = false
private debugData = { ... }  // 简单对象，不用类
```

#### 新增方法（2个）
```typescript
debug(): this          // 开启调试模式（链式调用）
getDebugData()         // 获取调试数据
```

#### 修改方法（3个）- 添加 if 判断
```typescript
subhutiRule()    // 添加 4 行：记录规则进入/退出
Or()             // 添加 4 行：记录 Or 进入/成功分支
consumeToken()   // 添加 2 行：记录 Token 消费成功/失败
```

**总计修改：** 约 50 行新增代码，10 行修改

---

## 🎯 使用方式

### 方式1：不调试（零开销）

```typescript
const parser = new Es2020Parser(tokens)
const cst = parser.Program()
// 正常使用，无任何开销
```

### 方式2：调试模式

```typescript
// 开启调试
const parser = new Es2020Parser(tokens).debug()  // ← 链式调用
const cst = parser.Program()

// 获取原始数据
const data = parser.getDebugData()
console.log(data)
// {
//   ruleExecutions: [...],  // 规则执行记录
//   orBranches: [...],      // Or 分支记录
//   tokenConsumes: [...],   // Token 消费记录
//   startTime: 123.45,
//   endTime: 125.06
// }
```

### 方式3：生成报告（使用 Visualizer）

```typescript
import { SubhutiVisualizer } from '@subhuti/debugger'

const parser = new Es2020Parser(tokens).debug()
const cst = parser.Program()
const data = parser.getDebugData()

// 完整报告
const report = SubhutiVisualizer.generateReport(data, tokens, cst, {
    mode: 'full',           // timeline | or-branches | token-compare | full
    maxDepth: 3,            // 限制深度
    highlightRules: ['PropertyDefinition'],  // 高亮规则
    showTimestamps: false,  // 显示时间戳
    showTokenIndex: true    // 显示 token 索引
})
console.log(report)

// 简洁报告（单行）
const short = SubhutiVisualizer.generateShortReport(data, tokens, cst)
console.log(short)
// ✅ Parse 1.61ms | 133 rules | 58 ors | 4 tokens consumed | 4 tokens total
```

---

## 📊 收集的数据

### 1. 规则执行记录
```typescript
ruleExecutions: Array<{
    type: 'enter' | 'exit'  // 进入/退出
    ruleName: string         // 规则名称
    tokenIndex: number       // Token 索引
    timestamp: number        // 时间戳
    success?: boolean        // 是否成功（exit 时）
}>
```

**用途：** 生成执行时间线，追踪解析路径

### 2. Or 分支记录
```typescript
orBranches: Array<{
    ruleName: string          // Or 所在规则
    totalBranches: number     // 总分支数
    successBranch?: number    // 成功的分支索引
    tokenIndex: number        // Token 索引
}>
```

**用途：** 分析 Or 规则选择，诊断分支顺序问题

### 3. Token 消费记录
```typescript
tokenConsumes: Array<{
    tokenName: string      // Token 名称
    tokenIndex: number     // Token 索引
    success: boolean       // 是否成功
}>
```

**用途：** Token 对比，检查丢失的 token

---

## 📝 示例输出

### 示例1：规则执行时间线

```
📍 规则执行时间线
════════════════════════════════════════════════════════════════
[0] → Program
  [0] → ModuleItemList
    [0] → StatementListItem
      [0] → Declaration
        [0] → VariableDeclaration
          [0] → VariableLetOrConst
            [0] ✅ ConstTok
          [1] ✅ VariableLetOrConst
          [1] → VariableDeclarator
            [1] → BindingIdentifier
            [1] ✅ BindingIdentifier
            [2] ✅ Assign
            [3] → Initializer
              [3] → AssignmentExpression
              [3] ✅ AssignmentExpression
            [4] ✅ Initializer
          [4] ✅ VariableDeclarator
        [4] ✅ VariableDeclaration
      [4] ✅ Declaration
    [4] ✅ StatementListItem
  [4] ✅ ModuleItemList
[4] ✅ Program
```

### 示例2：Or 分支选择

```
🔀 Or 分支选择分析
════════════════════════════════════════════════════════════════

📌 VariableLetOrConst @ token[0]
   总分支数: 3
   ✅ 成功分支: 2  (ConstTok)

📌 PropertyDefinition @ token[4]
   总分支数: 5
   ❌ 所有分支都失败

📌 LiteralPropertyName @ token[4]
   总分支数: 48
   ✅ 成功分支: 0  (NullTok)
```

### 示例3：Token 对比

```
🔍 Token 完整性检查
════════════════════════════════════════════════════════════════
输入 Token 数: 12
CST Token 数:  12
消费尝试数:    399
消费成功数:    12

详细对比:
  [0] ✅ "const"
  [1] ✅ "obj"
  [2] ✅ "="
  [3] ✅ "{"
  [4] ✅ "null"
  [5] ✅ ":"
  [6] ✅ "41"
  [7] ✅ ","
  [8] ✅ "a"
  [9] ✅ ":"
  [10] ✅ "1"
  [11] ✅ "}"

✅ 所有 Token 都已保留！
```

---

## 🚀 测试文件

### 1. test-debug-simple.ts - 基础功能测试
```bash
npx tsx test-debug-simple.ts
```

### 2. test-debug-report.ts - 报告生成测试
```bash
npx tsx test-debug-report.ts
npx tsx test-debug-report.ts --mode=timeline --max-depth=5
npx tsx test-debug-report.ts --mode=or-branches
npx tsx test-debug-report.ts --mode=token-compare
```

---

## 📦 文件清单

### 核心修改
- ✅ `subhuti/src/parser/SubhutiParser.ts` - 添加调试支持（约 50 行）

### 外部工具（独立，可选）
- ✅ `subhuti/src/debugger/SubhutiVisualizer.ts` - 可视化工具
- ✅ `subhuti/src/error/ErrorDiagnoser.ts` - 错误诊断
- ✅ `subhuti/src/error/ErrorFormatter.ts` - 错误格式化
- ✅ `subhuti/src/debugger/CacheAnalyzer.ts` - 缓存分析

### 测试文件
- ✅ `subhuti/test-debug-simple.ts` - 简单测试
- ✅ `subhuti/test-debug-report.ts` - 报告测试

### 文档
- ✅ `DEBUG_FEATURE_SUMMARY.md` - 本文档

---

## ⭐ 核心优势

### 1. 极简实现
- ✅ 只修改 SubhutiParser.ts（约 50 行新增，10 行修改）
- ✅ 3 个方法中加 `if (debug)` 判断
- ✅ 不需要复杂的装饰器或 Proxy

### 2. 零开销
```typescript
if (this._debugMode) {  // ← 不调试时，只有一个布尔判断
    // 收集数据
}
```

### 3. 使用简单
```typescript
parser.debug()  // ← 链式调用开启
```

### 4. 数据简洁
```typescript
debugData = { ruleExecutions: [], orBranches: [], tokenConsumes: [] }
// 简单对象，不用类
```

### 5. 完全可插拔
- SubhutiVisualizer 独立
- ErrorDiagnoser 独立
- ErrorFormatter 独立
- 可以单独使用

---

## 💡 下一步（可选）

### 1. 命令行工具
创建 `subhuti-debug-cli.ts`，直接从命令行调试：
```bash
npx tsx subhuti-debug "const x = 1" --mode=timeline
```

### 2. 更多可视化
- 回溯追踪
- 性能热点分析
- 图形化展示

### 3. 集成到 VS Code
- 创建 VS Code 扩展
- 实时调试面板
- 交互式时间线

---

## 📝 API 文档

### SubhutiParser 新增方法

#### `parser.debug(): this`
开启调试模式（链式调用）

**返回：** Parser 实例（支持链式调用）

**示例：**
```typescript
const parser = new Es2020Parser(tokens).debug()
```

#### `parser.getDebugData(): DebugData | null`
获取调试数据

**返回：** 调试数据对象，如果未开启调试则返回 `null`

**示例：**
```typescript
const data = parser.getDebugData()
if (data) {
    console.log(`规则执行数: ${data.ruleExecutions.length / 2}`)
}
```

### SubhutiVisualizer 静态方法

#### `SubhutiVisualizer.generateReport(data, tokens, cst, options?): string`
生成完整报告

**参数：**
- `data`: 调试数据
- `tokens`: Token 流
- `cst`: CST 树
- `options`: 可选配置

**返回：** 格式化的报告字符串

#### `SubhutiVisualizer.generateShortReport(data, tokens, cst): string`
生成简洁报告（单行）

**返回：** 单行报告字符串

---

## 🎉 总结

通过**极简方案**，我们用最少的代码改动（约 60 行）为 SubhutiParser 添加了完整的调试功能：

1. ✅ **零侵入**：不修改核心逻辑，只添加 `if (debug)` 判断
2. ✅ **零开销**：不调试时只有一个布尔判断
3. ✅ **易使用**：`parser.debug()` 链式调用
4. ✅ **功能全**：规则执行、Or 分支、Token 消费全覆盖
5. ✅ **可扩展**：外部工具独立，可按需使用

现在，开发者可以轻松地：
- 追踪解析路径
- 诊断 Or 规则顺序问题
- 检查 Token 丢失
- 分析性能瓶颈

**Happy Debugging! 🚀**





