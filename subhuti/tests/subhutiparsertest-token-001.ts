/**
 * SubhutiParser 测试 001：基础Token消费
 * 
 * 测试目标：
 * 1. tokenConsumer 能否正确消费单个token
 * 2. tokenIndex 是否正确更新
 * 3. 消费失败时的行为
 */

import SubhutiLexer from "../src/parser/SubhutiLexer"
import SubhutiParser, { Subhuti, SubhutiRule } from "../src/parser/SubhutiParser"
import SubhutiTokenConsumer from "../src/parser/SubhutiTokenConsumer"
import { createKeywordToken, createRegToken, createValueRegToken, SubhutiCreateToken, SubhutiCreateTokenGroupType } from "../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../src/parser/SubhutiParser"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken"

// ============================================
// 定义简单的Token集
// ============================================

const testTokensObj = {
  LetTok: createKeywordToken('LetTok', 'let'),
  VarTok: createKeywordToken('VarTok', 'var'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', SubhutiCreateTokenGroupType.skip),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// 定义Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() {
    return this.consume(testTokensObj.LetTok)
  }
  
  VarTok() {
    return this.consume(testTokensObj.VarTok)
  }
  
  Identifier() {
    return this.consume(testTokensObj.Identifier)
  }
  
  Number() {
    return this.consume(testTokensObj.Number)
  }
}

// ============================================
// 定义简单Parser
// ============================================

@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
  constructor(
    tokens?: SubhutiMatchToken[],
    TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
  ) {
    super(tokens, TokenConsumerClass)
  }
  
  @SubhutiRule
  SingleToken() {
    this.tokenConsumer.LetTok()
  }
  
  @SubhutiRule
  TwoTokens() {
    this.tokenConsumer.LetTok()
    this.tokenConsumer.Identifier()
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 001：基础Token消费')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：消费单个token
console.log('\n[测试1] 消费单个token: "let"')
try {
  const code1 = 'let'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.lexer(code1)
  
  console.log('  Token数量:', tokens1.length)
  console.log('  Token内容:', tokens1.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.SingleToken()
  
  if (result1 && result1.children.length > 0) {
    console.log('  ✅ 成功：生成了CST')
    console.log('  CST name:', result1.name)
    console.log('  CST children:', result1.children.length)
    passed++
  } else {
    console.log('  ❌ 失败：CST为空')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：消费两个连续token
console.log('\n[测试2] 消费两个连续token: "let x"')
try {
  const code2 = 'let x'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.lexer(code2)
  
  console.log('  Token数量:', tokens2.length)
  console.log('  Token内容:', tokens2.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.TwoTokens()
  
  if (result2 && result2.children.length > 0) {
    console.log('  ✅ 成功：生成了CST')
    console.log('  CST name:', result2.name)
    console.log('  CST children:', result2.children.length)
    passed++
  } else {
    console.log('  ❌ 失败：CST为空')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：token不匹配应该失败
console.log('\n[测试3] Token不匹配应该抛出异常: "var" (期望let)')
try {
  const code3 = 'var'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.lexer(code3)
  
  console.log('  Token数量:', tokens3.length)
  console.log('  Token内容:', tokens3.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.SingleToken()
  
  console.log('  ❌ 失败：应该抛出异常，但没有')
  failed++
} catch (e: any) {
  if (e.message.includes('Expected LetTok')) {
    console.log('  ✅ 成功：抛出了预期的异常')
    console.log('  异常信息:', e.message)
    passed++
  } else {
    console.log('  ❌ 失败：异常信息不对:', e.message)
    failed++
  }
}

// 测试4：token不足应该失败
console.log('\n[测试4] Token不足应该抛出异常: "let" (期望let + Identifier)')
try {
  const code4 = 'let'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.lexer(code4)
  
  console.log('  Token数量:', tokens4.length)
  console.log('  Token内容:', tokens4.map(t => `${t.tokenName}:${t.tokenValue}`).join(', '))
  
  const parser4 = new TestParser(tokens4)
  const result4 = parser4.TwoTokens()
  
  console.log('  ❌ 失败：应该抛出异常，但没有')
  failed++
} catch (e: any) {
  if (e.message.includes('Expected Identifier')) {
    console.log('  ✅ 成功：抛出了预期的异常')
    console.log('  异常信息:', e.message)
    passed++
  } else {
    console.log('  ❌ 失败：异常信息不对:', e.message)
    failed++
  }
}

// ============================================
// 测试总结
// ============================================

console.log('\n' + '='.repeat(60))
console.log('测试总结')
console.log('='.repeat(60))
console.log(`通过: ${passed}/${passed + failed}`)
console.log(`失败: ${failed}/${passed + failed}`)
console.log('='.repeat(60))

if (failed === 0) {
  console.log('✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('❌ 有测试失败')
  process.exit(1)
}


