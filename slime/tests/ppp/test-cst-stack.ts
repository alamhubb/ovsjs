import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

const code = `let x = 1;`

const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens:', tokens.map(t => t.tokenValue).join(' '))

const parser = new Es6Parser(tokens)

console.log('\n=== Parser 初始状态 ===')
console.log('cstStack:', parser.cstStack)
console.log('ruleStack:', parser.ruleStack)
console.log('curCst:', parser.curCst)

console.log('\n=== 调用 Program ===')
const result = parser.Program()

console.log('\n=== Parser 调用后状态 ===')
console.log('cstStack:', parser.cstStack)
console.log('ruleStack:', parser.ruleStack)
console.log('curCst:', parser.curCst)
console.log('result:', result)
console.log('result === parser.curCst:', result === parser.curCst)

if (result) {
  console.log('\nresult.name:', result.name)
  console.log('result.children:', result.children?.length)
}



