# 错误实现 vs 正确实现对比

## 🔴 错误实现：在递归恢复时计算深度

### 代码

```typescript
// ❌ 在 restoreFromCacheAndPushAndPrint 中计算
private restoreFromCacheAndPushAndPrint(
    cacheKey: string, 
    isRoot: boolean, 
    parentRelativeDepth: number = -1  // ← 传递父节点的深度
): void {
    const cached = this.rulePathCache.get(cacheKey)
    if (!cached) return

    const restoredItem = this.deepCloneRuleStackItem(cached)
    restoredItem.outputted = false
    restoredItem.shouldBreakLine = cached.shouldBreakLine
    restoredItem.relativeDepthByStack = cached.relativeDepthByStack
    
    // ❌ 问题所在：基于父节点计算深度
    if (parentRelativeDepth === -1) {
        // 第一个规则
        restoredItem.relativeDepthByChilds = 0
    } else {
        // 后续规则
        if (restoredItem.shouldBreakLine) {
            // 断链：深度 = 父深度 + 1
            restoredItem.relativeDepthByChilds = parentRelativeDepth + 1
        } else {
            // 折叠：深度 = 父深度（同级）
            restoredItem.relativeDepthByChilds = parentRelativeDepth
        }
    }
    
    this.ruleStack.push(restoredItem)

    // 递归推入子节点
    const childKeys = cached.childs ?? []
    const currentRelativeDepth = restoredItem.relativeDepthByChilds ?? 0
    for (const childKey of childKeys) {
        // ❌ 递归调用，传递当前深度作为父深度
        this.restoreFromCacheAndPushAndPrint(childKey, false, currentRelativeDepth)
    }

    if (isRoot) {
        this.flushPendingOutputs()
    } else {
        this.ruleStack.pop()
    }
}
```

### 问题分析

#### 问题 1：父节点的定义不清晰

**场景：** 假设缓存中有这样的结构：

```
Root
├─ A (shouldBreakLine=false)
├─ B (shouldBreakLine=false)
└─ C (shouldBreakLine=true)
   └─ D (shouldBreakLine=false)
```

**递归调用顺序：**

```
restoreFromCacheAndPushAndPrint('Root', true, -1)
  → Root.relativeDepthByChilds = 0
  → restoreFromCacheAndPushAndPrint('A', false, 0)
    → A.shouldBreakLine = false
    → A.relativeDepthByChilds = 0  ✅ 正确
  → restoreFromCacheAndPushAndPrint('B', false, 0)
    → B.shouldBreakLine = false
    → B.relativeDepthByChilds = 0  ✅ 正确
  → restoreFromCacheAndPushAndPrint('C', false, 0)
    → C.shouldBreakLine = true
    → C.relativeDepthByChilds = 0 + 1 = 1  ✅ 正确
    → restoreFromCacheAndPushAndPrint('D', false, 1)
      → D.shouldBreakLine = false
      → D.relativeDepthByChilds = 1  ❌ 错误！
```

**问题：** D 的深度是 1，但它应该和 C 的子节点一起，深度应该是 2！

**原因：** 这里的"父节点"是 C，但 D 是 C 的子节点，不应该和 C 同级。

#### 问题 2：折叠链的深度可能不一致

**场景：** 假设有这样的折叠链：

```
pending = [
  A (shouldBreakLine=false),  // 折叠
  B (shouldBreakLine=false),  // 折叠
  C (shouldBreakLine=false),  // 折叠
]
```

但是在缓存恢复时，它们的父节点可能不同：

```
Root
├─ A (parent = Root, parentDepth = 0)
└─ SubRoot
   ├─ B (parent = SubRoot, parentDepth = ?)
   └─ C (parent = SubRoot, parentDepth = ?)
```

**结果：** A、B、C 的深度可能不一致，导致折叠链显示错误。

#### 问题 3：依赖递归调用顺序

递归调用的顺序是**深度优先**的，但 pending 数组的顺序可能是**广度优先**的。

这导致深度计算和实际输出顺序不匹配。

---

## ✅ 正确实现：在输出时统一计算深度

### 代码

```typescript
// ✅ 在 flushPendingOutputs_Cache 中计算
private static flushPendingOutputs_Cache(
    ruleStack: RuleStackItem[], 
    pending: RuleStackItem[]
): void {
    // ... 省略基准深度计算 ...

    // ✅ 关键：在这里统一计算 relativeDepthByChilds
    let relativeDepth = 0                      // 当前深度计数器
    let chainRulesForDepth: RuleStackItem[] = []  // 折叠链临时存储

    // 按照 pending 数组的顺序遍历（输出顺序）
    for (const rule of pending) {
        if (rule.shouldBreakLine) {
            // ═══════════════════════════════════════════════════
            // 断链规则：单独显示
            // ═══════════════════════════════════════════════════
            
            // 【步骤 1】先处理之前积累的折叠链
            if (chainRulesForDepth.length > 0) {
                // ✅ 关键：折叠链中的所有规则深度相同
                for (const chainRule of chainRulesForDepth) {
                    chainRule.relativeDepthByChilds = relativeDepth
                }
                relativeDepth++  // 折叠链输出后，深度 +1
                chainRulesForDepth = []
            }
            
            // 【步骤 2】设置当前规则的深度
            rule.relativeDepthByChilds = relativeDepth
            relativeDepth++  // 当前规则输出后，深度 +1
            
        } else {
            // ═══════════════════════════════════════════════════
            // 折叠规则：积累到链中
            // ═══════════════════════════════════════════════════
            
            // ✅ 关键：不立即设置深度，等待折叠链完整后统一设置
            chainRulesForDepth.push(rule)
        }
    }

    // 处理最后剩余的折叠链
    if (chainRulesForDepth.length > 0) {
        for (const chainRule of chainRulesForDepth) {
            chainRule.relativeDepthByChilds = relativeDepth
        }
    }

    // ... 省略后续输出逻辑 ...
}
```

### 优势分析

#### 优势 1：遍历顺序 = 输出顺序

```typescript
for (const rule of pending) {
    // pending 数组的顺序就是输出顺序
    // 我们按照这个顺序计算深度，保证一致性
}
```

**结果：** 深度计算和实际输出完全匹配。

#### 优势 2：折叠链深度一致

```typescript
// 积累折叠链
chainRulesForDepth.push(rule)

// 统一设置深度
for (const chainRule of chainRulesForDepth) {
    chainRule.relativeDepthByChilds = relativeDepth  // 所有规则深度相同
}
```

**结果：** 折叠链中的所有规则深度完全一致。

#### 优势 3：相对深度定义清晰

```typescript
let relativeDepth = 0  // 从 0 开始，相对于 pending 数组的第一个规则
```

**结果：** 相对深度的含义非常明确，就是相对于第一个未输出规则的深度。

---

## 📊 实际对比

### 场景

```javascript
pending = [
  { ruleName: 'A', shouldBreakLine: false },  // 折叠
  { ruleName: 'B', shouldBreakLine: false },  // 折叠
  { ruleName: 'C', shouldBreakLine: true  },  // 断链
  { ruleName: 'D', shouldBreakLine: true  },  // 断链
]
```

### 错误实现的结果（假设）

```
A.relativeDepthByChilds = 0  ← 父节点是 Root
B.relativeDepthByChilds = 1  ← 父节点是 A（错误！）
C.relativeDepthByChilds = 2  ← 父节点是 B
D.relativeDepthByChilds = 3  ← 父节点是 C
```

**输出：**
```
├─A                    ← 深度 0
│  ├─B                 ← 深度 1（错误！应该和 A 同级）
│  │  └─C              ← 深度 2（错误！）
│  │  │  └─D           ← 深度 3（错误！）
```

### 正确实现的结果

```
A.relativeDepthByChilds = 0  ← 折叠链 [A, B]
B.relativeDepthByChilds = 0  ← 折叠链 [A, B]
C.relativeDepthByChilds = 1  ← 断链
D.relativeDepthByChilds = 2  ← 断链
```

**输出：**
```
├─A > B                ← 深度 0（折叠显示）
│  └─C                 ← 深度 1
│  │  └─D              ← 深度 2
```

---

## 🎯 总结

| 对比项 | 错误实现 | 正确实现 |
|--------|----------|----------|
| **计算位置** | 递归恢复时 | 输出时统一计算 |
| **遍历顺序** | 深度优先（递归） | 输出顺序（pending 数组） |
| **父节点定义** | 调用栈中的父节点（不清晰） | 相对于第一个规则（清晰） |
| **折叠链深度** | 可能不一致 | 保证一致 |
| **逻辑复杂度** | 高（依赖递归） | 低（简单遍历） |
| **正确性** | ❌ 可能错误 | ✅ 保证正确 |

**关键点：**

> **正确实现的核心思想：在输出时，按照输出顺序统一计算深度，而不是在恢复时基于不确定的父节点计算深度。**


