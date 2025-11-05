# 🚀 规则测试系统化增强指南

**日期：** 2025-11-01  
**目标：** 快速、系统地完善全部152个规则测试  
**当前进度：** 57个规则已充分 → 目标：120+个规则

---

## 📊 实际完善成果（截至目前）

已完善的规则：
1. ✅ 211-UnaryExpression - 15个测试用例
2. ✅ 208-CallExpression - 15个测试用例
3. ✅ 405-IfStatement - 15个测试用例

**今日目标：** 再完善10-15个关键规则，达到70-80个规则充分覆盖

---

## 📝 待完善规则清单（优先级排序）

### 🔴 高优先级 - 核心规则（需完善）

#### 表达式类（5个）
- [ ] 204-MemberExpression - 成员访问链（15分钟）
- [ ] 207-NewExpression - new表达式（10分钟）
- [ ] 226-FunctionExpression - 函数表达式（10分钟）
- [ ] 230-ClassExpression - 类表达式（10分钟）
- [ ] 225-ExpressionStatement - 表达式语句（8分钟）

#### 语句类（8个）
- [ ] 408-WhileStatement - while循环（10分钟）
- [ ] 409-ForStatement - for循环（15分钟）
- [ ] 410-ForInOfStatement - for-in/of循环（15分钟）
- [ ] 407-DoWhileStatement - do-while循环（8分钟）
- [ ] 416-SwitchStatement - switch语句（15分钟）
- [ ] 419-TryStatement - try-catch语句（15分钟）
- [ ] 301-BlockStatement - 块语句（8分钟）
- [ ] 403-BlockStatement - 块语句（重复？）（5分钟）

#### 函数&类（6个）
- [ ] 501-FunctionDeclaration - 函数声明（10分钟）
- [ ] 506-GeneratorDeclaration - 生成器声明（10分钟）
- [ ] 605-ClassDeclaration - 类声明（10分钟）
- [ ] 604-MethodDefinition - 方法定义（12分钟）
- [ ] 608-ClassBody - 类体（10分钟）
- [ ] 609-ClassElementList - 类元素列表（8分钟）

### 🟠 中优先级 - 补充规则（可完善）

#### 绑定&解构（5-8个）
- [ ] 106-BindingPattern - 绑定模式
- [ ] 107-ObjectBindingPattern - 对象绑定
- [ ] 108-ArrayBindingPattern - 数组绑定
- [ ] 109-BindingPropertyList - 绑定属性列表
- [ ] 110-BindingElementList - 绑定元素列表

#### 其他语句（5个）
- [ ] 316-LabelledStatement - 标记语句
- [ ] 317-SwitchStatement - switch
- [ ] 415-WithStatement - with语句
- [ ] 420-DebuggerStatement - debugger
- [ ] 421-FunctionFormalParameters - 函数参数

---

## 🎯 快速完善策略

### 策略1：模板复用（2分钟/规则）

对于相似的规则，复用已完善规则的结构：

```javascript
// ✅ 简单复制模板
const template = {
    "header": "复制自RULE_XXX的头部",
    "tests": [
        "// ✅ 测试1：Or分支1 - ...",
        "// ✅ 测试2：Or分支2 - ...",
        "// ... (8-10个测试)"
    ]
}
```

**已完善的模板规则：**
- CallExpression（表达式链式调用）
- IfStatement（条件语句）
- UnaryExpression（一元运算符）

### 策略2：规则对应复制（3分钟/规则）

对于成对的规则（如FunctionDeclaration vs FunctionExpression），复用测试思路：

**成对规则：**
- 301-BlockStatement ↔ 403-BlockStatement
- 407-DoWhileStatement ↔ 306-IterationStatementDoWhile
- 408-WhileStatement ↔ 306-IterationStatementWhile

### 策略3：分类批量完善（15分钟/批）

按规则类别分批完善，相似规则一起做：

**第1批：循环语句（30分钟）**
- While, Do-While, For, For-In/Of

**第2批：语句块和控制（25分钟）**
- BlockStatement, TryStatement, SwitchStatement

**第3批：函数声明（20分钟）**
- FunctionDeclaration, GeneratorDeclaration

---

## 📋 每个规则的标准完善流程

### Step 1：查看Parser规则（2分钟）

```bash
grep -A 30 "RuleName() {" Es2025Parser.ts
```

识别：
- Or分支数和内容
- Option位置
- Many位置和类型

### Step 2：查看是否已有测试（1分钟）

```bash
cat 05-statements/405-IfStatement.js | head -30
```

### Step 3：编写测试（5-10分钟）

使用标准模板：
```javascript
/**
 * 规则测试：RuleName
 * 规则特征：
 * ✓ Or分支：X处
 * ✓ Option：X处
 * ✓ Many：X处
 */

// ✅ 测试1：...
// ✅ 测试2：...
```

### Step 4：验证（1分钟）

```bash
npx tsx verify-rule-test.ts | grep "RuleName"
```

---

## ⚡ 最快完善方式

### 5分钟速成规则（超简单规则）

**特征：** 直接映射、无分支、无选项

**例如：**
- 420-DebuggerStatement
- 313-ReturnStatement
- 312-BreakStatement

```javascript
// 模板（8个基础测试）
// ✅ 测试1：在函数中
// ✅ 测试2：在循环中
// ✅ 测试3：在块中
// ... 共8个
```

### 10分钟标准规则（单Or或单Option）

**特征：** 单个Or分支或Option选项

**例如：**
- 407-DoWhileStatement
- 225-ExpressionStatement
- 301-BlockStatement

**流程：**
1. 复制已完善的相似规则
2. 调整测试内容
3. 保留结构和数量（8-15个）

### 15分钟复杂规则（多Or+Many）

**特征：** 多个分支、多个选项、递归

**例如：**
- 408-WhileStatement
- 409-ForStatement
- 416-SwitchStatement

**流程：**
1. 逐分支编写测试
2. 验证Many的0/1/多
3. 至少15个测试用例

---

## 🎯 今日目标规划

### 上午（预计2小时）
- [x] 分析剩余规则
- [x] 创建完善计划
- [x] 完善3个关键规则（UnaryExpression、CallExpression、IfStatement）
- [ ] 完善5个快速规则（40分钟）
  - [ ] BlockStatement
  - [ ] ExpressionStatement
  - [ ] ReturnStatement
  - [ ] BreakStatement
  - [ ] ContinueStatement

### 下午（预计3小时）
- [ ] 完善8个中等规则（100分钟）
  - [ ] WhileStatement
  - [ ] DoWhileStatement
  - [ ] ForStatement
  - [ ] ForInOfStatement
  - [ ] FunctionDeclaration
  - [ ] ClassDeclaration
  - [ ] TryStatement
  - [ ] SwitchStatement

### 晚上（预计2小时）
- [ ] 完善5个表达式规则（50分钟）
  - [ ] MemberExpression
  - [ ] NewExpression
  - [ ] FunctionExpression
  - [ ] ClassExpression
  - [ ] GeneratorExpression

- [ ] 验证和总结（30分钟）
  - [ ] 运行 verify-rule-test.ts
  - [ ] 统计进度
  - [ ] 更新 project.mdc

**预期成果：** 57 → 80-85个规则（52-56%）

---

## 🔧 快捷命令速查

### 快速查看规则

```bash
# 在Es2025Parser.ts中查找规则
grep -n "RuleName()" slime-parser/src/language/es2015/Es2025Parser.ts

# 查看规则详情
sed -n '行号,行号+30p' slime-parser/src/language/es2015/Es2025Parser.ts
```

### 快速验证

```bash
# 验证单个规则
npx tsx verify-rule-test.ts | grep "规则编号"

# 统计进度
node quick-check.js
```

### 快速编辑

```bash
# 打开测试文件
code 05-statements/405-IfStatement.js

# 运行单个测试
npx tsx test-runner.ts tests/es6rules/05-statements/405-IfStatement.js
```

---

## 📊 进度追踪

**开始时间：** 2025-11-01  
**已完善：** 3个规则 (UnaryExpression, CallExpression, IfStatement)  
**目标：** 80+个规则在本会话完成  

**关键里程碑：**
- [ ] 完成快速规则（5个）→ 62个规则
- [ ] 完成中等规则（8个）→ 70个规则  
- [ ] 完成表达式规则（5个）→ 75个规则
- [ ] 完成补充规则（10个）→ 85个规则 ✅ 目标

---

## 💡 遇到问题

**问题：** 不知道规则有多少分支
**解决：** `grep -A 50 "RuleName() {" Es2025Parser.ts | grep -c "alt: ()"`

**问题：** 测试写得不够全面
**解决：** 参考已完善的规则，至少8-15个测试，覆盖所有分支

**问题：** 验证失败
**解决：** 检查生成代码的语法正确性，通常是括号或分号问题

---

**最后更新：** 2025-11-01  
**下一步：** 继续批量完善中等规则
