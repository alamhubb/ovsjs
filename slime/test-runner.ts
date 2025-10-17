// 严格的测试运行器 - 逐个测试，遇到问题立即停止
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

function testFile(filePath: string): { success: boolean; error?: string; code?: string; input?: string } {
  try {
    // 读取测试文件
    const code = fs.readFileSync(filePath, 'utf-8')
    
    // 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    // 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    // CST -> AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    
    // 检查AST是否为空
    if (!ast || !ast.body || ast.body.length === 0) {
      return {
        success: false,
        error: 'AST为空或没有语句',
        input: code
      }
    }
    
    // 代码生成
    const result = SlimeGenerator.generator(ast, tokens)
    
    // 检查生成的代码
    if (!result.code || result.code.trim() === '') {
      return {
        success: false,
        error: '生成的代码为空',
        input: code
      }
    }
    
    return {
      success: true,
      code: result.code,
      input: code
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      input: fs.readFileSync(filePath, 'utf-8')
    }
  }
}

async function main() {
  const casesDir = path.join(__dirname, 'tests', 'cases')
  const files = fs.readdirSync(casesDir)
    .filter(f => f.endsWith('.js'))
    .sort()
  
  console.log(`开始严格测试 ${files.length} 个用例...\n`)
  
  let passed = 0
  let failed = 0
  
  for (const file of files) {
    const testNum = file.split('-')[0]
    const testName = file.replace('.js', '')
    
    console.log(`\n[${testNum}] 测试: ${testName}`)
    console.log('='.repeat(60))
    
    const filePath = path.join(casesDir, file)
    const result = testFile(filePath)
    
    if (result.success) {
      console.log('✅ 通过')
      console.log(`输入代码:\n${result.input}`)
      console.log(`\n生成代码:\n${result.code}`)
      passed++
    } else {
      console.log(`❌ 失败: ${result.error}`)
      console.log(`输入代码:\n${result.input}`)
      if (result.code) {
        console.log(`\n生成代码:\n${result.code}`)
      }
      failed++
      
      // 遇到失败立即停止
      console.log(`\n⚠️ 测试在 ${testNum} 处停止，请修复后继续`)
      console.log(`\n当前进度: ${passed}/${passed + failed} 通过`)
      process.exit(1)
    }
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎉 全部测试通过！`)
  console.log(`通过: ${passed}/${files.length}`)
}

main()

