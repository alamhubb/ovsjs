/**
 * 规则测试：ConditionalExpression
 * 
 * 位置：Es6Parser.ts Line 783
 * 分类：expressions
 * 编号：222
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

a ? b : c
x > 0 ? 'pos' : 'neg'
a ? b : c ? d : e
