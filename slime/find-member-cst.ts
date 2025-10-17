// 查找MemberExpression CST节点
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `obj.a.b.c`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

// 递归查找MemberExpression或MemberCallNewExpression节点
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

const memberCallNode = findNode(cst, 'MemberCallNewExpression')
if (memberCallNode) {
  console.log('找到MemberCallNewExpression:')
  console.log('children数量:', memberCallNode.children.length)
  console.log('\nchildren详情:')
  memberCallNode.children.forEach((child: any, i: number) => {
    console.log(`  ${i}: ${child.name || child.value} (${child.children?.length || 0} children)`)
    if (child.children && child.children.length < 5) {
      child.children.forEach((c: any) => {
        console.log(`    - ${c.name || c.value}`)
      })
    }
  })
} else {
  console.log('未找到MemberCallNewExpression节点')
}

