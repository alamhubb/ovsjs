# 第1组（10个规则）增强计划

## 规则列表及增强方案

### 1. Expression-001.js
**规则结构：** `Expression -> this.Many()`
**Or分支：** 无
**Option分支：** 无  
**Many分支：** 1个 - AssignmentExpression的逗号分隔列表（0/1/多个）

**增强点：**
- [x] 已有注释头
- [ ] 需要按照标准格式更新文件头
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 2. Declaration-001.js
**规则结构：** `Declaration -> this.Or`
**Or分支：** 5个 - FunctionDeclaration, GeneratorDeclaration, AsyncFunctionDeclaration, ClassDeclaration, LexicalDeclaration
**Option分支：** 无
**Many分支：** 无（在LexicalDeclaration中有Many）

**增强点：**
- [x] 已有注释头
- [ ] 需要标注Or的5个分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 3. BindingPattern-001.js
**规则结构：** `BindingPattern -> this.Or`
**Or分支：** 2个 - ObjectBindingPattern, ArrayBindingPattern
**Option分支：** 无
**Many分支：** 无

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Or的2个分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 4. Program-001.js
**规则结构：** `Program -> this.Or`
**Or分支：** 2个 - SourceElements/ModuleItems
**Option分支：** 无
**Many分支：** 1个

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Or/Many的分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 5. GeneratorDeclaration-001.js
**规则结构：** `GeneratorDeclaration -> tokens + BindingIdentifier + FunctionFormalParametersBodyDefine`
**Or分支：** 无
**Option分支：** 1个 - AsyncTok（可选）
**Many分支：** 无

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Option分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 6. Catch-001.js
**规则结构：** `Catch -> tokenConsumer.CatchTok + CatchParameter + Block`
**Or分支：** 无
**Option分支：** 无
**Many分支：** 无

**增强点：**
- [ ] 需要检查现有测试
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 7. MultiplicativeExpression-001.js
**规则结构：** `MultiplicativeExpression -> this.Many`
**Or分支：** 1个 - 在Many中的Or（3个操作符：*, /, %）
**Option分支：** 无
**Many分支：** 1个 - 乘除运算符的重复

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Many和Or的分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 8. ArrowFunction-001.js
**规则结构：** `ArrowFunction -> Option(AsyncTok) + Or(parameters)`
**Or分支：** 3个 - Identifier, CoverParenthesizedExpressionAndArrowParameterList, AsyncTok
**Option分支：** 1个 - AsyncTok
**Many分支：** 无

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Or/Option的分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 9. PropertyDefinition-001.js
**规则结构：** `PropertyDefinition -> this.Or`
**Or分支：** 多个 - shorthand, PropertyName: value, ...
**Option分支：** 无
**Many分支：** 无

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Or的所有分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

### 10. BitwiseANDExpression-001.js
**规则结构：** `BitwiseANDExpression -> this.Many`
**Or分支：** 无
**Option分支：** 无
**Many分支：** 1个 - &操作符的重复

**增强点：**
- [ ] 需要检查现有测试
- [ ] 标注Many的分支
- [ ] 为每个测试加规则路径注释
- [ ] 添加尾部验证小结

---

## 增强标准格式示例

### 文件头注释示例
```javascript
/**
 * 规则测试：RuleName
 * 
 * 位置：Es6Parser.ts Line XXX
 * 规则结构：RuleName -> 规则的完整结构说明
 * 
 * 规则语法：
 *   直接从Es6Parser.ts复制的规则代码
 * 
 * 测试覆盖：
 * - ✅ Or分支/Option分支/Many分支的说明
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */
```

### 测试注释示例
```javascript
// ✅ 测试1：描述    RuleName -> 规则路径 (分支说明)
```

### 尾部验证示例
```javascript
/* 
 * 规则验证小结：
 * - 规则包含的构造说明
 * - 每个分支的覆盖情况
 */
```

---

## 总进度
- [ ] Expression
- [ ] Declaration
- [ ] BindingPattern
- [ ] Program
- [ ] GeneratorDeclaration
- [ ] Catch
- [ ] MultiplicativeExpression
- [ ] ArrowFunction
- [ ] PropertyDefinition
- [ ] BitwiseANDExpression
