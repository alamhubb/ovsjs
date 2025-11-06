# PEG Parser 语法验证 - Or规则冲突检测

## 行业术语

| 本文档用语 | PEG 理论术语 | 说明 |
|-----------|-------------|------|
| Or规则冲突检测 | **Ordered Choice Masking Detection** | 学术界标准术语 |
| 不可达分支 | **Unreachable Alternatives** | 被前面分支截胡的规则 |
| 空路径瘫痪 | **ε-Path Masking** | Option/Many 导致后续全部不可达 |
| 前缀冲突 | **Prefix Conflict** | 短路径截胡长路径 |

**API 命名：**
- `parser.validateGrammar()` - 推荐（最直观）
- `parser.performSelfAnalysis()` - Chevrotain 风格
- `parser.checkConflicts()` - 明确功能

---

## 问题描述

在PEG Parser中，`Or([A, B, C])` 是**有序选择**：
- 从左到右依次尝试
- 第一个成功就返回，不再尝试后续分支
- **问题：** 如果 A 的某条路径是 B 的某条路径的前缀，B 将被截胡永远不可达

## 设计原则

**唯一原则：**
> **只要格式合理都必须可达，除非被贪婪匹配截胡**

**推论：**
- 任何"输入完全符合 B，但 B 不可达"的情况都是错误
- 长规则应该在短规则前面
- 更具体的规则应该在更通用的规则前面

---

## 核心概念

### 1. 规则路径（Rule Paths）

**定义：** 一个规则从开始到成功匹配所消耗的 token 序列

由于 Option/Or 的存在，一个规则可能有**多条路径**

**示例：**
```typescript
// 单一路径
consume('a'), consume('b'), consume('c')
→ paths = [[a, b, c]]

// 多路径（Option）
consume('a'), Option(consume('b')), consume('c')
→ paths = [
  [a, c],      // 跳过 b
  [a, b, c]    // 包含 b
]

// 多路径（Or）
consume('a'), Or([consume('b'), consume('x')]), consume('c')
→ paths = [
  [a, b, c],   // 选择 b
  [a, x, c]    // 选择 x
]
```

### 2. 前缀关系（Prefix）

**定义：** 路径 P 是路径 S 的前缀，当且仅当：
- `P.length < S.length`
- `S` 的前 `P.length` 个元素与 `P` 完全相同

**示例：**
```typescript
[a, c] 是 [a, c, d, e] 的前缀 ✅
[a, b, c] 是 [a, b, c, d] 的前缀 ✅
[a, b] 不是 [a, c, d] 的前缀 ❌（第二个元素不同）
[a, c, d] 不是 [a, c] 的前缀 ❌（长度相反）
```

### 3. 路径冲突（Path Conflict）

**定义：** 在 `Or([A, B])` 中，如果 A 的任何一条路径是 B 的任何一条路径的前缀，则存在路径冲突

**含义：**
- 存在某种输入，完全符合 B 的格式
- 但 A 会先匹配该输入的前缀部分并成功返回
- 导致 B 永远不会被尝试

---

## 冲突检测规则（2个级别）

### Level 1: 致命错误 - 空路径

**条件：**
```typescript
规则 A 的路径集合中包含空路径 []
```

**含义：**
- A 可以不消耗任何 token 就成功
- Or 规则中 A 后面的所有分支都不可达

**示例：**
```typescript
Or([
  { alt: () => this.Option(() => this.Identifier()) },  // paths = [[]]
  { alt: () => this.Identifier() }                      // 永远不可达
])

// Option 可以匹配 0 次，路径为空
// 无论输入是什么，Option 总是成功（即使消耗 0 个 token）
// 后续所有分支永远不会被尝试
```

**严重程度：** FATAL

**修复建议：**
- 不要在 Or 的第一个分支使用 Option/Many
- 或者将可选逻辑移到规则内部

---

### Level 2: 严重错误 - 路径前缀冲突

**条件：**
```typescript
存在 pathA ∈ paths(A) 和 pathB ∈ paths(B)
使得 pathA 是 pathB 的前缀
```

**含义：**
- 存在某种输入完全符合 B
- 但 A 会先匹配该输入的前缀并成功
- 导致 B 无法匹配完整输入

**严重程度：** ERROR

---

## 实际案例

### 案例1：Option 导致的冲突

```typescript
// 规则 A: a, Option(b), c
paths(A) = [[a, c], [a, b, c]]

// 规则 B: a, b, c, d
paths(B) = [[a, b, c, d]]

// ❌ 错误顺序
Or([
  { alt: () => this.A() },
  { alt: () => this.B() }
])

// 冲突分析：
// [a, c] 是 [a, b, c, d] 的前缀？ → ❌ 不是（第二个元素不同）
// [a, b, c] 是 [a, b, c, d] 的前缀？ → ✅ 是！

// 输入 "a b c d"：
// A 尝试: a ✅, b ✅（Option成功）, c ✅ → A 成功（消耗 [a, b, c]）
// Or 返回，剩余 [d]
// B 永远不会尝试 ❌

// ✅ 正确顺序
Or([
  { alt: () => this.B() },  // 先尝试长规则
  { alt: () => this.A() }   // 兜底
])

// 输入 "a b c d"：
// B 尝试: a ✅, b ✅, c ✅, d ✅ → B 成功 ✅

// 输入 "a c"：
// B 尝试: a ✅, 期望 b 但得到 c ❌ → B 失败
// 回溯，A 尝试: a ✅, 跳过 b（Option）, c ✅ → A 成功 ✅
```

### 案例2：Or 导致的多路径冲突

```typescript
// 规则 A: a, Or([c, x]), y
paths(A) = [[a, c, y], [a, x, y]]

// 规则 B: a, c, y, z
paths(B) = [[a, c, y, z]]

// ❌ 错误顺序
Or([
  { alt: () => this.A() },
  { alt: () => this.B() }
])

// 冲突分析：
// [a, c, y] ∈ paths(A)
// [a, c, y, z] ∈ paths(B)
// [a, c, y] 是 [a, c, y, z] 的前缀 ✅

// 输入 "a c y z"：
// A 尝试: a ✅, c ✅（Or选择c）, y ✅ → A 成功
// B 永远不会尝试 ❌

// ✅ 正确顺序
Or([
  { alt: () => this.B() },
  { alt: () => this.A() }
])
```

### 案例3：Identifier vs MemberExpression

```typescript
// Identifier: id
paths(Identifier) = [[Identifier]]

// MemberExpression: id, Dot, id
paths(MemberExpression) = [[Identifier, Dot, Identifier]]

// ❌ 错误顺序
Or([
  { alt: () => this.Identifier() },
  { alt: () => this.MemberExpression() }
])

// 冲突分析：
// [Identifier] 是 [Identifier, Dot, Identifier] 的前缀 ✅

// 输入 "obj.prop"：
// Identifier 尝试: Identifier ✅ → 成功（消耗 "obj"）
// MemberExpression 永远不会尝试 ❌

// ✅ 正确顺序
Or([
  { alt: () => this.MemberExpression() },
  { alt: () => this.Identifier() }
])
```

### 案例4：不冲突的情况（重要）

```typescript
// 规则 A: a, c
paths(A) = [[a, c]]

// 规则 B: a, x, y
paths(B) = [[a, x, y]]

Or([
  { alt: () => this.A() },
  { alt: () => this.B() }
])

// 检测：
// [a, c] 是 [a, x, y] 的前缀？ → ❌ 不是（第二个元素不同）

// 输入 "a x y"：
// A 尝试: a ✅, 期望 c 但得到 x ❌ → A 失败
// 回溯，B 尝试: a ✅, x ✅, y ✅ → B 成功 ✅

// ✅ 不冲突，两个规则都可达
```

---

## 路径计算规则

### 基础规则

```typescript
// 1. consume(token)
paths = [[token]]

// 2. Subrule(RuleName)
paths = paths(RuleName)  // 递归获取

// 3. 序列: A, B, C
paths = cartesianProduct(paths(A), paths(B), paths(C))

// 4. Or([A, B, C])
paths = paths(A) ∪ paths(B) ∪ paths(C)  // 合并所有分支

// 5. Option(A)
paths = [[]] ∪ paths(A)  // 空路径 + A 的所有路径
```

### 笛卡尔积计算

```typescript
// 示例：序列 [A, B, C]
paths(A) = [[a]]
paths(B) = [[b1], [b2]]
paths(C) = [[c]]

// 计算过程：
// Step 1: [[a]] × [[b1], [b2]] = [[a, b1], [a, b2]]
// Step 2: [[a, b1], [a, b2]] × [[c]] = [[a, b1, c], [a, b2, c]]

// 结果：
paths(序列[A, B, C]) = [[a, b1, c], [a, b2, c]]
```

### 完整示例

```typescript
// 规则: consume('a'), Option(consume('b')), consume('c')

// Step 1: consume('a')
paths1 = [[a]]

// Step 2: Option(consume('b'))
paths2 = [[], [b]]

// Step 3: consume('c')
paths3 = [[c]]

// Step 4: 笛卡尔积
// [[a]] × [[], [b]] = [[a], [a, b]]
// [[a], [a, b]] × [[c]] = [[a, c], [a, b, c]]

// 最终结果：
paths = [[a, c], [a, b, c]]
```

---

---

## 实现方案（最终选择）

### 核心技术选型

**方案：路径枚举 + 扁平化字符串**

**优势：**
- ✅ 精确检测（无误报）- 准确率 >95%
- ✅ 实现简单 - 字符串直接比较，无需复杂对象
- ✅ 性能优秀 - 原生 `startsWith()` 是 C++ 实现
- ✅ 易于调试 - 路径一目了然

**数据结构：**
```typescript
// 路径 = 扁平化字符串（末尾加逗号）
type Path = string  // 'Identifier,Dot,Identifier,'

// 前缀检测（一行搞定）
function isPrefix(pathA: string, pathB: string): boolean {
  return pathA.length < pathB.length && pathB.startsWith(pathA)
}

// 示例
const pathA = 'Identifier,Dot,Identifier,'
const pathB = 'Identifier,Dot,Identifier,Dot,Identifier,'
pathB.startsWith(pathA)  // true → 冲突！
```

**路径计算规则：**
```typescript
// 1. consume(token) → 'token,'
// 2. Sequence → 拼接字符串
// 3. Or → 合并所有分支路径
// 4. Option → ['', ...paths]  (空字符串 = 空路径)
// 5. Subrule → 递归获取

// 笛卡尔积（字符串拼接）
function cartesianProduct(arrays: string[][]): string[] {
  return arrays.reduce((acc, curr) => 
    acc.flatMap(a => curr.map(c => a + c))
  , [''])
}
```

**性能优化：**
```typescript
const MAX_PATHS_PER_RULE = 100    // 单规则路径上限
const MAX_PATH_LENGTH = 50        // 单路径长度上限
const MAX_RECURSION_DEPTH = 10    // 递归深度限制
```

---

## 实现架构

### 文件结构

```
subhuti/src/
├── SubhutiParser.ts                    # 现有（添加 validateGrammar() API）
├── validation/
│   ├── SubhutiRuleCollector.ts         # 规则 AST 收集（Proxy 拦截）
│   ├── SubhutiGrammarAnalyzer.ts       # 路径计算（扁平化字符串）
│   ├── SubhutiConflictDetector.ts      # 冲突检测（前缀判断）
│   └── SubhutiValidationError.ts       # 错误类型定义
```

### 核心类设计

**1. SubhutiRuleCollector（规则收集器）**
```typescript
export class SubhutiRuleCollector {
  private ruleASTs = new Map<string, RuleNode>()
  
  // 通过 Proxy 拦截 Parser 方法调用，构建 AST
  collectRules(parser: SubhutiParser): Map<string, RuleNode> {
    // 为 parser 创建代理，拦截 consume/Or/Option 等方法
    // 记录调用结构但不真正执行解析
    return this.ruleASTs
  }
}
```

**2. SubhutiGrammarAnalyzer（语法分析器）**
```typescript
export class SubhutiGrammarAnalyzer {
  private pathCache = new Map<string, string[]>()
  
  // 计算规则的所有可能路径（扁平化字符串）
  computePaths(ruleName: string, maxPaths = 100): string[] {
    // 缓存检查
    // 递归计算：consume → 'token,', sequence → 拼接, or → 合并
    // 限制路径数量
  }
  
  private _cartesianProduct(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => 
      acc.flatMap(a => curr.map(c => a + c))
    , [''])
  }
}
```

**3. SubhutiConflictDetector（冲突检测器）**
```typescript
export class SubhutiConflictDetector {
  detectAllConflicts(): ValidationError[] {
    // 遍历所有 Or 规则
    // Level 1: 检测空路径 ''
    // Level 2: 检测前缀冲突（pathB.startsWith(pathA)）
  }
  
  private _isPrefix(a: string, b: string): boolean {
    return a.length < b.length && b.startsWith(a)
  }
}
```

**4. SubhutiParser（添加 API）**
```typescript
export default class SubhutiParser {
  // ... 现有代码 ...
  
  validateGrammar(options?: ValidateOptions): ValidationResult {
    // 1. 收集规则 AST
    const collector = new SubhutiRuleCollector()
    const ruleASTs = collector.collectRules(this)
    
    // 2. 创建分析器
    const analyzer = new SubhutiGrammarAnalyzer(ruleASTs)
    
    // 3. 检测冲突
    const detector = new SubhutiConflictDetector(analyzer)
    const errors = detector.detectAllConflicts()
    
    // 4. 返回结果（严格模式抛出错误）
    return { success: errors.length === 0, errors }
  }
  
  // Chevrotain 风格别名
  performSelfAnalysis = this.validateGrammar
}
```

---

## 技术难点与解决方案

### 难点 1：如何拦截规则执行并构建 AST？

**解决方案：分析模式 + Proxy 拦截**

```typescript
// Parser 添加模式标志
private _mode: 'parse' | 'analyze' = 'parse'

// Proxy 拦截方法调用
const proxy = new Proxy(parser, {
  get(target, prop) {
    if (prop === 'consume') {
      return (tokenName: string) => {
        if (target._mode === 'analyze') {
          // 记录 AST 节点，不真正执行
          currentRuleAST.addNode({ type: 'consume', tokenName })
        } else {
          // 正常执行
          return target.consume(tokenName)
        }
      }
    }
    // ... 拦截 Or/Option/Many 等
  }
})
```

### 难点 2：递归规则导致无限路径

**解决方案：循环检测 + 深度限制**

```typescript
private _computePathsRecursive(
  node: RuleNode,
  visited: Set<string> = new Set()  // 循环检测
): string[] {
  if (node.type === 'subrule') {
    if (visited.has(node.ruleName)) {
      // 检测到递归！返回特殊标记
      return ['<RECURSIVE>']
    }
    visited.add(node.ruleName)
  }
  // ... 正常计算
}
```

### 难点 3：路径爆炸

**解决方案：多层限制**

```typescript
// 限制 1：单规则路径数量
if (paths.length > MAX_PATHS_PER_RULE) {
  console.warn(`规则 ${ruleName} 路径过多，已截断`)
  return paths.slice(0, MAX_PATHS_PER_RULE)
}

// 限制 2：路径长度
if (path.split(',').length > MAX_PATH_LENGTH) {
  continue  // 跳过过长路径
}

// 限制 3：递归深度
if (depth > MAX_RECURSION_DEPTH) {
  return ['<TOO_DEEP>']
}
```

---

## TODO List

### 阶段 1：核心功能（1-2周）

- [ ] **SubhutiRuleCollector.ts**（规则 AST 收集）
  - [ ] 创建 RuleNode 类型定义
  - [ ] 实现 Proxy 拦截机制（拦截 consume/Or/Option/Many）
  - [ ] 添加分析模式切换（parse/analyze）
  - [ ] 构建规则 AST 并存储到 Map
  - [ ] 处理 @SubhutiRule 装饰器的规则遍历

- [ ] **SubhutiGrammarAnalyzer.ts**（路径计算）
  - [ ] 实现 computePaths() - 递归计算路径
  - [ ] 实现 consume → 'token,' 转换
  - [ ] 实现 sequence → 字符串笛卡尔积拼接
  - [ ] 实现 or → 路径合并
  - [ ] 实现 option → ['', ...paths]
  - [ ] 实现 subrule → 递归查询（带循环检测）
  - [ ] 添加路径缓存（Map<ruleName, paths>）
  - [ ] 添加路径数量限制（MAX_PATHS_PER_RULE = 100）

- [ ] **SubhutiConflictDetector.ts**（冲突检测）
  - [ ] 实现 detectAllConflicts() - 遍历所有 Or 规则
  - [ ] 实现 Level 1 检测：空路径 ''
  - [ ] 实现 Level 2 检测：前缀冲突（startsWith）
  - [ ] 实现 _isPrefix(a, b) 方法
  - [ ] 生成 ValidationError 对象（带详细信息）

- [ ] **SubhutiValidationError.ts**（错误类型）
  - [ ] 定义 ValidationError 接口
  - [ ] 定义 ValidationResult 接口
  - [ ] 定义 ValidateOptions 接口
  - [ ] 创建 SubhutiGrammarValidationError 异常类

- [ ] **SubhutiParser.ts**（集成 API）
  - [ ] 添加 validateGrammar(options) 方法
  - [ ] 添加 performSelfAnalysis() 别名
  - [ ] 集成 Collector → Analyzer → Detector 流程
  - [ ] 实现 strict 模式（抛出错误）
  - [ ] 添加开发模式自动检查（可选）

### 阶段 2：用户体验优化（3-5天）

- [ ] **错误信息美化**
  - [ ] 格式化冲突路径显示
  - [ ] 添加修复建议（长规则放前面）
  - [ ] 添加示例输入说明（"输入 xxx 时会..."）
  - [ ] 支持彩色输出（终端环境）

- [ ] **Suppress 机制**
  - [ ] Or 分支添加 suppressConflict 选项
  - [ ] 添加 reason 说明字段
  - [ ] 跳过被 suppress 的冲突检测

- [ ] **配置选项**
  - [ ] maxPaths 配置（路径数量上限）
  - [ ] ignoreRules 配置（忽略特定规则）
  - [ ] verbose 配置（详细输出模式）

### 阶段 3：测试与文档（2-3天）

- [ ] **单元测试**
  - [ ] 测试 consume 路径计算
  - [ ] 测试 sequence 笛卡尔积
  - [ ] 测试 option 空路径
  - [ ] 测试 or 路径合并
  - [ ] 测试递归规则检测
  - [ ] 测试路径数量限制
  - [ ] 测试 Level 1 空路径检测
  - [ ] 测试 Level 2 前缀冲突检测
  - [ ] 测试无冲突情况（不误报）

- [ ] **集成测试**
  - [ ] 使用 Slime Parser 进行真实场景测试
  - [ ] 验证性能（<1秒 for 中等文法）
  - [ ] 验证误报率（<5%）

- [ ] **文档更新**
  - [ ] README 添加 validateGrammar() 使用说明
  - [ ] 添加错误信息示例
  - [ ] 添加 Suppress 机制示例
  - [ ] 更新 API 文档

### 阶段 4：优化与扩展（后续）

- [ ] **性能优化**
  - [ ] 路径计算并行化（Web Worker）
  - [ ] AST 序列化和缓存
  - [ ] 增量分析（只分析变更的规则）

- [ ] **功能扩展**
  - [ ] 支持 Many/AtLeastOne（近似检测）
  - [ ] 支持自定义冲突规则
  - [ ] 生成可视化报告（HTML/Markdown）

---

## 使用示例

```typescript
// 1. 定义 Parser
@Subhuti
class MyParser extends SubhutiParser {
  @SubhutiRule
  Expression() {
    this.Or([
      { alt: () => this.Identifier() },           // ❌ 错误顺序
      { alt: () => this.MemberExpression() }
    ])
  }
  
  @SubhutiRule
  MemberExpression() {
    this.consume('Identifier')
    this.consume('Dot')
    this.consume('Identifier')
  }
  
  @SubhutiRule
  Identifier() {
    this.consume('Identifier')
  }
}

// 2. 验证语法（开发阶段）
const parser = new MyParser()
const result = parser.validateGrammar()

if (!result.success) {
  console.error(result.errors)
  // [
  //   {
  //     level: 'ERROR',
  //     type: 'prefix-conflict',
  //     ruleName: 'Expression',
  //     branchIndices: [0, 1],
  //     conflictPaths: {
  //       pathA: 'Identifier,',
  //       pathB: 'Identifier,Dot,Identifier,'
  //     },
  //     message: '分支 1 (MemberExpression) 被分支 0 (Identifier) 遮蔽',
  //     suggestion: '将 MemberExpression 移到 Identifier 前面'
  //   }
  // ]
}

// 3. 自动检查（开发模式）
if (process.env.NODE_ENV === 'development') {
  parser.validateGrammar({ strict: true })  // 发现冲突就抛错
}
```

---

## 成功标准

**功能要求：**
1. ✅ 检测 Level 1（空路径）- 100% 覆盖
2. ✅ 检测 Level 2（路径前缀冲突）- >95% 准确率
3. ✅ 不会误报（路径不同时不报错）- 误报率 <5%
4. ✅ 错误提示清晰、可操作
5. ✅ 支持 suppress 机制

**性能要求：**
- 小文法（<50 规则）：<50ms
- 中等文法（100-200 规则）：<500ms
- 大文法（>500 规则）：<2s

**兼容性：**
- 不影响正常解析性能
- API 向后兼容

---

**最后更新：** 2025-11-06  
**实现方案：** 路径枚举 + 扁平化字符串  
**预计工期：** 2-3 周  
**适用项目：** Subhuti Parser Framework
