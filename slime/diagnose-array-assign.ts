import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as util from 'util'

const code = `let a = 0, b = 1
;[a, b] = [b, a + b]`

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
  console.log('AST body数量:', ast.body.length)
  
  // 检查第二个语句(赋值表达式)
  const assignExpr: any = ast.body[1]
  console.log('\nAssignmentExpression:')
  console.log('  type:', assignExpr.type)
  console.log('  expression:', assignExpr.expression)
  
  if (assignExpr.expression) {
    console.log('\n  expression.right (应该是数组):')
    console.log('  type:', assignExpr.expression.right?.type)
    console.log('  elements:', assignExpr.expression.right?.elements?.length)
    
    if (assignExpr.expression.right?.elements) {
      assignExpr.expression.right.elements.forEach((elem: any, idx: number) => {
        console.log(`\n  Element ${idx}:`)
        console.log('    type:', elem.type)
        if (elem.type === 'BinaryExpression') {
          console.log('    operator:', elem.operator, '(type:', typeof elem.operator, ')')
          console.log('    operator === undefined:', elem.operator === undefined)
        }
        console.log('    full:', util.inspect(elem, {depth: 3, colors: true}))
      })
    }
  }
  
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

