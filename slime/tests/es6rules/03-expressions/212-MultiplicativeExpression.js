/**
 * 规则测试：MultiplicativeExpression
 * 
 * 位置：Es6Parser.ts Line 661
 * 分类：expressions
 * 编号：212
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   MultiplicativeExpression:
 *     UnaryExpression (MultiplicativeOperator UnaryExpression)*
 * 
 * 测试目标：
 * - 测试Many=0（单个操作数）
 * - 测试Many=1（两个操作数）
 * - 测试Many>=2（多个操作数）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 单个操作数
const single = a

// ✅ 测试2：Many=1 - * 运算符
const mult = a * b
const product = x * y

// ✅ 测试3：Many=1 - / 运算符
const div = c / d
const ratio = width / height

// ✅ 测试4：Many=1 - % 运算符
const mod = e % f
const rem = n % 10

// ✅ 测试5：Many=2 - 三个操作数
const calc1 = a * b / c
const calc2 = x / y * z

// ✅ 测试6：Many=3 - 四个操作数
const complex = a * b * c * d
const formula = w * x / y % z

// ✅ 测试7：混合运算符
const mixed = 100 * 2 / 5 % 3

// ✅ 测试8：在复杂表达式中
const area = width * height
const avg = sum / count
const check = value % 256

a * b
c / d
e % f
a * b / c
