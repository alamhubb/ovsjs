/**
 * 测试 css { } 表达式的解析和转换
 */
import OvsParser from '../src/parser/OvsParser.ts'
import OvsCstToSlimeAstUtil from '../src/factory/OvsCstToSlimeAstUtil.ts'
import { SlimeGenerator } from 'slime-generator'

const testCode = `
const baseStyle = css {
  colorRed,
  fontBold
}

const buttonClass = css {
  ...baseStyle,
  props.disabled && css { opacity60 }
}
`

console.log('=== 测试 css { } 表达式 ===')
console.log('输入代码:')
console.log(testCode)
console.log()

try {
  // 1. 解析
  const parser = new OvsParser(testCode)
  const cst = parser.Program()
  console.log('✅ 解析成功')
  console.log('Tokens 数量:', parser.parsedTokens.length)
  console.log()

  // 2. 转换为 AST
  const ast = OvsCstToSlimeAstUtil.toProgram(cst)
  console.log('✅ AST 转换成功')
  
  // 3. 检查 usedAtoms
  const usedAtoms = OvsCstToSlimeAstUtil.getUsedAtoms()
  console.log('使用的原子类:', Array.from(usedAtoms))
  console.log()

  // 4. 生成代码
  const result = SlimeGenerator.generator(ast, parser.parsedTokens)
  console.log('✅ 代码生成成功')
  console.log()
  console.log('输出代码:')
  console.log(result.code)
} catch (error: any) {
  console.log('❌ 错误:', error.message)
  console.log(error.stack)
}
