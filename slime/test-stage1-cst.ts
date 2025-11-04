/**
 * 阶段1: CST生成测试
 * 测试范围: 词法分析 → 语法分析（生成CST）
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`🧪 阶段1: CST生成测试 (${files.length} 个用例)`)
console.log('测试范围: 词法分析 → 语法分析\n')

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${ i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.tokenize(code)
    console.log(`✅ 词法分析: ${tokens.length} tokens`)

    // 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ 语法分析: CST生成成功`)
    console.log(`CST根节点children数: ${cst.children?.length || 0}`)

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
console.log(`🎉 阶段1全部通过: ${files.length}/${files.length}`)


