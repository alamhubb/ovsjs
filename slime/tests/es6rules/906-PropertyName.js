/**
 * 规则测试：PropertyName
 * 
 * 位置：Es6Parser.ts Line 237
 * 分类：others
 * 编号：906
 * 
 * EBNF规则：
 *   PropertyName:
 *     LiteralPropertyName | ComputedPropertyName
 *   LiteralPropertyName:
 *     IdentifierName | StringLiteral | NumericLiteral
 * 
 * 测试目标：
 * - 测试标识符属性名
 * - 测试字符串字面量属性名
 * - 测试数字字面量属性名
 * - 测试计算属性名
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单标识符属性名
const obj1 = {x: 1}

// ✅ 测试2：数字属性名
const obj2 = {1: 'a', 2: 'b'}

// ✅ 测试3：字符串属性名
const obj3 = {'str': 'value'}

// ✅ 测试4：保留字属性名
const obj4 = {true: 'c', false: 'd', null: 'e'}

// ✅ 测试5：浮点数属性名
const obj5 = {1.5: 'float', 3.14: 'pi'}

// ✅ 测试6：混合字面量属性名
const obj6 = {x: 1, 2: 'num', 'string': 'str'}

// ✅ 测试7：特殊字符属性名
const obj7 = {'_name': 'under', '$value': 'dollar', 'a-b': 'dash'}

// ✅ 测试8：计算属性名
const obj8 = {[expr]: 'computed', [a + b]: 'computed_expr'}
/* Es6Parser.ts: PropertyName */
