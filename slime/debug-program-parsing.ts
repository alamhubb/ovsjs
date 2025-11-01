import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试各种顶层声明
const tests = [
  {
    name: '简单变量声明',
    code: 'const x = 1'
  },
  {
    name: '简单函数',
    code: 'function foo() { return 1 }'
  },
  {
    name: '函数with赋值',
    code: 'function bar() { x = 1 }'
  },
  {
    name: '空类',
    code: 'class A {}'
  },
  {
    name: '类with空constructor',
    code: 'class B { constructor() {} }'
  },
  {
    name: '类with返回语句',
    code: 'class C { constructor() { return 1 } }'
  },
  {
    name: '类with赋值语句',
    code: 'class D { constructor() { this.x = 1 } }'
  },
]

for (const test of tests) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`测试: ${test.name}`)
  console.log(`代码: ${test.code}`)
  
  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(test.code)
    
    const parser = new Es6Parser(tokens)
    
    // 手动设置 Parser 内部状态以便调试
    const cst = parser.Program()
    
    console.log(`✅ Parser完成`)
    console.log(`  - CST name: ${cst.name}`)
    console.log(`  - CST children: ${cst.children?.length || 0}`)
    
    if (cst.children && cst.children.length > 0) {
      console.log(`  - First child: ${cst.children[0].name}`)
    }
    
  } catch (error) {
    console.log(`❌ Parser失败: ${error instanceof Error ? error.message : error}`)
  }
}





