import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const x = 42`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('=== 查找所有叶子节点 ===\n')

function findLeafNodes(node: any, path: string = 'root'): void {
  // 如果没有children或children为空，就是叶子节点
  if (!node.children || node.children.length === 0) {
    console.log(`路径: ${path}`)
    console.log(`  节点类型: ${typeof node}`)
    console.log(`  是否有name: ${node.name !== undefined}`)
    console.log(`  name值: ${node.name}`)
    console.log(`  是否有tokenName: ${node.tokenName !== undefined}`)
    console.log(`  tokenName值: ${node.tokenName}`)
    console.log(`  是否有tokenValue: ${node.tokenValue !== undefined}`)
    console.log(`  tokenValue值: ${node.tokenValue}`)
    console.log(`  所有属性:`, Object.keys(node))
    console.log(`  完整对象:`, node)
    console.log('')
    return
  }
  
  // 递归处理子节点
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      const childPath = `${path} > ${child.name || child.tokenName || '?'}[${i}]`
      findLeafNodes(child, childPath)
    }
  }
}

findLeafNodes(cst)

