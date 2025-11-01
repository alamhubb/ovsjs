/**
 * 规则测试：SingleNameBinding
 * 
 * 位置：Es6Parser.ts Line 1102
 * 分类：identifiers
 * 编号：114
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- Initializer可选
 * 
 * 规则语法：
 *   SingleNameBinding:
 *     BindingIdentifier Initializer?
 * 
 * 测试目标：
 * - 测试单名绑定（对象解构简写）
 * - 测试Option的有无两种情况
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 简单绑定
const {name} = obj
const {age} = person

// ✅ 测试2：Option有 - 带默认值
const {value = 0} = obj
/* Es6Parser.ts: BindingIdentifier Initializer? */
