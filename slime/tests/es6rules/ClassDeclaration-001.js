/**
 * 测试规则: ClassDeclaration
 * 来源: 从 Declaration 拆分
 */

/* Es6Parser.ts: class Identifier (extends Expression)? { ClassBody } */

// ✅ 测试1：基本类声明    ClassDeclaration -> class Identifier (无extends) ClassBody (constructor)
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

// ✅ 测试2：带方法的类    ClassDeclaration -> ClassBody (MethodDefinition)
class Rectangle {
    constructor(width, height) {
        this.width = width
        this.height = height
    }
    
    area() {
        return this.width * this.height
    }
}

// ✅ 测试3：静态方法    ClassDeclaration -> ClassBody (static MethodDefinition)
class Math2D {
    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }
}

// ✅ 测试4：Getter和Setter    ClassDeclaration -> ClassBody (GetMethodDefinition/SetMethodDefinition)
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

// ✅ 测试5：基本继承    ClassDeclaration -> ClassHeritage (extends) 基类
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

// ✅ 测试6：继承中的super调用    ClassDeclaration -> extends + constructor中super()
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

// ✅ 测试7：计算属性名    ClassDeclaration -> ClassBody (ComputedPropertyName的MethodDefinition)
class Dynamic {
    ['method_' + 'one']() {
        return 'one'
    }
}

// ✅ 测试8：多个方法    ClassDeclaration -> ClassBody (Multiple MethodDefinition)
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

// ✅ 测试9：混合静态和实例方法    ClassDeclaration -> ClassBody (混合static和实例MethodDefinition)
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

// ✅ 测试10：多层继承    ClassDeclaration -> 多级extends (Polygon extends Shape, Triangle extends Polygon)
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

// ✅ 测试11：类中的try-catch    ClassDeclaration -> ClassBody (MethodDefinition内包含TryStatement)
class Processor {
    process(data) {
        try {
            return JSON.parse(data)
        } catch (e) {
            return null
        }
    }
}

// ✅ 测试12：类中的for循环    ClassDeclaration -> ClassBody (MethodDefinition内包含ForStatement)
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

// ✅ 测试13：继承中的super属性访问    ClassDeclaration -> extends + super.propertyAccess
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

// ✅ 测试14：包含多个成员的复杂类    ClassDeclaration -> 复杂ClassBody (static, getter, private)
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

// ✅ 测试15：类的实际使用场景    ClassDeclaration -> 实际应用（继承+多层+ super）
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

