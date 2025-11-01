/**
 * 规则测试：GeneratorExpression
 * 
 * 位置：Es6Parser.ts Line 1597
 * 分类：expressions
 * 编号：227
 * 
 * 规则特征：
 * ✓ 包含Option（2处）
 * 
 * 测试目标：
 * - 验证规则的基本功能

 * - 测试Option的有无两种情况

 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const g = function*() { yield 1 }
const named = function* gen() { yield 2 }

/* Es6Parser.ts: function* Identifier? (FormalParameters) { GeneratorBody } */
