import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试单个用例
const testFile = process.argv[2] || 'tests/temp-11-map-init.js'

console.log(`\n📝 测试: ${testFile}\n`)

try {
  const code = readFileSync(testFile, 'utf-8')
  console.log(`代码:\n${code}\n`)
  
  // 1. 词法分析
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  console.log(`词法分析完成，tokens数量: ${tokens.length}`)
  console.log('前20个tokens:')
  tokens.slice(0, 20).forEach((t: any, i: number) => {
    console.log(`  [${i}] ${t.tokenName.padEnd(20)} "${t.tokenValue}"`)
  })
  
  if (tokens.length > 50) {
    console.log('\n第40-60个tokens:')
    tokens.slice(40, 60).forEach((t: any, i: number) => {
      console.log(`  [${i+40}] ${t.tokenName.padEnd(20)} "${t.tokenValue}"`)
    })
    
    console.log('\n第60-80个tokens:')
    tokens.slice(60, 80).forEach((t: any, i: number) => {
      console.log(`  [${i+60}] ${t.tokenName.padEnd(20)} "${t.tokenValue}"`)
    })
  }
  
  // 2. 语法分析
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  // 3. CST -> AST
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  // 调试：查看Symbol.for的AST
  console.log('\n第3个语句(globalSym)的init:')
  const stmt3 = ast.body[2] as any
  if (stmt3 && stmt3.declarations && stmt3.declarations[0]) {
    console.log(JSON.stringify(stmt3.declarations[0].init, null, 2))
  }
  
  // 4. AST -> Code
  const result = SlimeGenerator.generator(ast, tokens)
  
  console.log(`✅ 编译成功`)
  console.log(`生成代码:\n${result.code}`)
} catch (e: any) {
  console.log(`❌ 编译失败`)
  console.log(`错误: ${e.message}`)
  console.log(`堆栈:\n${e.stack}`)
}

