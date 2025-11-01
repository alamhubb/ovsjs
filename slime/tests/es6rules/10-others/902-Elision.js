/**
 * 规则测试：Elision
 * 
 * 位置：Es6Parser.ts Line 197
 * 分类：others
 * 编号：902
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能


 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const arr = [1, , 3]
const sparse = [, , , 4]
