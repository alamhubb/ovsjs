/**
 * 规则测试：ContinueStatement
 * 
 * 位置：Es6Parser.ts Line 1261
 * 分类：statements
 * 编号：412
 * 
 * 规则特征：
 * ✓ 包含Option（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能

 * - 测试Option的有无两种情况

 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

for (let i = 0; i < 10; i++) { continue }
loop: for (;;) { continue loop }
