/**
 * 规则测试：Expression
 * 
 * 位置：Es6Parser.ts Line 846
 * 分类：expressions
 * 编号：223
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   Expression:
 *     AssignmentExpression ( , AssignmentExpression )*
 * 
 * 测试目标：
 * - 测试单个表达式
 * - 测试逗号分隔的多个表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个表达式
const a = 1

// ✅ 测试2：逗号运算符 - 2个表达式
let x, y
x = 1, y = 2

// ✅ 测试3：逗号运算符 - 多个表达式
let result = (x = 1, y = 2, x + y)

// ✅ 测试4：for循环中的逗号表达式
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j)
}

// ✅ 测试5：函数调用中（非逗号运算符）
func(a, b, c)

// ✅ 测试6：复杂表达式组合
const value = (console.log('start'), compute(), console.log('end'), 42)
