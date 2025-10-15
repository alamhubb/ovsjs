import { readFileSync } from 'fs'
import SubhutiLexer from './src/parser/SubhutiLexer.ts'
import MinimalParser from './tests/fixtures/MinimalParser.ts'
import { minimalTokens } from './tests/fixtures/MinimalTokens.ts'

// Subhuti Or回退问题测试

const testCases = [
  // 单个特性测试（01-05）
  'tests/cases/single/01-or-simple.txt',
  'tests/cases/single/02-or-backtrack-token-fail.txt',
  // 'tests/cases/single/03-or-backtrack-partial.txt',
  // 'tests/cases/single/04-or-nested.txt',
  // 'tests/cases/single/05-or-priority.txt',
  
  // 组合测试（06-10）
  // 'tests/cases/combined/06-arrow-vs-paren.txt',
  // 'tests/cases/combined/07-iife-pattern.txt',
  // 'tests/cases/combined/08-multiple-alternatives.txt',
  // 'tests/cases/combined/09-or-with-many.txt',
  // 'tests/cases/combined/10-production-case.txt',
]

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' Subhuti Or回退问题测试'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')

let passCount = 0
let failCount = 0

for (const testCase of testCases) {
  const fileName = testCase.split('/').pop()!
  console.log(`\n📝 测试: ${fileName}`)
  console.log('─'.repeat(80))
  
  try {
    const code = readFileSync(testCase, 'utf-8').trim()
    console.log(`代码: ${code}`)
    
    // 1. 词法分析
    const lexer = new SubhutiLexer(minimalTokens)
    const tokens = lexer.lexer(code)
    console.log(`✅ Lexer成功: ${tokens.length}个tokens`)
    console.log(`   Tokens: ${tokens.map(t => t.type).join(', ')}`)
    
    // 2. 语法分析
    const parser = new MinimalParser(tokens)
    const cst = parser.Program()
    
    if (!cst) {
      throw new Error('Parser返回undefined')
    }
    
    console.log(`✅ Parser成功`)
    console.log(`   CST name: ${cst.name}`)
    console.log(`   CST children: ${cst.children?.length || 0}个`)
    if (cst.children) {
      console.log(`   Children names: ${cst.children.map(c => c.name).join(', ')}`)
    }
    
    passCount++
  } catch (e: any) {
    console.log(`❌ 测试失败`)
    console.log(`   错误: ${e.message}`)
    
    // Or回退问题诊断
    if (e.message.includes('Arrow') || e.message.includes('=>')) {
      console.log(`\n🔍 Or回退问题诊断：`)
      console.log(`   - ArrowFunction分支部分匹配成功`)
      console.log(`   - Arrow token期望失败`)
      console.log(`   - Or未正确回退到下一个分支`)
    }
    
    failCount++
  }
}

console.log('\n' + '═'.repeat(80))
console.log(`📊 测试总结: ${passCount}/${testCases.length} 通过`)
console.log('═'.repeat(80))

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！')
} else {
  console.log(`\n⚠️  ${failCount} 个测试失败`)
}

