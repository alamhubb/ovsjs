/**
 * 规则测试：PropertyDefinition
 * 
 * 位置：Es6Parser.ts Line 226
 * 分类：others
 * 编号：905
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   PropertyDefinition:
 *     MethodDefinition                                    (优先1 - 长规则)
 *     ... AssignmentExpression                            (优先2 - ES2018)
 *     PropertyName : AssignmentExpression                 (优先3)
 *     IdentifierReference                                 (优先4 - 属性简写)
 *     CoverInitializedName                                (优先5 - 默认值)
 * 
 * 测试目标：
 * - 覆盖所有5个Or分支
 * - 测试对象字面量的所有属性定义形式
 * - 验证Or规则的优先级顺序
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善（完整覆盖）
 */

// ✅ 测试1：MethodDefinition - 普通方法
const obj1 = {
    method() {
        return 'test'
    }
}

// ✅ 测试2：MethodDefinition - async方法
const obj2 = {
    async asyncMethod() {
        return await fetch('/api')
    }
}

// ✅ 测试3：MethodDefinition - generator方法
const obj3 = {
    *generatorMethod() {
        yield 1
        yield 2
    }
}

// ✅ 测试4：MethodDefinition - getter
const obj4 = {
    get value() {
        return this._value
    }
}

// ✅ 测试5：MethodDefinition - setter
const obj5 = {
    set value(v) {
        this._value = v
    }
}

// ✅ 测试6：MethodDefinition - getter和setter组合
const obj6 = {
    get name() {
        return this._name
    },
    set name(n) {
        this._name = n
    }
}

// ✅ 测试7：Spread语法（ES2018）
const base = {x: 1, y: 2}
const extended = {
    ...base,
    z: 3
}

// ✅ 测试8：PropertyName : AssignmentExpression - 普通键值对
const obj7 = {
    name: 'John',
    age: 30,
    active: true
}

// ✅ 测试9：PropertyName : AssignmentExpression - 计算属性名
const key = 'dynamic'
const obj8 = {
    [key]: 'value',
    [key + 'Key']: 'dynamicValue',
    ['prop' + 123]: 'computed'
}

// ✅ 测试10：PropertyName : AssignmentExpression - 表达式作为值
const obj9 = {
    sum: 1 + 2,
    condition: x > 0 ? 'positive' : 'negative',
    result: calculate()
}

// ✅ 测试11：IdentifierReference - 属性简写（ES6）
const name = 'Alice'
const age = 25
const obj10 = {
    name,
    age,
    active
}

// ✅ 测试12：CoverInitializedName - 默认值
const obj11 = {
    name = 'Guest',
    score = 0,
    active = true
}

// ✅ 测试13：混合使用所有形式
const mixed = {
    // 键值对
    id: 1,
    type: 'user',
    
    // 属性简写
    name,
    age,
    
    // 默认值
    role = 'guest',
    
    // 方法
    greet() {
        return `Hello, ${this.name}`
    },
    
    // getter/setter
    get fullName() {
        return `${this.firstName} ${this.lastName}`
    },
    
    // spread
    ...otherProps,
    
    // 计算属性名
    [dynamicKey]: 'value'
}

// ✅ 测试14：嵌套对象
const nested = {
    user: {
        name,
        profile: {
            age,
            settings: {
                theme = 'dark'
            }
        }
    }
}

// ✅ 测试15：方法的计算属性名
const methodName = 'getData'
const obj12 = {
    [methodName]() {
        return this.data
    },
    ['set' + 'Data'](value) {
        this.data = value
    }
}