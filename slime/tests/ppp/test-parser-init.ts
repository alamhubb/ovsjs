import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `Math`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.length, 'tokens generated')

console.log('\n=== 创建 Parser ===')
const parser = new Es6Parser(tokens)

console.log('parser:', parser)
console.log('parser.tokens:', parser.tokens)
console.log('parser.curTokenIndex:', parser.curTokenIndex)
console.log('parser.tokenConsumer:', parser.tokenConsumer)
console.log('parser.tokenConsumer.tokens:', parser.tokenConsumer?.tokens)
console.log('parser.tokenConsumer.curTokenIndex:', parser.tokenConsumer?.curTokenIndex)

// 检查是否有私有属性
console.log('\n=== Parser 的所有属性 ===')
console.log(Object.keys(parser))
console.log(Object.getOwnPropertyNames(parser))




