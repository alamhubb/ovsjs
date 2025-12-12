/**
 * 测试 css-tree 的类型结构
 * 看它是如何通过数据结构标记 integer vs number 的
 */

import * as csstree from 'css-tree'

const lexer = (csstree as any).lexer

console.log('=== CSS-TREE 类型结构分析 ===\n')

// 1. 查看 number 和 integer 类型的内部结构
console.log('1. 内置数值类型的结构：')
const numericTypes = ['number', 'integer', 'length', 'percentage']
for (const typeName of numericTypes) {
  const typeData = lexer.types[typeName]
  console.log(`\n  ${typeName}:`)
  console.log(`    ${JSON.stringify(typeData, null, 4).split('\n').join('\n    ')}`)
}

// 2. 查看使用 integer 的属性（z-index）
console.log('\n\n2. z-index 属性的语法结构（使用 integer）：')
const zIndexData = lexer.properties['z-index']
console.log(JSON.stringify(zIndexData, null, 2))

// 3. 查看使用 number 的属性（opacity）
console.log('\n\n3. opacity 属性的语法结构（使用 number）：')
const opacityData = lexer.properties['opacity']
console.log(JSON.stringify(opacityData, null, 2))

// 4. 查看 font-weight 的语法结构（有范围的 number）
console.log('\n\n4. font-weight 属性的语法结构（有范围）：')
const fontWeightData = lexer.properties['font-weight']
console.log(JSON.stringify(fontWeightData, null, 2))

// 5. 递归展开 font-weight-absolute 类型
console.log('\n\n5. font-weight-absolute 类型的结构：')
const fontWeightAbsolute = lexer.types['font-weight-absolute']
console.log(JSON.stringify(fontWeightAbsolute, null, 2))

// 6. 总结：如何判断类型特性
console.log('\n\n6. 类型判断方法：')
console.log(`
  css-tree 通过 Type 节点的 name 属性来区分：
  - name === 'integer' → 整数，不支持小数
  - name === 'number' → 数字，支持小数
  - name === 'length' → 长度值（带单位）
  - name === 'percentage' → 百分比
  
  我们可以通过检查 Type.name 来判断是否支持小数：
  const isInteger = typeName === 'integer'
`)
