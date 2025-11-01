/**
 * 规则测试：BindingElement
 * 分类：identifiers | 编号：112
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1-15：BindingElement各种绑定元素形式
const [a] = [1]
const [a, b] = [1, 2]
const [a, b, c] = [1, 2, 3]
const [x = 0] = []
const [x = 0, y = 0] = [1]
const [[inner]] = [[1]]
const [{ prop }] = [{ prop: 1 }]
const [a, ...rest] = [1, 2, 3]
const [, second] = [1, 2]
const [, , third] = [1, 2, 3]
const { x } = { x: 1 }
const { x = 0 } = {}
const { x: renamed } = { x: 1 }
const { a, b, c } = { a: 1, b: 2, c: 3 }
const { prop: { nested } } = { prop: { nested: 1 } }

/* Es6Parser.ts: BindingElement */


// ============================================
// 来自文件: 113-BindingElement.js
// ============================================

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

/* Es6Parser.ts: Or[SingleNameBinding, BindingPattern] */


/* Es6Parser.ts: Or[SingleNameBinding, BindingPattern] */

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

/* Es6Parser.ts: Or[SingleNameBinding, BindingPattern] */
