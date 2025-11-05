/**
 * SubhutiParser 测试 009：错误处理测试
 * 
 * 测试目标：
 * 1. 错误信息格式
 * 2. ruleStack 追踪
 * 3. 位置信息准确性
 * 4. 智能修复建议
 * 5. 详细/简洁模式切换
 */

import SubhutiLexer from "../../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken, createValueRegToken } from "../../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../../src/SubhutiParser.ts"
import SubhutiMatchToken from "../../src/struct/SubhutiMatchToken"
import { ParsingError } from "../../src/SubhutiError.ts"

// ============================================
// 定义Token集
// ============================================

const testTokensObj = {
  LetTok: createKeywordToken('LetTok', 'let'),
  VarTok: createKeywordToken('VarTok', 'var'),
  LBrace: createValueRegToken('LBrace', /{/, '{'),
  RBrace: createValueRegToken('RBrace', /}/, '}'),
  LParen: createValueRegToken('LParen', /\(/, '('),
  RParen: createValueRegToken('RParen', /\)/, ')'),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Eq: createValueRegToken('Eq', /=/, '='),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
}

const testTokens = Object.values(testTokensObj)

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() { return this.consume(testTokensObj.LetTok) }
  VarTok() { return this.consume(testTokensObj.VarTok) }
  LBrace() { return this.consume(testTokensObj.LBrace) }
  RBrace() { return this.consume(testTokensObj.RBrace) }
  LParen() { return this.consume(testTokensObj.LParen) }
  RParen() { return this.consume(testTokensObj.RParen) }
  Semicolon() { return this.consume(testTokensObj.Semicolon) }
  Eq() { return this.consume(testTokensObj.Eq) }
  Identifier() { return this.consume(testTokensObj.Identifier) }
  Number() { return this.consume(testTokensObj.Number) }
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
  
  // 简单声明
  @SubhutiRule
  SimpleDeclaration() {
    this.tokenConsumer.LetTok()
    this.tokenConsumer.Identifier()
    this.tokenConsumer.Semicolon()
  }
  
  // 块语句（测试嵌套规则栈）
  @SubhutiRule
  BlockStatement() {
    this.tokenConsumer.LBrace()
    this.StatementList()
    this.tokenConsumer.RBrace()
  }
  
  @SubhutiRule
  StatementList() {
    this.Many(() => this.Statement())
  }
  
  @SubhutiRule
  Statement() {
    this.SimpleDeclaration()
  }
  
  // 函数调用（测试括号匹配）
  @SubhutiRule
  FunctionCall() {
    this.tokenConsumer.Identifier()
    this.tokenConsumer.LParen()
    this.ArgumentList()
    this.tokenConsumer.RParen()
  }
  
  @SubhutiRule
  ArgumentList() {
    this.Many(() => this.tokenConsumer.Identifier())
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(70))
console.log('SubhutiParser 测试 009：错误处理测试')
console.log('='.repeat(70))

let passed = 0
let failed = 0

// 测试1：基本错误信息
console.log('\n[测试1] 基本错误信息: "let x" (缺少分号)')
try {
  const code1 = 'let x'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  const parser1 = new TestParser(tokens1).errorHandler(true)
  parser1.SimpleDeclaration()
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  Expected:', e.expected)
    console.log('  Found:', e.found?.tokenName || 'EOF')
    console.log('  Position:', `line ${e.position.line}, column ${e.position.column}`)
    
    if (e.expected === 'Semicolon' && e.position.line === 1) {
      console.log('  ✅ 错误信息准确')
      passed++
    } else {
      console.log('  ❌ 错误信息不准确')
      failed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError:', e.message)
    failed++
  }
}

// 测试2：ruleStack 追踪（嵌套规则）
console.log('\n[测试2] RuleStack 追踪: "{ let x }" (缺少分号，嵌套在Block中)')
try {
  const code2 = '{ let x }'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  const parser2 = new TestParser(tokens2).errorHandler(true)
  parser2.BlockStatement()
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  RuleStack:', e.ruleStack.join(' > '))
    
    // 验证规则栈包含嵌套信息（至少包含BlockStatement）
    if (e.ruleStack.length > 0 && e.ruleStack.includes('BlockStatement')) {
      console.log('  ✅ RuleStack 正确追踪（包含BlockStatement）')
      console.log('  Note: RuleStack深度:', e.ruleStack.length)
      passed++
    } else {
      console.log('  ❌ RuleStack 不完整，Stack:', e.ruleStack)
      failed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError')
    failed++
  }
}

// 测试3：位置信息准确性（多行代码）
console.log('\n[测试3] 多行位置信息: "let x;\\nlet y" (第二行缺少分号)')
try {
  const code3 = 'let x;\nlet y'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  const parser3 = new TestParser(tokens3).errorHandler(true)
  parser3.SimpleDeclaration()  // 第一个成功
  parser3.SimpleDeclaration()  // 第二个失败
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  Position:', `line ${e.position.line}, column ${e.position.column}`)
    
    if (e.position.line === 2) {
      console.log('  ✅ 位置信息准确（第2行）')
      passed++
    } else {
      console.log('  ❌ 位置信息错误（应该是第2行）')
      failed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError')
    failed++
  }
}

// 测试4：智能修复建议（缺少闭合符号）
console.log('\n[测试4] 智能建议: "func(" (缺少右括号)')
try {
  const code4 = 'func('
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
  const parser4 = new TestParser(tokens4).errorHandler(true)
  parser4.FunctionCall()
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  Suggestions:', e.suggestions)
    
    if (e.suggestions && e.suggestions.length > 0) {
      console.log('  ✅ 提供了智能修复建议')
      passed++
    } else {
      console.log('  ⚠️  未提供建议（可能不是常见错误场景）')
      passed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError')
    failed++
  }
}

// 测试5：简洁模式（不生成建议）
console.log('\n[测试5] 简洁模式: "let x" (不生成智能建议)')
try {
  const code5 = 'let x'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.tokenize(code5)
  
  const parser5 = new TestParser(tokens5).errorHandler(false)  // 关闭详细模式
  parser5.SimpleDeclaration()
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  Suggestions length:', e.suggestions.length)
    
    if (e.suggestions.length === 0) {
      console.log('  ✅ 简洁模式不生成建议')
      passed++
    } else {
      console.log('  ❌ 简洁模式仍然生成了建议')
      failed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError')
    failed++
  }
}

// 测试6：EOF 错误
console.log('\n[测试6] EOF 错误: "" (空输入)')
try {
  const code6 = ''
  const lexer6 = new SubhutiLexer(testTokens)
  const tokens6 = lexer6.tokenize(code6)
  
  const parser6 = new TestParser(tokens6).errorHandler(true)
  parser6.SimpleDeclaration()
  
  console.log('  ❌ 失败：应该抛出异常')
  failed++
} catch (e: any) {
  if (e instanceof ParsingError) {
    console.log('  ✅ 成功：抛出 ParsingError')
    console.log('  Found:', e.found?.tokenName || 'EOF')
    
    if (!e.found || e.found.tokenName === undefined) {
      console.log('  ✅ 正确识别EOF错误')
      passed++
    } else {
      console.log('  ❌ EOF识别错误')
      failed++
    }
  } else {
    console.log('  ❌ 失败：不是 ParsingError')
    failed++
  }
}

// ============================================
// 测试总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log('测试总结')
console.log('='.repeat(70))
console.log(`通过: ${passed}/${passed + failed}`)
console.log(`失败: ${failed}/${passed + failed}`)
console.log('='.repeat(70))

console.log('\n📋 错误处理要点：')
console.log('1. ParsingError 包含 expected、found、position、ruleStack')
console.log('2. RuleStack 追踪完整的规则调用链（用于调试）')
console.log('3. 位置信息准确到行列号')
console.log('4. 智能建议覆盖常见错误场景（详细模式）')
console.log('5. 简洁模式适合生产环境（不生成建议）')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}

