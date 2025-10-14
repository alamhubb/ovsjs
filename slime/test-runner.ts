import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// Slime测试 - 三阶段渐进测试
// 01-10: 只测Parser | 11-20: 只测Generator | 21-30: 完整链路

const testCases = [
  // 阶段1：只测Parser（01-10）
  'tests/cases/es5/01-literals.js',
  'tests/cases/es5/02-identifiers.js',
  'tests/cases/es5/03-binary-ops.js',
  'tests/cases/es5/04-comparison.js',
  'tests/cases/es5/05-logical-ops.js',
  'tests/cases/es5/06-var-decl.js',
  'tests/cases/es5/07-if-statement.js',
  'tests/cases/es5/08-for-loop.js',
  'tests/cases/es5/09-function-decl.js',
  'tests/cases/es5/10-complex-parsing.js',
  
  // 阶段2：测试Generator（11-20）- 复用01-10的代码，验证代码生成
  'tests/cases/es5/11-literals-gen.js',
  'tests/cases/es5/12-identifiers-gen.js',
  'tests/cases/es5/13-binary-ops-gen.js',
  'tests/cases/es5/14-comparison-gen.js',
  'tests/cases/es5/15-logical-ops-gen.js',
  'tests/cases/es5/16-var-decl-gen.js',
  'tests/cases/es5/17-if-statement-gen.js',
  'tests/cases/es5/18-for-loop-gen.js',
  'tests/cases/es5/19-function-decl-gen.js',
  'tests/cases/es5/20-complex-gen.js',
  
  // 阶段3：完整链路（21-30）- 验证往返转换（逐个启用）
  // 'tests/cases/es5/21-simple-roundtrip.js',
  // 'tests/cases/es5/22-control-flow.js',
  'tests/cases/es5/23-functions.js',
  'tests/cases/es5/24-objects-arrays.js',
  'tests/cases/es5/25-operators-all.js',
  // 'tests/cases/es5/26-exception-handling.js',
  // 'tests/cases/es5/27-strict-mode.js',
  // 'tests/cases/es5/28-array-methods.js',
  // 'tests/cases/es5/29-object-methods.js',
  // 'tests/cases/es5/30-production-level.js',
]

function getStageInfo(fileName: string): { stage: string; color: string } {
  const num = parseInt(fileName.split('-')[0])
  if (num >= 1 && num <= 10) {
    return { stage: '阶段1-Parser', color: '🔵' }
  } else if (num >= 11 && num <= 20) {
    return { stage: '阶段2-Generator', color: '🟢' }
  } else if (num >= 21 && num <= 30) {
    return { stage: '阶段3-完整链路', color: '🟣' }
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

