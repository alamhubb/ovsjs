/**
 * SubhutiParser CST Debug 功能示例
 * 
 * 展示如何使用 .debug('cst') 来可视化 CST 结构
 */

import SubhutiLexer from "../../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken, createValueRegToken } from "../../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../../src/SubhutiParser.ts"
import SubhutiMatchToken from "../../src/struct/SubhutiMatchToken"

// Token定义
const testTokensObj = {
  LetTok: createKeywordToken('LetTok', 'let'),
  Eq: createValueRegToken('Eq', /=/, '='),
  Plus: createValueRegToken('Plus', /\+/, '+'),
  Semicolon: createValueRegToken('Semicolon', /;/, ';'),
  Identifier: createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  Number: createRegToken('Number', /[0-9]+/),
  WhiteSpace: createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
}

const testTokens = Object.values(testTokensObj)

// Token Consumer
class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() { return this.consume(testTokensObj.LetTok) }
  Eq() { return this.consume(testTokensObj.Eq) }
  Plus() { return this.consume(testTokensObj.Plus) }
  Semicolon() { return this.consume(testTokensObj.Semicolon) }
  Identifier() { return this.consume(testTokensObj.Identifier) }
  Number() { return this.consume(testTokensObj.Number) }
}

// Parser
@Subhuti
class TestParser extends SubhutiParser<TestTokenConsumer> {
  constructor(
    tokens?: SubhutiMatchToken[],
    TokenConsumerClass: SubhutiTokenConsumerConstructor<TestTokenConsumer> = TestTokenConsumer as SubhutiTokenConsumerConstructor<TestTokenConsumer>
  ) {
    super(tokens, TokenConsumerClass)
  }
  
  @SubhutiRule
  VariableDeclaration() {
    this.tokenConsumer.LetTok()
    this.tokenConsumer.Identifier()
    this.tokenConsumer.Eq()
    this.Expression()
    this.tokenConsumer.Semicolon()
  }
  
  @SubhutiRule
  Expression() {
    this.tokenConsumer.Number()
    this.Many(() => {
      this.tokenConsumer.Plus()
      this.tokenConsumer.Number()
    })
  }
}

// ============================================
// 示例
// ============================================

console.log('='.repeat(70))
console.log('SubhutiParser CST Debug 功能示例')
console.log('='.repeat(70))

console.log('\n【示例1】简洁模式 - .debug(\'cst\')')
console.log('代码: "let x = 1 ;"')
console.log('-'.repeat(70))

const code1 = 'let x = 1 ;'
const lexer1 = new SubhutiLexer(testTokens)
const tokens1 = lexer1.tokenize(code1)
const parser1 = new TestParser(tokens1).debug('cst')
parser1.VariableDeclaration()

console.log('\n【示例2】普通调试模式 - .debug(true)')
console.log('代码: "let sum = 1 + 2 + 3 ;"')
console.log('-'.repeat(70))

const code2 = 'let sum = 1 + 2 + 3 ;'
const lexer2 = new SubhutiLexer(testTokens)
const tokens2 = lexer2.tokenize(code2)
const parser2 = new TestParser(tokens2).debug(true)  // 追踪 + 性能
parser2.VariableDeclaration()

console.log('\n【示例3】对比：启用 CST debug vs 不启用')
console.log('代码: "let y = 5 ;"')
console.log('-'.repeat(70))

console.log('\n不启用 debug（只看结果）：')
const code3 = 'let y = 5 ;'
const lexer3 = new SubhutiLexer(testTokens)
const tokens3 = lexer3.tokenize(code3)
const parser3 = new TestParser(tokens3)  // 不启用 debug
const result3 = parser3.VariableDeclaration()
console.log('解析成功:', result3 ? '✅' : '❌')

console.log('\n启用 CST debug（可视化结构）：')
const lexer3b = new SubhutiLexer(testTokens)
const tokens3b = lexer3b.tokenize(code3)
const parser3b = new TestParser(tokens3b).debug('cst')
parser3b.VariableDeclaration()

console.log('\n' + '='.repeat(70))
console.log('📋 Debug 模式说明：')
console.log('='.repeat(70))
console.log('1. debug(false) - 关闭调试（默认）')
console.log('2. debug(true) - 普通调试（实时追踪 + 性能摘要）')
console.log('3. debug(\'cst\') - CST 可视化（只输出 CST 树形结构）')
console.log('')
console.log('CST 输出格式：')
console.log('- Token 节点：TokenName: "value" [位置]')
console.log('- Rule 节点：RuleName')
console.log('- 位置格式：[行:列-列] 或 [行:列-行:列]')
console.log('- 树形结构：├─ │ └─ 等 Unicode 字符')
console.log('\n✅ 示例执行完成！')

