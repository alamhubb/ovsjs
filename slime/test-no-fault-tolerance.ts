import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试关闭容错机制的性能
const testFile = process.argv[2] || 'tests/cases/single/24-map-set.js'

console.log(`\n🧪 测试：关闭容错机制的性能影响\n`)

const code = readFileSync(testFile, 'utf-8')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)

console.log(`文件: ${testFile}`)
console.log(`Tokens: ${tokens.length}个\n`)

// 测试1：容错模式（当前）
console.log('━━━ 测试1：faultTolerance = true ━━━')
console.time('Parser耗时')
const parser1 = new Es6Parser(tokens)
parser1.faultTolerance = true  // 容错模式
try {
  const cst1 = parser1.Program()
  console.timeEnd('Parser耗时')
  console.log(`✅ 解析成功`)
} catch (e: any) {
  console.timeEnd('Parser耗时')
  console.log(`❌ 解析失败: ${e.message}`)
}

console.log()

// 测试2：严格模式
console.log('━━━ 测试2：faultTolerance = false ━━━')
const tokens2 = lexer.lexer(code)  // 重新生成tokens
console.time('Parser耗时')
const parser2 = new Es6Parser(tokens2)
parser2.faultTolerance = false  // 严格模式
try {
  const cst2 = parser2.Program()
  console.timeEnd('Parser耗时')
  console.log(`✅ 解析成功`)
} catch (e: any) {
  console.timeEnd('Parser耗时')
  console.log(`❌ 解析失败: ${e.message}`)
}

console.log('\n' + '═'.repeat(60))

