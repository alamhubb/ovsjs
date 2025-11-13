# 规则路径日志输出分析

## 📋 测试代码
```javascript
const obj = { sum: 5 + 6 }
```

## ⚠️ 核心问题：缩进/对齐混乱

### 问题现象

规则路径的树形结构缩进不一致，导致无法判断节点的父子关系和层级关系。

## 🔍 规则路径日志输出样式

### 1. 折叠路径（使用 `...` 省略中间规则）

```
├─Script > StatementList > StatementListItem > ... > LeftHandSideExpression > CallExpression
```

**问题：** 中间省略了大量重要规则，不利于调试

**实际完整路径应该是：**
```
Script > StatementList > StatementListItem > Declaration > LexicalDeclaration > 
BindingList > LexicalBinding > Initializer > AssignmentExpression > 
ConditionalExpression > ShortCircuitExpression > LogicalORExpression > 
LogicalANDExpression > BitwiseORExpression > BitwiseXORExpression > 
BitwiseANDExpression > EqualityExpression > RelationalExpression > 
ShiftExpression > AdditiveExpression > MultiplicativeExpression > 
ExponentiationExpression > UnaryExpression > UpdateExpression > 
LeftHandSideExpression > CallExpression
```

### 2. 完整路径示例

```
│  │  ├─BindingList > LexicalBinding > BindingIdentifier
│  │  │  └─🔀 BindingIdentifier(Or)
│  │  │  │  └─[Branch #1]
│  │  │  │  │  └─Identifier
│  │  │  │  │  │  └─🔹 Consume token[1] - obj - <Identifier> [1:7-9] ✅
```

**说明：** 这里显示了完整的规则链，更容易理解

### 3. Or 分支显示

```
│  │  └─🔀 LetOrConst(Or)
│  │  │  └─[Branch #2]
│  │  │  │  └─🔹 Consume token[0] - const - <ConstTok> [1:1-5] ✅
```

**说明：**
- `🔀` 表示 Or 规则入口
- `[Branch #2]` 表示选择了第 2 个分支
- 只显示成功的分支，失败的分支不显示

### 4. Token 消费显示

```
└─🔹 Consume token[4] - sum - <Identifier> [1:15-17] ✅
```

**格式：**
- `🔹` 表示 Token 消费
- `token[4]` - Token 索引
- `sum` - Token 值
- `<Identifier>` - Token 类型
- `[1:15-17]` - 位置信息（行:列）
- `✅` - 消费成功

## ⚠️ 发现的问题

### 🔴 问题 1：Or 分支的缩进混乱（最严重）

**示例 1：OptionalExpression**
```
├─OptionalExpression
│  └─🔀 OptionalExpression(Or)
│  │  └─[Branch #1]
│  │  │  └─MemberExpression
│  │  └─[Branch #2]
│  │  │  └─CallExpression
│  └─[Branch #2]
│  │  └─LeftHandSideExpression
```

**问题分析：**
1. `OptionalExpression(Or)` 下有两个 `[Branch #2]`
2. 第一个 `[Branch #2]` 缩进是 `│  │  └─`（深度 3）
3. 第二个 `[Branch #2]` 缩进是 `│  └─`（深度 2）
4. **无法判断第二个 `[Branch #2]` 属于哪个 Or**
5. 如果它属于 `OptionalExpression(Or)`，那么缩进应该和第一个 `[Branch #2]` 一样

**示例 2：多个孤立的 Branch**
```
│  └─[Branch #2]
│  │  └─LeftHandSideExpression
│  └─[Branch #5]
│  │  └─LeftHandSideExpression
│  ├─UnaryExpression
│  │  └─🔀 UnaryExpression(Or)
│  │  │  └─[Branch #1]
│  │  │  │  └─UpdateExpression
│  ├─
│  │  └─CoalesceExpression
│  │  │  └─BitwiseORExpression
│  └─[Branch #2]
│  │  └─ShortCircuitExpression
```

**问题分析：**
1. 出现了 `[Branch #2]`、`[Branch #5]`、又一个 `[Branch #2]`
2. 它们的缩进都是 `│  └─`（深度 2）
3. 但它们之间没有明确的 Or 包裹节点
4. 出现了一个空规则名 `├─`
5. **完全无法理解这些 Branch 的归属关系**

**示例 3：CallExpression 的混乱结构**
```
├─Script > StatementList > StatementListItem > ... > LeftHandSideExpression > CallExpression
│  └─🔀 CallExpression(Or)
│  │  └─[Branch #1]
│  │  │  └─CoverCallExpressionAndAsyncArrowHead
│  │  │  │  └─MemberExpression
│  ├─OptionalExpression
│  │  └─🔀 OptionalExpression(Or)
│  │  │  └─[Branch #1]
│  │  │  │  └─MemberExpression
│  │  │  └─[Branch #2]
│  │  │  │  └─CallExpression
│  └─[Branch #2]
│  │  └─LeftHandSideExpression
```

**问题分析：**
1. `CallExpression(Or)` 下有 `[Branch #1]`
2. 然后出现了 `OptionalExpression`（缩进 `│  ├─`，深度 2）
3. 最后又出现了 `[Branch #2]`（缩进 `│  └─`，深度 2）
4. **这个 `[Branch #2]` 应该属于 `CallExpression(Or)`，但中间插入了 `OptionalExpression`**
5. **结构完全混乱，无法理解层级关系**

**根本原因：**

查看代码 `SubhutiDebugRuleTracePrint.ts:287-336`：

```typescript
static printSingleRule(rules: RuleStackItem[], startDepth: number): void {
    rules.forEach((item, index) => {
        const isLast = index === rules.length - 1
        const branch = isLast ? '└─' : '├─'
        const depth = startDepth + index  // ❌ 问题：每个规则深度递增

        // 生成前缀
        let prefix = ''
        for (let d = 0; d < depth; d++) {
            const ruleIndexAtLayer = d - startDepth
            if (ruleIndexAtLayer < index) {
                prefix += '│  '
            } else {
                prefix += '   '
            }
        }

        console.log(prefix + branch + printStr)
        item.displayDepth = depth
    })
}
```

**问题：**
1. `printSingleRule` 每次被调用时，传入的 `rules` 数组可能只有 1 个元素
2. 但它假设这些规则应该深度递增（`depth = startDepth + index`）
3. 当 Or 分支节点被单独调用 `printSingleRule` 时，它们的深度计算不正确
4. **导致同一个 Or 的不同分支缩进不一致**

### 🟡 问题 2：规则路径截断过于激进

**位置：** `SubhutiDebugRuleTracePrint.ts:267-269`

```typescript
const displayNames = names.length > 5
    ? [...names.slice(0, 3), '...', ...names.slice(-2)]
    : names
```

**问题描述：**
- 当规则链超过 5 个时，只显示前 3 个和后 2 个
- 中间的规则全部用 `...` 省略
- 导致大量关键信息丢失

**影响：**
- 无法看到完整的解析路径
- 调试时难以定位问题
- 不利于理解语法规则的执行流程

### 🟡 问题 3：截断策略不合理

**当前策略：**
- 阈值：5 个规则
- 保留：前 3 个 + 后 2 个
- 省略：中间所有规则

**问题：**
- 阈值太小（5 个）
- 保留的规则太少（只有 5 个）
- 对于复杂的语法规则（如 ES2025），经常有 10-20 个规则的链

### 🟢 问题 4：同一个 Token 被多次显示消费（已知限制）

**示例：**
```
│  │  │  │  └─[Branch #1]
│  │  │  │  │  │  └─🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅
│  │  │  │  └─[Branch #2]
│  │  │  │  │  │  └─🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅
│  │  │  │  └─[Branch #3]
│  │  │  │  │  │  └─🔹 Consume token[3] - { - <LBrace> [1:13-13] ✅
```

**说明：**
- Token `{` (索引 3) 被显示消费了 3 次
- 这是因为 ObjectLiteral 有 3 个分支都尝试消费这个 Token
- 虽然代码注释中说明了这是已知限制，但可能会让用户困惑

## 💡 建议的改进方案

### 🔴 优先级 1：修复 Or 分支缩进问题

**方案 A：修复 `printSingleRule` 的深度计算**

问题根源：`printSingleRule` 假设传入的规则数组应该深度递增，但实际上很多时候只传入单个规则。

```typescript
// 当前错误的实现
static printSingleRule(rules: RuleStackItem[], startDepth: number): void {
    rules.forEach((item, index) => {
        const depth = startDepth + index  // ❌ 错误：假设每个规则深度递增
        // ...
    })
}
```

**建议修改：**
```typescript
static printSingleRule(rules: RuleStackItem[], startDepth: number): void {
    rules.forEach((item, index) => {
        // ✅ 修复：所有规则使用相同的深度（同级）
        const depth = startDepth
        // 或者：根据规则类型决定是否递增
        // const depth = item.orBranchInfo?.isOrBranch ? startDepth : startDepth + index
        // ...
    })
}
```

**方案 B：重新设计 Or 分支的输出逻辑**

Or 包裹节点和 Branch 节点应该有明确的层级关系：

```
期望的输出：
├─🔀 OptionalExpression(Or)
│  ├─[Branch #1]
│  │  └─MemberExpression
│  └─[Branch #2]
│     └─CallExpression
```

而不是现在的混乱结构。

**方案 C：在 `flushPendingOutputs` 中特殊处理 Or 节点**

在输出前，检测 Or 包裹节点和其分支节点，确保它们的缩进关系正确。

### 🟡 优先级 2：增加截断阈值
```typescript
const displayNames = names.length > 15  // 从 5 改为 15
    ? [...names.slice(0, 8), '...', ...names.slice(-5)]  // 保留更多规则
    : names
```

### 方案 2：提供配置选项
```typescript
static printChainRule(rules: RuleStackItem[], depth: number, options?: {
    maxDisplay?: number,  // 最大显示数量
    showFull?: boolean    // 是否显示完整路径
}): void
```

### 方案 3：完全移除截断
```typescript
// 始终显示完整路径
const displayNames = names
```

### 方案 4：智能截断
```typescript
// 根据终端宽度动态调整
const terminalWidth = process.stdout.columns || 80
const maxChainLength = Math.floor(terminalWidth / 20)  // 每个规则名约 20 字符
```

## 📊 统计信息

从输出日志中可以看到：
- 总规则调用：235 次
- 实际执行：234 次
- 缓存命中：47 次 (20.0%)
- 最深规则链：约 20+ 层

这说明规则链确实很长，5 个规则的阈值远远不够。

