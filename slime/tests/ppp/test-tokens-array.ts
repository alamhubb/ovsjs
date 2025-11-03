import {es2020Tokens, es2020TokensObj} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import {es6TokensObj} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import {es5TokensObj} from "../../packages/slime-parser/src/language/es5/Es5Tokens";

console.log('=== 检查 Identifier token ===')
console.log('es5TokensObj.Identifier:', es5TokensObj.Identifier)
console.log('es6TokensObj.Identifier:', es6TokensObj.Identifier)
console.log('es2020TokensObj.Identifier:', es2020TokensObj.Identifier)

console.log('\n=== 检查 es2020Tokens 数组 ===')
console.log('es2020Tokens.length:', es2020Tokens.length)

const identifierToken = es2020Tokens.find(t => t.name === 'Identifier')
console.log('Identifier token in array:', identifierToken)

// 列出前20个 tokens
console.log('\n=== 前20个 tokens ===')
es2020Tokens.slice(0, 20).forEach((t, i) => {
  console.log(`${i}: ${t.name} ${t.isKeyword ? `(keyword: ${t.value})` : ''}`)
})

// 查找所有包含"Identifier"的token
console.log('\n=== 所有包含 Identifier 的 tokens ===')
es2020Tokens.filter(t => t.name.includes('Identifier')).forEach(t => {
  console.log(`- ${t.name}`)
})


