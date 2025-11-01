/**
 * 规则测试：ForInOfStatement
 * 
 * 位置：Es6Parser.ts Line 1198
 * 分类：statements
 * 编号：410
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支


 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

for (const key in obj) {}
for (const item of arr) {}
for (let [k, v] of map) {}
