// 测试async generator
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const code = `class Test {
  async *fetch() {
    yield 1
  }
}`

console.log('测试代码:', code)

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

const parserAny = parser as any
console.log('\n已消费tokens:', parserAny.tokenIndex, '/', tokens.length)

const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

console.log('AST body数量:', ast.body.length)

if (ast.body.length > 0) {
  const result = SlimeGenerator.generator(ast, tokens)
  console.log('\n生成代码:')
  console.log(result.code)
}

