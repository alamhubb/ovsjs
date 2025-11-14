/**
 * 阶段3: 代码生成测试
 * 测试范围: AST → JavaScript代码
 * 前提: 阶段1、2已通过（CST和AST可以正常生成）
 */
import Es2025Parser from './packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2025/Es2025Tokens.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`🧪 阶段3: 代码生成测试 (${files.length} 个用例)`)
console.log('测试范围: AST → JavaScript代码\n')

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 阶段1-2: 生成AST（假设已通过）
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.tokenize(code)
    const parser = new Es2025Parser(tokens)
    const cst = parser.Program()
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    console.log(`✅ 前置阶段: ${tokens.length} tokens → ${ast.body.length} statements`)

    // 阶段3: AST → 代码
    const result = SlimeGenerator.generator(ast, tokens)
    console.log(`✅ 代码生成成功`)
    console.log(`生成代码长度: ${result.code.length} 字符`)
    
    // 显示生成代码的前3行
    const lines = result.code.split('\n').slice(0, 3)
    console.log(`代码预览: ${lines.join(' ').substring(0, 60)}...`)

  } catch (error: any) {
    console.log(`❌ 失败: ${error.message}`)
    console.log('\n输入代码:')
    console.log(code)
    console.log('\n错误栈:')
    console.log(error.stack)
    console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止`)
    console.log(`当前进度: ${i}/${files.length} 通过\n`)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段3全部通过: ${files.length}/${files.length}`)


