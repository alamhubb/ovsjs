import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const test = [b, a + b]`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

function printCst(cst: any, indent = '', maxDepth = 10) {
  if (maxDepth === 0) {
    console.log(indent + '...(max depth)')
    return
  }
  console.log(indent + 'name:', cst.name || cst.type || cst.value || '(token)')
  if (cst.value !== undefined && !cst.children) {
    console.log(indent + 'value:', cst.value)
  }
  if (cst.children && cst.children.length > 0) {
    console.log(indent + 'children:', cst.children.length)
    cst.children.forEach((child: any, idx: number) => {
      console.log(indent + `[${idx}]:`)
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
  
  // 找到所有AdditiveExpression节点
  console.log('=== 查找所有 AdditiveExpression ===\n')
  
  function findAllNodes(node: any, targetName: string, results: any[] = []): any[] {
    if (node.name === targetName) {
      results.push(node)
    }
    if (node.children) {
      for (const child of node.children) {
        findAllNodes(child, targetName, results)
      }
    }
    return results
  }
  
  const additiveExprs = findAllNodes(cst, 'AdditiveExpression')
  console.log(`找到 ${additiveExprs.length} 个 AdditiveExpression:`)
  
  additiveExprs.forEach((expr, idx) => {
    console.log(`\n=== AdditiveExpression #${idx + 1} ===`)
    printCst(expr, '  ', 3)
  })

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}

