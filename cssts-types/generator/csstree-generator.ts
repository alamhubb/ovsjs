/**
 * CssTree Generator - 从 css-tree 生成原子类定义
 *
 * 使用 css-tree 的 lexer 递归解析 CSS 语法，提取所有关键字值
 * 结合 property-numeric-config-type.ts 的数值配置生成完整的原子类
 *
 * 同时生成（确保数据一致性）：
 * 1. CsstsAtoms.d.ts - 接口定义（唯一数据源）
 * 2. global.generated.d.ts - 全局声明（引用接口）
 * 3. atoms.json - 原子类映射表（运行时用）
 * 4. atoms.css - 原子类样式定义
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
import { defaultConfig, type PropertyNumericConfigBase } from './property-numeric-config-type'
import { generateValuePresets, type NumericType } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')

// ==================== 核心数据结构 ====================

/**
 * 原子类定义
 */
interface AtomDefinition {
  name: string // TS 变量名 (camelCase)
  className: string // CSS 类名 (property_value)
  property: string // CSS 属性
  value: string // CSS 值
}

/**
 * atoms.json 中的原子类信息
 */
interface AtomInfo {
  property: string // CSS 属性名，用于同属性去重
  className: string // CSS 类名
}

// ==================== 符号转换映射 ====================

/**
 * Map 1: TS 标识符转换（符号 → 别名）
 * 用于生成合法的 TypeScript 变量名
 */
const symbolToAlias: Record<string, string> = {
  '.': 'p', // point (小数点)
  '%': 'pct', // percent (百分号)
  '/': 's', // slash (斜杠)
  // '-' 仅在值开头时转换为 'n'，在 formatForTsIdentifier 中特殊处理
}

/**
 * Map 2: CSS 类名转义（符号 → 转义后）
 * 用于生成合法的 CSS 类名选择器
 */
const symbolToEscape: Record<string, string> = {
  '.': '\\.', // 小数点需要转义
  '%': '\\%', // 百分号需要转义
  '/': '\\/', // 斜杠需要转义
  // '-' 不需要转义，CSS 类名中可以直接用
}

/**
 * 单位类型到 CSS 单位后缀的映射
 */
const unitToSuffix: Record<string, string> = {
  zero: '',
  px: 'px',
  rem: 'rem',
  ratio: '%',
  deg: 'deg',
  ms: 'ms',
  fr: 'fr',
  unitless: '',
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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
 */
function generateAtomName(property: string, value: string): string {
  const propCamel = kebabToCamel(property)
  const valueFormatted = formatForTsIdentifier(value)
  // 如果值以数字开头，直接拼接；否则转 PascalCase
  if (/^[0-9n]/.test(valueFormatted)) {
    return propCamel + valueFormatted.charAt(0).toUpperCase() + valueFormatted.slice(1)
  }
  const valuePascal = kebabToPascal(valueFormatted)
  return propCamel + valuePascal
}

/**
 * 生成 CSS 类名（property_value）
 */
function generateClassName(property: string, value: string): string {
  const valueFormatted = formatForClassName(value)
  return `${property}_${valueFormatted}`
}

// ==================== CSS-TREE 解析 ====================

/**
 * 提取结果
 */
interface ExtractResult {
  keywords: string[]
  types: string[] // 收集到的数值类型
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
  }

  return result
}

/**
 * 获取属性的关键字列表
 */
function getPropertyKeywords(property: string): string[] {
  const lexer = (csstree as any).lexer
  const propData = lexer.properties[property]

  if (!propData || !propData.syntax) {
    return []
  }

  const extracted = extractFromSyntax(propData.syntax)

  // 去重，过滤掉浏览器前缀和不常用的值
  return [...new Set(extracted.keywords)]
    .filter((k) => !k.startsWith('-') && !k.startsWith('webkit') && k.length > 0)
    .sort()
}

// ==================== 原子类生成 ====================

/**
 * 从 NumericType 生成数值原子类
 */
function generateNumericAtoms(property: string, numericType: NumericType): AtomDefinition[] {
  const atoms: AtomDefinition[] = []
  const values = generateValuePresets(numericType)
  const unit = numericType.unit
  const suffix = unitToSuffix[unit] || ''

  for (const num of values) {
    // 格式化数值（处理小数精度）
    const numStr = Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '')
    const valueWithUnit = suffix ? `${numStr}${suffix}` : numStr

    const name = generateAtomName(property, valueWithUnit)
    const className = generateClassName(property, valueWithUnit)

    atoms.push({
      name,
      className,
      property,
      value: valueWithUnit,
    })
  }

  return atoms
}

/**
 * 生成所有原子类定义
 */
function generateAtoms(config: PropertyNumericConfigBase = defaultConfig): AtomDefinition[] {
  const atoms: AtomDefinition[] = []
  const seenNames = new Set<string>()

  // 获取属性数值配置
  const propertyNumericTypes = config.getPropertyNumericTypes()

  // 收集所有需要处理的属性
  const allProperties = new Set<string>([...Object.keys(propertyNumericTypes)])

  // 添加一些纯关键字属性
  const keywordOnlyProperties = [
    'display',
    'position',
    'float',
    'clear',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'align-self',
    'align-content',
    'text-align',
    'text-decoration',
    'text-transform',
    'white-space',
    'word-break',
    'overflow-wrap',
    'vertical-align',
    'border-style',
    'visibility',
    'overflow',
    'overflow-x',
    'overflow-y',
    'cursor',
    'pointer-events',
    'user-select',
    'box-sizing',
    'table-layout',
    'border-collapse',
    'list-style-type',
    'list-style-position',
    'font-style',
    'resize',
    'appearance',
    'outline-style',
    'background-repeat',
    'background-attachment',
    'background-clip',
    'background-origin',
    'object-fit',
    'object-position',
  ]

  for (const prop of keywordOnlyProperties) {
    allProperties.add(prop)
  }

  // 遍历每个属性
  for (const prop of allProperties) {
    // 1. 添加关键字原子类（从 css-tree）
    const keywords = getPropertyKeywords(prop)
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

    // 2. 添加数值原子类（从配置）
    const numericTypes = propertyNumericTypes[prop]
    if (numericTypes) {
      for (const numericType of numericTypes) {
        const numericAtoms = generateNumericAtoms(prop, numericType)
        for (const atom of numericAtoms) {
          if (seenNames.has(atom.name)) continue
          seenNames.add(atom.name)
          atoms.push(atom)
        }
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

// ==================== 文件生成 ====================

/**
 * 生成 CsstsAtoms.d.ts 文件 - 唯一数据源
 */
function generateCsstsAtomsDts(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CsstsAtoms 接口 - 原子类类型定义（唯一数据源）',
    ' *',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' * 数据来源: css-tree + property-numeric-config-type.ts',
    ' *',
    ' * 命名规则:',
    ' * - CSS 类名: property_value（用 _ 分隔属性和值）',
    ' * - TS 变量名: propertyValue（camelCase）',
    ' * - 小数点: 用 p 代替（1.25 → 1p25）',
    ' * - 百分号: 用 pct 代替（50% → 50pct）',
    ' * - 负数: 用 n 前缀（-1 → n1）',
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
  lines.push('  readonly [key: string]: { [className: string]: true }')
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
    ' *',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' * 数据来源: css-tree + property-numeric-config-type.ts',
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
 * 生成 atoms.json 文件 - 原子类映射表（运行时用）
 *
 * 结构：{ tsIdentifier: { property, className } }
 */
function generateAtomsJson(atoms: AtomDefinition[]): string {
  const data: Record<string, AtomInfo> = {}

  for (const atom of atoms) {
    data[atom.name] = {
      property: atom.property,
      className: atom.className,
    }
  }

  return JSON.stringify(data, null, 2)
}

/**
 * 生成 atoms.css 文件 - 原子类样式定义
 *
 * 与 atoms.json 同时生成，确保数据一致性
 */
function generateAtomsCss(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CssTs Atomic Styles',
    ' *',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' * 数据来源: css-tree + property-numeric-config-type.ts',
    ' */',
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

  // 生成每个分组的 CSS
  for (const [property, groupAtoms] of grouped) {
    lines.push(`/* ==================== ${property} ==================== */`)
    for (const atom of groupAtoms) {
      // 状态类不生成具体样式，由用户定义
      if (property === 'state') {
        lines.push(`.${atom.className} { /* ${atom.value} state */ }`)
      } else {
        lines.push(`.${atom.className} { ${property}: ${atom.value}; }`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== 主函数 ====================

async function main() {
  console.log('🚀 开始生成原子类定义...')
  console.log('')
  console.log('命名规则:')
  console.log('  - CSS 类名: property_value（用 _ 分隔属性和值）')
  console.log('  - TS 变量名: propertyValue（camelCase）')
  console.log('  - 小数点: 用 p 代替（1.25 → 1p25）')
  console.log('  - 百分号: 用 pct 代替（50% → 50pct）')
  console.log('  - 负数: 用 n 前缀（-1 → n1）')
  console.log('')

  // 确保 dist 目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // 生成原子类
  const atoms = generateAtoms()
  console.log(`📦 生成了 ${atoms.length} 个原子类`)

  // 同时生成所有文件（确保数据一致性）

  // 1. 生成 CsstsAtoms.d.ts - 唯一数据源
  const csstsAtomsDts = generateCsstsAtomsDts(atoms)
  fs.writeFileSync(path.join(rootDir, 'CsstsAtoms.d.ts'), csstsAtomsDts)
  console.log('✅ 生成 CsstsAtoms.d.ts')

  // 2. 生成 global.generated.d.ts - 引用 CsstsAtoms
  const globalDts = generateGlobalDts(atoms)
  fs.writeFileSync(path.join(rootDir, 'global.generated.d.ts'), globalDts)
  console.log('✅ 生成 global.generated.d.ts')

  // 3. 生成 atoms.json - 原子类映射表（运行时用）
  const atomsJson = generateAtomsJson(atoms)
  fs.writeFileSync(path.join(distDir, 'atoms.json'), atomsJson)
  console.log('✅ 生成 dist/atoms.json')

  // 4. 生成 atoms.css - 原子类样式定义（与 atoms.json 同时生成）
  const atomsCss = generateAtomsCss(atoms)
  fs.writeFileSync(path.join(distDir, 'atoms.css'), atomsCss)
  console.log('✅ 生成 dist/atoms.css')

  // 输出统计
  const grouped = new Map<string, number>()
  for (const atom of atoms) {
    grouped.set(atom.property, (grouped.get(atom.property) || 0) + 1)
  }

  console.log('\n📊 原子类统计:')
  for (const [prop, count] of [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`   ${prop}: ${count}`)
  }

  // 打印示例
  console.log('\n📝 生成示例:')
  const exampleNames = [
    'displayFlex',
    'justifyContentCenter',
    'paddingTop16px',
    'width50pct',
    'zIndexN1',
    'lineHeight1p5',
    'opacity0p5',
  ]
  const examples = atoms.filter((a) => exampleNames.includes(a.name))
  for (const ex of examples) {
    console.log(`   ${ex.name} → .${ex.className} { ${ex.property}: ${ex.value}; }`)
  }

  console.log('\n✨ 生成完成!')
  console.log('')
  console.log('生成的文件:')
  console.log('  - CsstsAtoms.d.ts      (类型定义)')
  console.log('  - global.generated.d.ts (全局声明)')
  console.log('  - dist/atoms.json      (运行时映射表)')
  console.log('  - dist/atoms.css       (样式定义)')
}

main().catch(console.error)
