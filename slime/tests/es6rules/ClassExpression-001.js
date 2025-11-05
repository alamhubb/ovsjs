/**
 * 测试规则: ClassExpression
 * 来源: 从 Expression 拆分
 */

/**
 * 规则测试：ClassExpression
 * 
 * 位置：Es2025Parser.ts Line 268
 * 分类：expressions
 * 编号：230
 * 
 * 规则特征：
 * ✓ 包含Option（2处）- 类名、extends子句
 * 
 * 规则语法：
 *   ClassExpression:
 *     class Identifier? extends? Expression? { ClassBody }
 * 
 * 测试目标：
 * - 覆盖Option1无：匿名类表达式
 * - 覆盖Option1有：命名类表达式
 * - 覆盖Option2无：不继承
 * - 覆盖Option2有：继承基类
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option1无 Option2无 - 匿名类（无继承）    ClassExpression -> class (无Identifier) { ClassBody } (Option1无, Option2无)
const SimpleClass = class {
    constructor(x) {
        this.x = x
    }
    getValue() {
        return this.x
    }
}

// ✅ 测试2：Option1有 Option2无 - 命名类（无继承）    ClassExpression -> class Identifier { ClassBody } (Option1有, Option2无)
const NamedClass = class MyClass {
    method() {
        return 'named'
    }
}

// ✅ 测试3：Option1无 Option2有 - 匿名类（有继承）    ClassExpression -> class extends Expression { ClassBody } (Option1无, Option2有)
class BaseClass {
    base() {
        return 'base'
    }
}
const DerivedClass = class extends BaseClass {
    derived() {
        return 'derived'
    }
}

// ✅ 测试4：Option1有 Option2有 - 命名类（有继承）    ClassExpression -> class Identifier extends Expression { ClassBody } (Option1有, Option2有)
const NamedDerivedClass = class MyDerived extends BaseClass {
    method() {
        return super.base() + ' derived'
    }
}

// ✅ 测试5：构造函数    ClassExpression -> ClassBody (constructor MethodDefinition)
const WithConstructor = class {
    constructor(a, b) {
        this.a = a
        this.b = b
    }
}

// ✅ 测试6：static 方法    ClassExpression -> ClassBody (static MethodDefinition)
const StaticMethods = class {
    static staticMethod() {
        return 'static'
    }
    instanceMethod() {
        return 'instance'
    }
}

// ✅ 测试7：getter 和 setter    ClassExpression -> ClassBody (GetMethodDefinition/SetMethodDefinition)
const GetterSetter = class {
    get value() {
        return this._value
    }
    set value(v) {
        this._value = v
    }
}

// ✅ 测试8：计算属性名    ClassExpression -> ClassBody (ComputedPropertyName MethodDefinition)
const ComputedProperty = class {
    ['computed_' + 'method']() {
        return 'computed'
    }
}

// ✅ 测试9：在条件表达式中    ClassExpression -> ConditionalExpression中的Or分支
const ConditionalClass = condition ? class { method1() {} } : class { method2() {} }

// ✅ 测试10：类表达式作为参数    ClassExpression -> 函数参数中的ClassExpression
function createInstance(ClassConstructor) {
    return new ClassConstructor()
}
const instance = createInstance(class { constructor() { this.value = 42 } })

// ✅ 测试11：嵌套继承    ClassExpression -> 多级extends (extends Level2)
class Level1 {}
class Level2 extends Level1 {}
const Level3 = class extends Level2 {
    method() {}
}

// ✅ 测试12：super 调用    ClassExpression -> extends + constructor内super()
const WithSuper = class extends BaseClass {
    constructor(x) {
        super()
        this.x = x
    }
}

// ✅ 测试13：多个方法    ClassExpression -> ClassBody (Multiple MethodDefinition)
const MultiMethod = class {
    method1() { return 1 }
    method2() { return 2 }
    method3() { return 3 }
}

// ✅ 测试14：立即调用类表达式    ClassExpression -> new (ClassExpression)()
const obj = new (class {
    constructor() {
        this.value = 42
    }
})()

// ✅ 测试15：复杂类表达式    ClassExpression -> 扩展内置类(extends Array) + static + 多方法
const ComplexClass = class extends Array {
    constructor(...items) {
        super(...items)
        this.type = 'extended'
    }
    static create(...items) {
        return new this(...items)
    }
    getType() {
        return this.type
    }
}

/* Es2025Parser.ts: ClassExpression: class Identifier? extends Expression? { ClassBody } */


/* Es2025Parser.ts: class Identifier? (extends Expression)? { ClassBody } */
