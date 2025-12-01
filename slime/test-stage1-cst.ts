/**
 * 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 */
import * as fs from 'fs'
import * as path from 'path'
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser";
import {
  getAllJsFiles,
  getParseMode,
  shouldSkipTest
} from './test-utils'

// const casesDir = path.join(__dirname, 'tests/cases')
// const casesDir = path.join(__dirname, 'tests/es6rules')
const casesDir = path.join(__dirname, 'tests/babel')
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

for (let i = startIndex; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const testDir = path.dirname(filePath)

  // 统一跳过检查
  const skipResult = shouldSkipTest(testName, testDir)
  if (skipResult.skip) {
    console.log(`\n[${i + 1}] ⏭️ 跳过: ${testName} (${skipResult.reason})`)
    skipped++
    continue
  }

  // 确定解析模式
  const parseMode = getParseMode(testDir, filePath)

  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${ i + 1}] 测试: ${testName} (${parseMode} 模式)`)
  console.log('='.repeat(60))

  try {
    // 词法分析 + 语法分析
    const parser = new SlimeParser(code)
    const cst = parser.Program(parseMode)
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


