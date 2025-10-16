import { readFileSync, writeFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 进度文件
const PROGRESS_FILE = 'progress.json'

// 更新进度
function updateProgress(data: any) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2))
}

// 测试用例列表
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
    if (fileName.includes('single')) {
      return { stage: '阶段3-ES6高级特性', color: '🟣' }
    } else {
      return { stage: '阶段4-复杂组合测试', color: '🟠' }
    }
  }
  return { stage: '未知阶段', color: '⚪' }
}

// 单个测试任务
async function runSingleTest(testCase: string, index: number) {
  const fileName = testCase.split('/').pop()!
  const { stage } = getStageInfo(fileName)
  const startTest = Date.now()
  
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
    return {
      index,
      fileName,
      stage,
      success: true,
      elapsed,
      error: null
    }
  } catch (e: any) {
    const elapsed = Date.now() - startTest
    return {
      index,
      fileName,
      stage,
      success: false,
      elapsed,
      error: e.message.substring(0, 40)
    }
  }
}

// 批次并行执行
async function runTestsInBatches(batchSize: number = 8) {
  const startTotal = Date.now()
  
  updateProgress({
    status: 'starting',
    startTime: startTotal,
    total: testCases.length,
    passCount: 0,
    failCount: 0,
    current: null,
    stage: null
  })
  
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ` Slime ES6 Parser并行测试 (40个用例，并发数=${batchSize})`.padEnd(78, ' ') + '║')
  console.log('║' + ' 预计耗时: 约10-20秒'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝\n')
  
  const allResults: any[] = []
  
  // 分批执行
  for (let i = 0; i < testCases.length; i += batchSize) {
    const batch = testCases.slice(i, i + batchSize)
    const batchPromises = batch.map((testCase, batchIndex) => 
      runSingleTest(testCase, i + batchIndex)
    )
    
    // 等待当前批次完成
    const batchResults = await Promise.all(batchPromises)
    allResults.push(...batchResults)
    
    // 输出当前批次结果
    for (const result of batchResults) {
      const slow = result.elapsed > 500 ? '⚠️' : ''
      if (result.success) {
        console.log(`✅ [${result.index+1}/${testCases.length}] ${result.fileName.padEnd(35)} ${result.elapsed}ms ${slow}`)
      } else {
        console.log(`❌ [${result.index+1}/${testCases.length}] ${result.fileName.padEnd(35)} ${result.elapsed}ms - ${result.error}`)
      }
    }
    
    // 更新进度
    const passCount = allResults.filter(r => r.success).length
    const failCount = allResults.filter(r => !r.success).length
    
    updateProgress({
      status: 'running',
      startTime: startTotal,
      total: testCases.length,
      passCount,
      failCount,
      progress: `${allResults.length}/${testCases.length}`
    })
  }
  
  // 统计结果
  const passCount = allResults.filter(r => r.success).length
  const failCount = allResults.filter(r => !r.success).length
  const slowTests = allResults
    .filter(r => r.elapsed > 500)
    .map(r => ({ name: r.fileName, time: r.elapsed }))
  
  const totalElapsed = Date.now() - startTotal
  const avgTime = Math.round(totalElapsed / testCases.length)
  
  updateProgress({
    status: 'completed',
    startTime: startTotal,
    endTime: Date.now(),
    total: testCases.length,
    passCount,
    failCount,
    slowTests,
    avgTime,
    totalElapsed
  })
  
  console.log('\n' + '═'.repeat(80))
  console.log(`📊 测试总结: ${passCount}/${testCases.length} 通过`)
  console.log(`⏱️  总耗时: ${(totalElapsed/1000).toFixed(2)}秒 | 平均: ${avgTime}ms/个`)
  console.log(`🚀 并行加速: ${batchSize}个测试同时执行`)
  console.log('═'.repeat(80))
  
  // 耗时分析
  if (totalElapsed > 10000) {
    console.log(`\n⏱️  耗时分析: 总耗时${(totalElapsed/1000).toFixed(1)}秒`)
    if (slowTests.length > 0) {
      const top5 = slowTests.sort((a, b) => b.time - a.time).slice(0, 5)
      console.log(`   最慢的5个测试: ${top5.map(t => `${t.name}(${(t.time/1000).toFixed(1)}s)`).join(', ')}`)
    }
  }
  
  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！')
  } else {
    console.log(`\n⚠️  ${failCount} 个测试失败`)
  }
}

// 并发数可以根据CPU核心数调整，默认8
const concurrency = parseInt(process.env.CONCURRENCY || '8')
runTestsInBatches(concurrency).catch(console.error)

