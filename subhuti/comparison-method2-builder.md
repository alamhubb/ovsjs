# 方案2：构建器模式（Builder Pattern）

## 修改文件
1. 新增：`subhuti/src/struct/CSTBuilder.ts`（新文件）
2. 修改：`subhuti/src/parser/SubhutiParser.ts`

## 具体修改内容

### 1. 创建新文件：CSTBuilder.ts

```typescript
// subhuti/src/struct/CSTBuilder.ts（新文件，~80行）

import SubhutiCst from "./SubhutiCst.ts"

/**
 * CST构建器 - 支持事务式构建
 * 
 * 用法：
 * 1. 在Or分支中创建临时builder
 * 2. 成功时commit到父builder
 * 3. 失败时丢弃builder（自动GC）
 */
export class CSTBuilder {
    private nodes: SubhutiCst[] = []
    
    constructor(private parent: CSTBuilder | null = null) {}
    
    /**
     * 创建新的子构建器
     */
    createChild(): CSTBuilder {
        return new CSTBuilder(this)
    }
    
    /**
     * 添加节点到当前builder
     */
    addNode(node: SubhutiCst) {
        this.nodes.push(node)
    }
    
    /**
     * 提交到父构建器
     */
    commit() {
        if (this.parent) {
            this.parent.nodes.push(...this.nodes)
        }
    }
    
    /**
     * 获取所有节点（用于最终构建）
     */
    getNodes(): SubhutiCst[] {
        return this.nodes
    }
    
    /**
     * 回滚（什么都不做，让GC回收即可）
     */
    rollback() {
        // 无需操作，丢弃builder即可
    }
}
```

### 2. 修改 SubhutiParser.ts

#### 2.1 添加 builder 字段（第200行附近）

```typescript
// ❌ 修改前
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    // ...
}

// ✅ 修改后
import { CSTBuilder } from "../struct/CSTBuilder.ts"

export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    private cstBuilder: CSTBuilder                      // 新增
    // ...
    
    constructor(...) {
        // ...
        this.cstBuilder = new CSTBuilder()               // 新增
    }
}
```

#### 2.2 修改 addToParent 方法（第427-432行）

```typescript
// ❌ 修改前
private addToParent(cst: SubhutiCst) {
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}

// ✅ 修改后
private addToParent(cst: SubhutiCst) {
    // 使用builder添加节点
    this.cstBuilder.addNode(cst)
    
    // 同时也添加到栈顶节点（保持兼容）
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}
```

#### 2.3 修改 Or 方法（第578-613行）

```typescript
// ❌ 修改前
Or(alternatives: Array<{alt: Function}>): any {
    const savedState = this.saveState()
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            const result = alt.alt.call(this)
            return result
            
        } catch (error) {
            errors.push(error as Error)
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
            this.restoreState(savedState)
        }
    }
    return undefined
}

// ✅ 修改后
Or(alternatives: Array<{alt: Function}>): any {
    const savedTokenIndex = this.tokenIndex
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        // 创建临时builder
        const childBuilder = this.cstBuilder.createChild()
        const parentBuilder = this.cstBuilder
        this.cstBuilder = childBuilder
        
        try {
            const result = alt.alt.call(this)
            
            // ✅ 成功：commit到父builder
            childBuilder.commit()
            this.cstBuilder = parentBuilder
            
            return result
            
        } catch (error) {
            errors.push(error as Error)
            
            // ❌ 失败：丢弃childBuilder，恢复token
            this.cstBuilder = parentBuilder
            this.tokenIndex = savedTokenIndex
            
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
        }
    }
    return undefined
}
```

#### 2.4 可选：优化 buildCst（第384-409行）

```typescript
// 可以简化，因为builder已经处理了CST管理
private buildCst(ruleName: string, ruleFn: Function): SubhutiCst | undefined {
    const cst = new SubhutiCst()
    cst.name = ruleName
    cst.children = []
    
    this.cstStack.push(cst)
    this.ruleStack.push(ruleName)
    
    try {
        ruleFn.call(this)
        
        // 从builder获取子节点
        const builderNodes = this.cstBuilder.getNodes()
        cst.children = builderNodes
        
        this.addToParent(cst)
        this.setLocation(cst)
        
        return cst
        
    } catch (error) {
        throw error
    } finally {
        this.cstStack.pop()
        this.ruleStack.pop()
    }
}
```

## 工作量评估
- 新增代码：~150行
- 修改代码：~50行
- 修改文件：2个
- 测试工作量：中等（需要全面测试）
- 风险：中等

## 优点
✅ 架构清晰（事务语义）
✅ 易于理解和维护
✅ 零CST污染
✅ 工业标准方案

## 缺点
❌ 需要额外的Builder对象（内存开销）
❌ 稍微增加GC压力


## 修改文件
1. 新增：`subhuti/src/struct/CSTBuilder.ts`（新文件）
2. 修改：`subhuti/src/parser/SubhutiParser.ts`

## 具体修改内容

### 1. 创建新文件：CSTBuilder.ts

```typescript
// subhuti/src/struct/CSTBuilder.ts（新文件，~80行）

import SubhutiCst from "./SubhutiCst.ts"

/**
 * CST构建器 - 支持事务式构建
 * 
 * 用法：
 * 1. 在Or分支中创建临时builder
 * 2. 成功时commit到父builder
 * 3. 失败时丢弃builder（自动GC）
 */
export class CSTBuilder {
    private nodes: SubhutiCst[] = []
    
    constructor(private parent: CSTBuilder | null = null) {}
    
    /**
     * 创建新的子构建器
     */
    createChild(): CSTBuilder {
        return new CSTBuilder(this)
    }
    
    /**
     * 添加节点到当前builder
     */
    addNode(node: SubhutiCst) {
        this.nodes.push(node)
    }
    
    /**
     * 提交到父构建器
     */
    commit() {
        if (this.parent) {
            this.parent.nodes.push(...this.nodes)
        }
    }
    
    /**
     * 获取所有节点（用于最终构建）
     */
    getNodes(): SubhutiCst[] {
        return this.nodes
    }
    
    /**
     * 回滚（什么都不做，让GC回收即可）
     */
    rollback() {
        // 无需操作，丢弃builder即可
    }
}
```

### 2. 修改 SubhutiParser.ts

#### 2.1 添加 builder 字段（第200行附近）

```typescript
// ❌ 修改前
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    // ...
}

// ✅ 修改后
import { CSTBuilder } from "../struct/CSTBuilder.ts"

export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    private cstBuilder: CSTBuilder                      // 新增
    // ...
    
    constructor(...) {
        // ...
        this.cstBuilder = new CSTBuilder()               // 新增
    }
}
```

#### 2.2 修改 addToParent 方法（第427-432行）

```typescript
// ❌ 修改前
private addToParent(cst: SubhutiCst) {
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}

// ✅ 修改后
private addToParent(cst: SubhutiCst) {
    // 使用builder添加节点
    this.cstBuilder.addNode(cst)
    
    // 同时也添加到栈顶节点（保持兼容）
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}
```

#### 2.3 修改 Or 方法（第578-613行）

```typescript
// ❌ 修改前
Or(alternatives: Array<{alt: Function}>): any {
    const savedState = this.saveState()
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            const result = alt.alt.call(this)
            return result
            
        } catch (error) {
            errors.push(error as Error)
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
            this.restoreState(savedState)
        }
    }
    return undefined
}

// ✅ 修改后
Or(alternatives: Array<{alt: Function}>): any {
    const savedTokenIndex = this.tokenIndex
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        // 创建临时builder
        const childBuilder = this.cstBuilder.createChild()
        const parentBuilder = this.cstBuilder
        this.cstBuilder = childBuilder
        
        try {
            const result = alt.alt.call(this)
            
            // ✅ 成功：commit到父builder
            childBuilder.commit()
            this.cstBuilder = parentBuilder
            
            return result
            
        } catch (error) {
            errors.push(error as Error)
            
            // ❌ 失败：丢弃childBuilder，恢复token
            this.cstBuilder = parentBuilder
            this.tokenIndex = savedTokenIndex
            
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
        }
    }
    return undefined
}
```

#### 2.4 可选：优化 buildCst（第384-409行）

```typescript
// 可以简化，因为builder已经处理了CST管理
private buildCst(ruleName: string, ruleFn: Function): SubhutiCst | undefined {
    const cst = new SubhutiCst()
    cst.name = ruleName
    cst.children = []
    
    this.cstStack.push(cst)
    this.ruleStack.push(ruleName)
    
    try {
        ruleFn.call(this)
        
        // 从builder获取子节点
        const builderNodes = this.cstBuilder.getNodes()
        cst.children = builderNodes
        
        this.addToParent(cst)
        this.setLocation(cst)
        
        return cst
        
    } catch (error) {
        throw error
    } finally {
        this.cstStack.pop()
        this.ruleStack.pop()
    }
}
```

## 工作量评估
- 新增代码：~150行
- 修改代码：~50行
- 修改文件：2个
- 测试工作量：中等（需要全面测试）
- 风险：中等

## 优点
✅ 架构清晰（事务语义）
✅ 易于理解和维护
✅ 零CST污染
✅ 工业标准方案

## 缺点
❌ 需要额外的Builder对象（内存开销）
❌ 稍微增加GC压力


## 修改文件
1. 新增：`subhuti/src/struct/CSTBuilder.ts`（新文件）
2. 修改：`subhuti/src/parser/SubhutiParser.ts`

## 具体修改内容

### 1. 创建新文件：CSTBuilder.ts

```typescript
// subhuti/src/struct/CSTBuilder.ts（新文件，~80行）

import SubhutiCst from "./SubhutiCst.ts"

/**
 * CST构建器 - 支持事务式构建
 * 
 * 用法：
 * 1. 在Or分支中创建临时builder
 * 2. 成功时commit到父builder
 * 3. 失败时丢弃builder（自动GC）
 */
export class CSTBuilder {
    private nodes: SubhutiCst[] = []
    
    constructor(private parent: CSTBuilder | null = null) {}
    
    /**
     * 创建新的子构建器
     */
    createChild(): CSTBuilder {
        return new CSTBuilder(this)
    }
    
    /**
     * 添加节点到当前builder
     */
    addNode(node: SubhutiCst) {
        this.nodes.push(node)
    }
    
    /**
     * 提交到父构建器
     */
    commit() {
        if (this.parent) {
            this.parent.nodes.push(...this.nodes)
        }
    }
    
    /**
     * 获取所有节点（用于最终构建）
     */
    getNodes(): SubhutiCst[] {
        return this.nodes
    }
    
    /**
     * 回滚（什么都不做，让GC回收即可）
     */
    rollback() {
        // 无需操作，丢弃builder即可
    }
}
```

### 2. 修改 SubhutiParser.ts

#### 2.1 添加 builder 字段（第200行附近）

```typescript
// ❌ 修改前
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    // ...
}

// ✅ 修改后
import { CSTBuilder } from "../struct/CSTBuilder.ts"

export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private readonly cstStack: SubhutiCst[] = []
    private cstBuilder: CSTBuilder                      // 新增
    // ...
    
    constructor(...) {
        // ...
        this.cstBuilder = new CSTBuilder()               // 新增
    }
}
```

#### 2.2 修改 addToParent 方法（第427-432行）

```typescript
// ❌ 修改前
private addToParent(cst: SubhutiCst) {
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}

// ✅ 修改后
private addToParent(cst: SubhutiCst) {
    // 使用builder添加节点
    this.cstBuilder.addNode(cst)
    
    // 同时也添加到栈顶节点（保持兼容）
    const parent = this.parentCst
    if (parent && parent.children) {
        parent.children.push(cst)
    }
}
```

#### 2.3 修改 Or 方法（第578-613行）

```typescript
// ❌ 修改前
Or(alternatives: Array<{alt: Function}>): any {
    const savedState = this.saveState()
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            const result = alt.alt.call(this)
            return result
            
        } catch (error) {
            errors.push(error as Error)
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
            this.restoreState(savedState)
        }
    }
    return undefined
}

// ✅ 修改后
Or(alternatives: Array<{alt: Function}>): any {
    const savedTokenIndex = this.tokenIndex
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        // 创建临时builder
        const childBuilder = this.cstBuilder.createChild()
        const parentBuilder = this.cstBuilder
        this.cstBuilder = childBuilder
        
        try {
            const result = alt.alt.call(this)
            
            // ✅ 成功：commit到父builder
            childBuilder.commit()
            this.cstBuilder = parentBuilder
            
            return result
            
        } catch (error) {
            errors.push(error as Error)
            
            // ❌ 失败：丢弃childBuilder，恢复token
            this.cstBuilder = parentBuilder
            this.tokenIndex = savedTokenIndex
            
            if (isLast) {
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    [...this.ruleStack]
                )
            }
        }
    }
    return undefined
}
```

#### 2.4 可选：优化 buildCst（第384-409行）

```typescript
// 可以简化，因为builder已经处理了CST管理
private buildCst(ruleName: string, ruleFn: Function): SubhutiCst | undefined {
    const cst = new SubhutiCst()
    cst.name = ruleName
    cst.children = []
    
    this.cstStack.push(cst)
    this.ruleStack.push(ruleName)
    
    try {
        ruleFn.call(this)
        
        // 从builder获取子节点
        const builderNodes = this.cstBuilder.getNodes()
        cst.children = builderNodes
        
        this.addToParent(cst)
        this.setLocation(cst)
        
        return cst
        
    } catch (error) {
        throw error
    } finally {
        this.cstStack.pop()
        this.ruleStack.pop()
    }
}
```

## 工作量评估
- 新增代码：~150行
- 修改代码：~50行
- 修改文件：2个
- 测试工作量：中等（需要全面测试）
- 风险：中等

## 优点
✅ 架构清晰（事务语义）
✅ 易于理解和维护
✅ 零CST污染
✅ 工业标准方案

## 缺点
❌ 需要额外的Builder对象（内存开销）
❌ 稍微增加GC压力













