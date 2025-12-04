# ES6 规则级测试

## 目的

为Es2025Parser的每个规则建立独立的测试用例，确保完整覆盖所有语法分支。

## 设计原则

1. **一规则一文件**：每个Parser规则对应一个测试文件
2. **完整覆盖**：测试规则的所有Or分支和Option情况
3. **从简到繁**：每个文件内从简单到复杂排列测试用例
4. **自文档化**：测试文件即文档，说明规则用法

## 目录结构

```
es6rules/
├── 01-expressions/      # 001-099：表达式类规则
├── 02-statements/       # 101-199：语句类规则
├── 03-functions/        # 201-299：函数类规则
├── 04-classes/          # 301-399：类规则
├── 05-modules/          # 401-499：模块规则
├── 06-destructuring/    # 501-599：解构规则
└── 07-operators/        # 601-699：运算符规则
```

## 编号规则

- **001-099**：表达式（Literal, Identifier, Array, Object等）
- **101-199**：语句（Variable, If, For, While等）
- **201-299**：函数（Declaration, Expression, Arrow等）
- **301-399**：类（Class, Method, Property等）
- **401-499**：模块（Import, Export等）
- **501-599**：解构（Array/Object Binding Pattern等）
- **601-699**：运算符（Binary, Unary, Conditional等）

## 测试文件格式

每个文件包含：
```javascript
/**
 * 规则：RuleName
 * 位置：Es2025Parser.ts Line XXX
 * 
 * 语法：ES6规范的EBNF语法
 * 
 * 说明：规则的用途和测试覆盖的场景
 */

// ✅ 测试1：场景描述
代码示例

// ✅ 测试2：场景描述
代码示例

// ...
```

## 运行测试

```bash
# 方式1：运行所有规则级测试（基础）
npx tsx test-es6rules.ts

# 方式2：验证测试质量（推荐 ⭐⭐⭐⭐⭐）
npx tsx verify-rule-test.ts

# 运行特定分类
npx tsx test-es6rules.ts --category expressions
npx tsx test-es6rules.ts --category modules

# 运行特定规则
npx tsx test-es6rules.ts --rule 402
```

### ⭐ 新增：测试质量验证

`verify-rule-test.ts` 会对每个测试文件进行**往返验证**：

```
原始代码 → Parser → CST → AST → Generator → 生成代码
           ↑                                      ↓
           └──────── 验证两者是否等价 ───────────┘
```

**输出示例：**
```
✅ 001-Literal.js          | 规则: Literal        | 用例: 10 | 通过: 10 | 失败: 0
✅ 002-ArrayLiteral.js     | 规则: ArrayLiteral   | 用例: 8  | 通过: 8  | 失败: 0
❌ 003-ObjectLiteral.js    | 规则: ObjectLiteral  | 用例: 12 | 通过: 11 | 失败: 1
   ⚠️  测试5失败：往返测试失败

========== 验证总结 ==========
📁 测试文件数：152
📋 测试用例数：1200+
✅ 通过：1195 (99.5%)
❌ 失败：5 (0.5%)
🏆 等级：5星 - 完美！所有测试都能保证规则正确
```

**质量等级：**
- 🏆 100%通过 → **5星** - 可以保证规则没问题
- ⭐⭐⭐⭐ 95%+ → 4星 - 优秀
- ⭐⭐⭐ 85%+ → 3星 - 良好
- ⭐⭐ 70%+ → 2星 - 一般
- ⭐ <70% → 1星 - 需要改进

## 与现有测试的关系

- **tests/cases/**：综合测试，测试功能场景（保留）
- **tests/es6rules/**：规则测试，测试语法覆盖（新增）

两者互补，共同保证Parser质量。

## 覆盖度目标

- ✅ 每个公开的@SubhutiRule规则都有测试
- ✅ 每个Or分支都有测试用例
- ✅ 每个Option的有/无两种情况都测试
- ✅ 每个Many的0/1/多种情况都测试

## 当前状态

规划阶段 - 待实施

## 实施计划

1. ✅ 创建目录结构
2. ⏸️ 分析所有规则，制定测试清单
3. ⏸️ 按优先级编写测试用例
4. ⏸️ 创建测试运行器
5. ⏸️ 集成到CI流程


