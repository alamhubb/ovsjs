import OvsCstToSlimeAstUtil from './src/factory/OvsCstToSlimeAstUtil'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import { ovs6Tokens } from './src/parser/OvsConsumer'
import OvsTokenConsumer from './src/parser/OvsConsumer'
import OvsParser from './src/parser/OvsParser'

const ovsCode = `div { "Hello" }`

const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(ovsCode)
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()

// 手动调用转换，看看会发生什么
const ast = OvsCstToSlimeAstUtil.toProgram(cst)

console.log('生成的AST:')
console.log(JSON.stringify(ast, null, 2))

















