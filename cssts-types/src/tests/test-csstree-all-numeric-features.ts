/**
 * 全面检查 css-tree 数值类型的所有特性
 */

import * as csstree from 'css-tree'

const lexer = (csstree as any).lexer

console.log('=== CSS-TREE 数值特性全面检查 ===\n')

// 1. 检查所有数值相关的类型
console.log('1. 所有数值相关类型：')
const allTypes = Object.keys(lexer.types)
const numericRelatedTypes = allTypes.filter(name => {
  const lower = name.toLowerCase()
  return lower.includes('number') || 
         lower.includes('integer') || 
         lower.includes('length') || 
         lower.includes('percentage') ||
         lower.includes('angle') ||
         lower.includes('time') ||
         lower.includes('resolution') ||
         lower.includes('flex') ||
         lower.includes('ratio')
})
console.log(`  找到 ${numericRelatedTypes.length} 个数值相关类型：`)
console.log(`  ${numericRelatedTypes.join(', ')}`)

// 2. 检查是否有负数相关的标记
console.log('\n2. 检查负数支持（通过 min 值判断）：')

// 查找有 Range 且 min < 0 的类型
function findRangesInSyntax(syntax: any, path: string = ''): any[] {
  const ranges: any[] = []
  if (!syntax) return ranges
  
  if (syntax.type === 'Type' && syntax.opts?.type === 'Range') {
    ranges.push({
      path,
      type: syntax.name,
      min: syntax.opts.min,
      max: syntax.opts.max
    })
  }
  
  if (syntax.terms) {
    for (const term of syntax.terms) {
      ranges.push(...findRangesInSyntax(term, path))
    }
  }
  if (syntax.term) {
    ranges.push(...findRangesInSyntax(syntax.term, path))
  }
  
  return ranges
}

// 检查一些属性的范围
const propsToCheck = ['z-index', 'font-weight', 'opacity', 'flex-grow', 'order', 'line-height']
for (const prop of propsToCheck) {
  const propData = lexer.properties[prop]
  if (propData?.syntax) {
    const ranges = findRangesInSyntax(propData.syntax, prop)
    if (ranges.length > 0) {
      console.log(`  ${prop}:`, ranges)
    } else {
      console.log(`  ${prop}: 无明确范围`)
    }
  }
}

// 3. 检查单位相关的类型
console.log('\n3. 带单位的类型：')
const unitTypes = ['length', 'angle', 'time', 'frequency', 'resolution', 'flex']
for (const typeName of unitTypes) {
  const typeData = lexer.types[typeName]
  console.log(`  ${typeName}: ${typeData ? '存在' : '不存在'}`)
}

// 4. 检查特殊数值类型
console.log('\n4. 特殊数值类型：')
const specialTypes = [
  'alpha-value',      // 透明度
  'hue',              // 色相
  'ratio',            // 比例（如 aspect-ratio）
  'dimension',        // 带单位的数值
  'positive-integer', // 正整数
]
for (const typeName of specialTypes) {
  const typeData = lexer.types[typeName]
  if (typeData) {
    console.log(`  ${typeName}: 存在`)
    if (typeData.syntax) {
      // 递归查找内部类型
      function findTypes(node: any): string[] {
        const types: string[] = []
        if (!node) return types
        if (node.type === 'Type') types.push(node.name)
        if (node.terms) node.terms.forEach((t: any) => types.push(...findTypes(t)))
        if (node.term) types.push(...findTypes(node.term))
        return types
      }
      const innerTypes = findTypes(typeData.syntax)
      if (innerTypes.length > 0) {
        console.log(`    内部类型: ${innerTypes.join(', ')}`)
      }
    }
  }
}

// 5. 检查 aspect-ratio 属性（使用 ratio 类型）
console.log('\n5. aspect-ratio 属性结构：')
const aspectRatio = lexer.properties['aspect-ratio']
if (aspectRatio?.syntax) {
  console.log(JSON.stringify(aspectRatio.syntax, null, 2))
}

// 6. 总结需要考虑的数值特性
console.log('\n6. 数值特性总结：')
console.log(`
  需要考虑的特性：
  ┌─────────────────┬──────────────────────────────────────┐
  │ 特性            │ css-tree 如何标记                     │
  ├─────────────────┼──────────────────────────────────────┤
  │ 整数 vs 小数    │ Type.name: 'integer' vs 'number'     │
  │ 数值范围        │ Type.opts.Range: { min, max }        │
  │ 是否支持负数    │ 通过 min 值判断（min < 0 或无限制）   │
  │ 单位类型        │ Type.name: 'length', 'angle', etc.   │
  │ 比例值          │ Type.name: 'ratio' (如 16/9)         │
  └─────────────────┴──────────────────────────────────────┘
  
  注意：css-tree 没有显式的 "allowNegative" 标记，
  负数支持是通过 min 值隐式表达的：
  - min >= 0 → 不支持负数
  - min < 0 或无 min → 支持负数
`)
