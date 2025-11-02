# SubhutiParser 重写计划

**目标：** 基于行业最佳实践，重新编写一个优雅、清晰、易用的 SubhutiParser

**核心要求（按优先级）：**
1. ⭐⭐⭐⭐⭐ **可读性高** - 代码一目了然，容易理解
2. ⭐⭐⭐⭐⭐ **逻辑清晰** - 实现机制简单明了
3. ⭐⭐⭐⭐ **代码简洁** - 避免冗余，精简设计
4. ⭐⭐⭐⭐ **使用简单** - API 符合直觉
5. ⭐⭐⭐ **Packrat Parsing** - 必须实现，但集成要优雅
6. ⭐⭐ **性能** - 最后考虑（Packrat 已解决主要性能问题）

**约束：**
- ✅ Es2020Parser 尽量不修改
- ✅ 兼容现有的 API 使用方式
- ✅ 保持装饰器语法（@Subhuti, @SubhutiRule）

---

## 📋 详细任务清单

### 阶段一：需求分析（1小时）

#### 任务1：分析 Parser 使用的 API
**目标：** 提取完整的 API 清单

**分析内容：**
- Es2020Parser/Es6Parser 使用的所有方法
- 装饰器的使用方式
- tokenConsumer 的使用方式
- 规则组合方式（Or, Many, Option）

**产出：**
- `API_REQUIREMENTS.md` - 完整的 API 清单
- 必须保留的 API
- 可以改进的 API

---

#### 任务2：分析测试用例的使用方式
**目标：** 确定使用者视角的 API

**分析内容：**
- 如何创建 Parser 实例
- 如何调用规则方法
- 如何访问 CST
- 错误处理方式

**产出：**
- 使用者期望的 API 设计
- 不能破坏的使用方式

---

### 阶段二：架构设计（2小时）

#### 任务3：核心架构设计
**目标：** 设计清晰的模块化架构

**参考框架：**
- Chevrotain - 模块化设计
- ANTLR 4 - enterRule/exitRule 模式
- PEG.js - 简洁的回溯

**设计内容：**
```
SubhutiParser (核心协调器)
├── RuleExecutor      (规则执行)
├── CstBuilder        (CST 构建 - 成功才添加)
├── Backtracker       (回溯机制 - 只需 token 位置)
├── Memoizer          (Packrat Parsing)
└── ErrorHandler      (错误处理)
```

**产出：**
- `ARCHITECTURE_DESIGN.md` - 架构设计文档
- 类图和职责划分

---

#### 任务4：CST 构建机制设计
**目标：** 设计"成功才添加"模式

**核心理念：** 参考 Chevrotain 的 exitRule

```typescript
// 伪代码
executeRule(ruleName, fn) {
    const cst = createCst(ruleName)
    pushContext(cst)  // 进入上下文
    
    try {
        fn()  // 执行规则
        
        if (success) {
            addToParent(cst)  // ✅ 成功才添加
            return cst
        }
    } finally {
        popContext()  // 退出上下文
    }
    
    return undefined  // 失败不添加
}
```

**产出：**
- CST 构建流程图
- 父子关系处理方案

---

#### 任务5：回溯机制设计
**目标：** 设计简洁的回溯机制

**核心理念：** 参考 PEG.js 的极简设计

```typescript
// 只需要保存 token 位置
class BacktrackData {
    tokenIndex: number  // ✅ 只需要一个整数
}

// CST 成功才添加，失败时不需要清理
backtrack(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex  // ✅ 只恢复位置
}
```

**产出：**
- 回溯机制设计文档
- 与 CST 构建的集成方式

---

#### 任务6：Packrat Parsing 设计
**目标：** 设计自然集成的 Memoization

**核心理念：** 缓存规则返回值

```typescript
// ✅ 缓存返回值（成功/失败 + CST）
class MemoResult {
    success: boolean
    endTokenIndex: number
    cst?: SubhutiCst
}

// ✅ 自然集成到规则执行
executeRule(ruleName, fn) {
    // 查询缓存
    const cached = getMemo(ruleName, tokenIndex)
    if (cached) {
        restoreState(cached)  // 恢复状态
        if (cached.success) {
            addToParent(cached.cst)  // ✅ 使用统一的添加方法
        }
        return cached.cst
    }
    
    // 执行规则
    const cst = doExecuteRule(ruleName, fn)
    
    // 缓存结果
    storeMemo(ruleName, tokenIndex, cst)
    
    return cst
}
```

**产出：**
- Packrat Parsing 集成方案
- 缓存策略（成功+失败）

---

#### 任务7：Or/Many/Option 设计
**目标：** 选择最优雅的控制流机制

**方案对比：**

**方案A：异常驱动（Chevrotain 风格）**
```typescript
Or(alternatives) {
    for (const alt of alternatives) {
        try {
            return alt()  // ✅ 成功返回
        } catch (e) {
            if (isLast) throw e
            // 继续尝试
        }
    }
}
```
- 优点：清晰，符合 JS 惯例
- 缺点：异常有性能开销

**方案B：返回值驱动（PEG.js 风格）**
```typescript
Or(alternatives) {
    for (const alt of alternatives) {
        const result = alt()
        if (result !== FAILED) {
            return result  // ✅ 成功返回
        }
        // 自动回溯，继续尝试
    }
    return FAILED
}
```
- 优点：简洁，无异常开销
- 缺点：需要特殊的 FAILED 值

**方案C：单标志（简化当前设计）**
```typescript
Or(alternatives) {
    for (const alt of alternatives) {
        const savedPos = this.tokenIndex
        const result = alt()
        
        if (result !== undefined) {
            return result  // ✅ 成功返回
        }
        
        this.tokenIndex = savedPos  // 回溯
    }
    return undefined
}
```
- 优点：简单，无双标志
- 缺点：返回 undefined 表示失败

**产出：**
- 控制流机制选择及理由
- Or/Many/Option 实现方案

---

### 阶段三：核心实现（8-10小时）

#### 任务8：实现基础框架
**内容：**
```typescript
// SubhutiParser.ts (核心类)
export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    // 核心字段（最少化）
    private tokens: SubhutiMatchToken[]
    private tokenIndex: number = 0
    private cstStack: SubhutiCst[] = []
    
    // Packrat Parsing
    private memoCache: Map<string, Map<number, MemoResult>>
    enableMemoization: boolean = true
    
    tokenConsumer: T
    
    constructor(tokens, TokenConsumerClass) {
        this.tokens = tokens
        this.tokenConsumer = new TokenConsumerClass(this)
    }
    
    // 核心 getter（替代字段）
    get curCst(): SubhutiCst {
        return this.cstStack[this.cstStack.length - 1]
    }
    
    get parentCst(): SubhutiCst | undefined {
        return this.cstStack.length >= 2 
            ? this.cstStack[this.cstStack.length - 2] 
            : undefined
    }
}
```

**产出：** 基础框架代码

---

#### 任务9：实现装饰器
**内容：**
```typescript
// @Subhuti - 类装饰器
export function Subhuti(target, context) {
    // 保存类名用于装饰器
    context.metadata.className = target.name
    return target
}

// @SubhutiRule - 方法装饰器
export function SubhutiRule(targetFun, context) {
    const ruleName = targetFun.name
    
    // 包装为规则执行器
    const wrapper = function() {
        return this.executeRule(ruleName, targetFun)
    }
    
    Object.defineProperty(wrapper, 'name', {value: ruleName})
    return wrapper
}
```

**产出：** 装饰器实现

---

#### 任务10：实现 Token 消费
**内容：**
```typescript
/**
 * 消费 token（返回 token 对象）
 */
consumeToken(tokenName: string): SubhutiMatchToken {
    const token = this.tokens[this.tokenIndex]
    
    if (!token || token.tokenName !== tokenName) {
        throw new ParsingError(
            `Expected ${tokenName}, found ${token?.tokenName}`,
            token,
            this.getCurrentContext()
        )
    }
    
    this.tokenIndex++
    
    // 添加到当前 CST
    const tokenCst = this.createTokenCst(token)
    this.curCst.children.push(tokenCst)
    
    return token  // ✅ 返回 token 对象
}
```

**产出：** Token 消费机制

---

#### 任务11：实现 CST 构建器
**内容：**
```typescript
/**
 * CST 构建器 - 成功才添加模式
 */
private buildCst(ruleName: string, fn: Function): SubhutiCst | undefined {
    // 1. 创建 CST 节点
    const cst = new SubhutiCst()
    cst.name = ruleName
    cst.children = []
    
    // 2. 进入上下文
    this.cstStack.push(cst)
    
    try {
        // 3. 执行规则
        fn.call(this)
        
        // 4. 成功才添加到父节点
        this.addToParent(cst)
        
        return cst
        
    } catch (error) {
        // 失败不添加，直接返回
        return undefined
        
    } finally {
        // 5. 退出上下文
        this.cstStack.pop()
    }
}

/**
 * 添加到父节点（统一入口）
 */
private addToParent(cst: SubhutiCst) {
    if (this.parentCst) {
        this.parentCst.children.push(cst)
    }
}
```

**产出：** CST 构建机制

---

#### 任务12：实现回溯机制
**内容：**
```typescript
/**
 * 回溯数据（极简）
 */
interface BacktrackData {
    tokenIndex: number  // ✅ 只需要 token 位置
}

/**
 * 保存状态
 */
saveState(): BacktrackData {
    return { tokenIndex: this.tokenIndex }
}

/**
 * 恢复状态
 */
restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex
}
```

**产出：** 回溯机制

---

#### 任务13：实现 Or 规则
**内容：**
```typescript
/**
 * Or 规则 - 顺序选择
 */
Or(alternatives: Array<{alt: Function}>): SubhutiCst | undefined {
    const savedState = this.saveState()
    
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            const result = alt.alt()  // 尝试分支
            if (result !== undefined) {
                return result  // ✅ 成功返回
            }
        } catch (error) {
            if (isLast) {
                throw error  // 最后一个失败，向上传播
            }
        }
        
        // 失败，回溯到初始状态
        this.restoreState(savedState)
    }
    
    return undefined  // 所有分支失败
}
```

**产出：** Or 规则实现

---

#### 任务14：实现 Many 规则
**内容：**
```typescript
/**
 * Many 规则 - 0次或多次
 */
Many(fn: Function): SubhutiCst {
    while (true) {
        const savedState = this.saveState()
        
        try {
            const result = fn()
            if (result === undefined) {
                this.restoreState(savedState)
                break  // 失败，退出循环
            }
            // 成功，继续循环
        } catch (error) {
            this.restoreState(savedState)
            break  // 失败，退出循环
        }
    }
    
    return this.curCst  // ✅ 总是成功
}
```

**产出：** Many 规则实现

---

#### 任务15：实现 Option 规则
**内容：**
```typescript
/**
 * Option 规则 - 0次或1次
 */
Option(fn: Function): SubhutiCst {
    const savedState = this.saveState()
    
    try {
        const result = fn()
        if (result === undefined) {
            this.restoreState(savedState)
        }
    } catch (error) {
        this.restoreState(savedState)
    }
    
    return this.curCst  // ✅ 总是成功
}
```

**产出：** Option 规则实现

---

#### 任务16：实现 Packrat Parsing
**内容：**
```typescript
/**
 * 规则执行入口（集成 Packrat Parsing）
 */
executeRule(ruleName: string, fn: Function): SubhutiCst | undefined {
    // 1. 查询缓存
    if (this.enableMemoization) {
        const cached = this.queryMemo(ruleName, this.tokenIndex)
        if (cached) {
            return this.applyMemo(cached)  // ✅ 自然集成
        }
    }
    
    // 2. 执行规则
    const startIndex = this.tokenIndex
    const cst = this.buildCst(ruleName, fn)
    
    // 3. 缓存结果
    if (this.enableMemoization) {
        this.storeMemo(ruleName, startIndex, this.tokenIndex, cst)
    }
    
    return cst
}

/**
 * 应用缓存（简洁版）
 */
private applyMemo(cached: MemoResult): SubhutiCst | undefined {
    // 恢复位置
    this.tokenIndex = cached.endIndex
    
    if (cached.cst) {
        // ✅ 使用统一的添加方法
        this.addToParent(cached.cst)
    }
    
    return cached.cst
}
```

**产出：** Packrat Parsing 实现

---

#### 任务17：实现错误处理
**内容：**
```typescript
/**
 * 解析错误类
 */
class ParsingError extends Error {
    token: SubhutiMatchToken
    expected: string
    ruleStack: string[]
    
    constructor(message, token, context) {
        super(message)
        this.token = token
        this.expected = context.expected
        this.ruleStack = context.ruleStack
    }
    
    // ✅ 详细的错误信息
    toString() {
        return `
Parsing Error at line ${this.token.rowNum}, column ${this.token.columnStartNum}
Expected: ${this.expected}
Found: ${this.token.tokenValue}
Rule Stack: ${this.ruleStack.join(' -> ')}
        `
    }
}
```

**产出：** 错误处理机制

---

#### 任务18：实现 CST 辅助方法
**内容：**
```typescript
// 扩展 SubhutiCst 类
class SubhutiCst {
    name: string
    children: SubhutiCst[] = []
    value?: string
    loc?: Location
    
    // ✅ 辅助方法
    getChild(name: string, index: number = 0): SubhutiCst | undefined {
        return this.children.filter(c => c.name === name)[index]
    }
    
    getChildren(name: string): SubhutiCst[] {
        return this.children.filter(c => c.name === name)
    }
    
    getToken(tokenName: string): SubhutiCst | undefined {
        return this.children.find(c => c.name === tokenName && c.value)
    }
    
    hasChild(name: string): boolean {
        return this.children.some(c => c.name === name)
    }
}
```

**产出：** CST 辅助方法

---

### 阶段三：基础测试（2小时）

#### 任务19：创建单元测试
**测试内容：**
1. Token 消费正确性
2. 简单规则执行
3. Or 规则的分支选择
4. Many 规则的循环
5. Option 规则的可选性

**产出：**
- `subhuti/tests/unit/` - 单元测试

---

#### 任务20：测试回溯机制
**测试内容：**
1. Or 第一个分支失败，第二个成功
2. Many 循环中途失败
3. 嵌套的 Or/Many/Option

**产出：**
- 回溯机制测试用例

---

#### 任务21：测试 Packrat Parsing
**测试内容：**
1. 缓存命中/未命中
2. 重复规则调用被缓存
3. 性能提升验证（嵌套场景）

**产出：**
- Packrat Parsing 测试用例
- 性能基准测试

---

### 阶段四：集成测试（3小时）

#### 任务22：Es2020Parser 完整测试
**测试内容：**
- 运行所有 ES2020 测试用例（23个）
- 功能完全正常
- CST 结构正确

**成功标准：** 23/23 通过

---

#### 任务23：性能测试
**测试内容：**
- `const [[[deep]]] = [[[1]]]` 性能测试
- 验证 Packrat Parsing 效果
- 对比旧版本

**成功标准：** 三层嵌套 < 10ms

---

#### 任务24：Es6Parser 回归测试
**测试内容：**
- 运行 Es6Parser 测试（10个）
- 确保继承正常

**成功标准：** 10/10 通过

---

### 阶段五：文档和总结（2小时）

#### 任务25：编写设计文档
**内容：**
- 架构设计说明
- 核心机制解释
- 与旧版本的对比
- 与 Chevrotain/ANTLR/PEG.js 的对比

**产出：** `subhuti/DESIGN.md`

---

#### 任务26：编写 API 文档
**内容：**
- 完整的 API 说明
- 使用示例
- 最佳实践

**产出：** `subhuti/API.md`

---

#### 任务27：总结改进
**内容：**
- 改进点列表
- 性能对比
- 代码量对比
- 可读性对比

**产出：** `subhuti/REWRITE_SUMMARY.md`

---

## 📊 时间和资源估算

| 阶段 | 任务数 | 预计时间 | 关键产出 |
|-----|-------|---------|---------|
| **阶段一：需求分析** | 2 | 1小时 | API 清单、使用模式 |
| **阶段二：架构设计** | 5 | 2小时 | 架构文档、设计方案 |
| **阶段三：核心实现** | 10 | 8-10小时 | 新 SubhutiParser 代码 |
| **阶段四：集成测试** | 3 | 3小时 | 测试通过验证 |
| **阶段五：文档总结** | 3 | 2小时 | 完整文档 |
| **总计** | 23 | **16-18小时** | 生产级 Parser 框架 |

---

## 🎯 核心设计原则

### 1. 可读性优先 ⭐⭐⭐⭐⭐

**体现：**
- 清晰的方法命名（executeRule, buildCst, addToParent）
- 详细的注释（每个方法都有用途说明）
- 单一职责（每个方法只做一件事）
- 避免魔法数字和隐式行为

---

### 2. 逻辑清晰 ⭐⭐⭐⭐⭐

**体现：**
- 顺序执行（进入 → 执行 → 退出）
- 明确的成功/失败路径
- "成功才添加"（不需要事后清理）
- 统一的父子关系处理（addToParent）

---

### 3. 代码简洁 ⭐⭐⭐⭐

**体现：**
- 移除冗余字段（curCst → getter）
- 极简回溯（只需 token 位置）
- 提取公共方法（减少重复）
- 单一 Map 缓存（不用嵌套 Map）

---

### 4. 使用简单 ⭐⭐⭐⭐

**体现：**
- 保持装饰器语法（@SubhutiRule）
- 直观的 API（Or, Many, Option）
- 兼容现有代码（Es2020Parser 不需要大改）
- 良好的错误信息

---

### 5. Packrat Parsing 优雅集成 ⭐⭐⭐

**体现：**
- 自然集成到 executeRule
- 使用统一的 addToParent
- 配置化（enableMemoization）
- 透明化（对使用者透明）

---

## 🚀 关键改进点

### 对比旧版本

| 方面 | 旧版本 | 新版本 | 改进 |
|-----|-------|--------|------|
| **CST 添加** | 推测性添加 + 事后删除 | 成功才添加 ⭐ | 逻辑清晰 |
| **回溯数据** | 3个值（tokenIndex + 2个数组长度）| 1个值（tokenIndex）⭐ | 极简 |
| **状态管理** | curCst 字段 + cstStack | 只用 cstStack + getter ⭐ | 无冗余 |
| **标志** | 双标志（ruleMatchSuccess + loopMatchSuccess）| 单标志或异常 ⭐ | 简化 |
| **Packrat** | 手动模拟父子关系 | 统一 addToParent ⭐ | 优雅 |
| **错误信息** | 简单字符串 | ParsingError 对象 ⭐ | 详细 |
| **Token 返回** | 无返回值 | 返回 token 对象 ⭐ | 可用 |
| **CST 访问** | 手动遍历 | getChild/getChildren ⭐ | 方便 |

---

## ❓ 请您确认

我已经制定了完整的重写计划：
- **23个任务**，分为 **5个阶段**
- **预计 16-18 小时**完成
- **8个核心改进点**

**计划特点：**
1. ✅ 先分析需求，再设计架构
2. ✅ 每个阶段都有明确的产出
3. ✅ 分阶段测试验证
4. ✅ 优先级明确（可读性 > 逻辑 > 简洁 > 易用 > 性能）

**您是否同意这个计划？**

**如果同意，我会：**
1. 立即开始执行任务1-2（需求分析）
2. 每完成一个阶段向您汇报
3. 遇到设计决策时征询您的意见

**如果需要调整：**
- 可以增删任务
- 可以调整优先级
- 可以修改时间估算

**您的决定是？**

---

# 📝 实际修复记录

## [2025-11-02] 修复回溯时的 CST 污染问题 ✅

### 问题描述

**现象**：CST 中出现大量空节点（`children: []`），占比高达 80%+

**复现代码**：
```javascript
Math.max(1, 2) + Math.min(5, 3)
```

**问题节点**：
- `NewExpression: { children: [] }`
- `PostfixExpression: { children: [] }`
- `UnaryExpression: { children: [] }`
- `LeftHandSideExpression: { children: [] }`
- 等等...

### 根本原因

Or 规则在回溯时只恢复了 `tokenIndex`，但没有清理失败分支已经添加到父节点的子节点。

**问题代码**：
```typescript
// 之前的实现
private saveState(): BacktrackData {
    return {
        tokenIndex: this.tokenIndex  // ✅ 只保存 token 位置
        // ❌ 没有保存 cstStack 状态
    }
}

private restoreState(data: BacktrackData) {
    this.tokenIndex = data.tokenIndex  // ✅ 只恢复 token 位置
    // ❌ 没有清理失败分支的子节点
}
```

**执行流程**：
1. Or 规则尝试第一个分支
2. 分支失败前，已经创建了一些 CST 节点并添加到父节点
3. 回溯时只恢复了 tokenIndex
4. 父 CST 的 children 数组被污染（包含失败分支的空节点）

### 修复方案：写时复制（Copy-on-Write）

**核心思路**：
- 保存状态时：记录每层 CST 的 children 数组长度
- 回溯时：截断 children 数组到保存的长度

**修复代码**：
```typescript
// 修复后的实现
interface BacktrackData {
    tokenIndex: number
    cstChildrenLengths: number[]  // 新增：每层 CST 的 children 长度
}

private saveState(): BacktrackData {
    // 保存每层 CST 的 children 长度
    const cstChildrenLengths = this.cstStack.map(cst => 
        cst.children ? cst.children.length : 0
    )
    
    return {
        tokenIndex: this.tokenIndex,
        cstChildrenLengths
    }
}

private restoreState(data: BacktrackData) {
    // 恢复 token 位置
    this.tokenIndex = data.tokenIndex
    
    // 截断每层 CST 的 children 数组（移除失败分支的节点）
    for (let i = 0; i < this.cstStack.length && i < data.cstChildrenLengths.length; i++) {
        const cst = this.cstStack[i]
        const savedLength = data.cstChildrenLengths[i]
        
        if (cst.children && cst.children.length > savedLength) {
            // 截断 children 数组到保存的长度
            cst.children.length = savedLength
        }
    }
}
```

### 修复效果

**测试 1：简单表达式 `a`**
```
总节点数: 23
空节点数: 3 (13.04%)  ← 从 80%+ 降到 13%
✅ 无重复 token（回溯成功）
```

**测试 2：复杂表达式 `Math.max(1, 2) + Math.min(5, 3)`**
```
总节点数: 67
空节点数: 9 (13.43%)  ← 从数百个降到 9 个
✅ 无重复 token（回溯成功）
```

**剩余的 9 个空节点都是合理的**：
- `PostfixExpression` - Option 规则，0次匹配（如 `i++` 的 `++` 是可选的）
- `UnaryExpression` - Option 规则，0次匹配（如 `+1` 的 `+` 是可选的）
- `EmptySemicolon` - 空分号规则，本身就是空的

### 技术亮点

✅ **简单高效**：无需深度复制整个 CST，只记录长度  
✅ **性能最优**：截断数组的时间复杂度 O(1)  
✅ **内存友好**：不需要额外的副本  
✅ **完全透明**：对使用者完全透明  

### 修改文件

- `subhuti/src/parser/SubhutiParser.ts`
  - 修改 `BacktrackData` 接口（+1 字段）
  - 修改 `saveState()` 方法（+3 行）
  - 修改 `restoreState()` 方法（+10 行）

### 测试文件

- `slime/tests/ppp/test-backtrack.ts` - 回溯机制测试
- `slime/tests/ppp/test-complex.ts` - 复杂表达式测试

### 经验总结

**设计教训**：
- PEG Parser 的回溯不仅要恢复 token 位置，还要恢复 CST 状态
- "成功才添加"的策略在 Or 规则中并不成立（分支失败前已经添加了）
- 写时复制是解决回溯问题的最优方案

**最佳实践**：
- 回溯数据应该包含所有可变状态
- 使用长度记录而不是深度复制（性能优化）
- 测试时要检查 CST 的完整性（不仅是能否解析成功）

---


