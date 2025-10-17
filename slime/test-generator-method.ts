// 测试generator方法*号
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const code = `class Test {
  *getUsers() {
    yield 1
  }
}`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

const result = SlimeGenerator.generator(ast, tokens)
console.log('生成代码:')
console.log(result.code)
console.log()
console.log('期望包含: *getUsers()')
console.log('是否正确:', result.code.includes('*getUsers()'))

