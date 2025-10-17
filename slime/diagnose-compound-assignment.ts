// 诊断复合赋值运算符问题
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'

const code = `total += n`

console.log('输入代码:', code)
console.log('\n' + '='.repeat(60))

// 1. 词法分析
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log('\n1. Tokens:')
tokens.forEach((token, index) => {
  const typeName = token.tokenType?.name || 'Unknown'
  console.log(`  [${index}] ${token.image} (${typeName})`)
})

// 2. 语法分析
const parser = new Es6Parser(tokens)
const cst = parser.Program()

console.log('\n2. CST结构:')
console.log(JSON.stringify(cst, null, 2))

// 3. AST转换
const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)

console.log('\n3. AST结构:')
console.log(JSON.stringify(ast, null, 2))

// 4. 代码生成
const result = SlimeGenerator.generator(ast, tokens)

console.log('\n4. 生成代码:', result.code)
console.log('\n' + '='.repeat(60))
console.log('问题分析:')
if (result.code.includes('+=')) {
  console.log('✅ += 运算符正确生成')
} else {
  console.log('❌ += 运算符丢失！')
  console.log('   期望: total += n')
  console.log('   实际:', result.code)
}

