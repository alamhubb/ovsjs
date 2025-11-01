/**
 * 规则测试：MultiplicativeOperator
 * 
 * 位置：Es6Parser.ts Line 670
 * 分类：operators
 * 编号：301
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 3个分支
 * 
 * 规则语法：
 *   MultiplicativeOperator:
 *     *
 *     /
 *     %
 * 
 * 测试目标：
 * - 覆盖所有3个运算符
 * - 测试各种使用场景
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：* 运算符 - 基础
const a = 2 * 3
const multiply = 10 * 5

// ✅ 测试2：* 运算符 - 多个
const product = 2 * 3 * 4
const calc = x * y * z

// ✅ 测试3：/ 运算符 - 基础
const b = 10 / 2
const divide = 100 / 5

// ✅ 测试4：/ 运算符 - 浮点数
const half = 5 / 2
const ratio = width / height

// ✅ 测试5：% 运算符 - 基础
const c = 10 % 3