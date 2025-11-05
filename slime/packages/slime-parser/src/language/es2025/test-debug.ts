/**
 * Es2025Parser Debug 测试脚本
 * 使用 SubhutiParser 的 debug 功能测试解析器
 */

import Es2025Parser from './Es2025Parser.ts'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import { es2025Tokens } from './Es2025Tokens.ts'

// 测试用例
const testCases = [
  {
    name: '简单变量声明',
    code: 'let x = 1;'
  },
  {
    name: '函数声明',
    code: 'function foo() { return 42; }'
  },
  {
    name: '箭头函数',
    code: 'const add = (a, b) => a + b;'
  },
  {
    name: '类声明',
    code: 'class MyClass { constructor() {} }'
  },
  {
    name: 'async 函数',
    code: 'async function fetchData() { return await fetch("/api"); }'
  },
  {
    name: 'yield 表达式',
    code: 'function* gen() { yield 1; }'
  },
  {
    name: '解构赋值',
    code: 'const { a, b } = { a: 1, b: 2 };'
  },
  {
    name: '模板字符串',
    code: 'const str = `Hello ${name}!`;'
  },
  {
    name: '表达式语句',
    code: 'x++;'
  },
  {
    name: 'if 语句',
    code: 'if (x > 0) { console.log("positive"); }'
  }
]

console.log('🧪 Es2025Parser Debug 测试')
console.log('='.repeat(80))

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i]
  
  console.log(`\n[${i + 1}/${testCases.length}] 测试: ${testCase.name}`)
  console.log(`代码: ${testCase.code}`)
  console.log('-'.repeat(80))
  
  try {
    // 1. 词法分析
    const lexer = new SubhutiLexer(es2025Tokens)
    const tokens = lexer.tokenize(testCase.code)
    
    // 过滤掉注释和空白
    const validTokens = tokens.filter((t: any) => {
      const tokenName = t.tokenType?.name || ''
      return tokenName !== 'SingleLineComment' &&
        tokenName !== 'MultiLineComment' &&
        tokenName !== 'Spacing' &&
        tokenName !== 'LineBreak'
    })
    
    console.log(`✅ 词法分析: ${tokens.length} tokens (有效: ${validTokens.length})`)
    
    // 2. 语法分析（启用 debug）
    console.log('\n🔍 调试输出:')
    console.log('─'.repeat(80))
    
    const parser = new Es2025Parser(tokens).debug(true)
    
    // 根据代码类型选择合适的入口规则
    let cst
    if (testCase.code.includes('import') || testCase.code.includes('export')) {
      cst = parser.Module()
    } else {
      cst = parser.Script()
    }
    
    console.log('─'.repeat(80))
    
    if (!cst) {
      throw new Error('Parser 返回 undefined')
    }
    
    console.log(`\n✅ 语法分析成功`)
    console.log(`   CST 根节点: ${cst.name}`)
    console.log(`   子节点数: ${cst.children?.length || 0}`)
    
    if (cst.children && cst.children.length > 0) {
      console.log(`   子节点类型: ${cst.children.map(c => c.name).join(', ')}`)
    }
    
    // 输出部分 CST 结构（前 3 层）
    console.log('\n📊 CST 结构预览:')
    printCST(cst, 0, 2)
    
    console.log(`\n🎉 测试通过！`)
    
  } catch (error: any) {
    console.log(`\n❌ 测试失败`)
    console.log(`   错误: ${error.message}`)
    if (error.stack) {
      console.log(`   堆栈: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
    }
  }
}

console.log('\n' + '='.repeat(80))
console.log('测试完成')

/**
 * 打印 CST 结构（限制深度）
 */
function printCST(node: any, depth: number, maxDepth: number): void {
  if (depth > maxDepth) return
  
  const indent = '  '.repeat(depth)
  const name = node.name || 'unknown'
  const value = node.value ? ` = "${node.value}"` : ''
  const childrenCount = node.children?.length || 0
  
  console.log(`${indent}${name}${value}${childrenCount > 0 ? ` (${childrenCount})` : ''}`)
  
  if (node.children && depth < maxDepth) {
    for (const child of node.children) {
      printCST(child, depth + 1, maxDepth)
    }
  }
}

