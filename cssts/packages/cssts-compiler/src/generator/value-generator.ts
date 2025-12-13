/**
 * 数值生成器
 * 
 * 根据配置生成数值预设
 */

import type { UnitConfig } from './config.js'
import { systemDefaults, type UnitType } from './config.js'

// ==================== 渐进步长策略 ====================

/**
 * 渐进步长区间配置
 * 数值越大，步长越稀疏
 */
const progressiveRanges = [
  { max: 100, divisors: [1] },        // 1-100: 每个整数
  { max: 200, divisors: [2, 5] },     // 100-200: 能被 2 或 5 整除
  { max: 500, divisors: [5] },        // 200-500: 能被 5 整除
  { max: 1000, divisors: [10] },      // 500-1000: 能被 10 整除
  { max: 2000, divisors: [20, 50] },  // 1000-2000: 能被 20 或 50 整除
  { max: 5000, divisors: [50] },      // 2000-5000: 能被 50 整除
  { max: 10000, divisors: [100] },    // 5000-10000: 能被 100 整除
  { max: Infinity, divisors: [1000] }, // 10000+: 能被 1000 整除
]

/**
 * 判断值是否能被任一除数整除
 */
function isDivisibleByAny(value: number, divisors: number[]): boolean {
  return divisors.some(d => value % d === 0)
}

/**
 * 渐进步长策略生成数值
 */
function generateProgressiveValues(min: number, max: number, negative: boolean): number[] {
  const values: number[] = []

  for (let current = min; current <= max; current++) {
    let shouldInclude = false
    let prevMax = 0

    for (const range of progressiveRanges) {
      if (current <= range.max && current > prevMax) {
        shouldInclude = isDivisibleByAny(current, range.divisors)
        break
      }
      prevMax = range.max
    }

    if (shouldInclude) {
      values.push(current)
      if (negative && current > 0) {
        values.push(-current)
      }
    }
  }

  // 确保包含 max
  if (!values.includes(max) && max > 0) {
    values.push(max)
    if (negative) {
      values.push(-max)
    }
  }

  return values
}

/**
 * 固定步长生成数值
 */
function generateStepValues(min: number, max: number, step: number, negative: boolean): number[] {
  const values: number[] = []

  for (let v = min; v <= max; v += step) {
    const rounded = Math.round(v * 1000) / 1000
    values.push(rounded)
    if (negative && rounded > 0) {
      values.push(-rounded)
    }
  }

  // 确保包含 max
  if (!values.includes(max)) {
    values.push(max)
    if (negative && max > 0) {
      values.push(-max)
    }
  }

  return values
}

// ==================== 配置合并 ====================

/**
 * 获取最终的单位配置（字段级 fallback）
 * 
 * 优先级：属性配置 > defaults > systemDefaults
 */
export function resolveUnitConfig(
  propertyConfig: UnitConfig | undefined,
  defaultConfig: UnitConfig | undefined,
  unitType: Exclude<UnitType, 'zero'>
): UnitConfig {
  const system = systemDefaults[unitType]
  
  return {
    min: propertyConfig?.min ?? defaultConfig?.min ?? system.min,
    max: propertyConfig?.max ?? defaultConfig?.max ?? system.max,
    step: propertyConfig?.step ?? defaultConfig?.step ?? system.step,
    presets: propertyConfig?.presets ?? defaultConfig?.presets ?? system.presets,
    negative: propertyConfig?.negative ?? defaultConfig?.negative ?? system.negative,
  }
}

// ==================== 数值生成 ====================

/**
 * 根据配置生成数值预设
 */
export function generateValues(config: UnitConfig): number[] {
  const min = config.min ?? 1
  const max = config.max ?? 100
  const step = config.step
  const negative = config.negative ?? false
  const presets = config.presets ?? []

  let values: number[]

  if (step !== undefined) {
    // 有 step → 固定步长
    values = generateStepValues(min, max, step, negative)
  } else {
    // 无 step → 渐进步长
    values = generateProgressiveValues(min, max, negative)
  }

  // 合并预设值
  if (presets.length > 0) {
    for (const preset of presets) {
      values.push(preset)
      if (negative && preset > 0) {
        values.push(-preset)
      }
    }
  }

  // 去重、排序
  const merged = [...new Set(values)]
  return merged.sort((a, b) => a - b)
}
