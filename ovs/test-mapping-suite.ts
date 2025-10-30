#!/usr/bin/env tsx
/**
 * 🔍 映射测试套件 - 验证0-10渐进式测试用例的源码映射准确性
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { vitePluginOvsTransform } from './src/index.ts'

interface TestResult {
  name: string
  totalMappings: number
  validMappings: number
  invalidMappings: number
  accurateRate: number
  passed: boolean
}

const MAPPING_DIR = 'tests/cases/mapping'
const MIN_ACCURACY = 90 // 最低准确率阈值 (%)

console.log('🎯 OVS 源码映射测试套件')
console.log('=' .repeat(60))
console.log('')

// 获取所有测试文件
const testFiles = readdirSync(MAPPING_DIR)
  .filter(f => f.endsWith('.ovs'))
  .sort()

const results: TestResult[] = []

testFiles.forEach((file, index) => {
  console.log(`\n📝 测试 ${index}: ${file}`)
  console.log('-'.repeat(60))
  
  const filePath = join(MAPPING_DIR, file)
  const source = readFileSync(filePath, 'utf-8')
  
  // 显示源码（去除注释行后的前3行）
  const sourceLines = source.split('\n').filter(line => !line.trim().startsWith('//'))
  const previewLines = sourceLines.slice(0, 3).join('\n')
  console.log('📄 源码预览:')
  console.log(previewLines)
  if (sourceLines.length > 3) {
    console.log('...')
  }
  console.log('')
  
  // 编译并获取映射
  const result = vitePluginOvsTransform(source)
  
  // 分类映射
  const validMappings = result.mapping.filter(m => 
    m.source && m.source.value && m.source.value !== ''
  )
  
  const invalidMappings = result.mapping.filter(m => 
    !m.source || !m.source.value || m.source.value === ''
  )
  
  // 验证映射准确性
  let accurateCount = 0
  validMappings.forEach(m => {
    const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
    const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
    
    const match = sourceText === generatedText || 
                  generatedText === `'${sourceText}'` || 
                  generatedText === `"${sourceText}"` ||
                  sourceText === generatedText.replace(/'/g, '"')
    
    if (match) accurateCount++
  })
  
  const accurateRate = validMappings.length > 0 
    ? (accurateCount / validMappings.length * 100) 
    : 0
  
  const passed = accurateRate >= MIN_ACCURACY && invalidMappings.length === 0
  
  // 输出结果
  console.log('📊 映射统计:')
  console.log(`  总映射数: ${result.mapping.length}`)
  console.log(`  有效映射: ${validMappings.length} ✅`)
  console.log(`  无效映射: ${invalidMappings.length} ${invalidMappings.length > 0 ? '❌' : '✅'}`)
  console.log(`  准确率: ${accurateRate.toFixed(1)}% ${passed ? '✅' : '❌'}`)
  
  if (validMappings.length > 0) {
    console.log('')
    console.log('🔍 有效映射详情 (前5个):')
    validMappings.slice(0, 5).forEach((m, i) => {
      const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
      const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
      console.log(`  [${i}] "${sourceText}" → "${generatedText}"`)
    })
    if (validMappings.length > 5) {
      console.log(`  ... 还有 ${validMappings.length - 5} 个映射`)
    }
  }
  
  if (invalidMappings.length > 0) {
    console.log('')
    console.log('⚠️  无效映射详情 (前3个):')
    invalidMappings.slice(0, 3).forEach((m, i) => {
      console.log(`  [${i}] generate.value="${m.generate?.value}"`)
    })
  }
  
  results.push({
    name: file,
    totalMappings: result.mapping.length,
    validMappings: validMappings.length,
    invalidMappings: invalidMappings.length,
    accurateRate,
    passed
  })
})

// 总结报告
console.log('\n\n')
console.log('=' .repeat(60))
console.log('📊 测试总结')
console.log('=' .repeat(60))
console.log('')

const passedTests = results.filter(r => r.passed).length
const totalTests = results.length

console.log(`总测试数: ${totalTests}`)
console.log(`通过: ${passedTests} ✅`)
console.log(`失败: ${totalTests - passedTests} ${totalTests - passedTests > 0 ? '❌' : '✅'}`)
console.log('')

console.log('详细结果:')
results.forEach((r, i) => {
  const status = r.passed ? '✅' : '❌'
  console.log(`  ${status} [${String(i).padStart(2, '0')}] ${r.name}`)
  console.log(`       准确率: ${r.accurateRate.toFixed(1)}% | 有效/无效: ${r.validMappings}/${r.invalidMappings}`)
})

console.log('')
if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！源码映射功能正常工作。')
} else {
  console.log(`⚠️  有 ${totalTests - passedTests} 个测试失败，需要检查映射逻辑。`)
}

console.log('')
console.log('💡 评估标准:')
console.log(`  • 准确率 ≥ ${MIN_ACCURACY}%`)
console.log(`  • 无效映射数 = 0`)





