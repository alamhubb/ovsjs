# 需求文档

## 简介

修复 SubhutiDebug 追踪器中 Or 分支父子关系的 bug。当前实现中，在 Or 分支内的规则退出时，其父节点被错误地识别为 Or 包裹节点（如 `UpdateExpression`），而不是虚拟的 Or 分支节点（如 `UpdateExpression(branchIdx=1)`）。这导致当同一规则在不同 Or 分支中被调用时，追踪器会报错"规则已存在于父规则的子节点中"。

## 术语表

- **SubhutiDebug**: Subhuti 解析器的调试追踪系统
- **Or 包裹节点**: 包含多个 Or 分支的规则节点（如 `UpdateExpression`）
- **Or 分支节点**: Or 包裹节点下的虚拟分支节点（如 `UpdateExpression(branchIdx=1)`）
- **ruleStack**: 规则调用栈，用于追踪解析过程
- **orBranchInfo**: 存储 Or 节点信息的对象，包含 `isOrEntry`、`isOrBranch`、`branchIndex` 等字段

## 需求

### 需求 1: 修复 Or 分支父子关系识别

**用户故事:** 作为解析器开发者，我希望在 Or 分支内的规则能正确识别其父节点为 Or 分支节点，而不是 Or 包裹节点，这样同一规则可以在不同分支中被调用而不会报错。

#### 验收标准

1. WHEN 规则在 Or 分支内退出时，THE SubhutiDebug SHALL 将该规则的父节点识别为最近的 Or 分支节点
2. WHEN 同一规则在同一 Or 包裹节点的不同分支中被调用时，THE SubhutiDebug SHALL 允许这种情况而不抛出重复错误
3. WHEN 规则在非 Or 分支上下文中退出时，THE SubhutiDebug SHALL 将该规则的父节点识别为栈中倒数第二个规则节点
4. WHEN 查找父节点时，THE SubhutiDebug SHALL 正确区分 Or 包裹节点（`isOrEntry=true`）和 Or 分支节点（`isOrBranch=true`）
5. WHEN 测试代码 `let a = 1` 使用 bisect 调试模式运行时，THE SubhutiDebug SHALL 成功完成所有层级的解析而不抛出错误

### 需求 2: 验证修复的正确性

**用户故事:** 作为解析器开发者，我希望能够验证修复后的代码能正确处理各种 Or 分支场景，确保不会引入新的问题。

#### 验收标准

1. WHEN 运行测试代码 `npx tsx slime/tests/test-code.ts` 时，THE SubhutiDebug SHALL 成功解析代码 `let a = 1` 并输出完整的调试信息
2. WHEN 解析包含多层嵌套 Or 分支的代码时，THE SubhutiDebug SHALL 正确建立所有规则的父子关系
3. WHEN 同一规则在不同 Or 分支中被多次调用时，THE SubhutiDebug SHALL 为每次调用创建独立的缓存键
4. WHEN 查看调试输出时，THE SubhutiDebug SHALL 正确显示 Or 分支的层级结构
