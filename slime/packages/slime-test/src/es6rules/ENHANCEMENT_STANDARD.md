# 测试用例增强标准格式（v1.0）

## 📋 标准格式规范

### 第1部分：文件头注释

```javascript
/**
 * 规则测试：{RuleName}
 * 
 * 位置：Es2025Parser.ts Line {LineNumber}
 * 
 * 规则结构：{RuleName}() -> {规则完整结构说明}
 * 
 * 规则语法（EBNF）：
 *   {RuleName} ::= {直接从Es2025Parser.ts复制的规则伪代码}
 * 
 * 测试覆盖：
 * - ✅ {Or/Option/Many分支说明}
 * - ✅ {分支2说明}
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */
```

### 第2部分：测试注释格式

每个测试用例前添加规则路径注释：
```javascript
// ✅ 测试N：{简单描述}  {RuleName} (分支说明)
```

### 第3部分：尾部验证小结

文件末尾添加验证说明：
```javascript
/* 
 * ============================================
 * 规则验证小结：{RuleName}
 * ============================================
 * 规则包含的主要构造：
 * - {构造1}
 * - {构造2}
 * 
 * 分支覆盖情况：
 * - Or分支（如有）：{数量}个 - {分支名列表}
 * - Option分支（如有）：{数量}个 - {分支名列表}
 * - Many分支（如有）：{数量}个 - {分支名说明}
 * 
 * 验证状态：✅ 所有分支均已覆盖
 */
```

---

## 🎯 增强步骤

### Step 1: 更新文件头（5分钟）
1. 添加完整的规则结构说明
2. 明确标注Or/Option/Many分支
3. 添加创建时间和状态

### Step 2: 更新测试注释（3分钟）
1. 为每个测试添加规则路径注释
2. 标注涉及的分支
3. 保留原有的测试逻辑

### Step 3: 添加尾部验证（2分钟）
1. 统计规则的所有分支数量
2. 列出分支名称
3. 确认覆盖完整性

**总耗时：约10分钟/文件**

---

## 📊 优先级规则

**第1优先级（关键规则，需最先完善）：**
- Program, Declaration, Expression, Statement, PropertyDefinition
- ImportDeclaration, ExportDeclaration, ClassDeclaration
- ArrowFunction, FunctionDeclaration, GeneratorDeclaration

**第2优先级（重要规则）：**
- 所有 Expression 子规则（Binary、Unary、Conditional等）
- 所有 Binding 规则（BindingPattern、BindingElement等）
- 所有 Statement 子规则

**第3优先级（其他规则）：**
- 辅助规则、列表规则、参数规则等

---

## ✅ 质量检查清单

- [ ] 文件头包含规则位置和Line号
- [ ] 规则结构描述准确无误
- [ ] 明确列出所有Or分支（如有）
- [ ] 明确列出所有Option分支（如有）
- [ ] 明确列出所有Many分支（如有）
- [ ] 每个测试都有规则路径注释
- [ ] 尾部验证小结完整
- [ ] 验证状态标记为 ✅
- [ ] 测试用例通过往返验证（Parser → CST → AST → Generator → Code）

---

## 📈 批量应用工具

**使用 enhance-all-rules.ts 工具：**
```bash
npx tsx enhance-all-rules.ts --priority 1  # 优先级1规则
npx tsx enhance-all-rules.ts --priority 2  # 优先级2规则
npx tsx enhance-all-rules.ts --priority 3  # 优先级3规则
npx tsx enhance-all-rules.ts --all         # 全部规则
```

---

## 📝 完善进度跟踪

| 优先级 | 规则数 | 完成数 | 进度 | 预期完成 |
|-------|--------|--------|------|---------|
| P1 | 13 | 0 | 0% | 2小时 |
| P2 | 50 | 0 | 0% | 8小时 |
| P3 | 89 | 0 | 0% | 15小时 |
| **总计** | **152** | **0** | **0%** | **25小时** |

---

**最后更新：2025-11-01**
