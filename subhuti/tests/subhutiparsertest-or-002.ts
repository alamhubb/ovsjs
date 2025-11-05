/**
 * SubhutiParser 测试 002：Or规则基础测试
 * 
 * 测试目标：
 * 1. Or规则能否正确匹配第一个成功的分支
 * 2. 顺序尝试机制是否正常
 * 3. 回溯机制是否工作
 */

import SubhutiLexer from "../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken, createValueRegToken } from "../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../src/SubhutiParser.ts"
import SubhutiMatchToken from "../src/struct/SubhutiMatchToken"

// ============================================
// 定义Token集
// ============================================

const testTokensObj = {
  LetTok: createKeywordToken('LetTok', 'let'),
  VarTok: createKeywordToken('VarTok', 'var'),
  ConstTok: createKeywordToken('ConstTok', 'const'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() {
    return this.consume(testTokensObj.LetTok)
  }
  
  VarTok() {
    return this.consume(testTokensObj.VarTok)
  }
  
  ConstTok() {
    return this.consume(testTokensObj.ConstTok)
  }
  
  Identifier() {
    return this.consume(testTokensObj.Identifier)
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
  
  // Or规则：尝试匹配 let | var | const
  @SubhutiRule
  Keyword() {
    this.Or([
      {alt: () => this.tokenConsumer.VarTok()},
      {alt: () => this.tokenConsumer.LetTok()},
      {alt: () => this.tokenConsumer.ConstTok()}
    ])
  }
  
  // Or规则：带回溯测试
  @SubhutiRule
  WithBacktracking() {
    this.Or([
      // 分支1：尝试消费两个token（会失败并回溯）
      {
        alt: () => {
          this.tokenConsumer.LetTok()
          this.tokenConsumer.VarTok()  // 第二个不匹配，会失败
        }
      },
      // 分支2：只消费一个token（会成功）
      {
        alt: () => {
          this.tokenConsumer.LetTok()
        }
      }
    ])
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 002：Or规则基础测试')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：Or规则匹配第一个分支
console.log('\n[测试1] Or规则匹配第一个分支: "var"')
try {
  const code1 = 'var'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  console.log('  Token:', tokens1[0].tokenName)
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.Keyword()
  
  if (result1 && result1.children.length > 0) {
    console.log('  ✅ 成功：匹配了第一个分支 (VarTok)')
    passed++
  } else {
    console.log('  ❌ 失败：CST为空')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：Or规则匹配第二个分支
console.log('\n[测试2] Or规则匹配第二个分支: "let"')
try {
  const code2 = 'let'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  console.log('  Token:', tokens2[0].tokenName)
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.Keyword()
  
  if (result2 && result2.children.length > 0) {
    console.log('  ✅ 成功：跳过第一个分支，匹配了第二个分支 (LetTok)')
    passed++
  } else {
    console.log('  ❌ 失败：CST为空')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：Or规则匹配第三个分支
console.log('\n[测试3] Or规则匹配第三个分支: "const"')
try {
  const code3 = 'const'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  console.log('  Token:', tokens3[0].tokenName)
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.Keyword()
  
  if (result3 && result3.children.length > 0) {
    console.log('  ✅ 成功：跳过前两个分支，匹配了第三个分支 (ConstTok)')
    passed++
  } else {
    console.log('  ❌ 失败：CST为空')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：Or规则所有分支都失败
console.log('\n[测试4] Or规则所有分支都失败: "unknown"')
try {
  const code4 = 'unknown'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
  console.log('  Token:', tokens4[0].tokenName)
  
  const parser4 = new TestParser(tokens4)
  const result4 = parser4.Keyword()
  
  console.log('  ❌ 失败：应该抛出异常，但没有')
  failed++
} catch (e: any) {
  if (e.message.includes('Expected ConstTok')) {
    console.log('  ✅ 成功：所有分支失败，抛出最后一个分支的异常')
    console.log('  异常信息:', e.message)
    passed++
  } else {
    console.log('  ❌ 失败：异常信息不对:', e.message)
    failed++
  }
}

// 测试5：Or规则带回溯
console.log('\n[测试5] Or规则回溯测试: "let" (第一个分支失败，回溯到第二个分支)')
try {
  const code5 = 'let'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.tokenize(code5)
  
  console.log('  Token:', tokens5[0].tokenName)
  console.log('  第一个分支尝试: LetTok + VarTok → 会失败并回溯')
  console.log('  第二个分支尝试: LetTok → 会成功')
  
  const parser5 = new TestParser(tokens5)
  const result5 = parser5.WithBacktracking()
  
  if (result5 && result5.children.length > 0) {
    console.log('  ✅ 成功：回溯机制正常工作')
    console.log('  解析后token位置:', parser5.tokenIndex)
    
    if (parser5.tokenIndex === 1) {
      console.log('  ✅ 确认：消费了1个token（正确）')
      passed++
    } else {
      console.log('  ❌ 失败：消费了', parser5.tokenIndex, '个token（应该是1个）')
      failed++
    }
  } else {
    console.log('  ❌ 失败：CST为空')
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

if (failed === 0) {
  console.log('✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('❌ 有测试失败')
  process.exit(1)
}


