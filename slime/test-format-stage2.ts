#!/usr/bin/env tsx
/**
 * 阶段2测试：验证 {} 缩进功能
 */

import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

// 测试代码：包含嵌套的 {}
const testCode = `
function greet(name) {
  const message = "Hello";
  if (name) {
    console.log(message);
    console.log(name);
  }
}
`

console.log('📝 输入代码:')
console.log(testCode)
console.log('\n' + '='.repeat(80) + '\n')

// 编译
const lexer = new SubhutiLexer(es6Tokens)
const tokens = lexer.lexer(testCode)
const parser = new Es6Parser(tokens)
const cst = parser.Program()
const slimeCstToAst = new SlimeCstToAst()
const ast = slimeCstToAst.toProgram(cst)
const result = SlimeGenerator.generator(ast, tokens)

console.log('✅ 生成代码（应该有正确的缩进）:')
console.log(result.code)
console.log('\n' + '='.repeat(80) + '\n')

// 分析缩进
const lines = result.code.split('\n')
console.log(`📊 代码行数: ${lines.length}`)
console.log('📊 每行内容（显示缩进）:')
lines.forEach((line, index) => {
  // 计算前导空格数
  const leadingSpaces = line.match(/^\s*/)?.[0].length || 0
  const indentLevel = leadingSpaces / 2
  console.log(`  行${String(index + 1).padStart(2)}: [缩进${indentLevel}层] ${line}`)
})

console.log('\n' + '='.repeat(80) + '\n')

// 验证预期缩进
console.log('🔍 验证预期缩进:')
const expectations = [
  { line: 0, indent: 0, contains: 'function greet' },
  { line: 1, indent: 1, contains: 'const message' },
  { line: 2, indent: 1, contains: 'if' },
  { line: 3, indent: 2, contains: 'console.log(message)' },
  { line: 4, indent: 2, contains: 'console.log(name)' },
  { line: 5, indent: 1, contains: '}' },  // if 的 }
  { line: 6, indent: 0, contains: '}' },  // function 的 }
]

let allCorrect = true
expectations.forEach(exp => {
  if (!lines[exp.line]) {
    console.log(`❌ 行${exp.line + 1}: 不存在`)
    allCorrect = false
    return
  }
  
  const actualIndent = (lines[exp.line].match(/^\s*/)?.[0].length || 0) / 2
  const isCorrect = actualIndent === exp.indent && lines[exp.line].includes(exp.contains)
  
  console.log(`${isCorrect ? '✅' : '❌'} 行${exp.line + 1}: 期望缩进${exp.indent}层, 实际${actualIndent}层, 包含"${exp.contains}"`)
  
  if (!isCorrect) allCorrect = false
})

console.log('\n' + '='.repeat(80) + '\n')
console.log(allCorrect ? '🎉 所有缩进验证通过！' : '❌ 部分缩进验证失败')

