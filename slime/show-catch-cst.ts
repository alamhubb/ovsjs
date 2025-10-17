// 查看为何catch没有被解析
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `func().then(x => x).catch(e => e)`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('所有Tokens:')
tokens.forEach((t, i) => {
  console.log(`${i}: ${t.tokenName} = "${t.tokenValue}"`)
})

const parser = new Es6Parser(tokens)
const cst = parser.Program()

const parserAny = parser as any
console.log('\n已消费到index:', parserAny.tokenIndex)
console.log('停在token:', tokens[parserAny.tokenIndex]?.tokenName, '=', tokens[parserAny.tokenIndex]?.tokenValue)

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
  console.log('\nCallExpression children数量:', callExpr.children.length)
  callExpr.children.forEach((child: any, i: number) => {
    console.log(`  [${i}] ${child.name || child.value}`)
  })
}

