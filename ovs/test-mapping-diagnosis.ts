#!/usr/bin/env tsx
/**
 * 🔍 映射诊断测试 - 深入分析映射问题
 */

import { vitePluginOvsTransform } from './src/index.ts'

const source = `const name = "Alice"
div { name }`

console.log('📄 源码：')
console.log(source)
console.log('')

const result = vitePluginOvsTransform(source)

console.log('📊 映射诊断：')
console.log('总映射数：', result.mapping.length)
console.log('')

// 分类映射
const validMappings = result.mapping.filter(m => 
  m.source && m.source.value && m.source.value !== ''
)

const invalidMappings = result.mapping.filter(m => 
  !m.source || !m.source.value || m.source.value === ''
)

console.log('✅ 有效映射数：', validMappings.length)
console.log('❌ 无效映射数：', invalidMappings.length)
console.log('')

console.log('✅ 有效映射列表：')
validMappings.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  console.log(`  [${i}] 源@${m.source.index}: "${sourceText}" → 生成@${m.generate.index}: "${generatedText}"`)
})

console.log('')
console.log('❌ 无效映射列表（前10个）：')
invalidMappings.slice(0, 10).forEach((m, i) => {
  console.log(`  [${i}] source.index=${m.source?.index}, source.value="${m.source?.value}", generate.value="${m.generate?.value}"`)
})

// 验证有效映射的准确性
console.log('')
console.log('🔍 验证有效映射的准确性：')
let accurateCount = 0
validMappings.forEach(m => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  const match = sourceText === generatedText || 
                generatedText === `'${sourceText}'` || 
                generatedText === `"${sourceText}"`
  
  if (match) accurateCount++
})

console.log(`准确的映射：${accurateCount}/${validMappings.length} (${(accurateCount/validMappings.length*100).toFixed(1)}%)`)

// 关键建议
console.log('')
console.log('💡 诊断结论：')
if (invalidMappings.length > 0) {
  console.log(`  • 发现 ${invalidMappings.length} 个无效映射（source 为空）`)
  console.log(`  • 这些映射应该被过滤掉，不应该传递给 Volar`)
  console.log(`  • 建议在 MappingConverter.convertMappings() 中过滤`)
}
if (accurateCount < validMappings.length) {
  console.log(`  • ${validMappings.length - accurateCount} 个映射文本不完全匹配`)
  console.log(`  • 可能是引号转换导致（"→'）`)
}


/**
 * 🔍 映射诊断测试 - 深入分析映射问题
 */

import { vitePluginOvsTransform } from './src/index.ts'

const source = `const name = "Alice"
div { name }`

console.log('📄 源码：')
console.log(source)
console.log('')

const result = vitePluginOvsTransform(source)

console.log('📊 映射诊断：')
console.log('总映射数：', result.mapping.length)
console.log('')

// 分类映射
const validMappings = result.mapping.filter(m => 
  m.source && m.source.value && m.source.value !== ''
)

const invalidMappings = result.mapping.filter(m => 
  !m.source || !m.source.value || m.source.value === ''
)

console.log('✅ 有效映射数：', validMappings.length)
console.log('❌ 无效映射数：', invalidMappings.length)
console.log('')

console.log('✅ 有效映射列表：')
validMappings.forEach((m, i) => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  console.log(`  [${i}] 源@${m.source.index}: "${sourceText}" → 生成@${m.generate.index}: "${generatedText}"`)
})

console.log('')
console.log('❌ 无效映射列表（前10个）：')
invalidMappings.slice(0, 10).forEach((m, i) => {
  console.log(`  [${i}] source.index=${m.source?.index}, source.value="${m.source?.value}", generate.value="${m.generate?.value}"`)
})

// 验证有效映射的准确性
console.log('')
console.log('🔍 验证有效映射的准确性：')
let accurateCount = 0
validMappings.forEach(m => {
  const sourceText = source.substring(m.source.index, m.source.index + m.source.length)
  const generatedText = result.code.substring(m.generate.index, m.generate.index + m.generate.length)
  
  const match = sourceText === generatedText || 
                generatedText === `'${sourceText}'` || 
                generatedText === `"${sourceText}"`
  
  if (match) accurateCount++
})

console.log(`准确的映射：${accurateCount}/${validMappings.length} (${(accurateCount/validMappings.length*100).toFixed(1)}%)`)

// 关键建议
console.log('')
console.log('💡 诊断结论：')
if (invalidMappings.length > 0) {
  console.log(`  • 发现 ${invalidMappings.length} 个无效映射（source 为空）`)
  console.log(`  • 这些映射应该被过滤掉，不应该传递给 Volar`)
  console.log(`  • 建议在 MappingConverter.convertMappings() 中过滤`)
}
if (accurateCount < validMappings.length) {
  console.log(`  • ${validMappings.length - accurateCount} 个映射文本不完全匹配`)
  console.log(`  • 可能是引号转换导致（"→'）`)
}





















