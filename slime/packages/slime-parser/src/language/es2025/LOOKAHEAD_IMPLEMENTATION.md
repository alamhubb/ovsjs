# Es2025Parser 前瞻功能实现总结

## 概述

按照 ECMAScript® 2025 规范（`es2025-grammar.md`），在 `Es2025Parser.ts` 中添加了完整的前瞻（lookahead）功能，使用 `SubhutiLookahead.ts` 实现。

## 实现的前瞻约束

### 1. ExpressionStatement (Line 856-878)

**规范约束：** `[lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]`

**位置：** Line 1087

**实现：**
```typescript
// 检查5个约束条件
if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'LBrace')) return undefined
if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'FunctionTok')) return undefined
if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'ClassTok')) return undefined
if (SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(this._tokens, this.tokenIndex)) return undefined
if (SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)) return undefined
```

**目的：** 确保表达式语句不会与其他语句形式产生歧义。

---

### 2. ForStatement (Line 980-1024)

**规范约束：** `[lookahead ≠ let []`

**位置：** Line 1115

**实现：**
```typescript
// for ( expr ; ; ) 分支中检查
{
  alt: () => {
    if (SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)) {
      return undefined
    }
    this.Expression({ In: false, Yield: params.Yield, Await: params.Await })
  }
}
```

**目的：** 区分 `for (let [a] = arr; ...)` 和 `for (expr; ...)`。

---

### 3. ForInOfStatement (Line 1040-1098)

**规范约束：**
- `[lookahead ≠ let []` (for...in, Line 1120)
- `[lookahead ∉ {let, async of}]` (for...of, Line 1123)

**实现：**
```typescript
// LeftHandSideExpression 分支中检查
{
  alt: () => {
    // 不能是 let [
    if (SubhutiLookahead.isLetBracket(this._tokens, this.tokenIndex)) {
      return undefined
    }
    // 不能是 let
    if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'LetTok')) {
      return undefined
    }
    // 不能是 async of
    if (SubhutiLookahead.matchSequence(this._tokens, this.tokenIndex, ['AsyncTok', 'OfTok'])) {
      return undefined
    }
    
    this.LeftHandSideExpression(params)
  }
}
```

**目的：** 区分变量声明和左值表达式形式。

---

### 4. ExportDeclaration (Line 516-547)

**规范约束：** `[lookahead ∉ {function, async [no LineTerminator here] function, class}]`

**位置：** Line 1558 (export default)

**实现：**
```typescript
// export default expr; 分支中检查
{
  alt: () => {
    if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'FunctionTok')) {
      return undefined
    }
    if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'ClassTok')) {
      return undefined
    }
    if (SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(this._tokens, this.tokenIndex)) {
      return undefined
    }
    
    this.AssignmentExpression({ In: true, Yield: false, Await: true })
    this.tokenConsumer.Semicolon()
  }
}
```

**目的：** 区分 `export default function() {}` 和 `export default expression;`。

---

### 5. ConciseBody (Line 4297-4320)

**规范约束：** `[lookahead ≠ {]`

**位置：** Line 1296 (箭头函数体)

**实现：**
```typescript
// expression 分支中检查
{
  alt: () => {
    if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'LBrace')) {
      return undefined
    }
    this.ExpressionBody({ In: params.In, Await: false })
  }
}
```

**目的：** 区分 `() => expr` 和 `() => { statements }`。

---

### 6. AsyncConciseBody (Line 4092-4115)

**规范约束：** `[lookahead ≠ {]`

**位置：** Line 1311 (async 箭头函数体)

**实现：**
```typescript
// expression 分支中检查
{
  alt: () => {
    if (SubhutiLookahead.is(this._tokens, this.tokenIndex, 'LBrace')) {
      return undefined
    }
    this.ExpressionBody({ In: params.In, Await: true })
  }
}
```

**目的：** 区分 `async () => expr` 和 `async () => { statements }`。

---

## 使用的 SubhutiLookahead 方法

### 基础方法

1. **`is(tokens, index, tokenName)`**
   - 检查下一个 token 是否匹配指定类型
   - 使用场景：单个 token 前瞻

2. **`isNot(tokens, index, tokenName)`**
   - 检查下一个 token 是否不匹配指定类型
   - 使用场景：否定前瞻

3. **`matchSequence(tokens, index, tokenNames)`**
   - 检查连续的 token 序列是否匹配
   - 使用场景：多个 token 的序列前瞻

### 高频组合方法

1. **`isAsyncFunctionWithoutLineTerminator(tokens, index)`**
   - 检查是否是 `async function` 且中间无换行符
   - 对应规范中的 `async [no LineTerminator here] function`
   - 使用场景：ExpressionStatement, ExportDeclaration

2. **`isLetBracket(tokens, index)`**
   - 检查是否是 `let [` 序列
   - 对应规范中的 `[lookahead ≠ let []`
   - 使用场景：ForStatement, ForInOfStatement

---

## 实现原则

1. **不消费 token**
   - 所有前瞻检查只查看 token，不修改 `tokenIndex`

2. **不影响解析状态**
   - 前瞻检查不修改 `parseSuccess` 状态
   - 只返回 `boolean` 结果

3. **返回 undefined 表示约束失败**
   - 当前瞻约束不满足时，返回 `undefined`
   - 触发 `Or` 规则尝试下一个分支

4. **在 Or 分支中检查**
   - 前瞻约束在需要消歧义的 `Or` 分支中检查
   - 确保只有满足约束的分支会被尝试

---

## 未实现的前瞻约束

以下前瞻约束属于词法层面或正则表达式，不在语法解析器中实现：

1. **Line 82**: `[lookahead ≠ <LF>]` - LineTerminatorSequence（词法层面）
2. **Line 189**: `[lookahead ∉ DecimalDigit]` - OptionalChainingPunctuator（词法层面）
3. **Line 1096**: `[lookahead ≠ else]` - IfStatement（通过 `Option` 自然处理）
4. **Line 1868+**: RegExp 相关前瞻（RegExp 解析暂未实现）

---

## 测试建议

### 测试用例覆盖

1. **ExpressionStatement**
   ```javascript
   // 应该解析为表达式语句
   (x + y);
   
   // 应该解析为其他语句（不是表达式语句）
   { x: 1 }           // 块语句
   function f() {}    // 函数声明
   class C {}         // 类声明
   async function() {} // async 函数
   let [a] = arr      // let 声明
   ```

2. **ForStatement**
   ```javascript
   // 应该解析为表达式形式
   for (x; x < 10; x++) {}
   
   // 应该解析为声明形式
   for (let [a] = arr; ...) {}
   ```

3. **ForInOfStatement**
   ```javascript
   // 应该解析为左值表达式
   for (x in obj) {}
   for (x of arr) {}
   
   // 应该解析为声明
   for (let x in obj) {}
   for (let [a] of arr) {}
   for (const {x} of arr) {}
   
   // 不应该解析（前瞻约束阻止）
   for (let [x] in obj) {}  // let [ 被阻止
   for (async of arr) {}    // async of 被阻止
   ```

4. **ExportDeclaration**
   ```javascript
   // 应该解析为声明
   export default function f() {}
   export default class C {}
   export default async function f() {}
   
   // 应该解析为表达式
   export default x + y;
   export default 42;
   ```

5. **ArrowFunction**
   ```javascript
   // 表达式体
   () => x + y
   async () => await x
   
   // 块体
   () => { return x + y }
   async () => { return await x }
   ```

---

## 性能考虑

1. **O(1) 时间复杂度**
   - 所有前瞻检查都是常数时间
   - 最多查看前 2 个 token（`async function`）

2. **零内存开销**
   - 使用静态方法，不创建对象
   - 直接访问 token 数组

3. **早期返回**
   - 约束失败时立即返回 `undefined`
   - 避免无效的解析尝试

---

## 版本信息

- **实现日期**: 2025-11-05
- **规范版本**: ECMAScript® 2025
- **Parser 版本**: 1.0.0
- **SubhutiLookahead 版本**: 1.0.0

---

## 参考资料

- **语法规范**: `es2025-grammar.md`
- **前瞻工具**: `subhuti/src/SubhutiLookahead.ts`
- **Parser 实现**: `Es2025Parser.ts`
- **规范地址**: https://tc39.es/ecma262/2025/#sec-grammar-summary




