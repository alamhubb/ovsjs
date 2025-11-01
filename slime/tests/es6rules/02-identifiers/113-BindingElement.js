/**
 * 规则测试：BindingElement
 * 
 * 位置：Es6Parser.ts Line 1089
 * 分类：identifiers
 * 编号：113
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）
 * ✓ 包含Option（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支
 * - 测试Option的有无两种情况

 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const {x} = obj
const {x = 0} = obj
const {x: y} = obj
