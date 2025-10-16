import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const file = process.argv[2]
if (!file) {
  console.log('usage: npx tsx dump-cst.ts <file>')
  process.exit(1)
}

const code = readFileSync(file, 'utf-8')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
const parser = new Es6Parser(tokens)
const cst = parser.Program()

function findNodes(node: any, name: string, acc: any[] = []): any[] {
  if (!node) return acc
  if (node.name === name) acc.push(node)
  if (Array.isArray(node.children)) {
    for (const child of node.children) findNodes(child, name, acc)
  }
  return acc
}

function brief(node: any) {
  return {
    name: node.name,
    value: node.value,
    children: (node.children || []).map((ch: any) => ({ name: ch.name, value: ch.value }))
  }
}

console.log('== UnaryExpression ==')
const unary = findNodes(cst, 'UnaryExpression')
console.log(`count=${unary.length}`)
for (let i = 0; i < Math.min(unary.length, 3); i++) {
  console.log(`\n第${i+1}个UnaryExpression:`)
  console.log(JSON.stringify(unary[i], null, 2))
}
