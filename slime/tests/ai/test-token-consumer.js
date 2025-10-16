// 直接测试TokenConsumer的方法
// 用法: node tests/ai/test-token-consumer.js

import Es6Parser from '../../packages/slime-parser/src/language/es2015/Es6Parser.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'
import { es6Tokens } from '../../packages/slime-parser/src/language/es2015/Es6Tokens.ts'

console.log('='.repeat(60))
console.log('测试TokenConsumer的BooleanLiteral方法')
console.log('='.repeat(60))

const code = "true"
console.log(`\n测试代码: "${code}"\n`)

// 1. 词法分析
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.log(`词法分析: ${tokens.length} 个token`)
console.log(`  token[0]: ${tokens[0].tokenName} = "${tokens[0].tokenValue}"`)

// 2. 创建Parser
const parser = new Es6Parser(tokens)
console.log(`\nParser初始状态:`)
console.log(`  - initFlag: ${parser.initFlag}`)
console.log(`  - continueMatch: ${parser.continueMatch}`)
console.log(`  - tokens.length: ${parser.tokens.length}`)

// 3. 测试tokenConsumer.TrueTok()
console.log(`\n【测试1】直接调用 tokenConsumer.TrueTok()...`)
const parser1 = new Es6Parser(tokens)
console.log(`调用前: continueMatch=${parser1.continueMatch}, tokens.length=${parser1.tokens.length}`)

const result1 = parser1.tokenConsumer.TrueTok()

console.log(`调用后: continueMatch=${parser1.continueMatch}, tokens.length=${parser1.tokens.length}`)
console.log(`返回值: ${result1 ? 'CST对象' : 'undefined'}`)
if (result1) {
  console.log('✅ TrueTok() 成功！')
  console.log(JSON.stringify(result1, null, 2))
} else {
  console.log('❌ TrueTok() 失败')
}

// 4. 测试tokenConsumer.BooleanLiteral()
console.log(`\n【测试2】调用 tokenConsumer.BooleanLiteral()...`)
const parser2 = new Es6Parser(tokens)
console.log(`调用前: continueMatch=${parser2.continueMatch}, tokens.length=${parser2.tokens.length}`)

const result2 = parser2.tokenConsumer.BooleanLiteral()

console.log(`调用后: continueMatch=${parser2.continueMatch}, tokens.length=${parser2.tokens.length}`)
console.log(`返回值: ${result2 ? 'CST对象' : 'undefined'}`)
if (result2) {
  console.log('✅ BooleanLiteral() 成功！')
  console.log(JSON.stringify(result2, null, 2))
} else {
  console.log('❌ BooleanLiteral() 失败')
}

// 5. 查看BooleanLiteral的源代码
console.log(`\n【源代码】Es5TokenConsume.ts 中的 BooleanLiteral:`)
console.log(`BooleanLiteral() {`)
console.log(`    return this.or([`)
console.log(`        {alt: () => this.TrueTok()},`)
console.log(`        {alt: () => this.FalseTok()}`)
console.log(`    ])`)
console.log(`}`)

console.log('\n' + '='.repeat(60))
console.log('测试完成！你可以修改这个脚本测试其他方法')
console.log('='.repeat(60))

