/**
 * OVS 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 验证方式: 生成代码能被重新解析（不比较 token，因为 OVS 语法转换后结构不同）
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 *
 * 用法:
 *   npx tsx ovs/tests/utils/test-stage3.ts              # 从头开始测试
 *   npx tsx ovs/tests/utils/test-stage3.ts 10           # 从第10个开始
 *   npx tsx ovs/tests/utils/test-stage3.ts 10 -s        # 从第10个开始，遇错停止
 */
import SlimeGenerator from 'slime-generator/src/SlimeGenerator'
import SlimeParser from 'slime-parser/src/language/es2025/SlimeParser'
import { TestContext, TestResult, parseToAstWithTokens, runTests } from '../../../slime/tests/utils/test-framework'
import OvsParser from '../../src/parser/OvsParser'
import { OvsCstToSlimeAst } from '../../src/factory/OvsCstToSlimeAstUtil'

// ============================================
// 阶段3测试逻辑
// ============================================

function testStage3(ctx: TestContext): TestResult {
  // 使用 OvsParser 解析 OVS 代码，生成 AST
  const { ast, tokens: inputTokens } = parseToAstWithTokens(ctx.code, ctx.parseMode, ctx.ParserClass, ctx.CstToAstClass)

  if (!ast) {
    return { success: false, message: 'AST 转换失败' }
  }

  // 阶段3: AST → JavaScript 代码
  const result = SlimeGenerator.generator(ast, inputTokens)
  const generatedCode = result.code

  if (!generatedCode || generatedCode.trim() === '') {
    return { success: false, message: '生成的代码为空' }
  }

  // 阶段4: 使用 SlimeParser（标准 JS Parser）重新解析生成的代码
  // 注意：不使用 OvsParser，因为生成的是标准 JavaScript
  try {
    const jsParser = new SlimeParser(generatedCode)
    const jsCst = jsParser.Program(ctx.parseMode)
    
    if (!jsCst) {
      return { 
        success: false, 
        message: '生成的代码无法被 JS Parser 解析',
        details: `生成的代码:\n${generatedCode.slice(0, 500)}${generatedCode.length > 500 ? '...' : ''}`
      }
    }
    
    return { 
      success: true, 
      message: `代码生成成功 (${generatedCode.length} 字符)` 
    }
  } catch (e: any) {
    return { 
      success: false, 
      message: `生成的代码解析失败: ${e.message}`,
      details: `生成的代码:\n${generatedCode.slice(0, 500)}${generatedCode.length > 500 ? '...' : ''}`
    }
  }
}

// 运行测试
runTests(testStage3, {
  stageName: 'OVS 阶段3: 代码生成测试',
  description: 'AST → JavaScript代码，验证生成的代码可被解析',
  ParserClass: OvsParser as any,
  CstToAstClass: OvsCstToSlimeAst,
  startFrom: 1,
  stopOnFail: true,
})

