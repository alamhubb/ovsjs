# 相对深度计算逻辑详解

## 📋 核心概念

### 什么是相对深度？

**相对深度** = 当前规则相对于 pending 数组中**第一个规则**的深度差

- 第一个规则的相对深度 = 0
- 后续规则的相对深度 = 根据是否断链来递增

### 为什么需要相对深度？

因为我们需要计算**显示深度**：

```
显示深度 = 基准深度 + 相对深度
```

- **基准深度**：最后一个已输出规则的深度 + 1
- **相对深度**：当前规则相对于第一个未输出规则的深度

---

## 🔍 代码逐行解释

### 示例场景

假设 `pending` 数组有这些规则：

```javascript
pending = [
  { ruleName: 'A', shouldBreakLine: false },  // 折叠
  { ruleName: 'B', shouldBreakLine: false },  // 折叠
  { ruleName: 'C', shouldBreakLine: false },  // 折叠
  { ruleName: 'D', shouldBreakLine: true  },  // 断链
  { ruleName: 'E', shouldBreakLine: true  },  // 断链
  { ruleName: 'F', shouldBreakLine: false },  // 折叠
  { ruleName: 'G', shouldBreakLine: false },  // 折叠
  { ruleName: 'H', shouldBreakLine: true  },  // 断链
]
```

### 代码执行过程

```typescript
// 【初始化】
let relativeDepth = 0                    // 当前深度计数器，从 0 开始
let chainRulesForDepth: RuleStackItem[] = []  // 临时存储折叠链中的规则

// 【遍历 pending 数组】
for (const rule of pending) {
    if (rule.shouldBreakLine) {
        // ═══════════════════════════════════════════════════════
        // 情况 1：当前规则需要断链（单独显示）
        // ═══════════════════════════════════════════════════════
        
        // 【步骤 1】先处理之前积累的折叠链（如果有的话）
        if (chainRulesForDepth.length > 0) {
            // 折叠链中的所有规则使用相同的深度
            for (const chainRule of chainRulesForDepth) {
                chainRule.relativeDepthByChilds = relativeDepth
            }
            // 折叠链处理完毕，深度 +1
            relativeDepth++
            // 清空折叠链
            chainRulesForDepth = []
        }
        
        // 【步骤 2】设置当前规则的深度
        rule.relativeDepthByChilds = relativeDepth
        // 当前规则处理完毕，深度 +1
        relativeDepth++
        
    } else {
        // ═══════════════════════════════════════════════════════
        // 情况 2：当前规则需要折叠（和其他规则显示在同一行）
        // ═══════════════════════════════════════════════════════
        
        // 暂时不设置深度，先积累到折叠链中
        chainRulesForDepth.push(rule)
    }
}

// 【处理最后剩余的折叠链】
// 如果遍历结束后还有未处理的折叠链，统一设置深度
if (chainRulesForDepth.length > 0) {
    for (const chainRule of chainRulesForDepth) {
        chainRule.relativeDepthByChilds = relativeDepth
    }
}
```

---

## 📊 执行过程可视化

让我们逐步执行上面的示例：

### 初始状态

```
relativeDepth = 0
chainRulesForDepth = []
```

### 第 1 次循环：处理规则 A

```javascript
rule = { ruleName: 'A', shouldBreakLine: false }
```

**执行：**
```
rule.shouldBreakLine = false  →  进入 else 分支
chainRulesForDepth.push(A)
```

**状态：**
```
relativeDepth = 0
chainRulesForDepth = [A]
```

### 第 2 次循环：处理规则 B

```javascript
rule = { ruleName: 'B', shouldBreakLine: false }
```

**执行：**
```
rule.shouldBreakLine = false  →  进入 else 分支
chainRulesForDepth.push(B)
```

**状态：**
```
relativeDepth = 0
chainRulesForDepth = [A, B]
```

### 第 3 次循环：处理规则 C

```javascript
rule = { ruleName: 'C', shouldBreakLine: false }
```

**执行：**
```
rule.shouldBreakLine = false  →  进入 else 分支
chainRulesForDepth.push(C)
```

**状态：**
```
relativeDepth = 0
chainRulesForDepth = [A, B, C]
```

### 第 4 次循环：处理规则 D

```javascript
rule = { ruleName: 'D', shouldBreakLine: true }
```

**执行：**
```
rule.shouldBreakLine = true  →  进入 if 分支

【步骤 1】处理之前的折叠链
chainRulesForDepth.length = 3 > 0  →  进入 if
  for (const chainRule of [A, B, C]) {
      chainRule.relativeDepthByChilds = 0  // 设置 A, B, C 的深度都是 0
  }
  relativeDepth++  →  relativeDepth = 1
  chainRulesForDepth = []

【步骤 2】设置当前规则的深度
D.relativeDepthByChilds = 1
relativeDepth++  →  relativeDepth = 2
```

**状态：**
```
A.relativeDepthByChilds = 0  ✅
B.relativeDepthByChilds = 0  ✅
C.relativeDepthByChilds = 0  ✅
D.relativeDepthByChilds = 1  ✅

relativeDepth = 2
chainRulesForDepth = []
```

### 第 5 次循环：处理规则 E

```javascript
rule = { ruleName: 'E', shouldBreakLine: true }
```

**执行：**
```
rule.shouldBreakLine = true  →  进入 if 分支

【步骤 1】处理之前的折叠链
chainRulesForDepth.length = 0  →  跳过 if

【步骤 2】设置当前规则的深度
E.relativeDepthByChilds = 2
relativeDepth++  →  relativeDepth = 3
```

**状态：**
```
E.relativeDepthByChilds = 2  ✅

relativeDepth = 3
chainRulesForDepth = []
```

### 第 6 次循环：处理规则 F

```javascript
rule = { ruleName: 'F', shouldBreakLine: false }
```

**执行：**
```
rule.shouldBreakLine = false  →  进入 else 分支
chainRulesForDepth.push(F)
```

**状态：**
```
relativeDepth = 3
chainRulesForDepth = [F]
```

### 第 7 次循环：处理规则 G

```javascript
rule = { ruleName: 'G', shouldBreakLine: false }
```

**执行：**
```
rule.shouldBreakLine = false  →  进入 else 分支
chainRulesForDepth.push(G)
```

**状态：**
```
relativeDepth = 3
chainRulesForDepth = [F, G]
```

### 第 8 次循环：处理规则 H

```javascript
rule = { ruleName: 'H', shouldBreakLine: true }
```

**执行：**
```
rule.shouldBreakLine = true  →  进入 if 分支

【步骤 1】处理之前的折叠链
chainRulesForDepth.length = 2 > 0  →  进入 if
  for (const chainRule of [F, G]) {
      chainRule.relativeDepthByChilds = 3  // 设置 F, G 的深度都是 3
  }
  relativeDepth++  →  relativeDepth = 4
  chainRulesForDepth = []

【步骤 2】设置当前规则的深度
H.relativeDepthByChilds = 4
relativeDepth++  →  relativeDepth = 5
```

**状态：**
```
F.relativeDepthByChilds = 3  ✅
G.relativeDepthByChilds = 3  ✅
H.relativeDepthByChilds = 4  ✅

relativeDepth = 5
chainRulesForDepth = []
```

### 循环结束后

```javascript
// 处理最后剩余的折叠链
if (chainRulesForDepth.length > 0) {  // 0 > 0 = false，跳过
    // ...
}
```

---

## 🎯 最终结果

```
A.relativeDepthByChilds = 0  ← 折叠链 [A, B, C]
B.relativeDepthByChilds = 0  ← 折叠链 [A, B, C]
C.relativeDepthByChilds = 0  ← 折叠链 [A, B, C]
D.relativeDepthByChilds = 1  ← 断链
E.relativeDepthByChilds = 2  ← 断链
F.relativeDepthByChilds = 3  ← 折叠链 [F, G]
G.relativeDepthByChilds = 3  ← 折叠链 [F, G]
H.relativeDepthByChilds = 4  ← 断链
```

---

## 📝 输出效果

假设 `baseDepth = 10`，那么显示深度为：

```
A: displayDepth = 10 + 0 = 10
B: displayDepth = 10 + 0 = 10
C: displayDepth = 10 + 0 = 10
D: displayDepth = 10 + 1 = 11
E: displayDepth = 10 + 2 = 12
F: displayDepth = 10 + 3 = 13
G: displayDepth = 10 + 3 = 13
H: displayDepth = 10 + 4 = 14
```

**实际输出：**

```
│  │  │  │  │  │  │  │  │  │  ├─A > B > C          ← 深度 10（折叠显示）
│  │  │  │  │  │  │  │  │  │  │  └─D               ← 深度 11
│  │  │  │  │  │  │  │  │  │  │  │  └─E            ← 深度 12
│  │  │  │  │  │  │  │  │  │  │  │  │  ├─F > G     ← 深度 13（折叠显示）
│  │  │  │  │  │  │  │  │  │  │  │  │  │  └─H      ← 深度 14
```

---

## ✅ 为什么这个实现是正确的？

### 1. **遍历顺序 = 输出顺序**

我们按照 `pending` 数组的顺序遍历，这个顺序就是规则的**输出顺序**。

### 2. **折叠链的深度一致**

所有在同一个折叠链中的规则（连续的 `shouldBreakLine=false`）都被赋予**相同的深度**。

这是正确的，因为它们会被折叠显示在同一行：`A > B > C`

### 3. **断链规则深度递增**

每次遇到 `shouldBreakLine=true` 的规则，深度就 +1。

这是正确的，因为每个断链规则都会单独显示一行，缩进增加。

### 4. **相对深度的定义清晰**

相对深度始终是**相对于 pending 数组的第一个规则**，而不是相对于某个不确定的"父节点"。

### 5. **逻辑简单、易于理解**

整个逻辑就是：
- 遇到折叠规则 → 积累到链中
- 遇到断链规则 → 先输出之前的链（深度相同），再输出当前规则（深度 +1）

---

## 🔄 对比：为什么之前的实现是错误的？

之前在 `restoreFromCacheAndPushAndPrint` 中递归计算：

```typescript
// ❌ 错误的实现
if (parentRelativeDepth === -1) {
    restoredItem.relativeDepthByChilds = 0
} else {
    if (restoredItem.shouldBreakLine) {
        restoredItem.relativeDepthByChilds = parentRelativeDepth + 1
    } else {
        restoredItem.relativeDepthByChilds = parentRelativeDepth
    }
}
```

**问题：**

1. **"父节点"的定义不清晰**
   - 在递归调用中，`parentRelativeDepth` 是**调用栈中的父节点**
   - 但这个父节点可能不是 pending 数组中的逻辑父节点

2. **折叠链的深度可能不一致**
   - 如果折叠链中的规则在不同的递归层级被恢复，它们的深度可能不同

3. **依赖递归调用顺序**
   - 深度计算依赖于 `restoreFromCacheAndPushAndPrint` 的递归调用顺序
   - 这个顺序可能和 pending 数组的顺序不一致

---

## 🎉 总结

**现在的实现正确的原因：**

1. ✅ 在 `flushPendingOutputs_Cache` 中统一计算，而不是在递归恢复时计算
2. ✅ 按照 pending 数组的顺序遍历，顺序 = 输出顺序
3. ✅ 折叠链中的所有规则深度相同（积累后统一设置）
4. ✅ 断链规则深度递增（每次 +1）
5. ✅ 相对深度的定义清晰（相对于第一个规则）

**关键点：**

> **折叠规则的深度都是折叠链开始时的深度**

这意味着：
- 折叠链 `[A, B, C]` 的深度都是 0（折叠链开始时 `relativeDepth = 0`）
- 折叠链 `[F, G]` 的深度都是 3（折叠链开始时 `relativeDepth = 3`）

这样就保证了折叠显示的正确性！🎯


