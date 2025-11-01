/**
 * 规则测试：MethodDefinition
 * 
 * 位置：Es6Parser.ts Line 1544
 * 分类：classes
 * 编号：604
 * 
 * EBNF规则：
 *   MethodDefinition:
 *     PropertyNameMethodDefinition
 *     GeneratorMethod
 *     get PropertyName ( ) { FunctionBody }
 *     set PropertyName ( FunctionFormalParameters ) { FunctionBody }
 * 
 * 测试目标：覆盖所有方法定义类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：普通方法
class Test {
    method() {}
}

// ✅ 测试2：async方法
class Test2 {
    *generator() {}
}

// ✅ 测试3：getter方法
class Test3 {
    get prop() {}
}

// ✅ 测试4：setter方法
class Test4 {
    set prop(v) {}
}

// ✅ 测试5：async方法
class Test5 {
    async method() {}
}

// ✅ 测试6：带参数的方法
class Test6 {
    greet(name) { return 'hello' }
}

// ✅ 测试7：计算属性名方法
class Test7 {
    [Symbol.iterator]() { return this }
}

// ✅ 测试8：所有类型混合
class Test8 {
    method() {}
    *gen() { yield 1 }
    get x() { return 1 }
    set x(v) {}
    async async() {}
}

/* Es6Parser.ts: MethodDefinition */
