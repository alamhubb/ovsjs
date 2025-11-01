/**
 * 规则测试：CoverInitializedName
 * 
 * 位置：Es6Parser.ts Line 327
 * 分类：others
 * 编号：908
 * 
 * 规则特征：
 * - 简单规则：IdentifierReference = AssignmentExpression
 * 
 * 规则语法：
 *   CoverInitializedName:
 *     IdentifierReference Initializer
 * 
 * 测试目标：
 * - 测试对象解构中的默认值
 * - 测试属性简写 + 默认值
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基础默认值
const {x = 1} = obj