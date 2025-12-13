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
      min?: number         // 最小值
      max?: number         // 最大值
      step?: number        // 步长（用于生成预设值）
      presets?: number[]   // 额外预设值（与步长生成的值合并）
      negative?: boolean   // 是否支持负数（默认 false）
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
 * 当属性没有指定 min/max 时使用
 * 注意：不包含 step，未设置 step 时使用渐进步长策略
 */
export const globalDefaults = {
  min: 1,
  max: 100,
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
  return numericType.negative === true
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
 * 判断值是否能被任一除数整除
 *
 * @param value 要检查的值
 * @param divisors 除数数组
 * @returns 是否能被任一除数整除
 */
function isDivisibleByAny(value: number, divisors: number[]): boolean {
  return divisors.some((d) => value % d === 0)
}

/**
 * 渐进步长区间配置
 *
 * | 范围 | 生成规则 |
 * |------|---------|
 * | 1-100 | 步长 1（每个整数） |
 * | 100-200 | 能被 2 或 5 整除的数 |
 * | 200-500 | 能被 5 整除的数 |
 * | 500-1000 | 能被 10 整除的数 |
 * | 1000-2000 | 能被 20 或 50 整除的数 |
 * | 2000-5000 | 能被 50 整除的数 |
 * | 5000-10000 | 能被 100 整除的数 |
 */
const progressiveRanges = [
  { max: 100, divisors: [1] }, // 1-100: 每个整数
  { max: 200, divisors: [2, 5] }, // 100-200: 能被 2 或 5 整除
  { max: 500, divisors: [5] }, // 200-500: 能被 5 整除
  { max: 1000, divisors: [10] }, // 500-1000: 能被 10 整除
  { max: 2000, divisors: [20, 50] }, // 1000-2000: 能被 20 或 50 整除
  { max: 5000, divisors: [50] }, // 2000-5000: 能被 50 整除
  { max: 10000, divisors: [100] }, // 5000-10000: 能被 100 整除
  { max: Infinity, divisors: [1000] }, // 10000+: 能被 1000 整除
]

/**
 * 渐进步长策略 - 生成常用数值预设
 *
 * 策略：数值越大，使用越稀疏的整除规则
 *
 * @param min 最小值
 * @param max 最大值
 * @param supportNegative 是否支持负数
 * @returns 数值数组
 */
function generateProgressiveValues(min: number, max: number, supportNegative: boolean): number[] {
  const values: number[] = []

  for (let current = min; current <= max; current++) {
    // 找到当前值所属的区间
    let shouldInclude = false
    let prevMax = 0

    for (const range of progressiveRanges) {
      if (current <= range.max && current > prevMax) {
        // 当前值在这个区间内，检查是否满足整除条件
        shouldInclude = isDivisibleByAny(current, range.divisors)
        break
      }
      prevMax = range.max
    }

    if (shouldInclude) {
      values.push(current)
      if (supportNegative && current > 0) {
        values.push(-current)
      }
    }
  }

  // 确保包含 max（如果 max 不在生成的值中）
  if (!values.includes(max) && max > 0) {
    values.push(max)
    if (supportNegative) {
      values.push(-max)
    }
  }

  return values
}

/**
 * 根据 NumericType 生成数值预设
 * 
 * 策略：
 * 1. zero 类型 → 返回 [0]
 * 2. 有 step → 使用固定步长生成
 * 3. 无 step → 使用渐进步长策略
 * 4. 如果 negative=true，同时生成负数版本
 * 5. 合并 presets 额外预设值（去重并排序）
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
  const supportNegative = numericType.negative === true
  
  let values: number[] = []
  
  if (numericType.step !== undefined) {
    // 有 step → 使用固定步长生成
    const step = numericType.step
    for (let v = min; v <= max; v += step) {
      const rounded = Math.round(v * 1000) / 1000
      values.push(rounded)
      if (supportNegative && rounded > 0) {
        values.push(-rounded)
      }
    }
    // 确保包含 max
    if (!values.includes(max)) {
      values.push(max)
      if (supportNegative && max > 0) {
        values.push(-max)
      }
    }
  } else {
    // 无 step → 使用渐进步长策略
    values = generateProgressiveValues(min, max, supportNegative)
  }
  
  // 合并额外预设值（如果支持负数，也生成负数版本）
  const presets = numericType.presets ?? []
  if (presets.length > 0) {
    for (const preset of presets) {
      values.push(preset)
      if (supportNegative && preset > 0) {
        values.push(-preset)
      }
    }
  }
  
  // 去重、排序
  const merged = [...new Set(values)]
  return merged.sort((a, b) => a - b)
}
