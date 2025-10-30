#!/usr/bin/env tsx
/**
 * 阶段2测试：验证缩进后 mapping 仍然准确
 */

import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import { es6Tokens } from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import { SlimeCstToAst } from './packages/slime-parser/src/language/SlimeCstToAstUtil.ts'
import SlimeGenerator from './packages/slime-generator/src/SlimeGenerator.ts'

// 测试代码
const testCode = `const title = "Hello";
if (true) {
  console.log(title);
}`

console.log('📝 源代码:')
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

console.log('✅ 生成代码（带缩进）:')
console.log(result.code)
console.log('\n' + '='.repeat(80) + '\n')

// 验证关键映射
console.log('🔍 验证关键映射:')

// 查找所有 "title" 的映射
const titleMappings = result.mapping.filter(m => m.source?.value === 'title')
console.log(`\n1. "title" 的映射数量: ${titleMappings.length}`)
titleMappings.forEach((map, i) => {
  const sourcePos = map.source.start?.index
  const generatePos = map.generate.index
  const generateChar = result.code[generatePos]
  console.log(`   映射${i + 1}: 源位置 ${sourcePos} → 生成位置 ${generatePos}, 字符="${generateChar}"`)
  
  // 验证生成位置的字符是否正确
  const expectedStart = result.code.substring(generatePos, generatePos + 5)
  console.log(`   生成代码片段: "${expectedStart}"`)
  
  if (expectedStart.startsWith('title')) {
    console.log(`   ✅ 映射准确！`)
  } else {
    console.log(`   ❌ 映射错误！期望 "title"，实际 "${expectedStart}"`)
  }
})

// 查找 "console" 的映射
const consoleMappings = result.mapping.filter(m => m.source?.value === 'console')
console.log(`\n2. "console" 的映射数量: ${consoleMappings.length}`)
consoleMappings.forEach((map, i) => {
  const sourcePos = map.source.start?.index
  const generatePos = map.generate.index
  
  console.log(`   映射${i + 1}: 源位置 ${sourcePos} → 生成位置 ${generatePos}`)
  
  const expectedStart = result.code.substring(generatePos, generatePos + 7)
  console.log(`   生成代码片段: "${expectedStart}"`)
  
  if (expectedStart.startsWith('console')) {
    console.log(`   ✅ 映射准确！`)
  } else {
    console.log(`   ❌ 映射错误！期望 "console"，实际 "${expectedStart}"`)
  }
})

console.log('\n' + '='.repeat(80) + '\n')
console.log('🎯 总结：缩进功能 + mapping 准确性验证完成')

