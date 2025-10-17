// 测试链式调用修复
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const testCases = [
  {code: 'obj.a.b.c', expected: 'obj.a.b.c'},
  {code: 'obj.a().b()', expected: 'obj.a().b()'},
  {code: 'func().then(x => x)', expected: 'func().then'},
  {code: 'func().then(x => x).catch(e => e)', expected: 'func().then'},
]

testCases.forEach(({code, expected}) => {
  console.log(`\n测试: ${code}`)
  
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  const result = SlimeGenerator.generator(ast, tokens)
  const includes = result.code.includes(expected)
  console.log(`  生成: ${result.code}`)
  console.log(`  期望包含: ${expected}`)
  console.log(`  结果: ${includes ? '✅ 通过' : '❌ 失败'}`)
})

