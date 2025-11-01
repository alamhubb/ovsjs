/**
 * 规则测试：ClassDeclaration
 * 
 * 位置：Es6Parser.ts Line 1694
 * 分类：classes
 * 编号：605
 * 
 * 规则语法：
 *   ClassDeclaration:
 *     class BindingIdentifier ClassTail
 * 
 * 测试目标：
 * - 测试基础类
 * - 测试带继承的类
 * - 测试带方法的类
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空类
class Empty {}

// ✅ 测试2：带constructor
class Person {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
}

// ✅ 测试3：带方法
class Calculator {
    add(a, b) {
        return a + b
    }
    subtract(a, b) {
        return a - b
    }
}

// ✅ 测试4：继承
class Animal {
    constructor(name) {
        this.name = name
    }
    speak() {
        console.log(this.name)
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name)
        this.breed = breed
    }
    bark() {
        console.log('Woof!')
    }
}

// ✅ 测试5：静态方法
class Math2 {
    static add(a, b) {
        return a + b
    }
    static PI = 3.14
}

// ✅ 测试6：Getter/Setter
class Rectangle {
    constructor(width, height) {
        this._width = width
        this._height = height
    }
    get area() {
        return this._width * this._height
    }
    set width(w) {
        this._width = w
    }
}

// ✅ 测试7：Generator方法
class Iterator {
    *gen() {
        yield 1
        yield 2
    }
}

// ✅ 测试8：计算属性名
const methodName = 'greet'
class Dynamic {
    [methodName]() {
        return 'Hi'
    }
}
