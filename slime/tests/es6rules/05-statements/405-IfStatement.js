/**
 * 规则测试：IfStatement
 * 
 * 位置：Es6Parser.ts Line 1126
 * 分类：statements
 * 编号：405
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

if (true) {}
if (x > 0) { doSomething() }
if (a) { b() } else { c() }
