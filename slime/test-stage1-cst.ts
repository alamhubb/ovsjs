/**
 * 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 */
import Es2025Parser from './packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens";

/**
 * 递归获取目录下所有 .js 文件
 */
function getAllJsFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // 递归遍历子目录
      results.push(...getAllJsFiles(fullPath, baseDir))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // 收集 .js 文件的相对路径
      results.push(path.relative(baseDir, fullPath))
    }
  }

  return results
}

const casesDir = path.join(__dirname, 'tests/test262/language')
const files = getAllJsFiles(casesDir).sort()

// 支持从指定位置开始测试
// 用法: npx tsx test-stage1-cst.ts [startIndex]
// 例如: npx tsx test-stage1-cst.ts 50  -- 从第50个文件开始
const startIndex = parseInt(process.argv[2] || '0', 10)
const validStartIndex = 300

if (startIndex > 0) {
  console.log(`📍 从第 ${validStartIndex + 1} 个文件开始测试 (跳过前 ${validStartIndex} 个)`)
}
console.log(`🧪 阶段1: CST生成测试 (${files.length} 个用例，测试 ${files.length - validStartIndex} 个)`)
console.log('测试范围: 词法分析 → 语法分析\n')

for (let i = validStartIndex; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${ i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 词法分析
    const lexer = new SubhutiLexer(es2025Tokens)
    const tokens = lexer.tokenize(code)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)

    // 语法分析
    const parser = new Es2025Parser(tokens)
    const cst = parser.Module()
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
console.log(`🎉 阶段1全部通过: ${files.length}/${files.length}`)


