/**
 * 测试规则: ClassElementList
 * 来源: 从 ClassElement 拆分
 */

/**
 * 规则测试：ClassElementList
 * 编号：609
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1    ClassElementList -> ClassElement (1个)
class One {
    m() {}
}

// ✅ 测试2    ClassElementList -> Many (2个ClassElement)
class Two {
    m1() {}
    m2() {}
}

// ✅ 测试3    ClassElementList -> Many (3个ClassElement)
class Three {
    m1() {}
    m2() {}
    m3() {}
}

// ✅ 测试4    ClassElementList -> Mixed (constructor + method + static)
class Mixed {
    constructor() {}
    method() {}
    static s() {}
}

// ✅ 测试5    ClassElementList -> Multiple Methods
class Complex {
    a() {}
    b() {}
    c() {}
    d() {}
}

// ✅ 测试6    ClassElementList -> Getter/Setter + Method
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
