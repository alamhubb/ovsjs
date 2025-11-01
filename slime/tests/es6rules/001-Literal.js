/**
 * 规则测试：Literal
 * 
 * 位置：Es6Parser.ts Line 144
 * 分类：literals
 * 编号：001
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 5个分支
 * 
 * 规则语法：
 *   Literal:
 *     NullLiteral
 *     TrueTok
 *     FalseTok
 *     NumericLiteral
 *     StringLiteral
 * 
 * 测试目标：
 * - 覆盖所有5种字面量类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：NullLiteral
const nullValue = null

// ✅ 测试2：TrueTok
const trueValue = true

// ✅ 测试3：FalseTok
const falseValue = false

// ✅ 测试4：NumericLiteral - 整数
const integer = 42
const zero = 0
const negative = -100

// ✅ 测试5：NumericLiteral - 浮点数
const float = 3.14
const scientific = 1.23e-4

// ✅ 测试6：NumericLiteral - 二进制/八进制/十六进制
const binary = 0b1010
const octal = 0o755
const hex = 0xFF

// ✅ 测试7：StringLiteral - 单引号
const singleQuote = 'hello'

// ✅ 测试8：StringLiteral - 双引号
const doubleQuote = "world"

// ✅ 测试9：StringLiteral - 转义字符
const escaped = 'line1\nline2\ttab'

// ✅ 测试10：组合使用
const mixed = [null, true, false, 42, "text"]

/* Es6Parser.ts: Or[null, true, false, NumericLiteral, StringLiteral] */
