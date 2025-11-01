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


// ============================================
// 合并来自: ComputedPropertyName-001.js
// ============================================


/* Es6Parser.ts: [Expression] */


// ============================================
// 来自文件: 907-ComputedPropertyName.js
// ============================================

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

// ✅ 测试1：简单变量
const obj1 = {[a]: 1}

// ✅ 测试2：二元表达式
const obj2 = {[a + b]: 2}

// ✅ 测试3：算术表达式
const obj3 = {[1 + 2]: 3}

// ✅ 测试4：函数调用
const obj4 = {[func()]: 4}

// ✅ 测试5：三元表达式
const obj5 = {[a ? b : c]: 5}

// ✅ 测试6：符号属性
const obj6 = {[Symbol.iterator]: 6}

// ✅ 测试7：字符串计算
const obj7 = {['str']: 7}

// ✅ 测试8：嵌套计算
const obj8 = {[[x]]: 8}
/* Es6Parser.ts: ComputedPropertyName */


// ============================================
// 合并来自: PropertyNameMethodDefinition-001.js
// ============================================

/**
 * 规则测试：PropertyNameMethodDefinition
 * 
 * 位置：Es6Parser.ts Line 1522
 * 分类：classes
 * 编号：601
 * 
 * EBNF规则：
 *   PropertyNameMethodDefinition:
 *     PropertyName ( FunctionFormalParameters ) { FunctionBody }
 *     async PropertyName ( FunctionFormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 测试基础方法定义
 * - 测试async方法
 * - 测试带参数的方法
 * - 测试空参数方法
 * - 测试计算属性名方法
 * - 测试多个方法混合
 * - 测试静态和实例方法
 * - 测试方法的返回值
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础方法
class Test1 {
    method() {}
}

// ✅ 测试2：async方法
class Test2 {
    async method() {}
}

// ✅ 测试3：带参数的方法
class Test3 {
    add(a, b) {
        return a + b
    }
}

// ✅ 测试4：async带参数的方法
class Test4 {
    async fetch(url) {
        return await api(url)
    }
}

// ✅ 测试5：多个方法混合
class Test5 {
    method1() {}
    async method2() {}
    method3(x) { return x * 2 }
}

// ✅ 测试6：计算属性名方法
class Test6 {
    ['customName']() {
        return 'dynamic'
    }
}

// ✅ 测试7：数字名称方法
class Test7 {
    0() {}
    1() {}
}

// ✅ 测试8：混合各种形式
class Test8 {
    regular() {}
    async asyncMethod(x) { return await x }
    ['computed']() {}
    static staticMethod() {}
}

/* Es6Parser.ts: PropertyNameMethodDefinition */

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
