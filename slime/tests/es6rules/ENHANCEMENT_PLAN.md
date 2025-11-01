
# 📋 ES6Parser 规则测试完善计划

**版本：** 1.0  
**日期：** 2025-11-01  
**目标：** 完善所有152个规则的测试用例，确保100%覆盖所有Or、Option、Many分支

---

## 🎯 总体目标

**当前进度：** 57/152 规则充分（37.5%）  
**剩余工作：** 95个规则待完善  
**目标完成度：** 100%（152/152）  
**预计时间：** 6-8小时  

---

## 📊 规则分类统计

### 按复杂度分类

| 复杂度 | 规则特征 | 数量 | 例子 | 预计时间/规则 |
|--------|--------|------|------|-------------|
| 🔴 高 | 多个Or分支 + Many | 15-20 | UnaryExpression, CallExpression | 20-30分 |
| 🟠 中 | Or分支 或 Many | 30-40 | BinaryExpressions, Statements | 10-15分 |
| 🟡 低 | Option 或单分支 | 50-60 | EmptyStatement, ThrowStatement | 5-10分 |
| 🟢 超简 | 直接映射 | 10-15 | ParenthesizedExpression | 2-5分 |

---

## 🔍 规则测试覆盖检查清单

### 每个规则需要检查的项

```
✓ Or规则覆盖：所有分支都有测试用例
✓ Option覆盖：有/无两种情况都有测试
✓ Many覆盖：0/1/多个都有测试
✓ 文档完整：包含规则位置、语法、目标
✓ 测试质量：8-15个测试用例
✓ 边界情况：嵌套、特殊符号、关键字
```

---

## 📝 高质量规则测试模板

### 标准结构

```javascript
/**
 * 规则测试：<规则名>
 * 
 * 位置：Es6Parser.ts Line <行号>
 * 分类：<分类>
 * 编号：<编号>
 * 
 * 规则特征：
 * ✓ 包含Or规则（<处数>）- <分支数>个分支
 * ✓ 包含Option（<处数>）
 * ✓ 包含Many（<处数>）
 * 
 * 规则语法：
 *   <规则名>:
 *     <分支1>
 *     <分支2>
 *     ...
 * 
 * 测试目标：
 * - 覆盖所有Or分支
 * - 验证Option有/无两种情况
 * - 验证Many的0/1/多个情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：<测试描述>
<代码>

// ✅ 测试2：<测试描述>
<代码>

// ... 更多测试

/* Es6Parser.ts: <EBNF语法> */
```

---

## 🚀 按优先级的完善顺序

### Priority 0 - 表达式类关键规则（12个）⭐

**目标：** 2小时内完成  
**规则编号：** 203-231

1. **203-NewMemberExpressionArguments** - new + arguments
   - Or分支：new MemberExpression Arguments
   - 测试：new Foo(a,b), new obj.Constructor()

2. **204-MemberExpression** - 成员访问链
   - Or分支：4个
   - Many分支：4个（dot、bracket、template）
   - 关键：链式访问 obj.a.b[c].d

3. **205-DotMemberExpression** - 点号成员访问
   - Or分支：标识符名
   - 关键：保留字属性名

4. **207-NewExpression** - new 表达式
   - Or分支：2个（MemberExpression, new NewExpression）

5. **208-CallExpression** - 函数调用链
   - Or分支：2个（MemberExpression Arguments, SuperCall）
   - Many分支：4个

6. **211-UnaryExpression** - 一元运算符 ⭐ 重点
   - Or分支：多个（++, --, +, -, !, ~, typeof, void, delete, await）
   - 关键：9个不同的一元运算符

7-12. **其他表达式规则**

### Priority 1 - 语句类规则（20个）

**目标：** 3-4小时内完成

- Block、If、While、For、Do-While
- Try-Catch、Switch、Labeled
- Break、Continue、Return、Throw

### Priority 2 - 函数&类规则（16个）

**目标：** 2-3小时内完成

- FunctionDeclaration、FunctionExpression
- GeneratorFunction、AsyncFunction
- MethodDefinition、ClassDeclaration
- Getter/Setter、Constructor

### Priority 3 - 其他规则（47个）

**目标：** 最后处理

- 模块相关、导入导出
- 其他标识符、绑定模式
- 其他辅助类

---

## 📋 完善检查清单

### 每轮完善前检查

- [ ] 查看Es6Parser.ts中的规则定义
- [ ] 识别所有Or分支
- [ ] 识别所有Option（可选）
- [ ] 识别所有Many（重复）
- [ ] 确定测试用例数量

### 每轮完善后验证

- [ ] 运行 `verify-rule-test.ts` 验证测试质量
- [ ] 检查代码往返正确性（原始代码 → 生成代码是否等价）
- [ ] 检查文档是否完整
- [ ] 记录完成时间

---

## 🔧 完善工具和命令

### 查看规则定义

```bash
# 在Es6Parser.ts中查找规则
grep -n "UnaryExpression()" path/to/Es6Parser.ts

# 查看规则周围的代码
sed -n '633,650p' path/to/Es6Parser.ts
```

### 运行验证

```bash
cd tests/es6rules
npx tsx verify-rule-test.ts
```

### 统计进度

```bash
node quick-check.js
```

---

## 📈 进度追踪

### 批次1：表达式类高优先级（预计2小时）
- [ ] 203-NewMemberExpressionArguments
- [ ] 204-MemberExpression
- [ ] 205-DotMemberExpression
- [ ] 207-NewExpression
- [ ] 208-CallExpression
- [ ] 211-UnaryExpression ⭐
- [ ] 226-FunctionExpression
- [ ] 227-GeneratorExpression
- [ ] 228-YieldExpression
- [ ] 229-AwaitExpression
- [ ] 230-ClassExpression
- [ ] 225-ExpressionStatement

**预期成果：** 57 → 69个规则（45.4%）

### 批次2：语句类核心规则（预计3小时）
- [ ] BlockStatement
- [ ] IfStatement
- [ ] ForStatement, ForInOfStatement
- [ ] WhileStatement, DoWhileStatement
- [ ] SwitchStatement
- [ ] TryStatement

**预期成果：** 69 → 85个规则（55.9%）

### 批次3：函数和类（预计2小时）
- [ ] FunctionDeclaration
- [ ] GeneratorDeclaration
- [ ] MethodDefinition
- [ ] ClassDeclaration

**预期成果：** 85 → 95个规则（62.5%）

### 批次4：其他规则（预计2小时）
- [ ] 模块相关规则
- [ ] 导入导出规则
- [ ] 其他辅助规则

**预期成果：** 95 → 152个规则（100%）

---

## 💡 高效完善技巧

### 1. 识别规则类型

**Or规则：** 需要每个分支至少一个测试
```javascript
// ✅ 测试1：Or分支1 - <描述>
<代码>

// ✅ 测试2：Or分支2 - <描述>
<代码>
```

**Option规则：** 需要有/无两种情况
```javascript
// ✅ 测试1：Option无 - <描述>
<代码>

// ✅ 测试2：Option有 - <描述>
<代码>
```

**Many规则：** 需要0/1/多种情况
```javascript
// ✅ 测试1：Many=0 - <描述>
<代码>

// ✅ 测试2：Many=1 - <描述>
<代码>

// ✅ 测试3：Many>=2 - <描述>
<代码>
```

### 2. 文档标准化

所有规则文档必须包含：
```
【头部信息】
- 规则名
- 位置（行号）
- 分类
- 编号

【规则特征】
- Or分支数量
- Option数量
- Many数量

【规则语法】
- EBNF表示

【测试目标】
- 明确的测试目标
```

### 3. 测试质量标准

**5星标准：**
- ✅ 8-15个测试用例
- ✅ 覆盖所有Or分支
- ✅ 覆盖Option有/无
- ✅ 覆盖Many的0/1/多
- ✅ 包含边界情况
- ✅ verify-rule-test 100%通过

---

## 🎯 关键成功因素

1. **系统性** - 按顺序完成，不跳过
2. **完整性** - 覆盖所有分支，不遗漏
3. **一致性** - 文档和代码风格统一
4. **可验证性** - 每个规则都能通过verify验证

---

## 📞 遇到问题时

### 问题1：无法确定规则的所有分支
**解决：** 在Es6Parser.ts中查找规则定义，复制Or/Option/Many代码到文档

### 问题2：测试不通过
**解决：** 运行 `verify-rule-test.ts` 查看详细错误信息

### 问题3：不知道该写什么测试
**解决：** 参考已完善的相似规则（如BitwiseANDExpression参考BitwiseORExpression）

---

## ✅ 完成标志

当达到以下条件时，可认为完成：
- [ ] 152/152规则都有测试文件
- [ ] 每个规则至少8个测试用例
- [ ] verify-rule-test.ts 至少95%通过
- [ ] 所有规则文档完整

---

**下一步：** 开始批次1的完善  
**预计完成时间：** 今天或明天  
**更新者：** AI  
**最后更新：** 2025-11-01
