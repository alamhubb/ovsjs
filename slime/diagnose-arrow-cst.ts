import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const add = (a, b) => a + b`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens ===')
tokens.forEach((t: any, i) => {
  console.log(`[${i}] ${t.tokenName} = "${t.tokenValue}"`)
})
console.log(`总计: ${tokens.length} tokens\n`)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('=== CST完整结构（深度10） ===\n')

function printCST(node: any, indent = '', maxDepth = 50) {
  if (maxDepth === 0) {
    console.log(indent + '...(深度限制)')
    return
  }
  
  if (node.value !== undefined && (!node.children || node.children.length === 0)) {
    console.log(indent + `LEAF: ${node.name} = "${node.value}"`)
  } else if (node.name) {
    console.log(indent + `NODE: ${node.name}`)
  }
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      printCST(child, indent + '  ', maxDepth - 1)
    }
  }
}

printCST(cst)

console.log('\n=== 收集CST中的token值 ===')

function collectTokens(node: any): string[] {
  const values: string[] = []
  
  if (node.value !== undefined && (!node.children || node.children.length === 0)) {
    values.push(node.value)
  }
  
  if (node.children) {
    for (const child of node.children) {
      values.push(...collectTokens(child))
    }
  }
  
  return values
}

const cstTokens = collectTokens(cst)
const inputTokens = tokens.map((t: any) => t.tokenValue)

console.log('输入tokens:', inputTokens)
console.log('CST tokens:', cstTokens)
console.log('\n丢失的tokens:')
const missing = inputTokens.filter(t => !cstTokens.includes(t))
console.log(missing)

