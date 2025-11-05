/**
 * 测试 Lexer 前瞻功能
 * 验证 OptionalChaining 的 lookahead 是否正常工作
 */

import SubhutiLexer from '../../../../../../subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from './Es2025Tokens.ts'

const lexer = new SubhutiLexer(es2025Tokens)

console.log('🧪 测试 Lexer 前瞻功能\n')

// ============================================
// 测试 1：obj?.prop（正常的 Optional Chaining）
// ============================================
console.log('【测试 1】obj?.prop')
const tokens1 = lexer.tokenize('obj?.prop')
console.log('结果：', tokens1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))

const expected1 = ['Identifier(obj)', 'OptionalChaining(?.)', 'Identifier(prop)']
const actual1 = tokens1.map(t => `${t.tokenName}(${t.tokenValue})`)
const pass1 = JSON.stringify(expected1) === JSON.stringify(actual1)
console.log('期望：', expected1.join(' '))
console.log('状态：', pass1 ? '✅ 通过' : '❌ 失败')
console.log()

// ============================================
// 测试 2：a ? .5 : 1（三元运算符 + 浮点数）
// ============================================
console.log('【测试 2】a ? .5 : 1')
const tokens2 = lexer.tokenize('a ? .5 : 1')
console.log('结果：', tokens2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))

const expected2 = [
  'Identifier(a)',
  'Question(?)',         // ← 不是 OptionalChaining
  'NumericLiteral(.5)',  // ← .5 是浮点数
  'Colon(:)',
  'NumericLiteral(1)'
]
const actual2 = tokens2.map(t => `${t.tokenName}(${t.tokenValue})`)
const pass2 = JSON.stringify(expected2) === JSON.stringify(actual2)
console.log('期望：', expected2.join(' '))
console.log('状态：', pass2 ? '✅ 通过' : '❌ 失败')
console.log()

// ============================================
// 测试 3：obj?.123（不合法，但测试前瞻）
// ============================================
console.log('【测试 3】obj?.123')
const tokens3 = lexer.tokenize('obj?.123')
console.log('结果：', tokens3.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))

const expected3 = [
  'Identifier(obj)',
  'Question(?)',          // ← 前瞻拒绝了 OptionalChaining
  'NumericLiteral(.123)'  // ← .123 是浮点数
]
const actual3 = tokens3.map(t => `${t.tokenName}(${t.tokenValue})`)
const pass3 = JSON.stringify(expected3) === JSON.stringify(actual3)
console.log('期望：', expected3.join(' '))
console.log('状态：', pass3 ? '✅ 通过' : '❌ 失败')
console.log()

// ============================================
// 测试 4：复杂场景
// ============================================
console.log('【测试 4】result ? .value : 0')
const tokens4 = lexer.tokenize('result ? .value : 0')
console.log('结果：', tokens4.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))

const expected4 = [
  'Identifier(result)',
  'Question(?)',
  'Dot(.)',
  'Identifier(value)',
  'Colon(:)',
  'NumericLiteral(0)'
]
const actual4 = tokens4.map(t => `${t.tokenName}(${t.tokenValue})`)
const pass4 = JSON.stringify(expected4) === JSON.stringify(actual4)
console.log('期望：', expected4.join(' '))
console.log('状态：', pass4 ? '✅ 通过' : '❌ 失败')
console.log()

// ============================================
// 总结
// ============================================
const totalTests = 4
const passedTests = [pass1, pass2, pass3, pass4].filter(Boolean).length

console.log('=' .repeat(60))
console.log(`总计：${passedTests}/${totalTests} 测试通过`)
console.log('=' .repeat(60))

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！Lexer 前瞻功能正常工作！')
} else {
  console.log('❌ 部分测试失败，需要检查实现')
  process.exit(1)
}

