import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `
1 + 2
`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log('=== Tokens:', tokens.length, '个')
tokens.forEach((t, i) => console.log(`  ${i}: ${t.tokenName} = "${t.tokenValue}"`))

const parser = new Es2020Parser(tokens)
const curCst = parser.Program()

console.log('\n=== 原始 CST（未清理）:')
console.log(JSON.stringify(curCst, (key, value) => {
  // 只序列化部分属性以便查看
  if (key === 'loc') return undefined
  if (key === 'tokens' && Array.isArray(value) && value.length > 0) {
    return `[${value.length} tokens]`
  }
  return value
}, 2))

