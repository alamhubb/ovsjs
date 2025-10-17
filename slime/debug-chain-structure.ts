// 查看链式结构（不用JSON.stringify）
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'

const code = `obj.a.b`

console.log('测试代码:', code)

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

const expr = (ast.body[0] as any).expression

function printNode(node: any, depth = 0) {
  const indent = '  '.repeat(depth)
  console.log(`${indent}${node.type}`)
  if (node.type === 'MemberExpression') {
    console.log(`${indent}  object:`)
    printNode(node.object, depth + 2)
    console.log(`${indent}  property: ${node.property?.name || '?'}`)
  } else if (node.type === 'Identifier') {
    console.log(`${indent}  name: ${node.name}`)
  }
}

console.log('\nAST结构:')
printNode(expr)

