/**
 * CssTree Generator - 从 css-tree 生成原子类定义
 * 
 * 使用 css-tree 的 lexer 递归解析 CSS 语法，提取所有关键字值
 * 
 * 生成内容：
 * 1. CsstsAtoms.d.ts - 接口定义（唯一数据源）
 * 2. global.generated.d.ts - 全局声明（引用接口）
 * 3. atoms.json - 原子类名称列表（编译时用）
 * 
 * 命名规则：
 * - CSS 类名：property_value（用 _ 分隔属性和值）
 * - TS 变量名：propertyValue（camelCase）
 * - 小数点：用 p 代替（1.25 → 1p25）
 * - 百分号：用 pct 代替（50% → 50pct）
 * - 负数：用 n 前缀（-1 → n1）
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as csstree from 'css-tree'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

// ==================== 核心数据结构 ====================

/**
 * 数值范围定义
 */
interface NumericRange {
  min: number
  max: number
  types: string[]  // css-tree 类型：'length' | 'percentage' | 'number' | 'integer' | ...
}

/**
 * 属性定义
 */
interface PropertyDefinition {
  keywords: string[]       // 关键字值（来自 css-tree）
  numeric?: NumericRange   // 数值范围（来自 css-tree）
}

/**
 * 原子类定义
 */
interface AtomDefinition {
  name: string           // TS 变量名 (camelCase)
  className: string      // CSS 类名 (property_value)
  property: string       // CSS 属性
  value: string          // CSS 值
}

// ==================== 符号转换映射 ====================

/**
 * Map 1: TS 标识符转换（符号 → 别名）
 * 用于生成合法的 TypeScript 变量名
 */
const symbolToAlias: Record<string, string> = {
  '.': 'p',      // point (小数点)
  '%': 'pct',    // percent (百分号)
  '/': 's',      // slash (斜杠)
  // '-' 仅在值开头时转换为 'n'，在 formatNumericValue 中特殊处理
}

/**
 * Map 2: CSS 类名转义（符号 → 转义后）
 * 用于生成合法的 CSS 类名选择器
 */
const symbolToEscape: Record<string, string> = {
  '.': '\\.',    // 小数点需要转义
  '%': '\\%',    // 百分号需要转义
  '/': '\\/',    // 斜杠需要转义
  // '-' 不需要转义，CSS 类名中可以直接用
}

/**
 * 类型到单位的映射
 */
const typeToUnits: Record<string, string[]> = {
  'length': ['px', 'rem', 'em', 'vh', 'vw'],
  'percentage': ['%'],
  'number': [],      // 无单位纯数字
  'integer': [],     // 无单位整数
  'angle': ['deg', 'rad', 'turn'],
  'time': ['s', 'ms'],
}

// ==================== 工具函数 ====================

/**
 * kebab-case 转 camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/**
 * kebab-case 转 PascalCase
 */
function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * 格式化值为合法 TS 标识符
 * - 负数前缀：-1 → n1
 * - 小数点：1.25 → 1p25
 * - 百分号：50% → 50pct
 * - 斜杠：16/9 → 16s9
 */
function formatForTsIdentifier(value: string | number): string {
  let str = String(value)
  
  // 处理负数前缀（仅值开头的 - 转换为 n）
  if (str.startsWith('-')) {
    str = 'n' + str.slice(1)
  }
  
  // 使用 symbolToAlias 映射转换特殊符号
  for (const [symbol, alias] of Object.entries(symbolToAlias)) {
    str = str.split(symbol).join(alias)
  }
  
  return str
}

/**
 * 格式化值为 CSS 类名（转义特殊字符）
 * - 小数点：1.25 → 1\.25
 * - 百分号：50% → 50\%
 * - 斜杠：16/9 → 16\/9
 * - 负数：-100px → -100px（保持原样）
 */
function formatForClassName(value: string | number): string {
  let str = String(value)
  
  // 使用 symbolToEscape 映射转义特殊符号
  for (const [symbol, escaped] of Object.entries(symbolToEscape)) {
    str = str.split(symbol).join(escaped)
  }
  
  return str
}

/**
 * 生成 TS 变量名（camelCase）
 * 使用 symbolToAlias 转换特殊符号
 */
function generateAtomName(property: string, value: string): string {
  const propCamel = kebabToCamel(property)
  const valueFormatted = formatForTsIdentifier(value)
  const valuePascal = kebabToPascal(valueFormatted)
  return propCamel + valuePascal
}

/**
 * 生成 CSS 类名（property_value）
 * 使用 symbolToEscape 转义特殊符号
 */
function generateClassName(property: string, value: string): string {
  const valueFormatted = formatForClassName(value)
  return `${property}_${valueFormatted}`
}

/**
 * 根据类型数组获取所有支持的单位
 */
function getUnitsForTypes(types: string[]): string[] {
  const units: string[] = []
  for (const type of types) {
    const typeUnits = typeToUnits[type]
    if (typeUnits) {
      for (const unit of typeUnits) {
        if (!units.includes(unit)) {
          units.push(unit)
        }
      }
    }
  }
  return units
}

// ==================== CSS-TREE 解析 ====================

/**
 * 提取结果
 */
interface ExtractResult {
  keywords: string[]
  types: string[]  // 收集到的数值类型
}

/**
 * 从 css-tree 语法中递归提取关键字和类型
 */
function extractFromSyntax(syntax: any, visited: Set<string> = new Set()): ExtractResult {
  const result: ExtractResult = { keywords: [], types: [] }
  if (!syntax) return result
  
  const lexer = (csstree as any).lexer
  
  if (syntax.type === 'Keyword') {
    result.keywords.push(syntax.name)
  } else if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      const sub = extractFromSyntax(term, visited)
      result.keywords.push(...sub.keywords)
      result.types.push(...sub.types)
    }
  } else if (syntax.type === 'Type' && syntax.name) {
    // 检查是否是数值类型
    const numericTypes = ['length', 'percentage', 'number', 'integer', 'angle', 'time', 'length-percentage']
    if (numericTypes.includes(syntax.name)) {
      // 展开 length-percentage 为两个类型
      if (syntax.name === 'length-percentage') {
        result.types.push('length', 'percentage')
      } else {
        result.types.push(syntax.name)
      }
    } else if (!visited.has(syntax.name)) {
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        const sub = extractFromSyntax(typeData.syntax, visited)
        result.keywords.push(...sub.keywords)
        result.types.push(...sub.types)
      }
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    const sub = extractFromSyntax(syntax.term, visited)
    result.keywords.push(...sub.keywords)
    result.types.push(...sub.types)
  } else if (syntax.type === 'Range') {
    // 处理数值范围（如 font-weight 的 1-1000）
    // Range 节点通常在 Type 节点内部，这里记录类型
  }
  
  return result
}

/**
 * 获取属性的完整定义（关键字 + 数值范围）
 */
function getPropertyDefinition(property: string): PropertyDefinition {
  const lexer = (csstree as any).lexer
  const propData = lexer.properties[property]
  
  if (!propData || !propData.syntax) {
    return { keywords: [] }
  }
  
  const extracted = extractFromSyntax(propData.syntax)
  
  // 去重，过滤掉浏览器前缀和不常用的值
  const keywords = [...new Set(extracted.keywords)].filter(k => 
    !k.startsWith('-') && 
    !k.startsWith('webkit') &&
    k.length > 0
  ).sort()
  
  // 去重类型
  const types = [...new Set(extracted.types)]
  
  const definition: PropertyDefinition = { keywords }
  
  // 如果有数值类型，添加 numeric 定义
  if (types.length > 0) {
    definition.numeric = {
      min: 0,
      max: Infinity,
      types,
    }
  }
  
  return definition
}

// ==================== 设计系统配置 ====================

/**
 * 数值预设配置（设计系统层面决定生成哪些具体数值）
 * 这些值会结合 css-tree 提取的类型信息生成原子类
 */
const numericPresets: Record<string, { values: number[], units?: string[] }> = {
  // 间距类
  'padding': { values: [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64], units: ['px'] },
  'margin': { values: [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64], units: ['px'] },
  'gap': { values: [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32], units: ['px'] },
  
  // 尺寸类
  'width': { values: [0, 24, 32, 40, 48, 64, 80, 100, 120, 160, 200, 240, 320], units: ['px'] },
  'height': { values: [0, 24, 32, 40, 48, 64, 80, 100, 120], units: ['px'] },
  'min-width': { values: [0, 24, 32, 40, 48, 64, 80, 100, 120], units: ['px'] },
  'max-width': { values: [320, 480, 640, 768, 1024, 1280], units: ['px'] },
  'min-height': { values: [0, 24, 32, 40, 48, 64, 80, 100, 120], units: ['px'] },
  'max-height': { values: [320, 480, 640, 768], units: ['px'] },
  
  // 排版类
  'font-size': { values: [10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 48], units: ['px'] },
  'font-weight': { values: [100, 200, 300, 400, 500, 600, 700, 800, 900] },  // 无单位
  'line-height': { values: [1, 1.25, 1.5, 1.75, 2] },  // 无单位
  
  // 边框类
  'border-radius': { values: [0, 2, 4, 6, 8, 12, 16, 9999], units: ['px'] },
  'border-width': { values: [0, 1, 2, 4], units: ['px'] },
  
  // 效果类
  'opacity': { values: [0, 0.25, 0.5, 0.75, 1] },  // 无单位
  'z-index': { values: [-1, 0, 10, 20, 30, 40, 50, 100, 999, 9999] },  // 无单位，支持负数
  
  // Flex 类
  'flex-grow': { values: [0, 1] },
  'flex-shrink': { values: [0, 1] },
  'order': { values: [-1, 0, 1, 2, 3, 4, 5] },  // 支持负数
}

/**
 * 百分比预设（用于支持 percentage 类型的属性）
 */
const percentagePresets: Record<string, number[]> = {
  'width': [25, 50, 75, 100],
  'height': [25, 50, 75, 100],
  'min-width': [50, 100],
  'max-width': [100],
  'min-height': [50, 100],
  'max-height': [100],
}

/**
 * 特殊值别名（语义化名称）
 */
const specialValues: Record<string, Record<string, string>> = {
  'width': { 'full': '100%', 'half': '50%', 'screen': '100vw' },
  'height': { 'full': '100%', 'half': '50%', 'screen': '100vh' },
}

// 要处理的核心 CSS 属性
const coreProperties = [
  // Layout
  'display', 'position', 'float', 'clear',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
  'justify-content', 'align-items', 'align-self', 'align-content',
  'order',
  
  // Box Model
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'padding', 'margin', 'gap',
  
  // Typography
  'font-size', 'font-weight', 'font-style',
  'line-height', 'text-align', 'text-decoration', 'text-transform',
  'white-space', 'word-break', 'overflow-wrap', 'vertical-align',
  
  // Visual
  'border-style', 'border-radius',
  'box-shadow', 'opacity', 'visibility',
  
  // Effects
  'overflow', 'overflow-x', 'overflow-y',
  'cursor', 'pointer-events', 'user-select',
  
  // Position
  'z-index',
]

/**
 * 获取属性的关键字值列表
 */
function getPropertyKeywords(property: string): string[] {
  const definition = getPropertyDefinition(property)
  return definition.keywords
}

/**
 * 生成二维 Map：CSS 属性 → PropertyDefinition
 */
function getCssPropertyDefinitionMap(): Map<string, PropertyDefinition> {
  const map = new Map<string, PropertyDefinition>()
  
  for (const prop of coreProperties) {
    const definition = getPropertyDefinition(prop)
    map.set(prop, definition)
  }
  
  return map
}

/**
 * 生成二维 Map：CSS 属性 → 值数组（兼容旧接口）
 */
function getCssPropertyValueMap(): Map<string, string[]> {
  const map = new Map<string, string[]>()
  
  for (const prop of coreProperties) {
    const keywords = getPropertyKeywords(prop)
    map.set(prop, keywords)
  }
  
  return map
}

/**
 * 生成所有原子类定义
 */
function generateAtoms(): AtomDefinition[] {
  const atoms: AtomDefinition[] = []
  const seenNames = new Set<string>()
  
  // 获取二维 Map
  const propertyValueMap = getCssPropertyValueMap()
  
  // 遍历每个属性
  for (const [prop, keywords] of propertyValueMap) {
    // 添加关键字值
    for (const keyword of keywords) {
      const name = generateAtomName(prop, keyword)
      if (seenNames.has(name)) continue
      seenNames.add(name)
      
      atoms.push({
        name,
        className: generateClassName(prop, keyword),
        property: prop,
        value: keyword,
      })
    }
    
    // 添加数值变体
    if (numericProperties[prop]) {
      const { values, unit } = numericProperties[prop]
      for (const num of values) {
        const valueStr = String(num)
        const name = generateAtomName(prop, valueStr)
        if (seenNames.has(name)) continue
        seenNames.add(name)
        
        atoms.push({
          name,
          className: generateClassName(prop, valueStr),
          property: prop,
          value: unit ? `${num}${unit}` : `${num}`,
        })
      }
    }
    
    // 添加特殊值
    if (specialValues[prop]) {
      for (const [key, value] of Object.entries(specialValues[prop])) {
        const name = generateAtomName(prop, key)
        if (seenNames.has(name)) continue
        seenNames.add(name)
        
        atoms.push({
          name,
          className: generateClassName(prop, key),
          property: prop,
          value,
        })
      }
    }
  }
  
  // 添加组件状态原子类
  const stateAtoms: AtomDefinition[] = [
    { name: 'isDisabled', className: 'is-disabled', property: 'state', value: 'disabled' },
    { name: 'isLoading', className: 'is-loading', property: 'state', value: 'loading' },
    { name: 'isActive', className: 'is-active', property: 'state', value: 'active' },
    { name: 'isFocus', className: 'is-focus', property: 'state', value: 'focus' },
    { name: 'isHover', className: 'is-hover', property: 'state', value: 'hover' },
    { name: 'isSelected', className: 'is-selected', property: 'state', value: 'selected' },
    { name: 'isError', className: 'is-error', property: 'state', value: 'error' },
    { name: 'isSuccess', className: 'is-success', property: 'state', value: 'success' },
    { name: 'isWarning', className: 'is-warning', property: 'state', value: 'warning' },
  ]
  
  for (const state of stateAtoms) {
    if (!seenNames.has(state.name)) {
      seenNames.add(state.name)
      atoms.push(state)
    }
  }
  
  return atoms
}


/**
 * 生成 CsstsAtoms.d.ts 文件 - 唯一数据源
 */
function generateCsstsAtomsDts(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CsstsAtoms 接口 - 原子类类型定义（唯一数据源）',
    ' * ',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' * 数据来源: css-tree',
    ' * ',
    ' * 命名规则:',
    ' * - CSS 类名: property_value（用 _ 分隔属性和值）',
    ' * - TS 变量名: propertyValue（camelCase）',
    ' * - 小数点: 用 p 代替（1.25 → 1p25）',
    ' */',
    '',
    'export interface CsstsAtoms {',
  ]
  
  // 按属性分组
  const grouped = new Map<string, AtomDefinition[]>()
  for (const atom of atoms) {
    const group = atom.property
    if (!grouped.has(group)) {
      grouped.set(group, [])
    }
    grouped.get(group)!.push(atom)
  }
  
  // 生成每个分组
  for (const [property, groupAtoms] of grouped) {
    lines.push(`  // ==================== ${property} ====================`)
    for (const atom of groupAtoms) {
      lines.push(`  readonly ${atom.name}: { '${atom.className}': true }`)
    }
    lines.push('')
  }
  
  lines.push('  // 允许任意其他原子类')
  lines.push("  readonly [key: string]: { [className: string]: true }")
  lines.push('}')
  
  return lines.join('\n')
}

/**
 * 生成 global.generated.d.ts 文件 - 引用 CsstsAtoms
 */
function generateGlobalDts(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CssTs Global Type Declarations',
    ' * ',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' * 数据来源: css-tree',
    ' */',
    '',
    "import type { CsstsAtoms } from './CsstsAtoms'",
    "import type { CsstsRuntime } from './runtime'",
    '',
    'declare global {',
    '  /** CssTs runtime */',
    '  const cssts: CsstsRuntime',
    '',
  ]
  
  // 按属性分组
  const grouped = new Map<string, AtomDefinition[]>()
  for (const atom of atoms) {
    const group = atom.property
    if (!grouped.has(group)) {
      grouped.set(group, [])
    }
    grouped.get(group)!.push(atom)
  }
  
  // 生成每个分组 - 引用 CsstsAtoms
  for (const [property, groupAtoms] of grouped) {
    lines.push(`  // ==================== ${property} ====================`)
    for (const atom of groupAtoms) {
      lines.push(`  const ${atom.name}: CsstsAtoms['${atom.name}']`)
    }
    lines.push('')
  }
  
  lines.push('}')
  lines.push('')
  lines.push('export {}')
  
  return lines.join('\n')
}

/**
 * 生成 atoms.json 文件 - 原子类名称列表（编译时用）
 */
function generateAtomsJson(atoms: AtomDefinition[]): string {
  const data = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    source: 'css-tree',
    // 原子类名称列表（用于编译时判断标识符是否是原子类）
    atomNames: atoms.map(a => a.name),
    // 原子类详细信息（用于生成 CSS）
    atoms: atoms.map(a => ({
      name: a.name,
      className: a.className,
      property: a.property,
      value: a.value,
    })),
  }
  
  return JSON.stringify(data, null, 2)
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成原子类定义...')
  console.log('')
  console.log('命名规则:')
  console.log('  - CSS 类名: property_value（用 _ 分隔属性和值）')
  console.log('  - TS 变量名: propertyValue（camelCase）')
  console.log('  - 小数点: 用 p 代替（1.25 → 1p25）')
  console.log('')
  
  // 确保 dist 目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }
  
  // 打印二维 Map 结构示例
  console.log('📊 CSS 属性值 Map 示例:')
  const propertyValueMap = getCssPropertyValueMap()
  const sampleProps = ['display', 'position', 'justify-content', 'cursor']
  for (const prop of sampleProps) {
    const values = propertyValueMap.get(prop) || []
    console.log(`  ${prop}: [${values.slice(0, 5).join(', ')}${values.length > 5 ? ', ...' : ''}] (${values.length} 个值)`)
  }
  console.log('')
  
  // 生成原子类
  const atoms = generateAtoms()
  console.log(`📦 生成了 ${atoms.length} 个原子类`)
  
  // 生成 CsstsAtoms.d.ts - 唯一数据源
  const csstsAtomsDts = generateCsstsAtomsDts(atoms)
  fs.writeFileSync(path.join(rootDir, 'CsstsAtoms.d.ts'), csstsAtomsDts)
  console.log('✅ 生成 CsstsAtoms.d.ts')
  
  // 生成 global.generated.d.ts - 引用 CsstsAtoms
  const globalDts = generateGlobalDts(atoms)
  fs.writeFileSync(path.join(rootDir, 'global.generated.d.ts'), globalDts)
  console.log('✅ 生成 global.generated.d.ts')
  
  // 生成 atoms.json - 原子类名称列表
  const atomsJson = generateAtomsJson(atoms)
  fs.writeFileSync(path.join(distDir, 'atoms.json'), atomsJson)
  console.log('✅ 生成 dist/atoms.json')
  
  // 输出统计
  const grouped = new Map<string, number>()
  for (const atom of atoms) {
    grouped.set(atom.property, (grouped.get(atom.property) || 0) + 1)
  }
  
  console.log('\n📊 原子类统计:')
  for (const [prop, count] of [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`   ${prop}: ${count}`)
  }
  
  // 打印示例
  console.log('\n📝 生成示例:')
  const examples = atoms.filter(a => 
    ['displayFlex', 'justifyContentCenter', 'alignItemsFlexStart', 'lineHeight1p5', 'opacity0p5'].includes(a.name)
  )
  for (const ex of examples) {
    console.log(`   ${ex.name} → .${ex.className} { ${ex.property}: ${ex.value}; }`)
  }
  
  console.log('\n✨ 生成完成!')
}

main().catch(console.error)
