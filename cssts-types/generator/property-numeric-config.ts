/**
 * 属性到数值类型的映射配置
 * 定义每个 CSS 属性支持的数值类型（unit + value）
 */

import type { NumericType } from './types'

// ==================== 基础 NumericType 常量 ====================

/** 特殊值 0（无单位） */
const zero: NumericType = { unit: 'zero' }

/** 比例/百分比 (1-100%, 包含三等分预设) */
const ratio: NumericType = { unit: 'ratio', value: 'number', presets: [33.33, 66.67] }

/** Grid 弹性单位 (1-12) */
const fr: NumericType = { unit: 'fr', value: 'number', min: 1, max: 12 }

/** 透明度 (0-1) */
const alpha: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1 }

/** 字重 (1-1000, step 100) */
const fontWeight: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 1000, step: 100 }

// ==================== 语义化 NumericType 常量 ====================

/** 尺寸像素 - 用于 width/height/padding (max: 10000, 不支持负数) */
const sizePx: NumericType = { unit: 'px', value: 'integer', max: 10000 }

/** 间距像素 - 用于 margin/定位 (max: 10000, 支持负数) */
const spacingPx: NumericType = { unit: 'px', value: 'integer', max: 10000, negative: true }

/** 边框宽度 (max: 20) */
const borderWidthPx: NumericType = { unit: 'px', value: 'integer', max: 20 }

/** 圆角半径 (max: 500) */
const radiusPx: NumericType = { unit: 'px', value: 'integer', max: 500 }

/** 字体大小 (8-200) */
const fontSizePx: NumericType = { unit: 'px', value: 'integer', min: 8, max: 200 }

/** 小间距 - 用于 gap/letter-spacing (max: 200) */
const gapPx: NumericType = { unit: 'px', value: 'integer', max: 200 }

/** z-index 层级 (支持负数, -9999~9999) */
const zIndex: NumericType = { unit: 'unitless', value: 'integer', min: -9999, max: 9999, negative: true }

/** order 排序 (支持负数, -100~100) */
const orderInt: NumericType = { unit: 'unitless', value: 'integer', min: -100, max: 100, negative: true }

/** Grid 轨道数 (1-24) */
const gridTrack: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 24 }

/** 动画/过渡时长 (max: 10000ms, step: 100) */
const durationMs: NumericType = { unit: 'ms', value: 'integer', max: 10000, step: 100 }

/** 缩放比例 (0-5, step: 0.1) */
const scaleNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 5, step: 0.1 }

/** 旋转角度 (0-360) */
const rotateDeg: NumericType = { unit: 'deg', value: 'number', max: 360 }

/** 行数限制 (1-20) */
const lineCount: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 20 }

/** 行高倍数 (0.5-3, step: 0.1) */
const lineHeightNum: NumericType = { unit: 'unitless', value: 'number', min: 0.5, max: 3, step: 0.1 }

// ==================== 特定场景 NumericType 常量 ====================

/** Grid 尺寸像素 - 用于 grid-template/grid-auto (max: 2000) */
const gridSizePx: NumericType = { unit: 'px', value: 'integer', max: 2000 }

/** 位置像素 - 用于 background-position/transform-origin/object-position 等 (max: 2000, 支持负数) */
const positionPx: NumericType = { unit: 'px', value: 'integer', max: 2000, negative: true }

/** 小像素 - 用于 text-shadow/text-decoration-thickness 等 (max: 50) */
const smallPx: NumericType = { unit: 'px', value: 'integer', max: 50 }

/** 描边像素 - 用于 stroke-width/stroke-dasharray (max: 100) */
const strokePx: NumericType = { unit: 'px', value: 'integer', max: 100 }

/** SVG 坐标像素 - 用于 cx/cy/r/rx/ry/x/y (max: 1000, 支持负数) */
const svgCoordPx: NumericType = { unit: 'px', value: 'integer', max: 1000, negative: true }

/** 遮罩/裁剪像素 - 用于 clip-path/mask-position/mask-size (max: 2000) */
const maskPx: NumericType = { unit: 'px', value: 'integer', max: 2000 }

/** 偏移像素 - 用于 offset-distance/offset-position (max: 2000, 支持负数) */
const offsetPx: NumericType = { unit: 'px', value: 'integer', max: 2000, negative: true }

/** 斜体角度 - 用于 font-style oblique (max: 90) */
const obliqueDeg: NumericType = { unit: 'deg', value: 'number', max: 90 }

/** 字体特性设置 (1-99) */
const fontFeatureInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 99 }

/** 计数器值 (支持负数, -1000~1000) */
const counterInt: NumericType = { unit: 'unitless', value: 'integer', min: -1000, max: 1000, negative: true }

/** 组序号 (1-100) */
const groupInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 100 }

/** 字符数限制 (1-50) */
const charCount: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 50 }

/** 数学深度 (支持负数, -10~10) */
const mathDepthInt: NumericType = { unit: 'unitless', value: 'integer', min: -10, max: 10, negative: true }

/** 字体调整值 (0-2, step: 0.01) */
const fontAdjustNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 2, step: 0.01 }

/** 动画迭代次数 (0-100) */
const iterationCount: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

/** 缓动函数数值 (0-1, step: 0.01) - 用于 cubic-bezier 参数 */
const easingNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1, step: 0.01 }

/** 宽高比 (0.1-10, step: 0.1) */
const aspectRatioNum: NumericType = { unit: 'unitless', value: 'number', min: 0.1, max: 10, step: 0.1 }

/** 边框图片切片 (0-100) */
const borderSliceNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

/** 描边斜接限制 (1-10) */
const miterLimitNum: NumericType = { unit: 'unitless', value: 'number', min: 1, max: 10 }

/** 语音平衡 (-100~100) */
const voiceBalanceNum: NumericType = { unit: 'unitless', value: 'number', min: -100, max: 100, negative: true }

/** 初始字母大小 (1-10) */
const initialLetterNum: NumericType = { unit: 'unitless', value: 'number', min: 1, max: 10 }

/** 光标数值 (用于自定义光标坐标, 0-100) */
const cursorNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

/** 字体变体设置值 (-1~1, step: 0.01) */
const fontVariationNum: NumericType = { unit: 'unitless', value: 'number', min: -1, max: 1, step: 0.01 }
/**
 * CSS 属性到数值类型的映射
 * 每个属性对应一个 NumericType[] 数组
 */
export const propertyNumericTypes: Record<string, NumericType[]> = {
  // ========== sizing (不支持负数) ==========
  'height': [zero, sizePx, ratio],
  'max-height': [zero, sizePx, ratio],
  'max-width': [zero, sizePx, ratio],
  'min-height': [zero, sizePx, ratio],
  'min-width': [zero, sizePx, ratio],
  'width': [zero, sizePx, ratio],

  // ========== spacing ==========
  // margin 支持负数
  'margin': [zero, spacingPx, ratio],
  'margin-bottom': [zero, spacingPx, ratio],
  'margin-left': [zero, spacingPx, ratio],
  'margin-right': [zero, spacingPx, ratio],
  'margin-top': [zero, spacingPx, ratio],
  // padding 不支持负数
  'padding': [zero, sizePx, ratio],
  'padding-bottom': [zero, sizePx, ratio],
  'padding-left': [zero, sizePx, ratio],
  'padding-right': [zero, sizePx, ratio],
  'padding-top': [zero, sizePx, ratio],
  // gap 使用小间距
  'column-gap': [zero, gapPx, ratio],
  'row-gap': [zero, gapPx, ratio],

  // ========== positioning (支持负数) ==========
  'bottom': [zero, spacingPx, ratio],
  'left': [zero, spacingPx, ratio],
  'right': [zero, spacingPx, ratio],
  'top': [zero, spacingPx, ratio],

  // ========== layout ==========
  'flex-grow': [scaleNum],
  'flex-shrink': [scaleNum],
  'grid-area': [gridTrack],
  'grid-auto-columns': [zero, gridSizePx, ratio, fr],
  'grid-auto-rows': [zero, gridSizePx, ratio, fr],
  'grid-column': [gridTrack],
  'grid-column-end': [gridTrack],
  'grid-column-gap': [zero, gapPx, ratio],
  'grid-column-start': [gridTrack],
  'grid-row': [gridTrack],
  'grid-row-end': [gridTrack],
  'grid-row-gap': [zero, gapPx, ratio],
  'grid-row-start': [gridTrack],
  'grid-template': [zero, gridSizePx, ratio, fr],
  'grid-template-columns': [zero, gridSizePx, ratio, fr],
  'grid-template-rows': [zero, gridSizePx, ratio, fr],
  'order': [orderInt],
  'z-index': [zIndex],

  // ========== typography ==========
  'font-feature-settings': [fontFeatureInt],
  'font-size': [zero, fontSizePx, ratio],
  'font-size-adjust': [fontAdjustNum],
  'font-smooth': [zero, smallPx],
  'font-stretch': [ratio],
  'font-style': [obliqueDeg],
  'font-variation-settings': [fontVariationNum],
  'font-weight': [fontWeight],
  'letter-spacing': [zero, gapPx],
  'line-clamp': [lineCount],
  'line-height': [zero, smallPx, lineHeightNum],
  'line-height-step': [zero, smallPx],
  'tab-size': [zero, smallPx, charCount],
  'text-combine-upright': [charCount],
  'text-decoration-thickness': [zero, smallPx, ratio],
  'text-indent': [zero, sizePx, ratio],
  'text-shadow': [zero, smallPx],
  'text-size-adjust': [ratio],
  'text-underline-offset': [zero, smallPx, ratio],
  'vertical-align': [zero, smallPx, ratio],
  'word-spacing': [zero, gapPx, ratio],

  // ========== border ==========
  'border': [zero, borderWidthPx],
  'border-bottom': [zero, borderWidthPx],
  'border-bottom-left-radius': [zero, radiusPx, ratio],
  'border-bottom-right-radius': [zero, radiusPx, ratio],
  'border-bottom-width': [zero, borderWidthPx],
  'border-end-end-radius': [zero, radiusPx, ratio],
  'border-end-start-radius': [zero, radiusPx, ratio],
  'border-image-outset': [zero, smallPx, borderSliceNum],
  'border-image-slice': [borderSliceNum, ratio],
  'border-image-width': [zero, smallPx, ratio, borderSliceNum],
  'border-left': [zero, borderWidthPx],
  'border-left-width': [zero, borderWidthPx],
  'border-radius': [zero, radiusPx, ratio],
  'border-right': [zero, borderWidthPx],
  'border-right-width': [zero, borderWidthPx],
  'border-spacing': [zero, gapPx],
  'border-start-end-radius': [zero, radiusPx, ratio],
  'border-start-start-radius': [zero, radiusPx, ratio],
  'border-top': [zero, borderWidthPx],
  'border-top-left-radius': [zero, radiusPx, ratio],
  'border-top-right-radius': [zero, radiusPx, ratio],
  'border-top-width': [zero, borderWidthPx],
  'border-width': [zero, borderWidthPx],
  'outline-offset': [zero, smallPx],
  'outline-width': [zero, borderWidthPx],

  // ========== background ==========
  'background': [zero, positionPx, ratio],
  'background-position': [zero, positionPx, ratio],
  'background-position-x': [zero, positionPx, ratio],
  'background-position-y': [zero, positionPx, ratio],
  'background-size': [zero, sizePx, ratio],

  // ========== opacity ==========
  'fill-opacity': [alpha],
  'opacity': [alpha],

  // ========== transform ==========
  'perspective': [zero, sizePx],
  'rotate': [zero, rotateDeg],
  'scale': [scaleNum, ratio],
  'transform-origin': [zero, positionPx, ratio],
  'translate': [zero, spacingPx, ratio],

  // ========== animation ==========
  'animation': [durationMs, iterationCount],
  'animation-delay': [zero, durationMs],
  'animation-duration': [zero, durationMs],
  'animation-iteration-count': [iterationCount],
  'animation-range-end': [zero, positionPx, ratio],
  'animation-range-start': [zero, positionPx, ratio],
  'animation-timing-function': [easingNum],
  'transition': [durationMs, iterationCount],
  'transition-delay': [zero, durationMs],
  'transition-duration': [zero, durationMs],
  'transition-timing-function': [easingNum],

  // ========== scroll ==========
  'overflow-clip-margin': [zero, smallPx],
  'scroll-margin': [zero, gapPx],
  'scroll-margin-block': [zero, gapPx],
  'scroll-margin-block-end': [zero, gapPx],
  'scroll-margin-block-start': [zero, gapPx],
  'scroll-margin-bottom': [zero, gapPx],
  'scroll-margin-inline': [zero, gapPx],
  'scroll-margin-inline-end': [zero, gapPx],
  'scroll-margin-inline-start': [zero, gapPx],
  'scroll-margin-left': [zero, gapPx],
  'scroll-margin-right': [zero, gapPx],
  'scroll-margin-top': [zero, gapPx],
  'scroll-padding': [zero, gapPx, ratio],
  'scroll-padding-block': [zero, gapPx, ratio],
  'scroll-padding-block-end': [zero, gapPx, ratio],
  'scroll-padding-block-start': [zero, gapPx, ratio],
  'scroll-padding-bottom': [zero, gapPx, ratio],
  'scroll-padding-inline': [zero, gapPx, ratio],
  'scroll-padding-inline-end': [zero, gapPx, ratio],
  'scroll-padding-inline-start': [zero, gapPx, ratio],
  'scroll-padding-left': [zero, gapPx, ratio],
  'scroll-padding-right': [zero, gapPx, ratio],
  'scroll-padding-top': [zero, gapPx, ratio],
  'scroll-snap-coordinate': [zero, positionPx, ratio],
  'scroll-snap-destination': [zero, positionPx, ratio],
  'scroll-snap-points-x': [zero, positionPx, ratio],
  'scroll-snap-points-y': [zero, positionPx, ratio],

  // ========== other ==========
  'aspect-ratio': [aspectRatioNum],
  'azimuth': [rotateDeg],
  'baseline-shift': [zero, smallPx, ratio],
  'box-flex': [scaleNum],
  'box-flex-group': [groupInt],
  'box-ordinal-group': [groupInt],
  'clip-path': [zero, maskPx, ratio],
  'column-count': [lineCount],
  'column-width': [zero, sizePx],
  'contain-intrinsic-block-size': [zero, sizePx],
  'contain-intrinsic-height': [zero, sizePx],
  'contain-intrinsic-inline-size': [zero, sizePx],
  'contain-intrinsic-size': [zero, sizePx],
  'contain-intrinsic-width': [zero, sizePx],
  'counter-increment': [counterInt],
  'counter-reset': [counterInt],
  'counter-set': [counterInt],
  'cursor': [cursorNum],
  'cx': [zero, svgCoordPx, ratio],
  'cy': [zero, svgCoordPx, ratio],
  'glyph-orientation-horizontal': [rotateDeg],
  'glyph-orientation-vertical': [rotateDeg],
  'hyphenate-limit-chars': [charCount],
  'image-orientation': [rotateDeg],
  'initial-letter': [initialLetterNum],
  'kerning': [zero, gapPx, ratio],
  'mask': [zero, maskPx, ratio],
  'mask-border-outset': [zero, smallPx, borderSliceNum],
  'mask-border-slice': [borderSliceNum, ratio],
  'mask-border-width': [zero, smallPx, ratio, borderSliceNum],
  'mask-position': [zero, positionPx, ratio],
  'mask-size': [zero, sizePx, ratio],
  'math-depth': [mathDepthInt],
  'max-lines': [lineCount],
  'object-position': [zero, positionPx, ratio],
  'offset-anchor': [zero, offsetPx, ratio],
  'offset-distance': [zero, offsetPx, ratio],
  'offset-path': [zero, offsetPx, ratio, rotateDeg],
  'offset-position': [zero, offsetPx, ratio],
  'offset-rotate': [rotateDeg],
  'orphans': [lineCount],
  'pause-after': [zero, durationMs],
  'pause-before': [zero, durationMs],
  'perspective-origin': [zero, positionPx, ratio],
  'r': [zero, svgCoordPx, ratio],
  'rest-after': [zero, durationMs],
  'rest-before': [zero, durationMs],
  'rx': [zero, svgCoordPx, ratio],
  'ry': [zero, svgCoordPx, ratio],
  'shape-image-threshold': [alpha],
  'shape-margin': [zero, gapPx, ratio],
  'shape-outside': [zero, maskPx, ratio],
  'stroke-dasharray': [zero, strokePx, ratio, scaleNum],
  'stroke-dashoffset': [zero, strokePx, ratio, scaleNum],
  'stroke-miterlimit': [miterLimitNum],
  'stroke-width': [zero, strokePx, ratio, scaleNum],
  'view-timeline-inset': [zero, gapPx, ratio],
  'voice-balance': [voiceBalanceNum],
  'voice-duration': [zero, durationMs],
  'voice-family': [groupInt],
  'voice-pitch': [ratio],
  'voice-range': [ratio],
  'voice-rate': [ratio],
  'widows': [lineCount],
  'x': [zero, svgCoordPx, ratio],
  'y': [zero, svgCoordPx, ratio],
  'zoom': [scaleNum, ratio],
}
