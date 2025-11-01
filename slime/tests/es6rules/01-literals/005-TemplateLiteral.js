/**
 * 规则测试：TemplateLiteral
 * 
 * 位置：Es6Parser.ts Line 333
 * 分类：literals
 * 编号：005
 * 
 * EBNF规则：
 *   TemplateLiteral:
 *     NoSubstitutionTemplate |
 *     TemplateHead Expression TemplateSpans
 * 
 * 规则特征：
 * ✓ 包含Or规则（2个分支）
 * ✓ 分支1：无表达式的模板
 * ✓ 分支2：含表达式的模板（需要TemplateSpans）
 * 
 * 测试目标：
 * - 覆盖Or分支1：无表达式的模板字符串
 * - 覆盖Or分支2：带表达式的模板字符串
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖2个Or分支 + 扩展测试）
 */

// ✅ 测试1：Or分支1 - NoSubstitutionTemplate（无插值）
const simple = `hello`
const text = `world`

// ✅ 测试2：Or分支1变体 - 带转义字符的无表达式模板
const escaped = `line1\nline2\ttab`

// ✅ 测试3：Or分支2 - 单个表达式的模板
const withExpr = `value: ${x}`
const name = `Hello, ${user}`

// ✅ 测试4：Or分支2变体 - 多个表达式的模板
const multi = `x=${x}, y=${y}`
const fullName = `${firstName} ${lastName}`

// ✅ 测试5：或分支2变体 - 表达式中的复杂计算
const computed = `sum: ${a + b}`
const conditional = `result: ${x > 0 ? 'positive' : 'negative'}`

// ✅ 测试6：多行模板
const multiLine = `line1
line2
line3`

// ✅ 测试7：嵌套表达式
const nested = `outer ${`inner ${value}`}`

// ✅ 测试8：包含特殊字符
const special = `tab:\t newline:\n quote:\" backslash:\\`
/* Es6Parser.ts: Or[NoSubstitutionTemplate, TemplateHead Expression TemplateSpans] */
