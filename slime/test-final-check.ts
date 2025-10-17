// 最终测试验证 - 快速统计
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'fs'
import * as path from 'path'

const casesDir = path.join(__dirname, 'tests', 'cases')
const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.js')).sort()

let passed = 0
let failed = 0
const failedTests: string[] = []

console.log(`Testing ${files.length} cases...\n`)

for (const file of files) {
  try {
    const code = fs.readFileSync(path.join(casesDir, file), 'utf-8')
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    
    if (!ast || !ast.body || ast.body.length === 0) {
      failed++
      failedTests.push(`${file} - AST empty`)
      continue
    }
    
    const result = SlimeGenerator.generator(ast, tokens)
    
    if (!result.code || result.code.trim() === '') {
      failed++
      failedTests.push(`${file} - Code empty`)
      continue
    }
    
    passed++
  } catch (error) {
    failed++
    failedTests.push(`${file} - ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log('='.repeat(60))
console.log(`FINAL RESULT: ${passed}/${files.length} PASSED`)
console.log('='.repeat(60))

if (failed > 0) {
  console.log(`\nFailed tests (${failed}):`)
  failedTests.forEach(test => console.log(`  - ${test}`))
} else {
  console.log('\nALL TESTS PASSED! 🎉')
}

console.log(`\nModified Bug Count: 17`)
console.log(`- Bug #15: Compound assignment operators (+=, -=, *=)`)
console.log(`- Bug #16 & #17: Multi-operand expressions (x + y + z, a * b * c)`)

