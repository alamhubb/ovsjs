/**
 * 规则测试：LeftHandSideExpression
 * 
 * 位置：Es2025Parser.ts Line 605
 * 分类：expressions
 * 编号：209
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   LeftHandSideExpression:
 *     CallExpression
 *     NewExpression
 * 
 * 测试目标：
 * - 覆盖Or的两个分支
 * - 测试左侧表达式的所有形式
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - CallExpression（函数调用）
func()
calculate(1, 2)

// ✅ 测试2：CallExpression - 方法调用
obj.method()
arr.push(1)

// ✅ 测试3：CallExpression - 链式调用
func().then().catch()
obj.getData().process()

// ✅ 测试4：Or分支2 - NewExpression（new构造）
new Cls()
/* Es2025Parser.ts: Or[CallExpression, NewExpression] */

/**
 * 规则测试：LeftHandSideExpression
 * 
 * 位置：Es2025Parser.ts Line 605
 * 分类：expressions
 * 编号：209
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   LeftHandSideExpression:
 *     CallExpression
 *     NewExpression
 * 
 * 测试目标：
 * - 覆盖Or的两个分支
 * - 测试左侧表达式的所有形式
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - CallExpression（函数调用）
func()
calculate(1, 2)

// ✅ 测试2：CallExpression - 方法调用
obj.method()
arr.push(1)

// ✅ 测试3：CallExpression - 链式调用
func().then().catch()
obj.getData().process()

// ✅ 测试4：Or分支2 - NewExpression（new构造）
new Cls()
/* Es2025Parser.ts: Or[CallExpression, NewExpression] */
