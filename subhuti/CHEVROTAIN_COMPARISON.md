# Chevrotain vs SubhutiParser 深度对比

**Chevrotain 简介：**
- TypeScript/JavaScript Parser Combinator 库
- 由 SAP 开发和维护
- 生产级别，被多个大型项目使用
- 性能极高（接近手写 Parser）

**官网：** https://chevrotain.io/  
**GitHub：** https://github.com/Chevrotain/chevrotain

---

## 🎯 核心设计理念对比

### Chevrotain 的核心理念

#### 1. 规则即方法（Rule as Method）

```typescript
class JsonParser extends CstParser {
    constructor() {
        super(allTokens)
        this.performSelfAnalysis()  // ✅ 自动分析规则
    }
    
    // ✅ 规则就是普通方法，返回 CstNode
    json = this.RULE("json", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.object) },
            { ALT: () => this.SUBRULE(this.array) }
        ])
    })
    
    object = this.RULE("object", () => {
        this.CONSUME(LCurly)
        this.OPTION(() => {
            this.SUBRULE(this.objectItem)
            this.MANY(() => {
                this.CONSUME(Comma)
                this.SUBRULE1(this.objectItem)  // ✅ 序号区分重复调用
            })
        })
        this.CONSUME(RCurly)
    })
}
```

**核心特点：**
- ✅ 规则在构造函数中定义（提前分析）
- ✅ DSL 风格（RULE, OR, OPTION, MANY, CONSUME, SUBRULE）
- ✅ 自动编号（SUBRULE1, SUBRULE2 区分多次调用）
- ✅ 自我分析（performSelfAnalysis 构建内部优化数据）

---

#### 2. 异常驱动的控制流（Exception-driven Control Flow）

```typescript
// ✅ 成功返回值，失败抛异常
CONSUME(tokenType: TokenType): IToken {
    const token = this.LA(1)
    
    if (token.tokenType !== tokenType) {
        throw new MismatchedTokenException(...)  // ✅ 异常即失败
    }
    
    this.consumeInternal()
    return token  // ✅ 返回值即成功
}

// Or 规则处理异常
OR(alternatives) {
    for (let i = 0; i < alternatives.length; i++) {
        const alt = alternatives[i]
        const isLast = i === alternatives.length - 1
        
        try {
            return alt.ALT()  // ✅ 成功直接返回
        } catch (e) {
            if (isLast) {
                throw e  // 最后一个失败，向上传播
            }
            // 非最后一个，继续尝试
        }
    }
}
```

**对比 Subhuti：**
- Subhuti：双标志（ruleMatchSuccess, loopMatchSuccess）
- Chevrotain：异常 + 返回值

**Chevrotain 优势：**
- ✅ 更符合 JavaScript/TypeScript 惯例
- ✅ 类型清晰（成功必有返回值，失败必抛异常）
- ✅ 不需要检查标志

**Subhuti 优势：**
- ✅ 异常有性能开销（创建堆栈）
- ✅ 双标志适合容错解析

---

#### 3. CST vs AST

```typescript
// Chevrotain 支持两种模式

// 模式1：CST Parser（保留所有语法细节）
class CstJsonParser extends CstParser {
    json = this.RULE("json", () => {
        this.OR([...])
        // ✅ 返回 CstNode（自动构建）
    })
}

// 模式2：Embedded Actions（直接构建 AST）
class AstJsonParser extends EmbeddedActionsParser {
    json = this.RULE("json", () => {
        const result = this.OR([
            { ALT: () => this.SUBRULE(this.object) },  // 返回 Object AST
            { ALT: () => this.SUBRULE(this.array) }    // 返回 Array AST
        ])
        return result  // ✅ 直接返回 AST
    })
    
    object = this.RULE("object", () => {
        this.CONSUME(LCurly)
        const entries = []
        
        this.OPTION(() => {
            entries.push(this.SUBRULE(this.objectItem))  // ✅ 手动构建
            this.MANY(() => {
                this.CONSUME(Comma)
                entries.push(this.SUBRULE1(this.objectItem))
            })
        })
        
        this.CONSUME(RCurly)
        
        return { type: "Object", entries }  // ✅ 返回 AST
    })
}
```

**对比 Subhuti：**
- Subhuti：只支持 CST → AST（两步）
- Chevrotain：支持 CST 或直接 AST（灵活）

---

#### 4. LL(k) 前瞻 vs 无前瞻

**Chevrotain（LL(k)）：**

```typescript
// ✅ 支持前瞻（自动计算 k 值）
json = this.RULE("json", () => {
    this.OR([
        { 
            // ✅ 自动前瞻：看到 '{' 就知道是 object
            GATE: () => this.LA(1).tokenType === LCurly,
            ALT: () => this.SUBRULE(this.object) 
        },
        { 
            // ✅ 看到 '[' 就知道是 array
            GATE: () => this.LA(1).tokenType === LBracket,
            ALT: () => this.SUBRULE(this.array) 
        }
    ])
})
```

**Subhuti（PEG，无前瞻）：**

```typescript
// ❌ 只能靠 Or 顺序 + 回溯
@SubhutiRule
Json() {
    this.Or([
        {alt: () => this.Object()},  // 先尝试
        {alt: () => this.Array()}    // 失败再尝试
    ])
}
```

**Chevrotain 优势：**
- ✅ 更高效（避免无谓的回溯）
- ✅ 更灵活（GATE 自定义条件）
- ✅ 更清晰（明确的前瞻逻辑）

**Subhuti 优势：**
- ✅ 更简单（不需要前瞻分析）
- ✅ 符合 PEG 语义

---

#### 5. 自动优化 vs 手动优化

**Chevrotain（自动 ⭐⭐⭐⭐⭐）：**

```typescript
constructor() {
    super(tokens)
    
    // ✅ 自动分析和优化
    this.performSelfAnalysis()
    
    // 自动优化包括：
    // 1. 计算 FIRST/FOLLOW 集合
    // 2. 检测左递归
    // 3. 优化 Or 分支顺序
    // 4. 预计算前瞻表
    // 5. 内联小规则（可选）
}
```

**Subhuti（手动）：**

```typescript
// ❌ 程序员负责规则顺序
@SubhutiRule
Statement() {
    this.Or([
        {alt: () => this.BlockStatement()},     // ← 手动排序
        {alt: () => this.ExpressionStatement()} // ← 长规则在前
    ])
}
```

**Chevrotain 优势：**
- ✅ 自动检测和报告错误（左递归、二义性）
- ✅ 自动优化（分支顺序建议）
- ✅ 降低人为错误

**Subhuti 优势：**
- ✅ 简单直接
- ✅ 不需要预处理

---

## 🔍 详细机制对比

### 1. 规则定义语法

#### Chevrotain（DSL 风格 ⭐⭐⭐⭐⭐）

```typescript
class Calculator extends CstParser {
    expression = this.RULE("expression", () => {
        this.SUBRULE(this.additionExpression)
    })
    
    additionExpression = this.RULE("additionExpression", () => {
        this.SUBRULE(this.multiplicationExpression)
        this.MANY(() => {
            this.CONSUME(Plus)
            this.SUBRULE1(this.multiplicationExpression)
        })
    })
}
```

**特点：**
- ✅ 类似 BNF 的 DSL
- ✅ 大写方法名表示语义（RULE, OR, MANY）
- ✅ 序号区分重复调用（SUBRULE1, SUBRULE2）

---

#### Subhuti（装饰器风格 ⭐⭐⭐⭐）

```typescript
class Calculator extends SubhutiParser {
    @SubhutiRule
    Expression() {
        this.AdditionExpression()
    }
    
    @SubhutiRule
    AdditionExpression() {
        this.MultiplicationExpression()
        this.Many(() => {
            this.tokenConsumer.Plus()
            this.MultiplicationExpression()
        })
    }
}
```

**特点：**
- ✅ TypeScript 装饰器
- ✅ 方法名即规则名
- ✅ 更接近传统 OOP

---

### 2. Token 消费

#### Chevrotain（类型安全 ⭐⭐⭐⭐⭐）

```typescript
// ✅ 返回值带类型
const plusToken: IToken = this.CONSUME(Plus)
const number: IToken = this.CONSUME(NumberLiteral)

// ✅ 可选的 label
this.CONSUME(Plus, { LABEL: "operator" })

// ✅ 序号区分重复
this.CONSUME(Number)   // 第1次
this.CONSUME1(Number)  // 第2次
this.CONSUME2(Number)  // 第3次
```

**优势：**
- ✅ 返回 token 对象
- ✅ Label 用于 CST
- ✅ 序号避免冲突

---

#### Subhuti（简单但功能少）

```typescript
// ⚠️ 无返回值
this.tokenConsumer.Plus()
this.tokenConsumer.NumberLiteral()

// ❌ 无 label
// ❌ 无序号区分
// ❌ 不返回 token 对象
```

**改进建议：**

```typescript
// ✅ 返回 token
consume(tokenType: TokenType): SubhutiMatchToken {
    const token = this.getMatchToken()
    // ... 匹配逻辑 ...
    this.consumeMatchToken()
    return token  // ✅ 返回 token
}

// ✅ 使用
const operator = this.tokenConsumer.Plus()  // 返回 token
```

---

### 3. 规则调用

#### Chevrotain（显式 + 序号 ⭐⭐⭐⭐⭐）

```typescript
expression = this.RULE("expression", () => {
    this.SUBRULE(this.term)      // 第1次调用 term
    this.MANY(() => {
        this.CONSUME(Plus)
        this.SUBRULE1(this.term)  // ✅ 第2次调用 term（用序号区分）
    })
})
```

**优势：**
- ✅ 明确的调用关系
- ✅ 序号避免 CST 冲突
- ✅ 自我文档化

---

#### Subhuti（隐式）

```typescript
@SubhutiRule
Expression() {
    this.Term()
    this.Many(() => {
        this.tokenConsumer.Plus()
        this.Term()  // ❌ 同一个规则调用多次，CST 如何区分？
    })
}
```

**问题：**
- ⚠️ 多次调用同一规则，CST 中如何区分？
- ⚠️ 缺少序号机制

---

### 4. CST 访问（Visitor Pattern）

#### Chevrotain（强大 ⭐⭐⭐⭐⭐）

```typescript
// ✅ 自动生成 Visitor 接口
class MyVisitor extends CstParser.getBaseCstVisitorConstructor() {
    constructor() {
        super()
        this.validateVisitor()  // ✅ 验证所有规则都实现了
    }
    
    // ✅ 类型安全的访问方法
    expression(ctx: ExpressionCstChildren) {
        // ctx 是类型化的
        const left = this.visit(ctx.term[0])   // ✅ 数组访问
        const operator = ctx.Plus[0]            // ✅ token 访问
        const right = this.visit(ctx.term[1])
        
        return { type: "BinaryExpression", left, operator, right }
    }
}

// 使用
const cst = parser.expression()
const ast = visitor.visit(cst)
```

**优势：**
- ✅ **类型化的 CST** - 每个规则有对应的接口
- ✅ **自动验证** - 确保所有规则都实现了
- ✅ **数组索引** - 重复的子规则通过数组访问
- ✅ **Label** - 可以为子规则命名

---

#### Subhuti（手动 ⚠️）

```typescript
// ❌ 手动遍历 children
function visitExpression(cst: SubhutiCst) {
    const children = cst.children
    // ⚠️ 需要知道 children 的结构
    const left = visitTerm(children[0])
    const operator = children[1].value
    const right = visitTerm(children[2])
    
    return { type: "BinaryExpression", left, operator, right }
}
```

**问题：**
- ❌ 无类型安全
- ❌ 依赖 children 顺序（脆弱）
- ❌ 无自动验证

**改进建议：**

```typescript
// ✅ 为 CST 添加辅助方法
class SubhutiCst {
    // 按名称查找子节点
    getChild(name: string, index: number = 0): SubhutiCst | undefined {
        return this.children?.filter(c => c.name === name)[index]
    }
    
    // 获取所有同名子节点
    getChildren(name: string): SubhutiCst[] {
        return this.children?.filter(c => c.name === name) || []
    }
    
    // 按类型查找（token vs rule）
    getToken(tokenName: string): SubhutiCst | undefined {
        return this.children?.find(c => c.name === tokenName && c.value)
    }
}

// 使用
const left = cst.getChild("Term", 0)
const right = cst.getChild("Term", 1)
const operator = cst.getToken("Plus")
```

---

### 5. 错误恢复（Error Recovery）

#### Chevrotain（专业 ⭐⭐⭐⭐⭐）

```typescript
// ✅ 多种错误恢复策略
interface IErrorRecoveryStrategy {
    // 单个 token 不匹配
    recoverInline(parser: IParser): IToken
    
    // Or 规则所有分支失败
    recover(parser: IParser, exception: Exception): void
    
    // 同步到下一个安全点
    sync(parser: IParser): void
}

// ✅ 错误记录和报告
class MismatchedTokenException {
    message: string
    token: IToken
    previousToken: IToken
    context: IRuleContext
}

// 使用
try {
    this.CONSUME(Semicolon)
} catch (e) {
    if (e instanceof MismatchedTokenException) {
        this.errorRecovery.recoverInline(this)  // ✅ 智能恢复
    }
}
```

**优势：**
- ✅ 专业的错误恢复策略
- ✅ 详细的错误信息（位置、上下文、期望 vs 实际）
- ✅ 可配置（Bail, Recover, Report）

---

#### Subhuti（基础 ⚠️）

```typescript
consumeToken(tokenName: string) {
    const popToken = this.getMatchToken()
    
    if (!popToken || popToken.tokenName !== tokenName) {
        this.setContinueMatchAndNoBreak(false)
        
        if (this.outerHasAllowError || this.allowError) {
            return  // ⚠️ 简单的允许/不允许
        }
        
        // ❌ 简单的错误信息
        throw new Error('syntax error expect：' + tokenName)
    }
    
    // ...
}
```

**问题：**
- ❌ 错误信息太简单
- ❌ 无智能恢复
- ❌ allowError 机制不够灵活

---

### 6. 性能优化

#### Chevrotain（多层优化 ⭐⭐⭐⭐⭐）

```typescript
// 优化1：自我分析（构造时）
performSelfAnalysis() {
    // 计算 FIRST 集合
    // 计算 FOLLOW 集合
    // 检测左递归
    // 优化分支顺序
}

// 优化2：前瞻表缓存
private lookAheadCache = new Map()

LA(k: number): IToken {
    // ✅ 缓存前瞻结果
    const cacheKey = `${this.currIdx}:${k}`
    if (this.lookAheadCache.has(cacheKey)) {
        return this.lookAheadCache.get(cacheKey)
    }
    // ...
}

// 优化3：规则内联（可选）
// 小规则自动内联，减少函数调用

// 优化4：预测表（Prediction Table）
// 根据前瞻 token 直接选择分支，避免尝试
```

**性能特点：**
- ✅ 接近手写 Parser
- ✅ 极少回溯
- ✅ O(n) 时间保证

---

#### Subhuti（优化后，Packrat ⭐⭐⭐⭐）

```typescript
// 优化：Packrat Parsing
enableMemoization: boolean = true
private memoCache = new Map()

subhutiRule(targetFun, ruleName) {
    const cached = this.getMemoized(ruleName, this.tokenIndex)
    if (cached) {
        return this.applyMemoizedResult(cached)  // ✅ 缓存
    }
    
    const cst = this.processCst(ruleName, targetFun)
    this.storeMemoized(...)
    return cst
}
```

**性能特点：**
- ✅ O(n) 时间保证（Packrat）
- ✅ 避免指数级回溯
- ⚠️ 更多内存占用

---

### 7. 调试和诊断

#### Chevrotain（完善 ⭐⭐⭐⭐⭐）

```typescript
// ✅ 内置调试工具
const serializedGrammar = parser.getSerializedGastProductions()
console.log(serializedGrammar)  // 查看规则结构

// ✅ 错误追踪
parser.errors  // 所有解析错误
parser.isAtEndOfInput()  // 检查是否完全解析

// ✅ 规则追踪
const parsingDSL = {
    maxLookahead: 5,  // 自动计算最优前瞻
    traceInitPerf: true  // 性能追踪
}

// ✅ 可视化工具
// 自动生成铁路图（Railroad Diagram）
```

**优势：**
- ✅ 完整的调试工具
- ✅ 性能分析
- ✅ 可视化

---

#### Subhuti（基础 ⚠️）

```typescript
// ⚠️ 基础调试
get tokensName() {
    return this._tokens.map(item => item.tokenName).join('->')
}

get ruleStackNames() {
    return this.cstStack.map(item => item.name).join('->')
}

// ❌ 无内置性能分析
// ❌ 无规则可视化
// ❌ 无自动检测工具
```

**改进建议：**

```typescript
// ✅ 添加调试辅助
getDebugInfo() {
    return {
        currentRule: this.ruleExecErrorStack[this.ruleExecErrorStack.length - 1],
        ruleStack: [...this.ruleExecErrorStack],
        cstDepth: this.cstStack.length,
        tokenIndex: this.tokenIndex,
        currentToken: this.getMatchToken(),
        remainingTokens: this._tokens.length - this.tokenIndex,
        // Packrat 统计
        memoStats: this.getMemoStats()
    }
}

// ✅ 规则性能追踪
private rulePerfStats = new Map<string, {count: number, totalTime: number}>()

private trackRulePerformance(ruleName: string, fn: Function) {
    const start = performance.now()
    const result = fn()
    const time = performance.now() - start
    
    // 统计
    const stat = this.rulePerfStats.get(ruleName) || {count: 0, totalTime: 0}
    stat.count++
    stat.totalTime += time
    this.rulePerfStats.set(ruleName, stat)
    
    return result
}
```

---

### 8. 规则组合方式

#### Chevrotain（灵活 ⭐⭐⭐⭐⭐）

```typescript
// ✅ 高阶组合
AT_LEAST_ONE(dsl: () => T): T[]  // 1 次或多次
AT_LEAST_ONE_SEP(separator, dsl): T[]  // 用分隔符分隔的列表

// ✅ 嵌套组合
this.OR([
    {
        ALT: () => {
            this.OPTION(() => {  // Option 嵌套在 Or 中
                this.MANY(() => {  // Many 嵌套在 Option 中
                    this.CONSUME(Token)
                })
            })
        }
    }
])

// ✅ Gate 条件
this.OR([
    {
        GATE: () => this.LA(1).tokenType === LParen,  // ✅ 前瞻条件
        ALT: () => this.SUBRULE(this.parenExpr)
    }
])
```

---

#### Subhuti（基础）

```typescript
// ✅ 基础组合
this.Or([...])
this.Many(...)
this.Option(...)

// ⚠️ 嵌套需要手动处理
this.Or([
    {
        alt: () => {
            this.Option(() => {
                this.Many(() => {
                    this.tokenConsumer.Token()
                })
            })
        }
    }
])

// ❌ 无 Gate
// ❌ 无 AT_LEAST_ONE
// ❌ 无 SEP_BY
```

**改进建议：**

```typescript
// ✅ 添加常用组合
AtLeastOne(fn: Function) {
    fn()  // 至少1次
    this.Many(fn)  // 0次或多次
}

SepBy(separator: TokenType, fn: Function) {
    fn()
    this.Many(() => {
        this.consume(separator)
        fn()
    })
}
```

---

## 🏗️ 架构层面的对比

### 1. 模块化设计

#### Chevrotain（高度模块化 ⭐⭐⭐⭐⭐）

```
chevrotain/
├── lexer/               # 词法分析器
├── parser/
│   ├── cst_parser.ts    # CST Parser
│   ├── embedded_actions_parser.ts  # AST Parser
│   ├── traits/
│   │   ├── recognizer.ts       # 识别逻辑
│   │   ├── error_recovery.ts   # 错误恢复
│   │   ├── content_assist.ts   # 自动补全
│   │   └── lookahead.ts        # 前瞻
│   └── gast/            # Grammar AST（规则的AST表示）
├── visitor/             # Visitor 生成
└── diagrams/            # 铁路图生成
```

**特点：**
- ✅ 关注点分离
- ✅ 可插拔的 Traits
- ✅ 每个模块独立可测试

---

#### Subhuti（单文件 ⚠️）

```
subhuti/
└── src/
    └── parser/
        └── SubhutiParser.ts  # ⚠️ 所有逻辑在一个文件（1000+行）
```

**问题：**
- ⚠️ 单一职责原则违反
- ⚠️ 难以维护和扩展
- ⚠️ 测试困难

**改进建议：**

```
subhuti/
└── src/
    └── parser/
        ├── SubhutiParser.ts        # 核心协调器（< 200 行）
        ├── traits/
        │   ├── RuleExecution.ts    # 规则执行逻辑
        │   ├── CstBuilder.ts       # CST 构建
        │   ├── Backtracking.ts     # 回溯机制
        │   ├── Memoization.ts      # Packrat Parsing
        │   └── ErrorRecovery.ts    # 错误恢复
        └── utils/
            ├── CstUtils.ts         # CST 辅助方法
            └── DebugUtils.ts       # 调试工具
```

---

### 2. 配置系统

#### Chevrotain（灵活 ⭐⭐⭐⭐⭐）

```typescript
const parser = new MyParser([], {
    // 错误恢复
    recoveryEnabled: true,
    nodeLocationTracking: "full",
    
    // 性能
    maxLookahead: 3,
    dynamicTokensEnabled: false,
    
    // 诊断
    traceInitPerf: true,
    skipValidations: false
})
```

---

#### Subhuti（无配置 ⚠️）

```typescript
const parser = new MyParser(tokens)
// ❌ 无配置选项
// ❌ 无法自定义行为
```

**改进建议：**

```typescript
interface SubhutiParserOptions {
    // Packrat Parsing
    enableMemoization?: boolean
    memoMaxSize?: number  // 缓存大小限制
    
    // 错误处理
    recoveryEnabled?: boolean
    errorStrategy?: IErrorRecoveryStrategy
    
    // 调试
    tracePerformance?: boolean
    validateGrammar?: boolean
    
    // CST 构建
    locationTracking?: 'none' | 'onlyStart' | 'full'
    pruneEmptyNodes?: boolean
}

const parser = new MyParser(tokens, {
    enableMemoization: true,
    tracePerformance: true
})
```

---

## 🎯 完整优化建议（按优先级）

### P0 - 关键问题（必须修复）⭐⭐⭐⭐⭐

#### 1. 统一"成功才添加"模式

**问题：** 推测性添加 + 事后清理

**方案：**
- 提取 `addCstToParent(cst)` 方法
- 改为成功时才调用
- 删除失败时的 pop

**收益：** 逻辑清晰，Packrat Parsing 自然集成

---

#### 2. 简化回溯数据

**问题：** 依赖 children 数组长度

**方案：**
```typescript
class SubhutiBackData {
    tokenIndex: number       // token 位置
    cstStackLength: number   // ✅ 栈深度（替代 children 长度）
}
```

**收益：** 更简单、更可靠

---

### P1 - 重要改进（建议执行）⭐⭐⭐⭐

#### 3. 简化状态管理

**问题：** curCst 和 cstStack 冗余

**方案：**
- 移除 curCst 字段
- 改为 getter
- 添加 parentCst getter

---

#### 4. Token 消费返回值

**问题：** consumeToken 无返回值

**方案：**
```typescript
consume(tokenType): SubhutiMatchToken {
    // ... 匹配逻辑 ...
    return token  // ✅ 返回 token
}
```

**收益：** 可以访问 token 对象（value, location）

---

#### 5. CST 辅助方法

**问题：** 手动遍历 children 困难

**方案：**
```typescript
class SubhutiCst {
    getChild(name: string, index?: number): SubhutiCst | undefined
    getChildren(name: string): SubhutiCst[]
    getToken(tokenName: string): SubhutiCst | undefined
}
```

**收益：** CST → AST 转换更简单

---

### P2 - 质量提升（后续考虑）⭐⭐⭐

#### 6. 错误处理策略化

参考 Chevrotain，实现可插拔的错误恢复策略。

#### 7. 配置系统

添加 `SubhutiParserOptions`，支持配置化。

#### 8. 规则性能追踪

内置性能分析工具。

---

### P3 - 高级特性（可选）⭐⭐

#### 9. 规则组合扩展

添加 `AtLeastOne`, `SepBy` 等常用组合。

#### 10. 类型安全

类型化的 CST 节点。

#### 11. 自动分析

检测左递归、二义性等。

---

## 📊 优先级总结

| 改进项 | 优先级 | 耗时 | 风险 | 收益 |
|-------|-------|------|------|------|
| **1. 成功才添加** | P0 | 2小时 | 中 | 极高 ⭐⭐⭐⭐⭐ |
| **2. 简化回溯** | P0 | 1小时 | 低 | 高 ⭐⭐⭐⭐ |
| **3. 简化状态** | P1 | 1小时 | 低 | 高 ⭐⭐⭐⭐ |
| **4. Token 返回值** | P1 | 0.5小时 | 低 | 中 ⭐⭐⭐ |
| **5. CST 辅助** | P1 | 1小时 | 低 | 高 ⭐⭐⭐⭐ |
| **6. 错误策略** | P2 | 2小时 | 中 | 中 ⭐⭐⭐ |
| **7. 配置系统** | P2 | 1小时 | 低 | 中 ⭐⭐⭐ |
| **8. 性能追踪** | P2 | 1小时 | 低 | 中 ⭐⭐⭐ |
| **9. 规则组合** | P3 | 2小时 | 低 | 低 ⭐⭐ |
| **10. 类型安全** | P3 | 3小时 | 低 | 中 ⭐⭐⭐ |
| **11. 自动分析** | P3 | 4小时 | 高 | 中 ⭐⭐⭐ |

---

## 🎯 立即执行建议

### 阶段1：核心优化（P0，3小时）⭐⭐⭐⭐⭐

**包含：**
1. 提取 `addCstToParent` 方法
2. 改为"成功才添加"
3. 优化回溯数据结构

**预期：**
- ✅ 符合业界标准（Chevrotain, ANTLR, PEG.js）
- ✅ Packrat Parsing 自然集成
- ✅ 降低维护成本

---

### 阶段2：重要改进（P1，3小时）⭐⭐⭐⭐

**包含：**
1. 简化状态管理（curCst → getter）
2. Token 消费返回值
3. CST 辅助方法

**预期：**
- ✅ 代码更简洁
- ✅ API 更好用
- ✅ CST 转换更容易

---

## ❓ 请确认

我已经完成了全面的设计分析，对比了 **Chevrotain, ANTLR, PEG.js, Pest** 四个主流框架。

分析覆盖了 **8 个核心机制** 和 **11 个优化方向**。

**您希望我：**

- **选项A：** 执行 P0 核心优化（3小时，高收益）⭐ **强烈推荐**
- **选项B：** 执行 P0 + P1（6小时，全面提升）
- **选项C：** 只执行阶段1（提取公共方法，30分钟，最安全）
- **选项D：** 需要更多某个方面的详细对比

**您的决定是？**

