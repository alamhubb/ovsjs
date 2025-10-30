#!/usr/bin/env tsx
/**
 * 🔍 映射问题复现测试
 * 
 * 目标：复现发现的映射问题
 */

import { vitePluginOvsTransform, simpleFormatWithMapping } from './src/index.ts'
import { MappingConverter } from '../langServer/src/OvsLanguagePlugin.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 1：映射排序问题（嵌套结构）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test1_MappingSortingIssue() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 1：映射排序问题（嵌套结构导致乱序）')
  log('blue', '='.repeat(70))
  
  const source = `div {
  span {
    name
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  // 编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n📄 生成代码（前 300 字符）：')
  console.log(result.code.substring(0, 300) + '...')
  
  // 转换为 Volar 格式
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  log('cyan', '\n📊 映射信息：')
  console.log('映射数量:', offsets.length)
  
  // 显示每个映射
  log('yellow', '\n映射详情（按生成顺序）：')
  offsets.forEach((offset, i) => {
    console.log(`  [${i}] 源码 "${offset.original.offset}" → 生成 "${offset.generated.offset}"`)
  })
  
  // 🔍 检查源码 offset 是否排序
  log('magenta', '\n🔍 检查源码 offset 排序：')
  const sourceOffsets = offsets.map(o => o.original.offset)
  console.log('sourceOffsets:', sourceOffsets)
  
  const sourceSorted = sourceOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  log(sourceSorted ? 'green' : 'red', 
    sourceSorted ? '✅ 源码映射已排序' : '❌ 源码映射未排序'
  )
  
  // 🔍 检查生成代码 offset 是否排序
  log('magenta', '\n🔍 检查生成代码 offset 排序：')
  const generatedOffsets = offsets.map(o => o.generated.offset)
  console.log('generatedOffsets:', generatedOffsets)
  
  const generatedSorted = generatedOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  log(generatedSorted ? 'green' : 'red', 
    generatedSorted ? '✅ 生成代码映射已排序' : '❌ 生成代码映射未排序（问题！）'
  )
  
  // 🔍 显示问题场景
  if (!generatedSorted) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '嵌套结构导致生成代码的映射顺序混乱')
    log('yellow', '如果 Volar 使用二分查找，将无法正确定位！')
    
    log('cyan', '\n💡 问题原因：')
    log('yellow', '生成顺序：内层先生成（name），外层后生成（div）')
    log('yellow', '但映射按 AST 遍历顺序添加（div, span, name）')
    log('yellow', '导致 generatedOffsets 不是升序排列')
  }
  
  return !generatedSorted // 返回是否有问题
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 2：格式化映射更新问题
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test2_FormattingMappingIssue() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 2：格式化映射更新问题')
  log('blue', '='.repeat(70))
  
  const source = `const a = 1
const b = 2
const c = 3`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  // 编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n📄 生成代码（编译后）：')
  console.log(result.code.substring(0, 200))
  
  // 创建一个紧凑版本（模拟需要格式化的场景）
  const compact = 'const a=1;const b=2;const c=3;'
  
  log('cyan', '\n📄 紧凑代码（待格式化）：')
  console.log(compact)
  
  // 创建测试映射
  const testMapping = [
    {
      source: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' },
      generate: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' }
    },
    {
      source: { index: 16, value: 'b', length: 1, line: 1, column: 6, type: 'Identifier' },
      generate: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' }
    },
    {
      source: { index: 26, value: 'c', length: 1, line: 2, column: 6, type: 'Identifier' },
      generate: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' }
    }
  ]
  
  log('cyan', '\n📊 格式化前的映射：')
  testMapping.forEach((m, i) => {
    console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
  })
  
  // 格式化
  const formatted = simpleFormatWithMapping(compact, testMapping as any)
  
  log('cyan', '\n📄 格式化后的代码：')
  formatted.code.split('\n').forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`)
  })
  
  log('cyan', '\n📊 格式化后的映射：')
  formatted.mapping.forEach((m: any, i) => {
    if (m.generate) {
      console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
    }
  })
  
  // 🔍 验证映射准确性
  log('magenta', '\n🔍 验证映射准确性：')
  let hasError = false
  
  formatted.mapping.forEach((m: any, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(
        m.generate.index,
        m.generate.index + m.generate.length
      )
      const expected = m.generate.value
      const match = actual === expected
      
      console.log(`  [${i}] 期望: "${expected}", 实际: "${actual}" ${match ? '✅' : '❌'}`)
      
      if (!match) {
        hasError = true
        log('red', `      ⚠️ 位置 ${m.generate.index} 映射不准确！`)
      }
    }
  })
  
  if (hasError) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '格式化后插入了换行符，但映射的 generate.index 没有更新')
    log('yellow', '导致所有映射位置都不准确')
    
    log('cyan', '\n💡 问题原因：')
    log('yellow', 'simpleFormatWithMapping() 中计算了 offsetCount')
    log('yellow', '但缺少关键代码：newMap.generate.index += offsetCount')
  }
  
  return hasError
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 3：模拟 Volar 查找映射
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test3_VolarMappingLookup() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 3：模拟 Volar 查找映射（二分查找 vs 线性查找）')
  log('blue', '='.repeat(70))
  
  const source = `div {
  span {
    name
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  const result = vitePluginOvsTransform(source)
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  // 创建 Volar 格式的映射
  const volarMapping = {
    sourceOffsets: offsets.map(o => o.original.offset),
    generatedOffsets: offsets.map(o => o.generated.offset),
    lengths: offsets.map(o => o.original.length),
    generatedLengths: offsets.map(o => o.generated.length)
  }
  
  log('cyan', '\n📊 Volar 映射数组：')
  console.log('sourceOffsets:    ', volarMapping.sourceOffsets)
  console.log('generatedOffsets: ', volarMapping.generatedOffsets)
  
  // 模拟查找最内层的 name（假设在生成代码 index=80）
  const targetIndex = volarMapping.generatedOffsets[volarMapping.generatedOffsets.length - 1]
  
  log('cyan', `\n🎯 测试场景：用户点击生成代码 index=${targetIndex}（name）`)
  
  // 1. 线性查找（始终正确）
  log('magenta', '\n📍 方法 1：线性查找')
  let linearResult = -1
  for (let i = 0; i < volarMapping.generatedOffsets.length; i++) {
    const start = volarMapping.generatedOffsets[i]
    const end = start + volarMapping.generatedLengths[i]
    if (targetIndex >= start && targetIndex < end) {
      linearResult = volarMapping.sourceOffsets[i]
      log('green', `✅ 找到映射：生成代码 ${targetIndex} → 源码 ${linearResult}`)
      break
    }
  }
  
  // 2. 二分查找（要求数组排序）
  log('magenta', '\n📍 方法 2：二分查找（Volar 可能使用）')
  
  function binarySearch(arr: number[], target: number): number {
    let left = 0
    let right = arr.length - 1
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (arr[mid] === target) {
        return mid
      } else if (arr[mid] < target) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return -1
  }
  
  const binaryIdx = binarySearch(volarMapping.generatedOffsets, targetIndex)
  
  if (binaryIdx === -1) {
    log('red', '❌ 二分查找失败：找不到映射！')
    log('yellow', '原因：generatedOffsets 不是升序排列')
    log('yellow', `数组: ${volarMapping.generatedOffsets}`)
    log('yellow', `目标: ${targetIndex}`)
  } else {
    const binaryResult = volarMapping.sourceOffsets[binaryIdx]
    log('green', `✅ 找到映射：生成代码 ${targetIndex} → 源码 ${binaryResult}`)
  }
  
  // 对比结果
  log('magenta', '\n📊 结果对比：')
  console.log(`线性查找结果: ${linearResult}`)
  console.log(`二分查找结果: ${binaryIdx === -1 ? '失败' : volarMapping.sourceOffsets[binaryIdx]}`)
  
  const hasIssue = binaryIdx === -1
  
  if (hasIssue) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '如果 Volar 使用二分查找，将无法找到映射！')
    log('yellow', '这会导致所有 LSP 功能失效（补全、跳转、诊断）')
  }
  
  return hasIssue
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 4：真实嵌套场景的完整测试
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test4_RealWorldNestedCase() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 4：真实嵌套场景')
  log('blue', '='.repeat(70))
  
  const source = `const userName = "Alice"
const userAge = 25

div {
  h1 { userName }
  p { "Age: " }
  p { userAge }
  
  div {
    span { userName }
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  source.split('\n').forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`)
  })
  
  const result = vitePluginOvsTransform(source)
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  log('cyan', '\n📊 映射统计：')
  console.log('映射数量:', offsets.length)
  
  // 按源码位置排序
  const sortedBySource = [...offsets].sort((a, b) => a.original.offset - b.original.offset)
  
  log('yellow', '\n映射列表（按源码位置排序）：')
  sortedBySource.forEach((offset, i) => {
    // 从源码中提取实际文本
    const sourceText = source.substring(
      offset.original.offset,
      offset.original.offset + offset.original.length
    )
    
    // 从生成代码中提取实际文本
    const generatedText = result.code.substring(
      offset.generated.offset,
      offset.generated.offset + offset.generated.length
    )
    
    const match = sourceText === generatedText || generatedText === `'${sourceText}'` || generatedText === `"${sourceText}"`
    
    console.log(`  [${i}] 源码@${offset.original.offset}: "${sourceText}" → 生成@${offset.generated.offset}: "${generatedText}" ${match ? '✅' : '❌'}`)
  })
  
  // 检查问题
  log('magenta', '\n🔍 问题检查：')
  
  const generatedOffsets = offsets.map(o => o.generated.offset)
  const generatedSorted = generatedOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  
  console.log('1. generatedOffsets 排序:', generatedSorted ? '✅' : '❌')
  console.log('   实际顺序:', generatedOffsets.slice(0, 10))
  
  // 验证映射准确性
  let mappingAccurate = true
  sortedBySource.forEach((offset) => {
    const sourceText = source.substring(
      offset.original.offset,
      offset.original.offset + offset.original.length
    )
    const generatedText = result.code.substring(
      offset.generated.offset,
      offset.generated.offset + offset.generated.length
    )
    
    const valid = sourceText === generatedText || 
                  generatedText === `'${sourceText}'` || 
                  generatedText === `"${sourceText}"`
    
    if (!valid) {
      mappingAccurate = false
    }
  })
  
  console.log('2. 映射准确性:', mappingAccurate ? '✅' : '❌')
  
  return !generatedSorted || !mappingAccurate
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 主函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  log('blue', '\n')
  log('blue', '╔════════════════════════════════════════════════════════════════╗')
  log('blue', '║           映射问题复现测试套件                                   ║')
  log('blue', '║  复现发现的映射问题，验证问题的存在                               ║')
  log('blue', '╚════════════════════════════════════════════════════════════════╝')
  
  const results = {
    test1: test1_MappingSortingIssue(),
    test2: test2_FormattingMappingIssue(),
    test3: test3_VolarMappingLookup(),
    test4: test4_RealWorldNestedCase()
  }
  
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试结果汇总')
  log('blue', '='.repeat(70))
  
  const issues = Object.entries(results).filter(([_, hasIssue]) => hasIssue)
  
  Object.entries(results).forEach(([name, hasIssue]) => {
    const icon = hasIssue ? '❌' : '✅'
    const color = hasIssue ? 'red' : 'green'
    const status = hasIssue ? '发现问题' : '正常'
    log(color, `${icon} ${name}: ${status}`)
  })
  
  log('blue', '\n' + '='.repeat(70))
  
  if (issues.length > 0) {
    log('red', '\n🔴 测试结果：发现 ' + issues.length + ' 个问题')
    
    log('yellow', '\n📋 问题列表：')
    issues.forEach(([name]) => {
      if (name === 'test1') {
        log('yellow', '  • 映射排序问题：嵌套结构导致 generatedOffsets 乱序')
      } else if (name === 'test2') {
        log('yellow', '  • 格式化映射更新问题：offsetCount 计算了但没应用')
      } else if (name === 'test3') {
        log('yellow', '  • Volar 二分查找失败：乱序数组导致查找失败')
      } else if (name === 'test4') {
        log('yellow', '  • 真实场景验证：映射存在问题')
      }
    })
    
    log('yellow', '\n💡 建议修复：')
    log('yellow', '  1. 添加映射排序（OvsLanguagePlugin.ts）')
    log('yellow', '  2. 修复格式化映射更新（ovs/src/index.ts）')
    log('yellow', '  3. 添加映射验证机制')
  } else {
    log('green', '\n✅ 所有测试通过！映射系统工作正常。')
  }
  
  log('blue', '\n' + '='.repeat(70))
  log('cyan', '\n📚 详细分析文档：')
  log('cyan', '  • langServer/MAPPING_ACCURACY_ISSUES.md')
  log('cyan', '  • langServer/CORE_MAPPING_MECHANISM.md')
  log('cyan', '\n')
}

main()


/**
 * 🔍 映射问题复现测试
 * 
 * 目标：复现发现的映射问题
 */

import { vitePluginOvsTransform, simpleFormatWithMapping } from './src/index.ts'
import { MappingConverter } from '../langServer/src/OvsLanguagePlugin.ts'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 1：映射排序问题（嵌套结构）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test1_MappingSortingIssue() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 1：映射排序问题（嵌套结构导致乱序）')
  log('blue', '='.repeat(70))
  
  const source = `div {
  span {
    name
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  // 编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n📄 生成代码（前 300 字符）：')
  console.log(result.code.substring(0, 300) + '...')
  
  // 转换为 Volar 格式
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  log('cyan', '\n📊 映射信息：')
  console.log('映射数量:', offsets.length)
  
  // 显示每个映射
  log('yellow', '\n映射详情（按生成顺序）：')
  offsets.forEach((offset, i) => {
    console.log(`  [${i}] 源码 "${offset.original.offset}" → 生成 "${offset.generated.offset}"`)
  })
  
  // 🔍 检查源码 offset 是否排序
  log('magenta', '\n🔍 检查源码 offset 排序：')
  const sourceOffsets = offsets.map(o => o.original.offset)
  console.log('sourceOffsets:', sourceOffsets)
  
  const sourceSorted = sourceOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  log(sourceSorted ? 'green' : 'red', 
    sourceSorted ? '✅ 源码映射已排序' : '❌ 源码映射未排序'
  )
  
  // 🔍 检查生成代码 offset 是否排序
  log('magenta', '\n🔍 检查生成代码 offset 排序：')
  const generatedOffsets = offsets.map(o => o.generated.offset)
  console.log('generatedOffsets:', generatedOffsets)
  
  const generatedSorted = generatedOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  log(generatedSorted ? 'green' : 'red', 
    generatedSorted ? '✅ 生成代码映射已排序' : '❌ 生成代码映射未排序（问题！）'
  )
  
  // 🔍 显示问题场景
  if (!generatedSorted) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '嵌套结构导致生成代码的映射顺序混乱')
    log('yellow', '如果 Volar 使用二分查找，将无法正确定位！')
    
    log('cyan', '\n💡 问题原因：')
    log('yellow', '生成顺序：内层先生成（name），外层后生成（div）')
    log('yellow', '但映射按 AST 遍历顺序添加（div, span, name）')
    log('yellow', '导致 generatedOffsets 不是升序排列')
  }
  
  return !generatedSorted // 返回是否有问题
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 2：格式化映射更新问题
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test2_FormattingMappingIssue() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 2：格式化映射更新问题')
  log('blue', '='.repeat(70))
  
  const source = `const a = 1
const b = 2
const c = 3`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  // 编译
  const result = vitePluginOvsTransform(source)
  
  log('cyan', '\n📄 生成代码（编译后）：')
  console.log(result.code.substring(0, 200))
  
  // 创建一个紧凑版本（模拟需要格式化的场景）
  const compact = 'const a=1;const b=2;const c=3;'
  
  log('cyan', '\n📄 紧凑代码（待格式化）：')
  console.log(compact)
  
  // 创建测试映射
  const testMapping = [
    {
      source: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' },
      generate: { index: 6, value: 'a', length: 1, line: 0, column: 6, type: 'Identifier' }
    },
    {
      source: { index: 16, value: 'b', length: 1, line: 1, column: 6, type: 'Identifier' },
      generate: { index: 16, value: 'b', length: 1, line: 0, column: 16, type: 'Identifier' }
    },
    {
      source: { index: 26, value: 'c', length: 1, line: 2, column: 6, type: 'Identifier' },
      generate: { index: 26, value: 'c', length: 1, line: 0, column: 26, type: 'Identifier' }
    }
  ]
  
  log('cyan', '\n📊 格式化前的映射：')
  testMapping.forEach((m, i) => {
    console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
  })
  
  // 格式化
  const formatted = simpleFormatWithMapping(compact, testMapping as any)
  
  log('cyan', '\n📄 格式化后的代码：')
  formatted.code.split('\n').forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`)
  })
  
  log('cyan', '\n📊 格式化后的映射：')
  formatted.mapping.forEach((m: any, i) => {
    if (m.generate) {
      console.log(`  [${i}] "${m.generate.value}" at index ${m.generate.index}`)
    }
  })
  
  // 🔍 验证映射准确性
  log('magenta', '\n🔍 验证映射准确性：')
  let hasError = false
  
  formatted.mapping.forEach((m: any, i) => {
    if (m.generate) {
      const actual = formatted.code.substring(
        m.generate.index,
        m.generate.index + m.generate.length
      )
      const expected = m.generate.value
      const match = actual === expected
      
      console.log(`  [${i}] 期望: "${expected}", 实际: "${actual}" ${match ? '✅' : '❌'}`)
      
      if (!match) {
        hasError = true
        log('red', `      ⚠️ 位置 ${m.generate.index} 映射不准确！`)
      }
    }
  })
  
  if (hasError) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '格式化后插入了换行符，但映射的 generate.index 没有更新')
    log('yellow', '导致所有映射位置都不准确')
    
    log('cyan', '\n💡 问题原因：')
    log('yellow', 'simpleFormatWithMapping() 中计算了 offsetCount')
    log('yellow', '但缺少关键代码：newMap.generate.index += offsetCount')
  }
  
  return hasError
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 3：模拟 Volar 查找映射
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test3_VolarMappingLookup() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 3：模拟 Volar 查找映射（二分查找 vs 线性查找）')
  log('blue', '='.repeat(70))
  
  const source = `div {
  span {
    name
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  console.log(source)
  
  const result = vitePluginOvsTransform(source)
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  // 创建 Volar 格式的映射
  const volarMapping = {
    sourceOffsets: offsets.map(o => o.original.offset),
    generatedOffsets: offsets.map(o => o.generated.offset),
    lengths: offsets.map(o => o.original.length),
    generatedLengths: offsets.map(o => o.generated.length)
  }
  
  log('cyan', '\n📊 Volar 映射数组：')
  console.log('sourceOffsets:    ', volarMapping.sourceOffsets)
  console.log('generatedOffsets: ', volarMapping.generatedOffsets)
  
  // 模拟查找最内层的 name（假设在生成代码 index=80）
  const targetIndex = volarMapping.generatedOffsets[volarMapping.generatedOffsets.length - 1]
  
  log('cyan', `\n🎯 测试场景：用户点击生成代码 index=${targetIndex}（name）`)
  
  // 1. 线性查找（始终正确）
  log('magenta', '\n📍 方法 1：线性查找')
  let linearResult = -1
  for (let i = 0; i < volarMapping.generatedOffsets.length; i++) {
    const start = volarMapping.generatedOffsets[i]
    const end = start + volarMapping.generatedLengths[i]
    if (targetIndex >= start && targetIndex < end) {
      linearResult = volarMapping.sourceOffsets[i]
      log('green', `✅ 找到映射：生成代码 ${targetIndex} → 源码 ${linearResult}`)
      break
    }
  }
  
  // 2. 二分查找（要求数组排序）
  log('magenta', '\n📍 方法 2：二分查找（Volar 可能使用）')
  
  function binarySearch(arr: number[], target: number): number {
    let left = 0
    let right = arr.length - 1
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (arr[mid] === target) {
        return mid
      } else if (arr[mid] < target) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return -1
  }
  
  const binaryIdx = binarySearch(volarMapping.generatedOffsets, targetIndex)
  
  if (binaryIdx === -1) {
    log('red', '❌ 二分查找失败：找不到映射！')
    log('yellow', '原因：generatedOffsets 不是升序排列')
    log('yellow', `数组: ${volarMapping.generatedOffsets}`)
    log('yellow', `目标: ${targetIndex}`)
  } else {
    const binaryResult = volarMapping.sourceOffsets[binaryIdx]
    log('green', `✅ 找到映射：生成代码 ${targetIndex} → 源码 ${binaryResult}`)
  }
  
  // 对比结果
  log('magenta', '\n📊 结果对比：')
  console.log(`线性查找结果: ${linearResult}`)
  console.log(`二分查找结果: ${binaryIdx === -1 ? '失败' : volarMapping.sourceOffsets[binaryIdx]}`)
  
  const hasIssue = binaryIdx === -1
  
  if (hasIssue) {
    log('red', '\n⚠️ 发现问题：')
    log('yellow', '如果 Volar 使用二分查找，将无法找到映射！')
    log('yellow', '这会导致所有 LSP 功能失效（补全、跳转、诊断）')
  }
  
  return hasIssue
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 测试 4：真实嵌套场景的完整测试
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function test4_RealWorldNestedCase() {
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试 4：真实嵌套场景')
  log('blue', '='.repeat(70))
  
  const source = `const userName = "Alice"
const userAge = 25

div {
  h1 { userName }
  p { "Age: " }
  p { userAge }
  
  div {
    span { userName }
  }
}`
  
  log('cyan', '\n📄 OVS 源码：')
  source.split('\n').forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`)
  })
  
  const result = vitePluginOvsTransform(source)
  const offsets = MappingConverter.convertMappings(result.mapping)
  
  log('cyan', '\n📊 映射统计：')
  console.log('映射数量:', offsets.length)
  
  // 按源码位置排序
  const sortedBySource = [...offsets].sort((a, b) => a.original.offset - b.original.offset)
  
  log('yellow', '\n映射列表（按源码位置排序）：')
  sortedBySource.forEach((offset, i) => {
    // 从源码中提取实际文本
    const sourceText = source.substring(
      offset.original.offset,
      offset.original.offset + offset.original.length
    )
    
    // 从生成代码中提取实际文本
    const generatedText = result.code.substring(
      offset.generated.offset,
      offset.generated.offset + offset.generated.length
    )
    
    const match = sourceText === generatedText || generatedText === `'${sourceText}'` || generatedText === `"${sourceText}"`
    
    console.log(`  [${i}] 源码@${offset.original.offset}: "${sourceText}" → 生成@${offset.generated.offset}: "${generatedText}" ${match ? '✅' : '❌'}`)
  })
  
  // 检查问题
  log('magenta', '\n🔍 问题检查：')
  
  const generatedOffsets = offsets.map(o => o.generated.offset)
  const generatedSorted = generatedOffsets.every((val, i, arr) => 
    i === 0 || arr[i - 1] <= val
  )
  
  console.log('1. generatedOffsets 排序:', generatedSorted ? '✅' : '❌')
  console.log('   实际顺序:', generatedOffsets.slice(0, 10))
  
  // 验证映射准确性
  let mappingAccurate = true
  sortedBySource.forEach((offset) => {
    const sourceText = source.substring(
      offset.original.offset,
      offset.original.offset + offset.original.length
    )
    const generatedText = result.code.substring(
      offset.generated.offset,
      offset.generated.offset + offset.generated.length
    )
    
    const valid = sourceText === generatedText || 
                  generatedText === `'${sourceText}'` || 
                  generatedText === `"${sourceText}"`
    
    if (!valid) {
      mappingAccurate = false
    }
  })
  
  console.log('2. 映射准确性:', mappingAccurate ? '✅' : '❌')
  
  return !generatedSorted || !mappingAccurate
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 主函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  log('blue', '\n')
  log('blue', '╔════════════════════════════════════════════════════════════════╗')
  log('blue', '║           映射问题复现测试套件                                   ║')
  log('blue', '║  复现发现的映射问题，验证问题的存在                               ║')
  log('blue', '╚════════════════════════════════════════════════════════════════╝')
  
  const results = {
    test1: test1_MappingSortingIssue(),
    test2: test2_FormattingMappingIssue(),
    test3: test3_VolarMappingLookup(),
    test4: test4_RealWorldNestedCase()
  }
  
  log('blue', '\n' + '='.repeat(70))
  log('blue', '测试结果汇总')
  log('blue', '='.repeat(70))
  
  const issues = Object.entries(results).filter(([_, hasIssue]) => hasIssue)
  
  Object.entries(results).forEach(([name, hasIssue]) => {
    const icon = hasIssue ? '❌' : '✅'
    const color = hasIssue ? 'red' : 'green'
    const status = hasIssue ? '发现问题' : '正常'
    log(color, `${icon} ${name}: ${status}`)
  })
  
  log('blue', '\n' + '='.repeat(70))
  
  if (issues.length > 0) {
    log('red', '\n🔴 测试结果：发现 ' + issues.length + ' 个问题')
    
    log('yellow', '\n📋 问题列表：')
    issues.forEach(([name]) => {
      if (name === 'test1') {
        log('yellow', '  • 映射排序问题：嵌套结构导致 generatedOffsets 乱序')
      } else if (name === 'test2') {
        log('yellow', '  • 格式化映射更新问题：offsetCount 计算了但没应用')
      } else if (name === 'test3') {
        log('yellow', '  • Volar 二分查找失败：乱序数组导致查找失败')
      } else if (name === 'test4') {
        log('yellow', '  • 真实场景验证：映射存在问题')
      }
    })
    
    log('yellow', '\n💡 建议修复：')
    log('yellow', '  1. 添加映射排序（OvsLanguagePlugin.ts）')
    log('yellow', '  2. 修复格式化映射更新（ovs/src/index.ts）')
    log('yellow', '  3. 添加映射验证机制')
  } else {
    log('green', '\n✅ 所有测试通过！映射系统工作正常。')
  }
  
  log('blue', '\n' + '='.repeat(70))
  log('cyan', '\n📚 详细分析文档：')
  log('cyan', '  • langServer/MAPPING_ACCURACY_ISSUES.md')
  log('cyan', '  • langServer/CORE_MAPPING_MECHANISM.md')
  log('cyan', '\n')
}

main()



















