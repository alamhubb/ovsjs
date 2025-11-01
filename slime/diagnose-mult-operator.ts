import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const test = [b, a + b]`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

try {
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)

  console.log('所有tokens:')
  tokens.forEach((tok, idx) => {
    console.log(`  [${idx}] ${tok.type}: "${tok.value}"`)
  })
  console.log('')

  // 2. 语法分析
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  // 找到MultiplicativeOperator
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
  
  const multOp = findNode(cst, 'MultiplicativeOperator')
  
  if (multOp) {
    console.log('=== MultiplicativeOperator ===')
    console.log('name:', multOp.name)
    console.log('value:', multOp.value)
    console.log('children:', multOp.children ? multOp.children.length : 'none')
    if (multOp.children) {
      multOp.children.forEach((ch: any, idx: number) => {
        console.log(`  [${idx}]:`, ch.name || ch.type, '=', ch.value)
      })
    }
  } else {
    console.log('未找到 MultiplicativeOperator')
  }

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}

