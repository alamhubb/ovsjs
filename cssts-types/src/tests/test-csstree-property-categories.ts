/**
 * 分析 css-tree 的属性，按类别分组
 */
import * as csstree from 'css-tree'

const lexer = csstree.lexer

// 获取所有属性
const allProperties = Object.keys((lexer as any).properties || {})
console.log('总属性数量:', allProperties.length)

// 按前缀分组
const prefixGroups: Record<string, string[]> = {}

for (const prop of allProperties) {
  // 提取前缀（第一个 - 之前的部分）
  const prefix = prop.split('-')[0]
  if (!prefixGroups[prefix]) {
    prefixGroups[prefix] = []
  }
  prefixGroups[prefix].push(prop)
}

// 按数量排序
const sortedPrefixes = Object.entries(prefixGroups)
  .sort((a, b) => b[1].length - a[1].length)

console.log('\n=== 按前缀分组 ===\n')
for (const [prefix, props] of sortedPrefixes) {
  console.log(`${prefix} (${props.length}):`)
  if (props.length <= 10) {
    console.log(`  ${props.join(', ')}`)
  } else {
    console.log(`  ${props.slice(0, 10).join(', ')}...`)
  }
}

// 分析哪些属性适合生成原子类
console.log('\n\n=== 适合原子类的属性分析 ===\n')

// 定义适合原子类的属性类别
const atomicCategories = {
  // 布局
  layout: [
    'display', 'position', 'float', 'clear',
    'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
    'justify-content', 'align-items', 'align-content', 'align-self',
    'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
    'order', 'z-index',
  ],
  
  // 间距
  spacing: [
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'gap', 'row-gap', 'column-gap',
  ],
  
  // 尺寸
  sizing: [
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  ],
  
  // 定位
  positioning: [
    'top', 'right', 'bottom', 'left', 'inset',
  ],
  
  // 排版
  typography: [
    'font-size', 'font-weight', 'font-style', 'font-family',
    'line-height', 'letter-spacing', 'word-spacing',
    'text-align', 'text-decoration', 'text-transform',
    'white-space', 'word-break', 'overflow-wrap',
  ],
  
  // 颜色（由设计系统处理，但列出来）
  colors: [
    'color', 'background-color', 'border-color',
    'outline-color', 'text-decoration-color',
  ],
  
  // 边框
  borders: [
    'border', 'border-width', 'border-style', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
  ],
  
  // 效果
  effects: [
    'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
    'box-shadow', 'text-shadow',
    'transform', 'rotate', 'scale', 'translate',
    'transition', 'transition-duration', 'transition-timing-function',
  ],
  
  // 交互
  interaction: [
    'cursor', 'pointer-events', 'user-select', 'resize',
  ],
  
  // 背景
  background: [
    'background', 'background-image', 'background-size', 'background-position',
    'background-repeat', 'background-attachment',
  ],
}

// 统计
let totalAtomic = 0
for (const [category, props] of Object.entries(atomicCategories)) {
  const existingProps = props.filter(p => allProperties.includes(p))
  console.log(`${category}: ${existingProps.length}/${props.length} 存在于 css-tree`)
  totalAtomic += existingProps.length
}

console.log(`\n总计适合原子类的属性: ${totalAtomic}`)

// 找出不适合原子类的属性
console.log('\n\n=== 不适合原子类的属性示例 ===\n')

const unsuitable = [
  'content',           // 需要字符串值
  'counter-reset',     // 计数器
  'counter-increment', // 计数器
  'quotes',            // 引号字符
  'list-style-type',   // 可能需要自定义
  'animation',         // 复杂
  'animation-name',    // 需要 @keyframes
  'grid-template-areas', // 复杂字符串
  'clip-path',         // 复杂
  'filter',            // 复杂函数
  'mask',              // 复杂
]

for (const prop of unsuitable) {
  const def = lexer.getProperty(prop)
  if (def?.syntax) {
    console.log(`${prop}:`)
    const types: string[] = []
    const keywords: string[] = []
    csstree.definitionSyntax.walk(def.syntax, {
      enter(node: any) {
        if (node.type === 'Type') types.push(node.name)
        if (node.type === 'Keyword') keywords.push(node.name)
      }
    })
    console.log(`  类型: ${types.slice(0, 5).join(', ')}${types.length > 5 ? '...' : ''}`)
    console.log(`  关键字: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`)
  }
}
