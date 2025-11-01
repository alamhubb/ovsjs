/**
 * Parser阶段专项测试
 * 只测试：词法分析 → 语法分析 → AST转换
 * 不测试代码生成
 */
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

console.log(`🧪 Parser阶段专项测试 (${files.length} 个用例)`)
console.log('测试范围: 词法分析 → 语法分析 → AST转换\n')
console.log('='.repeat(70))

let passCount = 0
let failCount = 0
const failures: Array<{index: number, name: string, error: string, code: string}> = []

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  const testNum = String(i + 1).padStart(2, '0')
  process.stdout.write(`[${testNum}/${files.length}] ${testName.padEnd(35)}`)

  try {
    // 阶段1: 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    // 阶段2: 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    // 阶段3: CST → AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)

    console.log(`✅ (${tokens.length}T → ${ast.body.length}S)`)
    passCount++
  } catch (error: any) {
    console.log(`❌ ${error.message.substring(0, 40)}`)
    failCount++
    failures.push({
      index: i + 1,
      name: testName,
      error: error.message,
      code: code
    })
  }
}

console.log('='.repeat(70))
console.log(`\n📊 测试结果:`)
console.log(`   ✅ 通过: ${passCount}/${files.length} (${(passCount/files.length*100).toFixed(1)}%)`)
console.log(`   ❌ 失败: ${failCount}/${files.length} (${(failCount/files.length*100).toFixed(1)}%)`)

if (failures.length > 0) {
  console.log(`\n❌ 失败的测试用例:\n`)
  failures.forEach(f => {
    console.log(`[${String(f.index).padStart(2, '0')}] ${f.name}`)
    console.log(`    错误: ${f.error}`)
    console.log(`    代码预览: ${f.code.split('\n').slice(0, 3).join(' ').substring(0, 60)}...`)
    console.log('')
  })
  
  process.exit(1)
} else {
  console.log(`\n🎉 所有测试通过！`)
  process.exit(0)
}

