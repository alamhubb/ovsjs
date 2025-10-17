// 列出CST中所有节点类型
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `obj.a.b.c`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

// 收集所有节点名
const nodeNames = new Set<string>()

function collectNames(node: any) {
  if (node.name) {
    nodeNames.add(node.name)
  }
  if (node.children) {
    node.children.forEach((child: any) => collectNames(child))
  }
}

collectNames(cst)

console.log('CST中所有节点类型:')
Array.from(nodeNames).sort().forEach(name => console.log(`  - ${name}`))

// 查找包含Member或Call的节点
console.log('\n包含Member/Call的节点:')
Array.from(nodeNames).filter(n => n.includes('Member') || n.includes('Call')).forEach(name => {
  console.log(`  - ${name}`)
  const node = findNode(cst, name)
  if (node) {
    console.log(`    children数量: ${node.children?.length || 0}`)
  }
})

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

