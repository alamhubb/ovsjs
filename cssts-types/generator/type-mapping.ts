/**
 * CSS-Tree 类型映射模块
 * 
 * 将 css-tree 的类型系统映射到我们的原子类类型系统
 * 
 * 设计原则：
 * 1. 自动提取：从 css-tree 获取关键字和基础类型
 * 2. 手动补充：配置负数支持、数值范围等 css-tree 无法提供的信息
 */

import * as csstree from 'css-tree'

// ==================== 我们的类型定义 ====================

/**
 * 单位类型
 * - px: 像素（绝对单位）
 * - rem: 相对单位（字体相关）
 * - ratio: 比例单位（%、vh、vw 等）
 * - deg: 角度
 * - ms: 时间
 * - none: 无单位
 */
export type UnitType = 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'none'

/**
 * 数值类型
 * - integer: 整数（如 z-index, order, font-weight）
 * - number: 小数（如 opacity, line-height）
 */
export type ValueType = 'integer' | 'number'

/**
 * 单位类型到具体 CSS 单位后缀的映射
 */
export const unitToSuffixes: Record<UnitType, string[]> = {
  'px': ['px'],
  'rem': ['rem', 'em'],
  'ratio': ['%', 'vh', 'vw', 'vmin', 'vmax'],
  'deg': ['deg', 'rad', 'turn'],
  'ms': ['ms', 's'],
  'none': [],
}

/**
 * 数值类型定义
 */
export interface NumericType {
  unit: UnitType       // 单位类型
  value: ValueType     // 数值类型（integer/number）
  min?: number         // 最小值（undefined = 支持负数）
  max?: number         // 最大值
}

/**
 * 属性定义（我们的结构）
 */
export interface PropertyDefinition {
  keywords: string[]        // 关键字值
  numeric?: NumericType[]   // 数值类型数组
}

// ==================== CSS-Tree 类型映射 ====================

/**
 * css-tree 类型 → 我们的单位类型
 */
const csstreeToUnit: Record<string, UnitType> = {
  'length': 'px',
  'percentage': 'ratio',
  'angle': 'deg',
  'time': 'ms',
  'number': 'none',
  'integer': 'none',
  // 复合类型
  'length-percentage': 'px',  // 会展开为 px 和 ratio
  'alpha-value': 'none',
}

/**
 * css-tree 类型 → 我们的数值类型
 */
const csstreeToValue: Record<string, ValueType> = {
  'integer': 'integer',
  'number': 'number',
  'length': 'number',       // 长度支持小数（如 1.5px）
  'percentage': 'number',   // 百分比支持小数
  'angle': 'number',
  'time': 'number',
  'alpha-value': 'number',
}

/**
 * 需要展开为多个单位类型的复合类型
 */
const expandableTypes: Record<string, UnitType[]> = {
  'length-percentage': ['px', 'ratio'],
}

// ==================== 手动覆盖配置 ====================

/**
 * 属性覆盖配置
 * 用于补充 css-tree 无法提供的信息（负数支持、精确范围等）
 */
export const propertyOverrides: Record<string, Partial<PropertyDefinition>> = {
  // 间距类 - 不支持负数
  'padding': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'padding-top': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'padding-right': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'padding-bottom': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'padding-left': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  
  // 间距类 - 支持负数
  'margin': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'margin-top': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'margin-right': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'margin-bottom': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'margin-left': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  
  // 尺寸类 - 不支持负数
  'width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'height': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'min-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'max-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'min-height': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'max-height': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  
  // 定位类 - 支持负数
  'top': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'right': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'bottom': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'left': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  'inset': { numeric: [{ unit: 'px', value: 'integer' }, { unit: 'ratio', value: 'number' }] },
  
  // 无单位数值类
  'opacity': { numeric: [{ unit: 'none', value: 'number', min: 0, max: 1 }] },
  'z-index': { numeric: [{ unit: 'none', value: 'integer' }] },  // 支持负数
  'line-height': { numeric: [{ unit: 'none', value: 'number', min: 0 }] },
  'font-weight': { numeric: [{ unit: 'none', value: 'integer', min: 1, max: 1000 }] },
  'flex-grow': { numeric: [{ unit: 'none', value: 'number', min: 0 }] },
  'flex-shrink': { numeric: [{ unit: 'none', value: 'number', min: 0 }] },
  'order': { numeric: [{ unit: 'none', value: 'integer' }] },  // 支持负数
  
  // 排版类
  'font-size': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'rem', value: 'number', min: 0 }] },
  'letter-spacing': { numeric: [{ unit: 'px', value: 'number' }] },  // 支持负数
  'word-spacing': { numeric: [{ unit: 'px', value: 'number' }] },
  
  // 边框类
  'border-radius': { numeric: [{ unit: 'px', value: 'integer', min: 0 }, { unit: 'ratio', value: 'number', min: 0 }] },
  'border-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-top-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-right-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-bottom-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-left-width': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-top-left-radius': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-top-right-radius': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-bottom-left-radius': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'border-bottom-right-radius': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  
  // 间隙类
  'gap': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'row-gap': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  'column-gap': { numeric: [{ unit: 'px', value: 'integer', min: 0 }] },
  
  // 变换类 - 支持负数
  'rotate': { numeric: [{ unit: 'deg', value: 'number' }] },
  'scale': { numeric: [{ unit: 'none', value: 'number' }] },
  
  // 过渡类
  'transition-duration': { numeric: [{ unit: 'ms', value: 'number', min: 0 }] },
}

// ==================== 提取函数 ====================

/**
 * 从 css-tree 语法中提取信息
 */
interface CsstreeExtractResult {
  keywords: string[]
  types: string[]  // css-tree 类型名称
}

/**
 * 递归提取 css-tree 语法中的关键字和类型
 */
function extractFromCsstree(syntax: any, visited: Set<string> = new Set()): CsstreeExtractResult {
  const result: CsstreeExtractResult = { keywords: [], types: [] }
  if (!syntax) return result
  
  const lexer = (csstree as any).lexer
  
  if (syntax.type === 'Keyword') {
    result.keywords.push(syntax.name)
  } else if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      const sub = extractFromCsstree(term, visited)
      result.keywords.push(...sub.keywords)
      result.types.push(...sub.types)
    }
  } else if (syntax.type === 'Type' && syntax.name) {
    // 检查是否是我们关心的数值类型
    const numericTypes = Object.keys(csstreeToUnit)
    if (numericTypes.includes(syntax.name)) {
      result.types.push(syntax.name)
    } else if (!visited.has(syntax.name)) {
      // 递归解析其他类型引用
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        const sub = extractFromCsstree(typeData.syntax, visited)
        result.keywords.push(...sub.keywords)
        result.types.push(...sub.types)
      }
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    const sub = extractFromCsstree(syntax.term, visited)
    result.keywords.push(...sub.keywords)
    result.types.push(...sub.types)
  }
  
  return result
}

/**
 * 将 css-tree 类型转换为我们的 NumericType
 */
function convertCsstreeType(csstreeType: string): NumericType[] {
  // 检查是否需要展开
  if (expandableTypes[csstreeType]) {
    return expandableTypes[csstreeType].map(unit => ({
      unit,
      value: csstreeToValue[csstreeType] || 'number',
    }))
  }
  
  const unit = csstreeToUnit[csstreeType]
  const value = csstreeToValue[csstreeType]
  
  if (unit && value) {
    return [{ unit, value }]
  }
  
  return []
}

// ==================== 主要 API ====================

/**
 * 获取属性的完整定义
 * 
 * 流程：
 * 1. 从 css-tree 提取关键字和类型
 * 2. 将 css-tree 类型转换为我们的类型
 * 3. 应用手动覆盖配置
 * 
 * @param property CSS 属性名
 * @returns PropertyDefinition
 */
export function getPropertyDefinition(property: string): PropertyDefinition {
  const lexer = (csstree as any).lexer
  const propData = lexer.properties[property]
  
  // 默认空定义
  const definition: PropertyDefinition = { keywords: [] }
  
  if (propData && propData.syntax) {
    // 从 css-tree 提取
    const extracted = extractFromCsstree(propData.syntax)
    
    // 处理关键字：去重、过滤
    definition.keywords = [...new Set(extracted.keywords)]
      .filter(k => 
        !k.startsWith('-') && 
        !k.startsWith('webkit') &&
        k.length > 0
      )
      .sort()
    
    // 处理类型：转换为我们的结构
    const uniqueTypes = [...new Set(extracted.types)]
    const numericTypes: NumericType[] = []
    
    for (const type of uniqueTypes) {
      numericTypes.push(...convertCsstreeType(type))
    }
    
    // 去重（按 unit 去重）
    const seenUnits = new Set<UnitType>()
    const dedupedNumeric: NumericType[] = []
    for (const nt of numericTypes) {
      if (!seenUnits.has(nt.unit)) {
        seenUnits.add(nt.unit)
        dedupedNumeric.push(nt)
      }
    }
    
    if (dedupedNumeric.length > 0) {
      definition.numeric = dedupedNumeric
    }
  }
  
  // 应用手动覆盖
  const override = propertyOverrides[property]
  if (override) {
    if (override.keywords) {
      definition.keywords = override.keywords
    }
    if (override.numeric) {
      definition.numeric = override.numeric
    }
  }
  
  return definition
}

/**
 * 判断是否支持小数
 */
export function supportsDecimal(valueType: ValueType): boolean {
  return valueType !== 'integer'
}

/**
 * 判断是否支持负数
 */
export function supportsNegative(numericType: NumericType): boolean {
  return numericType.min === undefined || numericType.min < 0
}

/**
 * 获取单位后缀列表
 */
export function getUnitSuffixes(unitType: UnitType): string[] {
  return unitToSuffixes[unitType]
}

// ==================== 数值预设 ====================

/**
 * 每种单位类型的数值预设
 */
export const valuePresets: Record<UnitType, number[]> = {
  'px': [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80, 100, 120],
  'rem': [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
  'ratio': [0, 25, 33.33, 50, 66.67, 75, 100],
  'deg': [0, 45, 90, 180, 270, 360],
  'ms': [0, 100, 150, 200, 300, 500, 1000],
  'none': [],
}

/**
 * 无单位属性的特殊预设
 */
export const noneValuePresets: Record<string, number[]> = {
  'opacity': [0, 0.25, 0.5, 0.75, 1],
  'z-index': [-1, 0, 10, 20, 30, 40, 50, 100, 999, 9999],
  'line-height': [1, 1.25, 1.5, 1.75, 2],
  'font-weight': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'flex-grow': [0, 1],
  'flex-shrink': [0, 1],
  'order': [-1, 0, 1, 2, 3, 4, 5],
  'scale': [0, 0.5, 0.75, 1, 1.25, 1.5, 2],
}

/**
 * 获取属性的数值预设
 */
export function getValuePresets(unitType: UnitType, property?: string): number[] {
  if (unitType === 'none' && property) {
    return noneValuePresets[property] || []
  }
  return valuePresets[unitType]
}

// ==================== 调试/测试 ====================

/**
 * 打印属性定义（调试用）
 */
export function debugPropertyDefinition(property: string): void {
  const def = getPropertyDefinition(property)
  console.log(`\n=== ${property} ===`)
  console.log('Keywords:', def.keywords.slice(0, 10).join(', '), def.keywords.length > 10 ? '...' : '')
  if (def.numeric) {
    console.log('Numeric:')
    for (const n of def.numeric) {
      const minStr = n.min !== undefined ? `min=${n.min}` : 'min=∞'
      const maxStr = n.max !== undefined ? `max=${n.max}` : 'max=∞'
      const negStr = supportsNegative(n) ? '(支持负数)' : '(不支持负数)'
      const decStr = supportsDecimal(n.value) ? '(支持小数)' : '(仅整数)'
      console.log(`  - unit=${n.unit}, value=${n.value}, ${minStr}, ${maxStr} ${negStr} ${decStr}`)
    }
  }
}

/**
 * 测试函数
 */
export function testTypeMapping(): void {
  console.log('🧪 测试类型映射...\n')
  
  const testProperties = [
    'display',      // 纯关键字
    'padding',      // px，不支持负数
    'margin',       // px + ratio，支持负数
    'width',        // px + ratio，不支持负数
    'opacity',      // none，0-1
    'z-index',      // none，支持负数
    'line-height',  // none，不支持负数
    'font-size',    // px + rem
    'rotate',       // deg，支持负数
    'font-weight',  // none，1-1000
  ]
  
  for (const prop of testProperties) {
    debugPropertyDefinition(prop)
  }
}
