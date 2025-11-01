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
