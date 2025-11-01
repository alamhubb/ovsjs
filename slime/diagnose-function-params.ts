import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `function add(a, b) {
  return a + b
}`

console.log('=== 测试代码 ===')
console.log(code)
console.log('')

try {
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ ${tokens.length} tokens`)

  // 2. 语法分析
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  console.log(`✅ CST生成`)
  
  // 查找FormalParameterList
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
  
  const formalParams = findNode(cst, 'FormalParameterList')
  
  if (formalParams) {
    console.log('\n=== FormalParameterList ===')
    console.log('name:', formalParams.name)
    console.log('children数量:', formalParams.children?.length)
    console.log('\nchildren详情:')
    formalParams.children?.forEach((child: any, idx: number) => {
      console.log(`  [${idx}]:`)
      console.log(`    type: ${typeof child}`)
      console.log(`    is null: ${child === null}`)
      console.log(`    is undefined: ${child === undefined}`)
      if (child) {
        console.log(`    name: ${child.name}`)
        console.log(`    value: ${child.value}`)
      }
    })
    
    // 检查Es6Parser.prototype的属性
    console.log('\n=== Es6Parser.prototype 检查 ===')
    console.log('FormalParameter:', Es6Parser.prototype.FormalParameter)
    console.log('FormalParameter.name:', Es6Parser.prototype.FormalParameter?.name)
    console.log('RestParameter:', Es6Parser.prototype.RestParameter)
    console.log('RestParameter.name:', Es6Parser.prototype.RestParameter?.name)
  } else {
    console.log('未找到 FormalParameterList')
  }

} catch (error: any) {
  console.error('❌ 错误:', error.message)
  console.error('Stack:', error.stack)
}


