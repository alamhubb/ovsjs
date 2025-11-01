/**
 * 测试规则: ClassDeclaration
 * 来源: 从 Declaration 拆分
 *//* Es6Parser.ts: class Identifier (extends Expression)? { ClassBody } */

/**
 * 规则测试：ClassDeclaration
 * 
 * 位置：Es6Parser.ts Line 247
 * 分类：classes
 * 编号：605
 * 
 * 规则语法：
 *   ClassDeclaration:
 *     class Identifier ClassHeritage? { ClassBody }
 * 
 * 测试目标：
 * - 验证基本类声明
 * - 验证继承关系（extends）
 * - 覆盖构造函数、方法、属性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本类声明
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

// ✅ 测试2：带方法的类
class Rectangle {
    constructor(width, height) {
        this.width = width
        this.height = height
    }
    
    area() {
        return this.width * this.height
    }
}

// ✅ 测试3：静态方法
class Math2D {
    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }
}

// ✅ 测试4：Getter和Setter
class Circle {
    constructor(radius) {
        this._radius = radius
    }
    
    get radius() {
        return this._radius
    }
    
    set radius(value) {
        this._radius = value
    }
}

// ✅ 测试5：基本继承
class Animal {
    speak() {
        return 'sound'
    }
}

class Dog extends Animal {
    speak() {
        return 'bark'
    }
}

// ✅ 测试6：继承中的super调用
class Vehicle {
    constructor(name) {
        this.name = name
    }
}

class Car extends Vehicle {
    constructor(name, wheels) {
        super(name)
        this.wheels = wheels
    }
}

// ✅ 测试7：计算属性名
class Dynamic {
    ['method_' + 'one']() {
        return 'one'
    }
}

// ✅ 测试8：多个方法
class Utils {
    add(a, b) {
        return a + b
    }
    
    multiply(a, b) {
        return a * b
    }
    
    divide(a, b) {
        return a / b
    }
}

// ✅ 测试9：混合静态和实例方法
class Counter {
    static total = 0
    
    constructor() {
        this.count = 0
        Counter.total++
    }
    
    increment() {
        this.count++
    }
    
    static reset() {
        Counter.total = 0
    }
}

// ✅ 测试10：多层继承
class Shape {
    area() {
        return 0
    }
}

class Polygon extends Shape {
    sides() {
        return 0
    }
}

class Triangle extends Polygon {
    sides() {
        return 3
    }
}

// ✅ 测试11：类中的try-catch
class Processor {
    process(data) {
        try {
            return JSON.parse(data)
        } catch (e) {
            return null
        }
    }
}

// ✅ 测试12：类中的for循环
class Collection {
    constructor(items) {
        this.items = items
    }
    
    double() {
        let result = []
        for (let item of this.items) {
            result.push(item * 2)
        }
        return result
    }
}

// ✅ 测试13：继承中的super属性访问
class Base {
    getValue() {
        return 42
    }
}

class Derived extends Base {
    getValue() {
        return super.getValue() + 1
    }
}

// ✅ 测试14：包含多个成员的复杂类
class User {
    #password
    
    constructor(name, password) {
        this.name = name
        this.#password = password
    }
    
    static create(data) {
        return new User(data.name, data.pass)
    }
    
    getName() {
        return this.name
    }
    
    verify(pwd) {
        return this.#password === pwd
    }
    
    get type() {
        return 'user'
    }
}

// ✅ 测试15：类的实际使用场景
class Employee {
    constructor(id, name, salary) {
        this.id = id
        this.name = name
        this.salary = salary
    }
    
    giveRaise(amount) {
        this.salary += amount
        return this.salary
    }
    
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}

class Manager extends Employee {
    constructor(id, name, salary, department) {
        super(id, name, salary)
        this.department = department
    }
    
    getInfo() {
        return super.getInfo() + ` - Department: ${this.department}`
    }
}

/* Es6Parser.ts: ClassDeclaration: class Identifier ClassHeritage? { ClassBody } */

