/**
 * 规则测试：AssignmentExpression
 * 
 * 位置：Es6Parser.ts Line 954
 * 分类：expressions
 * 编号：224
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   AssignmentExpression:
 *     YieldExpression                                (优先1)
 *     ArrowFunction                                  (优先2 - 长匹配)
 *     LeftHandSideExpression = AssignmentExpression  (优先3)
 *     LeftHandSideExpression AssignmentOperator AssignmentExpression  (优先4)
 *     ConditionalExpression                          (优先5 - 回退)
 * 
 * 测试目标：
 * - 覆盖所有5个Or分支
 * - 验证Or顺序的正确性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：简单赋值 (= 运算符)
const a = 1
let b = 2
var c = 3

// ✅ 测试2：复合赋值运算符
let x = 10
x += 5
x -= 3
x *= 2
x /= 4
x %= 3

// ✅ 测试3：ArrowFunction (必须优先于ConditionalExpression)
const add = (a, b) => a + b
const square = x => x * x
const noop = () => {}

// ✅ 测试4：YieldExpression (generator中)
function* gen() {
    yield 1
    yield 2
}

// ✅ 测试5：ConditionalExpression (回退)
const result = x > 0 ? 'positive' : 'negative'
const value = a ? b : c ? d : e

// ✅ 测试6：链式赋值
let i, j, k
i = j = k = 0

// ✅ 测试7：对象属性赋值
const obj = {}
obj.prop = 'value'
obj['key'] = 'value'

// ✅ 测试8：数组元素赋值
const arr = []
arr[0] = 1
arr[1] = 2

// ✅ 测试9：解构赋值
const {name, age} = person
const [first, second] = array
