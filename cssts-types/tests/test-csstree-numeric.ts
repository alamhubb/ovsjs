/**
 * 测试 css-tree 能否自动提取数值范围
 */

import * as csstree from 'css-tree'

const lexer = (csstree as any).lexer

console.log('='.repeat(60))
console.log('CSS-TREE 数值提取测试')
console.log('='.repeat(60))

// 递归提取所有语法节点
function extractAllNodes(syntax: any, visited: Set<string> = new Set()): any[] {
  const nodes: any[] = []
  if (!syntax) return nodes
  
  nodes.push(syntax)
  
  if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      nodes.push(...extractAllNodes(term, visited))
    }
  } else if (syntax.type === 'Type' && syntax.name) {
    if (!visited.has(syntax.name)) {
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        nodes.push(...extractAllNodes(typeData.syntax, visited))
      }
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    nodes.push(...extractAllNodes(syntax.term, visited))
  }
  
  return nodes
}

// 测试 font-weight
console.log('\n📋 font-weight 语法分析:')
const fontWeightData = lexer.properties['font-weight']
if (fontWeightData) {
  console.log('原始语法:', JSON.stringify(fontWeightData.syntax, null, 2))
  
  const nodes = extractAllNodes(fontWeightData.syntax)
  console.log('\n所有节点类型:')
  const types = [...new Set(nodes.map(n => n.type))]
  console.log(types)
  
  // 查找 Range 或 Number 类型
  const rangeNodes = nodes.filter(n => n.type === 'Range' || n.type === 'Number')
  console.log('\nRange/Number 节点:', rangeNodes)
}

// 查看 font-weight-absolute 类型
console.log('\n📋 font-weight-absolute 类型:')
const fwAbsolute = lexer.types['font-weight-absolute']
if (fwAbsolute) {
  console.log('语法:', JSON.stringify(fwAbsolute.syntax, null, 2))
}

// 查看所有包含数值范围的类型
console.log('\n📋 查找包含数值范围的语法:')
for (const [name, data] of Object.entries(lexer.types).slice(0, 20)) {
  const syntaxStr = JSON.stringify((data as any).syntax)
  if (syntaxStr && (syntaxStr.includes('Range') || syntaxStr.includes('min') || syntaxStr.includes('max'))) {
    console.log(`  ${name}:`, syntaxStr.slice(0, 100))
  }
}

// 测试 opacity
console.log('\n📋 opacity 语法分析:')
const opacityData = lexer.properties['opacity']
if (opacityData) {
  console.log('语法:', JSON.stringify(opacityData.syntax, null, 2))
}

// 测试 z-index
console.log('\n📋 z-index 语法分析:')
const zIndexData = lexer.properties['z-index']
if (zIndexData) {
  console.log('语法:', JSON.stringify(zIndexData.syntax, null, 2))
}

// 查看 integer 类型
console.log('\n📋 integer 类型:')
const integerType = lexer.types['integer']
if (integerType) {
  console.log('语法:', JSON.stringify(integerType, null, 2))
}

// 查看 number 类型
console.log('\n📋 number 类型:')
const numberType = lexer.types['number']
if (numberType) {
  console.log('语法:', JSON.stringify(numberType, null, 2))
}

// 测试 length 类型（带单位）
console.log('\n📋 length 类型:')
const lengthType = lexer.types['length']
if (lengthType) {
  console.log('语法:', JSON.stringify(lengthType, null, 2))
}

// 测试 padding 属性（看是否有单位信息）
console.log('\n📋 padding 语法分析:')
const paddingData = lexer.properties['padding']
if (paddingData) {
  console.log('语法:', JSON.stringify(paddingData.syntax, null, 2))
}

// 测试 width 属性
console.log('\n📋 width 语法分析:')
const widthData = lexer.properties['width']
if (widthData) {
  console.log('语法:', JSON.stringify(widthData.syntax, null, 2))
}

// 查看 length-percentage 类型
console.log('\n📋 length-percentage 类型:')
const lpType = lexer.types['length-percentage']
if (lpType) {
  console.log('语法:', JSON.stringify(lpType.syntax, null, 2))
}

// 查看 percentage 类型
console.log('\n📋 percentage 类型:')
const percentType = lexer.types['percentage']
if (percentType) {
  console.log('语法:', JSON.stringify(percentType, null, 2))
}
