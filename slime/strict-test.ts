// 严格测试：检查生成代码的实际正确性
import { readFileSync } from 'fs'
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

const criticalTests = [
  {file: '29-rest-in-destructuring.js', check: (code: string) => code.includes('{a, ...others}')},
  {file: '47-promises.js', check: (code: string) => code.includes('.then') && code.includes('.catch')},
  {file: '50-comprehensive.js', checks: [
    {name: 'generator方法*号', check: (code: string) => code.includes('*getUsers')},
    {name: '成员访问链', check: (code: string) => code.includes('.users.length')},
    {name: '计算属性名', check: (code: string) => code.includes('[Symbol.iterator]')},
    {name: '完整条件', check: (code: string) => code.includes('index < users.length')},
  ]},
]

let totalPassed = 0
let totalFailed = 0

criticalTests.forEach(test => {
  const filepath = `tests/cases/${test.file}`
  const source = readFileSync(filepath, 'utf-8')
  
  const lexer = new SubhutiLexer(es6Tokens)
  const tokens = lexer.lexer(source)
  
  const parser = new Es6Parser(tokens)
  const cst = parser.Program()
  
  const slimeCstToAst = new SlimeCstToAst()
  const ast = slimeCstToAst.toProgram(cst)
  
  const result = SlimeGenerator.generator(ast, tokens)
  
  console.log(`\n📝 ${test.file}`)
  
  if ('check' in test) {
    const passed = test.check(result.code)
    console.log(`  ${passed ? '✅' : '❌'} ${passed ? '通过' : '失败'}`)
    if (passed) totalPassed++
    else totalFailed++
  } else if ('checks' in test) {
    test.checks.forEach((c: any) => {
      const passed = c.check(result.code)
      console.log(`  ${passed ? '✅' : '❌'} ${c.name}`)
      if (passed) totalPassed++
      else totalFailed++
    })
  }
})

console.log(`\n📊 关键特性测试: ${totalPassed}/${totalPassed + totalFailed} 通过`)

