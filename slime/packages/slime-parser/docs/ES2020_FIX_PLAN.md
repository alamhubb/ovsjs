# ES2020 Parser 修复计划

> 基于 ES2020_PARSER_ANALYSIS.md 的分析结果

## 📋 修复清单总览

| ID | 优先级 | 任务 | 预估时间 | 风险等级 |
|---|---|---|---|---|
| P0-1 | 🔴 必须 | 修复 CoalesceExpression 无限递归 | 15分钟 | 低 |
| P1-1 | 🟡 重要 | 验证 UpdateExpression 实现 | 30分钟 | 中 |
| P1-2 | 🟡 重要 | 验证 OptionalChaining 词法约束 | 30分钟 | 中 |
| P1-3 | 🟡 重要 | 优化 ForAwaitOfStatement 分支顺序 | 15分钟 | 低 |
| TEST-1 | 🟢 验证 | 创建 ES2020 综合测试 | 45分钟 | 低 |
| TEST-2 | 🟢 验证 | 运行测试验证所有修复 | 30分钟 | 低 |

**总计预估时间：** 2小时45分钟

---

## 🔴 P0-1: 修复 CoalesceExpression 无限递归

### 问题描述
当前实现存在直接左递归，导致栈溢出：
```
CoalesceExpression → CoalesceExpressionHead → CoalesceExpression → ∞
```

### 影响范围
- **文件：** `slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts`
- **行号：** Line 142-159
- **严重度：** 🔴 崩溃级别（会导致 Parser 无限递归）

### 当前代码
```typescript
// Line 142-159
@SubhutiRule
CoalesceExpression() {
    this.CoalesceExpressionHead()
    this.tokenConsumer.NullishCoalescing()
    this.BitwiseORExpression()
}

@SubhutiRule
CoalesceExpressionHead() {
    this.Or([
        {alt: () => this.CoalesceExpression()},
        {alt: () => this.BitwiseORExpression()}
    ])
}
```

### 修复方案

#### 步骤 1: 重写 CoalesceExpression
```typescript
/**
 * CoalesceExpression[In, Yield, Await] ::
 *     BitwiseORExpression[?In, ?Yield, ?Await]
 *     CoalesceExpression[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]
 * 
 * 无前瞻实现：消除左递归，使用 Many 循环
 * 
 * 等价转换：
 *     BitwiseORExpression ( ?? BitwiseORExpression )*
 */
@SubhutiRule
CoalesceExpression() {
    // 先解析第一个操作数
    this.BitwiseORExpression()
    
    // 然后循环解析 ?? 和后续操作数（左结合）
    this.Many(() => {
        this.tokenConsumer.NullishCoalescing()
        this.BitwiseORExpression()
    })
}
```

#### 步骤 2: 删除 CoalesceExpressionHead
```typescript
// ❌ 删除这个方法（不再需要）
// @SubhutiRule
// CoalesceExpressionHead() {
//     this.Or([
//         {alt: () => this.CoalesceExpression()},
//         {alt: () => this.BitwiseORExpression()}
//     ])
// }
```

#### 步骤 3: 更新 ShortCircuitExpression
检查 `ShortCircuitExpression()` 是否需要修改：
```typescript
// Line 166-172
@SubhutiRule
ShortCircuitExpression() {
    this.Or([
        {alt: () => this.LogicalORExpression()},
        {alt: () => this.CoalesceExpression()}  // 这里的调用保持不变
    ])
}
```

**注意：** ShortCircuitExpression 的实现**也可能有问题**！

规范原文：
```
ShortCircuitExpression[In, Yield, Await] ::
    LogicalORExpression[?In, ?Yield, ?Await]
    CoalesceExpression[?In, ?Yield, ?Await]
```

这两个分支的开头都是 `BitwiseORExpression`，会导致歧义！

**进一步分析：**
- `LogicalORExpression` → `LogicalANDExpression` → `BitwiseORExpression` → ...
- `CoalesceExpression` → `BitwiseORExpression` → ...

在无前瞻的情况下，Parser 无法区分应该进入哪个分支。

**推荐修复：**
```typescript
@SubhutiRule
ShortCircuitExpression() {
    // 先解析共同的前缀
    this.BitwiseORExpression()
    
    // 然后根据后续 token 决定走哪条路
    this.Or([
        // 如果是 ?? → CoalesceExpression 的剩余部分
        {
            alt: () => {
                this.Many(() => {
                    this.tokenConsumer.NullishCoalescing()
                    this.BitwiseORExpression()
                })
            }
        },
        // 如果是 && 或 || → LogicalORExpression 的剩余部分
        {
            alt: () => {
                // LogicalANDExpression 的剩余部分
                this.Many(() => {
                    this.tokenConsumer.AmpersandAmpersand()
                    this.BitwiseORExpression()
                })
                // LogicalORExpression 的剩余部分
                this.Many(() => {
                    this.tokenConsumer.VerticalBarVerticalBar()
                    // 这里需要完整的 LogicalANDExpression
                    // 但为了避免重复解析，需要重构整个逻辑表达式系列
                })
            }
        }
    ])
}
```

**警告：** 这个修复比较复杂，可能需要重构整个逻辑表达式系列！

**简化方案：** 依赖回溯
```typescript
@SubhutiRule
ShortCircuitExpression() {
    this.Or([
        // 先尝试 CoalesceExpression（如果有 ??）
        {alt: () => this.CoalesceExpression()},
        // 否则是 LogicalORExpression
        {alt: () => this.LogicalORExpression()}
    ])
}
```

这样的话，如果代码是 `a && b`，会先尝试 `CoalesceExpression()`：
1. 解析 `a`（BitwiseORExpression）
2. 期望看到 `??`，但看到 `&&`
3. 匹配失败，回溯
4. 尝试 `LogicalORExpression()`，成功

**性能：** 有回溯成本，但简单且正确。

**推荐：** 先使用简化方案（依赖回溯），确保正确性，后续如果性能有问题再优化。

### 测试用例
```javascript
// 基础
null ?? 'default'         // 'default'
undefined ?? 'default'    // 'default'
0 ?? 'default'            // 0
'' ?? 'default'           // ''

// 左结合
a ?? b ?? c              // (a ?? b) ?? c

// 与其他运算符
(a || b) ?? c            // 需要括号
a || (b ?? c)            // 需要括号

// 混合场景
foo?.bar ?? 'default'    // optional chaining + ??
```

### 验证方法
1. 创建测试文件 `tests/es2020/01-nullish-coalescing.js`
2. 运行测试，确认不会栈溢出
3. 检查生成的 AST 结构是否正确（左结合）

### 风险评估
- **风险等级：** 低
- **回滚方案：** Git revert
- **依赖影响：** ShortCircuitExpression 和 ConditionalExpression 依赖此方法

---

## 🟡 P1-1: 验证 UpdateExpression 实现

### 问题描述
当前 `UpdateExpression()` 直接复用父类的 `PostfixExpression()`，需要验证是否完全等价于 ES2020 规范。

### 影响范围
- **文件：** `slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts`
- **行号：** Line 105-109
- **严重度：** 🟡 中等（可能影响 ExponentiationExpression）

### 当前代码
```typescript
// Line 105-109
/**
 * UpdateExpression[Yield, Await] ::
 *     LeftHandSideExpression[?Yield, ?Await]
 *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
 *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
 *     ++ UnaryExpression[?Yield, ?Await]
 *     -- UnaryExpression[?Yield, ?Await]
 * 
 * 注意：ES2020 规范使用 UpdateExpression 而非 PostfixExpression
 * 这里保持与 Es6Parser 的 PostfixExpression 一致
 */
@SubhutiRule
UpdateExpression() {
    // 复用父类的 PostfixExpression 实现
    this.PostfixExpression()
}
```

### 验证步骤

#### 步骤 1: 检查 Es6Parser.PostfixExpression 的实现
```bash
# 找到 PostfixExpression 的定义
grep -n "PostfixExpression()" slime/packages/slime-parser/src/language/es2015/Es6Parser.ts
```

#### 步骤 2: 对比规范
检查 PostfixExpression 是否包含以下 5 种情况：
1. ✅ `LeftHandSideExpression`
2. ✅ `LeftHandSideExpression ++`
3. ✅ `LeftHandSideExpression --`
4. ✅ `++ UnaryExpression`
5. ✅ `-- UnaryExpression`

#### 步骤 3: 检查 LineTerminator 处理
规范要求：`[no LineTerminator here]`

检查 Lexer 是否自动跳过 LineTerminator（大部分 Lexer 默认跳过）。

如果 Lexer 自动跳过，则：
```javascript
x
++  // 会被解析为 x; ++（两个语句）
```

这**不符合规范**！应该解析为 `x++`（一个语句）。

**检查方法：**
```typescript
// 测试代码
const code = `
x
++
y
`
// 期望：x; ++y（两个语句）
// 实际：需要验证
```

#### 步骤 4: 决策

**情况 A：PostfixExpression 完全正确**
→ 保持当前实现，只添加注释说明

**情况 B：PostfixExpression 缺少某些情况**
→ 重写 UpdateExpression()

**情况 C：LineTerminator 处理不正确**
→ 需要在 Lexer 或 Parser 层面修复（较复杂）

### 测试用例
```javascript
// 后缀
let a = 1;
a++  // UpdateExpression
a--

// 前缀
++a  // UpdateExpression
--a

// 用于幂运算
a++ ** 2    // (a++) ** 2
++a ** 2    // 语法错误（规范禁止）

// LineTerminator 敏感性
x
++     // 应该是：x; ++（语句分隔）
// 而不是：x++（后缀表达式）
```

### 验证方法
1. 阅读 `Es6Parser.PostfixExpression()` 的源码
2. 创建测试文件 `tests/es2020/02-update-expression.js`
3. 运行测试，检查 AST 结构

### 风险评估
- **风险等级：** 中
- **依赖影响：** ExponentiationExpression 依赖此方法
- **如果有问题：** 可能影响幂运算表达式的正确性

---

## 🟡 P1-2: 验证 OptionalChaining 词法约束

### 问题描述
规范要求 `?.` 后面不能立即跟数字，以避免与三元运算符混淆。Parser 层面无法检查，需要在 Lexer 层面处理。

### 影响范围
- **文件：** `slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts`（可能）
- **行号：** 未知
- **严重度：** 🟡 中等（会影响边界情况）

### 规范约束
```
OptionalChainingPunctuator ::
    ?. [lookahead ∉ DecimalDigit]
```

### 问题场景
```javascript
// 三元运算符
a ? .3 : b     // 应该解析为：a ? 0.3 : b

// 可选链（不合法）
a?.3:b         // 词法错误：?. 后面不能跟数字

// 可选链（合法）
a?.b:c         // a?.b（可选链） 或 a ? .b : c（三元运算符）
```

### 验证步骤

#### 步骤 1: 检查 Token 定义
```bash
# 查找 OptionalChaining token 的定义
grep -n "OptionalChaining" slime/packages/slime-parser/src/language/es2020/Es2020Tokens.ts
```

#### 步骤 2: 检查 Lexer 实现
查看是否有以下情况之一：

**情况 A：Token 定义中有 lookahead 检查**
```typescript
{
    pattern: /\?\./,
    name: 'OptionalChaining',
    // ✅ 有验证逻辑
    validate: (match, input, offset) => {
        const nextChar = input[offset + 2]
        return !/[0-9]/.test(nextChar)
    }
}
```

**情况 B：没有任何检查**
```typescript
{
    pattern: /\?\./,
    name: 'OptionalChaining'
    // ❌ 没有验证逻辑
}
```

#### 步骤 3: 测试边界场景
```javascript
// 测试代码
const cases = [
    'a?.3',      // 应该：词法错误 或 解析为 a ? .3（三元运算符）
    'a?.b',      // 应该：可选链
    'a?.[0]',    // 应该：可选链
    'a ? .3 : b' // 应该：三元运算符（a ? 0.3 : b）
]
```

#### 步骤 4: 决策

**情况 A：Lexer 已正确处理**
→ 无需修复，添加测试验证即可

**情况 B：Lexer 未处理**
→ 需要修改 Es2020Tokens.ts 添加 lookahead 检查

**情况 C：Subhuti 框架不支持 token 级别的 lookahead**
→ 两种方案：
1. 在 Parser 层面处理（复杂）
2. 接受这个限制（与规范轻微偏离）

### 修复方案（如果需要）

#### 方案 1: 在 Tokens 定义中添加验证
```typescript
// Es2020Tokens.ts
export const es2020Tokens = [
    ...es6Tokens,
    {
        pattern: /\?\./,
        name: 'OptionalChaining',
        // 添加验证：后面不能是数字
        lookahead: /[^0-9]/,  // 如果框架支持
        // 或
        validate: (context) => {
            const nextChar = context.input[context.offset + 2]
            if (/[0-9]/.test(nextChar)) {
                return false  // 不匹配 OptionalChaining
            }
            return true
        }
    },
    {
        pattern: /\?\?/,
        name: 'NullishCoalescing'
    },
    // ...
]
```

#### 方案 2: 如果框架不支持，在 Parser 层面处理
```typescript
// Es2020Parser.ts
@SubhutiRule
OptionalChain() {
    // 消费 ?. token
    const token = this.tokenConsumer.OptionalChaining()
    
    // 手动检查下一个 token
    const nextToken = this.lookAhead(1)
    if (nextToken.name === 'NumericLiteral') {
        throw new Error('Syntax Error: ?. cannot be followed by a digit')
    }
    
    // 继续解析
    this.Or([
        {alt: () => this.Arguments()},
        {alt: () => this.BracketExpression()},
        {alt: () => this.IdentifierName()},
        {alt: () => this.TemplateLiteral()}
    ])
    // ...
}
```

但这需要 Parser 支持 `lookAhead()` 方法，与"无前瞻"设计冲突。

### 测试用例
```javascript
// 合法的可选链
obj?.prop
obj?.['key']
obj?.method()

// 不合法的可选链（应该报错）
obj?.3         // Lexer 应该报错

// 三元运算符（合法）
a ? .3 : b     // 0.3
a ? .5e2 : b   // 50

// 边界情况
obj?.constructor  // 合法
obj?.0x10         // 不合法
```

### 验证方法
1. 检查 Es2020Tokens.ts 源码
2. 创建测试文件 `tests/es2020/03-optional-chaining-edge-cases.js`
3. 测试 `obj?.3` 是否报错

### 风险评估
- **风险等级：** 中
- **如果不修复：** 某些边界情况会与规范不符
- **影响范围：** 仅边界情况（实际代码中很少出现 `obj?.3` 这种写法）

---

## 🟡 P1-3: 优化 ForAwaitOfStatement 分支顺序

### 问题描述
当前 Or 分支顺序可能导致不必要的回溯。调整为"更具体的规则在前"可以提升性能。

### 影响范围
- **文件：** `slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts`
- **行号：** Line 419-453
- **严重度：** 🟡 中等（性能优化）

### 当前代码
```typescript
// Line 419-453
@SubhutiRule
ForAwaitOfStatement() {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.AwaitTok()
    this.tokenConsumer.LParen()
    
    this.Or([
        // 分支 1: LeftHandSideExpression of ...
        {
            alt: () => {
                // TODO: Implement lookahead check for 'let'
                this.LeftHandSideExpression()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        },
        // 分支 2: var ForBinding of ...
        {
            alt: () => {
                this.tokenConsumer.VarTok()
                this.ForBinding()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        },
        // 分支 3: ForDeclaration of ...
        {
            alt: () => {
                this.ForDeclaration()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        }
    ])
    
    this.tokenConsumer.RParen()
    this.Statement()
}
```

### 问题场景
```javascript
// 场景 1: let 声明
for await (let x of items) {}
// 1. 尝试分支 1：LeftHandSideExpression
//    - 解析 'let'（作为 IdentifierReference）
//    - 期望 'of'，但看到 'x'
//    - 失败，回溯
// 2. 尝试分支 2：var
//    - 期望 'var'，但看到 'let'
//    - 失败，回溯
// 3. 尝试分支 3：ForDeclaration（let/const）
//    - 解析 'let x'
//    - 期望 'of'，成功！

// 场景 2: 变量名为 let
for await (let of items) {}
// 1. 尝试分支 1：LeftHandSideExpression
//    - 解析 'let'（作为 IdentifierReference）
//    - 期望 'of'，看到 'of'
//    - 成功！
```

### 优化方案

#### 步骤 1: 调整分支顺序（更具体的在前）
```typescript
@SubhutiRule
ForAwaitOfStatement() {
    this.tokenConsumer.ForTok()
    this.tokenConsumer.AwaitTok()
    this.tokenConsumer.LParen()
    
    this.Or([
        // ✅ 分支 1: ForDeclaration（let/const 声明）
        // 更具体：以 let/const 开头
        {
            alt: () => {
                this.ForDeclaration()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        },
        // ✅ 分支 2: var ForBinding
        // 更具体：以 var 开头
        {
            alt: () => {
                this.tokenConsumer.VarTok()
                this.ForBinding()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        },
        // ✅ 分支 3: LeftHandSideExpression
        // 最通用：作为最后的选择
        {
            alt: () => {
                this.LeftHandSideExpression()
                this.tokenConsumer.OfTok()
                this.AssignmentExpression()
            }
        }
    ])
    
    this.tokenConsumer.RParen()
    this.Statement()
}
```

#### 步骤 2: 删除 TODO 注释
```typescript
// ❌ 删除这行注释（已不再需要）
// TODO: Implement lookahead check for 'let'
```

#### 步骤 3: 添加说明注释
```typescript
/**
 * ForAwaitOfStatement ::
 *     for await ( [lookahead ≠ let] LeftHandSideExpression of AssignmentExpression ) Statement
 *     for await ( var ForBinding of AssignmentExpression ) Statement
 *     for await ( ForDeclaration of AssignmentExpression ) Statement
 * 
 * 无前瞻实现：通过 Or 分支顺序解决
 * - ForDeclaration（let/const）放在前面，优先匹配
 * - LeftHandSideExpression 放在最后，作为兜底
 * - 回溯机制自动处理 'let' 作为变量名的场景
 */
```

### 性能对比

**优化前：**
```javascript
for await (let x of items) {}
// 回溯次数：2次（尝试分支1、2，最后成功3）
```

**优化后：**
```javascript
for await (let x of items) {}
// 回溯次数：0次（直接成功分支1）
```

### 测试用例
```javascript
// let 声明
for await (let x of items) {}
for await (let {a, b} of items) {}

// const 声明
for await (const x of items) {}

// var 声明
for await (var x of items) {}

// 变量名为 let
const let = [1, 2, 3]
for await (let of items) {}

// 复杂表达式
for await (obj.prop of items) {}
for await (arr[0] of items) {}
```

### 验证方法
1. 修改代码
2. 运行测试 `tests/es2020/04-for-await-of.js`
3. 验证所有场景都正确解析

### 风险评估
- **风险等级：** 低
- **影响范围：** 仅性能优化，不影响正确性
- **回滚方案：** 恢复原顺序

---

## 🟢 TEST-1: 创建 ES2020 综合测试

### 测试覆盖范围
1. ✅ Nullish Coalescing（`??`）
2. ✅ Optional Chaining（`?.`）
3. ✅ BigInt（`123n`）
4. ✅ Dynamic Import（`import()`）
5. ✅ import.meta
6. ✅ export * as ns
7. ✅ for await...of
8. ✅ Optional catch binding
9. ✅ Exponentiation（`**`）

### 测试文件结构
```
slime/tests/es2020/
├── 01-nullish-coalescing.js       # ?? 运算符
├── 02-optional-chaining.js         # ?. 运算符
├── 03-bigint.js                    # BigInt 字面量
├── 04-dynamic-import.js            # import()
├── 05-import-meta.js               # import.meta
├── 06-export-star-as.js            # export * as ns
├── 07-for-await-of.js              # for await...of
├── 08-optional-catch.js            # catch 无参数
├── 09-exponentiation.js            # ** 运算符
├── 10-comprehensive.js             # 综合测试
└── README.md                       # 测试说明
```

### 测试用例示例

#### 01-nullish-coalescing.js
```javascript
// ES2020: Nullish Coalescing Operator (??)

// 基础用法
const a1 = null ?? 'default'       // 'default'
const a2 = undefined ?? 'default'  // 'default'
const a3 = 0 ?? 'default'          // 0
const a4 = '' ?? 'default'         // ''
const a5 = false ?? 'default'      // false

// 左结合
const b1 = a ?? b ?? c ?? 'default'

// 与 || 的区别
const c1 = 0 || 100       // 100
const c2 = 0 ?? 100       // 0
const c3 = '' || 'text'   // 'text'
const c4 = '' ?? 'text'   // ''

// 需要括号的场景
const d1 = (a && b) ?? c
const d2 = a && (b ?? c)
const d3 = (a || b) ?? c
const d4 = a || (b ?? c)

// 与可选链结合
const e1 = obj?.prop ?? 'default'
const e2 = obj?.method?.() ?? fallback
```

#### 02-optional-chaining.js
```javascript
// ES2020: Optional Chaining Operator (?.)

// 属性访问
const a1 = obj?.prop
const a2 = obj?.nested?.deep?.value

// 计算属性
const b1 = obj?.['prop-name']
const b2 = obj?.[expr]

// 方法调用
const c1 = obj?.method()
const c2 = obj?.method?.()

// 数组访问
const d1 = arr?.[0]
const d2 = arr?.[0]?.prop

// 链式调用
const e1 = obj?.a?.b?.c
const e2 = obj?.method1()?.method2()?.result

// 与普通访问混合
const f1 = obj?.a.b?.c.d
const f2 = obj?.method().prop?.nested

// 短路行为
const g1 = null?.a.b.c  // undefined（不会报错）
```

### 创建测试运行器
```typescript
// tests/es2020/test-runner.ts
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'

export function testEs2020(code: string) {
    try {
        // 1. 词法分析
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        
        // 2. 语法分析
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        console.log('✅ 解析成功')
        return { success: true, cst }
    } catch (error) {
        console.error('❌ 解析失败:', error.message)
        return { success: false, error }
    }
}
```

---

## 🟢 TEST-2: 运行测试验证所有修复

### 测试清单
- [ ] CoalesceExpression 不会栈溢出
- [ ] CoalesceExpression 左结合正确
- [ ] UpdateExpression 各种形式正确
- [ ] OptionalChaining 边界情况正确
- [ ] ForAwaitOfStatement let 歧义处理正确
- [ ] 所有 ES2020 特性正确解析

### 测试命令
```bash
# 运行单个测试
npx tsx tests/es2020/test-runner.ts tests/es2020/01-nullish-coalescing.js

# 运行所有测试
npx tsx tests/es2020/test-all.ts
```

---

## 📅 执行顺序建议

### 第一阶段：修复崩溃级问题（必须）
1. ✅ P0-1: 修复 CoalesceExpression（15分钟）

### 第二阶段：验证和优化（重要）
2. ✅ P1-1: 验证 UpdateExpression（30分钟）
3. ✅ P1-2: 验证 OptionalChaining（30分钟）
4. ✅ P1-3: 优化 ForAwaitOfStatement（15分钟）

### 第三阶段：测试验证（确保质量）
5. ✅ TEST-1: 创建综合测试（45分钟）
6. ✅ TEST-2: 运行测试验证（30分钟）

---

## 🎯 开始修复

**当前状态：** 等待用户指令

**可用指令：**
- `"开始 P0-1"` - 修复 CoalesceExpression
- `"开始 P1-1"` - 验证 UpdateExpression
- `"开始 P1-2"` - 验证 OptionalChaining
- `"开始 P1-3"` - 优化 ForAwaitOfStatement
- `"开始 TEST-1"` - 创建测试
- `"开始 TEST-2"` - 运行测试

**推荐顺序：** 按 P0 → P1 → TEST 的顺序执行

---

**修复计划创建时间：** 2025-11-02  
**预估总耗时：** 2小时45分钟  
**优先级：** 🔴 P0 必须立即修复












