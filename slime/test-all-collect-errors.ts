// 收集所有测试结果（不在第一个失败时停止）
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  name: string
  number: string
  success: boolean
  error?: string
  input?: string
  output?: string
}

function testFile(filePath: string): TestResult {
  const fileName = path.basename(filePath)
  const testNumber = fileName.split('-')[0]
  const testName = fileName.replace('.js', '')
  
  try {
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
        name: testName,
        number: testNumber,
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
        name: testName,
        number: testNumber,
        success: false,
        error: '生成的代码为空',
        input: code
      }
    }
    
    return {
      name: testName,
      number: testNumber,
      success: true,
      input: code,
      output: result.code
    }
  } catch (error) {
    return {
      name: testName,
      number: testNumber,
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
  
  console.log(`收集所有 ${files.length} 个测试用例的结果...\n`)
  
  const results: TestResult[] = []
  
  for (const file of files) {
    const filePath = path.join(casesDir, file)
    const result = testFile(filePath)
    results.push(result)
    
    const status = result.success ? '✅' : '❌'
    console.log(`${status} [${result.number}] ${result.name}${result.success ? '' : ': ' + result.error}`)
  }
  
  // 统计结果
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`测试完成: ${passed}/${results.length} 通过`)
  console.log(`失败: ${failed} 个\n`)
  
  // 输出失败的测试详情
  const failedTests = results.filter(r => !r.success)
  if (failedTests.length > 0) {
    console.log('失败的测试详情:')
    console.log('='.repeat(60))
    failedTests.forEach(test => {
      console.log(`\n[${test.number}] ${test.name}`)
      console.log(`错误: ${test.error}`)
      console.log(`输入代码:\n${test.input}`)
    })
  }
  
  // 保存结果到JSON文件
  const outputPath = path.join(__dirname, 'test-results.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n结果已保存到: ${outputPath}`)
}

main()

