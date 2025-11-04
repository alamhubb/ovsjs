import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es6Tokens} from "../../packages/slime-parser/src/language/es2015/Es6Tokens";
import Es6Parser from "../../packages/slime-parser/src/language/es2015/Es6Parser";

// 测试1：带分号的表达式
console.log('=== 测试1：Math; ===')
const code1 = `Math;`
const lexer1 = new SubhutiLexer(es6Tokens)
const tokens1 = lexer1.lexer(code1)
console.log('Tokens:', tokens1.map(t => t.tokenValue).join(' '))

const parser1 = new Es6Parser(tokens1)
const cst1 = parser1.Program()
console.log('CST children:', cst1.children.length)
if (cst1.children.length > 0) {
  console.log('✅ 成功！')
} else {
  console.log('❌ 失败')
}

// 测试2：完整表达式语句
console.log('\n=== 测试2：Math.max(1, 2) + Math.min(5, 3); ===')
const code2 = `Math.max(1, 2) + Math.min(5, 3);`
const lexer2 = new SubhutiLexer(es6Tokens)
const tokens2 = lexer2.lexer(code2)
console.log('Tokens:', tokens2.length)

const parser2 = new Es6Parser(tokens2)
const cst2 = parser2.Program()
console.log('CST children:', cst2.children.length)
if (cst2.children.length > 0) {
  console.log('✅ 成功！')
} else {
  console.log('❌ 失败')
}

// 测试3：变量声明
console.log('\n=== 测试3：let x = 1; ===')
const code3 = `let x = 1;`
const lexer3 = new SubhutiLexer(es6Tokens)
const tokens3 = lexer3.lexer(code3)
console.log('Tokens:', tokens3.map(t => t.tokenValue).join(' '))

const parser3 = new Es6Parser(tokens3)
const cst3 = parser3.Program()
console.log('CST children:', cst3.children.length)
if (cst3.children.length > 0) {
  console.log('✅ 成功！')
} else {
  console.log('❌ 失败')
}











