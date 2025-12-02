/**
 * 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 验证方式: 比较输入代码和输出代码的 token 序列是否一致
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 * 
 * 用法:
 *   npx tsx slime/test-stage3.ts              # 从头开始测试
 *   npx tsx slime/test-stage3.ts 100          # 从第100个开始
 *   npx tsx slime/test-stage3.ts 100 -s       # 从第100个开始，遇错停止
 */
import SlimeParser from './packages/slime-parser/src/language/es2025/SlimeParser'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator'
import SubhutiMatchToken from 'subhuti/src/struct/SubhutiMatchToken'
import { runTests, TestContext, TestResult } from './test-runner'

// ============================================
// Token 比较工具
// ============================================

function extractTokenValues(tokens: SubhutiMatchToken[]): string[] {
  return tokens.map(t => t.tokenValue).filter(v => v !== ';')
}

function compareTokens(inputTokens: SubhutiMatchToken[], outputTokens: SubhutiMatchToken[]): TestResult {
  const inputValues = extractTokenValues(inputTokens)
  const outputValues = extractTokenValues(outputTokens)
  
  let inputIdx = 0, outputIdx = 0
  
  while (inputIdx < inputValues.length && outputIdx < outputValues.length) {
    if (inputValues[inputIdx] === outputValues[outputIdx]) {
      inputIdx++; outputIdx++
    } else if (outputValues[outputIdx] === ',' && isTrailingComma(outputValues, outputIdx)) {
      outputIdx++ // 跳过输出中的 trailing comma
    } else if (inputValues[inputIdx] === ',' && isTrailingComma(inputValues, inputIdx)) {
      inputIdx++ // 跳过输入中的 trailing comma
    } else {
      return {
        success: false,
        message: `Token不匹配 @ [${inputIdx}]: "${inputValues[inputIdx]}" vs "${outputValues[outputIdx]}"`,
        details: `  输入: ...${inputValues.slice(Math.max(0, inputIdx-2), inputIdx+3).join(' ')}...\n` +
                 `  输出: ...${outputValues.slice(Math.max(0, outputIdx-2), outputIdx+3).join(' ')}...`
      }
    }
  }
  
  // 处理剩余 tokens
  while (inputIdx < inputValues.length && inputValues[inputIdx] === ',' && isTrailingComma(inputValues, inputIdx)) {
    inputIdx++
  }
  while (outputIdx < outputValues.length && outputValues[outputIdx] === ',' && isTrailingComma(outputValues, outputIdx)) {
    outputIdx++
  }
  
  if (inputIdx !== inputValues.length || outputIdx !== outputValues.length) {
    return {
      success: false,
      message: `Token数量不匹配: 输入剩余${inputValues.length - inputIdx}, 输出剩余${outputValues.length - outputIdx}`
    }
  }
  
  return { success: true, message: `${inputTokens.length} tokens` }
}

function isTrailingComma(values: string[], idx: number): boolean {
  return idx + 1 >= values.length || [')', ']', '}'].includes(values[idx + 1])
}

// ============================================
// 阶段3测试逻辑
// ============================================

function testStage3(ctx: TestContext): TestResult {
  // 阶段1: 解析输入代码
  const parser = new SlimeParser(ctx.code)
  const cst = parser.Program(ctx.parseMode)
  const inputTokens = parser.parsedTokens
  
  // 阶段2: CST → AST
  const converter = new SlimeCstToAst()
  const ast = converter.toProgram(cst)
  
  // 阶段3: AST → 代码
  const result = SlimeGenerator.generator(ast, inputTokens)
  const generatedCode = result.code
  
  // 阶段4: 重新解析生成的代码
  const outputParser = new SlimeParser(generatedCode)
  outputParser.Program(ctx.parseMode)
  const outputTokens = outputParser.parsedTokens
  
  // 比较 token 序列
  return compareTokens(inputTokens, outputTokens)
}

// 运行测试
// 注：如需单独配置，可添加 startFrom 和 stopOnFail 参数覆盖通用配置
runTests(testStage3, {
  stageName: '阶段3: 代码生成测试',
  description: 'AST → JavaScript代码，比较输入/输出的 token 序列',
  startFrom: 2190,      // 取消注释可覆盖通用配置
  stopOnFail: false,   // 取消注释可覆盖通用配置
})

