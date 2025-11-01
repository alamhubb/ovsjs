/**
 * 规则测试：TemplateLiteral
 * 
 * 位置：Es6Parser.ts Line 333
 * 分类：literals
 * 编号：005
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   TemplateLiteral:
 *     NoSubstitutionTemplate
 *     TemplateHead Expression TemplateSpans
 * 
 * 测试目标：
 * - 覆盖Or的两个分支
 * - 测试各种模板字符串场景
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - NoSubstitutionTemplate（无插值）
const simple = `hello`
const text = `world`

// ✅ 测试2：Or分支2 - 带单个插值
const withExpr = `value: ${x}`
const name = `Hello, ${user}`

// ✅ 测试3：多个插值
const multi = `x=${x}, y=${y}`
const fullName = `${firstName} ${lastName}`

// ✅ 测试4：多行模板
const multiLine = `line1
line2
line3`

// ✅ 测试5：插值表达式复杂
const computed = `sum: ${a + b}`
const conditional = `result: ${x > 0 ? 'positive' : 'negative'}`

// ✅ 测试6：嵌套表达式
const nested = `outer ${`inner ${value}`}`

// ✅ 测试7：空模板
const empty = ``

// ✅ 测试8：包含特殊字符
const special = `tab:\t newline:\n quote:\" backslash:\\`