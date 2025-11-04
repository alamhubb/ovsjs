/**
 * SubhutiParser 测试 005：Option规则测试
 * 
 * 测试目标：
 * 1. Option匹配成功的情况
 * 2. Option匹配失败的情况（不抛出异常）
 * 3. Option与固定token的组合
 */

import SubhutiLexer from "../src/parser/SubhutiLexer"
import SubhutiParser, { Subhuti, SubhutiRule } from "../src/parser/SubhutiParser"
import SubhutiTokenConsumer from "../src/parser/SubhutiTokenConsumer"
import { createKeywordToken, createRegToken, createValueRegToken, SubhutiCreateTokenGroupType } from "../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../src/parser/SubhutiParser"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken"

// ============================================
// 定义Token集
// ============================================

const testTokensObj = {
  AsTok: createKeywordToken('AsTok', 'as'),
  Eq: createValueRegToken('Eq', /=/, '='),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', 'skip'),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  AsTok() {
    return this.consume(testTokensObj.AsTok)
  }
  
  Eq() {
    return this.consume(testTokensObj.Eq)
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
  
  // Identifier [as Identifier]
  @SubhutiRule
  ImportName() {
    this.tokenConsumer.Identifier()
    this.Option(() => {
      this.tokenConsumer.AsTok()
      this.tokenConsumer.Identifier()
    })
  }
  
  // Identifier [= Number]
  @SubhutiRule
  VariableDeclaration() {
    this.tokenConsumer.Identifier()
    this.Option(() => {
      this.tokenConsumer.Eq()
      this.tokenConsumer.Number()
    })
  }
  
  // Identifier [= Number] ;
  @SubhutiRule
  VariableStatement() {
    this.tokenConsumer.Identifier()
    this.Option(() => {
      this.tokenConsumer.Eq()
      this.tokenConsumer.Number()
    })
    this.tokenConsumer.Semicolon()
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 005：Option规则测试')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：Option匹配成功
console.log('\n[测试1] Option匹配成功: "name as userName"')
try {
  const code1 = 'name as userName'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  console.log('  Token:', tokens1.map(t => t.tokenValue).join(' '))
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.ImportName()
  
  if (result1 && parser1.tokenIndex === 3) {
    console.log('  ✅ 成功：Option匹配成功，消费了3个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser1.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：Option匹配失败（不抛出异常）
console.log('\n[测试2] Option匹配失败: "name" (没有as部分)')
try {
  const code2 = 'name'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  console.log('  Token:', tokens2.map(t => t.tokenValue).join(' '))
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.ImportName()
  
  if (result2 && parser2.tokenIndex === 1) {
    console.log('  ✅ 成功：Option失败不抛异常，只消费了必需的部分')
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

// 测试3：Option后跟固定token - 匹配Option
console.log('\n[测试3] Option后跟固定token: "x = 10 ;"')
try {
  const code3 = 'x = 10 ;'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  console.log('  Token:', tokens3.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens3.length)
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.VariableStatement()
  
  if (result3 && parser3.tokenIndex === 4) {
    console.log('  ✅ 成功：Option匹配，消费了4个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser3.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：Option后跟固定token - 不匹配Option
console.log('\n[测试4] Option后跟固定token: "x ;" (没有初始化)')
try {
  const code4 = 'x ;'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
  console.log('  Token:', tokens4.map(t => t.tokenValue).join(' '))
  
  const parser4 = new TestParser(tokens4)
  const result4 = parser4.VariableStatement()
  
  if (result4 && parser4.tokenIndex === 2) {
    console.log('  ✅ 成功：Option不匹配，正确消费了分号')
    console.log('  消费了', parser4.tokenIndex, '个token (x + ;)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser4.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5：Option部分匹配失败（回溯）
console.log('\n[测试5] Option部分匹配失败: "x = abc" (期望Number)')
try {
  const code5 = 'x = abc'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.tokenize(code5)
  
  console.log('  Token:', tokens5.map(t => `${t.tokenName}:${t.tokenValue}`).join(' '))
  console.log('  Option尝试：Eq (✅) + Number (❌ 实际是Identifier)')
  console.log('  预期：Option整体失败，回溯')
  
  const parser5 = new TestParser(tokens5)
  const result5 = parser5.VariableDeclaration()
  
  if (result5 && parser5.tokenIndex === 1) {
    console.log('  ✅ 成功：Option部分匹配失败，正确回溯')
    console.log('  消费了', parser5.tokenIndex, '个token (只有x)')
    console.log('  剩余 token:', tokens5.length - parser5.tokenIndex, '个 (= abc)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser5.tokenIndex)
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

console.log('\n📋 Option规则要点：')
console.log('1. Option匹配0次或1次（可选部分）')
console.log('2. Option失败不抛出异常')
console.log('3. Option部分匹配失败会回溯')
console.log('4. Option比Or更清晰地表达可选语义')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}


