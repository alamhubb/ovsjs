import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'

const code = `const result = a + b`

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
  console.log('')

  // 3. CST -> AST
  console.log('3. CST -> AST...')
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log('✅ AST生成成功')
  
  // 检查AST中的BinaryExpression
  const varDecl: any = ast.body[0]
  const init: any = varDecl.declarations[0].init
  console.log('\nBinaryExpression AST:')
  console.log('  type:', init.type)
  console.log('  operator:', init.operator, '(type:', typeof init.operator, ')')
  console.log('  left:', init.left)
  console.log('  right:', init.right)

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}

