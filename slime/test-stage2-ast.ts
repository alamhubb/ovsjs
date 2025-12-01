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
  'importAttributes',
  'importAssertions',
  'flow',
  'flowComments',
  'typescript',
  'jsx',
]

// 需要跳过的目录名（包含非标准语法）
const skipDirectories = [
  'flow',
  'typescript',
  'jsx',
  'placeholders',
  'decorators-legacy',
  'decorators',
  'decorator-auto-accessors',
  'deferred-import-evaluation',
  'source-phase-imports',
  'export-extensions',
  'do-expressions',
  'async-do-expressions',
  'discard-binding',
  'import-assertions',  // 旧语法，ES2025 使用 with 而不是 assert
  'import-attributes-deprecatedAssertKeyword',  // 旧语法
  'import-reflection',  // 非标准语法
  'json-modules',  // 使用旧的 assert 语法
  'module-attributes',  // 旧语法
  'module-blocks',  // 非标准语法
]

/**
 * 递归获取目录中所有 .js 文件
 */
function getAllJsFiles(dir: string): string[] {
  const results: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      results.push(...getAllJsFiles(fullPath))
    } else if (item.isFile() && (item.name === 'input.js' || item.name === 'input.mjs')) {
      results.push(fullPath)
    }
  }

  return results
}

/**
 * 检查测试是否需要非标准插件
 */
function requiresNonStandardPlugins(testDir: string): boolean {
  const optionsPath = path.join(testDir, 'options.json')
  if (fs.existsSync(optionsPath)) {
    try {
      const options = JSON.parse(fs.readFileSync(optionsPath, 'utf-8'))
      const plugins = options.plugins || []
      return plugins.some((p: any) => {
        const pluginName = Array.isArray(p) ? p[0] : p
        return nonStandardPlugins.includes(pluginName)
      })
    } catch {
      return false
    }
  }
  return false
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

    if (node.expression) {
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
  const filePath = files[i]
  const testDir = path.dirname(filePath)
  const testName = path.relative(casesDir, filePath).replace(/\\/g, '/')

  // 跳过需要非标准插件的测试
  if (requiresNonStandardPlugins(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (需要非标准插件)`)
    skipped++
    continue
  }

  // 跳过错误恢复测试
  if (isErrorRecoveryTest(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (错误恢复测试)`)
    skipped++
    continue
  }

  // 跳过期望抛出错误的测试
  if (isThrowsTest(testDir)) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (期望抛出错误)`)
    skipped++
    continue
  }

  // 跳过 invalid 目录
  const dirName = path.basename(testDir)
  if (dirName.startsWith('invalid')) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (invalid 用例)`)
    skipped++
    continue
  }

  // 跳过包含非标准语法的目录
  const normalizedTestPath = testName.toLowerCase().replace(/\\/g, '/')
  const shouldSkipDir = skipDirectories.some(dir => {
    const dirLower = dir.toLowerCase()
    // 检查完整目录名匹配
    return normalizedTestPath.includes(`/${dirLower}/`) ||
           normalizedTestPath.includes(`/${dirLower}-`) ||
           // 检查目录名以 dir 开头
           normalizedTestPath.split('/').some(part => part === dirLower || part.startsWith(dirLower + '-'))
  })
  if (shouldSkipDir) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (非标准语法目录)`)
    skipped++
    continue
  }

  // 跳过 script 模式
  const parseMode = getParseMode(testDir, filePath)
  if (parseMode === 'script') {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (script 模式)`)
    skipped++
    continue
  }

  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // ========== 阶段1: CST 生成 ==========
    const parser = new SlimeParser(code)
    const cst = parser.Program('module')

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


