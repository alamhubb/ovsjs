/**
 * test262 parser runner for slime-parser
 *
 * 用法: npx tsx test262-runner.ts
 *
 * 直接修改下面的配置参数即可
 */

// ============== 配置参数 ==============
const testDir = 'tests/test262/language'  // 测试目录
const startIndex = 1952                    // 从第几个开始 (0-based)
const stopOnFail = true                    // 遇到失败立即停止
const skipStrictTests = true               // 跳过严格模式测试 (onlyStrict)
// 跳过语义检查相关的目录（我们只做语法解析，不做语义检查）
const skipDirs = [
    'redeclaration',       // 重复声明检查
    'directive-prologue',  // 严格模式下的语义检查（保留字等）
]
// 跳过语义检查相关的文件名模式
const skipFilePatterns = [
    /-strict-body\.js$/,       // use strict + 非简单参数列表的冲突检查
    /use-strict-with-non-simple-param\.js$/,  // use strict + 非简单参数列表的冲突检查
    /dflt-params-duplicates\.js$/,  // 重复参数名检查
    /params-duplicate\.js$/,   // 重复参数名检查
    /no-duplicates.*\.js$/,    // 重复参数名检查
    /rest.*init.*\.js$/,       // rest element 不能有初始化器（语义检查）
    /rest-not-final.*\.js$/,   // rest element 必须在最后（语义检查）
    /rest-before-.*\.js$/,    // rest element 后不能有其他元素（Cover Grammar 验证）
    /param-dflt-yield-expr\.js$/,   // 箭头函数参数不能包含 yield 表达式（Contains 检查）
    /-invalid\.js$/,           // Cover Grammar 验证（解构赋值目标验证）
    /optchain.*-init\.js$/,    // Optional Chaining 作为赋值目标（AssignmentTargetType 检查）
    /non-simple-target\.js$/,  // 非简单赋值目标（AssignmentTargetType 检查）
    /target-assignment.*\.js$/,  // 赋值目标类型检查（AssignmentTargetType 检查）
    /target-boolean\.js$/,     // boolean 字面量不能作为赋值目标（AssignmentTargetType 检查）
    /target-cover.*\.js$/,     // Cover Grammar 作为赋值目标（AssignmentTargetType 检查）
    /target-null\.js$/,        // null 字面量不能作为赋值目标（AssignmentTargetType 检查）
    /target-number\.js$/,      // number 字面量不能作为赋值目标（AssignmentTargetType 检查）
    /target-string\.js$/,      // string 字面量不能作为赋值目标（AssignmentTargetType 检查）
    /target-newtarget\.js$/,   // new.target 不能作为赋值目标（AssignmentTargetType 检查）
    /target-super.*\.js$/,     // super.* 不能作为赋值目标（AssignmentTargetType 检查）
]
// ======================================

import * as fs from 'fs'
import * as path from 'path'
import Es2025Parser from './packages/slime-parser/src/language/es2025/Es2025Parser'
import SubhutiLexer from 'subhuti/src/SubhutiLexer'
import { es2025Tokens } from 'slime-parser/src/language/es2025/SlimeTokensName'

interface TestMetadata {
    isNegative: boolean
    negativePhase: string | null
    negativeType: string | null
    flags: string[]
    features: string[]
}

interface TestResult {
    file: string
    passed: boolean
    isNegative: boolean
    error?: string
}

/**
 * 解析 test262 frontmatter 元数据
 */
function parseTestMetadata(code: string): TestMetadata {
    const result: TestMetadata = {
        isNegative: false,
        negativePhase: null,
        negativeType: null,
        flags: [],
        features: []
    }
    
    const metaMatch = code.match(/\/\*---\n?([\s\S]*?)\n?---\*\//)
    if (!metaMatch) return result
    
    const yaml = metaMatch[1]
    
    // 解析 negative
    const negativeMatch = yaml.match(/negative:\s*\n\s+phase:\s*(\w+)\s*\n\s+type:\s*(\w+)/)
    if (negativeMatch) {
        result.isNegative = true
        result.negativePhase = negativeMatch[1]
        result.negativeType = negativeMatch[2]
    }
    
    // 解析 flags
    const flagsMatch = yaml.match(/flags:\s*\[(.*?)\]/)
    if (flagsMatch) {
        result.flags = flagsMatch[1].split(',').map(f => f.trim())
    }
    
    // 解析 features
    const featuresMatch = yaml.match(/features:\s*\[(.*?)\]/)
    if (featuresMatch) {
        result.features = featuresMatch[1].split(',').map(f => f.trim())
    }
    
    return result
}

/**
 * 运行单个测试
 */
function runTest(filePath: string): TestResult {
    const code = fs.readFileSync(filePath, 'utf8')
    const meta = parseTestMetadata(code)
    const sourceType = meta.flags.includes('module') ? 'module' : 'script'

    try {
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)
        const parser = new Es2025Parser(tokens)

        // 使用统一的 Program 入口
        parser.Program(sourceType)
        
        // 解析成功
        if (meta.isNegative && meta.negativePhase === 'parse') {
            // 负向测试应该失败，但解析成功了
            return { file: filePath, passed: false, isNegative: true, error: 'Expected parse error but succeeded' }
        }
        return { file: filePath, passed: true, isNegative: meta.isNegative }
        
    } catch (error: any) {
        // 解析失败
        if (meta.isNegative && meta.negativePhase === 'parse') {
            // 负向测试：预期解析失败
            return { file: filePath, passed: true, isNegative: true }
        }
        return { file: filePath, passed: false, isNegative: false, error: error.message }
    }
}

/**
 * 递归获取所有 .js 文件
 */
function getAllJsFiles(dir: string): string[] {
    const results: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            results.push(...getAllJsFiles(fullPath))
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            results.push(fullPath)
        }
    }
    return results
}

// 主程序
console.log(`🧪 test262 Parser Runner`)
console.log(`📁 测试目录: ${testDir}`)
if (stopOnFail) {
    console.log(`⚠️  模式: 遇到失败立即停止`)
}
console.log('')

const files = getAllJsFiles(testDir)
console.log(`📊 发现 ${files.length} 个测试文件`)

if (startIndex > 0) {
    console.log(`📍 从第 ${startIndex + 1} 个文件开始 (跳过前 ${startIndex} 个)`)
}
console.log('')

let passed = 0, failed = 0, negativePass = 0, skipped = 0
const failures: TestResult[] = []

for (let i = startIndex; i < files.length; i++) {
    const filePath = files[i]

    // 检查是否跳过特定目录（语义检查相关）
    if (skipDirs.some(dir => filePath.includes(`\\${dir}\\`) || filePath.includes(`/${dir}/`))) {
        skipped++
        continue
    }

    // 检查是否跳过特定文件名模式（语义检查相关）
    const fileName = path.basename(filePath)
    if (skipFilePatterns.some(pattern => pattern.test(fileName))) {
        skipped++
        continue
    }

    // 检查是否跳过严格模式测试
    if (skipStrictTests) {
        const code = fs.readFileSync(filePath, 'utf8')
        if (/flags:\s*\[.*onlyStrict.*\]/.test(code)) {
            skipped++
            continue
        }
    }

    const result = runTest(filePath)

    if (result.passed) {
        passed++
        if (result.isNegative) negativePass++
        console.log(`✅ [${i+1}/${files.length}] ${path.relative(testDir, result.file)}`)
    } else {
        failed++
        failures.push(result)
        console.log(`❌ [${i+1}/${files.length}] ${path.relative(testDir, result.file)}`)
        console.log(`   ${result.error?.substring(0, 100)}`)

        if (stopOnFail) {
            console.log('\n' + '='.repeat(60))
            console.log(`🛑 测试在第 ${i + 1} 个文件处停止 (0-based: ${i})`)
            console.log(`📄 文件: ${result.file}`)
            console.log(`\n💡 修复后设置 startIndex = ${i} 继续`)
            process.exit(1)
        }
    }
}

const testedCount = passed + failed
console.log('\n' + '='.repeat(60))
console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败, ${skipped} 跳过 (负向测试通过: ${negativePass})`)
console.log(`✅ 通过率: ${(passed / testedCount * 100).toFixed(2)}%`)

// 按目录统计失败
if (failures.length > 0 && !stopOnFail) {
    const dirStats: Record<string, number> = {}
    for (const f of failures) {
        const relPath = path.relative(testDir, f.file)
        const dir = path.dirname(relPath).split(path.sep)[0] || '.'
        dirStats[dir] = (dirStats[dir] || 0) + 1
    }

    console.log('\n📁 失败分布 (按顶级目录):')
    const sorted = Object.entries(dirStats).sort((a, b) => b[1] - a[1])
    for (const [dir, count] of sorted) {
        console.log(`   ${dir}: ${count} 个失败`)
    }
}

