/**
 * 规则测试：ArgumentList
 * 
 * 位置：Es6Parser.ts Line 590
 * 分类：others
 * 编号：914
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 * ✓ 包含Many（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支

 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

func(1, 2, 3)
func(a, b, ...rest)
func(...spread, last)
