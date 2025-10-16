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

console.log('== GeneratorExpression ==')
const gens = findNodes(cst, 'GeneratorExpression')
console.log(`count=${gens.length}`)
if (gens[0]) console.log(JSON.stringify(brief(gens[0]), null, 2))

console.log('\n== MemberExpression ==')
const mems = findNodes(cst, 'MemberExpression')
console.log(`count=${mems.length}`)
if (mems[0]) console.log(JSON.stringify(brief(mems[0]), null, 2))

console.log('\n== PropertyDefinition ==')
const props = findNodes(cst, 'PropertyDefinition')
console.log(`count=${props.length}`)
if (props[0]) console.log(JSON.stringify(brief(props[0]), null, 2))

console.log('\n== PropertyName ==')
const pnames = findNodes(cst, 'PropertyName')
console.log(`count=${pnames.length}`)
if (pnames[0]) console.log(JSON.stringify(brief(pnames[0]), null, 2))

console.log('\n== DotIdentifier ==')
const dots = findNodes(cst, 'DotIdentifier')
console.log(`count=${dots.length}`)
if (dots[0]) {
  console.log('Full node:')
  console.log(JSON.stringify(dots[0], null, 2))
}
