/**
 * 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 验证方式: 比较输入代码和输出代码的 token 序列是否一致
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 */
import SlimeParser from './packages/slime-parser/src/language/es2025/SlimeParser'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator'
import * as fs from 'fs'
import * as path from 'path'
import SubhutiMatchToken from 'subhuti/src/struct/SubhutiMatchToken'
import {
  getAllJsFiles,
  getParseMode,
  shouldSkipTest
} from './test-utils'

// ============================================
// Token 序列比较工具
// ============================================

/**
 * 提取用于比较的 token 值序列（忽略位置信息）
 * @param tokens token 数组
 * @param ignoreSemicolons 是否忽略分号（用于 ASI 兼容）
 * @returns 用于比较的 token 值数组
 */
function extractTokenValues(tokens: SubhutiMatchToken[], ignoreSemicolons = true): string[] {
  let values = tokens.map(t => t.tokenValue)
  if (ignoreSemicolons) {
    // 过滤掉分号，因为原始代码可能使用 ASI（自动分号插入）
    values = values.filter(v => v !== ';')
  }
  return values
}

/**
 * 比较两个 token 序列
 * @returns 差异信息，如果完全相同返回 null
 */
function compareTokenSequences(
  inputTokens: SubhutiMatchToken[],
  outputTokens: SubhutiMatchToken[]
): { success: boolean; message: string; details?: any } {
  const inputValues = extractTokenValues(inputTokens)
  const outputValues = extractTokenValues(outputTokens)

  // 输出 token 数不能少于输入 token 数（允许多出尾随逗号等）
  if (outputValues.length < inputValues.length) {
    return {
      success: false,
      message: `Token 数量不足: 输入 ${inputValues.length}, 输出 ${outputValues.length}`,
      details: {
        inputCount: inputValues.length,
        outputCount: outputValues.length,
        inputTokens: inputValues.slice(0, 20),
        outputTokens: outputValues.slice(0, 20)
      }
    }
  }

  // 逐个比较 token，输出中可能多出逗号，需要跳过
  let inputIdx = 0
  let outputIdx = 0

  while (inputIdx < inputValues.length && outputIdx < outputValues.length) {
    if (inputValues[inputIdx] === outputValues[outputIdx]) {
      // 匹配成功，继续下一个
      inputIdx++
      outputIdx++
    } else if (outputValues[outputIdx] === ',') {
      // 输出中多出的逗号（尾随逗号），跳过
      outputIdx++
    } else {
      // 真正的不匹配
      return {
        success: false,
        message: `Token 不匹配 @ input[${inputIdx}]/output[${outputIdx}]: 输入 "${inputValues[inputIdx]}", 输出 "${outputValues[outputIdx]}"`,
        details: {
          inputIndex: inputIdx,
          outputIndex: outputIdx,
          inputToken: inputTokens[inputIdx],
          outputToken: outputTokens[outputIdx],
          context: {
            inputBefore: inputValues.slice(Math.max(0, inputIdx - 3), inputIdx),
            inputAfter: inputValues.slice(inputIdx, inputIdx + 5),
            outputBefore: outputValues.slice(Math.max(0, outputIdx - 3), outputIdx),
            outputAfter: outputValues.slice(outputIdx, outputIdx + 5)
          }
        }
      }
    }
  }

  // 检查输入是否全部匹配完成
  if (inputIdx < inputValues.length) {
    return {
      success: false,
      message: `输入未完全匹配: 剩余 ${inputValues.length - inputIdx} 个 token`,
      details: {
        remainingInput: inputValues.slice(inputIdx, inputIdx + 10)
      }
    }
  }

  return { success: true, message: 'Token 序列匹配成功' }
}

// ============================================
// 测试配置
// ============================================

// 使用 Babel 测试目录（与 stage1 一致）
const casesDir = path.join(__dirname, 'tests/babel')
const files = getAllJsFiles(casesDir).sort()

// 支持从指定位置开始测试
// 用法: npx tsx test-stage3-codegen.ts [startIndex]
const startIndex = parseInt(process.argv[2] || '0', 10)

if (startIndex > 0) {
  console.log(`📍 从第 ${startIndex + 1} 个文件开始测试 (跳过前 ${startIndex} 个)`)
}
console.log(`🧪 阶段3: 代码生成测试 (${files.length} 个用例，测试 ${files.length - startIndex} 个)`)
console.log('测试范围: AST → JavaScript代码')
console.log('验证方式: 比较输入/输出代码的 token 序列\n')

// ============================================
// 测试执行
// ============================================

let passCount = 0
let failCount = 0
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

  console.log(`\n[${i + 1}] 测试: ${testName} (${parseMode} 模式)`)
  console.log('='.repeat(60))

  try {
    // 阶段1-2: 输入代码 → AST
    const parser = new SlimeParser(code)
    const cst = parser.Program(parseMode)
    const inputTokens = parser.parsedTokens
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)

    // 阶段3: AST → 输出代码
    const result = SlimeGenerator.generator(ast, inputTokens)
    const generatedCode = result.code

    // 阶段4: 输出代码 → tokens（用于验证）
    const outputParser = new SlimeParser(generatedCode)
    outputParser.Program(parseMode)
    const outputTokens = outputParser.parsedTokens

    // 比较 token 序列
    const comparison = compareTokenSequences(inputTokens, outputTokens)

    if (comparison.success) {
      console.log(`✅ 通过 (${inputTokens.length} tokens)`)
      passCount++
    } else {
      console.log(`❌ 失败: ${comparison.message}`)
      console.log('\n--- 输入代码 ---')
      console.log(code)
      console.log('\n--- 生成代码 ---')
      console.log(generatedCode)
      console.log('\n--- 输入 tokens ---')
      console.log(extractTokenValues(inputTokens).join(' '))
      console.log('\n--- 输出 tokens ---')
      console.log(extractTokenValues(outputTokens).join(' '))

      if (comparison.details) {
        console.log('\n--- 详细信息 ---')
        console.log(JSON.stringify(comparison.details, null, 2))
      }

      console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
      console.log(`当前进度: ${passCount}/${files.length} 通过 (跳过 ${skipped} 个)\n`)
      process.exit(1)
    }

  } catch (error: any) {
    console.log(`❌ 异常: ${error.message}`)
    console.log('\n--- 输入代码 ---')
    console.log(code)
    console.log('\n--- 错误栈 ---')
    console.log(error.stack)

    console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
    console.log(`当前进度: ${passCount}/${files.length} 通过 (跳过 ${skipped} 个)\n`)
    process.exit(1)
  }
}

// ============================================
// 测试结果汇总
// ============================================

console.log('\n' + '='.repeat(60))
console.log('📊 测试结果汇总')
console.log('='.repeat(60))
console.log(`通过: ${passCount}/${files.length}`)
console.log(`跳过: ${skipped}/${files.length}`)
console.log(`\n🎉 阶段3测试全部通过!`)
