import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const code = `
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  
  greet() {
    return "Hello " + this.name
  }
}
`.trim()

console.log('=== 输入代码 ===')
console.log(code)
console.log('\n=== 1. 词法分析 ===')

try {
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ 词法分析成功，生成 ${tokens.length} 个 tokens`)

  console.log('\n=== 2. 语法分析 ===')
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  console.log('✅ 语法分析成功')
  console.log('CST children 数量:', cst.children?.length)

  console.log('\n=== 3. CST → AST 转换 ===')
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log('✅ AST 转换成功')
  console.log('AST body 长度:', ast.body?.length)
  console.log('AST body:', JSON.stringify(ast.body, null, 2))

  console.log('\n=== 4. 代码生成 ===')
  const result = SlimeGenerator.generator(ast, tokens)
  console.log('✅ 代码生成成功')
  console.log('生成代码:\n', result.code)
} catch (error) {
  console.error('\n❌ 错误:', error)
  if (error instanceof Error) {
    console.error('错误堆栈:', error.stack)
  }
}










