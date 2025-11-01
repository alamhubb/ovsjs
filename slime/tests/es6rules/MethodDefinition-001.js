
/* Es6Parser.ts: Or[PropertyName(Params){Body}, get PropertyName(){Body}, set PropertyName(Param){Body}, *Identifier(Params){Body}] */


// ============================================
// 来自文件: 604-MethodDefinition.js
// ============================================

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


// ============================================
// 来自文件: 611-MethodDefinition.js
// ============================================

/**
 * 规则测试：MethodDefinition
 * 分类：classes | 编号：611
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1-16：MethodDefinition各种方法定义形式
class C1 { method() {} }
class C2 { methodA() {} methodB() {} }
class C3 { get prop() { return 1 } }
class C4 { set prop(v) { } }
class C5 { *gen() { yield 1 } }
class C6 { async method() { await Promise.resolve() } }
class C7 { async *gen() { yield 1 } }
class C8 { static method() {} }
class C9 { static get prop() { return 1 } }
class C10 { static set prop(v) { } }
class C11 { static *gen() { yield 1 } }
class C12 { constructor() {} }
class C13 { [key]() { return 'computed' } }
class C14 { 'string-key'() { } }
class C15 { 123() { } }
class C16 { 
    method() {} 
    get prop() { return 1 }
    set prop(v) { }
    *gen() { yield 1 }
}

/* Es6Parser.ts: MethodDefinition */


// ============================================
// 合并来自: ConstructorMethod-001.js
// ============================================


/* Es6Parser.ts: constructor(Params) { Body } */


// ============================================
// 合并来自: GetAccessor-001.js
// ============================================


/* Es6Parser.ts: get PropertyName() { Body } */


// ============================================
// 合并来自: SetAccessor-001.js
// ============================================


/* Es6Parser.ts: set PropertyName(Identifier) { Body } */


// ============================================
// 合并来自: StaticMethod-001.js
// ============================================


/* Es6Parser.ts: static MethodDefinition */
