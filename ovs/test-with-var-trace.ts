#!/usr/bin/env tsx
/**
 * 🔍 测试：带顶层变量的场景
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

// 带顶层变量
const source = `const title = "Hello"

div {
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
console.log('📊 包含title的映射:')
result.mapping.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  if (sourceText.includes('title') || generatedText.includes('title')) {
    console.log(`\n[${i}] "${sourceText}" (源码${m.source.index}-${m.source.index + m.source.length})`)
    console.log(`    → "${generatedText}" (生成${m.generate.index}-${m.generate.index + m.generate.length})`)
    console.log(`    匹配: ${sourceText === generatedText || sourceText === `"${generatedText}"` || sourceText === `'${generatedText}'` ? '✅' : '❌'}`)
  }
})

console.log('\n' + '='.repeat(80))
console.log('🔍 title在生成代码中的所有位置:')
let pos = -1
const allIndices = []
while ((pos = result.code.indexOf('title', pos + 1)) >= 0) {
  const context = result.code.substring(Math.max(0, pos - 10), Math.min(result.code.length, pos + 15))
  console.log(`  位置${pos}: "${context}"`)
  allIndices.push(pos)
}

console.log('\n' + '='.repeat(80))
console.log('💡 对比:')
console.log('如果h1 { title }的映射指向了第一个title（变量声明），就说明问题复现了')

