#!/usr/bin/env tsx
/**
 * 🔍 ArrayExpression loc调试
 * 
 * 目标：检查children数组的loc是什么，是否传递给了addLBracket
 */

import { readFileSync } from 'fs'
import { ovs6Tokens } from './src/parser/OvsConsumer.ts'
import OvsTokenConsumer from './src/parser/OvsConsumer.ts'
import OvsParser from './src/parser/OvsParser.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'
import OvsCstToSlimeAstUtil from './src/factory/OvsCstToSlimeAstUtil.ts'

const source = `div {
  h1 { title }
}`

console.log('📄 测试源码:')
console.log(source)
console.log('\n' + '='.repeat(80))

// Parse
const lexer = new SubhutiLexer(ovs6Tokens)
const tokens = lexer.lexer(source)
const parser = new OvsParser(tokens, OvsTokenConsumer)
const cst = parser.Program()
const ast = OvsCstToSlimeAstUtil.toProgram(cst)

// 找到所有ArrayExpression
function findArrayExpressions(node: any, path: string = 'root', depth: number = 0): void {
  if (!node || typeof node !== 'object') return
  
  if (node.type === 'ArrayExpression') {
    const indent = '  '.repeat(depth)
    console.log(`${indent}🔍 [${path}] ArrayExpression:`)
    console.log(`${indent}   elements: ${node.elements?.length || 0}个`)
    
    if (node.loc) {
      console.log(`${indent}   loc: ${node.loc.start.index}-${node.loc.end.index}`)
      console.log(`${indent}   loc.value: "${node.loc.value}"`)
      const sourceText = source.substring(node.loc.start.index, node.loc.end.index)
      console.log(`${indent}   源码: "${sourceText}"`)
    } else {
      console.log(`${indent}   ⚠️ 没有loc！`)
    }
    
    // 显示元素
    if (node.elements) {
      node.elements.forEach((elem: any, i: number) => {
        if (elem) {
          console.log(`${indent}     元素[${i}]: type=${elem.type}, name=${elem.name || '(无)'}`)
          if (elem.loc) {
            const elemText = source.substring(elem.loc.start.index, elem.loc.end.index)
            console.log(`${indent}              loc=${elem.loc.start.index}-${elem.loc.end.index}, 源码="${elemText}"`)
          }
        } else {
          console.log(`${indent}     元素[${i}]: null（空元素）`)
        }
      })
    }
    console.log('')
  }
  
  // 递归
  if (Array.isArray(node)) {
    node.forEach((child, i) => findArrayExpressions(child, `${path}[${i}]`, depth + 1))
  } else {
    for (const key in node) {
      if (key !== 'loc' && node[key] && typeof node[key] === 'object') {
        findArrayExpressions(node[key], `${path}.${key}`, depth + 1)
      }
    }
  }
}

console.log('\n📊 所有ArrayExpression节点:\n')
findArrayExpressions(ast.body)

console.log('='.repeat(80))
console.log('💡 关键问题：')
console.log('1. children数组的ArrayExpression有loc吗？')
console.log('2. 如果有，loc指向哪里？（源码中没有[],loc应该为空或指向整个视图）')
console.log('3. addLBracket(node.loc)是否错误地为自动生成的[记录了映射？')

