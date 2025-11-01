/**
 * 规则测试：AssignmentExpression
 * 
 * 位置：Es6Parser.ts Line 1048
 * 分类：expressions
 * 编号：224
 * 
 * 规则语法：
 *   AssignmentExpression:
 *     ConditionalExpression
 *     LeftHandSideExpression = AssignmentExpression
 *     LeftHandSideExpression op= AssignmentExpression (+=, -=, etc)
 * 
 * 测试目标：
 * - 验证赋值表达式
 * - 覆盖各种赋值操作符
 * - 验证左值类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本赋值
let x = 5

// ✅ 测试2：重新赋值
x = 10

// ✅ 测试3：复合赋值 +=
x += 5

// ✅ 测试4：复合赋值 -=
x -= 3

// ✅ 测试5：复合赋值 *=
x *= 2

// ✅ 测试6：复合赋值 /=
x /= 2

// ✅ 测试7：复合赋值 %=
x %= 3

// ✅ 测试8：复合赋值 &=
let bits = 15
bits &= 7

// ✅ 测试9：复合赋值 |=
bits |= 8

// ✅ 测试10：复合赋值 ^=
bits ^= 3

// ✅ 测试11：对象属性赋值
const obj = {}
obj.prop = 'value'

// ✅ 测试12：数组元素赋值
const arr = [1, 2, 3]
arr[0] = 10

// ✅ 测试13：链式赋值
let a, b, c
a = b = c = 5

// ✅ 测试14：对象属性复合赋值
obj.count = 0
obj.count += 1

// ✅ 测试15：数组元素复合赋值
arr[1] += 10

/* Es6Parser.ts: AssignmentExpression: = or CompoundAssignmentOp */
