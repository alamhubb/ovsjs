import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import * as util from 'util'

const code = `const test = a + b`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

function printCst(cst: any, indent = '') {
  console.log(indent + 'name:', cst.name || cst.type || cst.value || '(token)')
  if (cst.value !== undefined && !cst.children) {
    console.log(indent + 'value:', cst.value)
  }
  if (cst.children && cst.children.length > 0) {
    console.log(indent + 'children:', cst.children.length)
    cst.children.forEach((child: any, idx: number) => {
      console.log(indent + `[${idx}]:`)
      printCst(child, indent + '  ')
    })
  }
}

try {
  // 1. 词法分析
  console.log('1. 词法分析...')
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ 生成 ${tokens.length} 个tokens`)
  console.log('')

  // 2. 语法分析
  console.log('2. 语法分析...')
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  console.log('✅ CST生成成功')
  console.log('')
  
  // 找到AdditiveExpression节点
  console.log('=== 查找 AdditiveExpression ===')
  
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
  
  const additiveExpr = findNode(cst, 'AdditiveExpression')
  if (additiveExpr) {
    console.log('找到 AdditiveExpression:')
    printCst(additiveExpr, '  ')
  } else {
    console.log('未找到 AdditiveExpression')
  }

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}


