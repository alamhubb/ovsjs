#!/usr/bin/env tsx
/**
 * 🔍 映射偏移模式分析工具
 * 
 * 目标：找出偏移的规律，确定修复方向
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

// 测试两个文件
const tests = [
  { name: '05-conditional-render', file: 'tests/cases/mapping/05-conditional-render.ovs' },
  { name: '10-mixed-scenario', file: 'tests/cases/mapping/10-mixed-scenario.ovs' }
]

tests.forEach(test => {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📋 测试: ${test.name}`)
  console.log('='.repeat(80))
  
  const source = readFileSync(test.file, 'utf-8')
  const result = vitePluginOvsTransform(source)
  
  console.log('\n📄 源码:')
  console.log(source)
  
  console.log('\n📝 生成代码:')
  console.log(result.code)
  
  // 分析所有映射
  console.log('\n📊 所有映射详情:')
  result.mapping.forEach((m, i) => {
    const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
    const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
    
    const isMatch = 
      sourceText === generatedText || 
      generatedText === `'${sourceText}'` || 
      generatedText === `"${sourceText}"` ||
      sourceText === generatedText.replace(/'/g, '"')
    
    const offset = m.generate.index - m.source.index
    
    console.log(`\n[${i}] ${isMatch ? '✅' : '❌'} "${sourceText}"`)
    console.log(`    源码: ${m.source.index}-${m.source.index + m.source.length}`)
    console.log(`    生成: ${m.generate.index}-${m.generate.index + m.generate.length}`)
    console.log(`    偏差: ${offset > 0 ? '+' : ''}${offset}`)
    if (!isMatch) {
      console.log(`    实际生成: "${generatedText}"`)
      
      // 尝试在生成代码中查找正确的位置
      const correctIndex = result.code.indexOf(sourceText, 0)
      const correctIndexQuoted = result.code.indexOf(`'${sourceText}'`, 0)
      
      if (correctIndex >= 0) {
        console.log(`    💡 正确位置应该是: ${correctIndex} (偏差: ${m.generate.index - correctIndex})`)
      } else if (correctIndexQuoted >= 0) {
        console.log(`    💡 正确位置应该是: ${correctIndexQuoted} (偏差: ${m.generate.index - correctIndexQuoted})`)
      }
    }
  })
  
  console.log('\n')
})

console.log('\n💡 分析结论:')
console.log('-'.repeat(80))
console.log('通过对比偏移量，确定偏移是否有规律性')
console.log('如果偏移是累积的，说明问题在代码生成器的位置计算')
console.log('如果偏移是固定的，说明可能是某个包裹代码导致的')

