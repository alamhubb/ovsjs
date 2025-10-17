// 超严格测试 - 检查生成代码的语义正确性
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

// 规范化代码：去除空白、注释，方便对比
function normalizeCode(code: string): string {
  return code
    .replace(/\/\/.*/g, '') // 去除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') // 去除多行注释
    .replace(/\s+/g, ' ') // 多个空白合并为一个
    .replace(/;\s*$/, '') // 去除末尾分号
    .trim()
}

function testFile(filePath: string, testNum: string): { 
  success: boolean; 
  error?: string; 
  input?: string;
  generated?: string;
  issues?: string[]
} {
  try {
    const code = fs.readFileSync(filePath, 'utf-8')
    
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    
    if (!ast || !ast.body || ast.body.length === 0) {
      return {
        success: false,
        error: '❌ AST为空',
        input: code
      }
    }
    
    const result = SlimeGenerator.generator(ast, tokens)
    
    if (!result.code || result.code.trim() === '') {
      return {
        success: false,
        error: '❌ 生成代码为空',
        input: code
      }
    }
    
    // 严格检查：寻找明显的代码生成问题
    const issues: string[] = []
    const inputNorm = normalizeCode(code)
    const outputNorm = normalizeCode(result.code)
    
    // 检查1: 输入有+=，输出变成了=
    if (inputNorm.includes('+=') && !outputNorm.includes('+=') && outputNorm.includes('=')) {
      issues.push('⚠️ += 运算符丢失或变成了 =')
    }
    
    // 检查2: 输入有-=，输出变成了=
    if (inputNorm.includes('-=') && !outputNorm.includes('-=')) {
      issues.push('⚠️ -= 运算符丢失或变成了 =')
    }
    
    // 检查3: 输入有*=，输出变成了=
    if (inputNorm.includes('*=') && !outputNorm.includes('*=')) {
      issues.push('⚠️ *= 运算符丢失或变成了 =')
    }
    
    // 检查4: 多元运算表达式检查（如 a + b + c）
    const multiOpRegex = /(\w+\s*[+\-*/]\s*\w+\s*[+\-*/]\s*\w+)/g
    const inputOps = inputNorm.match(multiOpRegex)
    if (inputOps) {
      for (const expr of inputOps) {
        // 提取运算符数量
        const opCount = (expr.match(/[+\-*]/g) || []).length
        const varNames = expr.match(/\w+/g) || []
        
        // 在输出中查找是否包含所有变量名
        const allVarsPresent = varNames.every(v => outputNorm.includes(v))
        if (!allVarsPresent) {
          issues.push(`⚠️ 多元运算表达式可能不完整: ${expr}`)
        }
      }
    }
    
    // 检查5: 对象rest语法（ES2018，应该报告但不算错误）
    if (inputNorm.includes('...') && inputNorm.includes('{')) {
      const restObjPattern = /\{\s*\w+\s*,\s*\.\.\.\w+\s*\}/
      if (restObjPattern.test(inputNorm) && !outputNorm.includes('...')) {
        issues.push('ℹ️ 对象rest解构不支持（ES2018特性）')
      }
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        error: `发现 ${issues.length} 个问题`,
        input: code,
        generated: result.code,
        issues
      }
    }
    
    return {
      success: true,
      input: code,
      generated: result.code
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
  
  console.log(`开始超严格测试 ${files.length} 个用例...\n`)
  
  let passed = 0
  let failed = 0
  
  for (const file of files) {
    const testNum = file.split('-')[0]
    const testName = file.replace('.js', '')
    
    console.log(`\n[$testNum}] 测试: ${testName}`)
    console.log('='.repeat(80))
    
    const filePath = path.join(casesDir, file)
    const result = testFile(filePath, testNum)
    
    if (result.success) {
      console.log('✅ 通过')
      passed++
      
      // 可选：显示简短的输入/输出
      if (process.env.VERBOSE) {
        console.log(`输入:\n${result.input}`)
        console.log(`\n输出:\n${result.generated}`)
      }
    } else {
      console.log(`❌ 失败: ${result.error}`)
      console.log(`\n输入代码:\n${result.input}`)
      
      if (result.generated) {
        console.log(`\n生成代码:\n${result.generated}`)
      }
      
      if (result.issues) {
        console.log(`\n问题详情:`)
        result.issues.forEach(issue => console.log(`  ${issue}`))
      }
      
      failed++
      
      // 立即停止
      console.log(`\n⚠️ 测试在 ${testNum} 处停止，必须修复后才能继续！`)
      console.log(`当前进度: ${passed}/${passed + failed} 通过`)
      process.exit(1)
    }
  }
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🎉 全部测试通过！`)
  console.log(`通过: ${passed}/${files.length}`)
}

main()

