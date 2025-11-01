/**
 * 测试规则: BindingElementList
 * 来源: 从 ElementList 拆分
 *//**
 * 规则测试：BindingElementList
 * 
 * 位置：Es6Parser.ts Line 1058
 * 分类：identifiers
 * 编号：110
 * 
 * EBNF规则：
 *   BindingElementList:
 *     BindingElisionElement (Comma BindingElisionElement)*
 * 
 * 规则特征：
 * ✓ 包含Many规则（1处）
 * ✓ 必须至少有1个BindingElisionElement
 * ✓ Many表示可以有多个(Comma + BindingElisionElement)对
 * 
 * 测试目标：
 * - 覆盖Many=1：只有1个BindingElisionElement
 * - 覆盖Many≥2：多个BindingElisionElement（包括Elision）（2个、3个、多个）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖Many=1和Many≥2 + 扩展测试）
 */

// ✅ 测试1：Many=1 - 单个元素
const [a] = arr

// ✅ 测试2：Many≥2（2个） - 两个元素
const [a, b] = pair
const [x, y] = pair

// ✅ 测试3：Many≥2（3个） - 三个元素
const [x, y, z] = arr

// ✅ 测试4：Many≥2 - 包含Elision的列表（跳过元素）
const [, b, , d] = array

// ✅ 测试5：Many≥2 - 多个元素的混合
const [first, , third, , fifth] = values

/* Es6Parser.ts: BindingElisionElement (Comma BindingElisionElement)* */
