/**
 * 规则测试：CatchParameter
 * 
 * 位置：Es6Parser.ts Line 1393
 * 分类：others
 * 编号：930
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

try {} catch (e) {}
try {} catch ({message}) {}
try {} catch ([first]) {}
