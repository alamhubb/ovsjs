/**
 * ES2025 Parser 测试文件
 * 使用 Subhuti Parser 的 debug 模式进行测试
 */

import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import Es2025Parser from './Es2025Parser.ts'
import { es2025Tokens } from './Es2025Tokens.ts'

/**
 * 测试用例接口
 */
interface TestCase {
  name: string
  code: string
  rule: keyof Es2025Parser
  shouldPass: boolean
}

/**
 * 执行单个测试
 */
function runTest(testCase: TestCase): void {
  console.log('\n' + '='.repeat(60))
  console.log(`🧪 测试：${testCase.name}`)
  console.log('='.repeat(60))
  console.log(`代码：\n${testCase.code}`)
  console.log('-'.repeat(60))
  
  try {
    // 1. 词法分析
    const lexer = new SubhutiLexer(es2025Tokens)
    const tokens = lexer.tokenize(testCase.code)
    console.log(`✅ 词法分析成功，生成 ${tokens.length} 个 tokens`)
    
    // 2. 语法分析（启用 debug 模式）
    const parser = new Es2025Parser(tokens)
      .debug(true)      // 启用 debug 跟踪
      .errorHandler(true)  // 启用详细错误信息
    
    console.log(`\n📊 开始解析规则：${testCase.rule}`)
    console.log('-'.repeat(60))
    
    const ruleMethod = parser[testCase.rule] as Function
    if (!ruleMethod) {
      console.error(`❌ 规则 ${testCase.rule} 不存在`)
      return
    }
    
    const cst = ruleMethod.call(parser)
    
    if (cst) {
      console.log('\n✅ 解析成功！')
      console.log(`CST 根节点：${cst.name}`)
      console.log(`子节点数量：${cst.children?.length || 0}`)
      
      if (testCase.shouldPass) {
        console.log('✅ 测试通过（预期成功，实际成功）')
      } else {
        console.log('⚠️  测试失败（预期失败，实际成功）')
      }
      
      // 打印简化的 CST 结构
      console.log('\n📦 CST 结构（简化）：')
      printCstSimple(cst, 0, 2)  // 只打印前2层
      
    } else {
      console.log('\n❌ 解析失败，返回 undefined')
      
      if (!testCase.shouldPass) {
        console.log('✅ 测试通过（预期失败，实际失败）')
      } else {
        console.log('❌ 测试失败（预期成功，实际失败）')
      }
    }
    
  } catch (error) {
    console.log('\n💥 解析异常：')
    console.error(error instanceof Error ? error.message : error)
    
    if (!testCase.shouldPass) {
      console.log('✅ 测试通过（预期失败，抛出异常）')
    } else {
      console.log('❌ 测试失败（预期成功，抛出异常）')
    }
  }
}

/**
 * 打印简化的 CST 结构
 */
function printCstSimple(cst: any, depth: number, maxDepth: number): void {
  if (depth > maxDepth) return
  
  const indent = '  '.repeat(depth)
  const value = cst.value ? ` = "${cst.value}"` : ''
  console.log(`${indent}${cst.name}${value}`)
  
  if (cst.children) {
    for (const child of cst.children) {
      printCstSimple(child, depth + 1, maxDepth)
    }
  }
}

/**
 * 测试套件
 */
const testCases: TestCase[] = [
  // ============================================
  // 1. 基础测试
  // ============================================
  {
    name: '字面量 - 数字',
    code: '42',
    rule: 'Literal',
    shouldPass: true
  },
  {
    name: '字面量 - 字符串',
    code: '"hello"',
    rule: 'Literal',
    shouldPass: true
  },
  {
    name: '字面量 - 布尔值',
    code: 'true',
    rule: 'Literal',
    shouldPass: true
  },
  {
    name: '字面量 - null',
    code: 'null',
    rule: 'Literal',
    shouldPass: true
  },
  
  // ============================================
  // 2. 标识符测试
  // ============================================
  {
    name: '标识符 - 普通变量',
    code: 'myVariable',
    rule: 'Identifier',
    shouldPass: true
  },
  {
    name: '标识符 - 保留字（应失败）',
    code: 'function',
    rule: 'Identifier',
    shouldPass: false
  },
  
  // ============================================
  // 3. 表达式测试
  // ============================================
  {
    name: '表达式 - 简单加法',
    code: '1 + 2',
    rule: 'Expression',
    shouldPass: true
  },
  {
    name: '表达式 - 复杂运算',
    code: 'a + b * c',
    rule: 'Expression',
    shouldPass: true
  },
  {
    name: '表达式 - 括号',
    code: '(a + b) * c',
    rule: 'Expression',
    shouldPass: true
  },
  
  // ============================================
  // 4. 变量声明测试
  // ============================================
  {
    name: '变量声明 - let',
    code: 'let x = 10',
    rule: 'LexicalDeclaration',
    shouldPass: true
  },
  {
    name: '变量声明 - const',
    code: 'const name = "John"',
    rule: 'LexicalDeclaration',
    shouldPass: true
  },
  {
    name: '变量声明 - 多个变量',
    code: 'let a = 1, b = 2',
    rule: 'LexicalDeclaration',
    shouldPass: true
  },
  
  // ============================================
  // 5. 函数声明测试
  // ============================================
  {
    name: '函数声明 - 简单函数',
    code: 'function add(a, b) { return a + b }',
    rule: 'FunctionDeclaration',
    shouldPass: true
  },
  {
    name: '函数声明 - 无参数',
    code: 'function hello() { console.log("Hello") }',
    rule: 'FunctionDeclaration',
    shouldPass: true
  },
  
  // ============================================
  // 6. 箭头函数测试
  // ============================================
  {
    name: '箭头函数 - 单参数',
    code: 'x => x * 2',
    rule: 'ArrowFunction',
    shouldPass: true
  },
  {
    name: '箭头函数 - 多参数',
    code: '(a, b) => a + b',
    rule: 'ArrowFunction',
    shouldPass: true
  },
  {
    name: '箭头函数 - 块体',
    code: '(x) => { return x * 2 }',
    rule: 'ArrowFunction',
    shouldPass: true
  },
  
  // ============================================
  // 7. 语句测试
  // ============================================
  {
    name: '语句 - if 语句',
    code: 'if (x > 0) { console.log("positive") }',
    rule: 'IfStatement',
    shouldPass: true
  },
  {
    name: '语句 - for 循环',
    code: 'for (let i = 0; i < 10; i++) { sum += i }',
    rule: 'ForStatement',
    shouldPass: true
  },
  {
    name: '语句 - while 循环',
    code: 'while (x < 10) { x++ }',
    rule: 'WhileStatement',
    shouldPass: true
  },
  
  // ============================================
  // 8. 模块测试
  // ============================================
  {
    name: '模块 - import',
    code: 'import React from "react"',
    rule: 'ImportDeclaration',
    shouldPass: true
  },
  {
    name: '模块 - export',
    code: 'export const PI = 3.14',
    rule: 'ExportDeclaration',
    shouldPass: true
  },
  
  // ============================================
  // 9. 完整程序测试
  // ============================================
  {
    name: '完整程序 - 简单脚本',
    code: 'const x = 10;\nconst y = 20;\nconsole.log(x + y);',
    rule: 'Script',
    shouldPass: true
  },
  {
    name: '完整模块 - 带 import/export',
    code: 'import React from "react";\nexport default function App() { return null }',
    rule: 'Module',
    shouldPass: true
  },
]

/**
 * 运行所有测试
 */
function runAllTests(): void {
  console.log('\n' + '█'.repeat(60))
  console.log('🚀 ES2025 Parser 测试套件')
  console.log('   使用 Subhuti Debug 模式')
  console.log('█'.repeat(60))
  
  let passCount = 0
  let failCount = 0
  
  for (const testCase of testCases) {
    try {
      runTest(testCase)
      passCount++
    } catch (error) {
      console.error('💥 测试执行错误：', error)
      failCount++
    }
  }
  
  // 总结
  console.log('\n' + '█'.repeat(60))
  console.log('📊 测试总结')
  console.log('█'.repeat(60))
  console.log(`总测试数：${testCases.length}`)
  console.log(`✅ 通过：${passCount}`)
  console.log(`❌ 失败：${failCount}`)
  console.log(`成功率：${((passCount / testCases.length) * 100).toFixed(1)}%`)
  console.log('█'.repeat(60))
}

/**
 * 运行单个指定测试（用于调试）
 */
function runSingleTest(index: number): void {
  if (index < 0 || index >= testCases.length) {
    console.error(`❌ 测试索引 ${index} 超出范围 [0, ${testCases.length - 1}]`)
    return
  }
  
  console.log(`\n🎯 运行单个测试 [${index}]`)
  runTest(testCases[index])
}

// ============================================
// 主程序入口
// ============================================

// 获取命令行参数
const args = process.argv.slice(2)

if (args.length === 0) {
  // 没有参数：运行所有测试
  runAllTests()
} else if (args[0] === '--test' && args[1]) {
  // --test N：运行指定索引的测试
  const index = parseInt(args[1], 10)
  runSingleTest(index)
} else if (args[0] === '--list') {
  // --list：列出所有测试
  console.log('\n📋 可用测试列表：\n')
  testCases.forEach((test, index) => {
    console.log(`[${index}] ${test.name}`)
    console.log(`    规则：${test.rule}`)
    console.log(`    代码：${test.code.substring(0, 50)}${test.code.length > 50 ? '...' : ''}`)
    console.log()
  })
} else {
  console.log(`
使用方法：
  npx tsx test-es2025-parser.ts           # 运行所有测试
  npx tsx test-es2025-parser.ts --test N  # 运行指定测试 (N 为索引)
  npx tsx test-es2025-parser.ts --list    # 列出所有测试
  `)
}

