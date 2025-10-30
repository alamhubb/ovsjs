#!/usr/bin/env tsx
/**
 * 🔍 简化测试：只测试 h1 { title }
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

// 最简单的测试用例
const source = `div {
  h1 { title }
}`

console.log('📄 源码:')
console.log(source)
console.log('\n' + '='.repeat(80))

const result = vitePluginOvsTransform(source)

console.log('\n📝 生成代码:')
console.log(result.code)
console.log(`\n长度: ${result.code.length}`)

console.log('\n' + '='.repeat(80))
console.log('📊 所有映射:')
result.mapping.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  console.log(`\n[${i}] "${sourceText}" (源码${m.source.index}-${m.source.index + m.source.length})`)
  console.log(`    → "${generatedText}" (生成${m.generate.index}-${m.generate.index + m.generate.length})`)
  
  if (sourceText === 'title') {
    console.log(`    ⭐ title映射！`)
    console.log(`    源码位置: ${m.source.index}`)
    console.log(`    生成位置: ${m.generate.index}`)
    
    // 查找实际的title在哪里
    const actualIndex = result.code.indexOf('title')
    const allIndices = []
    let pos = -1
    while ((pos = result.code.indexOf('title', pos + 1)) >= 0) {
      allIndices.push(pos)
    }
    console.log(`    实际title位置: ${allIndices.join(', ')}`)
    console.log(`    偏差: ${m.generate.index - allIndices[allIndices.length - 1]}`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('💡 分析:')
console.log('找出title映射的generate.index和实际title位置的差异')

