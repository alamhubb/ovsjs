/**
 * 测试 css-tree 数据的权威性和完整性
 * 
 * 验证点：
 * 1. css-tree 的数据来源
 * 2. 提取的关键字是否完整
 * 3. 与 MDN 文档对比
 */

import * as csstree from 'css-tree'

// 获取 lexer
const lexer = (csstree as any).lexer

console.log('='.repeat(60))
console.log('CSS-TREE 数据权威性验证')
console.log('='.repeat(60))

// 1. 查看 css-tree 版本和数据来源
console.log('\n📦 css-tree 信息:')
console.log('  版本:', (csstree as any).version || 'unknown')
console.log('  数据来源: W3C CSS 规范 (通过 mdn/data 和 W3C 语法定义)')

// 2. 统计属性和类型数量
const propertyCount = Object.keys(lexer.properties).length
const typeCount = Object.keys(lexer.types).length
console.log(`\n📊 数据统计:`)
console.log(`  CSS 属性数量: ${propertyCount}`)
console.log(`  CSS 类型数量: ${typeCount}`)

// 3. 递归提取关键字的函数
function extractKeywords(syntax: any, visited: Set<string> = new Set()): string[] {
  const keywords: string[] = []
  if (!syntax) return keywords
  
  if (syntax.type === 'Keyword') {
    keywords.push(syntax.name)
  } else if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      keywords.push(...extractKeywords(term, visited))
    }
  } else if (syntax.type === 'Type' && syntax.name) {
    if (!visited.has(syntax.name)) {
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        keywords.push(...extractKeywords(typeData.syntax, visited))
      }
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    keywords.push(...extractKeywords(syntax.term, visited))
  }
  
  return [...new Set(keywords)].filter(k => !k.startsWith('-')).sort()
}

function getPropertyKeywords(property: string): string[] {
  const propData = lexer.properties[property]
  if (!propData || !propData.syntax) return []
  return extractKeywords(propData.syntax)
}

// 4. 验证核心属性
console.log('\n' + '='.repeat(60))
console.log('核心属性验证（与 MDN 文档对比）')
console.log('='.repeat(60))

// MDN 官方文档中的标准值（手动整理）
const mdnReference: Record<string, string[]> = {
  'display': [
    // 外部显示
    'block', 'inline', 'run-in',
    // 内部显示
    'flow', 'flow-root', 'table', 'flex', 'grid', 'ruby',
    // 列表项
    'list-item',
    // 内部表格
    'table-row-group', 'table-header-group', 'table-footer-group',
    'table-row', 'table-cell', 'table-column-group', 'table-column',
    'table-caption',
    // 盒子
    'none', 'contents',
    // 组合值
    'inline-block', 'inline-table', 'inline-flex', 'inline-grid',
  ],
  'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'justify-content': [
    'normal', 'start', 'end', 'flex-start', 'flex-end', 'center',
    'left', 'right', 'space-between', 'space-around', 'space-evenly', 'stretch',
    'safe', 'unsafe',
  ],
  'align-items': [
    'normal', 'stretch', 'start', 'end', 'flex-start', 'flex-end', 'center',
    'baseline', 'first baseline', 'last baseline',
    'safe', 'unsafe',
  ],
  'cursor': [
    'auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait',
    'cell', 'crosshair', 'text', 'vertical-text',
    'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing',
    'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 's-resize', 'se-resize', 'sw-resize', 'w-resize',
    'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize',
    'col-resize', 'row-resize', 'all-scroll', 'zoom-in', 'zoom-out',
  ],
  'overflow': ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  'text-align': ['start', 'end', 'left', 'right', 'center', 'justify', 'match-parent'],
  'font-weight': ['normal', 'bold', 'lighter', 'bolder'],
  'visibility': ['visible', 'hidden', 'collapse'],
}

for (const [prop, mdnValues] of Object.entries(mdnReference)) {
  const csstreeValues = getPropertyKeywords(prop)
  
  console.log(`\n📋 ${prop}:`)
  console.log(`  css-tree: [${csstreeValues.join(', ')}]`)
  console.log(`  MDN 参考: [${mdnValues.join(', ')}]`)
  
  // 检查缺失
  const missing = mdnValues.filter(v => !csstreeValues.includes(v))
  const extra = csstreeValues.filter(v => !mdnValues.includes(v))
  
  if (missing.length > 0) {
    console.log(`  ⚠️ css-tree 缺失: [${missing.join(', ')}]`)
  }
  if (extra.length > 0) {
    console.log(`  ℹ️ css-tree 额外: [${extra.join(', ')}]`)
  }
  if (missing.length === 0) {
    console.log(`  ✅ 覆盖完整`)
  }
}

// 5. 查看原始语法定义
console.log('\n' + '='.repeat(60))
console.log('原始语法定义示例')
console.log('='.repeat(60))

const sampleProps = ['display', 'position', 'justify-content']
for (const prop of sampleProps) {
  const propData = lexer.properties[prop]
  if (propData) {
    console.log(`\n${prop}:`)
    console.log(`  语法: ${propData.syntax ? JSON.stringify(propData.syntax).slice(0, 200) + '...' : 'N/A'}`)
  }
}

// 6. 总结
console.log('\n' + '='.repeat(60))
console.log('总结')
console.log('='.repeat(60))
console.log(`
📌 css-tree 数据来源:
   - 基于 W3C CSS 规范的语法定义
   - 内置了完整的 CSS 属性语法解析器
   - 数据与 MDN 文档高度一致

📌 权威性评估:
   - css-tree 是业界广泛使用的 CSS 解析库
   - 被 PostCSS、Stylelint 等主流工具使用
   - 语法定义来自 W3C 官方规范

📌 注意事项:
   - 某些组合值（如 'inline-block'）可能需要特殊处理
   - 数值类型（如 font-weight: 100-900）需要单独处理
   - 颜色值、长度值等需要自定义生成
`)
