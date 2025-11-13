# 代码对比：最开始 vs 现在（添加防御性编程后）

## 📋 对比说明

- **最开始的代码**：没有防御性编程，只计算 `displayDepth` 并输出
- **现在的代码**：添加了防御性编程，计算并验证 `relativeDepthByStack` 和 `relativeDepthByChilds`

---

## 🔴 最开始的代码（推测重建）

```typescript
/**
 * 非缓存场景：输出待处理的规则日志
 */
private static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[], pending: RuleStackItem[]): void {
    // 【第一步】计算基准深度
    const lastOutputted = [...ruleStack]
        .reverse()
        .find(item => item.outputted && item.displayDepth !== undefined)
    const baseDepth = lastOutputted ? lastOutputted.displayDepth + 1 : 0

    // 【第二步】计算断点
    let lastOrIndex = -1
    for (let i = pending.length - 1; i >= 0; i--) {
        if (this.isOrEntry(pending[i])) {
            lastOrIndex = i
            break
        }
    }
    const grandpaIndex = pending.length >= 2 ? pending.length - 2 : -1
    const validIndices = [lastOrIndex, grandpaIndex].filter(i => i >= 0)
    const breakPoint = validIndices.length > 0 ? Math.min(...validIndices) : -1

    // 【第三步】标记 shouldBreakLine
    for (let i = 0; i < pending.length; i++) {
        pending[i].shouldBreakLine = (breakPoint >= 0) ? (i >= breakPoint) : true
    }

    // 【第四步】遍历输出
    let depth = baseDepth                      // 当前深度
    let chainRules: RuleStackItem[] = []       // 积累要折叠的规则

    for (const rule of pending) {
        if (rule.shouldBreakLine) {
            // 先输出之前积累的折叠链
            if (chainRules.length > 0) {
                // 设置显示深度
                for (const chainRule of chainRules) {
                    chainRule.displayDepth = depth
                }
                // 输出折叠链
                this.printChainRule(chainRules, depth)
                // 折叠链输出后，深度 +1
                depth++
                chainRules = []
            }

            // 设置当前规则的显示深度
            rule.displayDepth = depth

            // 输出当前规则
            this.printSingleRule([rule], depth)

            // 当前规则输出后，深度 +1
            depth++

        } else {
            // 积累到折叠链中
            chainRules.push(rule)
        }
    }

    // 处理最后剩余的折叠链
    if (chainRules.length > 0) {
        for (const chainRule of chainRules) {
            chainRule.displayDepth = depth
        }
        this.printChainRule(chainRules, depth)
    }
}
```

**代码行数：** 约 70 行

**核心逻辑：**
1. 计算基准深度 `baseDepth`
2. 计算断点 `breakPoint`
3. 标记 `shouldBreakLine`
4. 遍历输出，使用局部变量 `depth` 计算显示深度

---

## 🟢 现在的代码（添加防御性编程后）

```typescript
/**
 * 非缓存场景：输出待处理的规则日志（内部实现）
 * 特点：只有一次断链，只有一个折叠段
 */
private static flushPendingOutputs_NonCache_Impl(ruleStack: RuleStackItem[], pending: RuleStackItem[]): void {
    // 【第一步】计算基准深度（最后一个已输出规则的 displayDepth + 1）
    const lastOutputted = [...ruleStack]
        .reverse()
        .find(item => item.outputted && item.displayDepth !== undefined)
    const baseDepth = lastOutputted ? lastOutputted.displayDepth + 1 : 0

    // 【第二步】计算断点（最后一个 Or 包裹节点 或 倒数第二个规则，取较小值）
    let lastOrIndex = -1
    for (let i = pending.length - 1; i >= 0; i--) {
        if (this.isOrEntry(pending[i])) {
            lastOrIndex = i
            break
        }
    }
    const grandpaIndex = pending.length >= 2 ? pending.length - 2 : -1
    const validIndices = [lastOrIndex, grandpaIndex].filter(i => i >= 0)
    const breakPoint = validIndices.length > 0 ? Math.min(...validIndices) : -1

    // 【第三步】标记每个规则的 shouldBreakLine
    // breakPoint 之前的规则不换行（折叠），breakPoint 及之后的规则都换行（断链）
    for (let i = 0; i < pending.length; i++) {
        pending[i].shouldBreakLine = (breakPoint >= 0) ? (i >= breakPoint) : true
    }

    // 【第四步】遍历输出，同时计算并记录 relativeDepthByStack
    let relativeDepth = 0                      // 当前相对深度
    let chainRules: RuleStackItem[] = []       // 积累要折叠的规则

    for (const rule of pending) {
        if (rule.shouldBreakLine) {
            // ═══════════════════════════════════════════════════
            // 当前规则需要换行（断链）
            // ═══════════════════════════════════════════════════

            // 【步骤 1】先处理之前积累的折叠链
            if (chainRules.length > 0) {
                // ✨ 新增：设置折叠链中所有规则的相对深度
                for (const chainRule of chainRules) {
                    chainRule.relativeDepthByStack = relativeDepth  // ← 新增
                    chainRule.displayDepth = baseDepth + relativeDepth
                }
                // 输出折叠链
                const chainDepth = chainRules[0].displayDepth!
                this.printChainRule(chainRules, chainDepth)
                // 折叠链输出后，深度 +1
                relativeDepth++
                chainRules = []
            }

            // 【步骤 2】✨ 新增：设置当前规则的相对深度
            rule.relativeDepthByStack = relativeDepth  // ← 新增
            rule.displayDepth = baseDepth + relativeDepth

            // 【步骤 3】输出当前规则
            this.printSingleRule([rule], rule.displayDepth)

            // 【步骤 4】当前规则输出后，深度 +1
            relativeDepth++

        } else {
            // ═══════════════════════════════════════════════════
            // 当前规则不换行（折叠）
            // ═══════════════════════════════════════════════════

            // 积累到折叠链中，稍后统一处理
            chainRules.push(rule)
        }
    }

    // 【第五步】处理最后剩余的折叠链（如果有的话）
    if (chainRules.length > 0) {
        // ✨ 新增：设置折叠链中所有规则的相对深度
        for (const chainRule of chainRules) {
            chainRule.relativeDepthByStack = relativeDepth  // ← 新增
            chainRule.displayDepth = baseDepth + relativeDepth
        }
        // 输出折叠链
        const chainDepth = chainRules[0].displayDepth!
        this.printChainRule(chainRules, chainDepth)
    }
}
```

**代码行数：** 约 85 行

---

## 📊 新增代码对比

### 新增内容 1：变量名改变

```diff
- let depth = baseDepth                      // 当前深度
+ let relativeDepth = 0                      // 当前相对深度
```

**逻辑：**
- 最开始：使用 `depth` 直接表示显示深度（绝对深度）
- 现在：使用 `relativeDepth` 表示相对深度（相对于第一个规则）

**为什么必须新增：**
- ✅ 为了支持防御性编程，需要**分离相对深度和显示深度**的概念
- ✅ `relativeDepth` 用于缓存验证，`displayDepth` 用于实际显示
- ✅ 这样可以在缓存恢复时对比两种计算方式的结果

---

### 新增内容 2：设置 `relativeDepthByStack`

```diff
  for (const chainRule of chainRules) {
+     chainRule.relativeDepthByStack = relativeDepth  // ← 新增
      chainRule.displayDepth = baseDepth + relativeDepth
  }
```

**逻辑：**
- 在设置 `displayDepth` 的同时，记录 `relativeDepthByStack`
- `relativeDepthByStack` 表示这个规则相对于第一个未输出规则的深度

**为什么必须新增：**
- ✅ **防御性编程的核心**：记录第一次计算的相对深度
- ✅ 当规则进入缓存时，`relativeDepthByStack` 会被保存
- ✅ 缓存恢复时，会计算 `relativeDepthByChilds` 并与 `relativeDepthByStack` 对比
- ✅ 如果两者不一致，说明逻辑有 bug，立即报错

---

### 新增内容 3：显示深度计算方式改变

```diff
- chainRule.displayDepth = depth
+ chainRule.displayDepth = baseDepth + relativeDepth
```

**逻辑：**
- 最开始：直接使用局部变量 `depth`
- 现在：使用 `baseDepth + relativeDepth` 计算

**为什么必须新增：**
- ✅ 为了明确**显示深度 = 基准深度 + 相对深度**的公式
- ✅ 这样可以在缓存恢复时使用相同的公式计算显示深度
- ✅ 保证缓存和非缓存场景的深度计算逻辑一致

---

## 🎯 总结：新增代码的必要性

### 核心变化

| 项目 | 最开始 | 现在 | 原因 |
|------|--------|------|------|
| **深度变量** | `depth`（绝对深度） | `relativeDepth`（相对深度） | 分离相对深度和显示深度的概念 |
| **深度计算** | `depth` 直接使用 | `baseDepth + relativeDepth` | 明确公式，便于缓存验证 |
| **新增字段** | 无 | `relativeDepthByStack` | 记录第一次计算的相对深度 |
| **代码行数** | 约 70 行 | 约 85 行 | 增加 15 行（+21%） |

---

### 新增代码的作用

#### 1. **记录相对深度**（3 处新增）

```typescript
chainRule.relativeDepthByStack = relativeDepth  // ← 新增
```

**作用：**
- 在非缓存输出时，记录每个规则相对于第一个未输出规则的深度
- 这个值会被保存到缓存中

**为什么必须新增：**
- ✅ 缓存恢复时需要验证深度计算是否正确
- ✅ 如果不记录，缓存恢复时无法对比两种计算方式
- ✅ 防御性编程的基础

---

#### 2. **改用相对深度变量**（1 处修改）

```typescript
let relativeDepth = 0  // 从 0 开始，而不是从 baseDepth 开始
```

**作用：**
- 使用相对深度而不是绝对深度
- 相对深度从 0 开始，表示相对于第一个规则的深度

**为什么必须新增：**
- ✅ 相对深度是缓存验证的关键
- ✅ 绝对深度（`displayDepth`）会因为 `baseDepth` 不同而变化
- ✅ 相对深度不受 `baseDepth` 影响，可以稳定地保存到缓存中

---

#### 3. **显式计算显示深度**（3 处修改）

```typescript
chainRule.displayDepth = baseDepth + relativeDepth  // 明确公式
```

**作用：**
- 明确显示深度的计算公式
- 而不是直接使用局部变量 `depth`

**为什么必须新增：**
- ✅ 缓存恢复时需要使用相同的公式计算显示深度
- ✅ 保证缓存和非缓存场景的深度计算逻辑一致
- ✅ 代码更易理解和维护

---

### 防御性编程的完整流程

```
┌─────────────────────────────────────────────────────────────┐
│ 非缓存输出（第一次）                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. 计算 relativeDepthByStack（基于断链逻辑）                 │
│ 2. 保存到 RuleStackItem                                      │
│ 3. 规则进入缓存时，relativeDepthByStack 被保存               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 缓存恢复（第二次）                                            │
├─────────────────────────────────────────────────────────────┤
│ 1. 从缓存恢复 relativeDepthByStack                           │
│ 2. 计算 relativeDepthByChilds（基于 shouldBreakLine 标记）   │
│ 3. 对比两者是否一致                                          │
│    ✅ 一致 → 逻辑正确，继续输出                              │
│    ❌ 不一致 → 逻辑有 bug，立即报错                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 为什么这些新增代码是必须的？

#### ❌ 如果不新增这些代码

**问题 1：无法验证缓存恢复的正确性**
- 缓存恢复时，深度计算可能出错
- 但没有任何验证机制，错误会被隐藏
- 导致输出格式错误，难以调试

**问题 2：缓存和非缓存逻辑可能不一致**
- 非缓存使用一种深度计算方式
- 缓存恢复使用另一种深度计算方式
- 两者可能产生不同的结果，导致输出不一致

**问题 3：难以定位 bug**
- 如果深度计算有 bug，只能通过肉眼观察输出来发现
- 无法自动检测和报错
- 调试成本高

#### ✅ 新增这些代码后

**优势 1：自动验证正确性**
- 两种计算方式交叉验证
- 如果不一致，立即报错
- bug 无处藏身

**优势 2：保证一致性**
- 缓存和非缓存使用相同的深度计算公式
- `displayDepth = baseDepth + relativeDepth`
- 输出格式完全一致

**优势 3：易于调试**
- 如果有 bug，会立即报错并指出问题位置
- 不需要肉眼观察输出
- 大大降低调试成本

---

### 代价分析

| 项目 | 代价 | 收益 |
|------|------|------|
| **代码行数** | +15 行（+21%） | 自动验证正确性 |
| **运行时开销** | 每个规则多设置 1 个字段 | 及早发现 bug |
| **内存开销** | 每个规则多存储 1 个数字 | 保证输出一致性 |
| **维护成本** | 需要理解防御性编程逻辑 | 降低调试成本 |

**结论：** 代价很小，收益巨大！✅

---

### 最终结论

**新增的代码虽然增加了约 21% 的代码量，但带来了：**

1. ✅ **自动验证**：两种计算方式交叉验证，自动发现 bug
2. ✅ **保证一致性**：缓存和非缓存输出格式完全一致
3. ✅ **易于调试**：bug 立即报错，不需要肉眼观察
4. ✅ **代码健壮性**：防御性编程，提高代码质量

**这些新增代码是完全必要的，是高质量代码的体现！** 🎉

