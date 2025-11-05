
/* Es2025Parser.ts: super(Arguments) */


// ============================================
// 来自文件: 912-SuperCall.js
// ============================================

/**
 * 规则测试：SuperCall
 * 
 * 位置：Es2025Parser.ts Line 265
 * 分类：others
 * 编号：912
 * 
 * EBNF规则：
 *   SuperCall:
 *     super Arguments
 * 
 * 测试目标：
 * - 测试在构造函数中调用super()
 * - 测试super()的各种参数形式
 * - 测试super()与其他语句的组合
 * - 验证super()调用的合法位置
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：无参super()
class C1 extends Base { constructor() { super() } }

// ✅ 测试2：单参super()
class C2 extends B { constructor(x) { super(x) } }

// ✅ 测试3：多参super()
class C3 extends P { constructor(a, b) { super(a, b) } }

// ✅ 测试4：spread参数super()
class C4 extends Q { constructor(...args) { super(...args) } }

// ✅ 测试5：方法中返回super()
class C5 extends R { m() { return super() } }

// ✅ 测试6：super()赋值
class C6 extends S { m(x) { const y = super(x) } }

// ✅ 测试7：条件中的super()
class C7 extends T { m() { if (condition) super() } }

// ✅ 测试8：generator中的super()
class C8 extends U { *gen() { yield super() } }

/* Es2025Parser.ts: SuperCall */


/* Es2025Parser.ts: super(Arguments) */

/**
 * 规则测试：SuperCall
 * 
 * 位置：Es2025Parser.ts Line 265
 * 分类：others
 * 编号：912
 * 
 * EBNF规则：
 *   SuperCall:
 *     super Arguments
 * 
 * 测试目标：
 * - 测试在构造函数中调用super()
 * - 测试super()的各种参数形式
 * - 测试super()与其他语句的组合
 * - 验证super()调用的合法位置
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：无参super()
class C1 extends Base { constructor() { super() } }

// ✅ 测试2：单参super()
class C2 extends B { constructor(x) { super(x) } }

// ✅ 测试3：多参super()
class C3 extends P { constructor(a, b) { super(a, b) } }

// ✅ 测试4：spread参数super()
class C4 extends Q { constructor(...args) { super(...args) } }

// ✅ 测试5：方法中返回super()
class C5 extends R { m() { return super() } }

// ✅ 测试6：super()赋值
class C6 extends S { m(x) { const y = super(x) } }

// ✅ 测试7：条件中的super()
class C7 extends T { m() { if (condition) super() } }

// ✅ 测试8：generator中的super()
class C8 extends U { *gen() { yield super() } }

/* Es2025Parser.ts: SuperCall */
