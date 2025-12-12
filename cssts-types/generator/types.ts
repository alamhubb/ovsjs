/**
 * CssTs 原子类生成器 - 类型定义
 * 
 * 定义单位类型、数值类型、属性定义等核心数据结构
 */

// ==================== 单位类型 ====================

/**
 * 单位类型
 * - zero: 特殊值 0（无单位）
 * - px: 像素（绝对单位）
 * - rem: 相对单位（字体相关）
 * - ratio: 比例单位（%、vh、vw 等）
 * - deg: 角度
 * - ms: 时间
 * - fr: CSS Grid 弹性单位
 * - unitless: 无单位数值（如 opacity, z-index, line-height）
 */
export type UnitType = 'zero' | 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'fr' | 'unitless'

/**
 * 单位类型到具体 CSS 单位后缀的映射
 */
export const unitToSuffixes: Record<UnitType, string[]> = {
  'zero': [''],
  'px': ['px'],
  'rem': ['rem', 'em'],
  'ratio': ['%', 'vh', 'vw', 'vmin', 'vmax'],
  'deg': ['deg', 'rad', 'turn'],
  'ms': ['ms', 's'],
  'fr': ['fr'],
  'unitless': [''],
}

// ==================== 数值类型 ====================

/**
 * 数值类型
 * - integer: 整数（如 z-index, order, font-weight）
 * - number: 小数（如 opacity, line-height）
 */
export type ValueType = 'integer' | 'number'

/**
 * 数值配置
 */
export interface NumericType {
  unit: UnitType       // 单位类型
  value: ValueType     // 数值类型（integer/number）
  min?: number         // 最小值（undefined = 支持负数）
  max?: number         // 最大值
  step?: number        // 步长（用于生成预设值）
}

// ==================== 属性定义 ====================

/**
 * CSS 属性定义
 */
export interface PropertyDefinition {
  keywords: string[]        // 关键字值（来自 css-tree）
  numeric?: NumericType[]   // 数值类型数组
}

// ==================== 数值预设 ====================

/**
 * 通用数值预设（按单位类型）
 * 当属性没有自定义预设时使用
 */
export const defaultValuePresets: Record<UnitType, number[]> = {
  'zero': [0],
  'px': [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80, 100, 120],
  'rem': [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
  'ratio': [25, 33.33, 50, 66.67, 75, 100],
  'deg': [45, 90, 180, 270, 360],
  'ms': [100, 150, 200, 300, 500, 1000],
  'fr': [1, 2, 3, 4],
  'unitless': [],
}

/**
 * 无单位属性的特殊预设
 */
export const unitlessValuePresets: Record<string, number[]> = {
  'opacity': [0, 0.25, 0.5, 0.75, 1],
  'z-index': [-1, 0, 10, 20, 30, 40, 50, 100, 999, 9999],
  'line-height': [1, 1.25, 1.5, 1.75, 2],
  'font-weight': [100, 200, 300, 400, 500, 600, 700, 800, 900],
  'flex-grow': [0, 1],
  'flex-shrink': [0, 1],
  'order': [-1, 0, 1, 2, 3, 4, 5],
}

// ==================== 工具函数 ====================

/**
 * 判断是否支持小数
 */
export function supportsDecimal(valueType: ValueType): boolean {
  return valueType === 'number'
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

/**
 * 根据 NumericType 生成数值预设
 * 
 * 优先级：
 * 1. 如果有 step，根据 min/max/step 生成
 * 2. 如果是 none 类型且有属性特定预设，使用属性预设
 * 3. 否则使用默认预设
 */
export function generateValuePresets(
  numericType: NumericType,
  property?: string
): number[] {
  const { unit, value, min, max, step } = numericType
  
  // 1. 如果有 step，根据范围生成
  if (step !== undefined && min !== undefined && max !== undefined) {
    const values: number[] = []
    for (let v = min; v <= max; v += step) {
      // 处理浮点数精度问题
      const rounded = Math.round(v * 1000) / 1000
      values.push(rounded)
    }
    // 确保包含 max
    if (values[values.length - 1] !== max) {
      values.push(max)
    }
    return values
  }
  
  // 2. 无单位属性的特殊预设
  if (unit === 'unitless' && property && unitlessValuePresets[property]) {
    return unitlessValuePresets[property]
  }
  
  // 3. 使用默认预设
  let presets = defaultValuePresets[unit]
  
  // 根据 min/max 过滤
  if (min !== undefined || max !== undefined) {
    presets = presets.filter(v => {
      if (min !== undefined && v < min) return false
      if (max !== undefined && v > max) return false
      return true
    })
  }
  
  return presets
}
