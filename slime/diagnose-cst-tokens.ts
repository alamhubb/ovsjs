import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const x = 42`

console.log('=== 代码 ===')
console.log(code)
console.log('')

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('=== Tokens ===')
tokens.forEach((t: any, i) => {
  console.log(`[${i}] ${t.tokenName} = "${t.tokenValue}"`)
})

const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('\n=== CST完整结构 ===')

function printCST(node: any, indent = '', maxDepth = 30) {
  if (maxDepth === 0) {
    console.log(indent + '...(深度限制)')
    return
  }
  
  if (node.tokenValue !== undefined) {
    console.log(indent + `TOKEN: ${node.tokenName} = "${node.tokenValue}"`)
  } else if (node.name) {
    console.log(indent + `NODE: ${node.name}`)
  } else {
    console.log(indent + `UNKNOWN`)
  }
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      printCST(child, indent + '  ', maxDepth - 1)
    }
  }
}

printCST(cst)

console.log('\n=== 收集CST中的token值 ===')

function collectTokenValues(node: any): string[] {
  const values: string[] = []
  
  if (node.tokenValue !== undefined) {
    values.push(node.tokenValue)
  }
  
  if (node.children) {
    for (const child of node.children) {
      values.push(...collectTokenValues(child))
    }
  }
  
  return values
}

const cstTokens = collectTokenValues(cst)
console.log('CST中的token值:', cstTokens)
console.log('总数:', cstTokens.length)

const inputTokens = tokens.map((t: any) => t.tokenValue)
console.log('\n输入的token值:', inputTokens)
console.log('总数:', inputTokens.length)

console.log('\n比较:')
console.log('是否相等:', JSON.stringify(cstTokens) === JSON.stringify(inputTokens))

