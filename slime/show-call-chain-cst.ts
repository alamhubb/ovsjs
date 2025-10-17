// 查看函数调用链的CST
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `obj.a().b()`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

function findNode(node: any, targetName: string): any {
  if (node.name === targetName) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, targetName)
      if (found) return found
    }
  }
  return null
}

const callExpr = findNode(cst, 'CallExpression')
const memberExpr = findNode(cst, 'MemberExpression')

if (callExpr) {
  console.log('找到CallExpression:')
  console.log('children数量:', callExpr.children.length)
  callExpr.children.forEach((child: any, i: number) => {
    console.log(`  [${i}] ${child.name}`)
  })
}

if (memberExpr) {
  console.log('\n找到MemberExpression:')
  console.log('children数量:', memberExpr.children.length)
  memberExpr.children.forEach((child: any, i: number) => {
    console.log(`  [${i}] ${child.name}`)
  })
}

