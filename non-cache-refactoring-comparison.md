# 非缓存场景重构对比：提前标记 vs 遍历时赋值

## 📋 对比说明

- **修改前**：提前遍历一次，标记所有规则的 `shouldBreakLine`，然后再遍历输出
- **修改后**：遍历时直接判断是否到达断点，边判断边赋值 `shouldBreakLine`

---

## ❌ 修改前：提前标记 `shouldBreakLine`（两次遍历）

```typescript
private static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[], pending: RuleStackItem[]): void {
    // 【第一步】计算基准深度
    const baseDepth = ...

    // 【第二步】计算断点
    const breakPoint = ...

    // ═══════════════════════════════════════════════════════════════
    // 【第三步】提前标记每个规则的 shouldBreakLine（第一次遍历）
    // ═══════════════════════════════════════════════════════════════
    for (let i = 0; i < pending.length; i++) {
        pending[i].shouldBreakLine = (breakPoint >= 0) ? (i >= breakPoint) : true
        // ↑ 提前标记，但此时还没有输出
    }

    // ═══════════════════════════════════════════════════════════════
    // 【第四步】遍历输出（第二次遍历）
    // ═══════════════════════════════════════════════════════════════
    let relativeDepth = 0
    let chainRules: RuleStackItem[] = []

    for (const rule of pending) {
        if (rule.shouldBreakLine) {  // ← 使用之前标记的值
            // 处理折叠链
            if (chainRules.length > 0) {
                for (const chainRule of chainRules) {
                    chainRule.relativeDepthByStack = relativeDepth
                    chainRule.displayDepth = baseDepth + relativeDepth
                }
                this.printChainRule(chainRules, chainRules[0].displayDepth!)
                relativeDepth++
                chainRules = []
            }

            // 输出当前规则
            rule.relativeDepthByStack = relativeDepth
            rule.displayDepth = baseDepth + relativeDepth
            this.printSingleRule([rule], rule.displayDepth)
            relativeDepth++
        } else {
            chainRules.push(rule)
        }
    }

    // 处理剩余折叠链
    if (chainRules.length > 0) {
        for (const chainRule of chainRules) {
            chainRule.relativeDepthByStack = relativeDepth
            chainRule.displayDepth = baseDepth + relativeDepth
        }
        this.printChainRule(chainRules, chainRules[0].displayDepth!)
    }
}
```

**特点：**
- ❌ **两次遍历** pending 数组
- ❌ 第一次遍历只是标记，没有实际输出
- ❌ `shouldBreakLine` 在输出前就被设置，但可能不会被用到（如果规则被折叠）

---

## ✅ 修改后：遍历时赋值 `shouldBreakLine`（一次遍历）

```typescript
private static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[], pending: RuleStackItem[]): void {
    // 【第一步】计算基准深度
    const baseDepth = ...

    // 【第二步】计算断点
    const breakPoint = ...

    // ═══════════════════════════════════════════════════════════════
    // 【第三步】遍历输出，同时赋值 shouldBreakLine（只遍历一次）
    // ═══════════════════════════════════════════════════════════════
    let relativeDepth = 0
    let chainRules: RuleStackItem[] = []

    for (let i = 0; i < pending.length; i++) {
        const rule = pending[i]
        
        // 判断当前规则是否需要断链
        const shouldBreak = (breakPoint >= 0) ? (i >= breakPoint) : true
        // ↑ 每次循环时判断，而不是提前标记

        if (shouldBreak) {
            // ═══════════════════════════════════════════════════
            // 当前规则需要断链（单独输出）
            // ═══════════════════════════════════════════════════

            // 【步骤 1】先处理之前积累的折叠链
            if (chainRules.length > 0) {
                // 设置折叠链中所有规则的属性
                for (const chainRule of chainRules) {
                    chainRule.shouldBreakLine = false              // ← 赋值：折叠
                    chainRule.relativeDepthByStack = relativeDepth // ← 赋值：相对深度
                    chainRule.displayDepth = baseDepth + relativeDepth
                }
                // 输出折叠链
                this.printChainRule(chainRules, chainRules[0].displayDepth!)
                relativeDepth++
                chainRules = []
            }

            // 【步骤 2】设置当前规则的属性
            rule.shouldBreakLine = true                    // ← 赋值：断链
            rule.relativeDepthByStack = relativeDepth      // ← 赋值：相对深度
            rule.displayDepth = baseDepth + relativeDepth

            // 【步骤 3】输出当前规则
            this.printSingleRule([rule], rule.displayDepth)
            relativeDepth++

        } else {
            // ═══════════════════════════════════════════════════
            // 当前规则不断链（折叠）
            // ═══════════════════════════════════════════════════

            // 积累到折叠链中，稍后统一处理
            chainRules.push(rule)
            // ↑ 注意：此时还没有设置 shouldBreakLine
        }
    }

    // 【第四步】处理最后剩余的折叠链
    if (chainRules.length > 0) {
        for (const chainRule of chainRules) {
            chainRule.shouldBreakLine = false              // ← 赋值：折叠
            chainRule.relativeDepthByStack = relativeDepth // ← 赋值：相对深度
            chainRule.displayDepth = baseDepth + relativeDepth
        }
        this.printChainRule(chainRules, chainRules[0].displayDepth!)
    }
}
```

**特点：**
- ✅ **只遍历一次** pending 数组
- ✅ 边判断边赋值，逻辑更紧凑
- ✅ `shouldBreakLine` 在输出前才被设置，更符合"按需赋值"的原则

---

## 📊 详细对比

### 对比 1：遍历次数

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| **第一次遍历** | 标记 `shouldBreakLine` | 判断 + 赋值 + 输出 |
| **第二次遍历** | 判断 + 输出 | 无 |
| **总遍历次数** | 2 次 | 1 次 |

---

### 对比 2：`shouldBreakLine` 的赋值时机

#### 修改前：提前赋值

```typescript
// 第一次遍历：提前赋值
for (let i = 0; i < pending.length; i++) {
    pending[i].shouldBreakLine = (i >= breakPoint)
    // ↑ 所有规则都被赋值，包括折叠的规则
}

// 第二次遍历：使用已赋值的 shouldBreakLine
for (const rule of pending) {
    if (rule.shouldBreakLine) {
        // 输出断链规则
    } else {
        // 积累折叠规则
    }
}
```

**问题：**
- ❌ 折叠规则的 `shouldBreakLine` 被设置为 `false`，但可能在输出前就被设置了
- ❌ 如果折叠规则很多，会有很多不必要的赋值操作

#### 修改后：按需赋值

```typescript
// 只遍历一次：边判断边赋值
for (let i = 0; i < pending.length; i++) {
    const shouldBreak = (i >= breakPoint)  // ← 局部变量，不修改规则

    if (shouldBreak) {
        // 先处理折叠链
        for (const chainRule of chainRules) {
            chainRule.shouldBreakLine = false  // ← 输出前才赋值
        }

        // 再处理当前规则
        rule.shouldBreakLine = true  // ← 输出前才赋值
    } else {
        // 积累到折叠链，暂不赋值
        chainRules.push(rule)
    }
}
```

**优势：**
- ✅ 只在输出前才赋值 `shouldBreakLine`
- ✅ 按需赋值，避免不必要的操作
- ✅ 逻辑更清晰：赋值和输出在同一个地方

---

### 对比 3：代码结构

#### 修改前：分离标记和输出

```typescript
// 步骤 1：标记
for (let i = 0; i < pending.length; i++) {
    pending[i].shouldBreakLine = ...
}

// 步骤 2：输出
for (const rule of pending) {
    if (rule.shouldBreakLine) {
        // 输出
    }
}
```

**特点：**
- 标记和输出分离
- 需要两次遍历

#### 修改后：合并判断和输出

```typescript
// 步骤 1：判断 + 赋值 + 输出（一次完成）
for (let i = 0; i < pending.length; i++) {
    const shouldBreak = ...  // 判断

    if (shouldBreak) {
        rule.shouldBreakLine = true  // 赋值
        this.printSingleRule(...)    // 输出
    }
}
```

**特点：**
- 判断、赋值、输出在同一个循环中
- 只需要一次遍历

---

## 🎯 为什么要这样修改？

### 原因 1：非缓存场景不需要提前标记

**非缓存场景的特点：**
- 规则是实时推入栈的
- 每次 `flushPendingOutputs_NonCache` 只处理少量规则（通常 1-5 个）
- 断点是固定的（最后一个 Or 节点或倒数第二个规则）

**结论：**
- ✅ 可以在遍历时直接判断是否到达断点
- ✅ 不需要提前标记所有规则的 `shouldBreakLine`
- ✅ 按需赋值更高效

---

### 原因 2：缓存场景才需要提前标记

**缓存场景的特点：**
- 规则是从缓存恢复的
- 每次 `flushPendingOutputs_Cache` 可能处理大量规则（几十个甚至上百个）
- 断点可能有多个（多个 Or 节点，多个断链）
- `shouldBreakLine` 已经在第一次输出时被标记并保存到缓存中

**结论：**
- ✅ 缓存场景需要提前标记 `shouldBreakLine`（已经在缓存中）
- ✅ 缓存恢复时，`shouldBreakLine` 已经是正确的值
- ✅ 只需要根据 `shouldBreakLine` 输出即可

---

### 原因 3：代码更简洁高效

| 项目 | 修改前 | 修改后 | 改进 |
|------|--------|--------|------|
| **遍历次数** | 2 次 | 1 次 | -50% |
| **赋值次数** | 所有规则 | 只有输出的规则 | 减少不必要的赋值 |
| **代码行数** | 约 85 行 | 约 100 行 | +15 行（但逻辑更清晰） |
| **可读性** | 中等（分离） | 高（集中） | 更易理解 |

---

## ✅ 总结

### 修改前的问题

1. ❌ **两次遍历**：第一次标记，第二次输出
2. ❌ **提前赋值**：所有规则的 `shouldBreakLine` 都被赋值，包括折叠的规则
3. ❌ **逻辑分离**：标记和输出分离，不够紧凑

### 修改后的优势

1. ✅ **一次遍历**：判断、赋值、输出一次完成
2. ✅ **按需赋值**：只在输出前才赋值 `shouldBreakLine`
3. ✅ **逻辑集中**：判断、赋值、输出在同一个地方，更易理解

### 核心思想

> **非缓存场景：不需要提前标记，遍历时直接判断并赋值**
>
> **缓存场景：已经提前标记（保存在缓存中），直接使用即可**

这样的设计更符合两种场景的特点，代码更简洁高效！🎉


