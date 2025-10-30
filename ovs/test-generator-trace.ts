#!/usr/bin/env tsx
/**
 * 🔍 生成器执行跟踪
 * 
 * 在SlimeGenerator中添加日志，追踪title的生成过程
 */

import { readFileSync, writeFileSync } from 'fs'
import SlimeGenerator from '../slime/packages/slime-generator/src/SlimeGenerator.ts'

// 读取SlimeGenerator源码
const generatorPath = '../slime/packages/slime-generator/src/SlimeGenerator.ts'
const original = readFileSync(generatorPath, 'utf-8')

// 在generatorIdentifier方法中添加日志
const patched = original.replace(
  /private static generatorIdentifier\(node: SlimeIdentifier\) \{[\s\S]*?this\.addCodeAndMappings\(identifier, node\.loc\)/,
  `private static generatorIdentifier(node: SlimeIdentifier) {
    const identifier = {name: Es6TokenName.Identifier, value: node.name}
    
    // 调试日志
    if (node.name === 'title') {
      console.log('🔍 生成title Identifier:')
      console.log('  node.name:', node.name)
      console.log('  node.loc:', node.loc)
      console.log('  当前generateIndex:', this.generateIndex)
      console.log('  identifier.value:', identifier.value)
    }
    
    this.addCodeAndMappings(identifier, node.loc`
)

// 在addCodeAndMappings中添加日志
const patched2 = patched.replace(
  /private static addCodeAndMappings\(token: SubhutiCreateToken, cstLocation: SubhutiSourceLocation = null\) \{/,
  `private static addCodeAndMappings(token: SubhutiCreateToken, cstLocation: SubhutiSourceLocation = null) {
    // 调试日志
    if (token.value === 'title') {
      console.log('  📝 addCodeAndMappings被调用:')
      console.log('    token.value:', token.value)
      console.log('    token.name:', token.name)
      console.log('    cstLocation:', cstLocation)
      console.log('    generateIndex:', this.generateIndex)
    }
`
)

// 在addMappings中添加日志
const patched3 = patched2.replace(
  /private static addMappings\(generateToken: SubhutiCreateToken, sourcePosition: SlimeCodeLocation\) \{/,
  `private static addMappings(generateToken: SubhutiCreateToken, sourcePosition: SlimeCodeLocation) {
    // 调试日志
    if (generateToken.value === 'title') {
      console.log('  💾 addMappings记录映射:')
      console.log('    generateToken.value:', generateToken.value)
      console.log('    sourcePosition.index:', sourcePosition.index)
      console.log('    sourcePosition.value:', sourcePosition.value)
      console.log('    generateIndex:', this.generateIndex)
      console.log('    映射将记录为: source=${sourcePosition.index}, generate=${this.generateIndex}')
      console.log('')
    }
`
)

writeFileSync(generatorPath, patched3)
console.log('✅ 已为SlimeGenerator添加调试日志')
console.log('⚠️ 请运行测试后记得恢复原始文件！')
console.log('')
console.log('执行: npx tsx test-mapping-generator-trace.ts')
console.log('完成后执行: git checkout ../slime/packages/slime-generator/src/SlimeGenerator.ts')

