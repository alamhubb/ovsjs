/**
 * 规则测试：ClassBody
 * 编号：608
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class Empty {}

// ✅ 测试2
class One {
    m() {}
}

// ✅ 测试3
class Two {
    m1() {}
    m2() {}
}

// ✅ 测试4
class Multi {
    constructor() {}
    m1() {}
    m2() {}
    m3() {}
}

// ✅ 测试5
class Static {
    static s() {}
    i() {}
}

// ✅ 测试6
class GetSet {
    get x() {}
    set x(v) {}
}

// ✅ 测试7
class Gen {
    *g() { yield 1 }
}

// ✅ 测试8
class All {
    constructor() {}
    static s() {}
    get x() {}
    set x(v) {}
    *g() {}
    m() {}
}

/* Es6Parser.ts: ClassBody */


// ============================================
// 来自文件: 612-ClassBody.js
// ============================================

/**
 * 规则测试：ClassBody
 * 分类：classes | 编号：612
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1-15：ClassBody各种类体内容
class Empty {}
class SingleMethod { method() {} }
class MultiMethod { a() {} b() {} c() {} }
class WithConstructor { constructor() {} }
class WithGetSet { get x() {} set x(v) {} }
class WithStatic { static method() {} }
class WithGenerator { *gen() { yield 1 } }
class WithAsync { async method() {} }
class WithAsyncGen { async *gen() { yield 1 } }
class WithComputed { [key]() {} }
class Complex {
    constructor(x) { this.x = x }
    method() { return this.x }
    get value() { return this.x }
    static create() { return new Complex(1) }
}
class Inheritance extends Base { method() {} }
class WithSuper {
    constructor(x) { super(x) }
    method() { return super.method() }
}

/* Es6Parser.ts: ClassBody */

/**
 * 规则测试：ClassBody
 * 编号：608
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class Empty {}

// ✅ 测试2
class One {
    m() {}
}

// ✅ 测试3
class Two {
    m1() {}
    m2() {}
}

// ✅ 测试4
class Multi {
    constructor() {}
    m1() {}
    m2() {}
    m3() {}
}

// ✅ 测试5
class Static {
    static s() {}
    i() {}
}

// ✅ 测试6
class GetSet {
    get x() {}
    set x(v) {}
}

// ✅ 测试7
class Gen {
    *g() { yield 1 }
}

// ✅ 测试8
class All {
    constructor() {}
    static s() {}
    get x() {}
    set x(v) {}
    *g() {}
    m() {}
}

/* Es6Parser.ts: ClassBody */
