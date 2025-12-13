/**
 * 深入探索 css-tree 类型的详细信息
 * 特别是数值范围、是否支持负数等
 */
import * as csstree from 'css-tree'

const lexer = csstree.lexer

// 递归展开类型引用
function expandType(typeName: string, depth = 0): void {
  if (depth > 5) return // 防止无限递归
  
  const indent = '  '.repeat(depth)
  const typeDef = lexer.getType(typeName)
  
  console.log(`${indent}[${typeName}]`)
  
  if (typeDef?.syntax) {
    // 遍历语法树
    csstree.definitionSyntax.walk(typeDef.syntax, {
      enter(node: any) {
        if (node.type === 'Type') {
          expandType(node.name, depth + 1)
        }
        if (node.type === 'Keyword') {
          console.log(`${indent}  keyword: ${node.name}`)
        }
      }
    })
  } else {
    console.log(`${indent}  (内置类型)`)
  }
}

console.log('=== 类型展开 ===\n')

// 展开一些复合类型
const typesToExpand = [
  'alpha-value',        // opacity 使用
  'font-weight-absolute', // font-weight 使用
  'absolute-size',      // font-size 使用
  'relative-size',      // font-size 使用
  'length-percentage',  // 很多属性使用
]

for (const t of typesToExpand) {
  console.log(`\n### ${t}`)
  expandType(t)
  console.log('')
}

// 检查是否有数值范围信息
console.log('\n=== 检查数值范围 ===\n')

function findRanges(typeName: string): void {
  const typeDef = lexer.getType(typeName)
  
  console.log(`\n### ${typeName}`)
  
  if (typeDef?.syntax) {
    csstree.definitionSyntax.walk(typeDef.syntax, {
      enter(node: any) {
        if (node.type === 'Type' && node.opts) {
          console.log(`  ${node.name}: [${node.opts.min ?? '-∞'}, ${node.opts.max ?? '+∞'}]`)
        }
      }
    })
  }
}

// 检查 alpha-value 是否有范围
findRanges('alpha-value')
findRanges('font-weight-absolute')

// 直接查看原始语法字符串
console.log('\n=== 原始语法字符串 ===\n')

// 获取所有类型
const allTypes = Object.keys((lexer as any).types || {})
console.log('css-tree 定义的类型数量:', allTypes.length)

// 找出有数值范围的类型
console.log('\n有数值范围的类型:')
for (const typeName of allTypes) {
  const typeDef = lexer.getType(typeName)
  if (typeDef?.syntax) {
    let hasRange = false
    csstree.definitionSyntax.walk(typeDef.syntax, {
      enter(node: any) {
        if (node.type === 'Type' && node.opts) {
          hasRange = true
          console.log(`  ${typeName} -> ${node.name}: [${node.opts.min ?? '-∞'}, ${node.opts.max ?? '+∞'}]`)
        }
      }
    })
  }
}

// 检查属性是否有范围信息
console.log('\n=== 属性的数值范围 ===\n')

const propsToCheck = ['opacity', 'font-weight', 'z-index', 'flex-grow', 'order']

for (const prop of propsToCheck) {
  const propDef = lexer.getProperty(prop)
  console.log(`\n### ${prop}`)
  
  if (propDef?.syntax) {
    csstree.definitionSyntax.walk(propDef.syntax, {
      enter(node: any) {
        if (node.type === 'Type') {
          console.log(`  类型: ${node.name}`)
          if (node.opts) {
            console.log(`  范围: [${node.opts.min ?? '-∞'}, ${node.opts.max ?? '+∞'}]`)
          }
          // 递归检查类型定义
          const typeDef = lexer.getType(node.name)
          if (typeDef?.syntax) {
            csstree.definitionSyntax.walk(typeDef.syntax, {
              enter(subNode: any) {
                if (subNode.type === 'Type' && subNode.opts) {
                  console.log(`    -> ${subNode.name}: [${subNode.opts.min ?? '-∞'}, ${subNode.opts.max ?? '+∞'}]`)
                }
              }
            })
          }
        }
      }
    })
  }
}
