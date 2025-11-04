/**
 * SubhutiParser 测试 003：Or规则顺序问题（关键测试）
 * 
 * 测试目标：
 * 1. 验证短规则在前会导致长规则无法匹配
 * 2. 验证长规则在前能正确工作
 * 3. 这是导致 Slime Parser 失败的根本原因
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
  LetTok: createKeywordToken('LetTok', 'let'),
  AsTok: createKeywordToken('AsTok', 'as'),
  Eq: createRegToken('Eq', /=/),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  Spacing: createValueRegToken('Spacing', /[ \t]+/, ' ', SubhutiCreateTokenGroupType.skip),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() {
    return this.consume(testTokensObj.LetTok)
  }
  
  AsTok() {
    return this.consume(testTokensObj.AsTok)
  }
  
  Eq() {
    return this.consume(testTokensObj.Eq)
  }
  
  Identifier() {
    return this.consume(testTokensObj.Identifier)
  }
  
  Number() {
    return this.consume(testTokensObj.Number)
  }
}

// ============================================
// 错误的Parser（短规则在前）
// ============================================

@Subhuti
class BadParser extends SubhutiParser<TestTokenConsumer> {
  constructor(
    tokens?: SubhutiMatchToken[],
    TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
  ) {
    super(tokens, TokenConsumerClass)
  }
  
  // ❌ 错误：短规则在前
  @SubhutiRule
  ImportName() {
    this.Or([
      // 短规则：只匹配 "name"
      {
        alt: () => {
          this.tokenConsumer.Identifier()
        }
      },
      // 长规则：匹配 "name as userName"
      {
        alt: () => {
          this.tokenConsumer.Identifier()
          this.tokenConsumer.AsTok()
          this.tokenConsumer.Identifier()
        }
      }
    ])
  }
}

// ============================================
// 正确的Parser（长规则在前）
// ============================================

@Subhuti
class GoodParser extends SubhutiParser<TestTokenConsumer> {
  constructor(
    tokens?: SubhutiMatchToken[],
    TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
  ) {
    super(tokens, TokenConsumerClass)
  }
  
  // ✅ 正确：长规则在前
  @SubhutiRule
  ImportName() {
    this.Or([
      // 长规则：匹配 "name as userName"
      {
        alt: () => {
          this.tokenConsumer.Identifier()
          this.tokenConsumer.AsTok()
          this.tokenConsumer.Identifier()
        }
      },
      // 短规则：只匹配 "name"
      {
        alt: () => {
          this.tokenConsumer.Identifier()
        }
      }
    ])
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 003：Or规则顺序问题（关键测试）')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：短规则在前 - 匹配短形式
console.log('\n[测试1] 短规则在前 - 匹配短形式: "name"')
try {
  const code1 = 'name'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  console.log('  Token:', tokens1.map(t => t.tokenValue).join(' '))
  
  const parser1 = new BadParser(tokens1)
  const result1 = parser1.ImportName()
  
  if (result1 && result1.children.length > 0 && parser1.tokenIndex === 1) {
    console.log('  ✅ 成功：短形式匹配正常')
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

// 测试2：短规则在前 - 匹配长形式（会失败）
console.log('\n[测试2] ❌ 短规则在前 - 尝试匹配长形式: "name as userName"')
console.log('  预期：第一个分支匹配 "name"，剩余 "as userName" 无法处理')
try {
  const code2 = 'name as userName'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  console.log('  Token:', tokens2.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens2.length)
  
  const parser2 = new BadParser(tokens2)
  const result2 = parser2.ImportName()
  
  console.log('  解析后 tokenIndex:', parser2.tokenIndex)
  console.log('  剩余 token:', tokens2.length - parser2.tokenIndex, '个')
  
  if (result2 && parser2.tokenIndex === 1) {
    console.log('  ✅ 确认问题：只消费了第一个token，剩余token未处理')
    console.log('  这就是导致 Slime Parser 失败的原因！')
    passed++
  } else {
    console.log('  ❌ 意外：行为不符合预期')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：长规则在前 - 匹配短形式
console.log('\n[测试3] 长规则在前 - 匹配短形式: "name"')
try {
  const code3 = 'name'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  console.log('  Token:', tokens3.map(t => t.tokenValue).join(' '))
  
  const parser3 = new GoodParser(tokens3)
  const result3 = parser3.ImportName()
  
  if (result3 && result3.children.length > 0 && parser3.tokenIndex === 1) {
    console.log('  ✅ 成功：第一个分支失败（缺少as），回溯到第二个分支成功')
    console.log('  消费了', parser3.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：长规则在前 - 匹配长形式
console.log('\n[测试4] ✅ 长规则在前 - 匹配长形式: "name as userName"')
try {
  const code4 = 'name as userName'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
  console.log('  Token:', tokens4.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens4.length)
  
  const parser4 = new GoodParser(tokens4)
  const result4 = parser4.ImportName()
  
  console.log('  解析后 tokenIndex:', parser4.tokenIndex)
  console.log('  剩余 token:', tokens4.length - parser4.tokenIndex, '个')
  
  if (result4 && result4.children.length > 0 && parser4.tokenIndex === 3) {
    console.log('  ✅ 成功：第一个分支完全匹配，消费了所有token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser4.tokenIndex, '（应该是3）')
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

console.log('\n📋 关键结论：')
console.log('1. Or规则按顺序尝试，第一个成功即返回')
console.log('2. 短规则在前会导致长规则永远无法匹配')
console.log('3. 必须将长规则放在短规则前面！')
console.log('4. 这是 Slime Parser 失败的根本原因')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}

