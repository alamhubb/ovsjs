# SubhutiParser 重写任务 - 会话恢复指南

**任务状态：** 🟡 设计完成，准备实现  
**完成进度：** 7/27 任务（26%）  
**当前阶段：** 阶段二完成，准备开始阶段三（核心实现）

---

## 🎯 快速恢复指令（复制给新 AI）

```
我正在重写 SubhutiParser 框架，已完成需求分析和架构设计。

请阅读以下文档了解背景：
1. subhuti/REWRITE_PLAN.md - 完整的重写计划（23个任务）
2. subhuti/API_REQUIREMENTS.md - API 需求分析
3. subhuti/NEW_ARCHITECTURE.md - 新架构设计方案

当前状态：
- ✅ 阶段一：需求分析完成
- ✅ 阶段二：架构设计完成  
- 🔄 阶段三：准备开始实现新的 SubhutiParser

核心要求（优先级）：
1. 可读性高 ⭐⭐⭐⭐⭐
2. 逻辑清晰 ⭐⭐⭐⭐⭐
3. 代码简洁 ⭐⭐⭐⭐
4. 使用简单 ⭐⭐⭐⭐
5. Packrat Parsing ⭐⭐⭐
6. 性能 ⭐⭐（最后考虑）

关键改进：
- 成功才添加 CST（不是推测性添加）
- 极简回溯（只需 tokenIndex）
- 异常驱动（不是双标志）
- Packrat 自然集成（统一 addToParent）

约束：
- Es2020Parser/Es6Parser 尽量不改动
- 保持现有 API 兼容（@SubhutiRule、Or、Many、Option）

请继续执行阶段三：实现新的 SubhutiParser.ts
```

---

## 📚 关键文档清单

### 必读文档（理解任务背景）

| 文档 | 路径 | 内容 | 优先级 |
|-----|------|------|--------|
| **重写计划** | `subhuti/REWRITE_PLAN.md` | 23个任务，5个阶段 | ⭐⭐⭐⭐⭐ |
| **API 需求** | `subhuti/API_REQUIREMENTS.md` | 必须保留的 API 清单 | ⭐⭐⭐⭐⭐ |
| **新架构设计** | `subhuti/NEW_ARCHITECTURE.md` | 核心设计方案 | ⭐⭐⭐⭐⭐ |
| **设计对比** | `subhuti/CHEVROTAIN_COMPARISON.md` | 与主流框架对比 | ⭐⭐⭐⭐ |
| **综合分析** | `subhuti/COMPREHENSIVE_DESIGN_ANALYSIS.md` | 全面设计分析 | ⭐⭐⭐ |

### 参考文档（了解优化背景）

| 文档 | 路径 | 内容 |
|-----|------|------|
| **性能分析** | `slime/tests/es2020/PERFORMANCE_ANALYSIS.md` | 性能问题诊断 |
| **Packrat 优化总结** | `slime/tests/es2020/PACKRAT_PARSING_OPTIMIZATION_SUMMARY.md` | 之前的优化成果 |
| **最终结果** | `slime/tests/es2020/FINAL_RESULTS.md` | Packrat 实现结果 |

---

## 📊 当前进度

### ✅ 已完成（7个任务）

**阶段一：需求分析**
- ✅ 任务1：分析 Es2020Parser/Es6Parser 使用的 API
- ✅ 任务2：分析测试用例的使用方式

**阶段二：架构设计**
- ✅ 任务3：核心架构设计（分离关注点）
- ✅ 任务4：CST 构建机制（成功才添加）
- ✅ 任务5：回溯机制（极简）
- ✅ 任务6：Packrat Parsing（自然集成）
- ✅ 任务7：Or/Many/Option（异常驱动）

### 🔄 待执行（20个任务）

**阶段三：核心实现（11个任务）**
- 任务8-18：实现所有核心功能

**阶段四：测试（6个任务）**
- 任务19-24：单元测试 + 集成测试

**阶段五：文档（3个任务）**
- 任务25-27：设计文档 + 对比总结

---

## 🎯 下一步行动

### 立即开始：阶段三（核心实现）

**任务8-18 的实施顺序：**

1. **任务8：基础框架** - SubhutiParser 类骨架
2. **任务9：装饰器** - @Subhuti, @SubhutiRule
3. **任务11：CST 构建** - buildCst 方法（核心）
4. **任务12：回溯** - save/restoreState
5. **任务3：Token 消费** - consumeToken
6. **任务13：Or 规则** - 顺序选择
7. **任务14-15：Many/Option** - 循环规则
8. **任务16：Packrat** - queryMemo/applyMemo/storeMemo
9. **任务17：错误处理** - ParsingError 类
10. **任务18：CST 辅助** - getChild 等方法
11. **任务10：组装** - 集成所有模块

**预计时间：** 8-10 小时

---

## 📋 关键决策记录

### 决策1：成功才添加 ✅

- 删除"推测性添加"
- buildCst 成功后调用 addToParent(cst)
- 失败时无需清理

### 决策2：异常驱动 ✅

- 成功：返回 CST
- 失败：抛异常
- 无需双标志（ruleMatchSuccess + loopMatchSuccess）

### 决策3：极简回溯 ✅

- 只保存 tokenIndex
- CST 无需回退（成功才添加）
- 1个整数 vs 旧版3个值

### 决策4：Getter 替代字段 ✅

- curCst → get curCst()
- parentCst → get parentCst()
- 移除 setCurCst 方法

### 决策5：单层 Map 缓存 ✅

- Key = `${ruleName}:${tokenIndex}`
- 单层 Map（简单）
- 字符串 key（可读）

---

## 🔍 重要约束

### 约束1：Es2020Parser 不能大改

**允许：**
- ✅ import 路径微调
- ✅ 类型声明微调

**不允许：**
- ❌ 改变规则方法实现
- ❌ 改变 Or/Many/Option 调用方式
- ❌ 改变装饰器语法

### 约束2：API 兼容性

**必须保留：**
- @Subhuti, @SubhutiRule
- Or([{alt: () => ...}])
- Many(() => ...)
- Option(() => ...)
- this.tokenConsumer.TokenName()
- this.RuleName()

### 约束3：测试必须通过

**验证标准：**
- Es2020Parser: 23/23 测试通过
- Es6Parser: 10/10 回归测试通过
- 性能测试：三层嵌套 < 10ms

---

## 💾 当前代码状态

### 重要提示

**subhuti/src/parser/SubhutiParser.ts 已被删除！**

- 需要完全重新编写
- 基于 NEW_ARCHITECTURE.md 的设计
- 参考旧版本的 API（但实现完全不同）

### 其他相关文件（不要修改）

- `subhuti/src/struct/SubhutiCst.ts` - CST 节点类
- `subhuti/src/struct/SubhutiMatchToken.ts` - Token 类
- `subhuti/src/parser/SubhutiTokenConsumer.ts` - TokenConsumer 基类
- `slime/packages/slime-parser/src/language/es2020/Es2020Parser.ts` - 使用方（不改）
- `slime/packages/slime-parser/src/language/es2015/Es6Parser.ts` - 使用方（不改）

---

## 🎨 设计理念速查

### 核心原则（按优先级）

1. **可读性** ⭐⭐⭐⭐⭐
   - 清晰的方法命名
   - 详细的注释
   - 自顶向下阅读

2. **逻辑清晰** ⭐⭐⭐⭐⭐
   - 顺序执行（无复杂分支）
   - 成功才添加（无事后清理）
   - 异常驱动（清晰的失败路径）

3. **代码简洁** ⭐⭐⭐⭐
   - 极简回溯（1个整数）
   - Getter 替代字段
   - 提取公共方法

4. **使用简单** ⭐⭐⭐⭐
   - 兼容现有 API
   - 直观的方法调用
   - 良好的错误信息

5. **Packrat** ⭐⭐⭐
   - 自然集成
   - 统一的 addToParent
   - 可配置开关

6. **性能** ⭐⭐
   - 最后考虑
   - Packrat 已解决主要问题

---

## 📝 快速开始代码模板

### 新 SubhutiParser.ts 的骨架

```typescript
/**
 * Subhuti Parser - 优雅的 PEG Parser 框架
 * 
 * 设计理念：可读性 > 逻辑清晰 > 简洁 > 易用
 * 参考标准：Chevrotain + PEG.js + ANTLR
 * 
 * 核心特性：
 * - ✅ 成功才添加 CST（清晰的生命周期）
 * - ✅ 极简回溯（只需 token 位置）
 * - ✅ 异常驱动（清晰的控制流）
 * - ✅ Packrat Parsing（自然集成）
 */

import SubhutiMatchToken from "../struct/SubhutiMatchToken.ts"
import SubhutiCst from "../struct/SubhutiCst.ts"
import SubhutiTokenConsumer from "./SubhutiTokenConsumer.ts"

// ============================================
// [1] 数据结构定义
// ============================================

interface BacktrackData {
    tokenIndex: number
}

interface MemoResult {
    success: boolean
    endTokenIndex: number
    cst?: SubhutiCst
}

class ParsingError extends Error {
    // ...
}

// ============================================
// [2] 装饰器系统
// ============================================

export function Subhuti(target, context) {
    // ...
}

export function SubhutiRule(targetFun, context) {
    // ...
}

// ============================================
// [3] SubhutiParser 核心类
// ============================================

export default class SubhutiParser<T extends SubhutiTokenConsumer> {
    // 字段定义...
    
    constructor(tokens, TokenConsumerClass) {
        // ...
    }
    
    // Getter...
    
    // 规则执行...
    
    // CST 构建...
    
    // 回溯...
    
    // Or/Many/Option...
    
    // Packrat Parsing...
    
    // 辅助方法...
}

// ============================================
// [4] SubhutiCst 扩展
// ============================================

// 在 SubhutiCst.ts 中添加辅助方法
```

**下一步：** 按照 NEW_ARCHITECTURE.md 实现每个部分

---

## ⚡ 给新 AI 的简短指令

**如果想要最简洁的恢复方式，使用这个：**

```
继续重写 SubhutiParser 任务。

背景：
- SubhutiParser.ts 已删除，需要完全重写
- 架构设计已完成，见 subhuti/NEW_ARCHITECTURE.md
- 要求：可读性 > 逻辑清晰 > 简洁 > 易用 > 性能
- 约束：Es2020Parser/Es6Parser 不能大改

当前进度：
- ✅ 阶段一、二完成（需求分析 + 架构设计）
- 🔄 开始阶段三：实现新的 SubhutiParser

关键改进：
1. 成功才添加 CST
2. 极简回溯（只需 tokenIndex）
3. 异常驱动（无双标志）
4. Packrat 自然集成

请继续执行任务8-18：实现核心功能
参考：subhuti/NEW_ARCHITECTURE.md
```

---

## 📖 详细恢复步骤

### 步骤1：了解背景（5分钟）

**快速阅读：**
1. `subhuti/REWRITE_PLAN.md` - 扫描任务列表和时间估算
2. `subhuti/NEW_ARCHITECTURE.md` - 仔细阅读核心设计

**关键点：**
- 为什么重写？（性能问题 + 设计问题）
- 设计理念是什么？（可读性优先）
- 核心改进有哪些？（8个改进点）

---

### 步骤2：查看 TODO 列表（2分钟）

**命令：** 查看当前 TODO 状态

**确认：**
- 哪些任务已完成（绿色勾）
- 当前在哪个任务（高亮）
- 下一步做什么

---

### 步骤3：开始实现（开始工作）

**按顺序执行：**
1. 任务8：实现基础框架（类定义、字段、构造函数）
2. 任务9：实现装饰器
3. 任务10-18：实现核心方法

**每完成一个任务：**
- 更新 TODO 状态
- 创建简单测试验证
- 继续下一个

---

## 🔑 关键代码片段（参考）

### Es2020Parser 的使用方式（不能改）

```typescript
// 使用方式1：类装饰器
@Subhuti
export default class Es2020Parser<T> extends Es6Parser<T> {
    constructor(tokens, TokenConsumerClass) {
        super(tokens, TokenConsumerClass);
    }
}

// 使用方式2：方法装饰器
@SubhutiRule
ExponentiationExpression() {
    this.Or([
        {alt: () => {
            this.UpdateExpression()
            this.tokenConsumer.Exponentiation()
            this.ExponentiationExpression()
        }},
        {alt: () => this.UnaryExpression()}
    ])
}

// 使用方式3：规则组合
this.Many(() => {
    this.tokenConsumer.Comma()
    this.Element()
})

this.Option(() => {
    this.tokenConsumer.Question()
    this.Expression()
})
```

### 测试用例的使用方式（不能改）

```typescript
// 创建 Parser
const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
const parser = new Es2020Parser(tokens)

// 调用入口规则
const cst = parser.Program()

// 访问 CST
if (cst && cst.children && cst.children.length > 0) {
    // 成功
}
```

---

## 🎯 实现检查清单

### 必须实现的 API

- [ ] 类装饰器 `@Subhuti`
- [ ] 方法装饰器 `@SubhutiRule`
- [ ] `Or([{alt: Function}])` 方法
- [ ] `Many(Function)` 方法
- [ ] `Option(Function)` 方法
- [ ] `tokenConsumer` 字段
- [ ] `consumeToken(string)` 方法（内部，被 tokenConsumer 调用）
- [ ] 构造函数 `(tokens?, TokenConsumerClass?)`
- [ ] CST 构建和父子关系处理

### 必须通过的测试

- [ ] Es2020Parser 功能测试：23/23 通过
- [ ] Es6Parser 回归测试：10/10 通过
- [ ] 性能测试：三层嵌套 < 10ms
- [ ] Packrat 测试：缓存正常工作

---

## 💡 常见问题

### Q1：如果发现设计不合理怎么办？

**A：** 先记录问题，继续实现，在测试阶段再调整。优先保证功能完整。

### Q2：如果测试不通过怎么办？

**A：** 
1. 对比旧版本的实现
2. 检查 API 兼容性
3. 可能需要微调 Es2020Parser（允许小改动）

### Q3：性能不够怎么办？

**A：** 性能优先级最低。只要 Packrat Parsing 工作，性能就足够。

### Q4：代码太长怎么办？

**A：** 优先保证可读性和逻辑清晰。代码行数不是主要指标。

---

## 📦 备份信息

### 旧版本备份（如需参考）

**旧 SubhutiParser 的关键逻辑：**
- processCst 方法：创建和管理 CST
- Or 规则：双标志 + 回溯
- Many/Option：总是成功，设置 loopMatchSuccess
- Packrat：手动模拟父子关系

**注意：** 只参考逻辑，不复制代码！新版本要完全重写。

---

## 🎉 准备就绪！

**所有准备工作已完成：**
- ✅ 需求明确
- ✅ 架构设计清晰
- ✅ API 清单完整
- ✅ 参考文档齐全
- ✅ 实现路径明确

**下次会话只需要：**
1. 复制"快速恢复指令"给新 AI
2. 让 AI 开始执行任务8-18
3. 监控进度，测试验证

**预计完成时间：** 剩余 12-15 小时（阶段三-五）

---

**祝下次会话顺利！** 🚀




