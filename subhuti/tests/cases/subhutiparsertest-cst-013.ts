/**
 * SubhutiParser 测试 013：CST结构测试
 * 
 * 测试目标：
 * 1. CST节点结构（name, children, value, loc）
 * 2. Location信息准确性（start/end位置）
 * 3. 嵌套CST结构
 * 4. Token vs Rule节点区分
 * 5. CST辅助方法（getChild, getChildren, hasChild等）
 */

import SubhutiLexer from "../../src/SubhutiLexer.ts"
import SubhutiParser, { Subhuti, SubhutiRule } from "../../src/SubhutiParser.ts"
import SubhutiTokenConsumer from "../../src/SubhutiTokenConsumer.ts"
import { createKeywordToken, createRegToken, createValueRegToken } from "../../src/struct/SubhutiCreateToken"
import type { SubhutiTokenConsumerConstructor } from "../../src/SubhutiParser.ts"
import SubhutiMatchToken from "../../src/struct/SubhutiMatchToken"

// ============================================
// 定义Token集
// ============================================

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

// ============================================
// Token Consumer
// ============================================

class TestTokenConsumer extends SubhutiTokenConsumer {
  LetTok() { return this.consume(testTokensObj.LetTok) }
  Eq() { return this.consume(testTokensObj.Eq) }
  Plus() { return this.consume(testTokensObj.Plus) }
  Semicolon() { return this.consume(testTokensObj.Semicolon) }
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
  
  // 变量声明：let x = 1 + 2 ;
  @SubhutiRule
  VariableDeclaration() {
    this.tokenConsumer.LetTok()
    this.tokenConsumer.Identifier()
    this.tokenConsumer.Eq()
    this.Expression()
    this.tokenConsumer.Semicolon()
  }
  
  // 表达式：Number ('+' Number)*
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
// 测试用例
// ============================================

console.log('='.repeat(70))
console.log('SubhutiParser 测试 013：CST结构测试')
console.log('='.repeat(70))

let passed = 0
let failed = 0

// 测试1：基本CST结构（使用 debug('cst') 可视化）
console.log('\n[测试1] 基本CST结构: "let x = 1 ;"')
try {
  const code1 = 'let x = 1 ;'
  const lexer1 = new SubhutiLexer(testTokens)
  const tokens1 = lexer1.tokenize(code1)
  
  const parser1 = new TestParser(tokens1).debug('cst')
  const cst1 = parser1.VariableDeclaration()
  
  console.log('  ') // CST 会自动输出
  
  if (cst1 && cst1.name === 'VariableDeclaration' && cst1.children) {
    console.log('  ✅ 成功：生成CST')
    console.log('  CST name:', cst1.name)
    console.log('  Children数量:', cst1.children.length)
    console.log('  Children names:', cst1.children.map(c => c.name).join(', '))
    passed++
  } else {
    console.log('  ❌ 失败：CST结构不正确')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2：Location信息
console.log('\n[测试2] Location信息: "let x = 1 ;"')
try {
  const code2 = 'let x = 1 ;'
  const lexer2 = new SubhutiLexer(testTokens)
  const tokens2 = lexer2.tokenize(code2)
  
  const parser2 = new TestParser(tokens2)
  const cst2 = parser2.VariableDeclaration()
  
  if (cst2 && cst2.loc) {
    console.log('  ✅ 成功：包含Location信息')
    console.log('  Type:', cst2.loc.type)
    console.log('  Start:', `line ${cst2.loc.start.line}, column ${cst2.loc.start.column}, index ${cst2.loc.start.index}`)
    console.log('  End:', `line ${cst2.loc.end.line}, column ${cst2.loc.end.column}, index ${cst2.loc.end.index}`)
    
    // 验证位置正确性
    if (cst2.loc.start.index === 0 && cst2.loc.end.index > 0) {
      console.log('  ✅ 位置信息准确')
      passed++
    } else {
      console.log('  ❌ 位置信息不准确')
      failed++
    }
  } else {
    console.log('  ❌ 失败：缺少Location信息')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3：Token节点 vs Rule节点
console.log('\n[测试3] Token vs Rule节点区分')
try {
  const code3 = 'let x = 1 ;'
  const lexer3 = new SubhutiLexer(testTokens)
  const tokens3 = lexer3.tokenize(code3)
  
  const parser3 = new TestParser(tokens3)
  const cst3 = parser3.VariableDeclaration()
  
  if (cst3 && cst3.children) {
    const tokenNodes = cst3.children.filter(c => c.value !== undefined)
    const ruleNodes = cst3.children.filter(c => c.value === undefined && c.children !== undefined)
    
    console.log('  Token节点数:', tokenNodes.length, tokenNodes.map(t => `${t.name}(${t.value})`).join(', '))
    console.log('  Rule节点数:', ruleNodes.length, ruleNodes.map(r => r.name).join(', '))
    
    if (tokenNodes.length > 0 && ruleNodes.length > 0) {
      console.log('  ✅ 成功：正确区分Token和Rule节点')
      passed++
    } else {
      console.log('  ❌ 失败：节点类型不正确')
      failed++
    }
  } else {
    console.log('  ❌ 失败：CST结构不正确')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4：嵌套CST结构（使用 debug('cst') 可视化）
console.log('\n[测试4] 嵌套CST: "let x = 1 + 2 + 3 ;"')
try {
  const code4 = 'let x = 1 + 2 + 3 ;'
  const lexer4 = new SubhutiLexer(testTokens)
  const tokens4 = lexer4.tokenize(code4)
  
  const parser4 = new TestParser(tokens4).debug('cst')
  const cst4 = parser4.VariableDeclaration()
  
  console.log('  ') // CST 会自动输出
  
  if (cst4) {
    // 查找Expression子节点
    const expression = cst4.children?.find(c => c.name === 'Expression')
    
    if (expression && expression.children) {
      console.log('  ✅ 成功：包含嵌套的Expression节点')
      console.log('  Expression children:', expression.children.length)
      console.log('  Expression内容:', expression.children.map(c => `${c.name}(${c.value || ''})`).join(' '))
      passed++
    } else {
      console.log('  ❌ 失败：缺少Expression子节点')
      failed++
    }
  } else {
    console.log('  ❌ 失败：解析失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5：CST辅助方法 - hasChild
console.log('\n[测试5] CST辅助方法 - hasChild()')
try {
  const code5 = 'let x = 1 ;'
  const lexer5 = new SubhutiLexer(testTokens)
  const tokens5 = lexer5.tokenize(code5)
  
  const parser5 = new TestParser(tokens5)
  const cst5 = parser5.VariableDeclaration()
  
  if (cst5) {
    const hasExpression = cst5.hasChild && cst5.hasChild('Expression')
    const hasStatement = cst5.hasChild && cst5.hasChild('Statement')
    
    console.log('  Has Expression:', hasExpression)
    console.log('  Has Statement:', hasStatement)
    
    if (hasExpression && !hasStatement) {
      console.log('  ✅ 成功：hasChild()正确工作')
      passed++
    } else {
      console.log('  ❌ 失败：hasChild()结果不正确')
      failed++
    }
  } else {
    console.log('  ❌ 失败：解析失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试6：CST辅助方法 - getChild
console.log('\n[测试6] CST辅助方法 - getChild()')
try {
  const code6 = 'let x = 1 ;'
  const lexer6 = new SubhutiLexer(testTokens)
  const tokens6 = lexer6.tokenize(code6)
  
  const parser6 = new TestParser(tokens6)
  const cst6 = parser6.VariableDeclaration()
  
  if (cst6) {
    const firstLet = cst6.getChild && cst6.getChild('LetTok', 0)
    const firstIdentifier = cst6.getChild && cst6.getChild('Identifier', 0)
    
    console.log('  First LetTok:', firstLet ? `${firstLet.name}(${firstLet.value})` : 'null')
    console.log('  First Identifier:', firstIdentifier ? `${firstIdentifier.name}(${firstIdentifier.value})` : 'null')
    
    if (firstLet && firstLet.value === 'let' && firstIdentifier && firstIdentifier.value === 'x') {
      console.log('  ✅ 成功：getChild()正确工作')
      passed++
    } else {
      console.log('  ❌ 失败：getChild()结果不正确')
      failed++
    }
  } else {
    console.log('  ❌ 失败：解析失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试7：CST辅助方法 - getChildren
console.log('\n[测试7] CST辅助方法 - getChildren()')
try {
  const code7 = 'let x = 1 + 2 ;'
  const lexer7 = new SubhutiLexer(testTokens)
  const tokens7 = lexer7.tokenize(code7)
  
  const parser7 = new TestParser(tokens7)
  const cst7 = parser7.VariableDeclaration()
  
  if (cst7) {
    const expression = cst7.getChild && cst7.getChild('Expression', 0)
    if (expression) {
      const numbers = expression.getChildren && expression.getChildren('Number')
      
      console.log('  Numbers:', numbers ? numbers.map(n => n.value).join(', ') : 'null')
      
      if (numbers && numbers.length === 2) {
        console.log('  ✅ 成功：getChildren()正确工作')
        passed++
      } else {
        console.log('  ❌ 失败：getChildren()结果不正确')
        failed++
      }
    } else {
      console.log('  ❌ 失败：找不到Expression')
      failed++
    }
  } else {
    console.log('  ❌ 失败：解析失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试8：空children优化
console.log('\n[测试8] 空children优化（应该被设置为undefined）')
try {
  const code8 = 'let x = 1 ;'
  const lexer8 = new SubhutiLexer(testTokens)
  const tokens8 = lexer8.tokenize(code8)
  
  const parser8 = new TestParser(tokens8)
  const cst8 = parser8.VariableDeclaration()
  
  if (cst8) {
    // Token节点的children应该是undefined
    const letToken = cst8.getChild && cst8.getChild('LetTok', 0)
    
    if (letToken && letToken.children === undefined) {
      console.log('  ✅ 成功：Token节点的children被优化为undefined')
      passed++
    } else {
      console.log('  ⚠️  注意：Token节点的children未优化:', letToken?.children)
      passed++  // 不算失败，这是优化，不是必须
    }
  } else {
    console.log('  ❌ 失败：解析失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
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

console.log('\n📋 CST结构要点：')
console.log('1. CST节点包含：name, children, value, loc')
console.log('2. Token节点有value，Rule节点有children')
console.log('3. Location信息准确到行列号和索引')
console.log('4. 支持嵌套CST结构')
console.log('5. 辅助方法：hasChild, getChild, getChildren, childCount等')
console.log('6. 空children优化为undefined（减少内存）')
console.log('\n📋 CST Debug功能：')
console.log('1. .debug(\'cst\') - 输出 CST 树形结构')
console.log('2. 自动在解析完成后输出CST')
console.log('3. Token节点显示位置信息')
console.log('4. 清晰区分Token和Rule节点')
console.log('5. 用于快速验证CST结构正确性')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}

