/**
 * 属性到数值类型的映射配置
 * 定义每个 CSS 属性支持的数值类型（unit + value）
 */

import type { NumericType } from './types'

// ==================== 基础 NumericType 常量 ====================

/** 特殊值 0（无单位） */
const zero: NumericType = { unit: 'zero' }

/** 像素整数 */
const px: NumericType = { unit: 'px', value: 'integer' }

/** 比例/百分比 */
const ratio: NumericType = { unit: 'ratio', value: 'number' }

/** Grid 弹性单位 */
const fr: NumericType = { unit: 'fr', value: 'number' }

/** 角度 */
const deg: NumericType = { unit: 'deg', value: 'number' }

/** 时间（毫秒） */
const ms: NumericType = { unit: 'ms', value: 'integer' }

/** 无单位整数 */
const int: NumericType = { unit: 'unitless', value: 'integer' }

/** 无单位小数 */
const num: NumericType = { unit: 'unitless', value: 'number' }

/** 透明度 (0-1) */
const alpha: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1 }

/** 字重 (1-1000, step 100) */
const fontWeight: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 1000, step: 100 }

/**
 * CSS 属性到数值类型的映射
 * 每个属性对应一个 NumericType[] 数组
 */
export const propertyNumericTypes: Record<string, NumericType[]> = {
  // ========== sizing ==========
  'height': [zero, px, ratio],
  'max-height': [zero, px, ratio],
  'max-width': [zero, px, ratio],
  'min-height': [zero, px, ratio],
  'min-width': [zero, px, ratio],
  'width': [zero, px, ratio],

  // ========== spacing ==========
  'column-gap': [zero, px, ratio],
  'margin': [zero, px, ratio],
  'margin-bottom': [zero, px, ratio],
  'margin-left': [zero, px, ratio],
  'margin-right': [zero, px, ratio],
  'margin-top': [zero, px, ratio],
  'padding': [zero, px, ratio],
  'padding-bottom': [zero, px, ratio],
  'padding-left': [zero, px, ratio],
  'padding-right': [zero, px, ratio],
  'padding-top': [zero, px, ratio],
  'row-gap': [zero, px, ratio],

  // ========== positioning ==========
  'bottom': [zero, px, ratio],
  'left': [zero, px, ratio],
  'right': [zero, px, ratio],
  'top': [zero, px, ratio],

  // ========== layout ==========
  'flex-grow': [num],
  'flex-shrink': [num],
  'grid-area': [int],
  'grid-auto-columns': [zero, px, ratio, fr],
  'grid-auto-rows': [zero, px, ratio, fr],
  'grid-column': [int],
  'grid-column-end': [int],
  'grid-column-gap': [zero, px, ratio],
  'grid-column-start': [int],
  'grid-row': [int],
  'grid-row-end': [int],
  'grid-row-gap': [zero, px, ratio],
  'grid-row-start': [int],
  'grid-template': [zero, px, ratio, fr],
  'grid-template-columns': [zero, px, ratio, fr],
  'grid-template-rows': [zero, px, ratio, fr],
  'order': [int],
  'z-index': [int],

  // ========== typography ==========
  'font-feature-settings': [int],
  'font-size': [zero, px, ratio],
  'font-size-adjust': [num],
  'font-smooth': [zero, px],
  'font-stretch': [ratio],
  'font-style': [deg],
  'font-variation-settings': [num],
  'font-weight': [fontWeight],
  'letter-spacing': [zero, px],
  'line-clamp': [int],
  'line-height': [zero, px, num],
  'line-height-step': [zero, px],
  'tab-size': [zero, px, int],
  'text-combine-upright': [int],
  'text-decoration-thickness': [zero, px, ratio],
  'text-indent': [zero, px, ratio],
  'text-shadow': [zero, px],
  'text-size-adjust': [ratio],
  'text-underline-offset': [zero, px, ratio],
  'vertical-align': [zero, px, ratio],
  'word-spacing': [zero, px, ratio],

  // ========== border ==========
  'border': [zero, px],
  'border-bottom': [zero, px],
  'border-bottom-left-radius': [zero, px, ratio],
  'border-bottom-right-radius': [zero, px, ratio],
  'border-bottom-width': [zero, px],
  'border-end-end-radius': [zero, px, ratio],
  'border-end-start-radius': [zero, px, ratio],
  'border-image-outset': [zero, px, num],
  'border-image-slice': [num, ratio],
  'border-image-width': [zero, px, ratio, num],
  'border-left': [zero, px],
  'border-left-width': [zero, px],
  'border-radius': [zero, px, ratio],
  'border-right': [zero, px],
  'border-right-width': [zero, px],
  'border-spacing': [zero, px],
  'border-start-end-radius': [zero, px, ratio],
  'border-start-start-radius': [zero, px, ratio],
  'border-top': [zero, px],
  'border-top-left-radius': [zero, px, ratio],
  'border-top-right-radius': [zero, px, ratio],
  'border-top-width': [zero, px],
  'border-width': [zero, px],
  'outline-offset': [zero, px],
  'outline-width': [zero, px],

  // ========== background ==========
  'background': [zero, px, ratio],
  'background-position': [zero, px, ratio],
  'background-position-x': [zero, px, ratio],
  'background-position-y': [zero, px, ratio],
  'background-size': [zero, px, ratio],

  // ========== opacity ==========
  'fill-opacity': [alpha],
  'opacity': [alpha],

  // ========== transform ==========
  'perspective': [zero, px],
  'rotate': [zero, deg],
  'scale': [num, ratio],
  'transform-origin': [zero, px, ratio],
  'translate': [zero, px, ratio],

  // ========== animation ==========
  'animation': [ms, num],
  'animation-delay': [zero, ms],
  'animation-duration': [zero, ms],
  'animation-iteration-count': [num],
  'animation-range-end': [zero, px, ratio],
  'animation-range-start': [zero, px, ratio],
  'animation-timing-function': [num],
  'transition': [ms, num],
  'transition-delay': [zero, ms],
  'transition-duration': [zero, ms],
  'transition-timing-function': [num],

  // ========== scroll ==========
  'overflow-clip-margin': [zero, px],
  'scroll-margin': [zero, px],
  'scroll-margin-block': [zero, px],
  'scroll-margin-block-end': [zero, px],
  'scroll-margin-block-start': [zero, px],
  'scroll-margin-bottom': [zero, px],
  'scroll-margin-inline': [zero, px],
  'scroll-margin-inline-end': [zero, px],
  'scroll-margin-inline-start': [zero, px],
  'scroll-margin-left': [zero, px],
  'scroll-margin-right': [zero, px],
  'scroll-margin-top': [zero, px],
  'scroll-padding': [zero, px, ratio],
  'scroll-padding-block': [zero, px, ratio],
  'scroll-padding-block-end': [zero, px, ratio],
  'scroll-padding-block-start': [zero, px, ratio],
  'scroll-padding-bottom': [zero, px, ratio],
  'scroll-padding-inline': [zero, px, ratio],
  'scroll-padding-inline-end': [zero, px, ratio],
  'scroll-padding-inline-start': [zero, px, ratio],
  'scroll-padding-left': [zero, px, ratio],
  'scroll-padding-right': [zero, px, ratio],
  'scroll-padding-top': [zero, px, ratio],
  'scroll-snap-coordinate': [zero, px, ratio],
  'scroll-snap-destination': [zero, px, ratio],
  'scroll-snap-points-x': [zero, px, ratio],
  'scroll-snap-points-y': [zero, px, ratio],

  // ========== other ==========
  'aspect-ratio': [num],
  'azimuth': [deg],
  'baseline-shift': [zero, px, ratio],
  'box-flex': [num],
  'box-flex-group': [int],
  'box-ordinal-group': [int],
  'clip-path': [zero, px, ratio],
  'column-count': [int],
  'column-width': [zero, px],
  'contain-intrinsic-block-size': [zero, px],
  'contain-intrinsic-height': [zero, px],
  'contain-intrinsic-inline-size': [zero, px],
  'contain-intrinsic-size': [zero, px],
  'contain-intrinsic-width': [zero, px],
  'counter-increment': [int],
  'counter-reset': [int],
  'counter-set': [int],
  'cursor': [num],
  'cx': [zero, px, ratio],
  'cy': [zero, px, ratio],
  'glyph-orientation-horizontal': [deg],
  'glyph-orientation-vertical': [deg],
  'hyphenate-limit-chars': [int],
  'image-orientation': [deg],
  'initial-letter': [num],
  'kerning': [zero, px, ratio],
  'mask': [zero, px, ratio],
  'mask-border-outset': [zero, px, num],
  'mask-border-slice': [num, ratio],
  'mask-border-width': [zero, px, ratio, num],
  'mask-position': [zero, px, ratio],
  'mask-size': [zero, px, ratio],
  'math-depth': [int],
  'max-lines': [int],
  'object-position': [zero, px, ratio],
  'offset-anchor': [zero, px, ratio],
  'offset-distance': [zero, px, ratio],
  'offset-path': [zero, px, ratio, deg],
  'offset-position': [zero, px, ratio],
  'offset-rotate': [deg],
  'orphans': [int],
  'pause-after': [zero, ms],
  'pause-before': [zero, ms],
  'perspective-origin': [zero, px, ratio],
  'r': [zero, px, ratio],
  'rest-after': [zero, ms],
  'rest-before': [zero, ms],
  'rx': [zero, px, ratio],
  'ry': [zero, px, ratio],
  'shape-image-threshold': [alpha],
  'shape-margin': [zero, px, ratio],
  'shape-outside': [zero, px, ratio],
  'stroke-dasharray': [zero, px, ratio, num],
  'stroke-dashoffset': [zero, px, ratio, num],
  'stroke-miterlimit': [num],
  'stroke-width': [zero, px, ratio, num],
  'view-timeline-inset': [zero, px, ratio],
  'voice-balance': [num],
  'voice-duration': [zero, ms],
  'voice-family': [int],
  'voice-pitch': [ratio],
  'voice-range': [ratio],
  'voice-rate': [ratio],
  'widows': [int],
  'x': [zero, px, ratio],
  'y': [zero, px, ratio],
  'zoom': [num, ratio],
}
