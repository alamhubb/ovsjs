/**
 * 规则测试：TemplateSpans
 * 
 * 位置：Es6Parser.ts Line 347
 * 分类：literals
 * 编号：006
 * 
 * EBNF规则：
 *   TemplateSpans:
 *     TemplateTail |
 *     TemplateMiddleList TemplateTail
 * 
 * 规则特征：
 * ✓ 包含Or规则（2个分支）
 * ✓ 分支1：直接结尾（TemplateTail）
 * ✓ 分支2：中间部分列表 + 结尾
 * 
 * 测试目标：
 * - 覆盖Or分支1：TemplateTail（模板只有一个表达式）
 * - 覆盖Or分支2：TemplateMiddleList + TemplateTail（多个表达式）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖2个Or分支 + 扩展测试）
 */

// ✅ 测试1：Or分支1 - 只有TemplateTail（单个插值）
const x = 1
const t1 = `value: ${x}`

// ✅ 测试2：Or分支1 - TemplateTail（简单）
const name = 'Alice'
const greeting = `Hello, ${name}`

// ✅ 测试3：Or分支2 - TemplateMiddleList + TemplateTail（多个插值）
const y = 2
const t2 = `x=${x}, y=${y}`

// ✅ 测试4：多个插值（3个）
const a = 1, b = 2, c = 3
const t3 = `${a}${b}${c}`

// ✅ 测试5：插值中间有文本
const t4 = `start ${x} middle ${y} end`

// ✅ 测试6：复杂表达式插值
const t5 = `sum: ${x + y} product: ${x * y}`

// ✅ 测试7：多层插值
const t6 = `a=${a} b=${b} c=${c} d=${a + b + c}`

// ✅ 测试8：插值为函数调用
const t7 = `result: ${calculate()} length: ${arr.length}`


/* Es6Parser.ts: Or[TemplateTail, TemplateMiddleList TemplateTail] */

/**
 * 规则测试：TemplateSpans
 * 
 * 位置：Es6Parser.ts Line 347
 * 分类：literals
 * 编号：006
 * 
 * EBNF规则：
 *   TemplateSpans:
 *     TemplateTail |
 *     TemplateMiddleList TemplateTail
 * 
 * 规则特征：
 * ✓ 包含Or规则（2个分支）
 * ✓ 分支1：直接结尾（TemplateTail）
 * ✓ 分支2：中间部分列表 + 结尾
 * 
 * 测试目标：
 * - 覆盖Or分支1：TemplateTail（模板只有一个表达式）
 * - 覆盖Or分支2：TemplateMiddleList + TemplateTail（多个表达式）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖2个Or分支 + 扩展测试）
 */

// ✅ 测试1：Or分支1 - 只有TemplateTail（单个插值）
const x = 1
const t1 = `value: ${x}`

// ✅ 测试2：Or分支1 - TemplateTail（简单）
const name = 'Alice'
const greeting = `Hello, ${name}`

// ✅ 测试3：Or分支2 - TemplateMiddleList + TemplateTail（多个插值）
const y = 2
const t2 = `x=${x}, y=${y}`

// ✅ 测试4：多个插值（3个）
const a = 1, b = 2, c = 3
const t3 = `${a}${b}${c}`

// ✅ 测试5：插值中间有文本
const t4 = `start ${x} middle ${y} end`

// ✅ 测试6：复杂表达式插值
const t5 = `sum: ${x + y} product: ${x * y}`

// ✅ 测试7：多层插值
const t6 = `a=${a} b=${b} c=${c} d=${a + b + c}`

// ✅ 测试8：插值为函数调用
const t7 = `result: ${calculate()} length: ${arr.length}`


/* Es6Parser.ts: Or[TemplateTail, TemplateMiddleList TemplateTail] */
