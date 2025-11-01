import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const test = [b, a + b]`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

function printCst(cst: any, indent = '', maxDepth = 20) {
  if (maxDepth === 0) {
    console.log(indent + '...(max depth)')
    return
  }
  
  const name = cst.name || cst.type || (cst.value !== undefined ? `TOKEN(${cst.value})` : '(unknown)')
  console.log(indent + name)
  
  if (cst.children && cst.children.length > 0) {
    cst.children.forEach((child: any) => {
      printCst(child, indent + '  ', maxDepth - 1)
    })
  }
}

try {
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)

  // 2. 语法分析
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  // 找到ArrayLiteral
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
  
  const arrayLiteral = findNode(cst, 'ArrayLiteral')
  
  if (arrayLiteral) {
    console.log('=== ArrayLiteral CST结构 ===\n')
    printCst(arrayLiteral, '')
  } else {
    console.log('未找到 ArrayLiteral')
  }

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}


