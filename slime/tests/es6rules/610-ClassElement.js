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
/* Es6Parser.ts: ClassElement */
