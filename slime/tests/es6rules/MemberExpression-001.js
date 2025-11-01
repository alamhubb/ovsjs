/**
 * 规则测试：MemberExpression
 * 
 * 位置：Es6Parser.ts Line 378
 * 分类：expressions
 * 编号：204
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）- 4个初始分支
 * ✓ 包含Many（1处）- 3种链式方式
 * 
 * 规则语法：
 *   MemberExpression:
 *     PrimaryExpression
 *     SuperProperty
 *     MetaProperty
 *     new MemberExpression Arguments
 *   followed by:
 *     [ Expression ]
 *     . IdentifierName
 *     TemplateLiteral
 * 
 * 测试目标：
 * - 覆盖Or分支：PrimaryExpression、SuperProperty、MetaProperty、new
 * - 覆盖Many的3种链式：方括号、点号、模板字符串
 * - 验证链式成员访问：obj.a.b[c].d
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - PrimaryExpression（对象字面量）
const obj1 = { prop: 42 }
const value1 = obj1.prop

// ✅ 测试2：Or分支1 - PrimaryExpression（数组）
const arr = [1, 2, 3]
const value2 = arr[0]

// ✅ 测试3：Or分支1 - PrimaryExpression（函数）
function getObj() { return { x: 1 } }
const value3 = getObj().x

// ✅ 测试4：Or分支1 - PrimaryExpression（标识符）
let obj2 = { a: 1 }
const value4 = obj2.a

// ✅ 测试5：Or分支2 - SuperProperty（方括号形式）
class Parent {
    method() { return 'parent' }
}
class Child extends Parent {
    test() {
        return super['method']()
    }
}

// ✅ 测试6：Or分支2 - SuperProperty（点号形式）
class Child2 extends Parent {
    test() {
        return super.method()
    }
}

// ✅ 测试7：Or分支3 - MetaProperty（new.target）
function Foo() {
    if (new.target) {
        console.log('called with new')
    }
}

// ✅ 测试8：Or分支4 - new MemberExpression Arguments
const result = new Date(2025, 10, 1)

// ✅ 测试9：Many=1 - 点号链式
const obj3 = { nested: { deep: 42 } }
const value5 = obj3.nested.deep

// ✅ 测试10：Many=1 - 方括号链式
const matrix = [[1, 2], [3, 4]]
const value6 = matrix[0][1]

// ✅ 测试11：Many=1 - 模板字符串链式
function tag(strings) { return strings[0] }
const str = tag`template`

// ✅ 测试12：Many=2 - 混合点号和方括号
const data = { items: [{ id: 1 }, { id: 2 }] }
const value7 = data.items[0].id

// ✅ 测试13：Many=3 - 复杂成员访问链
const complex = { a: { b: { c: { d: 42 } } } }
const value8 = complex.a.b.c.d

// ✅ 测试14：Many混合 - 点号、方括号、点号
const obj4 = { props: { values: [{ name: 'test' }] } }
const value9 = obj4.props.values[0].name

// ✅ 测试15：实际场景 - DOM元素属性链
const element = { parentElement: { children: [{ id: 'first' }] } }
const elemId = element.parentElement.children[0].id

/* Es6Parser.ts: MemberExpression: Or[PrimaryExpression, SuperProperty, MetaProperty, new MemberExpression Arguments], Many: [Expression] | .IdentifierName | TemplateLiteral */


// ============================================
// 合并来自: DotMemberExpression-001.js
// ============================================

/**
 * 规则测试：DotMemberExpression
 * 
 * 位置：Es6Parser.ts Line 420
 * 分类：expressions
 * 编号：205
 * 
 * 规则特征：
 * 简单规则
 * 
 * 测试目标：
 * - 验证规则的基本功能



 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

obj.property
promise.then()
arr.map()

/* Es6Parser.ts: . IdentifierName */
