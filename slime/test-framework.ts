/**
 * 测试框架
 * 包含测试运行器和工具函数
 */
import * as fs from 'fs'
import * as path from 'path'
import { performance } from 'perf_hooks'

// ============================================
// 通用配置 - 直接修改这里
// ============================================
export const DEFAULT_START_FROM = 0       // 从第几个测试开始（0 表示从头开始）
export const DEFAULT_STOP_ON_FAIL = true  // 遇到第一个失败就停止
export const DEFAULT_TIMEOUT_MS = 3000    // 单个测试文件超时时间（毫秒）
export const DEFAULT_USE_SUBPROCESS = false // 是否使用子进程（启用超时中断，但会慢很多）

// ============================================
// 跳过规则配置
// ============================================

/** 跳过的目录（非标准 ECMAScript 语法） */
export const skipDirs = [
  'flow', 'jsx', 'typescript', 'experimental', 'placeholders',
  'v8intrinsic', 'disabled', 'annex-b', 'html', 'sourcetype-commonjs', 'comments',
]

/** 非标准插件列表（需要跳过包含这些插件的测试） */
export const nonStandardPlugins = [
  'asyncDoExpressions', 'doExpressions', 'decorators', 'decorators-legacy',
  'decoratorAutoAccessors', 'pipelineOperator', 'recordAndTuple', 'throwExpressions',
  'partialApplication', 'deferredImportEvaluation', 'sourcePhaseImports',
  'importAttributes', 'importAssertions',
]

/** Babel 扩展选项（非标准 ECMAScript，需要跳过） */
export const babelExtensionOptions = [
  'allowAwaitOutsideFunction', 'allowReturnOutsideFunction', 'allowSuperOutsideMethod',
  'allowUndeclaredExports', 'allowNewTargetOutsideFunction', 'annexB',
  'createImportExpressions', 'createParenthesizedExpressions',
]

// ============================================
// 类型定义
// ============================================

export interface TestContext {
  filePath: string
  testName: string
  code: string
  parseMode: 'module' | 'script'
  index: number
}

export interface TestResult {
  success: boolean
  message: string
  details?: string
}

export interface TestRunnerOptions {
  stageName: string
  description: string
  casesDir?: string
  verboseOnFail?: boolean
  startFrom?: number
  stopOnFail?: boolean
  useSubprocess?: boolean  // 是否使用子进程（启用超时中断，但会慢很多）
}

export interface TestStats {
  total: number
  passed: number
  failed: number
  skipped: number
  firstFailIndex: number
}

export interface SkipResult {
  skip: boolean
  reason?: string
}

// ============================================
// 工具函数
// ============================================

/** 递归获取目录下所有 .js 文件 */
export function getAllJsFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) continue
      results.push(...getAllJsFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(path.relative(baseDir, fullPath))
    }
  }
  return results
}

/** 检查测试是否需要非标准插件 */
export function requiresNonStandardPlugin(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) return false
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    const plugins = options.plugins || []
    return plugins.some((p: string | string[]) => {
      const pluginName = Array.isArray(p) ? p[0] : p
      return nonStandardPlugins.includes(pluginName)
    })
  } catch { return false }
}

/** 检查测试是否使用了 Babel 扩展选项 */
export function usesBabelExtensionOptions(testDir: string): string | null {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) return null
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    for (const opt of babelExtensionOptions) {
      if (opt in options) return opt
    }
    return null
  } catch { return null }
}

/** 检查是否是错误恢复测试 */
export function isErrorRecoveryTest(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.errorRecovery === true) return true
    } catch {}
  }
  const outputPath = path.join(testDir, 'output.json')
  if (fs.existsSync(outputPath)) {
    try {
      const output = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      if (output.errors && Array.isArray(output.errors) && output.errors.length > 0) return true
    } catch {}
  }
  return false
}

/** 检查是否期望抛出错误 */
export function isExpectedToThrow(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) return false
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    return options.throws !== undefined
  } catch { return false }
}

/** 获取解析模式（module 或 script） */
export function getParseMode(testDir: string, filePath: string): 'module' | 'script' {
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.sourceType === 'module') return 'module'
      if (options.sourceType === 'script') return 'script'
    } catch {}
  }
  if (filePath.endsWith('.mjs')) return 'module'
  if (testDir.includes('-module') || testDir.includes('_module') || testDir.endsWith('module')) return 'module'
  try {
    const code = fs.readFileSync(filePath, 'utf-8')
    if (/^\s*(import|export)\s/m.test(code)) return 'module'
  } catch {}
  return 'script'
}

/** 检查测试是否应该跳过 */
export function shouldSkipTest(testName: string, testDir: string): SkipResult {
  if (requiresNonStandardPlugin(testDir)) return { skip: true, reason: '需要非标准插件' }
  const babelExt = usesBabelExtensionOptions(testDir)
  if (babelExt) return { skip: true, reason: `Babel 扩展: ${babelExt}` }
  if (isErrorRecoveryTest(testDir)) return { skip: true, reason: '错误恢复测试' }
  if (isExpectedToThrow(testDir)) return { skip: true, reason: '期望抛出错误' }
  const dirName = path.basename(testDir)
  if (dirName.startsWith('invalid')) return { skip: true, reason: 'invalid 用例，期望解析失败' }
  // if (testName.includes('await') && testName.includes('static-block') && testName.includes('initializer'))
  //   return { skip: true, reason: 'await 边缘情况' }
  if (testName.includes('accessor')) return { skip: true, reason: 'accessor 提案，暂不支持' }
  if (testName.includes('typescript')) return { skip: true, reason: 'TypeScript 语法，暂不支持' }
  // if (testName.includes('nested-cover-grammar')) return { skip: true, reason: '深度嵌套，性能边缘情况' }
  return { skip: false }
}

// ============================================
// 测试运行器
// ============================================

export async function runTests(
  testFn: (ctx: TestContext) => TestResult | Promise<TestResult>,
  options: TestRunnerOptions
): Promise<TestStats> {
  const {
    stageName, description,
    casesDir = path.join(__dirname, 'tests/babel'),
    verboseOnFail = true,
    startFrom,
    stopOnFail: stopOnFailConfig,
    useSubprocess: useSubprocessConfig
  } = options

  const args = process.argv.slice(2)
  const cmdStartIndex = args.find(a => !a.startsWith('-'))
  const startIndex = cmdStartIndex
    ? parseInt(cmdStartIndex, 10) - 1
    : (startFrom !== undefined ? startFrom - 1 : DEFAULT_START_FROM)
  const stopOnFail = args.includes('--stop-on-fail') || args.includes('-s') || (stopOnFailConfig ?? DEFAULT_STOP_ON_FAIL)
  const useSubprocess = args.includes('--subprocess') || args.includes('-p') || (useSubprocessConfig ?? DEFAULT_USE_SUBPROCESS)

  const files = getAllJsFiles(casesDir).sort()

  console.log('='.repeat(60))
  if (startIndex > 0) console.log(`📍 从 ${startIndex + 1} 开始测试 (跳过 1~${startIndex})`)
  if (stopOnFail) console.log(`🛑 模式: 遇到第一个失败就停止`)
  if (useSubprocess) console.log(`🐢 模式: 子进程运行 (支持超时中断，较慢)`)
  else console.log(`🚀 模式: 主进程运行 (快速)`)
  console.log(`🧪 ${stageName}`)
  console.log(`📝 ${description}`)
  console.log(`📁 测试目录: ${path.relative(process.cwd(), casesDir)}`)
  console.log(`📊 共 ${files.length} 个用例 (1~${files.length})，测试 ${files.length - startIndex} 个`)
  console.log('='.repeat(60))

  const stats: TestStats = { total: files.length - startIndex, passed: 0, failed: 0, skipped: 0, firstFailIndex: -1 }

  for (let i = startIndex; i < files.length; i++) {
    const file = files[i]
    const testName = file.replace('.js', '')
    const filePath = path.join(casesDir, file)
    const testDir = path.dirname(filePath)

    const skipResult = shouldSkipTest(testName, testDir)
    if (skipResult.skip) {
      console.log(`[${i + 1}] ⏭️  ${testName} (${skipResult.reason})`)
      stats.skipped++
      continue
    }

    const parseMode = getParseMode(testDir, filePath)
    const code = fs.readFileSync(filePath, 'utf-8')
    const ctx: TestContext = { filePath, testName, code, parseMode, index: i }

    const startTime = performance.now()

    try {
      // 根据配置选择运行方式
      const result = useSubprocess
        ? await runTestWithTimeout(testFn, ctx, DEFAULT_TIMEOUT_MS)
        : await runTestDirect(testFn, ctx)
      const elapsed = performance.now() - startTime

      if (result.timeout) {
        console.log(`\n[${i + 1}] ⏱️ ${testName} - 超时 (>${DEFAULT_TIMEOUT_MS}ms)`)
        console.log(`   🔍 该用例存在性能问题，需要分析`)
        console.log(`   📄 代码: ${code}`)
        throw new Error(`测试超时: ${testName} 超过阈值 ${DEFAULT_TIMEOUT_MS}ms`)
      }

      if (result.success) {
        const timeInfo = elapsed > 100 ? ` (${elapsed.toFixed(0)}ms)` : ''
        console.log(`[${i + 1}] ✅ ${testName} - ${result.message}${timeInfo}`)
        stats.passed++
      } else {
        console.log(`[${i + 1}] ❌ ${testName} - ${result.message}`)
        if (verboseOnFail && result.details) console.log(result.details)
        if (stats.firstFailIndex === -1) stats.firstFailIndex = i
        stats.failed++
        if (stopOnFail) { console.log(`\n🛑 在 ${i + 1} 停止`); break }
      }
    } catch (error: any) {
      const elapsed = performance.now() - startTime

      // 超时错误直接抛出
      if (error.message?.includes('测试超时')) {
        throw error
      }

      console.log(`[${i + 1}] ❌ ${testName} - 异常: ${error.message} (${elapsed.toFixed(0)}ms)`)
      if (verboseOnFail) console.log(`    ${error.stack?.split('\n').slice(0, 3).join('\n    ')}`)
      if (stats.firstFailIndex === -1) stats.firstFailIndex = i
      stats.failed++
      if (stopOnFail) { console.log(`\n🛑 在 ${i + 1} 停止`); break }
    }
  }

  printSummary(stats, stageName)
  return stats
}

/** 直接在主进程运行测试（快速，但无法中断超时） */
async function runTestDirect(
  testFn: (ctx: TestContext) => TestResult | Promise<TestResult>,
  ctx: TestContext
): Promise<TestResult & { timeout?: boolean }> {
  const result = await testFn(ctx)
  return result
}

/** 使用子进程运行测试，支持真正的超时中断 */
async function runTestWithTimeout(
  testFn: (ctx: TestContext) => TestResult | Promise<TestResult>,
  ctx: TestContext,
  timeoutMs: number
): Promise<TestResult & { timeout?: boolean }> {
  const { spawn } = await import('child_process')

  return new Promise((resolve) => {
    // 使用 spawn 创建子进程运行 test-worker.ts
    const child = spawn('npx', ['tsx', path.join(__dirname, 'test-worker.ts'), ctx.parseMode], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    })

    let stdout = ''
    let resolved = false

    // 设置超时
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        child.kill('SIGKILL')
        resolve({ success: false, message: '超时', timeout: true })
      }
    }, timeoutMs)

    // 收集 stdout
    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    // 子进程退出
    child.on('close', (code: number) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timer)
        try {
          const result = JSON.parse(stdout.trim())
          resolve(result)
        } catch {
          resolve({ success: false, message: `解析结果失败: ${stdout}` })
        }
      }
    })

    // 发送代码到子进程的 stdin
    child.stdin.write(ctx.code)
    child.stdin.end()
  })
}

function printSummary(stats: TestStats, stageName: string) {
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
      console.log(`\n📍 第一个失败: ${stats.firstFailIndex + 1}`)
      console.log(`💡 重新测试: npx tsx slime/${scriptName}.ts ${stats.firstFailIndex + 1}`)
    }
  }
  console.log('='.repeat(60))
}

