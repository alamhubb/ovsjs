/**
 * SubhutiParser 测试 007：AtLeastOne规则测试
 * 
 * 测试目标：
 * 1. AtLeastOne至少匹配1次
 * 2. AtLeastOne匹配多次
 * 3. AtLeastOne匹配失败抛出异常
 * 4. AtLeastOne与其他规则组合
 */

import SubhutiLexer from "../../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken, createValueRegToken } from "../../src/struct/SubhutiCreateToken.ts"
import type { SubhutiTokenConsumerConstructor } from "../../src/SubhutiParser.ts"
import SubhutiMatchToken from "../../src/struct/SubhutiMatchToken.ts"

// ============================================
// 定义Token集
// ============================================

const testTokensObj = {
  Comma: createValueRegToken('Comma', /,/, ','),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Plus: createValueRegToken('Plus', /\+/, '+'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
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
  
  Plus() {
    return this.consume(testTokensObj.Plus)
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
  
  // AtLeastOne规则：匹配至少1个Number
  @SubhutiRule
  NumberList() {
    this.AtLeastOne(() => {
      this.tokenConsumer.Number()
    })
  }
  
  // AtLeastOne规则：匹配 Number (, Number)+（至少2个Number）
  @SubhutiRule
  CommaSeparatedNumbers() {
    this.tokenConsumer.Number()
    this.AtLeastOne(() => {
      this.tokenConsumer.Comma()
      this.tokenConsumer.Number()
    })
  }
  
  // AtLeastOne规则：匹配 Number (+ Number)+（加法表达式）
  @SubhutiRule
  Addition() {
    this.tokenConsumer.Number()
    this.AtLeastOne(() => {
      this.tokenConsumer.Plus()
      this.tokenConsumer.Number()
    })
  }
  
  // AtLeastOne后跟固定token
  @SubhutiRule
  IdentifiersWithSemicolon() {
    this.AtLeastOne(() => {
      this.tokenConsumer.Identifier()
    })
    this.tokenConsumer.Semicolon()
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 007：AtLeastOne规则测试')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：AtLeastOne匹配1次
console.log('\n[测试1] AtLeastOne匹配1次: "123"')
try {
  const code1 = '123'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  console.log('  Token:', tokens1.map(t => t.tokenValue).join(' '))
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.NumberList()
  
  if (result1 && parser1.tokenIndex === 1) {
    console.log('  ✅ 成功：匹配了1个Number（满足至少1次）')
    console.log('  消费了', parser1.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser1.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：AtLeastOne匹配多次
console.log('\n[测试2] AtLeastOne匹配多次: "123 456 789"')
try {
  const code2 = '123 456 789'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  console.log('  Token:', tokens2.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens2.length)
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.NumberList()
  
  if (result2 && parser2.tokenIndex === 3) {
    console.log('  ✅ 成功：匹配了3个Number')
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

// 测试3：AtLeastOne匹配0次应该失败
console.log('\n[测试3] AtLeastOne匹配0次应该抛出异常: "" (空输入)')
try {
  const code3 = ''
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  console.log('  Token数量:', tokens3.length)
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.NumberList()
  
  console.log('  ❌ 失败：应该抛出异常，但没有')
  failed++
} catch (e: any) {
  if (e.message.includes('Expected Number')) {
    console.log('  ✅ 成功：抛出了预期的异常（至少需要1次匹配）')
    console.log('  异常信息:', e.message)
    passed++
  } else {
    console.log('  ❌ 失败：异常信息不对:', e.message)
    failed++
  }
}

// 测试4：AtLeastOne的终止条件
console.log('\n[测试4] AtLeastOne的终止条件: "123 abc" (遇到非Number终止)')
try {
  const code4 = '123 abc'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
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

// 测试5：逗号分隔列表（至少2个元素）
console.log('\n[测试5] 逗号分隔列表: "1,2,3"')
try {
  const code5 = '1,2,3'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.tokenize(code5)
  
  console.log('  Token:', tokens5.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens5.length)
  console.log('  模式：Number (, Number)+ （至少2个Number）')
  
  const parser5 = new TestParser(tokens5)
  const result5 = parser5.CommaSeparatedNumbers()
  
  if (result5 && parser5.tokenIndex === 5) {
    console.log('  ✅ 成功：匹配了 Number (, Number)+ 模式')
    console.log('  消费了', parser5.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser5.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试6：逗号分隔列表匹配失败（只有1个元素）
console.log('\n[测试6] 逗号分隔列表失败: "1" (只有1个元素，需要至少2个)')
try {
  const code6 = '1'
  const lexer6 = new SubhutiLexer(testTokens)
  const tokens6 = lexer6.tokenize(code6)
  
  console.log('  Token:', tokens6.map(t => t.tokenValue).join(' '))
  console.log('  预期：AtLeastOne 要求至少一个逗号，应该抛出异常')
  
  const parser6 = new TestParser(tokens6)
  const result6 = parser6.CommaSeparatedNumbers()
  
  console.log('  ❌ 失败：应该抛出异常，但没有')
  failed++
} catch (e: any) {
  if (e.message.includes('Expected Comma')) {
    console.log('  ✅ 成功：抛出了预期的异常（需要至少1个逗号）')
    console.log('  异常信息:', e.message)
    passed++
  } else {
    console.log('  ❌ 失败：异常信息不对:', e.message)
    failed++
  }
}

// 测试7：AtLeastOne后跟固定token
console.log('\n[测试7] AtLeastOne后跟固定token: "a b c ;" (Identifier+ Semicolon)')
try {
  const code7 = 'a b c ;'
  const lexer7 = new SubhutiLexer(testTokens)
  const tokens7 = lexer7.tokenize(code7)
  
  console.log('  Token:', tokens7.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens7.length)
  
  const parser7 = new TestParser(tokens7)
  const result7 = parser7.IdentifiersWithSemicolon()
  
  if (result7 && parser7.tokenIndex === 4) {
    console.log('  ✅ 成功：AtLeastOne正确终止，消费了分号')
    console.log('  消费了', parser7.tokenIndex, '个token (a + b + c + ;)')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser7.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试8：加法表达式
console.log('\n[测试8] 加法表达式: "1 + 2 + 3"')
try {
  const code8 = '1 + 2 + 3'
  const lexer8 = new SubhutiLexer(testTokens)
  const tokens8 = lexer8.tokenize(code8)
  
  console.log('  Token:', tokens8.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens8.length)
  console.log('  模式：Number (+ Number)+')
  
  const parser8 = new TestParser(tokens8)
  const result8 = parser8.Addition()
  
  if (result8 && parser8.tokenIndex === 5) {
    console.log('  ✅ 成功：匹配了加法表达式')
    console.log('  消费了', parser8.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser8.tokenIndex)
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

console.log('\n📋 AtLeastOne规则要点：')
console.log('1. AtLeastOne要求至少匹配1次（不同于Many的0次或多次）')
console.log('2. AtLeastOne第一次匹配失败会抛出异常')
console.log('3. AtLeastOne后续匹配失败会正常终止')
console.log('4. AtLeastOne常用于"1个或多个"的模式（如列表至少1个元素）')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}


