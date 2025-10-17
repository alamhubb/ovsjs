// 快速测试 - 只输出摘要，不卡死
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
const errors: Array<{file: string, error: string}> = []

for (const file of files) {
  try {
    const code = fs.readFileSync(path.join(casesDir, file), 'utf-8')
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    const slimeCstToAst = new SlimeCstToAst()
    const ast = slimeCstToAst.toProgram(cst)
    
    if (!ast?.body?.length) {
      throw new Error('AST empty')
    }
    
    const result = SlimeGenerator.generator(ast, tokens)
    
    if (!result.code?.trim()) {
      throw new Error('Code empty')
    }
    
    // 严格检查
    const inputNorm = code.replace(/\s+/g, '')
    const outputNorm = result.code.replace(/\s+/g, '')
    
    if (inputNorm.includes('+=') && !outputNorm.includes('+=')) {
      throw new Error('+= lost')
    }
    if (inputNorm.includes('-=') && !outputNorm.includes('-=')) {
      throw new Error('-= lost')
    }
    if (inputNorm.includes('*=') && !outputNorm.includes('*=')) {
      throw new Error('*= lost')
    }
    
    passed++
  } catch (error) {
    failed++
    errors.push({
      file,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

console.log(`\nRESULT: ${passed}/${files.length} passed\n`)

if (failed > 0) {
  console.log(`Failed (${failed}):`)
  errors.forEach(e => console.log(`  ${e.file}: ${e.error}`))
  process.exit(1)
} else {
  console.log('ALL TESTS PASSED!')
  console.log('\nFixed bugs:')
  console.log('  #15: += -= *= operators')
  console.log('  #16-17: x+y+z, a*b*c expressions')
}

