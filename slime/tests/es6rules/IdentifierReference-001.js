/**
 * 规则测试：IdentifierReference
 * 
 * 位置：Es6Parser.ts Line 198
 * 分类：identifiers
 * 编号：101
 * 
 * 规则语法：
 *   IdentifierReference:
 *     Identifier but not ReservedWord
 * 
 * 测试目标：
 * - 验证标识符引用
 * - 覆盖各种使用场景
 * - 验证作用域
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：简单标识符引用
const x = 5

// ✅ 测试2：标识符使用
console.log(x)

// ✅ 测试3：多个标识符
const a = 1
const b = 2
const c = a + b

// ✅ 测试4：函数调用
function test() { return 42 }
test()

// ✅ 测试5：对象属性引用
const obj = { name: 'test' }
obj.name

// ✅ 测试6：数组元素引用
const arr = [1, 2, 3]
arr[0]

// ✅ 测试7：函数参数
function greet(name) {
    console.log(name)
}

// ✅ 测试8：循环变量
for (let i = 0; i < 10; i++) {
    console.log(i)
}

// ✅ 测试9：条件中的标识符
if (x > 0) {
    console.log('positive')
}

// ✅ 测试10：作用域引用
{
    let localVar = 'local'
    console.log(localVar)
}

// ✅ 测试11：嵌套作用域
function outer() {
    const outerVar = 'outer'
    function inner() {
        console.log(outerVar)
    }
    inner()
}

// ✅ 测试12：对象方法
const person = {
    name: 'Alice',
    getName: function() {
        return this.name
    }
}
person.getName()

// ✅ 测试13：解构中的标识符
const { x: xVal, y: yVal } = { x: 1, y: 2 }

// ✅ 测试14：类成员引用
class MyClass {
    method() {
        return this.value
    }
}

// ✅ 测试15：导入标识符
import { someFunction } from './module.js'
someFunction()

/* Es6Parser.ts: IdentifierReference: Identifier */


// ============================================
// 合并来自: UnicodeEscapeSequence-001.js
// ============================================


/* Es6Parser.ts: u HexDigit{4} | u{ HexDigit+ } */
