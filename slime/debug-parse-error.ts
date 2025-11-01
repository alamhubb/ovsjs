import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

const code = `
class D {
  constructor(name) {
    this.name = name
  }
}
`.trim()

console.log('代码:', code)
console.log('\n=== 词法分析 ===')

try {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  
  console.log(`生成 ${tokens.length} 个 tokens:`)
  tokens.forEach((t, i) => {
    console.log(`  [${i}] ${t.tokenName}: "${t.value}"`)
  })

  console.log('\n=== 语法分析 ===')
  
  // 设置更详细的错误处理
  const parser = new Es6Parser(tokens)
  
  // 尝试捕获更详细的错误信息
  try {
    const cst = parser.Program()
    console.log('CST children:', cst.children?.length)
    if (cst.children && cst.children.length > 0) {
      console.log('CST 第一个child:', cst.children[0].name)
    } else {
      console.log('⚠️ CST children 为空！')
    }
  } catch (parseError) {
    console.error('❌ Parser错误:', parseError)
    throw parseError
  }

} catch (error) {
  console.error('\n❌ 总体错误:', error)
  if (error instanceof Error) {
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
  }
}

