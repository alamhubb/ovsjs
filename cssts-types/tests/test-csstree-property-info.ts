/**
 * 探索 css-tree 能为每个属性提供什么信息
 */
import * as csstree from 'css-tree'

const lexer = csstree.lexer

// 选择几个代表性属性来分析
const testProperties = [
  'padding',        // 长度 + 百分比，不支持负数
  'margin',         // 长度 + 百分比，支持负数
  'width',          // 长度 + 百分比 + 关键字
  'opacity',        // 无单位数字 0-1
  'z-index',        // 无单位整数，支持负数
  'line-height',    // 无单位数字 + 长度 + 百分比
  'font-size',      // 长度 + 百分比 + 关键字
  'font-weight',    // 整数 1-1000 + 关键字
  'rotate',         // 角度
  'transition-duration', // 时间
  'flex-grow',      // 无单位数字
  'order',          // 无单位整数
  'border-radius',  // 长度 + 百分比
]

console.log('=== css-tree 属性信息探索 ===\n')

for (const prop of testProperties) {
  const syntax = lexer.getProperty(prop)
  
  console.log(`\n### ${prop}`)
  
  if (syntax?.syntax) {
    // syntax 已经是解析后的 AST
    const ast = syntax.syntax
    
    console.log('\n语法树结构:')
    console.log(JSON.stringify(ast, null, 2))
    
    // 提取类型引用
    const types: string[] = []
    const keywords: string[] = []
    
    csstree.definitionSyntax.walk(ast, {
      enter(node: any) {
        if (node.type === 'Type') {
          let typeStr = node.name
          if (node.opts) {
            typeStr += ` [${node.opts.min ?? '-∞'}, ${node.opts.max ?? '+∞'}]`
          }
          types.push(typeStr)
        }
        if (node.type === 'Keyword') {
          keywords.push(node.name)
        }
      }
    })
    
    console.log('\n提取的类型:', types)
    console.log('提取的关键字:', keywords)
  }
  
  console.log('\n' + '='.repeat(60))
}

// 额外：查看 css-tree 的类型定义
console.log('\n\n=== css-tree 内置类型 ===\n')

const numericTypes = ['length', 'percentage', 'number', 'integer', 'angle', 'time', 'length-percentage']

for (const typeName of numericTypes) {
  const typeDef = lexer.getType(typeName)
  console.log(`\n### ${typeName}`)
  
  if (typeDef?.syntax) {
    console.log('语法树:', JSON.stringify(typeDef.syntax, null, 2))
  } else {
    console.log('(内置类型，无语法定义)')
  }
}
