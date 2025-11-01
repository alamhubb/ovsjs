/**
 * 规则测试：TemplateMiddleList
 * 
 * 位置：Es6Parser.ts Line 360
 * 分类：literals
 * 编号：007
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   TemplateMiddleList:
 *     TemplateMiddle Expression Many(TemplateMiddle Expression)
 * 
 * 测试目标：
 * - 测试模板中间部分的列表
 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
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

