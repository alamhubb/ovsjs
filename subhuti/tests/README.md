# SubhutiParser 测试套件

完整测试 SubhutiParser 的所有核心功能，从简单到复杂逐步验证。

**测试目录：** `./tests/cases/`  
**运行方式：** 自动扫描 cases 目录下所有 .ts 和 .js 文件

## 测试用例列表

| 编号 | 文件名 | 测试内容 | 重要性 | 通过率 |
|-----|--------|---------|--------|--------|
| 001 | `subhutiparsertest-token-001.ts` | 基础Token消费 | ⭐⭐⭐ | ✅ 4/4 |
| 002 | `subhutiparsertest-or-002.ts` | Or规则基础测试 | ⭐⭐⭐ | ✅ 5/5 |
| 003 | `subhutiparsertest-or-order-003.ts` | Or规则顺序问题（关键） | ⭐⭐⭐⭐⭐ | ✅ 4/4 |
| 004 | `subhutiparsertest-many-004.ts` | Many规则测试 | ⭐⭐⭐ | ✅ 7/7 |
| 005 | `subhutiparsertest-option-005.ts` | Option规则测试 | ⭐⭐⭐ | ✅ 5/5 |
| 006 | `subhutiparsertest-nested-006.ts` | 嵌套规则测试 | ⭐⭐⭐⭐ | ✅ 5/5 |
| 007 | `subhutiparsertest-atleastone-007.ts` | AtLeastOne规则测试 | ⭐⭐⭐ | ✅ 8/8 |
| 008 | `subhutiparsertest-lookahead-008.ts` | 词法前瞻（Lookahead）测试 | ⭐⭐⭐⭐⭐ | ✅ 14/14 |
| 009 | `subhutiparsertest-error-009.ts` | 错误处理测试 | ⭐⭐⭐⭐ | ✅ 6/6 |
| 010 | `subhutiparsertest-packrat-010.ts` | Packrat缓存测试 | ⭐⭐⭐⭐ | ✅ 6/6 |
| 011 | `subhutiparsertest-lookahead-methods-011.ts` | Token前瞻方法测试 | ⭐⭐⭐ | ✅ 8/8 |
| 012 | `subhutiparsertest-boundary-012.ts` | 边界情况测试 | ⭐⭐⭐⭐ | ✅ 8/8 |
| 013 | `subhutiparsertest-cst-013.ts` | CST结构测试 | ⭐⭐⭐⭐ | ✅ 8/8 |
| - | `subhutiparsertest-cst-debug-example.ts` | CST Debug 功能示例 | 📖示例 | ✅ |

**总计：** 14个测试文件，88个测试用例，100%通过率

## 快速开始

### 运行所有测试

```bash
cd subhuti/tests
npx tsx run-all-tests.ts
```

**特性：** 自动扫描 `cases/` 目录下所有测试文件，按字母顺序运行

### 运行单个测试

```bash
cd subhuti/tests/cases
npx tsx subhutiparsertest-token-001.ts
```

### 使用 Debug 功能

```typescript
// 默认：关闭调试
const parser1 = new MyParser(tokens)
parser1.MyRule()

// 普通调试：追踪 + 性能
const parser2 = new MyParser(tokens).debug(true)
parser2.MyRule()

// CST 可视化：只输出 CST 结构
const parser3 = new MyParser(tokens).debug('cst')
parser3.MyRule()
```

## 测试内容详解

### 001 - 基础Token消费

**测试目标：**
- tokenConsumer 能否正确消费单个token
- tokenIndex 是否正确更新
- 消费失败时的行为

**测试用例：**
1. 消费单个token
2. 消费两个连续token
3. token不匹配应该失败
4. token不足应该失败

### 002 - Or规则基础测试

**测试目标：**
- Or规则能否正确匹配第一个成功的分支
- 顺序尝试机制是否正常
- 回溯机制是否工作

**测试用例：**
1. Or规则匹配第一个分支
2. Or规则匹配第二个分支
3. Or规则匹配第三个分支
4. Or规则所有分支都失败
5. Or规则带回溯

### 003 - Or规则顺序问题（⭐最关键）

**测试目标：**
- 验证短规则在前会导致长规则无法匹配
- 验证长规则在前能正确工作
- **这是导致 Slime Parser 失败的根本原因**

**测试用例：**
1. 短规则在前 - 匹配短形式 ✅
2. 短规则在前 - 尝试匹配长形式 ❌（只消费部分token）
3. 长规则在前 - 匹配短形式 ✅（回溯到第二个分支）
4. 长规则在前 - 匹配长形式 ✅（第一个分支完全匹配）

**关键结论：**
```
Or([
  {短规则},   // ❌ 错误：会提前成功，长规则永远无法匹配
  {长规则}
])

Or([
  {长规则},   // ✅ 正确：失败时回溯，短规则作为回退
  {短规则}
])
```

### 004 - Many规则测试

**测试目标：**
- Many规则匹配0次的情况
- Many规则匹配1次的情况
- Many规则匹配多次的情况
- Many规则的终止条件

**测试用例：**
1. Many匹配0次（空输入）
2. Many匹配1次
3. Many匹配多次
4. Many的终止条件（遇到不匹配token）
5. 逗号分隔的列表（`Number (, Number)*`）
6. Many后跟固定token
7. Many匹配0次后跟固定token

### 005 - Option规则测试

**测试目标：**
- Option匹配成功的情况
- Option匹配失败的情况（不抛出异常）
- Option与固定token的组合

**测试用例：**
1. Option匹配成功
2. Option匹配失败（不抛异常）
3. Option后跟固定token - 匹配Option
4. Option后跟固定token - 不匹配Option
5. Option部分匹配失败（回溯）

### 006 - 嵌套规则测试

**测试目标：**
- Or嵌套Many
- Many嵌套Option
- 复杂的规则组合
- CST结构验证

**测试用例：**
1. 简单变量声明：`let x ;`
2. 带初始化：`var x = 10 ;`
3. 多个变量：`const a = 1 , b = 2 , c ;`
4. CST结构验证
5. 复杂嵌套：`var a , b = 2 , c = 3 , d ;`

### 007 - AtLeastOne规则测试

**测试目标：**
- AtLeastOne至少匹配1次
- AtLeastOne匹配多次
- AtLeastOne匹配失败抛出异常
- AtLeastOne与其他规则组合

**测试用例：**
1. AtLeastOne匹配1次：`123`
2. AtLeastOne匹配多次：`123 456 789`
3. AtLeastOne匹配0次应该抛异常：``（空输入）
4. AtLeastOne的终止条件：`123 abc`
5. 逗号分隔列表：`1,2,3`（至少2个元素）
6. 列表至少1个元素的约束
7. AtLeastOne后跟固定token
8. 加法表达式：`1 + 2 + 3`

### 008 - 前瞻（Lookahead）功能测试（⭐重要）

**测试目标：**
- lookaheadAfter.not 字符串形式
- lookaheadAfter.not 正则形式
- 换行符处理
- 特殊字符处理
- 实际应用场景

**测试场景：**
1. **区分可选链 ?. 和三元运算符 ?**
   - 匹配可选链：`a?.b`
   - 匹配三元运算符：`a ? b : c`

2. **换行符前瞻（正则形式）**
   - 分号后面是空格：`a; b`
   - 分号后面是换行符：`a;\nb`

3. **数字后缀前瞻**
   - 纯整数：`123`
   - 浮点数：`123.45`（前瞻阻止Integer）
   - BigInt：`123n`（前瞻阻止Integer）

4. **关键字边界前瞻**
   - 关键字 in：`x in array`
   - 标识符 index：`index`（前瞻阻止关键字匹配）
   - 标识符 iffy：`iffy`（前瞻阻止关键字匹配）

5. **特殊字符前瞻**
   - 箭头函数：`a -> b`
   - 减法运算：`a - b`
   - 自增运算：`a++`
   - 加法运算：`a + b`

**关键发现：**
- ⚠️ 前瞻正则必须使用 `^` 锚点（如 `/^[a-zA-Z]/`），否则会匹配字符串中任意位置
- ⚠️ 关键字 token 必须放在 Identifier 之前
- 当前实现：✅ lookaheadAfter.not，❌ is/in/notIn 未实现

### 009 - 错误处理测试

**测试目标：**
- 错误信息格式
- ruleStack 追踪
- 位置信息准确性
- 智能修复建议
- 详细/简洁模式切换

**测试用例：**
1. 基本错误信息：`let x`（缺少分号）
2. RuleStack 追踪：`{ let x }`（嵌套错误）
3. 多行位置信息：`let x;\nlet y`
4. 智能建议：`func(`（缺少右括号）
5. 简洁模式（不生成建议）
6. EOF 错误：空输入

### 010 - Packrat缓存测试

**测试目标：**
- 缓存启用/禁用
- 缓存一致性验证
- 性能对比
- 复杂语法缓存收益

**测试用例：**
1. 缓存启用解析
2. 缓存禁用解析
3. 缓存一致性验证（结果应相同）
4. 复杂表达式：`1 + 2 + 3 + 4 + 5`
5. 性能对比（100次解析）
6. 深度嵌套：`((((1))))`

### 011 - Token前瞻方法测试

**测试目标：**
- curToken 访问
- Token消费后状态更新
- hasLineTerminatorBefore() 换行检测
- Lexer skip 机制

**测试用例：**
1. curToken 获取当前token
2. Token消费后前瞻更新
3. 连续消费token
4. 换行符检测：`abc\n123`
5. Lexer自动过滤skip token
6. Token类型判断
7. Token类型排除判断
8. if-else语句解析

### 012 - 边界情况测试

**测试目标：**
- 空输入处理
- 极限输入（1000+ tokens）
- 深度嵌套（500层）
- EOF边界
- 栈溢出保护

**测试用例：**
1. 空输入：``
2. 单token：`x`
3. 超长输入：1000个标识符
4. 深度嵌套：50层括号
5. 极深嵌套：500层括号
6. 长列表：1000个逗号分隔元素
7. EOF边界：消费所有token
8. Many规则空匹配

### 013 - CST结构测试

**测试目标：**
- CST节点结构验证
- Location信息准确性
- 嵌套CST结构
- CST辅助方法

**测试用例：**
1. 基本CST结构（使用 `debug('cst')`）
2. Location信息验证
3. Token vs Rule节点区分
4. 嵌套CST（使用 `debug('cst-detailed')`）
5. hasChild() 方法
6. getChild() 方法
7. getChildren() 方法
8. 空children优化

### CST Debug 功能示例

**文件：** `subhutiparsertest-cst-debug-example.ts`  
**用途：** 演示如何使用 CST 可视化功能

**输出示例：**
```
📊 CST 结构
└─VariableDeclaration [1:1-21]
   ├─LetTok: "let" [1:1-3]
   ├─Identifier: "sum" [1:5-7]
   ├─Eq: "=" [1:9-9]
   ├─Expression [1:11-19]
   │  ├─Number: "1" [1:11-11]
   │  ├─Plus: "+" [1:13-13]
   │  ├─Number: "2" [1:15-15]
   │  ├─Plus: "+" [1:17-17]
   │  └─Number: "3" [1:19-19]
   └─Semicolon: ";" [1:21-21]
```

## 预期结果

所有测试都应该通过。如果有测试失败，说明 SubhutiParser 有 Bug。

**当前状态：** ✅ 14个测试文件，88个测试用例，100%通过率

## 诊断 Slime Parser 问题

如果 Slime Parser 无法解析代码，按以下顺序运行测试：

```bash
# 1. 验证基础功能
npx tsx subhutiparsertest-token-001.ts

# 2. 验证Or规则
npx tsx subhutiparsertest-or-002.ts

# 3. ⭐ 关键测试：Or规则顺序
npx tsx subhutiparsertest-or-order-003.ts

# 如果测试3失败，说明问题在这里！
```

## 测试覆盖情况

### ✅ 已完整覆盖（88个测试用例）

| 功能模块 | 覆盖测试 | 测试数量 |
|---------|---------|---------|
| **基础功能** |  |  |
| Token消费 | 测试001 | 4 |
| Or规则（顺序选择） | 测试002, 003 | 9 |
| Many规则（0次或多次） | 测试004 | 7 |
| Option规则（0次或1次） | 测试005 | 5 |
| AtLeastOne规则（1次或多次） | 测试007 | 8 |
| **高级功能** |  |  |
| 回溯机制 | 测试002, 005, 012 | 涵盖 |
| 规则嵌套 | 测试006 | 5 |
| CST生成和结构 | 测试013 | 8 |
| **词法前瞻** |  |  |
| lookaheadAfter.not（字符串） | 测试008 | 6 |
| lookaheadAfter.not（正则） | 测试008 | 8 |
| 关键字边界前瞻 | 测试008 | 涵盖 |
| 数字后缀前瞻 | 测试008 | 涵盖 |
| **Token前瞻** |  |  |
| curToken访问 | 测试011 | 3 |
| hasLineTerminatorBefore | 测试011 | 1 |
| Lexer skip机制 | 测试011 | 1 |
| **错误处理** |  |  |
| ParsingError结构 | 测试009 | 6 |
| RuleStack追踪 | 测试009 | 涵盖 |
| 位置信息 | 测试009, 013 | 涵盖 |
| 智能建议 | 测试009 | 涵盖 |
| **性能和缓存** |  |  |
| Packrat缓存 | 测试010 | 6 |
| 缓存一致性 | 测试010 | 涵盖 |
| 性能对比 | 测试010 | 涵盖 |
| **边界情况** |  |  |
| 空输入 | 测试012 | 涵盖 |
| 超长输入（1000+） | 测试012 | 2 |
| 深度嵌套（500层） | 测试012 | 2 |
| EOF边界 | 测试012 | 涵盖 |
| **调试功能** |  |  |
| CST可视化 | 示例文件 | ✅ |
| debug('cst') 简洁模式 | 示例文件 | ✅ |
| debug('cst-detailed') 详细模式 | 示例文件 | ✅ |

### ❌ 未覆盖（可以后续添加）

- 左递归检测和防护
- 内存泄漏测试（长时间运行）
- **前瞻功能扩展：**
  - lookaheadAfter.is（后面必须是）
  - lookaheadAfter.in（后面必须在集合中）
  - lookaheadAfter.notIn（后面不能在集合中）
- 并发解析测试
- 大型语法性能基准测试

## CST Debug 功能详解

### 功能概述

SubhutiParser 内置了强大的 CST 可视化调试功能，无需额外工具即可查看解析树结构。

### 使用方法

```typescript
import SubhutiParser from "../src/SubhutiParser.ts"

// 方式1：简洁模式（推荐用于测试）
const parser1 = new MyParser(tokens).debug('cst')
const cst1 = parser1.MyRule()
// 自动输出：树形结构，Token节点显示位置

// 方式2：详细模式（用于深度调试）
const parser2 = new MyParser(tokens).debug('cst-detailed')
const cst2 = parser2.MyRule()
// 自动输出：完整树形结构，所有节点都显示位置

// 方式3：关闭调试（生产环境）
const parser3 = new MyParser(tokens).debug(false)
const cst3 = parser3.MyRule()
// 不输出任何调试信息
```

### 输出格式

**CST 模式 (`debug('cst')`)：**
- Token节点：显示名称、值和位置
- Rule节点：只显示名称
- 清晰的树形结构（Unicode 字符）
- 不输出执行追踪和性能信息

### 输出示例

```
📊 CST 结构
└─VariableDeclaration [1:1-21]
   ├─LetTok: "let" [1:1-3]
   ├─Identifier: "sum" [1:5-7]
   ├─Eq: "=" [1:9-9]
   ├─Expression [1:11-19]
   │  ├─Number: "1" [1:11-11]
   │  ├─Plus: "+" [1:13-13]
   │  ├─Number: "2" [1:15-15]
   │  ├─Plus: "+" [1:17-17]
   │  └─Number: "3" [1:19-19]
   └─Semicolon: ";" [1:21-21]
```

### 位置信息格式

- `[行:列-列]` - 单行（如 `[1:5-7]` 表示第1行第5-7列）
- `[行:列-行:列]` - 跨行（如 `[1:5-2:10]` 表示从第1行第5列到第2行第10列）

### 在测试中的应用

```typescript
// 测试 CST 结构是否正确
const parser = new TestParser(tokens).debug('cst')
const cst = parser.VariableDeclaration()

// 解析完成后会自动输出 CST 树形结构，类似：
// 📊 CST 结构
// └─VariableDeclaration
//    ├─LetTok: "let" [1:1-3]
//    ├─Identifier: "x" [1:5-5]
//    └─Expression
//       └─Number: "1" [1:7-7]

// 然后可以手动验证关键节点
if (cst && cst.hasChild('Expression')) {
  console.log('✅ 包含Expression节点')
}
```

### Debug 模式对比

| 模式 | 参数 | 输出内容 | 适用场景 |
|-----|------|---------|---------|
| 关闭 | `debug(false)` 或不调用 | 无输出 | 生产环境（默认） |
| 普通调试 | `debug(true)` | 规则进入/退出、Token消费、回溯、性能摘要 | 调试解析逻辑 |
| CST可视化 | `debug('cst')` | CST树形结构（Token显示位置） | 验证CST结构 |

## 贡献

如果发现 SubhutiParser 的 Bug，请：
1. 创建一个最小复现测试用例
2. 命名为 `subhutiparsertest-xxx-0XX.ts`
3. 放到 `tests/cases/` 目录
4. 运行 `npx tsx run-all-tests.ts` 验证

## License

与 SubhutiParser 主项目相同






















