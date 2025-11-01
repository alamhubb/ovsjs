/**
 * 规则测试：BreakableStatement
 * 
 * 位置：Es6Parser.ts Line 955
 * 分类：statements
 * 编号：402
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

for (;;) { break }
while (true) { break }
switch (x) { case 1: break }
