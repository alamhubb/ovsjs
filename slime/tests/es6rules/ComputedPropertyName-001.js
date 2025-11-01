/**
 * 测试规则: ComputedPropertyName
 * 来源: 从 PropertyName 拆分
 */

/* Es6Parser.ts: [Expression] */

/**
 * 规则测试：ComputedPropertyName
 * 
 * 位置：Es6Parser.ts Line 247
 * 分类：others
 * 编号：907
 * 
 * EBNF规则：
 *   ComputedPropertyName:
 *     [ AssignmentExpression ]
 * 
 * 测试目标：
 * - 测试简单变量的计算属性名
 * - 测试表达式的计算属性名
 * - 测试复杂计算属性名
 * - 验证嵌套表达式支持
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单变量    ComputedPropertyName -> [ IdentifierReference ]
const obj1 = {[a]: 1}

// ✅ 测试2：二元表达式    ComputedPropertyName -> [ BinaryExpression ]
const obj2 = {[a + b]: 2}

// ✅ 测试3：算术表达式    ComputedPropertyName -> [ AdditiveExpression ]
const obj3 = {[1 + 2]: 3}

// ✅ 测试4：函数调用    ComputedPropertyName -> [ CallExpression ]
const obj4 = {[func()]: 4}

// ✅ 测试5：三元表达式    ComputedPropertyName -> [ ConditionalExpression ]
const obj5 = {[a ? b : c]: 5}

// ✅ 测试6：符号属性    ComputedPropertyName -> [ MemberExpression (Symbol.iterator) ]
const obj6 = {[Symbol.iterator]: 6}

// ✅ 测试7：字符串计算    ComputedPropertyName -> [ StringLiteral ]
const obj7 = {['str']: 7}

// ✅ 测试8：嵌套计算    ComputedPropertyName -> [ 复杂AssignmentExpression ]
const obj8 = {[[x]]: 8}
/* Es6Parser.ts: ComputedPropertyName */
