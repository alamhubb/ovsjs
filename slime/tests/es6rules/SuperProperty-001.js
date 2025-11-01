/**
 * 规则测试：SuperProperty
 * 
 * 位置：Es6Parser.ts Line 256
 * 分类：others
 * 编号：909
 * 
 * EBNF规则：
 *   SuperProperty:
 *     super [ Expression ] | super . IdentifierName
 * 
 * 测试目标：
 * - 测试super点访问
 * - 测试super括号访问
 * - 测试super属性赋值
 * - 测试super方法调用
 * - 验证在类成员中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：super点访问
class C1 { m() { super.prop } }

// ✅ 测试2：super括号访问
class C2 { m() { super['prop'] } }

// ✅ 测试3：super点访问赋值
class C3 { m() { super.x = 1 } }

// ✅ 测试4：super括号访问赋值
class C4 { m() { super[y] = 2 } }

// ✅ 测试5：super方法调用
class C5 { m() { return super.method() } }

// ✅ 测试6：super属性访问读取
class C6 { m() { super.x } }

// ✅ 测试7：super在变量初始化中
class C7 { m() { const x = super['y'] } }

// ✅ 测试8：super属性删除
class C8 { m() { delete super.z } }

/* Es6Parser.ts: SuperProperty */

/**
 * 规则测试：SuperProperty
 * 
 * 位置：Es6Parser.ts Line 256
 * 分类：others
 * 编号：909
 * 
 * EBNF规则：
 *   SuperProperty:
 *     super [ Expression ] | super . IdentifierName
 * 
 * 测试目标：
 * - 测试super点访问
 * - 测试super括号访问
 * - 测试super属性赋值
 * - 测试super方法调用
 * - 验证在类成员中的使用
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：super点访问
class C1 { m() { super.prop } }

// ✅ 测试2：super括号访问
class C2 { m() { super['prop'] } }

// ✅ 测试3：super点访问赋值
class C3 { m() { super.x = 1 } }

// ✅ 测试4：super括号访问赋值
class C4 { m() { super[y] = 2 } }

// ✅ 测试5：super方法调用
class C5 { m() { return super.method() } }

// ✅ 测试6：super属性访问读取
class C6 { m() { super.x } }

// ✅ 测试7：super在变量初始化中
class C7 { m() { const x = super['y'] } }

// ✅ 测试8：super属性删除
class C8 { m() { delete super.z } }

/* Es6Parser.ts: SuperProperty */
