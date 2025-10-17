// 对比无参数和有参数的CST
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const testCases = [
  {name: '无参数（成功）', code: 'obj.method1().method2()'},
  {name: '有参数（失败）', code: 'func(1).then().catch()'},
]

testCases.forEach(({name, code}) => {
  console.log(`\n=== ${name}: ${code} ===`)
  
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
  if (callExpr) {
    console.log('CallExpression children数量:', callExpr.children.length)
    callExpr.children.forEach((child: any, i: number) => {
      console.log(`  [${i}] ${child.name || child.value}`)
    })
  }
  
  const parserAny = parser as any
  console.log(`已消费Tokens: ${parserAny.tokenIndex}/${tokens.length}`)
})

