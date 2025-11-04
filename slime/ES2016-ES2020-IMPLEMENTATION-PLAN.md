# ES2016-ES2020 语法特性实现计划

## 需要实现的语法特性

### ES2016 (ES7)
- [ ] 1. 指数运算符 `**` 
- [ ] 2. 指数赋值运算符 `**=`

### ES2019 (ES10)
- [ ] 3. 可选 catch 绑定 `catch {}`（不需要 `(e)`）

### ES2020 (ES11)
- [ ] 4. 可选链 `?.` - `obj?.prop`, `obj?.[expr]`, `func?.(args)`
- [ ] 5. 空值合并运算符 `??`
- [ ] 6. 空值合并赋值 `??=`
- [ ] 7. BigInt 字面量 `123n`, `0xFFn`, `0o77n`, `0b11n`
- [ ] 8. 动态 import `import(specifier)`

---

## 实现步骤

### 第1步：ES2016 指数运算符（优先级：高）

**Token 层 (Es6Tokens.ts):**
```typescript
AsteriskAsterisk: 'AsteriskAsteriskTok',     // **
AsteriskAsteriskEq: 'AsteriskAsteriskEqTok', // **=
```

**Parser 层 (Es6Parser.ts):**
- 添加 `ExponentiationExpression` 规则（优先级在 UnaryExpression 和 MultiplicativeExpression 之间）
- 修改 `AssignmentOperator` 添加 `**=`

**AST 层 (SlimeCstToAstUtil.ts):**
- 实现 `createExponentiationExpressionAst`

**测试用例:**
```javascript
2 ** 3              // 8
2 ** 3 ** 2         // 512 (右结合)
x **= 2             // x = x ** 2
```

---

### 第2步：ES2019 可选 catch 绑定（优先级：中）

**Parser 层 (Es6Parser.ts):**
- 修改 `Catch` 规则，使 `(CatchParameter)` 变为可选

**测试用例:**
```javascript
try {
    throw new Error()
} catch {           // 不需要 (e)
    console.log('error')
}
```

---

### 第3步：ES2020 可选链（优先级：高）

**Token 层 (Es6Tokens.ts):**
```typescript
QuestionDot: 'QuestionDotTok',  // ?.
```

**Parser 层 (Es6Parser.ts):**
- 修改 `MemberExpression` 添加 `?.IdentifierName`
- 修改 `CallExpression` 添加 `?.Arguments`
- 需要处理 `?.` 后面可以跟：
  - 属性访问：`obj?.prop`
  - 计算属性：`obj?.[expr]`
  - 函数调用：`func?.(args)`

**AST 层:**
- 使用 `optional: true` 标记

**测试用例:**
```javascript
user?.profile?.name
obj?.[key]
func?.(args)
arr?.[0]?.method?.()
```

---

### 第4步：ES2020 空值合并运算符（优先级：高）

**Token 层 (Es6Tokens.ts):**
```typescript
QuestionQuestion: 'QuestionQuestionTok',      // ??
QuestionQuestionEq: 'QuestionQuestionEqTok',  // ??=
```

**Parser 层 (Es6Parser.ts):**
- 添加 `NullishCoalescingExpression` 规则（优先级在 LogicalOR 和 ConditionalExpression 之间）
- 修改 `AssignmentOperator` 添加 `??=`

**注意事项:**
- `??` 不能与 `&&` 或 `||` 混用，需要加括号
- 优先级：`??` < `?:` < `||` < `&&`

**测试用例:**
```javascript
x ?? 0
x ?? y ?? z
(x || y) ?? z       // 需要括号
x ??= 10
```

---

### 第5步：ES2020 BigInt 字面量（优先级：中）

**Token 层:**
- 需要在词法分析器层面支持 `n` 后缀
- 修改 `NumericLiteral` 的正则表达式

**支持的格式:**
```javascript
123n                // 十进制
0xFFn               // 十六进制
0o77n               // 八进制
0b11n               // 二进制
```

**AST 层:**
- 添加 `bigint: true` 标记或使用新的字面量类型

---

### 第6步：ES2020 动态 import（优先级：低）

**Parser 层 (Es6Parser.ts):**
- 在 `CallExpression` 中特殊处理 `import(specifier)`
- 或者添加 `ImportCall` 规则

**测试用例:**
```javascript
import('./module.js').then(m => {})
await import('./module.js')
```

---

## 优先级排序

1. **P0 - 必须立即实现（使用频率极高）:**
   - 可选链 `?.`
   - 空值合并 `??`
   - 指数运算符 `**`

2. **P1 - 应该实现:**
   - 空值合并赋值 `??=`
   - 指数赋值 `**=`
   - 可选 catch 绑定

3. **P2 - 可以后续实现:**
   - BigInt 字面量 `123n`
   - 动态 import `import()`

---

## 运算符优先级表（更新后）

| 优先级 | 运算符 | 结合性 |
|-------|--------|--------|
| 19 | 成员访问 `.`, `?.` | 左到右 |
| 18 | new (无参数) | 右到左 |
| 17 | 后缀 `++`, `--` | n/a |
| 16 | 一元 `!`, `~`, `+`, `-`, `++`, `--`, `typeof`, `void`, `delete` | 右到左 |
| 15 | **指数 `**`** | **右到左** |
| 14 | 乘除 `*`, `/`, `%` | 左到右 |
| 13 | 加减 `+`, `-` | 左到右 |
| ... | ... | ... |
| 6 | 逻辑与 `&&` | 左到右 |
| 5 | 逻辑或 `||` | 左到右 |
| **4.5** | **空值合并 `??`** | **左到右** |
| 4 | 条件 `? :` | 右到左 |
| 3 | 赋值 `=`, `+=`, `**=`, `??=`, ... | 右到左 |

**注意：`??` 的优先级在 `||` 和 `?:` 之间**

---

## 兼容性注意事项

1. **可选链短路:** `a?.b.c.d` - 如果 `a` 是 null/undefined，整个表达式返回 undefined
2. **空值合并只检查 null/undefined:** `0 ?? 1` 返回 `0`（不同于 `||`）
3. **指数运算符右结合:** `2 ** 3 ** 2` = `2 ** (3 ** 2)` = `512`
4. **混用限制:** `a && b ?? c` 语法错误，必须写 `(a && b) ?? c`

---

## 测试策略

每个特性需要测试：
1. 基础用法
2. 嵌套使用
3. 边界情况
4. 与其他特性的组合
5. 优先级和结合性





















