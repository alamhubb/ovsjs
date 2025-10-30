# Switch 语句问题深度分析

**分析时间：** 2025-10-30  
**问题：** switch 语句生成代码为 `switch (){}` - discriminant 和 cases 全部丢失

---

## 🔍 问题层级定位

### ✅ Lexer 层（词法分析）- 正常
**验证：** Token 数量 39 个（包含 switch, case, default, break 等所有关键字）  
**结论：** 词法分析正常，所有 token 都被正确识别

---

### ✅ Parser 层（语法分析）- 正常

**Parser 规则定义（Es5Parser.ts line 676-727）：**

```typescript
SwitchStatement() {
  this.tokenConsumer.SwitchTok();     // switch 关键字
  this.tokenConsumer.LParen();        // (
  this.Expression();                  // discriminant - 判断表达式（如 x）
  this.tokenConsumer.RParen();        // )
  this.CaseBlock();                   // case 块
}

CaseBlock() {
  this.tokenConsumer.LBrace();        // {
  this.Option(() => {
    this.CaseClauses();               // 第一组 case
  });
  this.Option(() => {
    this.DefaultClause();             // default 子句
  });
  this.Option(() => {
    this.CaseClauses();               // default 后的 case
  });
  this.tokenConsumer.RBrace();        // }
}

CaseClause() {
  this.tokenConsumer.CaseTok();       // case 关键字
  this.Expression();                  // case 的值（如 1, 2）
  this.tokenConsumer.Colon();         // :
  this.Option(() => {
    this.StatementList();             // case 的语句
  });
}

DefaultClause() {
  this.tokenConsumer.DefaultTok();    // default 关键字
  this.tokenConsumer.Colon();         // :
  this.Option(() => {
    this.StatementList();             // default 的语句
  });
}
```

**结论：** Parser 规则定义完整且正确，应该能生成正确的 CST

---

### ❌ SlimeCstToAst 层（AST 转换）- **有问题！**

**当前实现（SlimeCstToAstUtil.ts line 1594-1602）：**

```typescript
/**
 * 创建 switch 语句 AST
 */
createSwitchStatementAst(cst: SubhutiCst): any {
  checkCstName(cst, Es6Parser.prototype.SwitchStatement.name);
  return {
    type: SlimeAstType.SwitchStatement,
    discriminant: null,  // ❌ TODO - 未实现！
    cases: [],           // ❌ TODO - 未实现！
    loc: cst.loc
  }
}
```

**问题：**
- ❌ **只是一个 TODO 占位符！**
- ❌ discriminant 硬编码为 `null`
- ❌ cases 硬编码为 `[]`
- ❌ 没有从 CST 中提取任何信息

**这就是问题的根源！**

---

### ✅ SlimeGenerator 层（代码生成）- 正常

**Generator 实现（SlimeGenerator.ts line 1475-1485）：**

```typescript
private static generatorSwitchStatement(node: any) {
  this.addCode(es6TokensObj.SwitchTok)
  this.addSpacing()
  this.addCode(es6TokensObj.LParen)
  this.generatorNode(node.discriminant)  // ✅ 正确
  this.addCode(es6TokensObj.RParen)
  this.addCode(es6TokensObj.LBrace)
  if (node.cases) {
    this.generatorNodes(node.cases)      // ✅ 正确
  }
  this.addCode(es6TokensObj.RBrace)
}
```

**结论：** Generator 逻辑完全正确，只是接收到的 AST 节点是空的

---

## 🔬 CST 结构分析

### SwitchStatement 的 CST 结构

根据 Parser 规则，CST 应该是：

```javascript
{
  name: "SwitchStatement",
  children: [
    { name: "SwitchTok", ... },      // children[0] - switch 关键字
    { name: "LParen", ... },         // children[1] - (
    { name: "Expression", ... },     // children[2] - discriminant 表达式
    { name: "RParen", ... },         // children[3] - )
    { name: "CaseBlock", ... }       // children[4] - case 块
  ]
}
```

### CaseBlock 的 CST 结构

```javascript
{
  name: "CaseBlock",
  children: [
    { name: "LBrace", ... },         // children[0] - {
    { name: "CaseClauses", ... },    // children[1] - 第一组 case（可选）
    { name: "DefaultClause", ... },  // children[2] - default（可选）
    { name: "CaseClauses", ... },    // children[3] - 第二组 case（可选）
    { name: "RBrace", ... }          // children[4] - }
  ]
}
```

### CaseClause 的 CST 结构

```javascript
{
  name: "CaseClause",
  children: [
    { name: "CaseTok", ... },        // children[0] - case 关键字
    { name: "Expression", ... },     // children[1] - case 的值
    { name: "Colon", ... },          // children[2] - :
    { name: "StatementList", ... }   // children[3] - 语句列表（可选）
  ]
}
```

---

## 💡 修复方案

### 需要实现的方法

#### 1. createSwitchStatementAst（主方法）

```typescript
createSwitchStatementAst(cst: SubhutiCst): any {
  checkCstName(cst, Es6Parser.prototype.SwitchStatement.name);
  
  // CST 结构：
  // children[0]: SwitchTok
  // children[1]: LParen
  // children[2]: Expression - discriminant
  // children[3]: RParen
  // children[4]: CaseBlock
  
  const discriminant = cst.children[2] 
    ? this.toExpression(cst.children[2]) 
    : null;
  
  const caseBlock = cst.children[4];
  const cases = this.extractCases(caseBlock);
  
  return {
    type: SlimeAstType.SwitchStatement,
    discriminant: discriminant,
    cases: cases,
    loc: cst.loc
  }
}
```

#### 2. extractCases（辅助方法）

```typescript
private extractCases(caseBlockCst: SubhutiCst): any[] {
  if (!caseBlockCst || !caseBlockCst.children) return [];
  
  const cases: any[] = [];
  
  // CaseBlock children:
  // [0]: LBrace
  // [1]: CaseClauses (可选)
  // [2]: DefaultClause (可选)
  // [3]: CaseClauses (可选)
  // [4]: RBrace
  
  caseBlockCst.children.forEach(child => {
    if (child.name === 'CaseClauses') {
      // 处理多个 CaseClause
      child.children.forEach(caseClause => {
        cases.push(this.createSwitchCaseAst(caseClause));
      });
    } else if (child.name === 'DefaultClause') {
      // 处理 default
      cases.push(this.createSwitchCaseAst(child));
    }
  });
  
  return cases;
}
```

#### 3. createSwitchCaseAst（创建 case/default）

```typescript
createSwitchCaseAst(cst: SubhutiCst): any {
  // CaseClause 或 DefaultClause
  
  let test = null;
  let consequent = [];
  
  if (cst.name === 'CaseClause') {
    // children[0]: CaseTok
    // children[1]: Expression - test
    // children[2]: Colon
    // children[3]: StatementList (可选)
    test = cst.children[1] ? this.toExpression(cst.children[1]) : null;
    consequent = cst.children[3] ? this.toStatementList(cst.children[3]) : [];
  } else if (cst.name === 'DefaultClause') {
    // children[0]: DefaultTok
    // children[1]: Colon
    // children[2]: StatementList (可选)
    test = null;  // default 没有 test
    consequent = cst.children[2] ? this.toStatementList(cst.children[2]) : [];
  }
  
  return {
    type: SlimeAstType.SwitchCase,
    test: test,
    consequent: consequent,
    loc: cst.loc
  }
}
```

---

## 📋 需要修改的位置

| 文件 | 方法 | 行号 | 改动类型 |
|------|------|------|---------|
| SlimeCstToAstUtil.ts | createSwitchStatementAst | 1594-1602 | 实现方法 |
| SlimeCstToAstUtil.ts | extractCases | 新增 | 添加辅助方法 |
| SlimeCstToAstUtil.ts | createSwitchCaseAst | 新增 | 添加方法 |

---

## 🎯 修复难度评估

### 难度：⭐⭐⭐⭐ 中高（需要理解 CST 结构）

**复杂点：**
1. 需要理解 CaseBlock 的复杂结构（3个 Option）
2. 需要正确提取 CaseClauses 和 DefaultClause
3. 需要处理 StatementList
4. 需要区分 CaseClause 和 DefaultClause

### 预计时间：1-2小时

**任务分解：**
1. 分析 CST 结构（30分钟）
2. 实现 createSwitchStatementAst（30分钟）
3. 实现 extractCases 和 createSwitchCaseAst（30分钟）
4. 测试和调试（30分钟）

---

## 🧪 测试用例

### 测试1：简单 switch
```javascript
switch (x) {
  case 1:
    break;
  case 2:
    break;
}
```

### 测试2：包含 default
```javascript
switch (x) {
  case 1:
    break;
  default:
    break;
}
```

### 测试3：复杂 switch
```javascript
switch (x) {
  case 1:
  case 2:
    console.log('1 or 2');
    break;
  case 3:
    console.log('3');
    break;
  default:
    console.log('other');
}
```

---

## 📊 问题总结

| 层级 | 状态 | 问题 |
|------|------|------|
| Lexer | ✅ 正常 | - |
| Parser | ✅ 正常 | 规则定义完整 |
| **SlimeCstToAst** | **❌ 有问题** | **createSwitchStatementAst 只是 TODO 占位符** |
| SlimeGenerator | ✅ 正常 | 逻辑完全正确 |

**根本原因：** `createSwitchStatementAst` 方法未实现，只返回了空的 TODO 占位符

---

## 🎯 是否修复？

**选项1：** 现在修复 switch 问题
- 难度：⭐⭐⭐⭐
- 时间：1-2小时
- 文件：SlimeCstToAstUtil.ts

**选项2：** 记录为已知限制，以后修复
- 当前 SlimeGenerator 的所有修复已完成
- Switch 问题单独立项

---

**问题分析已完成！**  
**根因：** SlimeCstToAst.createSwitchStatementAst 方法未实现（TODO 占位符）  
**影响范围：** 所有 switch 语句无法正确生成  
**修复位置：** `slime/packages/slime-parser/src/language/SlimeCstToAstUtil.ts`

**是否需要现在修复？** 🤔

