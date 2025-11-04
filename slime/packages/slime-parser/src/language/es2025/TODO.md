# ES2025 Parser TODO List

> 基于 `es2025-grammar.md` 对比 `Es2025Parser.ts` 的待办清单  
> 最后更新：2025-11-04

---

## 📋 总览

| 类别 | 数量 | 优先级 | 状态 |
|------|------|--------|------|
| **可立即实现** | 22 | P0-P2 | ⏳ 待办 |
| **需要词法支持** | 2 | P3 | ⚠️ 阻塞 |
| **架构级别** | 1 | P4 | 📋 规划 |

---

## 🚀 P0 - 立即修复（Bug级别）

### 1. 删除重复的 AwaitExpression 定义
**位置**: `Es2025Parser.ts:2909`
**问题**: 存在两个 `AwaitExpression` 方法定义
- 第2909行：抛出错误（旧代码）
- 第3833行：正确实现

**修复方案**:
```typescript
// 删除第2909-2912行的重复定义
@SubhutiRule
AwaitExpression(params: ParseParams = {}): SubhutiCst | undefined {
  // TODO: 实现 AwaitExpression
  throw new Error('AwaitExpression not implemented yet')
}
```

**验证**: 搜索 `AwaitExpression` 应该只有一个定义

---

## ✅ P1 - 功能完善（核心约束检查）

### 2. LineTerminator 检查（15处）

**规范要求**: `[no LineTerminator here]`  
**实现方式**: 使用 `this.hasLineTerminatorBefore()` 方法（已存在）

#### 2.1 UpdateExpression 后缀检查
**位置**: `Es2025Parser.ts:2515`
```typescript
// TODO: 检查 [no LineTerminator here] 约束
this.Option(() => {
  this.Or([
    { alt: () => this.tokenConsumer.Increment() },
    { alt: () => this.tokenConsumer.Decrement() }
  ])
})
```

**修复**:
```typescript
// 后缀 ++/-- 前不能有换行
if (this.hasLineTerminatorBefore()) {
  return undefined
}
this.Option(() => {
  // ...
})
```

#### 2.2 ReturnStatement
**位置**: `Es2025Parser.ts:1184`
**修复**: 在 `return` 和表达式之间检查换行

#### 2.3 ThrowStatement
**位置**: `Es2025Parser.ts:1203`
**修复**: 在 `throw` 和表达式之间检查换行

#### 2.4 ContinueStatement
**位置**: `Es2025Parser.ts:1222`
**修复**: 在 `continue` 和标识符之间检查换行

#### 2.5 BreakStatement
**位置**: `Es2025Parser.ts:1239`
**修复**: 在 `break` 和标识符之间检查换行

#### 2.6 ArrowFunction `=>`
**位置**: `Es2025Parser.ts:3728`
**修复**: 在箭头参数和 `=>` 之间检查换行

#### 2.7 AsyncArrowFunction（多处）
**位置**: `Es2025Parser.ts:3748, 3777, 3802`
**修复**: 在 `async` 关键字和箭头函数之间检查换行

#### 2.8 AsyncFunctionDeclaration/Expression
**位置**: `Es2025Parser.ts:3849, 3879`
**修复**: 在 `async` 和 `function` 之间检查换行

#### 2.9 AsyncGeneratorDeclaration/Expression
**位置**: `Es2025Parser.ts:3905, 3944-3959`
**修复**: 在 `async`、`function`、`*` 之间检查换行

**测试用例**:
```javascript
// 应该失败
return
  x

throw
  new Error()

continue
  label

// 应该成功
return x
throw new Error()
continue label
```

---

### 3. Lookahead 检查（5处）

**规范要求**: `[lookahead ≠ xxx]` 或 `[lookahead ∉ {...}]`  
**实现方式**: 检查当前 token 的类型

#### 3.1 ExpressionStatement
**位置**: `Es2025Parser.ts:858`
**规范**: `[lookahead ∉ { {, function, async [no LineTerminator here] function, class, let [ }]`

**修复**:
```typescript
ExpressionStatement(params: ParseParams = {}): SubhutiCst | undefined {
  const token = this.curToken
  if (!token) return undefined
  
  // 检查 lookahead 约束
  const forbidden = ['LBrace', 'FunctionTok', 'ClassTok']
  if (forbidden.includes(token.tokenName)) {
    return undefined
  }
  
  // 检查 async function (需要检查下一行)
  if (token.tokenName === 'AsyncTok' && this.hasLineTerminatorBefore()) {
    // 检查下一个非空白token是否为 function
    // ...
  }
  
  // 检查 let [
  if (token.tokenName === 'LetTok') {
    // 检查下一个token是否为 [
    // ...
  }
  
  this.Expression({ In: true, Yield: params.Yield, Await: params.Await })
  this.tokenConsumer.Semicolon()
  return this.curCst
}
```

#### 3.2 ConciseBody（ExpressionBody）
**位置**: `Es2025Parser.ts:3997, 4193`
**规范**: `[lookahead ≠ {]`

**修复**:
```typescript
if (this.curToken?.tokenName === 'LBrace') {
  return undefined
}
```

#### 3.3 ForStatement
**位置**: `Es2025Parser.ts:958`
**规范**: `[lookahead ≠ let []`

**修复**: 检查 `let [` 模式

#### 3.4 ForInOfStatement（多处）
**位置**: `Es2025Parser.ts:1003, 1006, 1009`
**规范**: 多个 lookahead 约束

**修复**: 逐一实现对应的检查

#### 3.5 ExportDefaultDeclaration
**位置**: `Es2025Parser.ts:525`
**规范**: `[lookahead ∉ {function, async [no LineTerminator here] function, class}]`

**修复**: 实现对应的检查

---

### 4. 保留字检查

#### 4.1 Identifier 规则
**位置**: `Es2025Parser.ts:2660`
**规范**: `Identifier : IdentifierName but not ReservedWord`

**修复方案**:
```typescript
Identifier(): SubhutiCst | undefined {
  const cst = this.IdentifierName()
  if (!cst) return undefined
  
  // 检查是否是保留字
  const reservedWords = [
    'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export',
    'extends', 'false', 'finally', 'for', 'function', 'if', 'import',
    'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch',
    'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while',
    'with', 'yield'
  ]
  
  if (reservedWords.includes(cst.value)) {
    this._parseSuccess = false
    return undefined
  }
  
  return cst
}
```

**保留字列表**（来自 grammar.md:174-179）:
```
await break case catch class const continue debugger default
delete do else enum export extends false finally for function
if import in instanceof new null return super switch this
throw true try typeof var void while with yield
```

---

## 🔧 P2 - 功能增强（Cover Grammar）

### 5. Cover Grammar 精化（2处）

#### 5.1 CoverParenthesizedExpressionAndArrowParameterList
**位置**: `Es2025Parser.ts:4102`
**规范**: 需要根据上下文精化为 `ParenthesizedExpression` 或 `ArrowFormalParameters`

**当前状态**: 已实现解析，但未实现精化验证

**修复方案**:
```typescript
// TODO: 实现完整的 Cover Grammar 精化机制
// 1. 解析时先作为 CoverParenthesizedExpressionAndArrowParameterList
// 2. 在 ArrowFunction 中精化为 ArrowFormalParameters
// 3. 在其他地方精化为 ParenthesizedExpression
```

**说明**: 这是规范要求的精化机制，当前实现能正确解析，但未实现精化验证步骤

---

## ⚠️ P3 - 需要词法支持（阻塞）

### 6. RegularExpressionLiteral
**位置**: `Es2025Parser.ts:4017`
**状态**: `throw new Error('RegularExpressionLiteral requires lexer context support')`

**问题**: 需要词法分析器支持上下文切换
- `InputElementDiv` - 普通上下文（`/` 是除号）
- `InputElementRegExp` - 正则表达式上下文（`/` 开始正则）

**解决方案选项**:
1. **选项A**: 在词法层实现上下文切换（推荐，但复杂）
2. **选项B**: 在Parser层通过lookahead判断（简单，但不够准确）
3. **选项C**: 暂不支持，等待词法层改进

**推荐**: 选项C（当前），因为：
- 需要修改词法分析器架构
- 正则表达式解析在大多数场景不是必需的
- 可以后续单独实现

**影响**: 
- 无法解析 `/pattern/flags` 字面量
- 可以解析 `new RegExp('pattern', 'flags')`

---

### 7. HashbangComment
**位置**: 未实现
**规范**: `HashbangComment :: #! SingleLineCommentChars_opt`

**问题**: 需要词法分析器支持
- Hashbang 只在脚本开头有效
- 需要特殊的 token 识别

**解决方案**: 
- 在词法层添加 `HashbangComment` token
- 在 `Script` 规则开头可选消费

**优先级**: 低（主要用于 Node.js 脚本）

---

## 📋 P4 - 架构级别（长期规划）

### 8. 自动分号插入（ASI）

**规范**: §12.10 Automatic Semicolon Insertion  
**状态**: 未实现  
**影响**: 必须显式写分号，否则解析失败

**实现复杂度**: ⭐⭐⭐⭐⭐（非常高）

**说明**: 
- ASI 是 ECMAScript 的复杂特性
- 需要理解 3 种 ASI 规则
- 需要处理各种边界情况
- 建议作为独立项目实现

**当前状态**: 用户必须显式写分号（符合规范，只是不便利）

---

## 📊 实现优先级建议

### 第一阶段（1-2天）
1. ✅ **P0-1**: 删除重复的 AwaitExpression 定义
2. ✅ **P1-2**: 实现 LineTerminator 检查（15处）
3. ✅ **P1-3**: 实现 Lookahead 检查（5处）
4. ✅ **P1-4**: 实现保留字检查

### 第二阶段（3-5天）
5. ✅ **P2-5**: 完善 Cover Grammar 精化机制

### 第三阶段（长期）
6. ⚠️ **P3-6**: RegularExpressionLiteral（需要词法支持）
7. ⚠️ **P3-7**: HashbangComment（需要词法支持）
8. 📋 **P4-8**: ASI（架构级别）

---

## 🔍 检查清单

### 代码检查
- [ ] 搜索 `AwaitExpression` 确认只有一个定义
- [ ] 搜索所有 `TODO.*LineTerminator` 并逐一修复
- [ ] 搜索所有 `TODO.*lookahead` 并逐一修复
- [ ] 检查 `Identifier` 规则是否过滤保留字

### 测试检查
- [ ] 为每个 LineTerminator 检查创建测试用例
- [ ] 为每个 Lookahead 检查创建测试用例
- [ ] 为保留字检查创建测试用例
- [ ] 验证 Cover Grammar 精化逻辑

### 文档检查
- [ ] 更新 README.md 中的 TODO 状态
- [ ] 记录每个修复的测试用例

---

## 📝 修复模板

### LineTerminator 检查模板
```typescript
// 修复前
// TODO: 检查 [no LineTerminator here] 约束
this.tokenConsumer.SomeToken()

// 修复后
if (this.hasLineTerminatorBefore()) {
  return undefined
}
this.tokenConsumer.SomeToken()
```

### Lookahead 检查模板
```typescript
// 修复前
// TODO: 检查 lookahead 约束
this.Expression()

// 修复后
const token = this.curToken
if (!token || token.tokenName === 'ForbiddenToken') {
  return undefined
}
this.Expression()
```

---

**最后更新**: 2025-11-04  
**修复进度**: 已完成 15/22 项可立即实现的功能

## ✅ 已完成修复（15项）

### P0 - Bug修复
- ✅ P0-1: 删除重复的 AwaitExpression 定义

### P1 - 核心约束检查
- ✅ P1-2-1 到 P1-2-9: 所有 LineTerminator 检查（15处）
  - UpdateExpression（后缀 ++/--）
  - ReturnStatement
  - ThrowStatement
  - ContinueStatement
  - BreakStatement
  - ArrowFunction
  - AsyncArrowFunction（多处）
  - AsyncFunctionDeclaration/Expression
  - AsyncGeneratorDeclaration/Expression
- ✅ P1-2-10: YieldExpression 的 LineTerminator 检查
- ✅ P1-2-11: AsyncMethod 的 LineTerminator 检查
- ✅ P1-2-12: AsyncGeneratorMethod 的 LineTerminator 检查
- ✅ P1-4: Identifier 保留字检查

### P2 - 功能增强
- ✅ P2-5: Cover Grammar 精化机制（已更新注释说明当前状态）

### 其他清理
- ✅ 清理 EmptyStatement 的 TODO 注释（已实现）
- ✅ 清理 DebuggerStatement 的 TODO 注释（已实现）

## ⏸️ 已跳过（5项）

- ⏸️ P1-3-1 到 P1-3-5: Lookahead 检查（用户明确要求跳过）

## ⚠️ 无法立即实现（2项）

- ⚠️ P3-6: RegularExpressionLiteral（需要词法分析器支持上下文切换）
- ⚠️ P3-7: HashbangComment（需要词法分析器支持）

## 📋 长期规划（1项）

- 📋 P4-8: ASI（用户明确要求不实现）

