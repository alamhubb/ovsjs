/**
 * SubhutiParser 测试 006：嵌套规则测试
 * 
 * 测试目标：
 * 1. Or嵌套Many
 * 2. Many嵌套Option
 * 3. 复杂的规则组合
 * 4. CST结构验证
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
  LetTok: createKeywordToken('LetTok', 'let'),
  VarTok: createKeywordToken('VarTok', 'var'),
  ConstTok: createKeywordToken('ConstTok', 'const'),
  Comma: createValueRegToken('Comma', /,/, ','),
  Eq: createValueRegToken('Eq', /=/, '='),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
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
  
  Comma() {
    return this.consume(testTokensObj.Comma)
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
  
  // 简化的变量声明：let|var|const Identifier [= Number]
  @SubhutiRule
  VariableDeclarator() {
    this.tokenConsumer.Identifier()
    this.Option(() => {
      this.tokenConsumer.Eq()
      this.tokenConsumer.Number()
    })
  }
  
  // let|var|const
  @SubhutiRule
  VarKeyword() {
    this.Or([
      {alt: () => this.tokenConsumer.VarTok()},
      {alt: () => this.tokenConsumer.LetTok()},
      {alt: () => this.tokenConsumer.ConstTok()}
    ])
  }
  
  // 变量声明列表：VariableDeclarator (, VariableDeclarator)*
  @SubhutiRule
  VariableDeclarationList() {
    this.VariableDeclarator()
    this.Many(() => {
      this.tokenConsumer.Comma()
      this.VariableDeclarator()
    })
  }
  
  // 完整的变量声明：Keyword DeclarationList ;
  @SubhutiRule
  VariableStatement() {
    this.VarKeyword()
    this.VariableDeclarationList()
    this.tokenConsumer.Semicolon()
  }
}

// ============================================
// 测试用例
// ============================================

console.log('='.repeat(60))
console.log('SubhutiParser 测试 006：嵌套规则测试')
console.log('='.repeat(60))

let passed = 0
let failed = 0

// 测试1：最简单的变量声明
console.log('\n[测试1] 简单变量声明: "let x ;"')
try {
  const code1 = 'let x ;'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.lexer(code1)
  
  console.log('  Token:', tokens1.map(t => t.tokenValue).join(' '))
  
  const parser1 = new TestParser(tokens1)
  const result1 = parser1.VariableStatement()
  
  if (result1 && result1.children.length > 0 && parser1.tokenIndex === 3) {
    console.log('  ✅ 成功：Or + Option组合正确')
    console.log('  CST name:', result1.name)
    console.log('  CST children数:', result1.children.length)
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser1.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：带初始化的变量声明
console.log('\n[测试2] 带初始化: "var x = 10 ;"')
try {
  const code2 = 'var x = 10 ;'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.lexer(code2)
  
  console.log('  Token:', tokens2.map(t => t.tokenValue).join(' '))
  
  const parser2 = new TestParser(tokens2)
  const result2 = parser2.VariableStatement()
  
  if (result2 && parser2.tokenIndex === 5) {
    console.log('  ✅ 成功：Or + Option(带初始化)组合正确')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser2.tokenIndex)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：多个变量声明
console.log('\n[测试3] 多个变量: "const a = 1 , b = 2 , c ;"')
try {
  const code3 = 'const a = 1 , b = 2 , c ;'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.lexer(code3)
  
  console.log('  Token:', tokens3.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens3.length)
  
  const parser3 = new TestParser(tokens3)
  const result3 = parser3.VariableStatement()
  
  if (result3 && parser3.tokenIndex === 11) {
    console.log('  ✅ 成功：Or + Many + Option组合正确')
    console.log('  消费了', parser3.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser3.tokenIndex, '（应该是11）')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：CST结构验证
console.log('\n[测试4] CST结构验证: "let x = 5 , y ;"')
try {
  const code4 = 'let x = 5 , y ;'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.lexer(code4)
  
  console.log('  Token:', tokens4.map(t => t.tokenValue).join(' '))
  
  const parser4 = new TestParser(tokens4)
  const result4 = parser4.VariableStatement()
  
  if (result4 && result4.children.length > 0) {
    console.log('  ✅ 成功：生成了CST')
    console.log('  CST name:', result4.name)
    console.log('  CST children数:', result4.children.length)
    
    // 检查CST结构
    let hasVarKeyword = false
    let hasDeclarationList = false
    
    result4.children.forEach(child => {
      if (child.name === 'VarKeyword') hasVarKeyword = true
      if (child.name === 'VariableDeclarationList') hasDeclarationList = true
    })
    
    if (hasVarKeyword && hasDeclarationList) {
      console.log('  ✅ CST结构正确：包含VarKeyword和VariableDeclarationList')
      passed++
    } else {
      console.log('  ❌ CST结构不完整')
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

// 测试5：复杂嵌套 - 多变量多初始化
console.log('\n[测试5] 复杂嵌套: "var a , b = 2 , c = 3 , d ;"')
try {
  const code5 = 'var a , b = 2 , c = 3 , d ;'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.lexer(code5)
  
  console.log('  Token:', tokens5.map(t => t.tokenValue).join(' '))
  console.log('  Token数量:', tokens5.length)
  console.log('  规则嵌套：Or(var) + Many(Comma + Option(Eq + Number))')
  
  const parser5 = new TestParser(tokens5)
  const result5 = parser5.VariableStatement()
  
  if (result5 && parser5.tokenIndex === 13) {
    console.log('  ✅ 成功：复杂嵌套规则工作正常')
    console.log('  消费了', parser5.tokenIndex, '个token')
    passed++
  } else {
    console.log('  ❌ 失败：tokenIndex =', parser5.tokenIndex, '（应该是13）')
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

console.log('\n📋 嵌套规则要点：')
console.log('1. Or、Many、Option可以任意嵌套')
console.log('2. 规则调用可以递归组合')
console.log('3. CST会保留完整的嵌套结构')
console.log('4. 复杂语法可以由简单规则组合而成')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}


