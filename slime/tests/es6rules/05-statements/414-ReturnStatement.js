/**
 * 规则测试：ReturnStatement
 * 
 * 位置：Es6Parser.ts Line 1281
 * 分类：statements
 * 编号：414
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

function test() { return 42 }
function none() { return }
function complex() { return {a: 1, b: 2} }
