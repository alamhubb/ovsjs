/**
 * 规则测试：ClassElement
 * 
 * 位置：Es6Parser.ts Line 1671
 * 分类：classes
 * 编号：610
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   ClassElement:
 *     MethodDefinition                    (分支1)
 *     static MethodDefinition             (分支2)
 *     FieldDefinition                     (分支3)
 *     static FieldDefinition              (分支4)
 *     EmptySemicolon                      (分支5)
 * 
 * 测试目标：
 * - 覆盖所有5个Or分支
 * - 测试类的所有成员定义形式
 * - 测试static和非static的所有组合
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善（完整覆盖）
 */

// ✅ 测试1：MethodDefinition - 实例方法
class Test1 {
    method() {
        return 'test'
    }
}

// ✅ 测试2：static MethodDefinition - 静态方法
class Test2 {
    static staticMethod() {
        return 'static'
    }
}

// ✅ 测试3：FieldDefinition - 实例字段
class Test3 {
    field = 1
    name = 'test'
}

// ✅ 测试4：static FieldDefinition - 静态字段
class Test4 {
    static staticField = 2
    static count = 0
}

// ✅ 测试5：EmptySemicolon - 空语句
class Test5 {
    ;
    ;
}

// ✅ 测试6：MethodDefinition - async方法
class Test6 {
    async asyncMethod() {
        return await fetch('/api')
    }
}

// ✅ 测试7：MethodDefinition - generator方法
class Test7 {
    *generatorMethod() {
        yield 1
        yield 2
    }
}

// ✅ 测试8：MethodDefinition - getter
class Test8 {
    get value() {
        return this._value
    }
}

// ✅ 测试9：MethodDefinition - setter
class Test9 {
    set value(v) {
        this._value = v
    }
}

// ✅ 测试10：MethodDefinition - getter和setter组合
class Test10 {
    get name() {
        return this._name
    }
    set name(n) {
        this._name = n
    }
}

// ✅ 测试11：static MethodDefinition - 各种形式
class Test11 {
    static async asyncStatic() {
        return await Promise.resolve()
    }
    static *generatorStatic() {
        yield 'static'
    }
    static get staticValue() {
        return Test11._staticValue
    }
    static set staticValue(v) {
        Test11._staticValue = v
    }
}

// ✅ 测试12：FieldDefinition - 带初始化表达式
class Test12 {
    count = 0
    name = 'default'
    items = []
    config = {enabled: true}
    computed = 1 + 2
}

// ✅ 测试13：FieldDefinition - 不带初始化
class Test13 {
    field
    name
    value
}

// ✅ 测试14：混合使用所有形式
class CompleteTest {
    // 实例字段
    id = 0
    name = 'test'
    
    // 静态字段
    static count = 0
    static version = '1.0.0'
    
    // 构造函数（是MethodDefinition）
    constructor() {
        this.id = ++CompleteTest.count
    }
    
    // 实例方法
    greet() {
        return `Hello, ${this.name}`
    }
    
    async loadData() {
        return await fetch('/api')
    }
    
    *iterate() {
        yield this.id
        yield this.name
    }
    
    // Getter/Setter
    get fullName() {
        return this.name
    }
    
    set fullName(n) {
        this.name = n
    }
    
    // 静态方法
    static create() {
        return new CompleteTest()
    }
    
    static async fetchAll() {
        return await fetch('/api/all')
    }
    
    static *range(n) {
        for (let i = 0; i < n; i++) {
            yield i
        }
    }
    
    // 静态Getter/Setter
    static get total() {
        return CompleteTest.count
    }
    
    static set total(n) {
        CompleteTest.count = n
    }
    
    // 空语句
    ;
}

// ✅ 测试15：计算属性名
const methodName = 'dynamicMethod'
const fieldName = 'dynamicField'

class Test15 {
    [fieldName] = 'value'
    static [fieldName + 'Static'] = 'static value'
    
    [methodName]() {
        return 'dynamic'
    }
    
    static [methodName + 'Static']() {
        return 'static dynamic'
    }
}