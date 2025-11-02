# ES2020 (ES11) Parser

基于 ECMA-262 11th Edition 规范实现的 JavaScript ES2020 Parser。

## ✨ 特性

ES2020Parser 继承自 Es6Parser，完整支持 ES2020 的所有新特性：

### 🆕 ES2020 核心特性

| 特性 | 语法 | 规范章节 | 状态 |
|-----|------|---------|-----|
| **Optional Chaining** | `obj?.prop` | §2.10 | ✅ |
| **Nullish Coalescing** | `a ?? b` | §2.22 | ✅ |
| **BigInt** | `123n` | §1.9.3 | ✅ |
| **Dynamic Import** | `import('./module.js')` | §2.9 | ✅ |
| **import.meta** | `import.meta.url` | §2.7 | ✅ |
| **export * as ns** | `export * as utils from './utils.js'` | §5.4 | ✅ |

### 🔄 向后兼容特性

| 特性 | 语法 | 版本 | 状态 |
|-----|------|------|-----|
| **Exponentiation** | `2 ** 3` | ES2016 | ✅ |
| **Exponentiation Assignment** | `x **= 2` | ES2016 | ✅ |
| **for await...of** | `for await (const x of iter)` | ES2018 | ✅ |
| **Optional catch binding** | `catch { }` | ES2019 | ✅ |

## 📦 安装使用

### 基本用法

```typescript
import Es2020Parser from './Es2020Parser.ts'
import {es2020TokensObj} from './Es2020Tokens.ts'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'

// 待解析的代码
const code = `
  const value = obj?.prop ?? 'default';
  const big = 123n ** 2n;
  const module = await import('./module.js');
`;

// 1. 词法分析
const lexer = new SubhutiLexer(Object.values(es2020TokensObj));
const tokens = lexer.lexer(code);

// 2. 语法分析
const parser = new Es2020Parser(tokens);
const cst = parser.Program();

console.log('解析成功！', cst);
```

### 运行测试

```bash
# 进入 ES2020 目录
cd slime/packages/slime-parser/src/language/es2020

# 运行测试
npx tsx test-es2020-features.ts
```

## 📚 语法示例

### 1. Optional Chaining (可选链)

```javascript
// 属性访问
const street = user?.address?.street;

// 方法调用
const result = obj?.method?.();

// 计算属性
const value = obj?.['prop-name'];

// 短路行为
const x = null?.b.c;  // undefined（不报错）
```

### 2. Nullish Coalescing (空值合并)

```javascript
// 仅在 null/undefined 时使用默认值
const value = foo ?? 'default';

// 对比 || 运算符
0 || 100      // 100
0 ?? 100      // 0

'' || 'text'  // 'text'
'' ?? 'text'  // ''

// 不能直接混用（需要括号）
(a && b) ?? c  // ✅
a && (b ?? c)  // ✅
a && b ?? c    // ❌ 错误
```

### 3. BigInt (大整数)

```javascript
// 十进制
const big1 = 123n;

// 二进制
const big2 = 0b1010n;

// 八进制
const big3 = 0o777n;

// 十六进制
const big4 = 0xFFn;

// 运算
const sum = 1n + 2n;
const prod = 2n * 3n;
```

### 4. 幂运算符 (ES2016)

```javascript
// 基础用法
2 ** 3        // 8

// 右结合
2 ** 3 ** 2   // 512 (等价于 2 ** (3 ** 2))

// 赋值运算符
let x = 2;
x **= 3;      // x = 8
```

### 5. Dynamic Import (动态导入)

```javascript
// 字符串路径
const module = await import('./module.js');

// 表达式路径
const path = './module.js';
const module = await import(path);

// 条件导入
if (condition) {
  const { helper } = await import('./helper.js');
}
```

### 6. import.meta

```javascript
// 模块 URL
console.log(import.meta.url);

// 模块元数据
console.log(import.meta);
```

### 7. export * as ns

```javascript
// ES2020: 一步完成
export * as utils from './utils.js';

// ES2015: 需要两步
import * as utils from './utils.js';
export { utils };
```

### 8. for await...of (ES2018)

```javascript
async function processAsyncIterable(iterable) {
  for await (const item of iterable) {
    console.log(item);
  }
}
```

### 9. Optional catch binding (ES2019)

```javascript
// 不需要参数
try {
  // ...
} catch {
  console.log('Error occurred');
}

// 传统方式
try {
  // ...
} catch (e) {
  console.log(e);
}
```

## 🏗️ 架构设计

### 继承关系

```
SubhutiParser
    ↓ extends
Es6Parser (ES2015)
    ↓ extends
Es2020Parser (ES2020)
```

### 文件结构

```
es2020/
├── Es2020Parser.ts          # Parser 主文件
├── Es2020Tokens.ts           # 词法单元定义
├── test-es2020-features.ts  # 测试文件
└── README.md                 # 本文档
```

### Override 规则列表

Es2020Parser 通过 `@SubhutiRule` 装饰器 Override 了以下规则：

| 规则 | 变化 | 原因 |
|-----|------|-----|
| `Literal` | 新增 `BigIntLiteral` | 支持 BigInt 字面量 |
| `MultiplicativeExpression` | 使用 `ExponentiationExpression` | 插入幂运算符优先级 |
| `ConditionalExpression` | 使用 `ShortCircuitExpression` | 支持 Nullish Coalescing |
| `LeftHandSideExpression` | 新增 `OptionalExpression` | 支持 Optional Chaining |
| `CallExpression` | 新增 `ImportCall` | 支持 Dynamic Import |
| `MetaProperty` | 新增 `ImportMeta` | 支持 import.meta |
| `IterationStatement` | 新增 `ForAwaitOfStatement` | 支持 for await...of |
| `Catch` | `CatchParameter` 变为可选 | 支持可选 catch 绑定 |
| `AssignmentOperator` | 新增 `**=` | 支持幂赋值运算符 |
| `AsteriskFromClauseEmptySemicolon` | 支持 `as IdentifierName` | 支持 export * as ns |

### 新增规则列表

| 规则 | 语法 | 说明 |
|-----|------|-----|
| `ExponentiationExpression` | `UpdateExpression ** ExponentiationExpression` | 幂运算（右结合） |
| `CoalesceExpression` | `CoalesceExpressionHead ?? BitwiseORExpression` | 空值合并 |
| `CoalesceExpressionHead` | `CoalesceExpression \| BitwiseORExpression` | 空值合并头部 |
| `ShortCircuitExpression` | `LogicalORExpression \| CoalesceExpression` | 短路表达式 |
| `OptionalChain` | `?. Arguments \| ?. [Expression] \| ...` | 可选链 |
| `OptionalExpression` | `MemberExpression OptionalChain` | 可选表达式 |
| `ImportCall` | `import ( AssignmentExpression )` | 动态导入 |
| `ImportMeta` | `import . meta` | 模块元数据 |
| `ForAwaitOfStatement` | `for await ( ... of ... ) Statement` | 异步迭代 |
| `UpdateExpression` | 等同于 `PostfixExpression` | 规范术语统一 |

## ⚠️ 注意事项

### 1. Optional Chaining 前瞻限制

规范要求：`?. [lookahead ∉ DecimalDigit]`

```javascript
// 正确：可选链
obj?.prop

// 错误：三元运算符
condition ? .5 : 1  // 不是可选链，是小数 0.5
```

**注意**：词法层无法完全实现此前瞻检查，需在使用时注意。

### 2. Nullish Coalescing 混用限制

`??` 不能与 `&&` 或 `||` 直接混用：

```javascript
// ❌ 错误
a && b ?? c
a || b ?? c

// ✅ 正确
(a && b) ?? c
a && (b ?? c)
(a || b) ?? c
a || (b ?? c)
```

### 3. BigInt 与 Number 不兼容

```javascript
// ❌ 错误：不能混合运算
1n + 1  // TypeError

// ✅ 正确：类型统一
1n + BigInt(1)  // 2n
Number(1n) + 1  // 2
```

### 4. 幂运算符优先级

幂运算符是右结合的：

```javascript
2 ** 3 ** 2   // 512 (等价于 2 ** (3 ** 2))
不是          // 64  (不等于 (2 ** 3) ** 2)
```

## 🧪 测试覆盖

测试文件 `test-es2020-features.ts` 包含 30 个测试用例，覆盖：

- ✅ Optional Chaining (5 个用例)
- ✅ Nullish Coalescing (5 个用例)
- ✅ BigInt (6 个用例)
- ✅ Exponentiation (3 个用例)
- ✅ Dynamic Import (2 个用例)
- ✅ import.meta (1 个用例)
- ✅ export * as ns (1 个用例)
- ✅ for await...of (4 个用例)
- ✅ Optional catch binding (2 个用例)
- ✅ 综合测试 (1 个用例)

运行测试查看详细结果。

## 📖 参考资料

- [ECMA-262 11th Edition (ES2020) 规范](https://262.ecma-international.org/11.0/)
- [ES2020Syntax.md](../../docs/Es2020Syntax.md) - 本项目的规范参考文档
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

遵循项目根目录的 LICENSE 文件。

