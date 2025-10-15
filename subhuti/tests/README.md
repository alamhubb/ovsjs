# Subhuti Or回退问题测试

## 问题描述

当Or的某个分支**部分匹配成功**但最终失败时，Or回退机制未能正确清理CST状态。

## 复现问题

**测试用例：**
```javascript
// cases/02-or-backtrack-simple.js
var x = (1 < 2) || false;
```

**运行测试：**
```bash
cd subhuti
npx tsx tests/test-or-backtrack.ts
```

## 问题现象

**期望：** 解析为 `LogicalOrExpression`
**实际：** Parser报错 `createArrowFunctionAst: 期望3个children，实际1个`

## 原因分析

### 解析流程

```
AssignmentExpression
  └─ Or([
       ArrowFunction,           ← 第一个分支
       ConditionalExpression    ← 第二个分支（正确）
     ])
```

### 问题步骤

1. **ArrowFunction分支**:
   - `ArrowParameters()` 匹配 `(1 < 2)` ✅ → 消费了5个tokens，创建了CST子节点
   - `tokenConsumer.Arrow()` 期望 `=>` ❌ → 实际是 `||`
   - **期望：** Or检测到失败，执行 `setBackData()` 回退
   - **实际：** tokens回退了，但CST子节点未清理

2. **ConditionalExpression分支**:
   - 因为前一个分支的CST未清理
   - 导致CST结构混乱
   - 或者根本没有尝试第二个分支

## 根本原因（3个推测）

### 推测1: continueForAndNoBreak状态异常

```typescript
// SubhutiParser.ts 第534行
if (this.continueForAndNoBreak) {
  break  // 认为成功，跳出Or
}
```

可能Arrow token失败时，`continueForAndNoBreak`未正确设置为false。

### 推测2: CST清理不完整

```typescript
// SubhutiParser.ts 第559行
this.setBackData(backData)  // 只回退tokens
```

`setBackData`只恢复tokens位置，未清理`curCstChildren`中已添加的子节点。

### 推测3: allowError机制干扰

```typescript
// SubhutiParser.ts 第524行
this.setAllowError(true)  // 允许错误
```

Arrow token失败时被"静默处理"，没有触发Or的回退逻辑。

## 解决方案

### 方案1: ArrowFunction增加lookahead（推荐）

```typescript
ArrowFunction() {
  // 先检查后面是否有 =>
  if (!this.hasArrowTokenAhead()) {
    throw Error('Not an arrow function')
  }
  
  this.ArrowParameters()
  this.tokenConsumer.Arrow()
  this.ConciseBody()
}

hasArrowTokenAhead(): boolean {
  // 扫描tokens，在RParen或Identifier后查找Arrow token
  // 如果没有，立即返回false，触发Or尝试下一个分支
}
```

**优点：** 在ArrowParameters之前就判断，避免部分匹配
**缺点：** 需要实现lookahead机制

### 方案2: 修复Or的CST清理

```typescript
// SubhutiParser.ts Or方法中
if (!this.continueForAndNoBreak) {
  // 分支失败，回退状态
  this.setBackData(backData)
  this.clearPartialCST(backData)  // 新增：清理CST子节点
}
```

**优点：** 从根本上解决Or回退问题
**缺点：** 需要修改Subhuti框架核心逻辑

### 方案3: 调整Or顺序

```typescript
AssignmentExpression() {
  this.Or([
    ConditionalExpression,  // 先尝试
    ArrowFunction           // 后尝试
  ])
}
```

**优点：** 不修改框架，只调整顺序
**缺点：** 治标不治本，其他地方可能有同样问题

## 相关测试用例

**slime项目中复现此问题的测试：**
- `slime/tests/cases/single/05-logical-ops.js` - 复合逻辑表达式
- `slime/tests/cases/combined/23-functions.js` - IIFE

**运行slime测试：**
```bash
cd slime
npm test
```

这些测试会失败并报错 `createArrowFunctionAst: 期望3个children，实际1个`

## 建议

1. **短期：** 在Es6Parser的ArrowFunction中增加简单的lookahead检查
2. **长期：** 修复Subhuti的Or回退机制，确保CST清理完整

