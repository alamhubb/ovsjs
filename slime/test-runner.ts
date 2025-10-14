import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// Slime测试 - 测试Parser和Generator

const testCases = [
  // 递进式测试：一个个启用
  'tests/cases/es5/01-basic-expressions.js',
  'tests/cases/es5/02-control-flow.js',
  // 'tests/cases/es5/03-functions.js',
  // 'tests/cases/es5/04-objects-arrays.js',
  // 'tests/cases/es5/05-operators.js',
  // 'tests/cases/es5/06-exception-handling.js',
  // 'tests/cases/es5/07-strict-mode.js',
  // 'tests/cases/es5/08-array-methods.js',
  // 'tests/cases/es5/09-object-methods.js',
  // 'tests/cases/es5/10-json.js'
]

async function runTests() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' Slime库测试'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  let passCount = 0
  let failCount = 0
  
  for (const testCase of testCases) {
    const fileName = testCase.split('/').pop()
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
      
      // 4. AST -> Code
      const result = SlimeGenerator.generator(ast, tokens)
      
      console.log(`✅ 编译成功 - ${fileName}`)
      console.log(`生成代码长度: ${result.code.length}字符`)
      passCount++
    } catch (e) {
      console.log(`❌ 编译失败 - ${fileName}`)
      console.log(`   错误: ${e.message}`)
      console.log(e.stack)
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

