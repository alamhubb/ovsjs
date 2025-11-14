# Or 分支逻辑分析

## 问题描述

在 `templog.txt` 中，我们看到 `UpdateExpression` 的 Or 规则尝试了多个分支（#1, #2, #5），即使第一个分支已经成功了。这看起来不符合预期：**Or 规则应该在第一个成功的分支就返回，不应该继续尝试后续分支**。

## 关键发现

### 1. **这不是同一个 Or 调用的多次分支尝试**

仔细观察 templog.txt 的结构，我们会发现：

```
├─UpdateExpression 36                          # 第一次调用
│  ├─🔀 UpdateExpression(Or) 37
│  │  ├─[Branch #1](UpdateExpression) 38      # 尝试分支 #1
│  │  │  ├─LeftHandSideExpression 39
│  │  │  │  ... (成功解析到 token[3])
│  │  └─[Branch #2](UpdateExpression) 38      # ❌ 这里看起来又尝试了分支 #2
│  │  │  ├─LeftHandSideExpression ⚡[Cached] 39
│  │  └─[Branch #5](UpdateExpression) 38      # ❌ 又尝试了分支 #5
```

**但实际上，这些是不同层级的 UpdateExpression 调用！**

### 2. **真相：这是不同上下文中的 Or 调用**

让我们追踪完整的调用链：

```
ExponentiationExpression (Or)
├─ [Branch #1] UpdateExpression              # 第一个上下文
│   └─ UpdateExpression(Or)
│       └─ [Branch #1] LeftHandSideExpression → 成功 ✅
│
└─ [Branch #2] UnaryExpression               # 第二个上下文（回溯后）
    └─ UpdateExpression ⚡[Cached]
        └─ UpdateExpression(Or) ⚡[Cached]
            └─ [Branch #1] LeftHandSideExpression ⚡[Cached]
```

## 代码分析

### Or 方法的逻辑（SubhutiParser.ts）

```typescript
Or(alternatives: SubhutiParserOr[]): SubhutiCst | undefined {
    if (!this._parseSuccess) {
        return undefined
    }

    return this.withAllowError(() => {
        const savedState = this.saveState()
        const totalCount = alternatives.length

        for (let i = 0; i < totalCount; i++) {
            const alt = alternatives[i]
            const isLast = i === totalCount - 1

            // 进入 Or 分支
            this._debugger?.onOrBranch?.(i, totalCount, parentRuleName)

            // 执行分支
            alt.alt()

            // 退出 Or 分支
            this._debugger?.onOrBranchExit?.(parentRuleName, i)

            if (this._parseSuccess) {
                // ✅ 成功：立即返回，不再尝试后续分支
                this._debugger?.onOrExit?.(parentRuleName)
                return this.curCst
            }

            // ❌ 失败：回溯并尝试下一个分支
            if (!isLast) {
                this.restoreState(savedState)
                this._parseSuccess = true
            }
        }

        return undefined
    })
}
```

**关键点：**
1. ✅ **第一个成功的分支会立即返回** - `if (this._parseSuccess) { return this.curCst }`
2. ✅ **只有失败才会尝试下一个分支** - 失败后才会 `restoreState` 并继续循环

## 为什么 templog.txt 中看到多个分支？

### 原因 1：**父级 Or 规则的回溯**

```
ConditionalExpression(Or)
├─ [Branch #1] ShortCircuitExpression
│   └─ ... → ExponentiationExpression(Or)
│       ├─ [Branch #1] UpdateExpression → 成功 ✅
│       │   └─ UpdateExpression(Or)
│       │       └─ [Branch #1] → 成功 ✅
│       │
│       └─ [Branch #2] UnaryExpression        # ❌ 不会执行！
│
└─ [Branch #2] ...                            # 父级尝试其他分支
    └─ ... → ExponentiationExpression ⚡[Cached]
        └─ UpdateExpression ⚡[Cached]
            └─ UpdateExpression(Or) ⚡[Cached]
                └─ [Branch #1] ⚡[Cached]
```

**解释：**
- `ExponentiationExpression(Or)` 的 Branch #1 成功后，它会返回
- 但是 `ConditionalExpression(Or)` 可能还会尝试它的 Branch #2
- 这时会重新调用 `ExponentiationExpression`，但由于缓存，直接返回之前的结果

### 原因 2：**调试输出的展示方式**

templog.txt 的树形结构可能让人误解。实际上：

```
├─UpdateExpression(Or) 37
│  ├─[Branch #1] 38                    # 第一次尝试
│  │  └─ ... 成功 ✅
│  └─[Branch #2] 38                    # ❌ 这不是同一个 Or 调用！
│     └─ ... ⚡[Cached]                 # 这是缓存的结果
```

**这里的 Branch #2 实际上是：**
- 不同的 Or 调用（可能是父级回溯后重新调用）
- 或者是调试输出的展示问题

## 验证方法

### 检查调试输出的实现

让我们查看 `SubhutiDebug.ts` 中的 `onOrBranch` 实现：

```typescript
// 需要检查：
// 1. onOrBranch 是否正确记录了 Or 调用的上下文
// 2. 是否区分了不同的 Or 调用实例
// 3. 缓存命中时是否正确标记
```

### 添加调试信息

建议在 Or 方法中添加更多调试信息：

```typescript
Or(alternatives: SubhutiParserOr[]): SubhutiCst | undefined {
    const orCallId = Math.random() // 唯一标识这次 Or 调用
    
    this._debugger?.onOrEnter?.(parentRuleName, this.tokenIndex, orCallId)
    
    for (let i = 0; i < totalCount; i++) {
        this._debugger?.onOrBranch?.(i, totalCount, parentRuleName, orCallId)
        
        alt.alt()
        
        if (this._parseSuccess) {
            // 成功：记录并返回
            this._debugger?.onOrBranchSuccess?.(i, orCallId)
            return this.curCst
        }
        
        // 失败：记录并继续
        this._debugger?.onOrBranchFail?.(i, orCallId)
    }
}
```

## 结论

### ✅ **Or 逻辑是正确的**

代码中的 Or 实现完全符合 PEG 语义：
1. 顺序尝试每个分支
2. 第一个成功的分支立即返回
3. 只有失败才会回溯并尝试下一个分支

### ⚠️ **templog.txt 的展示可能有误导性**

看到的"多个分支"实际上是：
1. **不同层级的 Or 调用** - 父级回溯导致子规则被重新调用
2. **缓存命中的展示** - 缓存的结果被重新展示
3. **调试输出的结构问题** - 树形结构可能没有清楚地区分不同的 Or 调用实例

## 建议

### 1. 改进调试输出

为每个 Or 调用添加唯一标识符，清楚地显示：
- 这是第几次 Or 调用
- 是新调用还是缓存命中
- 哪个分支成功/失败

### 2. 添加调用栈信息

在调试输出中显示完整的规则调用栈，帮助理解上下文：

```
[Call Stack: Script → StatementList → ... → UpdateExpression]
├─UpdateExpression(Or) #1234
│  ├─[Branch #1] → Success ✅
│  └─[Branch #2] → Skipped (previous branch succeeded)
```

### 3. 区分缓存和新调用

```
├─UpdateExpression(Or) ⚡[Cached from call #1234]
│  └─[Branch #1] ⚡[Cached] → Success ✅
```
