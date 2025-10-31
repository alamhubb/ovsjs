#!/usr/bin/env tsx
/**
 * 🔍 源码映射 BUG 验证工具
 * 
 * 目标：验证 simpleFormatWithMapping 的映射更新问题
 */

import { vitePluginOvsTransform, simpleFormatWithMapping } from './src/index.ts'
import type { SlimeGeneratorResult } from '../slime/packages/slime-generator/src/SlimeCodeMapping.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

/**
 * 验证映射准确性
 */
function verifyMapping(source: string, result: SlimeGeneratorResult, label: string): boolean {
  log('cyan', `\n━━━━ ${label} ━━━━`)
  
  let errorCount = 0
  let successCount = 0
  
  result.mapping.forEach((mapping, index) => {
    if (!mapping.source || !mapping.generate) {
      return
    }
    
    // 提取生成代码中的实际文本
    const actualText = result.code.substring(
      mapping.generate.index,
      mapping.generate.index + mapping.generate.length
    )
    
    const expected = mapping.generate.value
    
    if (actualText === expected) {
      successCount++
    } else {
      errorCount++
      log('red', `❌ 映射 #${index} 不准确：`)
      log('yellow', `  期望: "${expected}"`)
      log('yellow', `  实际: "${actualText}"`)
      log('yellow', `  位置: index=${mapping.generate.index}, length=${mapping.generate.length}`)
      log('yellow', `  源码: "${mapping.source.value}" (index=${mapping.source.index})`)
    }
  })
  
  const total = successCount + errorCount
  const accuracy = total > 0 ? (successCount / total * 100).toFixed(2) : '0'
  
  if (errorCount === 0) {
    log('green', `✅ 所有映射准确！(${successCount}/${total})`)
    return true
  } else {
    log('red', `❌ 发现 ${errorCount} 个映射错误（准确率：${accuracy}%）`)
    return false
  }
}

/**
 * 测试 1：基础编译（无格式化）
 */
function test1() {
  log('blue', '\n========================================')
  log('blue', '测试 1：基础编译（无格式化）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
div { name }`
  
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n生成代码：')
  console.log(result.code)
  
  return verifyMapping(source, result, '基础编译')
}

/**
 * 测试 2：简单格式化（添加换行）
 */
function test2() {
  log('blue', '\n========================================')
  log('blue', '测试 2：简单格式化（添加换行）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
div { name }`
  
  // 先编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n格式化前：')
  console.log(result.code.substring(0, 200) + '...')
  
  // 手动创建需要格式化的代码（模拟多个语句在一行）
  const unformatted = result.code.replace(/\n/g, '')  // 移除所有换行
  log('cyan', '\n移除换行后：')
  console.log(unformatted.substring(0, 200) + '...')
  
  // 简单格式化
  const formatted = simpleFormatWithMapping(unformatted, result.mapping)
  
  log('cyan', '\n格式化后：')
  console.log(formatted.code.substring(0, 200) + '...')
  
  return verifyMapping(source, formatted, '简单格式化')
}

/**
 * 测试 3：多语句格式化
 */
function test3() {
  log('blue', '\n========================================')
  log('blue', '测试 3：多语句格式化（关键测试）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
const age = 25
const city = "Beijing"
div { 
  h1 { name }
  p { age }
  p { city }
}`
  
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n原始生成代码（未格式化）：')
  const lines = result.code.split('\n')
  lines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${line}`))
  console.log('...')
  
  // 创建一个紧凑的版本（模拟需要格式化的场景）
  const compact = result.code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('')
  
  log('cyan', '\n紧凑版本（移除所有空白）：')
  console.log(compact.substring(0, 200) + '...')
  
  log('cyan', '\n📊 格式化前的映射统计：')
  log('yellow', `  映射数量：${result.mapping.length}`)
  const firstMapping = result.mapping.find(m => m.source && m.generate && m.source.value === 'name')
  if (firstMapping) {
    log('yellow', `  "name" 映射：index=${firstMapping.generate.index}`)
  }
  
  // 简单格式化
  const formatted = simpleFormatWithMapping(compact, result.mapping)
  
  log('cyan', '\n格式化后的代码：')
  const formattedLines = formatted.code.split('\n')
  formattedLines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${line}`))
  console.log('...')
  
  log('cyan', '\n📊 格式化后的映射统计：')
  log('yellow', `  映射数量：${formatted.mapping.length}`)
  const firstMappingAfter = formatted.mapping.find(m => m.source && m.generate && m.source.value === 'name')
  if (firstMappingAfter) {
    log('yellow', `  "name" 映射：index=${firstMappingAfter.generate.index}`)
  }
  
  return verifyMapping(source, formatted, '多语句格式化')
}

/**
 * 测试 4：检查 offsetCount 是否被应用
 */
function test4() {
  log('blue', '\n========================================')
  log('blue', '测试 4：检查 offsetCount 计算（BUG 核心）')
  log('blue', '========================================')
  
  const code = 'const a=1;const b=2;const c=3;'
  const mapping = [
    {
      source: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' },
      generate: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' }
    },
    {
      source: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' },
      generate: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' }
    },
    {
      source: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' },
      generate: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' }
    }
  ]
  
  log('cyan', '\n原始代码：')
  console.log(code)
  
  log('cyan', '\n原始映射：')
  mapping.forEach((m, i) => {
    console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
  })
  
  // 格式化
  const formatted = simpleFormatWithMapping(code, mapping as any)
  
  log('cyan', '\n格式化后的代码：')
  formatted.code.split('\n').forEach((line, i) => console.log(`${i + 1}: ${line}`))
  
  log('cyan', '\n格式化后的映射：')
  formatted.mapping.forEach((m, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(m.generate.index, m.generate.index + m.generate.length)
      const match = actual === m.generate.value
      console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index} → actual: "${actual}" ${match ? '✅' : '❌'}`)
    }
  })
  
  // 手动验证
  log('cyan', '\n🔍 手动验证：')
  let allCorrect = true
  formatted.mapping.forEach((m, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(m.generate.index, m.generate.index + m.generate.length)
      if (actual !== m.generate.value) {
        log('red', `  ❌ 映射 #${i} 不准确：期望 "${m.generate.value}"，实际 "${actual}"`)
        allCorrect = false
      }
    }
  })
  
  if (allCorrect) {
    log('green', '  ✅ 所有映射准确！')
  } else {
    log('red', '  ❌ 发现映射错误（这证明了 BUG 的存在）')
  }
  
  return allCorrect
}

/**
 * 主函数
 */
async function main() {
  log('blue', '\n')
  log('blue', '╔════════════════════════════════════════════════════════╗')
  log('blue', '║       源码映射 BUG 验证工具                             ║')
  log('blue', '║  验证目标：simpleFormatWithMapping 的映射更新问题      ║')
  log('blue', '╚════════════════════════════════════════════════════════╝')
  
  const results = {
    test1: test1(),
    test2: test2(),
    test3: test3(),
    test4: test4()
  }
  
  log('blue', '\n========================================')
  log('blue', '测试结果汇总')
  log('blue', '========================================')
  
  const allPassed = Object.values(results).every(r => r)
  
  Object.entries(results).forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌'
    const color = passed ? 'green' : 'red'
    log(color, `${icon} ${name}: ${passed ? '通过' : '失败'}`)
  })
  
  log('blue', '\n========================================')
  
  if (allPassed) {
    log('green', '✅ 所有测试通过！映射系统工作正常。')
  } else {
    log('red', '❌ 部分测试失败！发现映射问题。')
    log('yellow', '\n💡 建议：')
    log('yellow', '1. 检查 ovs/src/index.ts 中的 simpleFormatWithMapping() 函数')
    log('yellow', '2. 确认 newMap.generate.index += offsetCount 这行代码是否存在')
    log('yellow', '3. 查看 SOURCE_MAPPING_ANALYSIS.md 了解详细问题分析')
  }
}

main().catch(console.error)


/**
 * 🔍 源码映射 BUG 验证工具
 * 
 * 目标：验证 simpleFormatWithMapping 的映射更新问题
 */

import { vitePluginOvsTransform, simpleFormatWithMapping } from './src/index.ts'
import type { SlimeGeneratorResult } from '../slime/packages/slime-generator/src/SlimeCodeMapping.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

/**
 * 验证映射准确性
 */
function verifyMapping(source: string, result: SlimeGeneratorResult, label: string): boolean {
  log('cyan', `\n━━━━ ${label} ━━━━`)
  
  let errorCount = 0
  let successCount = 0
  
  result.mapping.forEach((mapping, index) => {
    if (!mapping.source || !mapping.generate) {
      return
    }
    
    // 提取生成代码中的实际文本
    const actualText = result.code.substring(
      mapping.generate.index,
      mapping.generate.index + mapping.generate.length
    )
    
    const expected = mapping.generate.value
    
    if (actualText === expected) {
      successCount++
    } else {
      errorCount++
      log('red', `❌ 映射 #${index} 不准确：`)
      log('yellow', `  期望: "${expected}"`)
      log('yellow', `  实际: "${actualText}"`)
      log('yellow', `  位置: index=${mapping.generate.index}, length=${mapping.generate.length}`)
      log('yellow', `  源码: "${mapping.source.value}" (index=${mapping.source.index})`)
    }
  })
  
  const total = successCount + errorCount
  const accuracy = total > 0 ? (successCount / total * 100).toFixed(2) : '0'
  
  if (errorCount === 0) {
    log('green', `✅ 所有映射准确！(${successCount}/${total})`)
    return true
  } else {
    log('red', `❌ 发现 ${errorCount} 个映射错误（准确率：${accuracy}%）`)
    return false
  }
}

/**
 * 测试 1：基础编译（无格式化）
 */
function test1() {
  log('blue', '\n========================================')
  log('blue', '测试 1：基础编译（无格式化）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
div { name }`
  
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n生成代码：')
  console.log(result.code)
  
  return verifyMapping(source, result, '基础编译')
}

/**
 * 测试 2：简单格式化（添加换行）
 */
function test2() {
  log('blue', '\n========================================')
  log('blue', '测试 2：简单格式化（添加换行）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
div { name }`
  
  // 先编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n格式化前：')
  console.log(result.code.substring(0, 200) + '...')
  
  // 手动创建需要格式化的代码（模拟多个语句在一行）
  const unformatted = result.code.replace(/\n/g, '')  // 移除所有换行
  log('cyan', '\n移除换行后：')
  console.log(unformatted.substring(0, 200) + '...')
  
  // 简单格式化
  const formatted = simpleFormatWithMapping(unformatted, result.mapping)
  
  log('cyan', '\n格式化后：')
  console.log(formatted.code.substring(0, 200) + '...')
  
  return verifyMapping(source, formatted, '简单格式化')
}

/**
 * 测试 3：多语句格式化
 */
function test3() {
  log('blue', '\n========================================')
  log('blue', '测试 3：多语句格式化（关键测试）')
  log('blue', '========================================')
  
  const source = `const name = "Alice"
const age = 25
const city = "Beijing"
div { 
  h1 { name }
  p { age }
  p { city }
}`
  
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n原始生成代码（未格式化）：')
  const lines = result.code.split('\n')
  lines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${line}`))
  console.log('...')
  
  // 创建一个紧凑的版本（模拟需要格式化的场景）
  const compact = result.code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('')
  
  log('cyan', '\n紧凑版本（移除所有空白）：')
  console.log(compact.substring(0, 200) + '...')
  
  log('cyan', '\n📊 格式化前的映射统计：')
  log('yellow', `  映射数量：${result.mapping.length}`)
  const firstMapping = result.mapping.find(m => m.source && m.generate && m.source.value === 'name')
  if (firstMapping) {
    log('yellow', `  "name" 映射：index=${firstMapping.generate.index}`)
  }
  
  // 简单格式化
  const formatted = simpleFormatWithMapping(compact, result.mapping)
  
  log('cyan', '\n格式化后的代码：')
  const formattedLines = formatted.code.split('\n')
  formattedLines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${line}`))
  console.log('...')
  
  log('cyan', '\n📊 格式化后的映射统计：')
  log('yellow', `  映射数量：${formatted.mapping.length}`)
  const firstMappingAfter = formatted.mapping.find(m => m.source && m.generate && m.source.value === 'name')
  if (firstMappingAfter) {
    log('yellow', `  "name" 映射：index=${firstMappingAfter.generate.index}`)
  }
  
  return verifyMapping(source, formatted, '多语句格式化')
}

/**
 * 测试 4：检查 offsetCount 是否被应用
 */
function test4() {
  log('blue', '\n========================================')
  log('blue', '测试 4：检查 offsetCount 计算（BUG 核心）')
  log('blue', '========================================')
  
  const code = 'const a=1;const b=2;const c=3;'
  const mapping = [
    {
      source: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' },
      generate: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' }
    },
    {
      source: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' },
      generate: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' }
    },
    {
      source: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' },
      generate: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' }
    }
  ]
  
  log('cyan', '\n原始代码：')
  console.log(code)
  
  log('cyan', '\n原始映射：')
  mapping.forEach((m, i) => {
    console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
  })
  
  // 格式化
  const formatted = simpleFormatWithMapping(code, mapping as any)
  
  log('cyan', '\n格式化后的代码：')
  formatted.code.split('\n').forEach((line, i) => console.log(`${i + 1}: ${line}`))
  
  log('cyan', '\n格式化后的映射：')
  formatted.mapping.forEach((m, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(m.generate.index, m.generate.index + m.generate.length)
      const match = actual === m.generate.value
      console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index} → actual: "${actual}" ${match ? '✅' : '❌'}`)
    }
  })
  
  // 手动验证
  log('cyan', '\n🔍 手动验证：')
  let allCorrect = true
  formatted.mapping.forEach((m, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(m.generate.index, m.generate.index + m.generate.length)
      if (actual !== m.generate.value) {
        log('red', `  ❌ 映射 #${i} 不准确：期望 "${m.generate.value}"，实际 "${actual}"`)
        allCorrect = false
      }
    }
  })
  
  if (allCorrect) {
    log('green', '  ✅ 所有映射准确！')
  } else {
    log('red', '  ❌ 发现映射错误（这证明了 BUG 的存在）')
  }
  
  return allCorrect
}

/**
 * 主函数
 */
async function main() {
  log('blue', '\n')
  log('blue', '╔════════════════════════════════════════════════════════╗')
  log('blue', '║       源码映射 BUG 验证工具                             ║')
  log('blue', '║  验证目标：simpleFormatWithMapping 的映射更新问题      ║')
  log('blue', '╚════════════════════════════════════════════════════════╝')
  
  const results = {
    test1: test1(),
    test2: test2(),
    test3: test3(),
    test4: test4()
  }
  
  log('blue', '\n========================================')
  log('blue', '测试结果汇总')
  log('blue', '========================================')
  
  const allPassed = Object.values(results).every(r => r)
  
  Object.entries(results).forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌'
    const color = passed ? 'green' : 'red'
    log(color, `${icon} ${name}: ${passed ? '通过' : '失败'}`)
  })
  
  log('blue', '\n========================================')
  
  if (allPassed) {
    log('green', '✅ 所有测试通过！映射系统工作正常。')
  } else {
    log('red', '❌ 部分测试失败！发现映射问题。')
    log('yellow', '\n💡 建议：')
    log('yellow', '1. 检查 ovs/src/index.ts 中的 simpleFormatWithMapping() 函数')
    log('yellow', '2. 确认 newMap.generate.index += offsetCount 这行代码是否存在')
    log('yellow', '3. 查看 SOURCE_MAPPING_ANALYSIS.md 了解详细问题分析')
  }
}

main().catch(console.error)























