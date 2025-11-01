import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 测试不同的语句
const tests = [
  {
    name: '简单赋值语句',
    code: 'x = 1',
    rule: 'Program'
  },
  {
    name: '成员赋值语句',
    code: 'this.x = 1',
    rule: 'Program'
  },
  {
    name: 'Return语句',
    code: 'return 1',
    rule: null // 不能单独作为Program
  },
  {
    name: '函数with Return',
    code: 'function f() { return 1 }',
    rule: 'Program'
  },
  {
    name: '函数with 简单赋值',
    code: 'function f() { x = 1 }',
    rule: 'Program'
  },
]

for (const test of tests) {
  if (!test.rule) {
    console.log(`\n跳过: ${test.name} (不是有效的顶层代码)`)
    continue
  }
  
  console.log(`\n${'='.repeat(50)}`)
  console.log(`测试: ${test.name}`)
  console.log(`代码: ${test.code}`)
  
  try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(test.code)
    
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    
    console.log(`CST children: ${cst.children?.length || 0}`)
    
    if (cst.children && cst.children.length > 0) {
      const printCst = (node: any, indent = '') => {
        console.log(`${indent}${node.name}`)
        if (node.children && node.children.length > 0 && indent.length < 20) {
          node.children.slice(0, 5).forEach((child: any) => printCst(child, indent + '  '))
          if (node.children.length > 5) {
            console.log(`${indent}  ... (${node.children.length - 5} more)`)
          }
        }
      }
      console.log('CST 结构:')
      printCst(cst)
    } else {
      console.log('⚠️ CST 为空')
    }
    
  } catch (error) {
    console.log(`❌ 失败: ${error instanceof Error ? error.message : error}`)
  }
}




