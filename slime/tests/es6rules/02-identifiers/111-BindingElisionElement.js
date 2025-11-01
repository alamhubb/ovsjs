/**
 * 规则测试：BindingElisionElement
 * 
 * 位置：Es6Parser.ts Line 1067
 * 分类：identifiers
 * 编号：111
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

const [a, , b] = arr
const [, x] = arr
