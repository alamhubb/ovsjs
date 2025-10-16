// 直接测试Parser的特定规则方法
// 用法: npx tsx tests/ai/test-rule-directly.ts <ruleName> <code>
// 例如: npx tsx tests/ai/test-rule-directly.ts PrimaryExpression "true"

import Es6Parser from '../../packages/slime-parser/src/language/es2015/Es6Parser.ts'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import { es6Tokens } from '../../packages/slime-parser/src/language/es2015/Es6Tokens.ts'

const ruleName = process.argv[2]
const code = process.argv[3]

if (!ruleName || !code) {
  console.error('用法: npx tsx tests/ai/test-rule-directly.ts <ruleName> <code>')
  console.log('示例:')
  console.log('  npx tsx tests/ai/test-rule-directly.ts PrimaryExpression "true"')
  console.log('  npx tsx tests/ai/test-rule-directly.ts UnaryExpression "!true"')
  console.log('  npx tsx tests/ai/test-rule-directly.ts Expression "!true"')
  process.exit(1)
}

console.log(`\n📝 测试规则: ${ruleName}`)
console.log(`📝 代码: ${code}\n`)

// 1. 词法分析
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(`✅ 词法分析完成，tokens数量: ${tokens.length}`)
tokens.forEach((token, i) => {
  console.log(`  [${i}] ${token.tokenName.padEnd(20)} "${token.tokenValue}"`)
})

// 2. 创建Parser实例
const parser = new Es6Parser(tokens)

// 3. 检查规则方法是否存在
if (typeof (parser as any)[ruleName] !== 'function') {
  console.error(`\n❌ 规则方法不存在: ${ruleName}`)
  console.log('\n可用的规则方法（部分）:')
  console.log('  - PrimaryExpression')
  console.log('  - MemberExpression')
  console.log('  - PostfixExpression')
  console.log('  - UnaryExpression')
  console.log('  - MultiplicativeExpression')
  console.log('  - Expression')
  process.exit(1)
}

// 4. 直接调用规则方法
console.log(`\n🔍 直接调用 ${ruleName}()...\n`)
try {
  const cst = (parser as any)[ruleName]()
  
  if (!cst) {
    console.log('❌ 规则匹配失败，返回 undefined')
    console.log('   可能原因：')
    console.log('   - tokens不匹配该规则的语法')
    console.log('   - 规则的Or分支都失败了')
  } else {
    console.log('✅ 规则匹配成功！')
    console.log('\nCST结构:')
    console.log(JSON.stringify(cst, null, 2))
    
    // 显示剩余的tokens
    const remainingTokens = parser['tokens'] || []
    if (remainingTokens.length > 0) {
      console.log(`\n⚠️ 剩余 ${remainingTokens.length} 个未消费的tokens:`)
      remainingTokens.forEach((token: any, i: number) => {
        console.log(`  [${i}] ${token.tokenName} "${token.tokenValue}"`)
      })
    } else {
      console.log('\n✅ 所有tokens已消费')
    }
  }
} catch (error: any) {
  console.log('❌ 规则执行出错:')
  console.log(error.message)
  console.log('\n堆栈:')
  console.log(error.stack)
}

