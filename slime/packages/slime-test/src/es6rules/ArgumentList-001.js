/**
 * 规则测试：ArgumentList
 * 
 * 位置：Es2025Parser.ts Line 279
 * 分类：others
 * 编号：914
 * 
 * EBNF规则：
 *   ArgumentList:
 *     AssignmentExpression ( , AssignmentExpression )* 
 *     SpreadElement ( , AssignmentExpression )*
 * 
 * 测试目标：
 * - 测试单个参数
 * - 测试多个参数列表
 * - 测试spread参数
 * - 验证spread与普通参数的混合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：单参数
f(a)

// ✅ 测试2：双参数    ArgumentList -> this.Or (分支2: AssignmentExpression) -> this.Many() (Comma分隔)
f(a, b)

// ✅ 测试3：三参数    ArgumentList -> this.Many() (多个Comma)
f(a, b, c)

// ✅ 测试4：四参数    ArgumentList -> this.Many() (多个Comma)
f(a, b, c, d)

// ✅ 测试5：单spread    ArgumentList -> this.Or (分支1: SpreadElement)
f(...a)

// ✅ 测试6：参数后跟spread    ArgumentList -> this.Many() (Comma + SpreadElement)
f(a, ...b)

// ✅ 测试7：多参数后跟spread    ArgumentList -> this.Many() (多个Comma + SpreadElement)
f(a, b, ...c)

// ✅ 测试8：多个spread    ArgumentList -> this.Many() (Comma + SpreadElement 多次)
f(...a, ...b)

/* Es2025Parser.ts: ArgumentList */

/**
 * 规则测试：ArgumentList
 * 
 * 位置：Es2025Parser.ts Line 279
 * 分类：others
 * 编号：914
 * 
 * EBNF规则：
 *   ArgumentList:
 *     AssignmentExpression ( , AssignmentExpression )* 
 *     SpreadElement ( , AssignmentExpression )*
 * 
 * 测试目标：
 * - 测试单个参数
 * - 测试多个参数列表
 * - 测试spread参数
 * - 验证spread与普通参数的混合
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：单参数
f(a)

// ✅ 测试2：双参数    ArgumentList -> this.Or (分支2: AssignmentExpression) -> this.Many() (Comma分隔)
f(a, b)

// ✅ 测试3：三参数    ArgumentList -> this.Many() (多个Comma)
f(a, b, c)

// ✅ 测试4：四参数    ArgumentList -> this.Many() (多个Comma)
f(a, b, c, d)

// ✅ 测试5：单spread    ArgumentList -> this.Or (分支1: SpreadElement)
f(...a)

// ✅ 测试6：参数后跟spread    ArgumentList -> this.Many() (Comma + SpreadElement)
f(a, ...b)

// ✅ 测试7：多参数后跟spread    ArgumentList -> this.Many() (多个Comma + SpreadElement)
f(a, b, ...c)

// ✅ 测试8：多个spread    ArgumentList -> this.Many() (Comma + SpreadElement 多次)
f(...a, ...b)

/* Es2025Parser.ts: ArgumentList */
