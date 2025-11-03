# 方案1：写时复制（Copy-on-Write）

## 修改文件
- `subhuti/src/parser/SubhutiParser.ts`

## 修改内容

### 1. 修改 BacktrackData 接口（第35-38行）

```typescript
// ❌ 修改前
interface BacktrackData {
    tokenIndex: number
}

// ✅ 修改后
interface BacktrackData {
    tokenIndex: number
    cstStackDepth: number          // 新增：记录栈深度
    childrenCounts: number[]       // 新增：记录每层children数量
}
```

### 2. 修改 saveState 方法（第465-469行）

```typescript
// ❌ 修改前
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex
    }
}

// ✅ 修改后
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex,
        cstStackDepth: this.cstStack.length,
        childrenCounts: this.cstStack.map(cst => cst.children?.length || 0)
    }
}
```

### 3. 修改 restoreState 方法（第474-476行）

```typescript
// ❌ 修改前
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
}

// ✅ 修改后
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
    
    // 恢复CST栈深度（移除失败分支添加的栈节点）
    if (this.cstStack.length > data.cstStackDepth) {
        this.cstStack.length = data.cstStackDepth
    }
    
    // 恢复每层children数量（移除失败分支添加的子节点）
    for (let i = 0; i < data.childrenCounts.length; i++) {
        const cst = this.cstStack[i]
        if (cst?.children && cst.children.length > data.childrenCounts[i]) {
            cst.children.length = data.childrenCounts[i]
        }
    }
}
```

## 工作量评估
- 修改行数：~20行
- 修改文件：1个
- 测试工作量：低（运行现有测试即可）
- 风险：极低

## 优点
✅ 改动最小
✅ 零风险
✅ 立即生效

## 缺点
❌ 每次saveState都要复制数组（性能小幅下降）
❌ 不够优雅


## 修改文件
- `subhuti/src/parser/SubhutiParser.ts`

## 修改内容

### 1. 修改 BacktrackData 接口（第35-38行）

```typescript
// ❌ 修改前
interface BacktrackData {
    tokenIndex: number
}

// ✅ 修改后
interface BacktrackData {
    tokenIndex: number
    cstStackDepth: number          // 新增：记录栈深度
    childrenCounts: number[]       // 新增：记录每层children数量
}
```

### 2. 修改 saveState 方法（第465-469行）

```typescript
// ❌ 修改前
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex
    }
}

// ✅ 修改后
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex,
        cstStackDepth: this.cstStack.length,
        childrenCounts: this.cstStack.map(cst => cst.children?.length || 0)
    }
}
```

### 3. 修改 restoreState 方法（第474-476行）

```typescript
// ❌ 修改前
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
}

// ✅ 修改后
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
    
    // 恢复CST栈深度（移除失败分支添加的栈节点）
    if (this.cstStack.length > data.cstStackDepth) {
        this.cstStack.length = data.cstStackDepth
    }
    
    // 恢复每层children数量（移除失败分支添加的子节点）
    for (let i = 0; i < data.childrenCounts.length; i++) {
        const cst = this.cstStack[i]
        if (cst?.children && cst.children.length > data.childrenCounts[i]) {
            cst.children.length = data.childrenCounts[i]
        }
    }
}
```

## 工作量评估
- 修改行数：~20行
- 修改文件：1个
- 测试工作量：低（运行现有测试即可）
- 风险：极低

## 优点
✅ 改动最小
✅ 零风险
✅ 立即生效

## 缺点
❌ 每次saveState都要复制数组（性能小幅下降）
❌ 不够优雅


## 修改文件
- `subhuti/src/parser/SubhutiParser.ts`

## 修改内容

### 1. 修改 BacktrackData 接口（第35-38行）

```typescript
// ❌ 修改前
interface BacktrackData {
    tokenIndex: number
}

// ✅ 修改后
interface BacktrackData {
    tokenIndex: number
    cstStackDepth: number          // 新增：记录栈深度
    childrenCounts: number[]       // 新增：记录每层children数量
}
```

### 2. 修改 saveState 方法（第465-469行）

```typescript
// ❌ 修改前
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex
    }
}

// ✅ 修改后
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex,
        cstStackDepth: this.cstStack.length,
        childrenCounts: this.cstStack.map(cst => cst.children?.length || 0)
    }
}
```

### 3. 修改 restoreState 方法（第474-476行）

```typescript
// ❌ 修改前
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
}

// ✅ 修改后
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
    
    // 恢复CST栈深度（移除失败分支添加的栈节点）
    if (this.cstStack.length > data.cstStackDepth) {
        this.cstStack.length = data.cstStackDepth
    }
    
    // 恢复每层children数量（移除失败分支添加的子节点）
    for (let i = 0; i < data.childrenCounts.length; i++) {
        const cst = this.cstStack[i]
        if (cst?.children && cst.children.length > data.childrenCounts[i]) {
            cst.children.length = data.childrenCounts[i]
        }
    }
}
```

## 工作量评估
- 修改行数：~20行
- 修改文件：1个
- 测试工作量：低（运行现有测试即可）
- 风险：极低

## 优点
✅ 改动最小
✅ 零风险
✅ 立即生效

## 缺点
❌ 每次saveState都要复制数组（性能小幅下降）
❌ 不够优雅













