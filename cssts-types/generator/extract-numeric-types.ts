/**
 * 从 css-tree 提取所有数值类型信息
 * 
 * 用于分析 css-tree 中有哪些数值类型，以及它们的 min/max 等信息
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as csstree from 'css-tree'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface PropertyNumericInfo {
  property: string
  numericTypes: string[]
  deprecated?: boolean  // 浏览器前缀属性标记为过时
  category?: string     // 属性分类
}

/**
 * 递归提取语法中的数值类型
 */
function extractNumericTypes(syntax: any, visited: Set<string> = new Set()): string[] {
  const types: string[] = []
  if (!syntax) return types
  
  const lexer = (csstree as any).lexer
  
  if (syntax.type === 'Type' && syntax.name) {
    const numericTypeNames = [
      'length', 'percentage', 'number', 'integer', 'angle', 'time',
      'length-percentage', 'alpha-value', 'flex', 'font-weight-absolute',
      'line-width', 'border-width'
    ]
    
    if (numericTypeNames.includes(syntax.name)) {
      types.push(syntax.name)
      
      // 检查是否有 opts（min/max）
      if (syntax.opts) {
        types.push(`${syntax.name}[${syntax.opts.min ?? '-∞'},${syntax.opts.max ?? '∞'}]`)
      }
    }
    
    // 递归展开类型
    if (!visited.has(syntax.name)) {
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        types.push(...extractNumericTypes(typeData.syntax, visited))
      }
    }
  } else if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      types.push(...extractNumericTypes(term, visited))
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    types.push(...extractNumericTypes(syntax.term, visited))
  }
  
  return types
}

/**
 * 判断属性是否为浏览器前缀（过时）
 */
function isDeprecatedProperty(property: string): boolean {
  return property.startsWith('-ms-') || 
         property.startsWith('-moz-') || 
         property.startsWith('-webkit-') ||
         property.startsWith('-o-')
}

/**
 * 获取属性分类
 */
function getPropertyCategory(property: string): string {
  // 布局
  if (['display', 'position', 'float', 'clear', 'z-index', 'order'].includes(property) ||
      property.startsWith('flex') || property.startsWith('grid') || property.startsWith('align') ||
      property.startsWith('justify') || property === 'place-content' || property === 'place-items') {
    return 'layout'
  }
  // 间距
  if (property.startsWith('margin') || property.startsWith('padding') || 
      property === 'gap' || property === 'row-gap' || property === 'column-gap') {
    return 'spacing'
  }
  // 尺寸
  if (['width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
       'block-size', 'inline-size', 'min-block-size', 'max-block-size',
       'min-inline-size', 'max-inline-size'].includes(property)) {
    return 'sizing'
  }
  // 定位
  if (['top', 'right', 'bottom', 'left', 'inset', 'inset-block', 'inset-inline',
       'inset-block-start', 'inset-block-end', 'inset-inline-start', 'inset-inline-end'].includes(property)) {
    return 'positioning'
  }
  // 字体/排版
  if (property.startsWith('font') || property.startsWith('text') || property.startsWith('letter') ||
      property.startsWith('word') || property.startsWith('line') || property === 'white-space' ||
      property === 'vertical-align' || property === 'tab-size') {
    return 'typography'
  }
  // 边框
  if (property.startsWith('border') || property.startsWith('outline')) {
    return 'border'
  }
  // 背景
  if (property.startsWith('background')) {
    return 'background'
  }
  // 颜色
  if (property === 'color' || property === 'opacity' || property.includes('color')) {
    return 'color'
  }
  // 变换
  if (property.startsWith('transform') || property === 'rotate' || property === 'scale' ||
      property === 'translate' || property === 'perspective') {
    return 'transform'
  }
  // 过渡/动画
  if (property.startsWith('transition') || property.startsWith('animation')) {
    return 'animation'
  }
  // 滚动
  if (property.startsWith('scroll') || property.startsWith('overflow')) {
    return 'scroll'
  }
  // 其他
  return 'other'
}

/**
 * 获取所有属性的数值类型信息
 */
function getPropertyNumericInfo(): PropertyNumericInfo[] {
  const lexer = (csstree as any).lexer
  const result: PropertyNumericInfo[] = []
  
  for (const [property, data] of Object.entries(lexer.properties as Record<string, any>)) {
    if (!data.syntax) continue
    
    const numericTypes = [...new Set(extractNumericTypes(data.syntax))]
    
    if (numericTypes.length > 0) {
      const info: PropertyNumericInfo = {
        property,
        numericTypes,
      }
      
      // 标记过时属性
      if (isDeprecatedProperty(property)) {
        info.deprecated = true
      }
      
      // 添加分类（只对非过时属性）
      if (!info.deprecated) {
        info.category = getPropertyCategory(property)
      }
      
      result.push(info)
    }
  }
  
  // 按分类和属性名排序（过时属性放最后）
  return result.sort((a, b) => {
    if (a.deprecated && !b.deprecated) return 1
    if (!a.deprecated && b.deprecated) return -1
    if (a.category && b.category && a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.property.localeCompare(b.property)
  })
}

/**
 * 递归查找 opts
 */
function findOpts(syntax: any): any {
  if (!syntax) return null
  
  if (syntax.opts) {
    return { min: syntax.opts.min, max: syntax.opts.max }
  }
  
  if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      const opts = findOpts(term)
      if (opts) return opts
    }
  }
  
  if (syntax.type === 'Multiplier' && syntax.term) {
    return findOpts(syntax.term)
  }
  
  return null
}

/**
 * 类型注释：说明每个类型的作用、是否过时、对我们是否有用
 */
const typeAnnotations: Record<string, { description: string; useful: boolean; deprecated?: boolean }> = {
  'cubic-bezier-timing-function': {
    description: 'CSS 贝塞尔曲线时间函数的控制点值',
    useful: false, // 我们不生成 timing-function 原子类
  },
  'fixed-repeat': {
    description: 'CSS Grid repeat() 函数的重复次数',
    useful: false, // Grid 复杂语法，不适合原子类
  },
  'font-weight-absolute': {
    description: '字重绝对值 (1-1000)，用于 font-weight',
    useful: true, // ✅ 对我们有用
  },
  'name-repeat': {
    description: 'CSS Grid 命名行重复次数',
    useful: false, // Grid 复杂语法
  },
  'perspective()': {
    description: 'CSS 3D 透视函数的距离值',
    useful: false, // 函数值，不适合原子类
  },
  'ratio': {
    description: 'CSS 宽高比值 (如 16/9)',
    useful: false, // 复杂值，不适合原子类
  },
  'track-repeat': {
    description: 'CSS Grid track 重复次数',
    useful: false, // Grid 复杂语法
  },
  'color-mix()': {
    description: 'CSS 颜色混合函数的百分比 (0-100)',
    useful: false, // 函数值，颜色由设计系统处理
  },
  'number-zero-one': {
    description: '0-1 范围的数字，用于 opacity、alpha 等',
    useful: true, // ✅ 对我们有用
  },
  'number-one-or-greater': {
    description: '≥1 的数字，用于 animation-iteration-count 等',
    useful: false, // 动画相关，暂不处理
  },
  'xywh()': {
    description: 'CSS clip-path 的 xywh() 函数参数',
    useful: false, // 复杂函数
  },
}

/**
 * 深度递归查找所有 opts
 */
function findAllOptsInTypes(): Record<string, { 
  min: number | null
  max: number | null
  description: string
  useful: boolean
  deprecated?: boolean 
}> {
  const lexer = (csstree as any).lexer
  const result: Record<string, { 
    min: number | null
    max: number | null
    description: string
    useful: boolean
    deprecated?: boolean 
  }> = {}
  
  for (const [name, data] of Object.entries(lexer.types as Record<string, any>)) {
    if (data.syntax) {
      const opts = findOpts(data.syntax)
      if (opts && (opts.min !== undefined || opts.max !== undefined)) {
        const annotation = typeAnnotations[name] || { 
          description: '未知类型', 
          useful: false 
        }
        result[name] = {
          min: opts.min ?? null,
          max: opts.max ?? null,
          ...annotation,
        }
      }
    }
  }
  
  return result
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 从 css-tree 提取数值类型信息...\n')
  
  // 1. 获取有 min/max 范围的类型（深度递归查找）
  const typesWithRange = findAllOptsInTypes()
  console.log(`📊 找到 ${Object.keys(typesWithRange).length} 个有 min/max 的类型`)
  
  // 2. 获取所有属性的数值类型信息
  const propertyInfo = getPropertyNumericInfo()
  console.log(`📊 找到 ${propertyInfo.length} 个有数值类型的属性`)
  
  // 3. 生成 JSON 文件（精简版）
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'css-tree',
    
    // 有 min/max 范围的类型（css-tree 提供的）
    typesWithRange,
    
    // 所有有数值类型的属性
    propertiesWithNumeric: propertyInfo,
    
    // 统计
    stats: {
      typesWithRange: Object.keys(typesWithRange).length,
      propertiesTotal: propertyInfo.length,
      propertiesStandard: propertyInfo.filter(p => !p.deprecated).length,
      propertiesDeprecated: propertyInfo.filter(p => p.deprecated).length,
    }
  }
  
  // 保存到文件
  const outputPath = path.join(__dirname, 'csstree-numeric-analysis.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n✅ 已保存到 ${outputPath}`)
  
  // 打印有 min/max 的类型
  console.log('\n📋 有 min/max 的类型:')
  for (const [name, range] of Object.entries(typesWithRange)) {
    console.log(`   ${name}: [${range.min ?? '-∞'}, ${range.max ?? '∞'}]`)
  }
  
  // 打印统计
  console.log('\n📊 统计:')
  console.log(`   标准属性: ${output.stats.propertiesStandard}`)
  console.log(`   过时属性 (浏览器前缀): ${output.stats.propertiesDeprecated}`)
  console.log(`   总计: ${output.stats.propertiesTotal}`)
}

main().catch(console.error)
