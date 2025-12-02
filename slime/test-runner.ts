/**
 * 通用测试框架
 * 提取 stage1/2/3 的公共逻辑
 */
import * as fs from 'fs'
import * as path from 'path'
import { getAllJsFiles, getParseMode, shouldSkipTest } from './test-utils'

// ============================================
// 通用配置 - 直接修改这里
// ============================================
export const DEFAULT_START_FROM = 0    // 从第几个测试开始（0 表示从头开始）
export const DEFAULT_STOP_ON_FAIL = true  // 遇到第一个失败就停止

// ============================================
// 类型定义
// ============================================

export interface TestContext {
  /** 测试文件完整路径 */
  filePath: string
  /** 测试文件相对路径（用于显示） */
  testName: string
  /** 源代码内容 */
  code: string
  /** 解析模式 */
  parseMode: 'module' | 'script'
  /** 当前索引（0-based） */
  index: number
}

export interface TestResult {
  /** 是否通过 */
  success: boolean
  /** 结果消息 */
  message: string
  /** 额外详情（可选） */
  details?: string
}

export interface TestRunnerOptions {
  /** 测试阶段名称，如 "阶段1: CST生成测试" */
  stageName: string
  /** 测试描述 */
  description: string
  /** 测试目录（默认 tests/babel） */
  casesDir?: string
  /** 是否在失败时打印详细错误（默认 true） */
  verboseOnFail?: boolean
  /** 从第几个测试开始（文件中配置，优先级低于命令行参数） */
  startFrom?: number
  /** 遇到第一个失败就停止（文件中配置，优先级低于命令行参数） */
  stopOnFail?: boolean
}

export interface TestStats {
  total: number
  passed: number
  failed: number
  skipped: number
  firstFailIndex: number
}

// ============================================
// 测试运行器
// ============================================

export async function runTests(
  testFn: (ctx: TestContext) => TestResult | Promise<TestResult>,
  options: TestRunnerOptions
): Promise<TestStats> {
  const {
    stageName,
    description,
    casesDir = path.join(__dirname, 'tests/babel'),
    verboseOnFail = true,
    startFrom,      // undefined 表示使用通用配置
    stopOnFail: stopOnFailConfig  // undefined 表示使用通用配置
  } = options

  // 优先级: 命令行参数 > stage文件配置 > 通用配置
  const args = process.argv.slice(2)
  const cmdStartIndex = args.find(a => !a.startsWith('-'))
  const startIndex = cmdStartIndex
    ? parseInt(cmdStartIndex, 10)
    : (startFrom ?? DEFAULT_START_FROM)
  const stopOnFail = args.includes('--stop-on-fail') || args.includes('-s')
    || (stopOnFailConfig ?? DEFAULT_STOP_ON_FAIL)

  // 获取测试文件
  const files = getAllJsFiles(casesDir).sort()

  // 打印测试信息
  console.log('='.repeat(60))
  if (startIndex > 0) {
    console.log(`📍 从第 ${startIndex + 1} 个文件开始测试 (跳过前 ${startIndex} 个)`)
  }
  if (stopOnFail) {
    console.log(`🛑 模式: 遇到第一个失败就停止`)
  }
  console.log(`🧪 ${stageName}`)
  console.log(`📝 ${description}`)
  console.log(`📁 测试目录: ${path.relative(process.cwd(), casesDir)}`)
  console.log(`📊 共 ${files.length} 个用例，测试 ${files.length - startIndex} 个`)
  console.log('='.repeat(60))

  // 统计
  const stats: TestStats = {
    total: files.length - startIndex,
    passed: 0,
    failed: 0,
    skipped: 0,
    firstFailIndex: -1
  }

  // 主循环
  for (let i = startIndex; i < files.length; i++) {
    const file = files[i]
    const testName = file.replace('.js', '')
    const filePath = path.join(casesDir, file)
    const testDir = path.dirname(filePath)

    // 跳过检查
    const skipResult = shouldSkipTest(testName, testDir)
    if (skipResult.skip) {
      console.log(`[${i + 1}] ⏭️  ${testName} (${skipResult.reason})`)
      stats.skipped++
      continue
    }

    // 读取代码和解析模式
    const parseMode = getParseMode(testDir, filePath)
    const code = fs.readFileSync(filePath, 'utf-8')

    // 构建上下文
    const ctx: TestContext = { filePath, testName, code, parseMode, index: i }

    // 执行测试
    try {
      const result = await testFn(ctx)

      if (result.success) {
        console.log(`[${i + 1}] ✅ ${testName} - ${result.message}`)
        stats.passed++
      } else {
        console.log(`[${i + 1}] ❌ ${testName} - ${result.message}`)
        if (verboseOnFail && result.details) {
          console.log(result.details)
        }
        if (stats.firstFailIndex === -1) stats.firstFailIndex = i
        stats.failed++

        if (stopOnFail) {
          console.log(`\n🛑 在第 ${i + 1} 个用例停止 (--stop-on-fail)`)
          break
        }
      }
    } catch (error: any) {
      console.log(`[${i + 1}] ❌ ${testName} - 异常: ${error.message}`)
      if (verboseOnFail) {
        console.log(`    ${error.stack?.split('\n').slice(0, 3).join('\n    ')}`)
      }
      if (stats.firstFailIndex === -1) stats.firstFailIndex = i
      stats.failed++

      if (stopOnFail) {
        console.log(`\n🛑 在第 ${i + 1} 个用例停止 (--stop-on-fail)`)
        break
      }
    }
  }

  // 打印结果汇总
  printSummary(stats, stageName, startIndex)

  return stats
}

// ============================================
// 结果汇总输出
// ============================================

function printSummary(stats: TestStats, stageName: string, startIndex: number) {
  const scriptName = path.basename(process.argv[1], '.ts')

  console.log('\n' + '='.repeat(60))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(60))
  console.log(`✅ 通过: ${stats.passed}/${stats.total}`)
  console.log(`❌ 失败: ${stats.failed}/${stats.total}`)
  console.log(`⏭️  跳过: ${stats.skipped}/${stats.total}`)

  if (stats.failed === 0) {
    console.log(`\n🎉 ${stageName} 全部通过!`)
  } else {
    console.log(`\n⚠️  有 ${stats.failed} 个测试失败`)
    if (stats.firstFailIndex !== -1) {
      console.log(`\n📍 第一个失败位置: ${stats.firstFailIndex + 1}`)
      console.log(`💡 从失败位置重新测试:`)
      console.log(`   npx tsx slime/${scriptName}.ts ${stats.firstFailIndex}`)
      console.log(`💡 从失败位置重新测试(遇错停止):`)
      console.log(`   npx tsx slime/${scriptName}.ts ${stats.firstFailIndex} -s`)
    }
  }
  console.log('='.repeat(60))
}

