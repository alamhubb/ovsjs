#!/usr/bin/env tsx
/**
 * 🎯 Source Map 映射测试工具
 * 
 * 功能：
 * - 测试源码到编译代码的位置映射是否正确
 * - 不需要启动 language server
 * - 像单元测试一样简单快速
 */

import { vitePluginOvsTransform } from './src/index.ts'
import type { SlimeGeneratorResult } from '../slime/packages/slime-generator/src/SlimeCodeMapping.ts'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset)
}

/**
 * 可视化显示映射关系
 */
function visualizeMapping(sourceCode: string, result: SlimeGeneratorResult) {
  const sourceLines = sourceCode.split('\n')
  const generatedLines = result.code.split('\n')

  log('cyan', '\n📄 源代码：')
  log('gray', '─'.repeat(80))
  sourceLines.forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3, ' ')} │ ${line}`)
  })

  log('cyan', '\n⚙️  编译后的代码：')
  log('gray', '─'.repeat(80))
  generatedLines.forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3, ' ')} │ ${line}`)
  })

  log('cyan', '\n🔗 映射关系（仅显示源码映射）：')
  log('gray', '─'.repeat(80))

  if (!result.mapping || result.mapping.length === 0) {
    log('red', '❌ 没有生成任何映射信息！')
    return
  }

  let displayCount = 0
  result.mapping.forEach((mapping, index) => {
    const source = mapping.source
    const generated = mapping.generate

    if (!source || !generated) {
      return  // 跳过不完整的映射
    }

    // 跳过自动生成的代码（null 值或空字符串）
    if (!source.value || source.value === 'null' || source.value === 'undefined') {
      return
    }

    // 从源码中提取实际文本
    const sourceText = sourceLines[source.line]?.substring(
      source.column,
      source.column + source.length
    ) || ''

    // 从生成代码中提取实际文本
    const generatedText = generatedLines[generated.line]?.substring(
      generated.column,
      generated.column + generated.length
    ) || ''

    const isValueMatch = source.value === generated.value
    const isSourceTextMatch = sourceText === source.value
    const isGeneratedTextMatch = generatedText === generated.value
    const allMatch = isValueMatch && isSourceTextMatch && isGeneratedTextMatch

    console.log(`\n[${displayCount}] ${allMatch ? '✅' : '❌'} "${source.value}"`)
    console.log(`  源码:    L${source.line + 1}:${source.column} (len=${source.length}, idx=${source.index})`)
    console.log(`  生成:    L${generated.line + 1}:${generated.column} (len=${generated.length}, idx=${generated.index})`)
    
    // 验证文本是否匹配
    if (!isSourceTextMatch) {
      log('red', `  ❌ 源码文本不匹配: 期望 "${source.value}", 实际 "${sourceText}"`)
    }
    if (!isGeneratedTextMatch) {
      log('red', `  ❌ 生成文本不匹配: 期望 "${generated.value}", 实际 "${generatedText}"`)
    }

    displayCount++
  })

  if (displayCount === 0) {
    log('yellow', '\n⚠️  所有映射都是自动生成的代码，没有源码映射')
  }
}

/**
 * 验证映射正确性
 */
function validateMapping(sourceCode: string, result: SlimeGeneratorResult): boolean {
  const sourceLines = sourceCode.split('\n')
  const generatedLines = result.code.split('\n')
  let hasError = false
  let validMappings = 0
  let skippedMappings = 0

  log('cyan', '\n🔍 验证映射正确性：')
  log('gray', '─'.repeat(80))

  if (!result.mapping || result.mapping.length === 0) {
    log('red', '❌ 没有生成任何映射')
    return false
  }

  result.mapping.forEach((mapping, index) => {
    const source = mapping.source
    const generated = mapping.generate

    if (!source || !generated) {
      log('yellow', `[${index}] ⚠️  映射不完整 (跳过)`)
      skippedMappings++
      return
    }

    // 跳过自动生成的代码（null 值或空字符串）
    if (!source.value || source.value === 'null' || source.value === 'undefined') {
      skippedMappings++
      return
    }

    // 检查行号是否越界
    if (source.line >= sourceLines.length) {
      log('red', `[${index}] ❌ 源码行号越界: L${source.line} (总行数: ${sourceLines.length})`)
      hasError = true
      return
    }

    if (generated.line >= generatedLines.length) {
      log('red', `[${index}] ❌ 生成代码行号越界: L${generated.line} (总行数: ${generatedLines.length})`)
      hasError = true
      return
    }

    // 提取实际文本
    const sourceLine = sourceLines[source.line] || ''
    const generatedLine = generatedLines[generated.line] || ''

    const sourceText = sourceLine.substring(source.column, source.column + source.length)
    const generatedText = generatedLine.substring(generated.column, generated.column + generated.length)

    // 检查值是否匹配
    if (sourceText !== source.value) {
      log('red', `[${index}] ❌ 源码值不匹配:`)
      log('red', `    期望: "${source.value}"`)
      log('red', `    实际: "${sourceText}"`)
      log('red', `    位置: L${source.line + 1}:${source.column}, len=${source.length}`)
      log('red', `    行内容: ${sourceLine}`)
      hasError = true
      return
    }

    if (generatedText !== generated.value) {
      log('red', `[${index}] ❌ 生成代码值不匹配:`)
      log('red', `    期望: "${generated.value}"`)
      log('red', `    实际: "${generatedText}"`)
      log('red', `    位置: L${generated.line + 1}:${generated.column}, len=${generated.length}`)
      log('red', `    行内容: ${generatedLine}`)
      hasError = true
      return
    }

    // 检查长度
    if (source.value && source.length !== source.value.length) {
      log('yellow', `[${index}] ⚠️  源码长度不一致: value.length=${source.value.length}, length=${source.length}`)
    }

    if (generated.value && generated.length !== generated.value.length) {
      log('yellow', `[${index}] ⚠️  生成代码长度不一致: value.length=${generated.value.length}, length=${generated.length}`)
    }

    validMappings++
  })

  log('blue', `\n📊 映射统计: 有效=${validMappings}, 跳过=${skippedMappings}, 总计=${result.mapping.length}`)

  if (!hasError) {
    log('green', '✅ 所有有效映射验证通过！')
  } else {
    log('red', '❌ 发现映射错误！')
  }

  return !hasError
}

/**
 * 测试用例
 */
interface TestCase {
  name: string
  code: string
}

const testCases: TestCase[] = [
  {
    name: '简单变量声明',
    code: `import { h, ref, computed } from 'vue'

const count = ref(0)

setInterval(() => {
  count.value++
  console.log('计数器：', count.value)
}, 1000)`
  },
  {
    name: '单个 const',
    code: `const count = ref(0)`
  },
  {
    name: 'let 声明',
    code: `let x = 100`
  },
  {
    name: '多个变量',
    code: `const a = 1
let b = 2
var c = 3`
  },
  {
    name: '函数声明',
    code: `function myFunc() {
  return 42
}`
  },
  {
    name: 'setInterval',
    code: `setInterval(() => {
  count.value++
}, 1000)`
  },
]

/**
 * 运行单个测试
 */
function runTest(testCase: TestCase) {
  log('yellow', `\n${'═'.repeat(80)}`)
  log('yellow', `🧪 测试: ${testCase.name}`)
  log('yellow', '═'.repeat(80))

  try {
    // 编译代码
    const result = vitePluginOvsTransform(testCase.code, false)

    // 显示映射
    visualizeMapping(testCase.code, result)

    // 验证映射
    const isValid = validateMapping(testCase.code, result)

    return isValid
  } catch (error) {
    log('red', `\n❌ 测试失败: ${error.message}`)
    console.error(error.stack)
    return false
  }
}

/**
 * 主函数
 */
function main() {
  log('cyan', '\n' + '═'.repeat(80))
  log('cyan', '🎯 OVS Source Map 映射测试')
  log('cyan', '═'.repeat(80))

  let passedTests = 0
  let failedTests = 0

  testCases.forEach((testCase) => {
    const passed = runTest(testCase)
    if (passed) {
      passedTests++
    } else {
      failedTests++
    }
  })

  // 总结
  log('cyan', '\n' + '═'.repeat(80))
  log('cyan', '📊 测试总结')
  log('cyan', '═'.repeat(80))
  log('green', `✅ 通过: ${passedTests}`)
  log('red', `❌ 失败: ${failedTests}`)
  log('cyan', `📝 总计: ${passedTests + failedTests}`)
  log('cyan', '═'.repeat(80) + '\n')

  process.exit(failedTests > 0 ? 1 : 0)
}

main()

