# 重复添加问题的正确分析

## 原始代码的正确逻辑

### 1. `restoreFromCacheAndPushAndPrint` 的逻辑

```typescript
let rootIndex = this.ruleStack.push(restoredItem)  // rootIndex 是新的数组长度

// 递归恢复子节点
if (cached.childs) {
    for (const childKey of cached.childs) {
        this.restoreFromCacheAndPushAndPrint(childKey, restoredItem.displayDepth, false)
    }
}

// 如果是根规则，输出并清理
if (isRoot) {
    SubhutiDebugRuleTracePrint.flushPendingOutputs_Cache_Impl(this.ruleStack)
    this.ruleStack.splice(rootIndex + 1)  // 删除 rootIndex+1 之后的所有元素
}
```

**关键点**：
- `push` 返回新的数组长度，不是索引
- 如果 `rootIndex = 40`，那么 root 在索引 39
- `splice(41)` 删除索引 41 及之后的元素
- **root (索引 39) 和它后面的一个元素 (索引 40) 都被保留**

等等，这里有问题！如果 root 在索引 39，子节点从索引 40 开始，那么 `splice(41)` 会保留索引 40 的元素（第一个子节点）！

让我重新理解：
- 恢复前栈长度：39，root 将被推入索引 39
- `push(restoredItem)` 返回 40（新长度）
- root 现在在索引 39
- 递归恢复子节点，它们被推入索引 40, 41, 42...
- `splice(40 + 1)` = `splice(41)` 删除索引 41 及之后
- **索引 40 的元素（第一个子节点）被保留了！**

这就是问题所在！

### 2. `onRuleExit` 的逻辑

```typescript
const curRule = this.ruleStack.pop()  // 先 pop

// 性能统计（包括缓存命中的情况）

if (!curRule.outputted) {
    return  // 没有输出，不缓存
}

// 添加到父节点的 childs
if (parentItem) {
    this.parentPushChild(parentItem, cacheKey)
}

// 缓存
if (!cacheCurRule) {
    this.cacheSet(cacheKey, cloned)
}
```

**关键点**：
- 不管是否缓存命中，都先 pop
- 然后添加到父节点的 childs
- 然后缓存

### 3. 为什么会重复添加？

场景：
1. `UpdateExpression` 的 Or 分支 #1：`LeftHandSideExpression ++`
   - `onRuleEnter(LeftHandSideExpression)` - 缓存未命中，推入栈
   - 执行 `LeftHandSideExpression`，成功
   - 尝试匹配 `++`，失败
   - 回溯，但 **`onRuleExit(LeftHandSideExpression)` 已经被调用了**
   - `onRuleExit` pop 出栈，添加到父节点（Or 分支 #1）的 childs，缓存

2. `UpdateExpression` 的 Or 分支 #2：`LeftHandSideExpression --`
   - `onRuleEnter(LeftHandSideExpression)` - **缓存命中**
   - `restoreFromCacheAndPushAndPrint` 恢复整个子树
   - `splice(rootIndex + 1)` 但这里有 bug，保留了第一个子节点
   - `onRuleExit(LeftHandSideExpression, true)` 被调用
   - pop 出栈（pop 的是什么？）
   - 尝试添加到父节点（Or 分支 #2）的 childs
   - **但父节点的 childs 中已经有了这个 key！**

等等，这还是不对。让我重新思考...

## 重新分析

问题的关键是：**什么时候 `onRuleExit` 会被调用？**

从 Parser 的代码看：
```typescript
const startTime = this._debugger?.onRuleEnter(ruleName, this.tokenIndex)

// Packrat Parsing 缓存查询
if (this.enableMemoization) {
    const cached = this._cache.get(ruleName, this.tokenIndex)
    if (cached !== undefined) {
        this._debugger?.onRuleExit(ruleName, true, startTime)  // 缓存命中也会调用
        return result
    }
}

// 核心执行
const cst = this.executeRuleCore(ruleName, targetFun)

this.onRuleExitDebugHandler(ruleName, cst, false, startTime)  // 非缓存情况
```

所以：
- **Parser 层面的缓存命中**：会调用 `onRuleExit(ruleName, true)`
- **Debug 层面的缓存命中**：在 `onRuleEnter` 中处理，调用 `restoreFromCacheAndPushAndPrint`

这是两个不同的缓存！

- **Parser 缓存**：`this._cache`（Packrat Parsing）
- **Debug 缓存**：`this.rulePathCache`（用于调试输出）

当 Debug 缓存命中时：
1. `onRuleEnter` 调用 `restoreFromCacheAndPushAndPrint`
2. 恢复整个子树到栈中
3. 输出日志
4. `splice` 清理（但有 bug）
5. **返回，不推入新的节点**

然后 Parser 层面：
- 检查 Parser 缓存，也命中
- 调用 `onRuleExit(ruleName, true)`
- `onRuleExit` 尝试 pop，但栈顶是什么？

这就是问题所在！当 Debug 缓存命中时，`onRuleEnter` 没有推入新节点（因为直接 return 了），但 Parser 仍然会调用 `onRuleExit`，而 `onRuleExit` 会尝试 pop！

所以真正的问题是：**Debug 缓存命中时，`onRuleEnter` 和 `onRuleExit` 不配对**。
