# Changelog

All notable changes to Subhuti Parser will be documented in this file.

## [Unreleased]

### Fixed
- **[2025-11-02] 修复回溯时的 CST 污染问题** 🎉
  - **问题**: Or 规则回溯时，失败分支添加的空节点没有被清理，导致 CST 中出现大量空 children 节点
  - **原因**: `saveState()` 只保存 tokenIndex，`restoreState()` 也只恢复 tokenIndex，但失败分支的子节点已经添加到父节点的 children 数组中
  - **方案**: 实现写时复制（Copy-on-Write）优化的回溯机制
    - 保存状态时：记录每层 CST 的 children 数组长度
    - 回溯时：截断 children 数组到保存的长度，移除失败分支的节点
  - **效果**: 
    - 空节点从数百个减少到个位数
    - 空节点占比从 ~80% 降低到 ~13%（合理范围）
    - 无重复 token 节点
    - 性能无影响（只记录长度）
  - **测试**: 通过简单和复杂表达式测试验证
  - **文件**: `subhuti/src/parser/SubhutiParser.ts`

## [0.1.3] - 2025-10-17

### Added
- 完整的测试规范文档
- 扁平化测试目录结构

### Changed
- 优化文档结构和可读性
- 统一测试命名规范

## [0.1.2] - 2025-10-16

### Added
- Packrat Parsing 支持
- Memoization 缓存机制

### Fixed
- 多处 Parser 规则顺序问题

## [0.1.1] - 2025-10-15

### Added
- 基础 Parser 框架
- Token 消费机制
- Or/Many/Option 规则支持

## [0.1.0] - 2025-10-14

### Added
- 初始版本发布
- 支持 PEG 风格解析
- 装饰器语法







