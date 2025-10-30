#!/usr/bin/env tsx
/**
 * 🔍 AST loc调试工具
 * 
 * 目标：检查Identifier节点的loc是否正确设置
 */

import { readFileSync } from 'fs'
import { vitePluginOvsTransform } from './src/index.ts'
import { ovs6Tokens } from './src/parser/OvsConsumer.ts'
import OvsTokenConsumer from './src/parser/OvsConsumer.ts'
import OvsParser from './src/parser/OvsParser.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import OvsCstToSlimeAstUtil from './src/factory/OvsCstToSlimeAstUtil.ts'

const source = readFileSync('tests/cases/mapping/10-mixed-scenario.ovs', 'utf-8')

console.log('📄 源码:')
console.log(source)
console.log('\n' + '='.repeat(80))

// 1. Lexical Analysis
const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(source)

// 2. Parsing
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()

// 3. AST conversion
const ast = OvsCstToSlimeAstUtil.toProgram(cst)

// 递归遍历AST，找到所有Identifier
function findIdentifiers(node: any, path: string = 'root', depth: number = 0): void {
  if (!node || typeof node !== 'object') return
  
  // 检查是否是Identifier
  if (node.type === 'Identifier') {
    const indent = '  '.repeat(depth)
    console.log(`${indent}🔍 [${path}] Identifier: "${node.name}"`)
    if (node.loc) {
      const sourceText = source.substring(node.loc.start.index, node.loc.end.index)
      console.log(`${indent}   位置: ${node.loc.start.index}-${node.loc.end.index}`)
      console.log(`${indent}   源码: "${sourceText}"`)
      console.log(`${indent}   loc.value: "${node.loc.value}"`)
      
      // 检查是否匹配
      if (sourceText !== node.name && sourceText !== node.loc.value) {
        console.log(`${indent}   ⚠️ 不匹配！name="${node.name}" sourceText="${sourceText}" loc.value="${node.loc.value}"`)
      }
    } else {
      console.log(`${indent}   ⚠️ 没有loc信息！`)
    }
    console.log('')
  }
  
  // 递归遍历子节点
  if (Array.isArray(node)) {
    node.forEach((child, i) => findIdentifiers(child, `${path}[${i}]`, depth + 1))
  } else {
    for (const key in node) {
      if (key !== 'loc' && node[key] && typeof node[key] === 'object') {
        findIdentifiers(node[key], `${path}.${key}`, depth + 1)
      }
    }
  }
}

console.log('\n📊 所有Identifier节点的loc信息:\n')
findIdentifiers(ast.body)

console.log('\n' + '='.repeat(80))
console.log('💡 分析：')
console.log('检查h1 { title }中的title节点的loc是否指向正确的源码位置（164-169）')
console.log('还是错误地指向了声明位置（48-53）')

