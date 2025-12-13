/**
 * CssTs 配置类型定义
 * 
 * 结构：属性 → 单位 → 配置
 */

// ==================== 单位配置 ====================

/**
 * 单位配置
 */
export interface UnitConfig {
  min?: number          // 最小值
  max?: number          // 最大值
  step?: number         // 步长（不设置则用渐进步长）
  presets?: number[]    // 额外预设值
  negative?: boolean    // 是否支持负数
}

/**
 * 属性配置：每个属性支持的单位及其配置
 */
export interface PropertyConfig {
  zero?: boolean           // 是否生成 0 值
  px?: UnitConfig          // 像素
  rem?: UnitConfig         // rem
  ratio?: UnitConfig       // 百分比
  unitless?: UnitConfig    // 无单位数值
  deg?: UnitConfig         // 角度
  ms?: UnitConfig          // 时间
  fr?: UnitConfig          // grid fr
}

/**
 * 完整配置
 */
export interface CsstsConfig {
  /** 全局默认配置（字段级 fallback） */
  defaults?: {
    px?: UnitConfig
    rem?: UnitConfig
    ratio?: UnitConfig
    unitless?: UnitConfig
    deg?: UnitConfig
    ms?: UnitConfig
    fr?: UnitConfig
  }
  /** 属性配置 */
  properties: Record<string, PropertyConfig>
}

// ==================== 单位类型 ====================

export type UnitType = 'zero' | 'px' | 'rem' | 'ratio' | 'deg' | 'ms' | 'fr' | 'unitless'

/**
 * 单位到 CSS 后缀的映射
 */
export const unitToSuffix: Record<Exclude<UnitType, 'zero'>, string> = {
  px: 'px',
  rem: 'rem',
  ratio: '%',
  deg: 'deg',
  ms: 'ms',
  fr: 'fr',
  unitless: '',
}

// ==================== 系统内置默认值 ====================

/**
 * 系统内置默认值（当 defaults 和属性配置都没有时使用）
 */
export const systemDefaults: Record<Exclude<UnitType, 'zero'>, UnitConfig> = {
  px: { min: 1, max: 10000 },
  rem: { min: 0.25, max: 50, step: 0.25 },
  ratio: { min: 1, max: 100 },
  unitless: { min: 0, max: 100 },
  deg: { min: 0, max: 360 },
  ms: { min: 0, max: 10000, step: 100 },
  fr: { min: 1, max: 12 },
}

// ==================== 默认属性配置 ====================

/**
 * 默认属性配置
 */
export const defaultProperties: Record<string, PropertyConfig> = {
  // ==================== Sizing ====================
  width: { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  height: { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'min-width': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'min-height': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'max-width': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'max-height': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },

  // ==================== Spacing - Padding ====================
  padding: { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'padding-top': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'padding-right': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'padding-bottom': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },
  'padding-left': { zero: true, px: { max: 10000 }, rem: {}, ratio: {} },

  // ==================== Spacing - Margin ====================
  margin: { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  'margin-top': { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  'margin-right': { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  'margin-bottom': { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  'margin-left': { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },

  // ==================== Positioning ====================
  top: { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  right: { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  bottom: { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  left: { zero: true, px: { max: 10000, negative: true }, rem: { negative: true }, ratio: { negative: true } },

  // ==================== Gap ====================
  gap: { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'row-gap': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'column-gap': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },

  // ==================== Border ====================
  'border-width': { zero: true, px: { max: 20 } },
  'border-top-width': { zero: true, px: { max: 20 } },
  'border-right-width': { zero: true, px: { max: 20 } },
  'border-bottom-width': { zero: true, px: { max: 20 } },
  'border-left-width': { zero: true, px: { max: 20 } },
  'border-radius': { zero: true, px: { max: 500, presets: [9999] }, rem: { max: 10 }, ratio: {} },
  'border-top-left-radius': { zero: true, px: { max: 500, presets: [9999] }, rem: { max: 10 }, ratio: {} },
  'border-top-right-radius': { zero: true, px: { max: 500, presets: [9999] }, rem: { max: 10 }, ratio: {} },
  'border-bottom-left-radius': { zero: true, px: { max: 500, presets: [9999] }, rem: { max: 10 }, ratio: {} },
  'border-bottom-right-radius': { zero: true, px: { max: 500, presets: [9999] }, rem: { max: 10 }, ratio: {} },

  // ==================== Typography ====================
  'font-size': { zero: true, px: { min: 8, max: 200 }, rem: { min: 0.5, max: 10, step: 0.125 }, ratio: {} },
  'font-weight': { unitless: { min: 100, max: 900, step: 100 } },
  'line-height': { zero: true, px: { max: 100 }, rem: { min: 1, max: 5, step: 0.25 }, unitless: { min: 0.5, max: 3, step: 0.1 } },
  'letter-spacing': { zero: true, px: { max: 50 }, rem: { max: 5, step: 0.125 } },
  'word-spacing': { zero: true, px: { max: 100 }, rem: { max: 10 } },
  'text-indent': { zero: true, px: { max: 200 }, rem: {}, ratio: {} },

  // ==================== Layout ====================
  'z-index': { unitless: { max: 9999, negative: true } },
  order: { unitless: { min: 1, max: 100, negative: true } },
  'flex-grow': { unitless: { min: 0, max: 10, step: 1 } },
  'flex-shrink': { unitless: { min: 0, max: 10, step: 1 } },
  'flex-basis': { zero: true, px: { max: 2000 }, rem: {}, ratio: {} },

  // ==================== Grid ====================
  'grid-column': { unitless: { min: 1, max: 24 } },
  'grid-column-start': { unitless: { min: 1, max: 24 } },
  'grid-column-end': { unitless: { min: 1, max: 24 } },
  'grid-row': { unitless: { min: 1, max: 24 } },
  'grid-row-start': { unitless: { min: 1, max: 24 } },
  'grid-row-end': { unitless: { min: 1, max: 24 } },
  'grid-template-columns': { zero: true, px: { max: 2000 }, fr: {}, ratio: {} },
  'grid-template-rows': { zero: true, px: { max: 2000 }, fr: {}, ratio: {} },
  'grid-auto-columns': { zero: true, px: { max: 2000 }, fr: {}, ratio: {} },
  'grid-auto-rows': { zero: true, px: { max: 2000 }, fr: {}, ratio: {} },

  // ==================== Visual ====================
  opacity: { unitless: { min: 0, max: 1, step: 0.1 } },
  'background-size': { zero: true, px: { max: 2000 }, ratio: {} },
  'background-position': { zero: true, px: { max: 2000, negative: true }, ratio: {} },
  'background-position-x': { zero: true, px: { max: 2000, negative: true }, ratio: {} },
  'background-position-y': { zero: true, px: { max: 2000, negative: true }, ratio: {} },

  // ==================== Transform ====================
  rotate: { zero: true, deg: {} },
  scale: { unitless: { min: 0, max: 5, step: 0.1 }, ratio: {} },
  translate: { zero: true, px: { max: 2000, negative: true }, rem: { negative: true }, ratio: { negative: true } },
  perspective: { zero: true, px: { max: 2000 }, rem: {} },
  'transform-origin': { zero: true, px: { max: 2000, negative: true }, ratio: {} },

  // ==================== Animation ====================
  'animation-duration': { zero: true, ms: {} },
  'animation-delay': { zero: true, ms: {} },
  'animation-iteration-count': { unitless: { min: 0, max: 100 } },
  'transition-duration': { zero: true, ms: {} },
  'transition-delay': { zero: true, ms: {} },

  // ==================== Scroll ====================
  'scroll-margin': { zero: true, px: { max: 200 }, rem: { max: 20 } },
  'scroll-margin-top': { zero: true, px: { max: 200 }, rem: { max: 20 } },
  'scroll-margin-right': { zero: true, px: { max: 200 }, rem: { max: 20 } },
  'scroll-margin-bottom': { zero: true, px: { max: 200 }, rem: { max: 20 } },
  'scroll-margin-left': { zero: true, px: { max: 200 }, rem: { max: 20 } },
  'scroll-padding': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'scroll-padding-top': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'scroll-padding-right': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'scroll-padding-bottom': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },
  'scroll-padding-left': { zero: true, px: { max: 200 }, rem: { max: 20 }, ratio: {} },

  // ==================== Other ====================
  'aspect-ratio': { unitless: { min: 0.1, max: 10, step: 0.1 } },
  'column-count': { unitless: { min: 1, max: 20 } },
  'column-width': { zero: true, px: { max: 1000 }, rem: {} },
  'outline-width': { zero: true, px: { max: 20 } },
  'outline-offset': { zero: true, px: { max: 50 }, rem: { max: 5 } },
}

/**
 * 默认配置
 */
export const defaultConfig: CsstsConfig = {
  defaults: systemDefaults,
  properties: defaultProperties,
}
