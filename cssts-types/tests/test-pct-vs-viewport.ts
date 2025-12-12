/**
 * 测试 % 和 vh/vw 的支持情况
 */

import * as csstree from 'css-tree'

const lexer = (csstree as any).lexer

// 测试属性列表
const properties = [
  'width', 'height', 'min-width', 'max-width',
  'padding', 'margin', 'gap',
  'font-size', 'line-height',
  'top', 'left', 'right', 'bottom',
  'border-radius', 'border-width',
  'background-size', 'background-position',
  'flex-basis',
  'letter-spacing', 'word-spacing',
]

console.log('=== % vs vh/vw 支持情况 ===\n')
console.log('| 属性 | 50% | 50vh | 50vw |')
console.log('|------|-----|------|------|')

for (const prop of properties) {
  const pct = lexer.matchProperty(prop, '50%')
  const vh = lexer.matchProperty(prop, '50vh')
  const vw = lexer.matchProperty(prop, '50vw')
  
  const pctOk = pct.matched ? '✅' : '❌'
  const vhOk = vh.matched ? '✅' : '❌'
  const vwOk = vw.matched ? '✅' : '❌'
  
  console.log(`| ${prop} | ${pctOk} | ${vhOk} | ${vwOk} |`)
}
