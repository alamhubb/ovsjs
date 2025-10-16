import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 性能分析工具 - 找出最慢的步骤
const testFile = process.argv[2] || 'tests/cases/single/24-map-set.js'

console.log(`\n🔍 性能分析: ${testFile}\n`)

const code = readFileSync(testFile, 'utf-8')
const lines = code.split('\n').length
const bytes = Buffer.byteLength(code, 'utf-8')

console.log(`文件信息:`)
console.log(`  代码行数: ${lines}`)
console.log(`  文件大小: ${bytes} bytes`)
console.log()

// 1. 词法分析
console.time('1️⃣ 词法分析 (Lexer)')
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(code)
console.timeEnd('1️⃣ 词法分析 (Lexer)')
console.log(`  生成tokens: ${tokens.length}个`)
console.log()

// 2. 语法分析
console.time('2️⃣ 语法分析 (Parser)')
const parser = new Es6Parser(tokens)
const cst = parser.Program()
console.timeEnd('2️⃣ 语法分析 (Parser)')
console.log(`  生成CST节点`)
console.log()

// 3. CST -> AST
console.time('3️⃣ CST转AST (CstToAst)')
const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)
console.timeEnd('3️⃣ CST转AST (CstToAst)')
console.log(`  AST节点: ${ast.body.length}个顶层语句`)
console.log()

// 4. 代码生成
console.time('4️⃣ 代码生成 (Generator)')
const result = SlimeGenerator.generator(ast, tokens)
console.timeEnd('4️⃣ 代码生成 (Generator)')
console.log(`  生成代码: ${result.code.length} bytes`)
console.log()

console.log('📊 性能比率:')
console.log(`  处理速度: ${(bytes / 1024).toFixed(2)} KB 文件`)
console.log(`  每行耗时: ${((Date.now()) / lines).toFixed(2)} ms/行`)

