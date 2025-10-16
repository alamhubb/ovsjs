import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// Slime测试 - 单例测试入口
// 用途：测试单个用例，精准调试
// 执行：npx tsx test-runner.ts <path>

const testFile = process.argv[2]

if (!testFile) {
  console.log('❌ 缺少测试文件参数')
  console.log('用法: npx tsx test-runner.ts <path>')
  console.log('示例: npx tsx test-runner.ts tests/cases/single/05-logical-ops.js')
  process.exit(1)
}

console.log(`\n📝 测试: ${testFile}\n`)

const startTime = Date.now()

try {
  const code = readFileSync(testFile, 'utf-8')
  console.log(`代码:\n${code}\n`)
  
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ 词法分析完成，tokens数量: ${tokens.length}`)
  console.log('前10个tokens:')
  tokens.slice(0, 10).forEach((t: any, i: number) => {
    console.log(`  [${i}] ${t.tokenName.padEnd(20)} "${t.tokenValue}"`)
  })
  console.log()
  
  // 2. 语法分析
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  if (!cst) throw new Error('CST为空')
  console.log(`✅ 语法分析完成`)
  console.log()
  
  // 3. CST -> AST
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log(`✅ AST转换完成，${ast.body.length}个顶层语句`)
  console.log('AST预览:')
  console.log(JSON.stringify(ast, null, 2).substring(0, 500) + '...')
  console.log()
  
  // 4. AST -> Code
  const result = SlimeGenerator.generator(ast, tokens)
  
  const elapsed = Date.now() - startTime
  console.log(`✅ 编译成功 (${elapsed}ms)`)
  console.log(`生成代码:\n${result.code}`)
} catch (e: any) {
  const elapsed = Date.now() - startTime
  console.log(`❌ 编译失败 (${elapsed}ms)`)
  console.log(`错误: ${e.message}`)
  console.log(`堆栈:\n${e.stack}`)
  process.exit(1)
}
