// 单个测试用例运行器（严格验证版本）
import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const file = process.argv[2]
if (!file) {
  console.log('usage: npx tsx test-runner.ts <file>')
  process.exit(1)
}

const code = readFileSync(file, 'utf-8')
console.log(`\n📝 测试: ${file}\n`)
console.log('代码:')
console.log(code)
console.log()

const startTime = Date.now()

try {
  // 1. Lexer
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`✅ 词法分析完成，tokens数量: ${tokens.length}`)
  
  // 2. Parser
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  console.log(`✅ 语法分析完成`)
  
  // 3. CST -> AST
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  console.log(`✅ AST转换完成，${ast.body.length}个顶层语句`)
  
  // 4. AST -> Code
  const result = SlimeGenerator.generator(ast, tokens)
  
  const elapsed = Date.now() - startTime
  
  // 严格验证：生成代码不为空
  if (!result.code || result.code.trim() === '') {
    console.log(`❌ 编译失败 (${elapsed}ms)`)
    console.log(`错误: 生成代码为空（Parser可能返回了空CST）`)
    process.exit(1)
  }
  
  // 严格验证：AST不为空
  if (ast.body.length === 0) {
    console.log(`⚠️ 编译成功但AST为空 (${elapsed}ms)`)
    console.log(`警告: AST转换返回0个语句，可能Parser不支持此语法`)
    console.log(`生成代码:\n${result.code}`)
    process.exit(1)
  }
  
  console.log(`✅ 编译成功 (${elapsed}ms)`)
  console.log(`生成代码:\n${result.code}`)
} catch (e: any) {
  const elapsed = Date.now() - startTime
  console.log(`❌ 编译失败 (${elapsed}ms)`)
  console.log(`错误: ${e.message}`)
  console.log(`堆栈:\n${e.stack}`)
  process.exit(1)
}
