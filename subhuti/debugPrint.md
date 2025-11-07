# Subhuti Debug 输出优化方案

## 版本：v5.0 - 极简输出版

**日期：** 2025-11-06  
**状态：** 设计中

---

## 🎯 设计目标

### 核心原则

1. **只输出成功路径** - 失败的分支不显示详细信息
2. **规则链合并** - 连续规则用 `>` 连接显示
3. **Or 分支清晰** - 显示所有 Or 选项的成功/失败
4. **缩进有意义** - 只有 Token 消费才右推缩进
5. **信息密度高** - 减少 95% 无用输出

### 优化效果

- **原输出：** ~3000 行（90% 是失败尝试）
- **新输出：** ~70 行（只有有效信息）
- **减少：** 97% 的输出

---

## 📊 完美输出格式示例

### **测试代码：** `const obj = { sum: 5 + 6 }`

```
🔬 二分增量调试模式
================================================================================
策略：从最底层规则逐层测试，找出问题层级


[▸▸▸▸▸] 测试层级 5: Script
--------------------------------------------------------------------------------
➡️  Script > StatementList > StatementListItem
🔀 Or → trying Statement (#1/2)
🔀 Or → trying Declaration (#2/2)
➡️  Declaration
🔀 Or (#1/3) ❌ HoistableDeclaration > FunctionDeclaration > GeneratorDeclaration > AsyncFunctionDeclaration > AsyncGeneratorDeclaration (5 rules)
🔀 Or (#2/3) ❌ ClassDeclaration
🔀 Or (#3/3) LexicalDeclaration > LetOrConst
✅ LetOrConst
🔀 Or (#1/2) ❌ LetTok
🔀 Or (#2/2) ✅ ConstTok
  🔹 Consume  token[0] - const - <ConstTok>  ✅
  ➡️  BindingList > LexicalBinding > BindingIdentifier > Identifier
  🔀 Or (#1/3) ❌ Yield
  🔀 Or (#2/3) ❌ Await
  🔀 Or (#3/3) ✅ Identifier
    🔹 Consume  token[1] - obj - <Identifier>  ✅
    ➡️  Initializer
      🔹 Consume  token[2] - = - <Assign>  ✅
      ➡️  AssignmentExpression
      🔀 Or (#1/8) ConditionalExpression > ShortCircuitExpression > LogicalORExpression > LogicalANDExpression > BitwiseORExpression > BitwiseXORExpression > BitwiseANDExpression > EqualityExpression > RelationalExpression > ShiftExpression > AdditiveExpression > MultiplicativeExpression
      ✅ ExponentiationExpression
      🔀 Or (#1/2) UpdateExpression > LeftHandSideExpression > NewExpression
      ✅ MemberExpression
      🔀 Or (#1/4) ✅ PrimaryExpression
      🔀 Or (#1/13) ❌ ThisTok
      🔀 Or (#2/13) ❌ IdentifierReference > Identifier (4 rules)
      🔀 Or (#3/13) ❌ Literal > NullLiteral > BooleanLiteral > StringLiteral > NumericLiteral (6 rules)
      🔀 Or (#4/13) ❌ ArrayLiteral (4 rules)
      🔀 Or (#5/13) ✅ ObjectLiteral
      🔀 Or (#1/3) ❌ LBrace + RBrace
      🔀 Or (#2/3) ✅ LBrace + PropertyDefinitionList + RBrace
        🔹 Consume  token[3] - { - <LBrace>  ✅
        ➡️  PropertyDefinitionList > PropertyDefinition
        🔀 Or (#1/5) ❌ IdentifierReference
        🔀 Or (#2/5) PropertyName + Colon + AssignmentExpression
        ✅ PropertyName
        🔀 Or (#1/2) ✅ LiteralPropertyName
        🔀 Or (#1/3) ✅ IdentifierName
          🔹 Consume  token[4] - sum - <Identifier>  ✅
          🔹 Consume  token[5] - : - <Colon>  ✅
          ➡️  AssignmentExpression
          🔀 Or (#1/8) ConditionalExpression > ShortCircuitExpression > LogicalORExpression > LogicalANDExpression > BitwiseORExpression > BitwiseXORExpression > BitwiseANDExpression > EqualityExpression > RelationalExpression > ShiftExpression > AdditiveExpression > MultiplicativeExpression
          ✅ ExponentiationExpression
          🔀 Or (#1/2) UpdateExpression > LeftHandSideExpression > NewExpression
          ✅ MemberExpression
          🔀 Or (#1/4) ✅ PrimaryExpression
          🔀 Or (#1/13) ❌ ThisTok
          🔀 Or (#2/13) ❌ IdentifierReference (4 rules)
          🔀 Or (#3/13) ✅ Literal
          🔀 Or (#1/5) ❌ NullLiteral
          🔀 Or (#2/5) ❌ BooleanLiteral
          🔀 Or (#3/5) ❌ StringLiteral
          🔀 Or (#4/5) ✅ NumericLiteral
            🔹 Consume  token[6] - 5 - <NumericLiteral>  ✅
            🔹 Consume  token[7] - + - <Plus>  ✅
            ➡️  MultiplicativeExpression > ExponentiationExpression
            ✅ ExponentiationExpression
            🔀 Or (#1/2) UpdateExpression > LeftHandSideExpression > NewExpression
            ✅ MemberExpression
            🔀 Or (#1/4) ✅ PrimaryExpression
            🔀 Or (#1/13) ❌ ThisTok
            🔀 Or (#2/13) ❌ IdentifierReference (4 rules)
            🔀 Or (#3/13) ✅ Literal
            🔀 Or (#1/5) ❌ NullLiteral
            🔀 Or (#2/5) ❌ BooleanLiteral
            🔀 Or (#3/5) ❌ StringLiteral
            🔀 Or (#4/5) ✅ NumericLiteral
              🔹 Consume  token[8] - 6 - <NumericLiteral>  ✅
              🔹 Consume  token[9] - } - <RBrace>  ✅
              ➡️  SemicolonASI

============================================================
【性能摘要和 CST 验证保持不变】
```

---

## 🔍 输出格式规则详解

### 1. 规则链显示

**格式：** `➡️  规则1 > 规则2 > 规则3`

**何时合并：**
- ✅ 连续规则进入（没有分支、没有 Token 消费）
- ✅ 用 `>` 连接

**何时不合并：**
- ❌ 遇到 Or 分支
- ❌ 遇到 Token 消费
- ❌ 遇到有子 Or 的规则

**示例：**
```
➡️  LogicalORExpression > LogicalANDExpression > BitwiseORExpression > BitwiseXORExpression > BitwiseANDExpression > EqualityExpression > RelationalExpression > ShiftExpression > AdditiveExpression > MultiplicativeExpression
```

---

### 2. Or 分支显示

**格式：**

```typescript
// Or 开始（顶层 Or）
🔀 Or → trying 规则名 (#1/总数)

// 失败的分支（单个规则）
🔀 Or (#序号/总数) ❌ 规则名

// 失败的分支（规则链）
🔀 Or (#序号/总数) ❌ 规则1 > 规则2 > 规则3 (N rules)

// 成功的分支（单个规则）
🔀 Or (#序号/总数) ✅ 规则名

// 成功的分支（规则链，最后一个有子 Or）
🔀 Or (#序号/总数) 规则1 > 规则2      // 不显示 ✅，不包括最后一个
✅ 规则3                               // 单独显示最后一个（带 ✅）

// 成功的分支（规则链，最后一个没有子 Or）
🔀 Or (#序号/总数) ✅ 规则1 > 规则2 > 规则3  // 显示完整规则链 + ✅
```

**序号规则：**
- ✅ 从 1 开始（用户友好）
- ✅ 显示为 `#1/3`, `#2/3`, `#3/3`

**示例：**

```
➡️  LetOrConst
🔀 Or (#1/2) ❌ LetTok
🔀 Or (#2/2) ✅ ConstTok
  🔹 Consume  token[0] - const - <ConstTok>  ✅

➡️  ExponentiationExpression
🔀 Or (#1/2) UpdateExpression > LeftHandSideExpression > NewExpression
✅ MemberExpression                    // 单独显示最后一个规则（带 ✅）
🔀 Or (#1/4) ✅ PrimaryExpression
🔀 Or (#1/13) ❌ ThisTok
🔀 Or (#2/13) ❌ IdentifierReference (4 rules)
🔀 Or (#3/13) ✅ Literal
```

---

### 3. 缩进规则

**唯一的缩进触发条件：Token 消费成功**

```typescript
Level 0（初始）
➡️  Script
🔀 Or (#2/2) ✅ ConstTok
  🔹 Consume  token[0] - const - <ConstTok>  ✅  ← Token 消费

  Level 1（token[0] 之后）
  ➡️  BindingList
  🔀 Or (#3/3) ✅ Identifier
    🔹 Consume  token[1] - obj - <Identifier>  ✅  ← 又消费 Token

    Level 2（token[1] 之后）
    ➡️  Initializer
      🔹 Consume  token[2] - = - <Assign>  ✅

      Level 3（token[2] 之后）
      ➡️  AssignmentExpression
      🔀 Or (#5/13) ✅ ObjectLiteral
      🔀 Or (#2/3) ✅ LBrace + PropertyDefinitionList + RBrace
        🔹 Consume  token[3] - { - <LBrace>  ✅

        Level 4（token[3] 之后）
        ...
```

**特点：**
- 每一级缩进 = 消费了一个 Token
- Or 分支不右推（与父级对齐）
- 最大缩进层级 = Token 数量

---

### 4. 不显示的内容

**完全移除：**
1. ❌ 失败的 Token 消费（`🔹 ... ❌`）
2. ❌ Or failed 提示（`🔀 Or failed, trying`）
3. ❌ 回溯信息（`⏪ Backtrack`）
4. ❌ Many/AtLeastOne/Option 的缩进影响

**简化显示：**
1. 失败的分支（规则链）→ 折叠为一行（显示规则数量）
2. 嵌套的 Or → 垂直对齐，不右推

---

## 🔧 实现逻辑

### 核心数据结构

```typescript
class SubhutiTraceDebugger {
    // 缩进级别（只有 Token 消费才增加）
    private indentLevel = 0
    
    // 规则栈（追踪当前解析路径）
    private ruleStack: Array<{
        ruleName: string
        indentLevel: number
        hasConsumedToken: boolean  // 是否消费了 Token
        hasOrBranch: boolean       // 是否有 Or 分支
    }> = []
    
    // 待输出的规则链（累积后一次性输出）
    private pendingRules: string[] = []
    
    // Or 分支追踪（记录 Or 的所有分支信息）
    private orStack: Array<{
        parentRule: string       // Or 所属的规则
        totalBranches: number    // 总分支数
        currentBranch: number    // 当前分支索引
        branches: Array<{
            index: number        // 分支索引（从 0 开始）
            ruleName?: string    // 分支规则名
            success: boolean     // 是否成功
            ruleChain: string[]  // 分支内的规则链
        }>
        indentLevel: number      // Or 的缩进级别
        hasPrinted: boolean      // 是否已输出
    }> = []
}
```

---

### 算法流程

#### **1. 规则进入（onRuleEnter）**

```typescript
onRuleEnter(ruleName: string) {
    // 1. 记录到规则栈
    this.ruleStack.push({
        ruleName,
        indentLevel: this.indentLevel,
        hasConsumedToken: false,
        hasOrBranch: false
    })
    
    // 2. 加入待输出队列（不立即输出）
    this.pendingRules.push(ruleName)
    
    // 3. 如果在 Or 分支中，记录到分支的规则链
    if (this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch) {
            currentBranch.ruleChain.push(ruleName)
        }
    }
}
```

#### **2. 规则退出（onRuleExit）**

```typescript
onRuleExit(ruleName: string) {
    const exitedRule = this.ruleStack.pop()
    
    // 1. 如果在 Or 分支中，从分支规则链中移除
    if (this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch && currentBranch.ruleChain.length > 0) {
            currentBranch.ruleChain.pop()
        }
    }
    
    // 2. 如果该规则没有 Or 分支且没有消费 Token，从待输出队列移除
    if (!exitedRule.hasOrBranch && !exitedRule.hasConsumedToken) {
        this.pendingRules.pop()
    }
    
    // 3. 如果该规则有 Or 分支，在退出时输出 Or 结果
    if (exitedRule.hasOrBranch) {
        this.flushOrBranches()
    }
    
    // 4. 恢复缩进（只在消费 Token 时才需要）
    if (exitedRule.hasConsumedToken) {
        this.indentLevel = exitedRule.indentLevel
    }
}
```

#### **3. Token 消费（onTokenConsume）**

```typescript
onTokenConsume(tokenIndex, tokenValue, tokenName, success) {
    // 只处理成功的 Token 消费
    if (!success) {
        return
    }
    
    // 1. 先输出待处理的 Or 分支
    this.flushOrBranches()
    
    // 2. 然后输出待处理的规则链
    this.flushPendingRules()
    
    // 3. 输出 Token 消费
    const indent = '  '.repeat(this.indentLevel)
    console.log(`${indent}🔹 Consume  token[${tokenIndex}] - ${tokenValue} - <${tokenName}>  ✅`)
    
    // 4. 标记当前 Or 的当前分支成功
    if (this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch) {
            currentBranch.success = true
        }
    }
    
    // 5. Token 消费后右推缩进
    this.indentLevel++
    
    // 6. 标记当前规则已消费 Token
    if (this.ruleStack.length > 0) {
        this.ruleStack[this.ruleStack.length - 1].hasConsumedToken = true
    }
}
```

#### **4. Or 分支（onOrBranch）**

```typescript
onOrBranch(branchIndex, totalBranches, tokenIndex, ruleName, isRetry) {
    // 标记当前规则有 Or 分支
    if (this.ruleStack.length > 0) {
        this.ruleStack[this.ruleStack.length - 1].hasOrBranch = true
    }
    
    // 检测新的 Or（branchIndex = 0）
    if (branchIndex === 0) {
        // 1. 输出上一个未完成的 Or
        this.flushOrBranches()
        
        // 2. 输出待处理的规则链
        this.flushPendingRules()
        
        // 3. 创建新的 Or 追踪
        const parentRule = this.ruleStack[this.ruleStack.length - 1].ruleName
        
        this.orStack.push({
            parentRule,
            totalBranches,
            currentBranch: 0,
            branches: [],
            indentLevel: this.indentLevel,
            hasPrinted: false
        })
    }
    
    // 记录当前分支
    const currentOr = this.orStack[this.orStack.length - 1]
    if (currentOr) {
        currentOr.currentBranch = branchIndex
        
        currentOr.branches[branchIndex] = {
            index: branchIndex,
            ruleName: ruleName || 'alt',
            success: false,
            ruleChain: []  // 会在规则进入时累积
        }
    }
}
```

#### **5. 输出 Or 分支（flushOrBranches）**

```typescript
private flushOrBranches() {
    if (this.orStack.length === 0) return
    
    const orInfo = this.orStack.pop()!
    if (orInfo.hasPrinted) return
    
    const indent = '  '.repeat(orInfo.indentLevel)
    
    // 输出所有分支
    for (let i = 0; i < orInfo.totalBranches; i++) {
        const branch = orInfo.branches[i]
        if (!branch) continue  // 未尝试的分支
        
        const userIndex = i + 1  // 序号从 1 开始
        const status = branch.success ? '✅' : '❌'
        
        // 获取显示名称
        let displayName = ''
        if (branch.ruleChain && branch.ruleChain.length > 0) {
            displayName = branch.ruleChain.join(' > ')
        } else {
            displayName = branch.ruleName || 'alt'
        }
        
        // 判断是否需要在下面单独显示最后一个规则
        const isRuleChain = branch.ruleChain && branch.ruleChain.length > 1
        const lastRuleHasOr = /* 需要检测最后一个规则是否有子 Or */
        const needsSeparateLine = isRuleChain && branch.success && lastRuleHasOr
        
        if (needsSeparateLine) {
            // 规则链（最后一个有 Or）
            const chainWithoutLast = branch.ruleChain.slice(0, -1).join(' > ')
            const lastRule = branch.ruleChain[branch.ruleChain.length - 1]
            
            // Or 那行不显示 ✅，不包括最后一个规则
            console.log(`${indent}🔀 Or (#${userIndex}/${orInfo.totalBranches}) ${chainWithoutLast}`)
            
            // 单独显示最后一个规则（带 ✅）
            console.log(`${indent}✅ ${lastRule}`)
        } else {
            // 单个规则 或 失败的分支 或 完整规则链
            console.log(`${indent}🔀 Or (#${userIndex}/${orInfo.totalBranches}) ${status} ${displayName}`)
        }
    }
    
    orInfo.hasPrinted = true
}
```

---

### 6. 输出规则链（flushPendingRules）

```typescript
private flushPendingRules() {
    if (this.pendingRules.length === 0) return
    
    const indent = '  '.repeat(this.indentLevel)
    const ruleChain = this.pendingRules.join(' > ')
    console.log(`${indent}➡️  ${ruleChain}`)
    
    this.pendingRules = []
}
```

---

## 🎯 关键实现难点

### 难点 1：Or 分支的规则链边界

**问题：** 如何区分 Or 分支内的规则和外层规则？

```
// 例如：
AssignmentExpression          ← 外层规则
  Or 分支 1:
    ConditionalExpression     ← 分支内规则
    ShortCircuitExpression    ← 分支内规则
    LogicalORExpression       ← 分支内规则
```

**解决方案：**
- onOrBranch（branchIndex = 0）时，清空分支的 ruleChain
- onRuleEnter 时，追加到当前分支的 ruleChain
- onRuleExit 时，从分支的 ruleChain 中移除

---

### 难点 2：检测最后一个规则是否有子 Or

**问题：** 如何知道规则链的最后一个规则是否有子 Or 分支？

**方案 A：** 延迟判断
- 在 flushOrBranches 时，检查是否有嵌套的 Or
- 如果有，就在下面单独显示

**方案 B：** 标记机制
- onRuleEnter 时，标记规则是否有 Or
- onRuleExit 时，将信息传递给父 Or

**推荐：** 方案 A（简单实用）

---

### 难点 3：成功分支的识别

**问题：** 如何知道哪个分支成功了？

**解决方案：**
- Token 消费成功时，标记当前分支为成功
- Or 结束时（flush），找出成功的分支

```typescript
onTokenConsume(success) {
    if (success && this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch) {
            currentBranch.success = true
        }
    }
}
```

---

## 📋 实现步骤

### 第一步：基础优化（已完成）

- [x] 只显示成功的 Token 消费
- [x] 规则链合并显示
- [x] Or 序号从 1 开始
- [x] 只有 Token 消费才右推缩进
- [x] 移除回溯输出

### 第二步：Or 分支追踪（进行中）

- [x] 创建 Or 分支追踪数据结构
- [x] onOrBranch 记录分支信息
- [x] onRuleEnter 累积分支规则链
- [x] onRuleExit 清理分支规则链
- [x] onTokenConsume 标记成功分支
- [ ] flushOrBranches 正确输出所有分支

### 第三步：智能显示（待实现）

- [ ] 检测规则链的最后一个规则是否有子 Or
- [ ] 规则链的 ✅ 显示位置（Or 那行 vs 单独一行）
- [ ] 失败分支的折叠显示（显示规则数量）

### 第四步：测试验证

- [ ] 测试简单代码：`let a = 1`
- [ ] 测试复杂代码：`const obj = { sum: 5 + 6 }`
- [ ] 验证输出行数减少 95%+
- [ ] 验证所有信息完整保留

---

## 🐛 当前问题

### 问题 1：规则链包含外层规则

**现象：**
```
🔀 Or (#4/13) ❌ ExpressionStatement > Expression > AssignmentExpression
```

**问题：**
- `ExpressionStatement > Expression > AssignmentExpression` 是外层规则
- 应该只显示分支内的规则

**原因：**
- `pendingRules` 累积了所有外层规则
- 分支的 `ruleChain` 记录时包括了外层规则

**解决方案：**
```typescript
onOrBranch(branchIndex) {
    if (branchIndex === 0) {
        // 在新 Or 开始时，清空 pendingRules
        // 这样分支内的规则链就不会包含外层规则
        this.flushPendingRules()  // 先输出外层规则
        
        // 然后创建 Or 追踪（此时 pendingRules 为空）
        ...
    }
}

onRuleEnter(ruleName) {
    // 记录到分支规则链时，只记录分支内的规则
    if (this.orStack.length > 0) {
        const currentBranch = ...
        // pendingRules 已在 Or 开始时清空
        // 所以这里只会记录分支内的规则
        currentBranch.ruleChain = [...this.pendingRules, ruleName]
    }
    
    this.pendingRules.push(ruleName)
}
```

---

### 问题 2：所有分支都显示为 ❌

**现象：**
```
🔀 Or (#1/2) ❌ LetTok
🔀 Or (#2/2) ❌ ConstTok        ← 应该是 ✅，因为成功消费了 Token
```

**问题：**
- Token 消费时标记了 `success = true`
- 但在 flushOrBranches 时，分支状态没有正确传递

**原因：**
- Or 分支在 Token 消费前就退出了
- success 标记可能在错误的时机

**解决方案：**
```typescript
// 方案 A：在 Token 消费时立即标记
onTokenConsume(success) {
    if (success && this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch) {
            currentBranch.success = true
        }
    }
}

// 方案 B：在 Or 分支成功时标记（通过 Parser 状态推断）
// Parser.Or() 中：
// if (this._parseSuccess) {
//     // 说明当前分支成功了
// }
// 但我们无法直接知道这个状态...

// 结论：使用方案 A（已实现，但可能时机不对）
```

---

### 问题 3：重复的规则链输出

**现象：**
```
➡️  LexicalDeclaration > LetOrConst
🔀 Or (#1/2) ❌ LetTok
...
➡️  LexicalDeclaration > LetOrConst   ← 重复了
🔀 Or (#1/2) ❌ LetTok
```

**原因：**
- 同一段代码被解析两次（第一次失败，回溯后重试）
- Or 分支没有完全清理

**解决方案：**
- 确保 Or 结束时清空 orStack
- 避免重复输出

---

## 🔧 待修复的逻辑

### 修复 1：正确追踪分支规则链

```typescript
onOrBranch(branchIndex) {
    if (branchIndex === 0) {
        // 先输出外层规则链
        this.flushPendingRules()
        
        // 创建 Or（此时 pendingRules 为空）
        this.orStack.push({
            ...
            branchRuleStartIndex: this.ruleStack.length  // 记录分支开始时的规则栈深度
        })
    }
    
    // 记录分支（不需要复制 pendingRules）
    currentOr.branches[branchIndex] = {
        index: branchIndex,
        ruleName: ruleName || 'alt',
        success: false,
        ruleChain: [],  // 空数组，会在 onRuleEnter 时填充
        ruleStackDepth: this.ruleStack.length  // 记录分支开始时的深度
    }
}

onRuleEnter(ruleName) {
    ...
    
    // 只记录分支内的规则（深度 > 分支开始深度）
    if (this.orStack.length > 0) {
        const currentOr = this.orStack[this.orStack.length - 1]
        const currentBranch = currentOr.branches[currentOr.currentBranch]
        if (currentBranch) {
            // 只有当规则栈深度 > 分支开始深度时，才是分支内的规则
            if (this.ruleStack.length > currentBranch.ruleStackDepth) {
                currentBranch.ruleChain.push(ruleName)
            }
        }
    }
}
```

---

### 修复 2：检测最后一个规则是否有子 Or

```typescript
private flushOrBranches() {
    ...
    
    for (const branch of orInfo.branches) {
        ...
        
        // 检测规则链的最后一个规则是否有子 Or
        let lastRuleHasChildOr = false
        if (branch.ruleChain && branch.ruleChain.length > 0) {
            const lastRule = branch.ruleChain[branch.ruleChain.length - 1]
            
            // 方法：检查 orStack 中是否有以 lastRule 为 parent 的 Or
            // 或者：简化处理，检查后续是否立即有同缩进级别的 Or 输出
            
            // 简化方案：如果规则链长度 > 1，就认为最后一个可能有子 Or
            // （因为规则链中间的规则肯定没有 Or，否则会断开）
            lastRuleHasChildOr = branch.ruleChain.length > 1
        }
        
        if (lastRuleHasChildOr && branch.success) {
            // 规则链（最后一个有 Or）
            const chainWithoutLast = branch.ruleChain.slice(0, -1).join(' > ')
            const lastRule = branch.ruleChain[branch.ruleChain.length - 1]
            
            console.log(`${indent}🔀 Or (#${userIndex}/${orInfo.totalBranches}) ${chainWithoutLast}`)
            console.log(`${indent}✅ ${lastRule}`)
        } else {
            // 单个规则 或 完整规则链
            console.log(`${indent}🔀 Or (#${userIndex}/${orInfo.totalBranches}) ${status} ${displayName}`)
        }
    }
    
    orInfo.hasPrinted = true
}
```

---

## ✅ 验收标准

### 1. 输出格式

**必须满足：**
- [ ] Or 序号从 1 开始
- [ ] Or 分支垂直对齐（不右推）
- [ ] 只显示成功的 Token 消费
- [ ] 规则链合并显示（用 `>` 连接）
- [ ] 只有 Token 消费才右推缩进
- [ ] 成功的分支显示 ✅
- [ ] 失败的分支显示 ❌
- [ ] 规则链的最后一个规则单独显示（如果有子 Or）

### 2. 输出减少

- [ ] 输出行数减少 95%+（3000 行 → 70 行）
- [ ] 无重复信息
- [ ] 无无用输出

### 3. 信息完整性

- [ ] 所有 Token 消费都显示
- [ ] 所有 Or 分支都显示
- [ ] 成功的规则路径完整
- [ ] 性能统计准确
- [ ] CST 验证完整

---

## 🔄 后续优化方向

### 可选优化 1：失败分支折叠

```
// 当前：
🔀 Or (#1/13) ❌ BlockStatement > Block
🔀 Or (#2/13) ❌ VariableStatement
🔀 Or (#3/13) ❌ EmptyStatement
...（显示所有失败分支）

// 优化：
🔀 Or (#1-12/13) ❌ BlockStatement, VariableStatement, EmptyStatement... (12 failed)
🔀 Or (#13/13) ✅ LexicalDeclaration
```

### 可选优化 2：规则路径导航

```
// 显示完整路径（面包屑）
📍 Script > StatementList > Declaration > LexicalDeclaration
  🔹 [0] const ✅
  🔹 [1] obj ✅
```

### 可选优化 3：智能摘要

```
✅ 解析成功
   路径: Script > StatementList > Declaration > LexicalDeclaration
   Token: const obj = { sum : 5 + 6 }
   耗时: 348ms
   规则: 282 次调用
```

---

## 📝 实现检查清单

### Phase 1：基础优化（已完成 80%）

- [x] 创建 Or 分支追踪数据结构
- [x] 实现 onOrBranch 记录分支
- [x] 实现 onRuleEnter 累积规则链
- [x] 实现 onRuleExit 清理规则链
- [x] 实现 onTokenConsume 标记成功分支
- [ ] 修复：规则链边界问题
- [ ] 修复：成功标记传递问题

### Phase 2：智能显示（待实现）

- [ ] 检测规则链的最后一个规则是否有子 Or
- [ ] Or 结果的 ✅ 位置（Or 行 vs 单独行）
- [ ] 失败分支的折叠显示

### Phase 3：测试验证（待进行）

- [ ] 测试简单代码
- [ ] 测试复杂代码
- [ ] 验证输出减少 95%
- [ ] 验证信息完整

---

## 🎨 输出格式速查

### 规则进入

```
➡️  规则1 > 规则2 > 规则3    // 规则链（没有 Or、没有 Token 消费）
```

### Or 分支

```
// 失败（单个规则）
🔀 Or (#1/3) ❌ 规则名

// 失败（规则链）
🔀 Or (#2/3) ❌ 规则1 > 规则2 > 规则3

// 成功（单个规则）
🔀 Or (#3/3) ✅ 规则名

// 成功（规则链，最后一个有子 Or）
🔀 Or (#3/3) 规则1 > 规则2        // 不显示 ✅
✅ 规则3                           // 单独显示（带 ✅）

// 成功（规则链，最后一个没有子 Or）
🔀 Or (#3/3) ✅ 规则1 > 规则2 > 规则3
```

### Token 消费

```
🔹 Consume  token[0] - const - <ConstTok>  ✅
```

### 缩进层级

```
Level 0: 初始状态
  Level 1: token[0] 之后
    Level 2: token[1] 之后
      Level 3: token[2] 之后
        Level 4: token[3] 之后
          ...
```

---

## 🔍 调试提示

### 如何验证实现正确

1. **检查 Or 分支数量**
   - flushOrBranches 输出的分支数 = totalBranches

2. **检查成功标记**
   - 至少有一个分支是 ✅
   - 只有一个分支是 ✅（Or 只选一个）

3. **检查规则链边界**
   - 分支规则链不包含外层规则
   - 分支规则链只包含该分支内的规则

4. **检查缩进层级**
   - 缩进层级 = Token 消费次数
   - Or 分支不改变缩进

---

## 📌 总结

**核心思想：**
- 延迟输出（accumulate then flush）
- 状态追踪（Or stack, Rule stack）
- 智能判断（规则链边界，成功分支）

**关键方法：**
- `flushPendingRules()` - 输出规则链
- `flushOrBranches()` - 输出 Or 分支
- `onTokenConsume()` - 触发输出 + 右推缩进
- `onRuleExit()` - 触发 Or 输出

**输出触发时机：**
1. Token 消费前 → flush Or → flush Rules
2. 新 Or 开始前 → flush 上一个 Or → flush Rules
3. 有 Or 的规则退出时 → flush Or

---

**最后更新：** 2025-11-06
**实现进度：** 60% (基础优化已完成，智能显示待实现)






测试代码: let a = 1

期望的规则路径输出：
================================================================================

Script > StatementList > StatementListItem > Declaration > LexicalDeclaration
LetOrConst [Or]
🔹 Consume token[0] - let - <LetTok> [1:1-3] ✅
BindingList > LexicalBinding
BindingIdentifier [Or]
Identifier [#1/3 ✅]
🔹 Consume token[1] - a - <Identifier> [1:5-5] ✅
Initializer
🔹 Consume token[2] - = - <Assign> [1:7-7] ✅
AssignmentExpression > ConditionalExpression > ShortCircuitExpression > ... > MemberExpression > PrimaryExpression
Literal [Or]
🔹 Consume token[3] - 1 - <NumericLiteral> [1:9-9] ✅

缩进深度说明：
================================================================================

depth=0: Script > ... > LexicalDeclaration（折叠链，5个规则）
depth=1: LetOrConst [Or]（LexicalDeclaration 的子节点）
depth=2:   token
depth=1: BindingList > LexicalBinding（折叠链，2个规则，与 LetOrConst 同级）
depth=2:   BindingIdentifier [Or]（LexicalBinding 的子节点）
depth=3:     Identifier（BindingIdentifier 的子节点）
depth=4:       token
depth=2:   Initializer（与 BindingIdentifier 同级）
depth=3:     token
depth=3:     AssignmentExpression > ... > PrimaryExpression（折叠链，18个规则）
depth=4:       Literal [Or]
depth=5:         token

关键规则：
================================================================================

1. 折叠链显示在第一个规则的 depth
2. 折叠链后的规则，displayDepth = realDepth - chainLastDepth
3. 多个折叠链时，adjustment 要累积/更新












