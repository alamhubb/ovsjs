/**
 * 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 验证方式: 比较输入代码和输出代码的 token 序列是否一致
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 */
import Es2025Parser from './packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'
import {es2025Tokens} from "slime-parser/src/language/es2025/SlimeTokensName";
import SubhutiMatchToken from 'subhuti/src/struct/SubhutiMatchToken.ts'

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

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

// 命令行参数
const args = process.argv.slice(2)
const verboseMode = args.includes('-v') || args.includes('--verbose')
const stopOnFirstError = !args.includes('--continue')
const filterPattern = args.find(a => !a.startsWith('-'))

// 过滤测试用例
const filteredFiles = filterPattern
  ? files.filter(f => f.includes(filterPattern))
  : files

console.log(`🧪 阶段3: 代码生成测试 (${filteredFiles.length} 个用例)`)
console.log('测试范围: AST → JavaScript代码')
console.log('验证方式: 比较输入/输出代码的 token 序列\n')

if (verboseMode) {
  console.log('📝 详细模式已启用')
}
if (!stopOnFirstError) {
  console.log('📝 继续模式：遇到错误不停止')
}
console.log()

// ============================================
// 测试执行
// ============================================

let passCount = 0
let failCount = 0
const failures: { name: string; error: any }[] = []

for (let i = 0; i < filteredFiles.length; i++) {
  const file = filteredFiles[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`[${i + 1}] 测试: ${testName}`)

  try {
    // 阶段1-2: 输入代码 → AST
    const lexer = new SubhutiLexer(es2025Tokens)
    const inputTokens = lexer.tokenize(code)
    const parser = new Es2025Parser(inputTokens)
    const cst = parser.Program()
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)

    // 阶段3: AST → 输出代码
    const result = SlimeGenerator.generator(ast, inputTokens)
    const generatedCode = result.code

    // 阶段4: 输出代码 → tokens（用于验证）
    const outputLexer = new SubhutiLexer(es2025Tokens)
    const outputTokens = outputLexer.tokenize(generatedCode)

    // 比较 token 序列
    const comparison = compareTokenSequences(inputTokens, outputTokens)

    if (comparison.success) {
      console.log(`  ✅ 通过 (${inputTokens.length} tokens)`)
      passCount++

      if (verboseMode) {
        console.log(`     输入: ${code.substring(0, 50).replace(/\n/g, ' ')}...`)
        console.log(`     输出: ${generatedCode.substring(0, 50).replace(/\n/g, ' ')}...`)
      }
    } else {
      console.log(`  ❌ 失败: ${comparison.message}`)
      failCount++

      if (verboseMode || stopOnFirstError) {
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
      }

      failures.push({ name: testName, error: comparison })

      if (stopOnFirstError) {
        console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
        break
      }
    }

  } catch (error: any) {
    console.log(`  ❌ 异常: ${error.message}`)
    failCount++

    if (verboseMode || stopOnFirstError) {
      console.log('\n--- 输入代码 ---')
      console.log(code)
      console.log('\n--- 错误栈 ---')
      console.log(error.stack)
    }

    failures.push({ name: testName, error })

    if (stopOnFirstError) {
      console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
      break
    }
  }
}

// ============================================
// 测试结果汇总
// ============================================

console.log('\n' + '='.repeat(60))
console.log('📊 测试结果汇总')
console.log('='.repeat(60))
console.log(`通过: ${passCount}/${filteredFiles.length}`)
console.log(`失败: ${failCount}/${filteredFiles.length}`)

if (failures.length > 0) {
  console.log('\n❌ 失败的测试用例:')
  failures.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.name}`)
  })
  process.exit(1)
} else {
  console.log(`\n🎉 全部通过!`)
}


