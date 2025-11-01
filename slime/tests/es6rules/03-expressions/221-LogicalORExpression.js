/**
 * 规则测试：LogicalORExpression
 * 
 * 位置：Es6Parser.ts Line 774
 * 分类：expressions
 * 编号：221
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   LogicalORExpression:
 *     LogicalANDExpression (|| LogicalANDExpression)*
 * 
 * 测试目标：
 * - 测试Many=0/1/多
 * - 测试逻辑或运算
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 无逻辑或
const single = a

// ✅ 测试2：Many=1 - 两个操作数
const or = a || b
const either = isEmpty || isDisabled

// ✅ 测试3：Many=2 - 三个操作数
const or3 = x || y || z
const any = cond1 || cond2 || cond3

// ✅ 测试4：Many=3 - 四个操作数
const or4 = a || b || c || d

// ✅ 测试5：默认值模式（最常用）
const value = input || 'default'
const name = user.name || 'Guest'

// ✅ 测试6：短路求值
const result = cache || compute()
const data = stored || fetchData()

// ✅ 测试7：在条件中
if (isAdmin || isSuperUser) {}
if (a > 10 || b > 10 || c > 10) {}

// ✅ 测试8：多层默认值
const config = userConfig || defaultConfig || fallbackConfig
const port = process.env.PORT || args.port || 3000