/**
 * SubhutiParser 测试 004：Many规则测试
 * 
 * 测试目标：
 * 1. Many规则匹配0次的情况
 * 2. Many规则匹配1次的情况
 * 3. Many规则匹配多次的情况
 * 4. Many规则的终止条件
 */

import SubhutiLexer from "../src/parser/SubhutiLexer"
import SubhutiParser, { Subhuti, SubhutiRule } from "../src/parser/SubhutiParser"
import SubhutiTokenConsumer from "../src/parser/SubhutiTokenConsumer"
import { createKeywordToken, createRegToken, createValueRegToken } from "../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../src/parser/SubhutiParser"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken"

// ============================================
// 定义Token集
// ============================================

const testTokensObj = {
  Comma: createValueRegToken('Comma', /,/, ','),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  Comma() {
    return this.consume(testTokensObj.Comma)
  }
  
  Semicolon() {
    return this.consume(testTokensObj.Semicolon)
  }
  
  Identifier() {
    return this.consume(testTokensObj.Identifier)
  }
  
  Number() {
    return this.consume(testTokensObj.Number)
  }
}

// ============================================
// 测试Parser
// ============================================

@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
  constructor(
    tokens?: SubhutiMatchToken[],
    TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
  ) {
    super(tokens, TokenConsumerClass)
  }
  
  // Many规则：匹配多个Number
  @SubhutiRule
  NumberList() {
    this.Many(() => {
      this.tokenConsumer.Number()
    })
  }
  
  // Many规则：匹配 Number (, Number)*
  @SubhutiRule
  CommaSeparatedNumbers() {
    this.tokenConsumer.Number()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.tokenConsumer.Number()
    })
  }
  
  // Many规则：匹配 Identifier*，后面跟分号
  @SubhutiRule
  IdentifiersWithSemicolon() {
    this.Many(() => {
      this.tokenConsumer.Identifier()
    })
    this.tokenConsumer.Semicolon()
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 004：Many规则测试')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：Many匹配0次
console.log('\n[测试1] Many匹配0次: "" (空输入)')
try {
  const code1 = ''
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.lexer(code1)
  
  console.log('  Token数量:', tokens1.length)
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.NumberList()
  
  if (result1 && parser1.tokenIndex === 0) {
    console.log('  ✅ 成功：Many允许0次匹配')
    console.log('  消费了', parser1.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：Many匹配1次
console.log('\n[测试2] Many匹配1次: "123"')
try {
  const code2 = '123'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.lexer(code2)
  
  console.log('  Token:', tokens2.map(t => t.tokenValue).join(' '))
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.NumberList()
  
  if (result2 && parser2.tokenIndex === 1) {
    console.log('  ✅ 成功：匹配了1个Number')
    console.log('  消费了', parser2.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser2.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：Many匹配多次
console.log('\n[测试3] Many匹配多次: "123 456 789"')
try {
  const code3 = '123 456 789'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.lexer(code3)
  
  console.log('  Token:', tokens3.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens3.length)
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.NumberList()
  
  if (result3 && parser3.tokenIndex === 3) {
    console.log('  ✅ 成功：匹配了3个Number')
    console.log('  消费了', parser3.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser3.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：Many的终止条件
console.log('\n[测试4] Many的终止条件: "123 abc" (遇到非Number终止)')
try {
  const code4 = '123 abc'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.lexer(code4)
  
  console.log('  Token:', tokens4.map(t => `${t.tokenName}:${t.tokenValue}`).join(' '))
  
  const parser4 = new TestParser(tokens4)
  const result4 = parser4.NumberList()
  
  if (result4 && parser4.tokenIndex === 1) {
    console.log('  ✅ 成功：匹配了1个Number后终止')
    console.log('  消费了', parser4.tokenIndex, '个token')
    console.log('  剩余 token:', tokens4.length - parser4.tokenIndex, '个 (Identifier)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser4.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5：逗号分隔的列表
console.log('\n[测试5] 逗号分隔列表: "1,2,3"')
try {
  const code5 = '1,2,3'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.lexer(code5)
  
  console.log('  Token:', tokens5.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens5.length)
  
  const parser5 = new TestParser(tokens5)
  const result5 = parser5.CommaSeparatedNumbers()
  
  if (result5 && parser5.tokenIndex === 5) {
    console.log('  ✅ 成功：匹配了 Number (, Number)* 模式')
    console.log('  消费了', parser5.tokenIndex, '个token (1 + , + 2 + , + 3)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser5.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试6：Many后跟固定token
console.log('\n[测试6] Many后跟固定token: "a b c ;" (Identifier* Semicolon)')
try {
  const code6 = 'a b c ;'
  const lexer6 = new SubhutiLexer(testTokens)
  const tokens6 = lexer6.lexer(code6)
  
  console.log('  Token:', tokens6.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens6.length)
  
  const parser6 = new TestParser(tokens6)
  const result6 = parser6.IdentifiersWithSemicolon()
  
  if (result6 && parser6.tokenIndex === 4) {
    console.log('  ✅ 成功：Many正确终止，消费了分号')
    console.log('  消费了', parser6.tokenIndex, '个token (a + b + c + ;)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser6.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试7：Many匹配0次，后跟固定token
console.log('\n[测试7] Many匹配0次后跟固定token: ";" (只有分号)')
try {
  const code7 = ';'
  const lexer7 = new SubhutiLexer(testTokens)
  const tokens7 = lexer7.lexer(code7)
  
  console.log('  Token:', tokens7.map(t => t.tokenValue).join(' '))
  
  const parser7 = new TestParser(tokens7)
  const result7 = parser7.IdentifiersWithSemicolon()
  
  if (result7 && parser7.tokenIndex === 1) {
    console.log('  ✅ 成功：Many匹配0次，正确消费了分号')
    console.log('  消费了', parser7.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser7.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
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

console.log('\n📋 Many规则要点：')
console.log('1. Many允许0次匹配（不同于One的至少1次）')
console.log('2. Many会持续匹配直到规则失败')
console.log('3. Many失败不会抛出异常，而是正常终止')
console.log('4. Many常用于列表、重复模式等场景')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}


