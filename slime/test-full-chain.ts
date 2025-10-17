// 测试完整链式调用
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const code = `func().then(x => x).catch(e => e)`

console.log('测试代码:', code)

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('总Tokens:', tokens.length)

const parser = new Es6Parser(tokens)
const cst = parser.Program()

const parserAny = parser as any
console.log('已消费Tokens:', parserAny.tokenIndex)

const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

const result = SlimeGenerator.generator(ast, tokens)
console.log('\n生成代码:')
console.log(result.code)
console.log('\n检查:')
console.log('包含.then:', result.code.includes('.then'))
console.log('包含.catch:', result.code.includes('.catch'))

