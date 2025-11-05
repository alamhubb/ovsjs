# SubhutiParser 测试套件

完整测试 SubhutiParser 的所有核心功能，从简单到复杂逐步验证。

## 测试用例列表

| 编号 | 文件名 | 测试内容 | 重要性 |
|-----|--------|---------|--------|
| 001 | `subhutiparsertest-token-001.ts` | 基础Token消费 | ⭐⭐⭐ |
| 002 | `subhutiparsertest-or-002.ts` | Or规则基础测试 | ⭐⭐⭐ |
| 003 | `subhutiparsertest-or-order-003.ts` | Or规则顺序问题（关键） | ⭐⭐⭐⭐⭐ |
| 004 | `subhutiparsertest-many-004.ts` | Many规则测试 | ⭐⭐⭐ |
| 005 | `subhutiparsertest-option-005.ts` | Option规则测试 | ⭐⭐⭐ |
| 006 | `subhutiparsertest-nested-006.ts` | 嵌套规则测试 | ⭐⭐⭐⭐ |
| 007 | `subhutiparsertest-atleastone-007.ts` | AtLeastOne规则测试 | ⭐⭐⭐ |
| 008 | `subhutiparsertest-lookahead-008.ts` | 前瞻（Lookahead）功能测试 | ⭐⭐⭐⭐⭐ |

## 快速开始

### 运行所有测试

```bash
cd subhuti/tests
npx tsx run-all-tests.ts
```

### 运行单个测试

```bash
cd subhuti/tests
npx tsx subhutiparsertest-token-001.ts
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

## 预期结果

所有测试都应该通过。如果有测试失败，说明 SubhutiParser 有 Bug。

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

## 测试覆盖的功能

✅ **已覆盖：**
- Token消费（测试001）
- Or规则（顺序选择）（测试002, 003）
- Many规则（0次或多次）（测试004）
- Option规则（0次或1次）（测试005）
- AtLeastOne规则（1次或多次）（测试007）
- 回溯机制（测试002, 005）
- 规则嵌套（测试006）
- CST生成（测试001-006）
- **前瞻功能（测试008）**
  - ✅ lookaheadAfter.not（字符串和正则）
  - ✅ 换行符前瞻
  - ✅ 关键字边界前瞻
  - ✅ 数字后缀前瞻
  - ✅ 特殊字符前瞻

❌ **未覆盖（可以后续添加）：**
- 错误处理和恢复
- Packrat缓存机制
- 性能测试
- 内存泄漏测试
- 左递归检测
- **前瞻功能扩展：**
  - lookaheadAfter.is（后面必须是）
  - lookaheadAfter.in（后面必须在集合中）
  - lookaheadAfter.notIn（后面不能在集合中）

## 贡献

如果发现 SubhutiParser 的 Bug，请：
1. 创建一个最小复现测试用例
2. 命名为 `subhutiparsertest-xxx-00X.ts`
3. 添加到测试套件中

## License

与 SubhutiParser 主项目相同






















