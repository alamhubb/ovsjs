/**
 * 规则测试：PropertyDefinition
 * 分类：literals | 编号：006
 * 状态：✅ 已完善（17个测试）
 */

// ✅ 测试1-17：PropertyDefinition各种属性定义形式
const obj1 = { a: 1 }
const obj2 = { a: 1, b: 2, c: 3 }
const obj3 = { prop: 'value' }
const obj4 = { name: 'John', age: 30 }
const obj5 = { method() { return 'hello' } }
const obj6 = { get x() { return 1 } }
const obj7 = { set x(v) { } }
const obj8 = { [key]: 'value' }
const obj9 = { ...other }
const obj10 = { a, b, c }
const obj11 = { name, age = 0 }
const obj12 = { 'prop-name': 'value' }
const obj13 = { 123: 'numeric' }
const obj14 = { [Symbol.iterator]: function() {} }
const obj15 = { *gen() { yield 1 } }
const obj16 = { async method() { await Promise.resolve() } }
const obj17 = { async *gen() { yield 1 } }

/* Es6Parser.ts: PropertyDefinition */


// ============================================
// 来自文件: 905-PropertyDefinition.js
// ============================================

/**
 * 规则测试：PropertyDefinition
 * 
 * 位置：Es6Parser.ts Line 226
 * 分类：others
 * 编号：905
 * 
 * EBNF规则：
 *   PropertyDefinition:
 *     MethodDefinition | ... AssignmentExpression | 
 *     PropertyName : AssignmentExpression | IdentifierReference
 * 
 * 测试目标：
 * - 测试键值对属性
 * - 测试简写属性
 * - 测试getter属性
 * - 测试setter属性
 * - 验证所有属性定义形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：键值对属性
const obj1 = {x: 1}

// ✅ 测试2：简写属性
const obj2 = {x}

// ✅ 测试3：getter属性
const obj3 = {get x() {}}

// ✅ 测试4：setter属性
const obj4 = {set x(v) {}}

// ✅ 测试5：键值对多个
const obj5 = {x: 1, y: 2}

// ✅ 测试6：计算属性名
const obj6 = {[k]: 1}

// ✅ 测试7：spread语法
const obj7 = {...obj}

// ✅ 测试8：混合各种形式
const obj8 = {x, y: 2, [z]: 3}
/* Es6Parser.ts: PropertyDefinition */


// ============================================
// 合并来自: ObjectProperty-001.js
// ============================================

/**
 * 规则测试：ObjectProperty
 * 分类：others | 编号：703
 * 
 * 规则定义（Es6Parser.ts）：
 * ObjectProperty:
 *   PropertyName : AssignmentExpression
 * 
 * PropertyName:
 *   IdentifierName
 *   StringLiteral
 *   NumericLiteral
 *   ComputedPropertyName
 * 
 * 中文说明：
 * ✓ 对象属性由属性名和值组成
 * ✓ 属性名可以是标识符、字符串、数字或计算属性
 * ✓ 值是任何赋值表达式
 * ✓ 在对象字面量中使用
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：PropertyName - IdentifierName
const obj1 = { name: 'John' }

// ✅ 测试2：PropertyName - StringLiteral
const obj2 = { 'string-key': 'value' }

// ✅ 测试3：PropertyName - NumericLiteral
const obj3 = { 123: 'numeric' }

// ✅ 测试4：PropertyName - ComputedPropertyName
const key = 'dynamic'
const obj4 = { [key]: 'value' }

// ✅ 测试5：AssignmentExpression - 字面量
const obj5 = { prop: 42 }

// ✅ 测试6：AssignmentExpression - 变量
const value = 'test'
const obj6 = { prop: value }

// ✅ 测试7：AssignmentExpression - 函数调用
function getValue() { return 'result' }
const obj7 = { prop: getValue() }

// ✅ 测试8：AssignmentExpression - 条件表达式
const obj8 = { prop: true ? 1 : 2 }

// ✅ 测试9：AssignmentExpression - 对象字面量
const obj9 = { prop: { nested: 'value' } }

// ✅ 测试10：AssignmentExpression - 数组字面量
const obj10 = { prop: [1, 2, 3] }

// ✅ 测试11：多个属性混合
const obj11 = {
    name: 'test',
    'age': 30,
    123: 'number',
    [Symbol.iterator]: function() {}
}

// ✅ 测试12：计算属性 - 表达式
const index = 'prop_' + 1
const obj12 = { [index]: 'computed' }

// ✅ 测试13：计算属性 - 函数调用
function getPropName() { return 'dynamic' }
const obj13 = { [getPropName()]: 'value' }

// ✅ 测试14：计算属性 - Symbol
const sym = Symbol('key')
const obj14 = { [sym]: 'symbolic' }

// ✅ 测试15：属性值是赋值表达式
let x = 0
const obj15 = { prop: (x = 10, x + 1) }

// ✅ 测试16：属性值是函数表达式
const obj16 = { method: function() { return 'test' } }

/* Es6Parser.ts: ObjectProperty
 * 规则：
 * ObjectProperty:
 *   PropertyName : AssignmentExpression
 * 
 * PropertyName:
 *   IdentifierName
 *   StringLiteral
 *   NumericLiteral
 *   ComputedPropertyName
 */
