/**
 * 规则测试：Arguments
 * 
 * 位置：Es6Parser.ts Line 275
 * 分类：others
 * 编号：913
 * 
 * EBNF规则：
 *   Arguments:
 *     ( ArgumentList? )
 * 
 * 测试目标：
 * - 测试无参数调用
 * - 测试单参数和多参数
 * - 测试spread参数
 * - 验证混合参数和spread
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：无参数调用
func()

// ✅ 测试2：单参数
func(a)

// ✅ 测试3：双参数
func(a, b)

// ✅ 测试4：多参数
func(a, b, c)

// ✅ 测试5：spread参数
func(...args)

// ✅ 测试6：混合参数和spread
func(a, ...rest)

// ✅ 测试7：多spread和普通参数混合
func(a, b, ...rest, d)

// ✅ 测试8：多个数字参数
func(1, 2, 3, 4, 5)

/* Es6Parser.ts: Arguments */

/**
 * 规则测试：Arguments
 * 
 * 位置：Es6Parser.ts Line 275
 * 分类：others
 * 编号：913
 * 
 * EBNF规则：
 *   Arguments:
 *     ( ArgumentList? )
 * 
 * 测试目标：
 * - 测试无参数调用
 * - 测试单参数和多参数
 * - 测试spread参数
 * - 验证混合参数和spread
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：无参数调用
func()

// ✅ 测试2：单参数
func(a)

// ✅ 测试3：双参数
func(a, b)

// ✅ 测试4：多参数
func(a, b, c)

// ✅ 测试5：spread参数
func(...args)

// ✅ 测试6：混合参数和spread
func(a, ...rest)

// ✅ 测试7：多spread和普通参数混合
func(a, b, ...rest, d)

// ✅ 测试8：多个数字参数
func(1, 2, 3, 4, 5)

/* Es6Parser.ts: Arguments */
