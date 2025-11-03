# SubhutiParser 新架构设计

**设计理念：** 可读性 > 逻辑清晰 > 简洁 > 易用 > 性能  
**参考标准：** Chevrotain (模块化) + PEG.js (极简) + ANTLR (清晰)

---

## 🏗️ 核心架构

### 整体设计（单文件，职责清晰）

```
SubhutiParser.ts
├── [1] 数据结构定义 (BacktrackData, MemoResult, ParsingError)
├── [2] 装饰器系统 (Subhuti, SubhutiRule)
├── [3] SubhutiParser 类
│   ├── 核心字段（最小化）
│   ├── 构造函数
│   ├── Token 管理
│   ├── CST 管理
│   ├── 规则执行（executeRule - 核心）
│   ├── CST 构建（buildCst - 成功才添加）
│   ├── 回溯机制（save/restore - 极简）
│   ├── Or 规则（顺序选择）
│   ├── Many 规则（0或多次）
│   ├── Option 规则（0或1次）
│   ├── Packrat Parsing（查询/应用/存储缓存）
│   └── 辅助方法（getter, 统计等）
└── [4] SubhutiCst 扩展（辅助方法）
```

**关键原则：**
- ✅ 单文件设计（保持简单）
- ✅ 清晰的代码分区（注释标注）
- ✅ 自顶向下阅读（从抽象到具体）

---

## 📐 核心数据结构

### 1. 回溯数据（极简）

```typescript
/**
 * 回溯数据 - 只需要 token 位置
 * 
 * 参考：PEG.js 的极简设计
 * 
 * 为什么只需要 tokenIndex？
 * - CST 采用"成功才添加"模式
 * - 失败时 CST 从未被添加，无需回退
 * - 只需要恢复 token 读取位置即可
 */
interface BacktrackData {
    tokenIndex: number
}
```

---

### 2. Memoization 结果

```typescript
/**
 * Packrat Parsing 缓存结果
 * 
 * 参考：Bryan Ford 的标准 Packrat Parsing
 */
interface MemoResult {
    success: boolean          // 规则是否成功
    endTokenIndex: number     // 解析结束位置
    cst?: SubhutiCst          // 成功时的 CST 节点
}
```

---

### 3. 解析错误

```typescript
/**
 * 解析错误类
 * 
 * 参考：Chevrotain 的 MismatchedTokenException
 */
class ParsingError extends Error {
    expected: string          // 期望的 token/规则
    found?: SubhutiMatchToken // 实际遇到的 token
    position: {               // 错误位置
        index: number
        line: number
        column: number
    }
    ruleStack: string[]       // 规则调用栈
    
    constructor(message, details) {
        super(message)
        Object.assign(this, details)
    }
    
    /**
     * 详细的错误信息
     */
    toString(): string {
        return `
Parsing Error at line ${this.position.line}, column ${this.position.column}
Expected: ${this.expected}
Found: ${this.found?.tokenName || 'EOF'}
Context: ${this.ruleStack.join(' → ')}
        `.trim()
    }
}
```

---

## 🎯 核心字段设计

### SubhutiParser 类字段（最小化）

```typescript
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    // ========================================
    // 核心字段（必须）
    // ========================================
    
    /**
     * Token 流
     */
    private readonly tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    
    /**
     * Token 消费器（公开字段，使用者访问）
     */
    readonly tokenConsumer: T
    
    /**
     * CST 构建栈
     * 
     * 说明：
     * - 栈顶 = 当前正在构建的 CST 节点
     * - 栈顶-1 = 父节点
     * - 不需要单独的 curCst 字段（用 getter 访问）
     */
    private readonly cstStack: SubhutiCst[] = []
    
    /**
     * 规则调用栈（用于错误报告）
     */
    private readonly ruleStack: string[] = []
    
    // ========================================
    // Packrat Parsing 字段
    // ========================================
    
    /**
     * 是否启用 Memoization（默认 true）
     */
    enableMemoization: boolean = true
    
    /**
     * Memoization 缓存
     * Key = `ruleName:tokenIndex`（字符串，简单直接）
     */
    private readonly memoCache = new Map<string, MemoResult>()
    
    /**
     * 缓存统计
     */
    private memoStats = {
        hits: 0,
        misses: 0,
        cacheSize: 0
    }
    
    // ========================================
    // 内部状态（私有，外部不可见）
    // ========================================
    
    /**
     * 初始化标志（用于第一次调用规则）
     */
    private isFirstRule: boolean = true
    
    /**
     * 类名（用于装饰器）
     */
    private readonly className: string
}
```

**设计原则：**
- ✅ **最小化字段** - 只保留必要的
- ✅ **readonly** - 不可变字段用 readonly
- ✅ **私有优先** - 默认私有，必要时公开
- ✅ **无冗余** - curCst 改为 getter

---

## 🔄 核心方法设计

### 1. 规则执行（executeRule - 核心中的核心）

```typescript
/**
 * 规则执行入口（由 @SubhutiRule 装饰器调用）
 * 
 * 核心流程：
 * 1. 初始化检查（第一次调用）
 * 2. Packrat：查询缓存
 * 3. 执行：构建 CST
 * 4. Packrat：存储缓存
 * 
 * 设计理念：
 * - 清晰的顺序执行（无复杂分支）
 * - Packrat 自然集成（可选，透明）
 * - 失败抛异常（无需标志）
 */
private executeRule(ruleName: string, ruleFn: Function): SubhutiCst | undefined {
    // ========================================
    // 1. 初始化检查
    // ========================================
    if (this.isFirstRule) {
        this.isFirstRule = false
        this.ruleStack.length = 0
        this.cstStack.length = 0
    }
    
    // ========================================
    // 2. Packrat: 查询缓存
    // ========================================
    if (this.enableMemoization) {
        const cached = this.queryMemo(ruleName, this.tokenIndex)
        if (cached) {
            this.memoStats.hits++
            return this.applyMemo(cached)  // 恢复状态并返回
        }
        this.memoStats.misses++
    }
    
    // ========================================
    // 3. 执行规则
    // ========================================
    const startIndex = this.tokenIndex
    const cst = this.buildCst(ruleName, ruleFn)
    
    // ========================================
    // 4. Packrat: 存储缓存
    // ========================================
    if (this.enableMemoization) {
        this.storeMemo(ruleName, startIndex, this.tokenIndex, cst)
        this.memoStats.cacheSize = this.memoCache.size
    }
    
    return cst
}
```

**优点：**
- ✅ 4个清晰的步骤
- ✅ Packrat 是可选的（if 判断）
- ✅ 顺序执行，易理解
- ✅ 无复杂的标志管理

---

### 2. CST 构建（buildCst - 成功才添加）

```typescript
/**
 * 构建 CST 节点
 * 
 * 核心流程：
 * 1. 创建 CST 节点
 * 2. 进入上下文（push 栈）
 * 3. 执行规则函数
 * 4. 成功：添加到父节点
 * 5. 退出上下文（pop 栈）
 * 
 * 参考：Chevrotain 的 enter/exitRule 模式
 * 
 * 关键设计：
 * - ✅ 成功才添加到父节点
 * - ✅ 失败不需要清理（从未添加）
 * - ✅ 使用 try-finally 确保栈正确
 */
private buildCst(ruleName: string, ruleFn: Function): SubhutiCst | undefined {
    // 1. 创建 CST 节点
    const cst = new SubhutiCst()
    cst.name = ruleName
    cst.children = []
    
    // 2. 进入上下文
    this.cstStack.push(cst)
    this.ruleStack.push(ruleName)
    
    try {
        // 3. 执行规则函数
        ruleFn.call(this)
        
        // 4. 成功：添加到父节点
        this.addToParent(cst)
        
        // 5. 设置位置信息
        this.setLocation(cst)
        
        return cst
        
    } catch (error) {
        // 失败：不添加到父节点，直接抛出
        throw error
        
    } finally {
        // 6. 退出上下文（无论成功失败都要执行）
        this.cstStack.pop()
        this.ruleStack.pop()
        
        // 恢复初始化标志（如果是第一个规则）
        if (this.ruleStack.length === 0) {
            this.isFirstRule = true
        }
    }
}

/**
 * 添加到父节点（统一入口）
 */
private addToParent(cst: SubhutiCst) {
    const parent = this.parentCst
    if (parent) {
        parent.children.push(cst)
    }
}

/**
 * 设置 CST 位置信息
 */
private setLocation(cst: SubhutiCst) {
    if (cst.children.length === 0) return
    
    const firstChild = cst.children[0]
    const lastChild = cst.children[cst.children.length - 1]
    
    if (firstChild.loc && lastChild.loc) {
        cst.loc = {
            type: cst.name,
            start: firstChild.loc.start,
            end: lastChild.loc.end
        }
    }
}
```

**优点：**
- ✅ 清晰的生命周期（enter → execute → exit）
- ✅ 成功才添加（符合所有主流框架）
- ✅ try-finally 确保栈正确
- ✅ 统一的 addToParent 方法

---

### 3. 回溯机制（极简）

```typescript
/**
 * 保存状态（创建快照）
 * 
 * 参考：PEG.js 的极简设计
 * 
 * 只需要保存 token 位置！
 * - CST 采用"成功才添加"，失败时没有添加过，无需回退
 * - 栈操作由 try-finally 保证，无需快照
 */
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex
    }
}

/**
 * 恢复状态（回溯）
 */
private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
}
```

**优点：**
- ✅ 极简（只有1个整数）
- ✅ O(1) 时间复杂度
- ✅ 无副作用

---

### 4. Packrat Parsing（自然集成）

```typescript
/**
 * 查询缓存
 */
private queryMemo(ruleName: string, tokenIndex: number): MemoResult | undefined {
    const key = `${ruleName}:${tokenIndex}`
    return this.memoCache.get(key)
}

/**
 * 应用缓存结果
 * 
 * 核心逻辑：
 * 1. 恢复 token 位置
 * 2. 如果成功，使用统一的 addToParent 方法
 */
private applyMemo(cached: MemoResult): SubhutiCst | undefined {
    // 恢复位置
    this.tokenIndex = cached.endTokenIndex
    
    if (cached.success && cached.cst) {
        // ✅ 使用统一的添加方法（与 buildCst 一致）
        this.addToParent(cached.cst)
        return cached.cst
    }
    
    // 失败：抛出缓存的异常
    throw new Error('Cached parsing failure')
}

/**
 * 存储缓存
 */
private storeMemo(
    ruleName: string, 
    startIndex: number, 
    endIndex: number, 
    cst: SubhutiCst | undefined
) {
    const key = `${ruleName}:${startIndex}`
    this.memoCache.set(key, {
        success: cst !== undefined,
        endTokenIndex: endIndex,
        cst
    })
}
```

**优点：**
- ✅ 与 buildCst 使用相同的 addToParent
- ✅ 逻辑统一（无需手动模拟）
- ✅ 失败也缓存（避免重复失败）

---

### 5. Or 规则（清晰的控制流）

**方案选择：返回值 + 异常混合（平衡）**

```typescript
/**
 * Or 规则 - 顺序选择（PEG 风格）
 * 
 * 语义：
 * - 按顺序尝试每个分支
 * - 第一个成功的立即返回
 * - 所有失败则抛异常
 * 
 * 参考：
 * - PEG.js: 返回值驱动
 * - Chevrotain: 异常驱动
 * - 我们：混合（返回值 + 最后抛异常）
 * 
 * 为什么不用双标志？
 * - 返回值已经表示成功/失败
 * - 异常表示致命错误
 * - 更符合 JS 惯例
 */
Or(alternatives: Array<{alt: Function}>): SubhutiCst | undefined {
    const savedState = this.saveState()
    const errors: Error[] = []
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            // 尝试执行分支
            const result = alt.alt()
            
            // ✅ 成功（有返回值或无异常）
            return result
            
        } catch (error) {
            // 失败：收集错误
            errors.push(error as Error)
            
            if (isLast) {
                // 最后一个分支也失败，抛出聚合错误
                throw new NoViableAltError(
                    `All ${alternatives.length} alternatives failed`,
                    errors,
                    this.ruleStack
                )
            }
            
            // 非最后分支：回溯，继续尝试
            this.restoreState(savedState)
        }
    }
    
    return undefined  // 空数组情况
}
```

**优点：**
- ✅ 清晰的 try-catch 控制流
- ✅ 自动回溯（无需手动管理标志）
- ✅ 错误聚合（提供更好的诊断信息）
- ✅ 符合 JS 惯例

---

### 6. Many 规则（简洁设计）

```typescript
/**
 * Many 规则 - 0次或多次
 * 
 * 语义：
 * - 尽可能多地匹配
 * - 0次也算成功
 * - 失败时停止循环（不抛异常）
 * 
 * 参考：Chevrotain 的 MANY
 */
Many(fn: Function): SubhutiCst {
    while (true) {
        const savedState = this.saveState()
        
        try {
            fn()  // 尝试匹配
            // 成功，继续循环
            
        } catch (error) {
            // 失败：回溯，退出循环
            this.restoreState(savedState)
            break
        }
    }
    
    return this.curCst  // ✅ 总是成功
}
```

**优点：**
- ✅ 极简（< 15 行）
- ✅ 清晰的循环逻辑
- ✅ 异常驱动退出

---

### 7. Option 规则（简洁设计）

```typescript
/**
 * Option 规则 - 0次或1次
 * 
 * 语义：
 * - 尝试匹配1次
 * - 失败也算成功（0次匹配）
 * 
 * 参考：Chevrotain 的 OPTION
 */
Option(fn: Function): SubhutiCst {
    const savedState = this.saveState()
    
    try {
        fn()  // 尝试匹配
        // 成功，保持
        
    } catch (error) {
        // 失败：回溯（0次匹配）
        this.restoreState(savedState)
    }
    
    return this.curCst  // ✅ 总是成功
}
```

**优点：**
- ✅ 极简（< 10 行）
- ✅ 逻辑一目了然
- ✅ 与 Many 保持一致

---

### 8. Token 消费

```typescript
/**
 * 消费 token
 * 
 * 核心逻辑：
 * 1. 检查当前 token 是否匹配
 * 2. 成功：消费 token，创建 token CST 节点，返回 token
 * 3. 失败：抛出详细的错误
 * 
 * 参考：Chevrotain 的 CONSUME
 * 
 * ✅ 返回 token 对象（新增）
 */
consumeToken(expectedTokenName: string): SubhutiMatchToken {
    const token = this.tokens[this.tokenIndex]
    
    // 检查匹配
    if (!token || token.tokenName !== expectedTokenName) {
        throw new ParsingError(
            `Expected ${expectedTokenName}`,
            {
                expected: expectedTokenName,
                found: token,
                position: token ? {
                    index: token.index,
                    line: token.rowNum,
                    column: token.columnStartNum
                } : {index: this.tokens[this.tokens.length - 1]?.index || 0, line: 0, column: 0},
                ruleStack: [...this.ruleStack]
            }
        )
    }
    
    // 消费 token
    this.tokenIndex++
    
    // 创建 token CST 节点并添加到当前 CST
    const tokenCst = this.createTokenCst(token)
    this.curCst.children.push(tokenCst)
    
    // ✅ 返回 token 对象
    return token
}

/**
 * 创建 token CST 节点
 */
private createTokenCst(token: SubhutiMatchToken): SubhutiCst {
    const cst = new SubhutiCst()
    cst.name = token.tokenName
    cst.value = token.tokenValue
    cst.loc = {
        type: token.tokenName,
        value: token.tokenValue,
        start: {
            index: token.index,
            line: token.rowNum,
            column: token.columnStartNum
        },
        end: {
            index: token.index + token.tokenValue.length,
            line: token.rowNum,
            column: token.columnEndNum
        }
    }
    return cst
}
```

**优点：**
- ✅ 返回 token 对象（可以访问值和位置）
- ✅ 详细的错误信息
- ✅ 清晰的失败路径（抛异常）

---

## 🎨 Getter 设计（替代字段）

```typescript
/**
 * 当前 CST 节点（栈顶）
 */
get curCst(): SubhutiCst {
    return this.cstStack[this.cstStack.length - 1]
}

/**
 * 父 CST 节点（栈顶-1）
 */
get parentCst(): SubhutiCst | undefined {
    return this.cstStack.length >= 2 
        ? this.cstStack[this.cstStack.length - 2] 
        : undefined
}

/**
 * 当前 token
 */
get currentToken(): SubhutiMatchToken | undefined {
    return this.tokens[this.tokenIndex]
}

/**
 * 是否已解析完所有 token
 */
get isAtEnd(): boolean {
    return this.tokenIndex >= this.tokens.length
}
```

**优点：**
- ✅ 消除冗余字段
- ✅ 自动同步（无需手动 set）
- ✅ 语义清晰

---

## 🔑 关键设计决策

### 决策1：异常 vs 标志

**选择：异常驱动**

**理由：**
1. ✅ 符合 JavaScript 惯例
2. ✅ 类型清晰（成功有返回值，失败抛异常）
3. ✅ 代码简洁（无需双标志）
4. ✅ 易于理解

**性能影响：**
- 异常创建有开销（~1-10μs）
- 但 Packrat Parsing 已消除大部分回溯
- 剩余的异常开销可接受

---

### 决策2：单层 Map vs 嵌套 Map

**选择：单层 Map，字符串 key**

**理由：**
1. ✅ 更简单（不需要嵌套结构）
2. ✅ key 构建简单（`${ruleName}:${tokenIndex}`）
3. ✅ 内存占用相似
4. ✅ 可读性更好

**性能影响：**
- 字符串拼接有开销（~0.1μs）
- 但比嵌套 Map 查询更快
- 总体性能相似

---

### 决策3：成功才添加

**选择：成功才添加到父节点**

**理由：**
1. ✅ 符合所有主流框架
2. ✅ 逻辑清晰（无需事后清理）
3. ✅ Packrat 自然集成
4. ✅ 降低出错风险

---

### 决策4：curCst 字段 vs Getter

**选择：Getter（移除字段）**

**理由：**
1. ✅ 消除冗余
2. ✅ 自动同步
3. ✅ 无性能影响（栈访问极快）

---

## 📊 代码量对比（估算）

| 模块 | 旧版本 | 新版本 | 变化 |
|-----|-------|--------|------|
| **核心字段** | ~30行 | ~20行 | -33% |
| **构造函数** | ~10行 | ~15行 | +50% |
| **规则执行** | ~60行 | ~40行 | -33% |
| **CST 构建** | ~80行 | ~50行 | -38% |
| **回溯** | ~40行 | ~10行 | -75% ⭐ |
| **Or 规则** | ~60行 | ~30行 | -50% ⭐ |
| **Many 规则** | ~50行 | ~15行 | -70% ⭐ |
| **Option 规则** | ~30行 | ~10行 | -67% ⭐ |
| **Packrat** | ~150行 | ~100行 | -33% |
| **Token 消费** | ~50行 | ~40行 | -20% |
| **辅助方法** | ~100行 | ~80行 | -20% |
| **注释** | ~200行 | ~300行 | +50% |
| **总计** | ~860行 | **~620行** | **-28%** ⭐ |

**注释增加的原因：**
- 每个方法都有清晰的文档注释
- 说明设计理念和参考框架
- 提高可读性

---

## ✅ 架构设计完成

**核心改进：**
1. ✅ **成功才添加** - 符合业界标准
2. ✅ **极简回溯** - 只需 token 位置
3. ✅ **异常驱动** - 清晰的控制流
4. ✅ **Packrat 自然集成** - 统一的 addToParent
5. ✅ **Getter 替代字段** - 消除冗余
6. ✅ **单层 Map** - 简化缓存结构
7. ✅ **详细错误** - ParsingError 类
8. ✅ **代码减少 28%** - 更简洁

**下一步：** 开始实现！








