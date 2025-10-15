import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// Slime测试 - ES6 Parser三阶段测试
// 01-10: ES6基础语法 | 11-20: Generator测试 | 21-30: ES6高级特性

const testCases = [
  // 单个特性测试（01-20）
  'tests/cases/single/01-literals.js',
  'tests/cases/single/02-identifiers.js',
  'tests/cases/single/03-binary-ops.js',
  'tests/cases/single/04-comparison.js',
  'tests/cases/single/05-logical-ops.js',
  'tests/cases/single/06-var-decl.js',
  'tests/cases/single/07-if-statement.js',
  'tests/cases/single/08-for-loop.js',
  'tests/cases/single/09-function-decl.js',
  'tests/cases/single/10-objects-arrays.js',
  'tests/cases/single/11-arrow-functions.js',
  'tests/cases/single/12-template-literals.js',
  'tests/cases/single/13-destructuring.js',
  'tests/cases/single/14-spread-rest.js',
  'tests/cases/single/15-class-basic.js',
  'tests/cases/single/16-class-extends.js',
  'tests/cases/single/17-enhanced-object.js',
  'tests/cases/single/18-default-params.js',
  'tests/cases/single/19-for-of-loop.js',
  'tests/cases/single/20-mixed-es6.js',
  
  // 组合特性测试（21-30）
  'tests/cases/combined/21-simple-roundtrip.js',
  'tests/cases/combined/22-control-flow.js',
  'tests/cases/combined/23-functions.js',
  'tests/cases/combined/24-objects-arrays.js',
  'tests/cases/combined/25-operators-all.js',
  'tests/cases/combined/26-exception-handling.js',
  'tests/cases/combined/27-strict-mode.js',
  'tests/cases/combined/28-array-methods.js',
  'tests/cases/combined/29-object-methods.js',
  'tests/cases/combined/30-production-level.js',
]

function getStageInfo(fileName: string): { stage: string; color: string } {
  const num = parseInt(fileName.split('-')[0])
  if (num >= 1 && num <= 10) {
    return { stage: '阶段1-基础语法', color: '🔵' }
  } else if (num >= 11 && num <= 20) {
    return { stage: '阶段2-ES6新特性', color: '🟢' }
  } else if (num >= 21 && num <= 30) {
    return { stage: '阶段3-复杂特性', color: '🟣' }
  }
  return { stage: '未知阶段', color: '⚪' }
}

async function runTests() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' Slime库三阶段渐进测试'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  let passCount = 0
  let failCount = 0
  let currentStage = ''
  
  for (const testCase of testCases) {
    const fileName = testCase.split('/').pop()!
    const { stage, color } = getStageInfo(fileName)
    
    // 阶段变更时输出分隔
    if (currentStage !== stage) {
      console.log(`\n${'═'.repeat(80)}`)
      console.log(`${color} ${stage}`)
      console.log('═'.repeat(80))
      currentStage = stage
    }
    
    console.log(`\n📝 测试: ${fileName}`)
    console.log('─'.repeat(80))
    
    try {
      const code = readFileSync(testCase, 'utf-8')
      
      // 1. 词法分析
      const lexer = new SubhutiLexer(es6Tokens)
      const tokens = lexer.lexer(code)
      
      // 2. 语法分析
      const parser = new Es6Parser(tokens)
      const cst = parser.Program()
      
      // 调试：检查CST
      if (!cst) {
        throw new Error('Parser.Program()返回undefined，CST为空')
      }
      
      // 3. CST -> AST
      const slimeCstToAst = new SlimeCstToAst()
      const ast = slimeCstToAst.toProgram(cst)
      
      
      // 4. AST -> Code（阶段1可以跳过此步，只检查AST）
      const result = SlimeGenerator.generator(ast, tokens)
      
      console.log(`✅ 编译成功 - ${fileName}`)
      console.log(`   生成代码: ${result.code.length}字符`)
      passCount++
    } catch (e: any) {
      console.log(`❌ 编译失败 - ${fileName}`)
      console.log(`   错误: ${e.message}`)
      failCount++
    }
  }
  
  console.log('\n' + '═'.repeat(80))
  console.log(`📊 测试总结: ${passCount}/${testCases.length} 通过`)
  console.log('═'.repeat(80))
  
  if (failCount === 0) {
    console.log('\n🎉 所有Slime测试通过！')
  } else {
    console.log(`\n⚠️  ${failCount} 个测试失败`)
  }
}

runTests().catch(console.error)

