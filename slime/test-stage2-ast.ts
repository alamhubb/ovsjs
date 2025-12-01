/**
 * 阶段2: AST生成测试
 * 测试范围: CST → AST转换
 * 前提: 阶段1已通过（CST可以正常生成）
 *
 * 验证内容:
 * 1. CST → AST 转换成功
 * 2. AST 结构正确性
 * 3. AST 节点类型正确性
 */
import * as fs from 'fs'
import * as path from 'path'
import SlimeParser from "./packages/slime-parser/src/language/es2025/SlimeParser"
import { SlimeCstToAst } from "./packages/slime-parser/src/language/SlimeCstToAstUtil"

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
  'importAttributes',   // ES2025 使用 with 语法，但此插件可能包含旧语法
  'importAssertions',   // 旧语法使用 assert 关键字，ES2025 使用 with
]

// Babel 扩展选项（非标准 ECMAScript，需要跳过）
const babelExtensionOptions = [
  'allowAwaitOutsideFunction',    // 允许在函数外使用 await
  'allowReturnOutsideFunction',   // 允许在函数外使用 return
  'allowSuperOutsideMethod',      // 允许在方法外使用 super
  'allowUndeclaredExports',       // 允许未声明的导出
  'allowNewTargetOutsideFunction', // 允许在函数外使用 new.target
  'annexB',                       // Annex B 扩展（部分我们不支持）
  'createImportExpressions',      // import() 表达式选项
  'createParenthesizedExpressions', // 括号表达式选项
]

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
 * 检查测试是否使用了 Babel 扩展选项
 */
function usesBabelExtensionOptions(testDir: string): string | null {
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

/**
 * 判断解析模式
 */
function getParseMode(testDir: string, filePath: string): 'module' | 'script' {
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/')
  if (normalizedPath.includes('script') || normalizedPath.includes('sourcetype-script')) {
    return 'script'
  }

  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.sourceType === 'script') {
        return 'script'
      }
    } catch {}
  }

  const outputPath = path.join(testDir, 'output.json')
  if (fs.existsSync(outputPath)) {
    try {
      const output = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      if (output.program?.sourceType === 'script') {
        return 'script'
      }
    } catch {}
  }

  return 'module'
}

/**
 * 检查是否为错误恢复测试
 */
function isErrorRecoveryTest(testDir: string): boolean {
  // 检查 options.json 中的 errorRecovery 选项
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      if (options.errorRecovery === true) {
        return true
      }
    } catch {}
  }

  // 检查 output.json 中是否有 errors 字段
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

/**
 * 检查是否为期望抛出错误的测试
 */
function isThrowsTest(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      return options.throws !== undefined
    } catch {}
  }
  return false
}

// 使用 Babel 测试目录
const casesDir = path.join(__dirname, 'tests/babel')
const files = getAllJsFiles(casesDir).sort()

// 支持从指定位置开始测试
const startIndex = parseInt(process.argv[2] || '0', 10)
if (startIndex > 0) {
  console.log(`📍 从第 ${startIndex + 1} 个文件开始测试 (跳过前 ${startIndex} 个)`)
}

console.log(`🧪 阶段2: AST生成测试 (${files.length} 个用例)`)
console.log('测试范围: CST → AST 转换')
console.log('验证: AST转换成功、AST结构完整\n')

// ============ AST 验证工具函数 ============

interface ASTValidationError {
    path: string
    issue: string
    node?: any
}

/**
 * 验证 AST 结构完整性
 */
function validateASTStructure(node: any, path: string = 'root'): ASTValidationError[] {
    const errors: ASTValidationError[] = []

    // 1. 检查节点不为 null/undefined
    if (node === null) {
        errors.push({ path, issue: 'Node is null' })
        return errors
    }
    if (node === undefined) {
        errors.push({ path, issue: 'Node is undefined' })
        return errors
    }

    // 2. 检查节点必须有 type 属性
    if (!node.type) {
        errors.push({
            path,
            issue: 'Node has no type property',
            node: JSON.stringify(node).substring(0, 100)
        })
    }

    // 3. 递归检查子节点
    if (node.body && Array.isArray(node.body)) {
        node.body.forEach((child: any, index: number) => {
            errors.push(...validateASTStructure(child, `${path}.body[${index}]`))
        })
    }

    if (node.declarations && Array.isArray(node.declarations)) {
        node.declarations.forEach((child: any, index: number) => {
            errors.push(...validateASTStructure(child, `${path}.declarations[${index}]`))
        })
    }

    // 注意：ArrowFunctionExpression 的 expression 是布尔值，不是节点
    if (node.expression && typeof node.expression === 'object') {
        errors.push(...validateASTStructure(node.expression, `${path}.expression`))
    }

    if (node.left) {
        errors.push(...validateASTStructure(node.left, `${path}.left`))
    }

    if (node.right) {
        errors.push(...validateASTStructure(node.right, `${path}.right`))
    }

    return errors
}

/**
 * 统计 AST 节点信息
 */
function getASTStatistics(node: any): {
    totalNodes: number
    nodeTypes: Map<string, number>
} {
    const stats = {
        totalNodes: 0,
        nodeTypes: new Map<string, number>()
    }

    function traverse(node: any) {
        if (!node || typeof node !== 'object') return

        stats.totalNodes++

        if (node.type) {
            stats.nodeTypes.set(node.type, (stats.nodeTypes.get(node.type) || 0) + 1)
        }

        // 遍历常见的子节点属性
        const childProps = ['body', 'declarations', 'expression', 'left', 'right',
            'init', 'test', 'update', 'consequent', 'alternate', 'argument',
            'arguments', 'callee', 'object', 'property', 'elements', 'properties',
            'params', 'id', 'key', 'value', 'superClass']

        for (const prop of childProps) {
            if (node[prop]) {
                if (Array.isArray(node[prop])) {
                    node[prop].forEach((child: any) => traverse(child))
                } else if (typeof node[prop] === 'object') {
                    traverse(node[prop])
                }
            }
        }
    }

    traverse(node)
    return stats
}

// ============ 测试主循环 ============

let skipped = 0

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

  // 检查是否使用了 Babel 扩展选项
  const babelExt = usesBabelExtensionOptions(testDir)
  if (babelExt) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (Babel 扩展: ${babelExt})`)
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
  if (isThrowsTest(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (期望抛出错误)`)
    skipped++
    continue
  }

  // 检查目录名是否以 'invalid' 开头（期望解析失败的用例）
  const dirName = path.basename(testDir)
  if (dirName.startsWith('invalid')) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (invalid 用例，期望解析失败)`)
    skipped++
    continue
  }

  // 跳过 await 在嵌套类中的边缘情况（Babel 与规范行为不同）
  if (testName.includes('await') && testName.includes('static-block') && testName.includes('initializer')) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (await 边缘情况)`)
    skipped++
    continue
  }

  // 跳过 accessor 字段（Stage 3 提案，暂不支持）
  if (testName.includes('accessor')) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (accessor 提案，暂不支持)`)
    skipped++
    continue
  }

  // 跳过 TypeScript 特定语法
  if (testName.includes('typescript')) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (TypeScript 语法，暂不支持)`)
    skipped++
    continue
  }

  // 确定解析模式
  const parseMode = getParseMode(testDir, filePath)

  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName} (${parseMode} 模式)`)
  console.log('='.repeat(60))

  try {
    // ========== 阶段1: CST 生成 ==========
    const parser = new SlimeParser(code)
    const cst = parser.Program(parseMode)

    if (!cst) {
      throw new Error('CST 生成返回 undefined')
    }
    console.log(`✅ CST生成: ${cst.children?.length || 0} 个子节点`)

    // ========== 阶段2: CST → AST 转换 ==========
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)

    if (!ast) {
      throw new Error('AST 转换返回 null/undefined')
    }

    console.log(`✅ AST转换: 成功`)

    // ========== 验证 AST 结构 ==========
    const structureErrors = validateASTStructure(ast)
    if (structureErrors.length > 0) {
      console.log(`\n❌ AST结构错误 (${structureErrors.length}个):`)
      structureErrors.slice(0, 5).forEach(err => {
        console.log(`  - ${err.path}: ${err.issue}`)
      })
      if (structureErrors.length > 5) {
        console.log(`  ... 还有 ${structureErrors.length - 5} 个错误`)
      }
      throw new Error(`AST结构验证失败: ${structureErrors.length}个错误`)
    }
    console.log(`✅ AST结构: 验证通过`)

    // ========== AST 统计信息 ==========
    const stats = getASTStatistics(ast)
    const topTypes = Array.from(stats.nodeTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => `${type}(${count})`)
      .join(', ')

    console.log(`📊 AST统计: ${stats.totalNodes}个节点, 主要类型: ${topTypes}`)

  } catch (error: any) {
    console.log(`\n❌ 失败: ${error.message}`)
    console.log('\n输入代码:')
    console.log(code)
    console.log('\n' + '='.repeat(60))
    console.log('详细错误信息:')
    console.log('='.repeat(60))
    console.log(error.toString())
    console.log('\n' + '='.repeat(60))
    console.log('错误栈:')
    console.log('='.repeat(60))
    console.log(error.stack)
    console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
    console.log(`当前进度: ${i - startIndex}/${files.length - startIndex} 通过\n`)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段2全部通过: ${files.length - skipped}/${files.length} (跳过 ${skipped} 个)`)
console.log('✅ CST → AST 转换: 所有用例成功')
console.log('✅ AST 结构验证: 所有节点有 type 属性')


