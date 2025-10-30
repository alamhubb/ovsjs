#!/usr/bin/env tsx
/**
 * 🔍 映射生成跟踪工具
 * 
 * 目标：分析title的所有映射记录，找出为什么会指向错误位置
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

const source = readFileSync('tests/cases/mapping/10-mixed-scenario.ovs', 'utf-8')
const result = vitePluginOvsTransform(source)

console.log('📄 源码:')
console.log(source)
console.log('\n' + '='.repeat(80))

console.log('\n📝 生成代码:')
console.log(result.code)
console.log('\n' + '='.repeat(80))

// 找到源码中 title 的所有位置
const titlePositionsInSource = []
let pos = -1
while ((pos = source.indexOf('title', pos + 1)) >= 0) {
  titlePositionsInSource.push(pos)
}

console.log('\n📍 源码中 "title" 的所有位置:')
titlePositionsInSource.forEach((p, i) => {
  const context = source.substring(Math.max(0, p - 10), Math.min(source.length, p + 15))
  console.log(`  [${i}] 位置${p}: "${context}"`)
})

// 找到生成代码中 title 的所有位置
const titlePositionsInGenerated = []
pos = -1
while ((pos = result.code.indexOf('title', pos + 1)) >= 0) {
  titlePositionsInGenerated.push(pos)
}

console.log('\n📍 生成代码中 "title" 的所有位置:')
titlePositionsInGenerated.forEach((p, i) => {
  const context = result.code.substring(Math.max(0, p - 10), Math.min(result.code.length, p + 15))
  console.log(`  [${i}] 位置${p}: "${context}"`)
})

// 找到所有与 title 相关的映射
console.log('\n📊 所有包含 "title" 的映射:')
result.mapping.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  if (sourceText.includes('title') || generatedText.includes('title')) {
    console.log(`\n[映射${i}]`)
    console.log(`  源码: "${sourceText}" (${m.source.index}-${m.source.index + m.source.length})`)
    console.log(`  生成: "${generatedText}" (${m.generate.index}-${m.generate.index + m.generate.length})`)
    console.log(`  源码loc.value: "${m.source.value}"`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('💡 关键分析:')
console.log('1. h1 { title } 的 title 在源码位置164-169')
console.log('2. 这个title应该映射到生成代码中的第几个title出现？')
console.log('3. 实际映射指向了哪里？')

