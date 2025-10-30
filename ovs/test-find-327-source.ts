#!/usr/bin/env tsx
/**
 * 🔍 定位327位置的来源
 * 
 * 找出生成代码位置327之前的内容，确认generateIndex为什么会停留在327
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'

const source = `div {
  h1 { title }
}`

const result = vitePluginOvsTransform(source)

console.log('📝 生成代码（带位置标记）:')
console.log('')

// 每10个字符输出一次位置标记
for (let i = 0; i < result.code.length; i += 10) {
  const chunk = result.code.substring(i, i + 10)
  console.log(`[${String(i).padStart(3, ' ')}-${String(i + 9).padStart(3, ' ')}] ${chunk}`)
}

console.log('\n' + '='.repeat(80))
console.log('🔍 关键位置分析:')
console.log('')

// 精确显示327附近的内容
const start = 320
const end = 345
console.log(`位置${start}-${end}的内容:`)
for (let i = start; i < end; i++) {
  console.log(`  [${i}] '${result.code[i]}'`)
}

console.log('\n' + '='.repeat(80))
console.log('💡 分析:')
console.log('位置327是{，328是}，329是,，330是[，331是t（title的开始）')
console.log('但映射记录的是generate.index=327')
console.log('说明：当generatorIdentifier(title)被调用时，generateIndex还是327！')
console.log('')
console.log('推测：')
console.log('1. 生成{}时，generateIndex从某个值变成327+2=329')
console.log('2. 生成,时，generateIndex从329变成330')
console.log('3. 生成[时，generateIndex从330变成331')
console.log('4. 开始生成title，调用generatorIdentifier')
console.log('5. generatorIdentifier调用addCodeAndMappings，此时generateIndex应该是331')
console.log('6. 但映射记录的是327，说明generateIndex在某个地方被错误设置或没有正确递增')

