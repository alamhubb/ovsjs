/**
 * 规则测试：PostfixExpression
 * 
 * 位置：Es6Parser.ts Line 1006
 * 分类：expressions
 * 编号：210
 * 
 * 规则语法：
 *   PostfixExpression:
 *     LeftHandSideExpression
 *     LeftHandSideExpression ++
 *     LeftHandSideExpression --
 * 
 * 测试目标：
 * - 验证后置递增运算符
 * - 验证后置递减运算符
 * - 覆盖各种左值
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本后置递增
let x = 5
x++

// ✅ 测试2：基本后置递减
x--

// ✅ 测试3：多次递增
for (let i = 0; i < 5; i++) {
    console.log(i)
}

// ✅ 测试4：对象属性递增
const obj = { count: 0 }
obj.count++

// ✅ 测试5：数组元素递增
const arr = [1, 2, 3]
arr[0]++

// ✅ 测试6：表达式中的递增
const y = x++ + 5

// ✅ 测试7：条件中的递增
if (x++ > 10) {
    console.log('done')
}

// ✅ 测试8：循环中的递减
while (x-- > 0) {
    console.log(x)
}

// ✅ 测试9：函数参数中的递增
Math.max(x++, y++)

// ✅ 测试10：数组中的递增
const values = [x++, x++, x++]

// ✅ 测试11：对象字面量中
const data = { first: x++, second: x++ }

// ✅ 测试12：链式属性访问递增
const nested = { level1: { count: 0 } }
nested.level1.count++

// ✅ 测试13：复杂表达式
const result = (obj.value++)

// ✅ 测试14：混合递增递减
x++
y--
x++

// ✅ 测试15：循环初始化
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j)
}

/* Es6Parser.ts: PostfixExpression: ++ or -- */
