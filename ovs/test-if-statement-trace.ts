#!/usr/bin/env tsx
/**
 * 🔍 测试：if语句场景（复杂IIFE）
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

// 完全复现测试05的场景
const source = `const isVisible = true

div {
  if (isVisible) {
    p { "Visible content" }
  }
}`

console.log('📄 源码:')
console.log(source)
console.log('\n' + '='.repeat(80))

const result = vitePluginOvsTransform(source)

console.log('\n📝 生成代码:')
console.log(result.code)
console.log(`\n长度: ${result.code.length}`)

console.log('\n' + '='.repeat(80))
console.log('📊 包含isVisible的映射:')
result.mapping.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  if (sourceText.includes('isVisible') || generatedText.includes('isVisible')) {
    console.log(`\n[${i}] "${sourceText}" (源码${m.source.index}-${m.source.index + m.source.length})`)
    console.log(`    → "${generatedText}" (生成${m.generate.index}-${m.generate.index + m.generate.length})`)
    
    // 查找实际的isVisible位置
    const allIndices = []
    let pos = -1
    while ((pos = result.code.indexOf('isVisible', pos + 1)) >= 0) {
      allIndices.push(pos)
    }
    
    if (sourceText === 'isVisible') {
      console.log(`    生成代码中isVisible的所有位置: ${allIndices.join(', ')}`)
      console.log(`    映射指向: ${m.generate.index}`)
      console.log(`    是否正确: ${allIndices.includes(m.generate.index) ? '✅' : '❌'}`)
    }
  }
})

console.log('\n' + '='.repeat(80))
console.log('💡 关键：')
console.log('检查if (isVisible)中的isVisible映射是否指向正确位置')

