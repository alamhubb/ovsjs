// 显示MemberExpression的children详情
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `obj.a.b.c`

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

const memberExpr = findNode(cst, 'MemberExpression')

console.log('MemberExpression children (共4个):')
memberExpr.children.forEach((child: any, i: number) => {
  console.log(`\n[${i}] ${child.name}`)
  if (child.children) {
    console.log('  children:')
    child.children.forEach((c: any) => {
      console.log(`    - ${c.name || c.value}`)
    })
  } else if (child.value) {
    console.log(`  value: "${child.value}"`)
  }
})

