# ES6Parser 修复计划 - 详细 TodoList

> 所有与ES6规范不一致的项目清单，待逐项讨论是否需要修复

---

## 📋 待讨论清单总览

| 编号 | 类别 | 项目名称 | 优先级 | 状态 |
|------|------|---------|--------|------|
| **1** | 🔴 代码错误 | ConciseBody规则顺序错误 | P0 | 🔲 待讨论 |
| **2** | 🟡 代码优化 | TODO注释表述不准确 | P1 | 🔲 待讨论 |
| **3** | 📝 ASI限制 | ReturnStatement换行检查 | P2 | 🔲 待讨论 |
| **4** | 📝 ASI限制 | ThrowStatement换行检查 | P2 | 🔲 待讨论 |
| **5** | 📝 ASI限制 | BreakStatement换行检查 | P2 | 🔲 待讨论 |
| **6** | 📝 ASI限制 | ContinueStatement换行检查 | P2 | 🔲 待讨论 |
| **7** | 📝 ASI限制 | YieldExpression换行检查 | P2 | 🔲 待讨论 |
| **8** | ✅ 已解决 | ExpressionStatement前瞻 | - | 🔲 待讨论 |
| **9** | ⚠️ 边界情况 | ForStatement的let[检查 | P3 | 🔲 待讨论 |
| **10** | ✅ 已解决 | ExportDefault前瞻 | - | 🔲 待讨论 |
| **11** | 🎯 设计决策 | 单分支Or规则 | - | 🔲 待讨论 |
| **12** | 🎯 设计决策 | Cover Grammar处理 | - | 🔲 待讨论 |
| **13** | 🎯 设计决策 | EmptySemicolon设计 | - | 🔲 待讨论 |
| **14** | 📚 文档 | README添加限制说明 | P1 | 🔲 待讨论 |
| **15** | 🧪 测试 | 箭头函数体测试用例 | P1 | 🔲 待讨论 |
| **16** | 🧪 测试 | ASI边界测试用例 | P2 | 🔲 待讨论 |
| **17** | 🧪 测试 | 歧义语法测试用例 | P2 | 🔲 待讨论 |

---

## 🔴 项目 #1: ConciseBody规则顺序错误

### 基本信息
- **文件位置：** `Es6Parser.ts` Line 1505-1519
- **类型：** 代码错误
- **优先级：** P0（必须修复）
- **工作量：** 5分钟

### 问题描述
```typescript
// ❌ 当前代码（错误）
@SubhutiRule
ConciseBody() {
    this.Or([
        {
            alt: () => {
                // TODO: Implement lookahead check
                this.AssignmentExpression()    // ❌ 短规则在前
            }
        },
        {
            alt: () => {
                this.FunctionBodyDefine()      // 长规则在后
            }
        }
    ])
}
```

### ES6规范要求
```
ConciseBody[In] ::
    [lookahead ≠ { ] AssignmentExpression[?In]
    { FunctionBody }
```

### 问题影响
```javascript
// 可能导致错误解析：
const f = x => { return 1; }
// 预期：箭头函数，函数体返回1
// 实际：可能被解析为 x => ({ return: 1 })（对象字面量）
```

### 修复方案
```typescript
// ✅ 修复后
@SubhutiRule
ConciseBody() {
    this.Or([
        {
            alt: () => {
                this.FunctionBodyDefine()      // ✅ 长规则在前
            }
        },
        {
            alt: () => {
                this.AssignmentExpression()    // 短规则在后
            }
        }
    ])
}
```

### 测试用例
```javascript
// 需要验证的用例：
const f1 = x => { return x + 1; }               // 函数体
const f2 = (a, b) => { return a + b; }          // 带参数的函数体
const f3 = x => ({ value: x })                  // 对象字面量表达式
const f4 = x => (1 + 2)                         // 括号表达式
const f5 = x => x + 1                           // 普通表达式
```

### 待讨论问题
1. **是否需要修复？** （建议：是，这是明确的Or规则顺序错误）
2. **修复时机？** （建议：立即修复）
3. **是否需要测试？** （建议：需要，添加上述5个测试用例）

---

## 🟡 项目 #2: TODO注释表述不准确

### 基本信息
- **文件位置：** `Es6Parser.ts` 多处（10处）
- **类型：** 代码质量优化
- **优先级：** P1（建议修复）
- **工作量：** 10分钟

### 问题描述
当前10处TODO注释暗示"功能待实现"，但实际上是"设计上不支持"：

| 位置 | 当前注释 | 问题 |
|------|---------|------|
| Line 1120 | `// TODO: Implement lookahead check` | 暗示可以实现 |
| Line 1172 | `// TODO: Implement lookahead check for 'let ['` | 暗示可以实现 |
| Line 1204 | `// TODO: Implement lookahead check for 'let ['` | 暗示可以实现 |
| Line 1264 | `// TODO: Implement [no LineTerminator here] check` | 暗示可以实现 |
| Line 1274 | `// TODO: Implement [no LineTerminator here] check` | 暗示可以实现 |
| Line 1284 | `// TODO: Implement [no LineTerminator here] check` | 暗示可以实现 |
| Line 1357 | `// TODO: Implement [no LineTerminator here] check` | 暗示可以实现 |
| Line 1509 | `// TODO: Implement lookahead check` | 暗示可以实现 |
| Line 1613 | `// TODO: Implement [no LineTerminator here] check` | 暗示可以实现 |
| Line 1914 | `// TODO: Implement lookahead check` | 暗示可以实现 |

### 修复方案（方案A）
```typescript
// 明确说明设计限制
// Note: Lookahead not supported by SubhutiParser (by design)
```

### 修复方案（方案B）
```typescript
// 说明限制 + 影响
// Note: [no LineTerminator here] not supported - ASI behavior may differ from ES6 spec
```

### 修复方案（方案C）
```typescript
// 完全删除注释（已在文档中说明）
```

### 待讨论问题
1. **是否需要修复？** （建议：是，避免误导维护者）
2. **采用哪个方案？** （建议：方案A或B）
3. **每处注释是否需要详细说明？** （建议：统一简短说明即可）

---

## 📝 项目 #3-7: ASI限制（5项）

### 基本信息
- **类型：** 框架设计限制
- **优先级：** P2（文档说明）
- **是否可以修复：** ❌ 不可以（需要前瞻检查）

### 项目 #3: ReturnStatement换行检查

**文件位置：** Line 1282-1288

**ES6规范：**
```
ReturnStatement ::
    return [no LineTerminator here] Expression ;
    return ;
```

**当前实现：**
```typescript
@SubhutiRule
ReturnStatement() {
    this.tokenConsumer.ReturnTok()
    this.Option(() => {
        // TODO: Implement [no LineTerminator here] check
        this.Expression()
    })
    this.EmptySemicolon()
}
```

**规范差异示例：**
```javascript
// ES6规范：应解析为 return;
return
  x + 1

// ES6Parser：解析为 return (x + 1)
```

**实际影响：**
- 使用分号的代码：✅ 完全正常
- 依赖ASI的代码：⚠️ 可能不符合预期

**待讨论问题：**
1. 是否需要修复代码？（建议：❌ 不需要，框架限制）
2. 是否需要文档说明？（建议：✅ 需要）
3. 是否需要在注释中说明？（建议：✅ 见项目#2）

---

### 项目 #4: ThrowStatement换行检查

**文件位置：** Line 1355-1360

**问题同上，示例：**
```javascript
// ES6规范：应该报错（throw后立即换行）
throw
  new Error()

// ES6Parser：正常解析为 throw new Error()
```

**待讨论问题：** 同项目#3

---

### 项目 #5: BreakStatement换行检查

**文件位置：** Line 1271-1278

**问题同上，示例：**
```javascript
myLabel:
for (let i = 0; i < 10; i++) {
    // ES6规范：应解析为 break; myLabel（语法错误）
    break
      myLabel
    
    // ES6Parser：解析为 break myLabel
}
```

**待讨论问题：** 同项目#3

---

### 项目 #6: ContinueStatement换行检查

**文件位置：** Line 1261-1268

**问题同上**

**待讨论问题：** 同项目#3

---

### 项目 #7: YieldExpression换行检查

**文件位置：** Line 1610-1624

**问题同上，示例：**
```javascript
function* gen() {
    // ES6规范：应解析为 yield; x
    yield
      x
    
    // ES6Parser：解析为 yield x
}
```

**待讨论问题：** 同项目#3

---

## ✅ 项目 #8: ExpressionStatement前瞻（已解决）

### 基本信息
- **文件位置：** Line 1119-1123
- **类型：** 已通过Or顺序解决
- **优先级：** - （无需修复）

### ES6规范要求
```
ExpressionStatement[Yield] ::
    [lookahead ∉ { {, function, class, let [ }] Expression[In, ?Yield] ;
```

### 当前解决方案
```typescript
// StatementListItem: Declaration在前
@SubhutiRule
StatementListItem() {
    this.Or([
        {alt: () => this.Declaration()},    // ✅ function/class在这里
        {alt: () => this.Statement()}       // ExpressionStatement在后
    ])
}

// Statement: BlockStatement在前
@SubhutiRule
Statement() {
    this.Or([
        {alt: () => this.BlockStatement()},  // ✅ { 在这里
        // ...
        {alt: () => this.ExpressionStatement()}  // 最后
    ])
}
```

### 验证测试
```javascript
// ✅ 所有这些都正确解析
{x: 1}                    // BlockStatement
function foo() {}         // FunctionDeclaration
class Bar {}              // ClassDeclaration
let x = 1                 // VariableDeclaration
x + 1                     // ExpressionStatement
```

### 待讨论问题
1. 确认已正确解决？（建议：✅ 是）
2. 是否删除TODO注释？（建议：✅ 删除或改为Note）
3. 是否需要添加测试？（建议：✅ 添加上述验证测试）

---

## ⚠️ 项目 #9: ForStatement的let[检查（边界情况）

### 基本信息
- **文件位置：** Line 1169-1195
- **类型：** 边界情况
- **优先级：** P3（影响极小）

### ES6规范要求
```
for ( [lookahead ≠ let [] Expression ; Expression ; Expression ) Statement
```

### 问题场景
```javascript
// 场景1：let[0]是成员访问（赋值语句）
for (let[0] = 1; i < 10; i++) {
    // ES6Parser可能错误解析为：for (let [0] = 1; ...)
    // 即：解构声明而非赋值语句
}

// 场景2：let [a]是解构声明（正确场景）
for (let [a] = arr; a < 10; a++) {}
```

### 影响评估
| 维度 | 评估 |
|------|------|
| 代码频率 | ⭐ 极其罕见（几乎不会有人这样写） |
| 解析影响 | ⚠️ 可能报错或错误解析 |
| 替代方案 | ✅ 有：`for (i = let[0]; ...)` |
| 实际影响 | ✅ 可忽略 |

### 待讨论问题
1. 是否需要修复？（建议：❌ 不需要，罕见写法）
2. 是否需要文档说明？（建议：✅ 简单说明即可）
3. 是否删除TODO注释？（建议：✅ 改为Note说明不支持）

---

## ✅ 项目 #10: ExportDefault前瞻（已解决）

### 基本信息
- **文件位置：** Line 1907-1920
- **类型：** 已通过Or顺序解决
- **优先级：** - （无需修复）

### ES6规范要求
```
export default [lookahead ∉ { function, class }] AssignmentExpression ;
```

### 当前解决方案
```typescript
@SubhutiRule
DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression() {
    this.tokenConsumer.DefaultTok()
    this.Or([
        {alt: () => this.HoistableDeclaration()},  // ✅ function在前
        {alt: () => this.ClassDeclaration()},      // ✅ class在前
        {
            alt: () => {
                this.AssignmentExpressionEmptySemicolon()  // 表达式在后
            }
        }
    ])
}
```

### 验证测试
```javascript
// ✅ 所有这些都正确解析
export default function foo() {}
export default class Bar {}
export default 123
export default x + 1
```

### 待讨论问题
1. 确认已正确解决？（建议：✅ 是）
2. 是否删除TODO注释？（建议：✅ 删除）

---

## 🎯 项目 #11: 单分支Or规则（设计决策）

### 基本信息
- **文件位置：** 
  - Line 61-65: IdentifierReference
  - Line 87-91: BindingIdentifier
  - Line 112-116: LabelIdentifier
- **类型：** 设计决策
- **优先级：** - （设计合理）

### 代码示例
```typescript
@SubhutiRule
IdentifierReference() {
    this.Or([
        {alt: () => this.tokenConsumer.Identifier()},
    ])
}
```

### ES6规范
```
IdentifierReference[Yield] ::
    Identifier
    [~Yield] yield    // 非生成器上下文
```

### 设计分析
**为什么使用单分支Or？**
1. API一致性：所有规则统一使用Or
2. 预留扩展：未来可添加上下文相关分支（yield/await）
3. 框架副作用：Or会管理allowError栈

**优劣评估：**
- ✅ 预留扩展空间
- ⚠️ 轻微性能开销
- ✅ 代码一致性

### 待讨论问题
1. 是否需要修改？（建议：❌ 不需要，设计合理）
2. 是否添加注释说明？（建议：✅ 说明预留扩展）
3. 未来是否需要实现上下文检查？（建议：看实际需求）

---

## 🎯 项目 #12: Cover Grammar处理（设计决策）

### 基本信息
- **类型：** 设计决策
- **优先级：** - （符合PEG风格）

### ES6规范使用Cover Grammar
```
CoverParenthesizedExpressionAndArrowParameterList[Yield] ::
    ( Expression[In, ?Yield] )
    ( )
    ( ... BindingIdentifier[?Yield] )
```

### ES6Parser的设计
**不使用Cover Grammar，而是：**
1. 在ArrowFunction中分离处理
2. 依赖AssignmentExpression的Or顺序

```typescript
// AssignmentExpression中
this.Or([
    {alt: () => this.YieldExpression()},
    {alt: () => this.ArrowFunction()},      // ✅ 优先尝试箭头函数
    // ... 其他赋值
    {alt: () => this.ConditionalExpression()},  // 普通表达式作为回退
])
```

### 验证测试
```javascript
// ✅ 正确解析
(a, b) => a + b        // 箭头函数
(a, b)                 // 逗号表达式
```

### 待讨论问题
1. 是否需要修改为Cover Grammar？（建议：❌ 不需要，当前设计简洁）
2. 是否需要增加测试？（建议：✅ 需要边界测试）
3. 是否在文档中说明设计决策？（建议：✅ 需要）

---

## 🎯 项目 #13: EmptySemicolon设计（设计决策）

### 基本信息
- **位置：** Line 863-867
- **类型：** 设计决策
- **优先级：** - （设计优雅）

### 代码
```typescript
EmptySemicolon() {
    this.Option(() => {
        this.tokenConsumer.Semicolon()
    })
}
```

### 设计分析
**优势：**
- ✅ 简洁：用Option表达"可选分号"
- ✅ ASI友好：允许省略分号
- ✅ 无需前瞻：Option总是成功

**劣势：**
- ⚠️ 过于宽松：某些应该必需分号的地方也允许省略

### 待讨论问题
1. 是否需要修改？（建议：❌ 不需要，设计合理）
2. 是否影响正确性？（建议：✅ 不影响，各语句规则正确使用）

---

## 📚 项目 #14: README添加限制说明（文档）

### 基本信息
- **文件位置：** `README.md`
- **类型：** 文档完善
- **优先级：** P1（建议添加）
- **工作量：** 30分钟

### 建议添加的章节

#### 章节1：已知限制
```markdown
## ⚠️ 已知限制

由于SubhutiParser不支持前瞻检查（lookahead），以下特性与ES6规范略有差异：

### 1. ASI（自动分号插入）

以下语句无法检测换行符，ASI行为可能不符合ES6规范：
- `return` 语句
- `throw` 语句
- `break/continue` 语句（带label时）
- `yield` 表达式
- 后缀 `++/--`

**最佳实践：** 显式使用分号

```javascript
// ✅ 推荐
return x + 1;
throw new Error();

// ⚠️ 避免依赖ASI换行
return
  x + 1
```

### 2. 不支持的边界语法

- `for (let[0] = 1; ...)` - for语句中的`let[index]`成员访问（极罕见）

**替代方案：** `for (i = let[0]; ...)`
```

#### 章节2：设计决策
```markdown
## 🎯 设计决策

### PEG风格的Or规则

SubhutiParser采用PEG（Parsing Expression Grammar）风格：
- **顺序选择**：第一个成功的分支立即返回
- **规则顺序至关重要**：长规则必须在前
- **无二义性**：通过Or顺序解决语法歧义

### 不使用Cover Grammar

与ES6规范不同，ES6Parser不使用Cover Grammar，而是通过Or规则顺序处理歧义。

例如：`(a, b)` 的二义性通过在AssignmentExpression中优先尝试ArrowFunction解决。
```

### 待讨论问题
1. 是否需要添加？（建议：✅ 需要）
2. 章节内容是否合适？（建议：可根据反馈调整）
3. 添加到哪个文件？（建议：主README或单独的LIMITATIONS.md）

---

## 🧪 项目 #15: 箭头函数体测试用例

### 基本信息
- **类型：** 测试增强
- **优先级：** P1（修复项目#1后必须测试）
- **工作量：** 15分钟

### 建议的测试用例
```javascript
// 测试文件：tests/cases/XX-arrow-function-body.js

// 测试1：函数体（块语句）
const f1 = x => { return x + 1; }
const f2 = (a, b) => { 
    const sum = a + b;
    return sum;
}
const f3 = () => { 
    console.log('hello');
}

// 测试2：表达式 - 对象字面量（需要括号）
const f4 = x => ({ value: x })
const f5 = x => ({ a: 1, b: 2 })
const f6 = () => ({ name: 'test' })

// 测试3：表达式 - 普通值
const f7 = x => x + 1
const f8 = x => (x + 1)
const f9 = (a, b) => a + b

// 测试4：表达式 - 数组
const f10 = x => [x, x * 2]
const f11 = () => []

// 测试5：嵌套箭头函数
const f12 = x => y => x + y
const f13 = x => y => { return x + y; }
```

### 待讨论问题
1. 是否需要添加？（建议：✅ 需要，验证项目#1修复）
2. 测试用例是否充分？（建议：可根据需要增加）
3. 测试位置？（建议：`tests/cases/`目录）

---

## 🧪 项目 #16: ASI边界测试用例

### 基本信息
- **类型：** 测试增强
- **优先级：** P2（文档说明后可选）
- **工作量：** 30分钟

### 建议的测试用例
```javascript
// 测试文件：tests/cases/XX-asi-boundary.js

// 说明：这些测试验证ASI限制，预期解析结果与ES6规范不同

// 测试1：return换行（与规范不同）
function test1() {
    return
      1  // ES6Parser: return 1; | ES6规范: return; 1
}

// 测试2：throw换行（与规范不同）
function test2() {
    throw
      new Error()  // ES6Parser: throw new Error() | ES6规范: 应报错
}

// 测试3：显式分号（完全正常）
function test3() {
    return 1;
    throw new Error();
}

// 测试4：break/continue换行
function test4() {
    myLabel: for (let i = 0; i < 10; i++) {
        break
          myLabel  // 可能与规范不同
    }
}

// 测试5：yield换行
function* test5() {
    yield
      1  // 可能与规范不同
}
```

### 待讨论问题
1. 是否需要添加？（建议：✅ 需要，记录预期行为）
2. 如何标注预期结果？（建议：注释说明差异）
3. 是否作为通过测试？（建议：是，记录当前行为）

---

## 🧪 项目 #17: 歧义语法测试用例

### 基本信息
- **类型：** 测试增强
- **优先级：** P2（验证Or顺序）
- **工作量：** 15分钟

### 建议的测试用例
```javascript
// 测试文件：tests/cases/XX-ambiguous-syntax.js

// 测试1：块语句 vs 对象字面量
{x: 1}                              // 应解析为块语句（label + 表达式）
const obj = {x: 1}                  // 对象字面量
const obj2 = ({x: 1})               // 括号内的对象字面量

// 测试2：函数声明 vs 函数表达式
function foo() {}                   // 函数声明
const bar = function() {}           // 函数表达式
(function() {})                     // IIFE

// 测试3：类声明 vs 类表达式
class Foo {}                        // 类声明
const Bar = class {}                // 类表达式

// 测试4：箭头函数 vs 逗号表达式
const f1 = (a, b) => a + b         // 箭头函数
const result = (a, b)              // 逗号表达式

// 测试5：export default
export default function foo() {}    // 函数声明
export default class Bar {}         // 类声明
export default 123                  // 表达式
```

### 待讨论问题
1. 是否需要添加？（建议：✅ 需要）
2. 测试用例是否充分？（建议：覆盖主要歧义场景）

---

## 📊 修复优先级总结

### 立即执行（P0）
| 编号 | 项目 | 工作量 | 依赖 |
|------|------|--------|------|
| #1 | ConciseBody规则顺序 | 5分钟 | 无 |
| #15 | 箭头函数体测试 | 15分钟 | #1修复后 |

**总计：** 20分钟

### 近期执行（P1）
| 编号 | 项目 | 工作量 | 依赖 |
|------|------|--------|------|
| #2 | TODO注释表述 | 10分钟 | 无 |
| #14 | README文档 | 30分钟 | 讨论通过后 |

**总计：** 40分钟

### 可选执行（P2-P3）
| 编号 | 项目 | 工作量 | 依赖 |
|------|------|--------|------|
| #16 | ASI边界测试 | 30分钟 | #14完成后 |
| #17 | 歧义语法测试 | 15分钟 | 无 |

**总计：** 45分钟

### 仅需讨论（无需代码修改）
| 编号 | 项目 | 结论 |
|------|------|------|
| #3-7 | ASI限制 | 文档说明即可 |
| #8 | ExpressionStatement | 已解决 |
| #9 | ForStatement let[ | 文档说明边界情况 |
| #10 | ExportDefault | 已解决 |
| #11-13 | 设计决策 | 保持现状 |

---

## 🎯 讨论流程建议

建议按以下顺序讨论：

1. **项目 #1（P0）** - ConciseBody规则顺序（必须修复）
2. **项目 #2（P1）** - TODO注释表述（快速修复）
3. **项目 #8, #10（已解决）** - 确认无需修改
4. **项目 #3-7（ASI）** - 确认文档说明策略
5. **项目 #9（边界）** - 确认处理方式
6. **项目 #11-13（设计）** - 确认保持现状
7. **项目 #14（文档）** - 讨论文档内容
8. **项目 #15-17（测试）** - 讨论测试范围

---

## 📝 讨论记录模板

```markdown
### 项目 #X: [项目名称]

**讨论时间：** YYYY-MM-DD
**参与人：** 

**决策：**
- [ ] 需要修复
- [ ] 不需要修复
- [ ] 需要文档说明
- [ ] 需要测试

**具体方案：**


**后续行动：**


**状态更新：** 🔲待讨论 → ✅已决策
```

---

**文档版本：** 1.0.0  
**创建时间：** 2025-11-02  
**状态：** 🔲 待逐项讨论

**下一步：** 请逐项讨论，更新每个项目的决策和状态





