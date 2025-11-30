/**
 * 规则测试验证工具
 * 
 * 目的：验证测试文件是否能保证对应规则没问题
 * 方法：往返测试（Code → CST → AST → Code）
 */

import * as fs from 'fs'
import * as path from 'path'
import Es2025Parser from '../../packages/slime-parser/src/language/es2025/Es2025Parser.ts'
import { es2025Tokens } from 'slime-parser/src/language/es2025/SlimeTokensName.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { SlimeCstToAst } from '../../packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from '../../packages/slime-generator/src/SlimeGenerator.ts'

interface TestResult {
  file: string
  ruleName: string
  testCases: number
  passed: number
  failed: number
  errors: string[]
}

/**
 * 从测试文件中提取规则名
 */
function extractRuleName(filename: string): string {
  // 支持两种格式：
  // 1. RuleName-001.js
  // 2. 001-RuleName.js
  let match = filename.match(/^(.+)-\d{3}\.js$/)
  if (match) return match[1]
  
  match = filename.match(/^\d{3}-(.+)\.js$/)
  return match ? match[1] : 'Unknown'
}

/**
 * 从测试文件中提取测试用例
 */
function extractTestCases(fileContent: string): string[] {
  const testCases: string[] = []
  const lines = fileContent.split('\n')
  let currentCase = ''
  let inComment = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // 跳过文件头部注释
    if (trimmed.startsWith('/**') || trimmed.startsWith('*') || trimmed.startsWith('*/')) {
      continue
    }
    
    // 检测测试用例开始
    if (trimmed.startsWith('// ✅') || trimmed.startsWith('// ❌')) {
      if (currentCase.trim()) {
        testCases.push(currentCase.trim())
      }
      currentCase = ''
      inComment = true
      continue
    }
    
    // 收集测试代码
    if (!trimmed.startsWith('//') && trimmed.length > 0) {
      currentCase += line + '\n'
    }
  }
  
  // 添加最后一个用例
  if (currentCase.trim()) {
    testCases.push(currentCase.trim())
  }
  
  return testCases
}

/**
 * 验证单个测试用例（往返测试）
 */
function verifyTestCase(code: string, ruleName: string): { success: boolean; error?: string } {
  try {
    // 1. 词法分析
    const lexer = new SubhutiLexer(es2025Tokens)
    const tokens = lexer.tokenize(code)
    
    if (tokens.length === 0) {
      return { success: false, error: '词法分析失败：无token生成' }
    }
    
    // 2. 语法分析
    const parser = new Es2025Parser(tokens)
    const cst = parser.Program()
    
    if (!cst || !cst.children || cst.children.length === 0) {
      return { success: false, error: 'CST生成失败：无子节点' }
    }
    
    // 3. CST → AST
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    
    if (!ast || !ast.body || ast.body.length === 0) {
      return { success: false, error: 'AST转换失败：无body' }
    }
    
    // 4. AST → Code
    const result = SlimeGenerator.generator(ast, tokens)
    
    if (!result || !result.code) {
      return { success: false, error: '代码生成失败：无输出' }
    }
    
    // 5. 验证往返结果
    const normalizedOriginal = normalizeCode(code)
    const normalizedGenerated = normalizeCode(result.code)
    
    if (normalizedOriginal !== normalizedGenerated) {
      return { 
        success: false, 
        error: `往返测试失败：\n原始：${normalizedOriginal}\n生成：${normalizedGenerated}` 
      }
    }
    
    return { success: true }
    
  } catch (err) {
    return { 
      success: false, 
      error: `异常：${err instanceof Error ? err.message : String(err)}` 
    }
  }
}

/**
 * 标准化代码（用于对比）
 */
function normalizeCode(code: string): string {
  return code
    .replace(/\s+/g, ' ')      // 多个空格变一个
    .replace(/\s*([{};,:])\s*/g, '$1')  // 去掉符号周围空格
    .replace(/;\s*}/g, '}')    // 去掉 }前的分号
    .trim()
}

/**
 * 验证单个测试文件
 */
function verifyTestFile(filePath: string): TestResult {
  const filename = path.basename(filePath)
  const ruleName = extractRuleName(filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const testCases = extractTestCases(fileContent)
  
  const result: TestResult = {
    file: filename,
    ruleName,
    testCases: testCases.length,
    passed: 0,
    failed: 0,
    errors: []
  }
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const verifyResult = verifyTestCase(testCase, ruleName)
    
    if (verifyResult.success) {
      result.passed++
    } else {
      result.failed++
      result.errors.push(`测试${i + 1}失败：${verifyResult.error}`)
    }
  }
  
  return result
}

/**
 * 递归查找所有测试文件
 */
function findAllTestFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...findAllTestFiles(fullPath))
    } else if (item.endsWith('.js') && (/-\d{3}\.js$/.test(item) || /^\d{3}-/.test(item))) {
      files.push(fullPath)
    }
  }
  
  return files
}

/**
 * 主函数：验证所有规则测试
 */
function main() {
  console.log('🔍 开始验证ES6Parser规则测试...\n')
  
  const baseDir = path.join(__dirname)
  const testFiles = findAllTestFiles(baseDir)
  
  console.log(`找到 ${testFiles.length} 个测试文件\n`)
  
  const results: TestResult[] = []
  let totalPassed = 0
  let totalFailed = 0
  let totalTestCases = 0
  
  for (const file of testFiles) {
    const result = verifyTestFile(file)
    results.push(result)
    
    totalPassed += result.passed
    totalFailed += result.failed
    totalTestCases += result.testCases
    
    // 输出结果
    const status = result.failed === 0 ? '✅' : '❌'
    console.log(`${status} ${result.file.padEnd(50)} | 规则: ${result.ruleName.padEnd(30)} | 用例: ${result.testCases} | 通过: ${result.passed} | 失败: ${result.failed}`)
    
    // 输出错误详情
    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.log(`   ⚠️  ${error}`)
      }
    }
  }
  
  // 输出总结
  console.log('\n========== 验证总结 ==========')
  console.log(`📁 测试文件数：${testFiles.length}`)
  console.log(`📋 测试用例数：${totalTestCases}`)
  console.log(`✅ 通过：${totalPassed} (${((totalPassed / totalTestCases) * 100).toFixed(1)}%)`)
  console.log(`❌ 失败：${totalFailed} (${((totalFailed / totalTestCases) * 100).toFixed(1)}%)`)
  
  const successRate = (totalPassed / totalTestCases) * 100
  console.log('\n========== 质量评级 ==========')
  if (successRate === 100) {
    console.log('🏆 等级：5星 - 完美！所有测试都能保证规则正确')
  } else if (successRate >= 95) {
    console.log('⭐⭐⭐⭐ 等级：4星 - 优秀！少量问题需要修复')
  } else if (successRate >= 85) {
    console.log('⭐⭐⭐ 等级：3星 - 良好，部分规则需要改进')
  } else if (successRate >= 70) {
    console.log('⭐⭐ 等级：2星 - 一般，较多问题需要修复')
  } else {
    console.log('⭐ 等级：1星 - 需要大幅改进')
  }
  
  // 输出失败文件列表
  const failedFiles = results.filter(r => r.failed > 0)
  if (failedFiles.length > 0) {
    console.log('\n========== 需要修复的文件 ==========')
    for (const result of failedFiles) {
      console.log(`❌ ${result.file} (规则: ${result.ruleName})`)
    }
  }
}

// 执行验证
main()

