/**
 * 规则测试：TemplateMiddleList
 * 
 * 位置：Es6Parser.ts Line 360
 * 分类：literals
 * 编号：007
 * 
 * EBNF规则：
 *   TemplateMiddleList:
 *     TemplateMiddle Expression (TemplateMiddle Expression)*
 * 
 * 规则特征：
 * ✓ 包含Many规则（1处）
 * ✓ 必须至少有1个(TemplateMiddle + Expression)对
 * ✓ Many表示可以有多个(TemplateMiddle + Expression)对
 * 
 * 测试目标：
 * - 覆盖Many=1：只有1个TemplateMiddle + Expression
 * - 覆盖Many≥2：多个TemplateMiddle + Expression对（2个、3个、多个）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（全覆盖Many=1和Many≥2 + 扩展测试）
 */

// ✅ 测试1：Many=0（最少：1个middle）
const x = 1, y = 2
const two = `start ${x} end`

// ✅ 测试2：Many=1（2个middle）
const twoMiddle = `a ${x} b ${y} c`

// ✅ 测试3：Many=2（3个middle）
const three = `a ${1} b ${2} c ${3} d`

// ✅ 测试4：Many=3（4个middle）
const four = `${1} a ${2} b ${3} c ${4} d`

// ✅ 测试5：Many=4（5个middle）
const five = `${1}${2}${3}${4}${5}`

// ✅ 测试6：复杂表达式
const complex = `sum: ${a + b} product: ${a * b} mod: ${a % b}`

// ✅ 测试7：函数调用表达式
const calls = `first: ${fn1()} second: ${fn2()} third: ${fn3()}`

// ✅ 测试8：嵌套表达式
const nested = `user: ${user.name} age: ${user.age} active: ${user.active ? 'yes' : 'no'}`


/* Es6Parser.ts: TemplateMiddle Expression (TemplateMiddle Expression)* */
