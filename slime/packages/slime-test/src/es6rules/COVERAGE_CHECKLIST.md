# 📋 ES6 Parser 152规则 - 分支完全覆盖检查清单

**目标：** 确保所有152个规则都100%覆盖其所有Or/Option/Many分支

**检查标准：**
- ✅ 完全覆盖：所有Or分支都有测试、所有Option有无都测、所有Many=1和Many≥2都测
- ⚠️ 部分覆盖：大部分分支已测但缺少某些组合
- ❌ 不足：关键分支未被覆盖

---

## 🎯 第1阶段完成（已验证17个规则）

### ✅ 完全覆盖的规则（已验证17个）
| 编号 | 规则名 | Or | Option | Many | 状态 |
|-----|--------|----|----|------|------|
| 005 | TemplateLiteral | 2 | - | - | ✅ |
| 006 | TemplateSpans | 2 | - | - | ✅ |
| 007 | TemplateMiddleList | - | - | 1 | ✅ |
| 108 | ArrayBindingPattern | 3 | 2 | - | ✅ |
| 109 | BindingPropertyList | - | - | 1 | ✅ |
| 110 | BindingElementList | - | - | 1 | ✅ |
| 117-120 | 导入相关规则 | 1-3 | - | - | ✅ |
| 201 | PrimaryExpression | 11 | - | - | ✅ |
| 211 | UnaryExpression | 9 | - | - | ✅ |
| 215 | RelationalExpression | 6 | - | 1 | ✅ |
| 216 | EqualityExpression | 4 | - | 1 | ✅ |
| 228 | AwaitExpression | - | - | - | ✅ |

---

## 🔄 第2阶段计划（需验证的规则）

### 优先级1 - 高复杂规则（10-20个Or/Option/Many）
| 编号 | 规则名 | Or | Option | Many | 优先级 | 备注 |
|-----|--------|----|----|------|-------|------|
| 101 | IdentifierReference | 1 | - | - | P1 | 需验证 |
| 102-105 | 标识符相关 | 1-2 | - | - | P1 | 需验证 |
| 106 | BindingPattern | 2 | - | - | P1 | 需验证 |
| 201 | PrimaryExpression | 11 | - | - | P1 | ✅ 已验证 |
| 202-210 | 表达式相关 | 1-4 | - | 0-1 | P1 | **需完善** |
| 212-214 | 二元运算表达式 | 2-3 | - | 1 | P1 | 需验证 |
| 217-221 | 按位/逻辑表达式 | 1 | - | 1 | P1 | 需验证 |

### 优先级2 - 中等复杂规则（3-9个Or/Option/Many）
| 编号 | 规则名 | Or | Option | Many | 优先级 | 备注 |
|-----|--------|----|----|------|-------|------|
| 111-116 | 绑定相关 | 1-2 | 0-1 | 0-1 | P2 | 需验证 |
| 222 | ConditionalExpression | 1 | - | - | P2 | 需验证 |
| 223 | Expression | 1 | - | 1 | P2 | 需验证 |
| 224-227 | 其他表达式 | 1-2 | 0-1 | 0-1 | P2 | 需验证 |
| 229-232 | 箭头函数 | 1-3 | 0-1 | 0-1 | P2 | 需验证 |
| 302-310 | 语句相关 | 1-5 | 0-2 | 0-1 | P2 | 需验证 |

### 优先级3 - 低复杂规则（1-2个分支）
| 编号 | 规则名 | Or | Option | Many | 优先级 | 备注 |
|-----|--------|----|----|------|-------|------|
| 301 | 其他 | 1 | - | - | P3 | 需验证 |
| ... | ... | ... | ... | ... | P3 | ... |

---

## 📊 覆盖度目标

```
第1阶段（已完成）：
  • 完全覆盖：17个规则 ✅
  • 覆盖度：17/152 = 11.2%

第2阶段（进行中）：
  • 目标：P1优先级规则全覆盖（约40-50个规则）
  • 预期覆盖度：57-67/152 = 37-44%

第3阶段（计划中）：
  • 目标：P2优先级规则全覆盖（约50-60个规则）
  • 预期覆盖度：107-127/152 = 70-83%

最终状态：
  • 目标：152/152 规则 = 100% 完全覆盖 ✅
```

---

## 🚀 执行策略

### 快速验证步骤（对每个规则）
1. **查看规则定义** → 数出Or/Option/Many的数量
2. **审查现有测试** → 检查是否覆盖所有分支
3. **补充缺失测试** → 添加标注清晰的测试用例
4. **标准化文档头** → 确保EBNF规则和测试目标清晰

### 批量处理方法
- 按目录组织（01-literals、02-identifiers、03-expressions等）
- 每个目录5-10个规则为一个批次
- 每个批次集中修复，然后验证

---

## 📝 记录规则定义

### 需要特别关注的复杂规则

**202-ParenthesizedExpression:**
```
Or=1: just expression in parentheses
```

**204-MemberExpression:**
```
Or=4: PrimaryExpression | SuperProperty | MetaProperty | NewMemberExpressionArguments
Many=1: 多个后缀操作（.、[]、模板）
```

**208-CallExpression:**
```
MemberExpression Arguments Many
Many=1: 链式调用
```

**220-LogicalANDExpression / 221-LogicalORExpression:**
```
BitwiseORExpression ((&&) BitwiseORExpression)*
BitwiseXORExpression ((||) BitwiseXORExpression)*
Many=1: 链式逻辑操作
```

