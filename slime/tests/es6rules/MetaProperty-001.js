/**
 * 规则测试：MetaProperty
 * 
 * 位置：Es6Parser.ts Line 260
 * 分类：others
 * 编号：910
 * 
 * EBNF规则：
 *   MetaProperty:
 *     new . target | import . meta
 * 
 * 测试目标：
 * - 测试import.meta的使用
 * - 测试import.meta.url等属性访问
 * - 测试new.target在函数中的使用
 * - 测试new.target在构造函数中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：import.meta
import.meta

// ✅ 测试2：import.meta.url
import.meta.url

// ✅ 测试3：import.meta.main
import.meta.main

// ✅ 测试4：new.target
new.target

// ✅ 测试5：函数中的new.target
function f() { new.target }

// ✅ 测试6：构造函数中的new.target
class C { constructor() { new.target } }

// ✅ 测试7：new.target赋值
const a = new.target

// ✅ 测试8：import.meta.url赋值
const b = import.meta.url

/* Es6Parser.ts: MetaProperty */

/**
 * 规则测试：MetaProperty
 * 
 * 位置：Es6Parser.ts Line 260
 * 分类：others
 * 编号：910
 * 
 * EBNF规则：
 *   MetaProperty:
 *     new . target | import . meta
 * 
 * 测试目标：
 * - 测试import.meta的使用
 * - 测试import.meta.url等属性访问
 * - 测试new.target在函数中的使用
 * - 测试new.target在构造函数中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：import.meta
import.meta

// ✅ 测试2：import.meta.url
import.meta.url

// ✅ 测试3：import.meta.main
import.meta.main

// ✅ 测试4：new.target
new.target

// ✅ 测试5：函数中的new.target
function f() { new.target }

// ✅ 测试6：构造函数中的new.target
class C { constructor() { new.target } }

// ✅ 测试7：new.target赋值
const a = new.target

// ✅ 测试8：import.meta.url赋值
const b = import.meta.url

/* Es6Parser.ts: MetaProperty */
