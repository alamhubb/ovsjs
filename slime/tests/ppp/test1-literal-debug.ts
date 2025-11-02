import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

const code = `1`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)

console.log('=== Token:', tokens[0])
console.log('  tokenName:', tokens[0].tokenName)
console.log('  tokenValue:', tokens[0].tokenValue)

const parser = new Es2020Parser(tokens) as any

// 查看 tokenConsumer 的方法
console.log('\n=== TokenConsumer 可用方法（部分）:')
const tc = parser.tokenConsumer
console.log('  BigIntLiteral:', typeof tc.BigIntLiteral)
console.log('  NullLiteral:', typeof tc.NullLiteral)
console.log('  NumericLiteral:', typeof tc.NumericLiteral)
console.log('  StringLiteral:', typeof tc.StringLiteral)

// 尝试直接消费 NumericLiteral
console.log('\n=== 尝试直接消费 NumericLiteral:')
try {
    const token = parser.tokenConsumer.NumericLiteral()
    console.log('✅ 成功消费:', token)
} catch (e: any) {
    console.log('❌ 失败:', e.message)
}

// 重新创建 parser 测试 Literal 规则
const parser2 = new Es2020Parser(tokens)
console.log('\n=== 尝试 Literal 规则:')
try {
    const result = parser2.Literal()
    console.log('✅ Literal 成功:', result)
} catch (e: any) {
    console.log('❌ Literal 失败:', e.message)
    console.log('\n错误详情:')
    console.log(e.stack)
}

