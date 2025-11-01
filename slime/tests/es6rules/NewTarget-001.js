/**
 * 规则测试：NewTarget
 * 
 * 位置：Es6Parser.ts Line 271
 * 分类：others
 * 编号：911
 * 
 * EBNF规则：
 *   NewTarget:
 *     new . target
 * 
 * 测试目标：
 * - 测试在函数中使用new.target
 * - 测试在类构造函数中使用new.target
 * - 测试在变量初始化中使用new.target
 * - 验证在控制流中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本new.target
new.target

// ✅ 测试2：函数返回new.target
function f() { return new.target }

// ✅ 测试3：构造函数中返回new.target
class C { constructor() { return new.target } }

// ✅ 测试4：new.target赋值
const x = new.target

// ✅ 测试5：条件判断中的new.target
function factory() { if (new.target) {} }

// ✅ 测试6：类方法中的new.target
class Base { c() { new.target } }

// ✅ 测试7：generator中的new.target
function* g() { new.target }

// ✅ 测试8：async函数中的new.target
async function af() { new.target }

/* Es6Parser.ts: NewTarget */

/**
 * 规则测试：NewTarget
 * 
 * 位置：Es6Parser.ts Line 271
 * 分类：others
 * 编号：911
 * 
 * EBNF规则：
 *   NewTarget:
 *     new . target
 * 
 * 测试目标：
 * - 测试在函数中使用new.target
 * - 测试在类构造函数中使用new.target
 * - 测试在变量初始化中使用new.target
 * - 验证在控制流中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：基本new.target
new.target

// ✅ 测试2：函数返回new.target
function f() { return new.target }

// ✅ 测试3：构造函数中返回new.target
class C { constructor() { return new.target } }

// ✅ 测试4：new.target赋值
const x = new.target

// ✅ 测试5：条件判断中的new.target
function factory() { if (new.target) {} }

// ✅ 测试6：类方法中的new.target
class Base { c() { new.target } }

// ✅ 测试7：generator中的new.target
function* g() { new.target }

// ✅ 测试8：async函数中的new.target
async function af() { new.target }

/* Es6Parser.ts: NewTarget */
