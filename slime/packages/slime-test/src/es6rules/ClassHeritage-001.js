/**
 * 规则测试：ClassHeritage
 * 位置：Es2025Parser.ts Line 1655
 * 编号：607
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class Child extends Parent {}

// ✅ 测试2
class Sub extends Base.Nested {}

// ✅ 测试3
class A extends (x > 0 ? BaseA : BaseB) {}

// ✅ 测试4
class Multi extends super.call({}) {}

// ✅ 测试5
class Generic extends Array {}

// ✅ 测试6
class Deep extends Very.Deep.Nested.Class {}

// ✅ 测试7
class Expr extends getBase() {}

// ✅ 测试8
class Complex extends obj[method]() {}

/* Es2025Parser.ts: ClassHeritage */

/**
 * 规则测试：ClassHeritage
 * 位置：Es2025Parser.ts Line 1655
 * 编号：607
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1
class Child extends Parent {}

// ✅ 测试2
class Sub extends Base.Nested {}

// ✅ 测试3
class A extends (x > 0 ? BaseA : BaseB) {}

// ✅ 测试4
class Multi extends super.call({}) {}

// ✅ 测试5
class Generic extends Array {}

// ✅ 测试6
class Deep extends Very.Deep.Nested.Class {}

// ✅ 测试7
class Expr extends getBase() {}

// ✅ 测试8
class Complex extends obj[method]() {}

/* Es2025Parser.ts: ClassHeritage */
