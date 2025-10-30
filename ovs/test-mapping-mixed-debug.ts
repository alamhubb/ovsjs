#!/usr/bin/env tsx
/**
 * 🔍 混合场景映射诊断工具
 * 
 * 目标：详细分析 10-mixed-scenario.ovs 的映射偏差
 * 准确率：81.3% (13/16个映射正确)
 * 
 * 测试场景：变量 + 嵌套 + 条件 + 循环的综合场景
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

const testFile = 'tests/cases/mapping/10-mixed-scenario.ovs'
const source = readFileSync(testFile, 'utf-8')

console.log('🔍 混合场景映射诊断工具')
console.log('='.repeat(80))
console.log('')

console.log('📄 源码内容:')
console.log('-'.repeat(80))
console.log(source)
console.log('')

// 编译
const result = vitePluginOvsTransform(source)

console.log('📝 生成代码:')
console.log('-'.repeat(80))
console.log(result.code)
console.log('')

console.log('📊 映射统计:')
console.log(`总映射数: ${result.mapping.length}`)
console.log('')

// 详细分析每个映射
console.log('🔬 详细映射分析:')
console.log('='.repeat(80))

let correctCount = 0
let incorrectCount = 0

result.mapping.forEach((m, index) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  // 判断是否匹配
  const isMatch = 
    sourceText === generatedText || 
    generatedText === `'${sourceText}'` || 
    generatedText === `"${sourceText}"` ||
    sourceText === generatedText.replace(/'/g, '"')
  
  if (isMatch) {
    correctCount++
    console.log(`\n✅ [${index}] 映射正确`)
  } else {
    incorrectCount++
    console.log(`\n❌ [${index}] 映射错误`)
  }
  
  console.log(`  源码位置: [${m.source.index}:${m.source.index + m.source.length}]`)
  console.log(`  源码内容: "${sourceText}"`)
  console.log(`  生成位置: [${m.generate.index}:${m.generate.index + m.generate.length}]`)
  console.log(`  生成内容: "${generatedText}"`)
  
  if (!isMatch) {
    // 计算偏差
    const offset = m.generate.index - m.source.index
    console.log(`  ⚠️  偏差: ${offset > 0 ? '+' : ''}${offset} 字符`)
    
    // 显示生成代码中该位置的上下文
    const contextStart = Math.max(0, m.generate.index - 20)
    const contextEnd = Math.min(result.code.length, m.generate.index + m.generate.length + 20)
    const context = result.code.substring(contextStart, contextEnd)
    console.log(`  上下文: ...${context}...`)
  }
})

console.log('')
console.log('='.repeat(80))
console.log('📈 诊断总结:')
console.log(`  正确映射: ${correctCount}/${result.mapping.length} (${(correctCount / result.mapping.length * 100).toFixed(1)}%)`)
console.log(`  错误映射: ${incorrectCount}/${result.mapping.length}`)
console.log('')

// 分析错误模式
console.log('🔍 错误映射特征分析:')
console.log('-'.repeat(80))

const errors = result.mapping.filter((m, index) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  return !(
    sourceText === generatedText || 
    generatedText === `'${sourceText}'` || 
    generatedText === `"${sourceText}"` ||
    sourceText === generatedText.replace(/'/g, '"')
  )
})

if (errors.length > 0) {
  console.log(`\n发现 ${errors.length} 个错误映射:`)
  
  errors.forEach((m, i) => {
    const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
    const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
    const offset = m.generate.index - m.source.index
    
    console.log(`\n  [${i + 1}] "${sourceText}" → "${generatedText}"`)
    console.log(`      偏差: ${offset > 0 ? '+' : ''}${offset}`)
    console.log(`      源码位置: ${m.source.index}`)
    console.log(`      生成位置: ${m.generate.index}`)
  })
}

console.log('')
console.log('💡 可能的问题:')
console.log('  1. if语句内部的映射位置偏移（与测试05相同）')
console.log('  2. for循环的映射记录问题')
console.log('  3. 多层嵌套导致累积偏差')
console.log('  4. 复杂IIFE生成时的位置计算')
console.log('')
console.log('💡 下一步诊断:')
console.log('  • 对比测试04（100%准确）和测试10的差异')
console.log('  • 创建简化版测试用例（单独测试if和for）')
console.log('  • 确认是否与测试05的问题相同')

