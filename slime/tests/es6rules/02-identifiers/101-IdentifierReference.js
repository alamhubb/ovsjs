/**
 * 规则测试：IdentifierReference
 * 
 * 位置：Es6Parser.ts Line 61
 * 分类：identifiers
 * 编号：101
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- Identifier
 * 
 * 规则语法：
 *   IdentifierReference:
 *     Identifier
 * 
 * 测试目标：
 * - 测试标识符引用（读取变量值）
 * - 在各种上下文中使用标识符引用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：变量声明中引用
const a = 1
const b = a
const c = b

// ✅ 测试2：函数返回值
function test() {
    return x
}

// ✅ 测试3：表达式中引用
const sum = a + b
const product = x * y

// ✅ 测试4：函数参数中引用
function add(num1, num2) {
    return num1 + num2
}

// ✅ 测试5：对象属性值
const obj = {
    value: a,
    data: b
}

// ✅ 测试6：数组元素
const arr = [a, b, c]

// ✅ 测试7：条件表达式
if (x > 0) {
    console.log(y)
}

// ✅ 测试8：赋值右侧
let result = value