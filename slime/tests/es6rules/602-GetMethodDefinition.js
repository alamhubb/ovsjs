/**
 * 规则测试：GetMethodDefinition
 * 
 * 位置：Es6Parser.ts Line 1529
 * 分类：classes
 * 编号：602
 * 
 * EBNF规则：
 *   GetMethodDefinition:
 *     get PropertyName ( ) { FunctionBody }
 * 
 * 测试目标：
 * - 测试基础getter
 * - 测试返回简单值的getter
 * - 测试返回计算值的getter
 * - 测试返回对象的getter
 * - 测试计算属性名的getter
 * - 测试多个getter
 * - 测试静态getter
 * - 测试getter与其他方法混合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基础getter
class Test1 {
    get value() {
        return this._value
    }
}

// ✅ 测试2：简单值getter
class Test2 {
    get name() {
        return 'John'
    }
}

// ✅ 测试3：计算值getter
class Test3 {
    get area() {
        return this.width * this.height
    }
}

// ✅ 测试4：返回对象的getter
class Test4 {
    get config() {
        return {
            timeout: 5000,
            debug: true
        }
    }
}

// ✅ 测试5：计算属性名getter
class Test5 {
    get ['computed']() {
        return 'dynamic'
    }
}

// ✅ 测试6：多个getter
class Test6 {
    get x() { return 1 }
    get y() { return 2 }
    get sum() { return this.x + this.y }
}

// ✅ 测试7：静态getter
class Test7 {
    static get version() {
        return '1.0.0'
    }
}

// ✅ 测试8：getter与其他方法混合
class Test8 {
    constructor() {
        this._value = 0
    }
    get value() {
        return this._value
    }
    setValue(v) {
        this._value = v
    }
    reset() {
        this._value = 0
    }
}

/* Es6Parser.ts: GetMethodDefinition */
