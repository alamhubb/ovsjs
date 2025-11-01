/**
 * 规则测试：LabelIdentifier
 * 
 * 位置：Es6Parser.ts Line 112
 * 分类：identifiers
 * 编号：103
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支


 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

myLabel: for (;;) { break myLabel }
outer: while (true) { break outer }
