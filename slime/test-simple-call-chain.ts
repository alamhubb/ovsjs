// 测试简单的函数调用链（不含箭头函数）
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const testCases = [
  'obj.method1().method2()',
  'obj.catch().then()',
  'Promise.all([]).then().catch()',
]

testCases.forEach(code => {
  console.log(`\n测试: ${code}`)
  
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const parserAny = parser as any
  console.log(`  Tokens: ${parserAny.tokenIndex}/${tokens.length}`)
  
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  const result = SlimeGenerator.generator(ast, tokens)
  console.log(`  生成: ${result.code}`)
})

