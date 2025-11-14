# 需求文档：Or 分支成功显示优化

## 简介

当前 SubhutiDebug 调试器在处理 Or 分支时存在问题：失败的分支会创建虚拟节点，但分支失败后子节点没有被正确清理，导致缓存恢复时内容被错误关联到失败分支下，造成调试输出中出现重复和错误的分支内容。

本功能旨在优化 Or 分支的调试输出，只显示成功的分支，避免失败分支产生的噪音和错误关联问题。

## 术语表

- **SubhutiDebug**：Subhuti 解析器的调试器类，负责跟踪和输出解析过程
- **Or 分支**：解析器中的选择分支，尝试多个备选规则直到某个成功
- **虚拟节点**：调试输出中为 Or 分支创建的占位节点，用于组织分支内容
- **ruleStack**：调试器中维护的规则栈，用于跟踪当前的解析层级
- **缓存恢复**：解析器从缓存中恢复之前解析过的内容，避免重复解析

## 需求

### 需求 1：简化 Or 分支显示

**用户故事：** 作为解析器调试用户，我希望只看到成功的 Or 分支，这样调试输出更清晰，不会被失败的分支干扰。

#### 验收标准

1. WHEN Or 分支成功时，THE SubhutiDebug SHALL 创建虚拟节点并显示该分支的完整子节点
2. WHEN Or 分支失败时，THE SubhutiDebug SHALL NOT 创建虚拟节点
3. WHEN Or 分支失败时，THE SubhutiDebug SHALL NOT 在调试输出中显示该分支的任何内容
4. THE SubhutiDebug SHALL 确保成功分支的树形结构层级正确

### 需求 2：正确的缓存内容关联

**用户故事：** 作为解析器调试用户，我希望缓存恢复时内容显示在正确的位置，这样不会出现重复或错误的分支内容。

#### 验收标准

1. WHEN 缓存内容被恢复时，THE SubhutiDebug SHALL 将缓存内容关联到正确的父节点
2. THE SubhutiDebug SHALL NOT 将缓存内容关联到失败分支的虚拟节点
3. THE SubhutiDebug SHALL NOT 在多个分支下重复显示相同的缓存内容
4. WHEN 相同规则被多次调用时，THE SubhutiDebug SHALL 显示缓存标记但不重复显示子内容

### 需求 3：延迟创建虚拟节点

**用户故事：** 作为系统开发者，我希望虚拟节点只在分支成功时创建，这样可以避免失败分支的清理问题。

#### 验收标准

1. WHEN Or 分支开始尝试时，THE SubhutiDebug SHALL 记录分支信息但不创建虚拟节点
2. WHEN Or 分支成功时，THE SubhutiDebug SHALL 在正确的栈位置创建虚拟节点
3. WHEN Or 分支失败时，THE SubhutiDebug SHALL 清理分支标记但不需要清理虚拟节点
4. THE SubhutiDebug SHALL 在虚拟节点创建时记录正确的栈深度信息

### 需求 4：Parser 集成

**用户故事：** 作为系统开发者，我希望 SubhutiParser 能够正确调用新的调试接口，这样分支成功时能够触发虚拟节点创建。

#### 验收标准

1. WHEN Or 分支成功时，THE SubhutiParser SHALL 调用 onOrBranchSuccess 方法
2. THE SubhutiParser SHALL 在调用 onOrBranchSuccess 之前确认分支已成功
3. THE SubhutiParser SHALL 传递正确的分支索引和父规则名称给 onOrBranchSuccess
4. THE SubhutiParser SHALL 保持现有的 onOrBranch 和 onOrBranchExit 调用时机不变

### 需求 5：接口兼容性

**用户故事：** 作为系统维护者，我希望新的调试接口向后兼容，这样现有代码无需修改即可继续工作。

#### 验收标准

1. THE SubhutiDebugger 接口 SHALL 将 onOrBranchSuccess 定义为可选方法
2. THE SubhutiParser SHALL 使用可选链调用 onOrBranchSuccess 方法
3. THE SubhutiDebug SHALL 保持现有的调试方法签名不变
4. WHEN onOrBranchSuccess 未实现时，THE SubhutiParser SHALL 正常运行不报错

### 需求 6：性能优化

**用户故事：** 作为系统用户，我希望调试输出更简洁高效，这样可以减少内存使用和提升处理速度。

#### 验收标准

1. THE SubhutiDebug SHALL 减少调试输出的总行数至少 50%（通过去除失败分支）
2. THE SubhutiDebug SHALL 减少虚拟节点的创建数量（不为失败分支创建）
3. THE SubhutiDebug SHALL 减少栈操作次数（失败分支只需清理标记）
4. THE SubhutiDebug SHALL 保持解析器核心功能的性能不受影响
