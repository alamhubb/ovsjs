/**
 * 规则测试：ClassElementList
 * 编号：609
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class One {
    m() {}
}

// ✅ 测试2
class Two {
    m1() {}
    m2() {}
}

// ✅ 测试3
class Three {
    m1() {}
    m2() {}
    m3() {}
}

// ✅ 测试4
class Mixed {
    constructor() {}
    method() {}
    static s() {}
}

// ✅ 测试5
class Complex {
    a() {}
    b() {}
    c() {}
    d() {}
}

// ✅ 测试6
class WithGS {
    get x() {}
    set x(v) {}
    method() {}
}

// ✅ 测试7
class WithGen {
    *g1() {}
    *g2() {}
}

// ✅ 测试8
class Full {
    constructor() {}
    static s1() {}
    static s2() {}
    get x() {}
    set x(v) {}
    *gen() {}
    m1() {}
    m2() {}
}

/* Es6Parser.ts: ClassElementList */
