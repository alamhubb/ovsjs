import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import * as fs from 'fs'
import * as path from 'path'

// 获取tests/cases目录下的所有测试文件
const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`开始测试Parser阶段 ${files.length} 个用例...\n`)

let passCount = 0
let failCount = 0
let firstFailIndex = -1

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 1. 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)

    // 2. 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()

    // 3. CST -> AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)

    console.log('✅ 通过')
    console.log(`解析成功: ${tokens.length} tokens → CST → AST (${ast.body.length} statements)`)
    passCount++
  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`)
    console.log('错误位置:', error.stack?.split('\n')[1]?.trim())
    failCount++
    
    if (firstFailIndex === -1) {
      firstFailIndex = i
      console.log('\n输入代码:')
      console.log(code)
      console.log('\n⚠️ 测试在', i + 1, '处停止，请修复后继续')
      console.log(`\n当前进度: ${passCount}/${i + 1} 通过\n`)
      process.exit(1)
    }
  }

  console.log('')
}

console.log('='.repeat(60))
console.log('测试完成!')
console.log(`✅ 通过: ${passCount}/${files.length}`)
console.log(`❌ 失败: ${failCount}/${files.length}`)


