import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'

const code = fs.readFileSync('tests/cases/45-generator.js', 'utf-8')

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

try {
  // 1. 词法分析
  console.log('1. 词法分析...')
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ 生成 ${tokens.length} 个tokens`)
  console.log('')

  // 2. 语法分析
  console.log('2. 语法分析...')
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  console.log('✅ CST生成成功')
  console.log('CST children数量:', cst.children.length)
  console.log('')

  // 3. CST -> AST
  console.log('3. CST -> AST...')
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log('✅ AST生成成功')
  console.log('AST body数量:', ast.body.length)
  console.log('AST body types:', ast.body.map((node: any) => node.type))
  console.log('')

  // 4. 代码生成
  console.log('4. 代码生成...')
  const result = SlimeGenerator.generator(ast, tokens)
  console.log('✅ 代码生成成功')
  console.log('')
  console.log('=== 生成代码 ===')
  console.log(result.code)

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}


