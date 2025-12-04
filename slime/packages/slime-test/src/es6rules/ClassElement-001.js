/**
 * 规则测试：ClassElement
 * 编号：610
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1    ClassElement -> MethodDefinition
class C1 {
    m() {}
}

// ✅ 测试2    ClassElement -> constructor
class C2 {
    constructor() {}
}

// ✅ 测试3    ClassElement -> GeneratorMethod
class C3 {
    *gen() {}
}

// ✅ 测试4    ClassElement -> GetMethodDefinition
class C4 {
    get x() {}
}

// ✅ 测试5    ClassElement -> SetMethodDefinition
class C5 {
    set x(v) {}
}

// ✅ 测试6    ClassElement -> static MethodDefinition
class C6 {
    static s() {}
}

// ✅ 测试7    ClassElement -> FieldDefinition
class C7 {
    field = 1
}

// ✅ 测试8    ClassElement -> 混合多种元素类型
class C8 {
    constructor() {}
    *gen() {}
    get x() {}
    set x(v) {}
    static s() {}
    field = 1
    m() {}
}
/* Es2025Parser.ts: ClassElement */


// ============================================
// 来自文件: 613-ClassElement.js
// ============================================

/**
 * 规则测试：ClassElement
 * 分类：classes | 编号：613
 * 
 * 规则定义（Es2025Parser.ts）：
 * ClassElement:
 *   MethodDefinition
 *   static MethodDefinition
 *   FieldDefinition ;
 *   static FieldDefinition ;
 * 
 * 中文说明：
 * ✓ 类元素包括方法定义和字段定义
 * ✓ 可以是实例或静态的
 * ✓ 字段定义以分号结尾
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：MethodDefinition - 实例方法
class Test1 {
    method() {
        return "instance method"
    }
}

// ✅ 测试2：MethodDefinition - 静态方法
class Test2 {
    static method() {
        return "static method"
    }
}

// ✅ 测试3：MethodDefinition - getter
class Test3 {
    get value() {
        return 42
    }
}

// ✅ 测试4：MethodDefinition - 静态getter
class Test4 {
    static get value() {
        return 42
    }
}

// ✅ 测试5：MethodDefinition - setter
class Test5 {
    set value(v) {
        this._value = v
    }
}

// ✅ 测试6：MethodDefinition - 静态setter
class Test6 {
    static set value(v) {
        this._value = v
    }
}

// ✅ 测试7：MethodDefinition - generator
class Test7 {
    *gen() {
        yield 1
    }
}

// ✅ 测试8：MethodDefinition - 静态generator
class Test8 {
    static *gen() {
        yield 1
    }
}

// ✅ 测试9：FieldDefinition - 实例字段
class Test9 {
    prop = 10
}

// ✅ 测试10：FieldDefinition - 静态字段
class Test10 {
    static prop = 10
}

// ✅ 测试11：混合 - 方法和字段
class Test11 {
    prop = 5
    method() {
        return this.prop
    }
}

// ✅ 测试12：混合 - 静态和实例
class Test12 {
    static staticProp = 1
    instanceProp = 2
    static staticMethod() {
        return this.staticProp
    }
    instanceMethod() {
        return this.instanceProp
    }
}

// ✅ 测试13：constructor作为MethodDefinition
class Test13 {
    constructor() {
        this.value = 0
    }
}

// ✅ 测试14：多个元素混合
class Test14 {
    x = 1
    y = 2
    method() {
        return this.x + this.y
    }
    static create() {
        return new Test14()
    }
}

// ✅ 测试15：复杂ClassElement组合
class Test15 {
    static count = 0
    id = Test15.count++
    constructor() {
        this.created = new Date()
    }
    getId() {
        return this.id
    }
    static getCount() {
        return this.count
    }
}

/* Es2025Parser.ts: ClassElement
 * 规则：
 * ClassElement:
 *   MethodDefinition
 *   static MethodDefinition
 *   FieldDefinition ;
 *   static FieldDefinition ;
 */

/**
 * 规则测试：ClassElement
 * 编号：610
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class C1 {
    m() {}
}

// ✅ 测试2
class C2 {
    constructor() {}
}

// ✅ 测试3
class C3 {
    *gen() {}
}

// ✅ 测试4
class C4 {
    get x() {}
}

// ✅ 测试5
class C5 {
    set x(v) {}
}

// ✅ 测试6
class C6 {
    static s() {}
}

// ✅ 测试7
class C7 {
    field = 1
}

// ✅ 测试8
class C8 {
    constructor() {}
    *gen() {}
    get x() {}
    set x(v) {}
    static s() {}
    field = 1
    m() {}
}
/* Es2025Parser.ts: ClassElement */
