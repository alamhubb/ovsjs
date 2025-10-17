// 诊断多元加法表达式问题
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as util from 'util'

const code = `x + y + z`

console.log('输入代码:', code)
console.log('\n' + '='.repeat(60))

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

// 找到AdditiveExpression节点
function findNode(node: any, targetName: string): any {
  if (node.name === targetName) {
    return node
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, targetName)
      if (found) return found
    }
  }
  return null
}

const addExpr = findNode(cst, 'AdditiveExpression')
console.log('\n1. AdditiveExpression CST children数量:', addExpr?.children?.length)
console.log('   Children names:', addExpr?.children?.map((c: any) => c.name).join(', '))

const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

console.log('\n2. AST结构（BinaryExpression）:')
const expr = (ast.body[0] as any).expression
console.log('   Type:', expr.type)
console.log('   Operator:', expr.operator)
console.log('   Left:', expr.left?.type, expr.left?.name || '')
console.log('   Right:', expr.right?.type, expr.right?.name || '')

// 检查是否有嵌套的BinaryExpression
if (expr.left?.type === 'BinaryExpression') {
  console.log('   Left is BinaryExpression:')
  console.log('     Left.left:', expr.left.left?.name)
  console.log('     Left.operator:', expr.left.operator)
  console.log('     Left.right:', expr.left.right?.name)
} else if (expr.right?.type === 'BinaryExpression') {
  console.log('   Right is BinaryExpression:')
  console.log('     Right.left:', expr.right.left?.name)
  console.log('     Right.operator:', expr.right.operator)
  console.log('     Right.right:', expr.right.right?.name)
}

const result = SlimeGenerator.generator(ast, tokens)

console.log('\n3. 生成代码:', result.code)
console.log('\n' + '='.repeat(60))
console.log('问题分析:')
if (result.code.includes('x') && result.code.includes('y') && result.code.includes('z')) {
  console.log('✅ 所有变量都在输出中')
  const plusCount = (result.code.match(/\+/g) || []).length
  console.log(`   加号数量: ${plusCount} (期望: 2)`)
  if (plusCount === 2) {
    console.log('✅ 加号数量正确')
  } else {
    console.log('❌ 加号数量不对')
  }
} else {
  console.log('❌ 某些变量丢失！')
  if (!result.code.includes('z')) {
    console.log('   丢失: z')
  }
}

