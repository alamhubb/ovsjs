# 第1优先级规则完善计划（P1）

**完善标准：** 每个规则添加完整的文件头、测试注释、尾部验证  
**预期耗时：** 2-3小时  
**优先级理由：** 这些是Parser的最关键规则，是所有其他规则的基础

---

## 📋 待完善规则清单（13个）

### 1. Program-001.js ⭐⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `Program -> SourceElements | ModuleItems`  
**Or分支：** 2个（SourceElements, ModuleItems）  
**Many分支：** 1个（多个项目）  
**完善要点：**
- [ ] 添加完整文件头（规则结构、Or分支说明）
- [ ] 为每个测试添加规则路径注释
- [ ] 测试覆盖：空Program、单项、多项、混合等
- [ ] 添加尾部验证小结

**预期时间：** 15分钟

---

### 2. Declaration-001.js ⭐⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `Declaration -> Or(5个)`  
**Or分支：** 5个（FunctionDeclaration, GeneratorDeclaration, AsyncFunctionDeclaration, ClassDeclaration, LexicalDeclaration）  
**完善要点：**
- [ ] 标注Or的5个分支
- [ ] 为每个测试标记对应的分支
- [ ] 测试覆盖：所有5个分支各至少1个
- [ ] 添加尾部验证小结

**预期时间：** 15分钟

---

### 3. Statement-001.js ⭐⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `Statement -> Or(多个语句类型)`  
**Or分支：** 多个（BlockStatement, VariableStatement, ExpressionStatement等）  
**完善要点：**
- [ ] 列出所有Or分支
- [ ] 为每个测试标记对应的分支
- [ ] 覆盖主要语句类型
- [ ] 添加尾部验证小结

**预期时间：** 15分钟

---

### 4. PropertyDefinition-001.js ⭐⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `PropertyDefinition -> Or(5+个)`  
**Or分支：** 多个（SpreadElement, shorthand, PropertyName: value, MethodDefinition等）  
**完善要点：**
- [ ] 列出所有Or分支
- [ ] 测试覆盖：spread、shorthand、常规属性、方法、getter/setter等
- [ ] 添加尾部验证小结

**预期时间：** 15分钟

---

### 5. ImportDeclaration-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `ImportDeclaration -> import ImportClause FromClause ;`  
**Option分支：** 1个（ImportClause可选）  
**完善要点：**
- [ ] 添加完整文件头
- [ ] 测试覆盖：default import、named import、namespace import、混合等
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 6. ExportDeclaration-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `ExportDeclaration -> Or(...)`  
**Or分支：** 多个（export default, export named, export from等）  
**完善要点：**
- [ ] 标注Or的所有分支
- [ ] 测试覆盖：所有主要导出形式
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 7. ClassDeclaration-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `ClassDeclaration -> class Identifier [extends Expression] { ClassBody }`  
**Option分支：** 2个（类名、extends）  
**完善要点：**
- [ ] 测试覆盖：基础类、继承类、无继承等
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 8. FunctionDeclaration-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `FunctionDeclaration -> function Identifier(Params) { Body }`  
**完善要点：**
- [ ] 测试覆盖：无参、单参、多参、default参数、rest参数、解构参数
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 9. GeneratorDeclaration-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `GeneratorDeclaration -> function* Identifier(...)`  
**Option分支：** 可能有async修饰符  
**完善要点：**
- [ ] 测试覆盖：基础generator、async generator
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 10. ArrowFunction-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `ArrowFunction -> [async] (params) => body`  
**Or分支：** 参数形式的多个分支（单参、多参、解构等）  
**完善要点：**
- [ ] 标注Or分支
- [ ] 测试覆盖：所有参数形式、body形式
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 11. BindingPattern-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `BindingPattern -> ObjectBindingPattern | ArrayBindingPattern`  
**Or分支：** 2个  
**完善要点：**
- [ ] 测试覆盖：对象解构、数组解构
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

### 12. Expression-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `Expression -> Many(逗号分隔AssignmentExpression)`  
**Many分支：** 1个  
**状态：** ✅ 已完善（查看文件可参考格式）  

---

### 13. AssignmentExpression-001.js ⭐⭐
**位置：** Es2025Parser.ts Line XXX  
**规则结构：** `AssignmentExpression -> ConditionalExpression | LeftHandSideExpression = AssignmentExpression | ...`  
**Or分支：** 多个赋值操作符  
**完善要点：**
- [ ] 列出所有Or分支（=, +=, -=, *=等）
- [ ] 测试覆盖：所有赋值操作符
- [ ] 添加尾部验证小结

**预期时间：** 10分钟

---

## 📊 完善工作流程

### 对于每个文件：

**Step 1: 检查现状（2分钟）**
```bash
head -20 RuleName-001.js
```
- 查看现有的文件头格式
- 检查测试是否有规则路径注释
- 是否有尾部验证

**Step 2: 提取规则信息（3分钟）**
- 从Es2025Parser.ts查找规则定义
- 记下规则位置（Line号）
- 列出所有Or/Option/Many分支

**Step 3: 更新文件头（3分钟）**
- 使用标准格式更新或补充文件头
- 添加规则结构说明
- 明确列出所有分支

**Step 4: 更新测试注释（2分钟）**
- 为每个测试添加规则路径注释
- 标注涉及的分支

**Step 5: 添加尾部验证（2分钟）**
- 统计分支数量
- 添加尾部验证小结

**总计：约12分钟/文件 × 13个 = 2.5小时**

---

## ✅ 质量检查清单

每个文件完善后检查：

- [ ] 文件头完整（规则名、位置、结构、分支）
- [ ] 所有Or分支都被明确列出
- [ ] 所有Option分支都被明确列出
- [ ] 所有Many分支都被明确说明
- [ ] 每个测试都有规则路径注释
- [ ] 测试覆盖所有重要分支
- [ ] 尾部验证小结完整
- [ ] 验证状态标记为 ✅
- [ ] 测试能通过往返验证

---

## 🎯 优先完善顺序

1. **Program** - 最顶层规则，基础最重要
2. **Declaration** - 5个分支，覆盖所有声明
3. **Statement** - 多个语句类型
4. **PropertyDefinition** - 对象属性多个分支
5. **ImportDeclaration** - 模块系统基础
6. **ExportDeclaration** - 模块系统基础
7. **ClassDeclaration** - 重要声明
8. **FunctionDeclaration** - 重要声明
9. **GeneratorDeclaration** - ES6特性
10. **ArrowFunction** - ES6特性
11. **BindingPattern** - 解构基础
12. **AssignmentExpression** - 赋值表达式
13. **Expression** - 已完善（参考）

---

**最后更新：2025-11-01**
