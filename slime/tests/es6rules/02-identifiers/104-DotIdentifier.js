/**
 * 规则测试：DotIdentifier
 * 
 * 位置：Es6Parser.ts Line 412
 * 分类：identifiers
 * 编号：104
 * 
 * 规则特征：
 * - 简单规则：Dot + IdentifierName
 * 
 * 规则语法：
 *   DotIdentifier:
 *     . IdentifierName
 * 
 * 测试目标：
 * - 测试点号成员访问
 * - 测试各种属性名（包括关键字）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：访问普通属性
obj.property
obj.value
obj.data

// ✅ 测试2：访问数组属性
arr.length
arr.push
arr.slice

// ✅ 测试3：访问函数属性
func.call