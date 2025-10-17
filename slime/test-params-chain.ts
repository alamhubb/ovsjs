// 测试带参数的链式调用
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const testCases = [
  'func(1).then().catch()',
  'func([]).then().catch()',
  'func([1]).then().catch()',
  'func([1,2]).then().catch()',
]

testCases.forEach(code => {
  console.log(`\n测试: ${code}`)
  
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const parserAny = parser as any
  const consumed = parserAny.tokenIndex
  const percent = ((consumed / tokens.length) * 100).toFixed(0)
  console.log(`  Tokens: ${consumed}/${tokens.length} (${percent}%)`)
  
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  const result = SlimeGenerator.generator(ast, tokens)
  const hasCatch = result.code.includes('.catch')
  console.log(`  生成: ${result.code}`)
  console.log(`  包含.catch: ${hasCatch ? '✅' : '❌'}`)
})

