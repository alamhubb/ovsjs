/**
 * 属性数值配置类
 * 用户可以通过继承此类并重写属性来自定义配置
 */

import type { NumericType } from './types'

/**
 * 属性数值配置基类
 * 所有属性都有默认值，用户可以通过继承重写任意属性
 *
 * @example
 * ```typescript
 * // 自定义配置
 * class MyConfig extends PropertyNumericConfigBase {
 *   // 修改边框宽度最大值
 *   override borderWidthPx: NumericType = { unit: 'px', value: 'integer', max: 50 }
 *
 *   // 修改 bottom 属性使用的数值类型
 *   override bottom = [this.zero, this.sizePx, this.ratio]
 * }
 *
 * const config = new MyConfig()
 * ```
 */
export class PropertyNumericConfigBase {
  // ==================== 基础 NumericType ====================

  /** 特殊值 0（无单位） */
  zero: NumericType = { unit: 'zero' }

  /** 比例/百分比 (1-100%, 包含三等分预设) */
  ratio: NumericType = { unit: 'ratio', value: 'number', presets: [33.33, 66.67] }

  /** Grid 弹性单位 (1-12) */
  fr: NumericType = { unit: 'fr', value: 'number', min: 1, max: 12 }

  /** 透明度 (0-1) */
  alpha: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1 }

  /** 字重 (1-1000, step 100) */
  fontWeight: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 1000, step: 100 }
