// 手动验证特定测试用例的正确性
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

const testCases = [
  { num: 16, check: 'return x + y + z' },
  { num: 49, check: 'strings[0] + values[0] + strings[1]' },
]

console.log('手动验证特定测试用例\n')

for (const test of testCases) {
  const testFile = fs.readdirSync(path.join(__dirname, 'tests', 'cases'))
    .find(f => f.startsWith(`${test.num.toString().padStart(2, '0')}-`))
  
  if (!testFile) {
    console.log(`❌ 找不到测试${test.num}`)
    continue
  }
  
  const filePath = path.join(__dirname, 'tests', 'cases', testFile)
  const code = fs.readFileSync(filePath, 'utf-8')
  
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(code)
  
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  const result = SlimeGenerator.generator(ast, tokens)
  
  console.log(`\n[${ test.num}] ${testFile}`)
  console.log('='.repeat(80))
  console.log('输入代码:')
  console.log(code)
  console.log('\n生成代码:')
  console.log(result.code)
  console.log('\n检查点:', test.check)
  
  // 规范化检查（去除空格）
  const inputNorm = code.replace(/\s+/g, '')
  const outputNorm = result.code.replace(/\s+/g, '')
  
  if (outputNorm.includes(test.check.replace(/\s+/g, ''))) {
    console.log('✅ 检查通过')
  } else {
    console.log('❌ 检查失败：输出中未找到关键代码片段')
    // 尝试找到类似的代码
    const checkParts = test.check.split(/\s+/)
    console.log('  查找片段:', checkParts.join(' '))
    
    // 检查每个部分是否存在
    const missing = checkParts.filter(part => !outputNorm.includes(part))
    if (missing.length > 0) {
      console.log('  缺失的部分:', missing.join(', '))
    }
  }
}

