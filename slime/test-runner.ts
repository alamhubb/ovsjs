import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// Slime测试 - ES6 Parser三阶段测试
// 01-10: ES6基础语法 | 11-20: Generator测试 | 21-30: ES6高级特性

const testCases = [
  // 单个特性测试（01-20）
  'tests/cases/single/01-literals.js',
  'tests/cases/single/02-identifiers.js',
  'tests/cases/single/03-binary-ops.js',
  'tests/cases/single/04-comparison.js',
  'tests/cases/single/05-logical-ops.js',
  'tests/cases/single/06-var-decl.js',
  'tests/cases/single/07-if-statement.js',
  'tests/cases/single/08-for-loop.js',
  'tests/cases/single/09-function-decl.js',
  'tests/cases/single/10-objects-arrays.js',
  'tests/cases/single/11-arrow-functions.js',
  'tests/cases/single/12-template-literals.js',
  'tests/cases/single/13-destructuring.js',
  'tests/cases/single/14-spread-rest.js',
  'tests/cases/single/15-class-basic.js',
  'tests/cases/single/16-class-extends.js',
  'tests/cases/single/17-enhanced-object.js',
  'tests/cases/single/18-default-params.js',
  'tests/cases/single/19-for-of-loop.js',
  'tests/cases/single/20-mixed-es6.js',
  
  // ES6高级特性测试（21-30）
  'tests/cases/single/21-generator.js',
  'tests/cases/single/22-symbol.js',
  'tests/cases/single/23-promise.js',
  'tests/cases/single/24-map-set.js',
  'tests/cases/single/25-module-import.js',
  'tests/cases/single/26-binary-octal.js',
  'tests/cases/single/27-computed-props.js',
  'tests/cases/single/28-weakmap-weakset.js',
  'tests/cases/single/29-async-await.js',
  'tests/cases/single/30-regex-unicode.js',
  
  // 组合特性测试（31-40）
  'tests/cases/combined/21-simple-roundtrip.js',
  'tests/cases/combined/22-control-flow.js',
  'tests/cases/combined/23-functions.js',
  'tests/cases/combined/24-objects-arrays.js',
  'tests/cases/combined/25-operators-all.js',
  'tests/cases/combined/26-exception-handling.js',
  'tests/cases/combined/27-strict-mode.js',
  'tests/cases/combined/28-array-methods.js',
  'tests/cases/combined/29-object-methods.js',
  'tests/cases/combined/30-production-level.js',
]

function getStageInfo(fileName: string): { stage: string; color: string } {
  const num = parseInt(fileName.split('-')[0])
  if (num >= 1 && num <= 10) {
    return { stage: '阶段1-基础语法', color: '🔵' }
  } else if (num >= 11 && num <= 20) {
    return { stage: '阶段2-ES6常用特性', color: '🟢' }
  } else if (num >= 21 && num <= 30) {
    // 根据路径判断
    if (fileName.includes('single')) {
      return { stage: '阶段3-ES6高级特性', color: '🟣' }
    } else {
      return { stage: '阶段4-复杂组合测试', color: '🟠' }
    }
  }
  return { stage: '未知阶段', color: '⚪' }
}

async function runTests() {
  const startTotal = Date.now()
  
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' Slime ES6 Parser完整测试 (40个用例)'.padEnd(78, ' ') + '║')
  console.log('║' + ' 预计耗时: 约8秒'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝\n')
  
  let passCount = 0
  let failCount = 0
  let currentStage = ''
  const slowTests: Array<{name: string, time: number}> = []
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const fileName = testCase.split('/').pop()!
    const { stage, color } = getStageInfo(fileName)
    const startTest = Date.now()
    
    // 阶段变更时输出分隔
    if (currentStage !== stage) {
      if (currentStage) console.log() // 阶段间空行
      console.log(`${color} ${stage}`)
      currentStage = stage
    }
    
    try {
      const code = readFileSync(testCase, 'utf-8')
      const lexer = new SubhutiLexer(es6Tokens)
      const tokens = lexer.lexer(code)
      const parser = new Es6Parser(tokens)
      const cst = parser.Program()
      if (!cst) throw new Error('CST为空')
      const slimeCstToAst = new SlimeCstToAst()
      const ast = slimeCstToAst.toProgram(cst)
      const result = SlimeGenerator.generator(ast, tokens)
      
      const elapsed = Date.now() - startTest
      const slow = elapsed > 500 ? '⚠️' : ''
      console.log(`✅ [${i+1}/${testCases.length}] ${fileName.padEnd(35)} ${elapsed}ms ${slow}`)
      if (elapsed > 500) slowTests.push({name: fileName, time: elapsed})
      passCount++
    } catch (e: any) {
      const elapsed = Date.now() - startTest
      console.log(`❌ [${i+1}/${testCases.length}] ${fileName.padEnd(35)} ${elapsed}ms - ${e.message.substring(0, 40)}`)
      failCount++
    }
  }
  
  const totalElapsed = Date.now() - startTotal
  const avgTime = Math.round(totalElapsed / testCases.length)
  
  console.log('\n' + '═'.repeat(80))
  console.log(`📊 测试总结: ${passCount}/${testCases.length} 通过`)
  console.log(`⏱️  总耗时: ${(totalElapsed/1000).toFixed(2)}秒 | 平均: ${avgTime}ms/个`)
  console.log('═'.repeat(80))
  
  // 耗时分析
  if (totalElapsed > 10000) {
    console.log(`\n⚠️  耗时分析: 总耗时${(totalElapsed/1000).toFixed(1)}秒超过10秒`)
    console.log(`   原因: ${testCases.length}个测试，平均${avgTime}ms/个`)
    if (slowTests.length > 0) {
      console.log(`   慢测试(>500ms): ${slowTests.map(t => `${t.name}(${t.time}ms)`).join(', ')}`)
    }
    console.log(`   优化建议: 考虑并行测试或缓存机制`)
  }
  
  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！')
  } else {
    console.log(`\n⚠️  ${failCount} 个测试失败`)
  }
}

runTests().catch(console.error)

