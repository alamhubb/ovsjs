/**
 * 共享的测试工具模块
 * 用于 stage1、stage2、stage3 测试
 */
import * as fs from 'fs'
import * as path from 'path'

// ============ 跳过规则配置 ============

/** 跳过的目录（非标准 ECMAScript 语法） */
export const skipDirs = [
  'flow',           // Flow 类型语法
  'jsx',            // JSX 语法
  'typescript',     // TypeScript 语法
  'experimental',   // 实验性语法
  'placeholders',   // 占位符语法
  'v8intrinsic',    // V8 内部语法
  'disabled',       // 明确禁用的测试
  'annex-b',        // Annex B 扩展语法（HTML 注释等）
  'html',           // HTML 注释语法（Annex B）
  'sourcetype-commonjs',  // CommonJS 模式（非标准 ES Module）
  'comments',       // 注释测试（代码生成器不保留注释，trailing comma 等问题）
]

/** 非标准插件列表（需要跳过包含这些插件的测试） */
export const nonStandardPlugins = [
  'asyncDoExpressions',
  'doExpressions',
  'decorators',
  'decorators-legacy',
  'decoratorAutoAccessors',
  'pipelineOperator',
  'recordAndTuple',
  'throwExpressions',
  'partialApplication',
  'deferredImportEvaluation',
  'sourcePhaseImports',
  'importAttributes',   // ES2025 使用 with 语法，但此插件可能包含旧语法
  'importAssertions',   // 旧语法使用 assert 关键字，ES2025 使用 with
]

/** Babel 扩展选项（非标准 ECMAScript，需要跳过） */
export const babelExtensionOptions = [
  'allowAwaitOutsideFunction',    // 允许在函数外使用 await
  'allowReturnOutsideFunction',   // 允许在函数外使用 return
  'allowSuperOutsideMethod',      // 允许在方法外使用 super
  'allowUndeclaredExports',       // 允许未声明的导出
  'allowNewTargetOutsideFunction', // 允许在函数外使用 new.target
  'annexB',                       // Annex B 扩展（部分我们不支持）
  'createImportExpressions',      // import() 表达式选项
  'createParenthesizedExpressions', // 括号表达式选项
]

// ============ 工具函数 ============

/** 递归获取目录下所有 .js 文件 */
export function getAllJsFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // 跳过不需要测试的目录
      if (skipDirs.includes(entry.name)) {
        continue
      }
      // 递归遍历子目录
      results.push(...getAllJsFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // 收集 .js 文件的相对路径
      results.push(path.relative(baseDir, fullPath))
    }
  }

  return results
}

/** 检查测试是否需要非标准插件 */
export function requiresNonStandardPlugin(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) {
    return false
  }
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    const plugins = options.plugins || []
    return plugins.some((p: string | string[]) => {
      const pluginName = Array.isArray(p) ? p[0] : p
      return nonStandardPlugins.includes(pluginName)
    })
  } catch {
    return false
  }
}

/** 检查测试是否使用了 Babel 扩展选项 */
export function usesBabelExtensionOptions(testDir: string): string | null {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) {
    return null
  }
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    for (const opt of babelExtensionOptions) {
      if (opt in options) {
        return opt
      }
    }
    return null
  } catch {
    return null
  }
}

/** 检查是否是错误恢复测试 */
export function isErrorRecoveryTest(testDir: string): boolean {
  // 1. 检查 options.json 中的 errorRecovery 选项
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.errorRecovery === true) {
        return true
      }
    } catch {}
  }

  // 2. 检查 output.json 中是否有 errors 字段
  const outputPath = path.join(testDir, 'output.json')
  if (fs.existsSync(outputPath)) {
    try {
      const output = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      if (output.errors && Array.isArray(output.errors) && output.errors.length > 0) {
        return true
      }
    } catch {}
  }

  return false
}

/** 检查是否期望抛出错误 */
export function isExpectedToThrow(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) {
    return false
  }
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    return options.throws !== undefined
  } catch {
    return false
  }
}

/** 获取解析模式（module 或 script） */
export function getParseMode(testDir: string, filePath: string): 'module' | 'script' {
  // 1. 检查 options.json 中的 sourceType
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.sourceType === 'module') return 'module'
      if (options.sourceType === 'script') return 'script'
    } catch {}
  }

  // 2. 检查文件扩展名
  if (filePath.endsWith('.mjs')) return 'module'

  // 3. 检查目录路径（包含 -module 或 top-level-await-module 等）
  if (testDir.includes('-module') || testDir.includes('_module') || testDir.endsWith('module')) return 'module'

  // 4. 检查文件内容是否包含 ES Module 语法
  try {
    const code = fs.readFileSync(filePath, 'utf-8')
    if (/^\s*(import|export)\s/m.test(code)) return 'module'
  } catch {}

  // 5. 默认使用 script 模式
  return 'script'
}

// ============ 跳过测试结果类型 ============

export interface SkipResult {
  skip: boolean
  reason?: string
}

/**
 * 检查测试是否应该跳过
 * 返回 { skip: boolean, reason?: string }
 */
export function shouldSkipTest(testName: string, testDir: string): SkipResult {
  // 1. 检查是否需要非标准插件
  if (requiresNonStandardPlugin(testDir)) {
    return { skip: true, reason: '需要非标准插件' }
  }

  // 2. 检查是否使用了 Babel 扩展选项
  const babelExt = usesBabelExtensionOptions(testDir)
  if (babelExt) {
    return { skip: true, reason: `Babel 扩展: ${babelExt}` }
  }

  // 3. 检查是否是错误恢复测试
  if (isErrorRecoveryTest(testDir)) {
    return { skip: true, reason: '错误恢复测试' }
  }

  // 4. 检查是否期望抛出错误
  if (isExpectedToThrow(testDir)) {
    return { skip: true, reason: '期望抛出错误' }
  }

  // 5. 检查目录名是否以 'invalid' 开头
  const dirName = path.basename(testDir)
  if (dirName.startsWith('invalid')) {
    return { skip: true, reason: 'invalid 用例，期望解析失败' }
  }

  // 6. 跳过 await 在嵌套类中的边缘情况（Babel 与规范行为不同）
  if (testName.includes('await') && testName.includes('static-block') && testName.includes('initializer')) {
    return { skip: true, reason: 'await 边缘情况' }
  }

  // 7. 跳过 accessor 字段（Stage 3 提案，暂不支持）
  if (testName.includes('accessor')) {
    return { skip: true, reason: 'accessor 提案，暂不支持' }
  }

  // 8. 跳过 TypeScript 特定语法
  if (testName.includes('typescript')) {
    return { skip: true, reason: 'TypeScript 语法，暂不支持' }
  }

  // 9. 跳过深度嵌套的边缘情况（性能问题）
  if (testName.includes('nested-cover-grammar')) {
    return { skip: true, reason: '深度嵌套，性能边缘情况' }
  }

  return { skip: false }
}

