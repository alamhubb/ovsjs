import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `const test = [b, a + b]`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

function printCst(cst: any, indent = '', maxDepth = 15) {
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
  
  // 找到AdditiveExpression包含 a+b 的那个
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
  
  // 找包含Plus token的那个
  const targetExpr = additiveExprs.find(expr => {
    if (expr.children) {
      return expr.children.some((ch: any) => {
        if (ch.name === 'Plus' || ch.value === '+') return true
        // 也可能在children中
        if (ch.children) {
          return ch.children.some((subCh: any) => subCh.name === 'Plus' || subCh.value === '+')
        }
        return false
      })
    }
    return false
  })
  
  if (targetExpr) {
    console.log('=== 包含 a + b 的 AdditiveExpression ===')
    printCst(targetExpr, '  ')
  } else {
    console.log('未找到包含 + 的 AdditiveExpression')
    console.log('\n所有 AdditiveExpression:')
    additiveExprs.forEach((expr, idx) => {
      console.log(`\n#${idx + 1}: children count = ${expr.children?.length}`)
    })
  }

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}

