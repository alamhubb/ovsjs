/**
 * 测试 css-tree 如何处理数值类型的特性：
 * - 是否支持负数
 * - 是否支持小数
 * - 数值范围
 */

import * as csstree from 'css-tree'

const lexer = (csstree as any).lexer

// 测试不同的数值类型
const numericTypes = ['number', 'integer', 'length', 'percentage', 'angle', 'time']

console.log('=== CSS-TREE 数值类型分析 ===\n')

// 1. 查看类型定义
console.log('1. 数值类型的语法定义：')
for (const typeName of numericTypes) {
  const typeData = lexer.types[typeName]
  if (typeData) {
    console.log(`  ${typeName}:`, typeData.syntax ? csstree.generate(typeData.syntax) : '(内置类型)')
  }
}

// 2. 测试具体属性的数值范围
console.log('\n2. 属性的数值范围：')

const testProperties = [
  'font-weight',  // 1-1000
  'opacity',      // 0-1
  'z-index',      // 任意整数
  'width',        // 非负
  'margin',       // 可负
  'line-height',  // 可以是纯数字
]

for (const prop of testProperties) {
  const propData = lexer.properties[prop]
  if (propData && propData.syntax) {
    console.log(`\n  ${prop}:`)
    
    // 递归查找类型和范围
    function findTypesAndRanges(node: any, depth: number = 0): void {
      if (!node) return
      const indent = '    '.repeat(depth + 1)
      
      if (node.type === 'Type') {
        console.log(`${indent}类型: <${node.name}>`)
      }
      
      if (node.type === 'Range') {
        console.log(`${indent}范围: [${node.min}, ${node.max}]`)
      }
      
      if (node.terms) {
        for (const term of node.terms) {
          findTypesAndRanges(term, depth)
        }
      }
      
      if (node.term) {
        findTypesAndRanges(node.term, depth)
      }
    }
    
    findTypesAndRanges(propData.syntax)
  }
}

// 3. 验证具体值
console.log('\n3. 验证具体值是否合法：')

const testCases = [
  // font-weight
  { prop: 'font-weight', value: '100', expect: true },
  { prop: 'font-weight', value: '1000', expect: true },
  { prop: 'font-weight', value: '0', expect: false },      // 超出范围
  { prop: 'font-weight', value: '1001', expect: false },   // 超出范围
  { prop: 'font-weight', value: '450.5', expect: true },   // 小数
  { prop: 'font-weight', value: '-100', expect: false },   // 负数
  
  // opacity
  { prop: 'opacity', value: '0', expect: true },
  { prop: 'opacity', value: '1', expect: true },
  { prop: 'opacity', value: '0.5', expect: true },
  { prop: 'opacity', value: '-0.5', expect: false },       // 负数
  { prop: 'opacity', value: '1.5', expect: false },        // 超出范围
  
  // z-index
  { prop: 'z-index', value: '0', expect: true },
  { prop: 'z-index', value: '100', expect: true },
  { prop: 'z-index', value: '-1', expect: true },          // 支持负数
  { prop: 'z-index', value: '1.5', expect: false },        // 不支持小数（integer）
  
  // width
  { prop: 'width', value: '100px', expect: true },
  { prop: 'width', value: '0', expect: true },
  { prop: 'width', value: '-100px', expect: false },       // 不支持负数
  { prop: 'width', value: '50%', expect: true },
  
  // margin
  { prop: 'margin', value: '100px', expect: true },
  { prop: 'margin', value: '-100px', expect: true },       // 支持负数
  { prop: 'margin', value: '50%', expect: true },
  { prop: 'margin', value: '-50%', expect: true },         // 负百分比
  
  // line-height
  { prop: 'line-height', value: '1.5', expect: true },     // 纯数字
  { prop: 'line-height', value: '24px', expect: true },
  { prop: 'line-height', value: '150%', expect: true },
  { prop: 'line-height', value: '-1.5', expect: false },   // 负数
]

for (const { prop, value, expect } of testCases) {
  const result = lexer.matchProperty(prop, value)
  const isValid = result.matched !== null
  const status = isValid === expect ? '✅' : '❌'
  console.log(`  ${status} ${prop}: ${value} → ${isValid ? '合法' : '不合法'}${isValid !== expect ? ' (预期: ' + expect + ')' : ''}`)
}

// 4. 总结数值类型特性
console.log('\n4. 数值类型特性总结：')
console.log(`
  | 类型 | 支持负数 | 支持小数 | 说明 |
  |------|---------|---------|------|
  | number | 看属性 | ✅ | 通用数字类型 |
  | integer | 看属性 | ❌ | 整数类型 |
  | length | 看属性 | ✅ | 长度（px, em, rem...） |
  | percentage | 看属性 | ✅ | 百分比 |
  
  负数支持取决于具体属性的语法定义，不是类型本身决定的。
`)
