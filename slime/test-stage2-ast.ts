/**
 * 阶段2: AST生成测试
 * 测试范围: CST → AST转换
 * 前提: 阶段1已通过（CST可以正常生成）
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
  .filter(f => f.endsWith('.js'))
  .sort()

console.log(`🧪 阶段2: AST生成测试 (${files.length} 个用例)`)
console.log('测试范围: CST → AST转换\n')

for (let i = 0; i < files.length; i++) {
  const file = files[i]
  const testName = file.replace('.js', '')
  const filePath = path.join(casesDir, file)
  const code = fs.readFileSync(filePath, 'utf-8')

  console.log(`\n[${i + 1}] 测试: ${testName}`)
  console.log('='.repeat(60))

  try {
    // 阶段1: 生成CST（假设已通过）
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.tokenize(code)
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ CST生成: ${cst.children?.length || 0} 个子节点`)

    // 阶段2: CST → AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    console.log(`✅ AST转换: ${ast.body.length} 个语句`)
    
    // 显示AST结构概要
    const types = ast.body.map((node: any) => node.type).join(', ')
    console.log(`AST节点类型: ${types.substring(0, 50)}${types.length > 50 ? '...' : ''}`)

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
console.log(`🎉 阶段2全部通过: ${files.length}/${files.length}`)


