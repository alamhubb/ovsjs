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
 * - zero 类型只有一个值 0，不需要 value 字段
 * - 其他类型需要指定 value 类型（integer/number）
 */
export type NumericType = 
  | { unit: 'zero' }
  | {
      unit: Exclude<UnitType, 'zero'>
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

// ==================== 默认配置 ====================

/**
 * 全局默认配置
 * 当属性没有指定 min/max/step 时使用
 */
export const globalDefaults = {
  min: 1,
  max: 100,
  step: 1,
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
  // zero 类型只有 0，不支持负数
  if (numericType.unit === 'zero') return false
  return numericType.min === undefined || numericType.min < 0
}

/**
 * 获取单位后缀列表
 */
export function getUnitSuffixes(unitType: UnitType): string[] {
  return unitToSuffixes[unitType]
}

/**
 * 根据 min/max/step 生成数值序列
 * 
 * @param min 最小值
 * @param max 最大值
 * @param step 步长
 * @returns 数值数组
 */
export function generateStepValues(min: number, max: number, step: number): number[] {
  const values: number[] = []
  for (let v = min; v <= max; v += step) {
    // 处理浮点数精度问题
    const rounded = Math.round(v * 1000) / 1000
    values.push(rounded)
  }
  // 确保包含 max（处理浮点数精度问题）
  if (values.length > 0 && values[values.length - 1] !== max) {
    values.push(max)
  }
  return values
}

/**
 * 根据 NumericType 生成数值预设
 * 
 * 策略：
 * 1. zero 类型 → 返回 [0]
 * 2. 使用配置的 min/max/step，未配置的使用全局默认值
 */
export function generateValuePresets(numericType: NumericType): number[] {
  const { unit } = numericType
  
  // zero 类型只返回 [0]
  if (unit === 'zero') {
    return [0]
  }
  
  // 使用配置值或全局默认值
  const min = numericType.min ?? globalDefaults.min
  const max = numericType.max ?? globalDefaults.max
  const step = numericType.step ?? globalDefaults.step
  
  return generateStepValues(min, max, step)
}
