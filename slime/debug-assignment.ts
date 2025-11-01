import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试不同的赋值场景
const tests = [
  {
    name: '顶层简单赋值',
    code: 'x = 1'
  },
  {
    name: '顶层成员赋值',
    code: 'this.x = 1'
  },
  {
    name: '函数内简单赋值',
    code: 'function f() { x = 1 }'
  },
  {
    name: '函数内成员赋值',
    code: 'function f() { this.x = 1 }'
  },
  {
    name: '函数with参数and赋值',
    code: 'function f(a) { this.x = a }'
  },
  {
    name: '函数with默认参数and赋值',
    code: 'function f(a = 1) { this.x = a }'
  },
]

for (const test of tests) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`测试: ${test.name}`)
  console.log(`代码: ${test.code}`)
  
  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(test.code)
    
    // 打印关键tokens
    console.log('关键tokens:', tokens.slice(0, 15).map(t => `${t.tokenName}:${t.value}`).join(' '))
    
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    console.log(`✅ Parser完成`)
    console.log(`  - CST children: ${cst.children?.length || 0}`)
    
    if (cst.children && cst.children.length === 0) {
      console.log('  ⚠️ 解析失败（空CST）')
    }
    
  } catch (error) {
    console.log(`❌ Parser失败: ${error instanceof Error ? error.message : error}`)
  }
}






