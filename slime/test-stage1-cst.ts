/**
 * 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 */
import * as fs from 'fs'
import * as path from 'path'
import SubhutiLexer from "subhuti/src/SubhutiLexer";
import Es2025Parser, {slimeTokens} from "slime-parser/src/language/es2025/Es2025Parser";

// 跳过的目录（非标准 ECMAScript 语法）
const skipDirs = [
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
]

// 非标准插件列表（需要跳过包含这些插件的测试）
const nonStandardPlugins = [
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
  'importAttributes',  // 部分支持
]

/**
 * 检查测试是否需要非标准插件
 */
function requiresNonStandardPlugin(testDir: string): boolean {
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

/**
 * 递归获取目录下所有 .js 文件
 */
function getAllJsFiles(dir: string, baseDir: string = dir): string[] {
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

// const casesDir = path.join(__dirname, 'tests/babel')
const casesDir = path.join(__dirname, 'tests/es6rules')
const files = getAllJsFiles(casesDir).sort()

// 支持从指定位置开始测试
// 用法: npx tsx test-stage1-cst.ts [startIndex]
// 例如: npx tsx test-stage1-cst.ts 50  -- 从第50个文件开始
const startIndex = parseInt(process.argv[2] || '0', 10)

if (startIndex > 0) {
  console.log(`📍 从第 ${startIndex + 1} 个文件开始测试 (跳过前 ${startIndex} 个)`)
}
console.log(`🧪 阶段1: CST生成测试 (${files.length} 个用例，测试 ${files.length - startIndex} 个)`)
console.log('测试范围: 词法分析 → 语法分析\n')

let skipped = 0
/**
 * 检查测试用例是否是错误恢复测试
 * 错误恢复测试的 output.json 中包含 errors 字段
 */
function isErrorRecoveryTest(testDir: string): boolean {
  const outputPath = path.join(testDir, 'output.json')
  if (!fs.existsSync(outputPath)) {
    return false
  }
  try {
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    return Array.isArray(output.errors) && output.errors.length > 0
  } catch {
    return false
  }
}

/**
 * 检查测试用例是否期望抛出错误
 * options.json 中包含 throws 字段表示期望解析失败
 */
function isExpectedToThrow(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (!fs.existsSync(optionsPath)) {
    return false
  }
  try {
    const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
    return typeof options.throws === 'string'
  } catch {
    return false
  }
}

for (let i = startIndex; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const testDir = path.dirname(filePath)

  // 检查是否需要非标准插件
  if (requiresNonStandardPlugin(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (需要非标准插件)`)
    skipped++
    continue
  }

  // 检查是否是错误恢复测试（当前阶段暂不支持）
  if (isErrorRecoveryTest(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (错误恢复测试)`)
    skipped++
    continue
  }

  // 检查是否期望抛出错误（语法错误用例）
  if (isExpectedToThrow(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (期望抛出错误)`)
    skipped++
    continue
  }

  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${ i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 词法分析
    const lexer = new SubhutiLexer(slimeTokens)
    const tokens = lexer.tokenize(code)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)

    // 语法分析
    const parser = new Es2025Parser(tokens)
    const cst = parser.Program('module')
    console.log(`✅ 语法分析: CST生成成功`)
    console.log(`CST根节点children数: ${cst.children?.length || 0}`)

  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`)
    console.log('\n输入代码:')
    console.log(code)
    console.log('\n')
    console.log('='.repeat(60))
    console.log('详细错误信息:')
    console.log('='.repeat(60))
    // 调用 toString() 获取完整的格式化错误信息
    console.log(error.toString())
    console.log('\n' + '='.repeat(60))
    console.log('错误栈:')
    console.log('='.repeat(60))
    console.log(error.stack)
    console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
    console.log(`当前进度: ${i}/${files.length} 通过\n`)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段1全部通过: ${files.length - skipped}/${files.length} (跳过 ${skipped} 个)`)


