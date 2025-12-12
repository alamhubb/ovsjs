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

  // ==================== 语义化 NumericType ====================

  /** 尺寸像素 - 用于 width/height/padding (max: 10000, 不支持负数) */
  sizePx: NumericType = { unit: 'px', value: 'integer', max: 10000 }

  /** 尺寸 rem - 用于 width/height/padding (0.25-100rem, step: 0.25) */
  sizeRem: NumericType = { unit: 'rem', value: 'number', min: 0.25, max: 100, step: 0.25 }

  /** 间距像素 - 用于 margin/定位 (max: 10000, 支持负数) */
  spacingPx: NumericType = { unit: 'px', value: 'integer', max: 10000, negative: true }

  /** 间距 rem - 用于 margin/定位 (0.25-100rem, step: 0.25, 支持负数) */
  spacingRem: NumericType = { unit: 'rem', value: 'number', min: 0.25, max: 100, step: 0.25, negative: true }

  /** 边框宽度 (max: 20) */
  borderWidthPx: NumericType = { unit: 'px', value: 'integer', max: 20 }

  /** 圆角半径像素 (max: 500) */
  radiusPx: NumericType = { unit: 'px', value: 'integer', max: 500 }

  /** 圆角半径 rem (0.25-10rem, step: 0.25) */
  radiusRem: NumericType = { unit: 'rem', value: 'number', min: 0.25, max: 10, step: 0.25 }

  /** 字体大小像素 (8-200) */
  fontSizePx: NumericType = { unit: 'px', value: 'integer', min: 8, max: 200 }

  /** 字体大小 rem (0.5-10rem, step: 0.125) */
  fontSizeRem: NumericType = { unit: 'rem', value: 'number', min: 0.5, max: 10, step: 0.125 }

  /** 小间距像素 - 用于 gap/letter-spacing (max: 200) */
  gapPx: NumericType = { unit: 'px', value: 'integer', max: 200 }

  /** 小间距 rem - 用于 gap (0.25-20rem, step: 0.25) */
  gapRem: NumericType = { unit: 'rem', value: 'number', min: 0.25, max: 20, step: 0.25 }

  /** z-index 层级 (支持负数, 1~9999，同时生成负数版本) */
  zIndex: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 9999, negative: true }

  /** order 排序 (支持负数, 1~100，同时生成负数版本) */
  orderInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 100, negative: true }

  /** Grid 轨道数 (1-24) */
  gridTrack: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 24 }

  /** 动画/过渡时长 (max: 10000ms, step: 100) */
  durationMs: NumericType = { unit: 'ms', value: 'integer', max: 10000, step: 100 }

  /** 缩放比例 (0-5, step: 0.1) */
  scaleNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 5, step: 0.1 }

  /** 旋转角度 (0-360) */
  rotateDeg: NumericType = { unit: 'deg', value: 'number', max: 360 }

  /** 行数限制 (1-20) */
  lineCount: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 20 }

  /** 行高倍数 (0.5-3, step: 0.1) */
  lineHeightNum: NumericType = { unit: 'unitless', value: 'number', min: 0.5, max: 3, step: 0.1 }

  // ==================== 特定场景 NumericType ====================

  /** Grid 尺寸像素 - 用于 grid-template/grid-auto (max: 2000) */
  gridSizePx: NumericType = { unit: 'px', value: 'integer', max: 2000 }

  /** 位置像素 - 用于 background-position/transform-origin 等 (max: 2000, 支持负数) */
  positionPx: NumericType = { unit: 'px', value: 'integer', max: 2000, negative: true }

  /** 小像素 - 用于 text-shadow/text-decoration-thickness 等 (max: 50) */
  smallPx: NumericType = { unit: 'px', value: 'integer', max: 50 }

  /** 描边像素 - 用于 stroke-width/stroke-dasharray (max: 100) */
  strokePx: NumericType = { unit: 'px', value: 'integer', max: 100 }

  /** SVG 坐标像素 - 用于 cx/cy/r/rx/ry/x/y (max: 1000, 支持负数) */
  svgCoordPx: NumericType = { unit: 'px', value: 'integer', max: 1000, negative: true }

  /** 遮罩/裁剪像素 - 用于 clip-path/mask-position/mask-size (max: 2000) */
  maskPx: NumericType = { unit: 'px', value: 'integer', max: 2000 }

  /** 偏移像素 - 用于 offset-distance/offset-position (max: 2000, 支持负数) */
  offsetPx: NumericType = { unit: 'px', value: 'integer', max: 2000, negative: true }

  /** 斜体角度 - 用于 font-style oblique (max: 90) */
  obliqueDeg: NumericType = { unit: 'deg', value: 'number', max: 90 }

  /** 字体特性设置 (1-99) */
  fontFeatureInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 99 }

  /** 计数器值 (支持负数, 1~1000，同时生成负数版本) */
  counterInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 1000, negative: true }

  /** 组序号 (1-100) */
  groupInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 100 }

  /** 字符数限制 (1-50) */
  charCount: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 50 }

  /** 数学深度 (支持负数, 1~10，同时生成负数版本) */
  mathDepthInt: NumericType = { unit: 'unitless', value: 'integer', min: 1, max: 10, negative: true }

  /** 字体调整值 (0-2, step: 0.01) */
  fontAdjustNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 2, step: 0.01 }

  /** 动画迭代次数 (0-100) */
  iterationCount: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

  /** 缓动函数数值 (0-1, step: 0.01) */
  easingNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1, step: 0.01 }

  /** 宽高比 (0.1-10, step: 0.1) */
  aspectRatioNum: NumericType = { unit: 'unitless', value: 'number', min: 0.1, max: 10, step: 0.1 }

  /** 边框图片切片 (0-100) */
  borderSliceNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

  /** 描边斜接限制 (1-10) */
  miterLimitNum: NumericType = { unit: 'unitless', value: 'number', min: 1, max: 10 }

  /** 语音平衡 (支持负数, 1~100，同时生成负数版本) */
  voiceBalanceNum: NumericType = { unit: 'unitless', value: 'number', min: 1, max: 100, negative: true }

  /** 初始字母大小 (1-10) */
  initialLetterNum: NumericType = { unit: 'unitless', value: 'number', min: 1, max: 10 }

  /** 光标数值 (0-100) */
  cursorNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 100 }

  /** 字体变体设置值 (支持负数, 0~1, step: 0.01) */
  fontVariationNum: NumericType = { unit: 'unitless', value: 'number', min: 0, max: 1, step: 0.01, negative: true }

  // ==================== CSS 属性配置 ====================

  // sizing (不支持负数)
  height: NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'max-height': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'max-width': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'min-height': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'min-width': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  width: NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]

  // spacing - margin (支持负数)
  margin: NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  'margin-bottom': NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  'margin-left': NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  'margin-right': NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  'margin-top': NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]

  // spacing - padding (不支持负数)
  padding: NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'padding-bottom': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'padding-left': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'padding-right': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]
  'padding-top': NumericType[] = [this.zero, this.sizePx, this.sizeRem, this.ratio]

  // spacing - gap
  'column-gap': NumericType[] = [this.zero, this.gapPx, this.gapRem, this.ratio]
  'row-gap': NumericType[] = [this.zero, this.gapPx, this.gapRem, this.ratio]

  // positioning (支持负数)
  bottom: NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  left: NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  right: NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]
  top: NumericType[] = [this.zero, this.spacingPx, this.spacingRem, this.ratio]

  // layout
  'flex-grow': NumericType[] = [this.scaleNum]
  'flex-shrink': NumericType[] = [this.scaleNum]
  'grid-area': NumericType[] = [this.gridTrack]
  'grid-auto-columns': NumericType[] = [this.zero, this.gridSizePx, this.ratio, this.fr]
  'grid-auto-rows': NumericType[] = [this.zero, this.gridSizePx, this.ratio, this.fr]
  'grid-column': NumericType[] = [this.gridTrack]
  'grid-column-end': NumericType[] = [this.gridTrack]
  'grid-column-gap': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'grid-column-start': NumericType[] = [this.gridTrack]
  'grid-row': NumericType[] = [this.gridTrack]
  'grid-row-end': NumericType[] = [this.gridTrack]
  'grid-row-gap': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'grid-row-start': NumericType[] = [this.gridTrack]
  'grid-template': NumericType[] = [this.zero, this.gridSizePx, this.ratio, this.fr]
  'grid-template-columns': NumericType[] = [this.zero, this.gridSizePx, this.ratio, this.fr]
  'grid-template-rows': NumericType[] = [this.zero, this.gridSizePx, this.ratio, this.fr]
  order: NumericType[] = [this.orderInt]
  'z-index': NumericType[] = [this.zIndex]

  // typography
  'font-feature-settings': NumericType[] = [this.fontFeatureInt]
  'font-size': NumericType[] = [this.zero, this.fontSizePx, this.fontSizeRem, this.ratio]
  'font-size-adjust': NumericType[] = [this.fontAdjustNum]
  'font-smooth': NumericType[] = [this.zero, this.smallPx]
  'font-stretch': NumericType[] = [this.ratio]
  'font-style': NumericType[] = [this.obliqueDeg]
  'font-variation-settings': NumericType[] = [this.fontVariationNum]
  'font-weight': NumericType[] = [this.fontWeight]
  'letter-spacing': NumericType[] = [this.zero, this.gapPx]
  'line-clamp': NumericType[] = [this.lineCount]
  'line-height': NumericType[] = [this.zero, this.smallPx, this.lineHeightNum]
  'line-height-step': NumericType[] = [this.zero, this.smallPx]
  'tab-size': NumericType[] = [this.zero, this.smallPx, this.charCount]
  'text-combine-upright': NumericType[] = [this.charCount]
  'text-decoration-thickness': NumericType[] = [this.zero, this.smallPx, this.ratio]
  'text-indent': NumericType[] = [this.zero, this.sizePx, this.ratio]
  'text-shadow': NumericType[] = [this.zero, this.smallPx]
  'text-size-adjust': NumericType[] = [this.ratio]
  'text-underline-offset': NumericType[] = [this.zero, this.smallPx, this.ratio]
  'vertical-align': NumericType[] = [this.zero, this.smallPx, this.ratio]
  'word-spacing': NumericType[] = [this.zero, this.gapPx, this.ratio]

  // border
  border: NumericType[] = [this.zero, this.borderWidthPx]
  'border-bottom': NumericType[] = [this.zero, this.borderWidthPx]
  'border-bottom-left-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-bottom-right-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-bottom-width': NumericType[] = [this.zero, this.borderWidthPx]
  'border-end-end-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-end-start-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-image-outset': NumericType[] = [this.zero, this.smallPx, this.borderSliceNum]
  'border-image-slice': NumericType[] = [this.borderSliceNum, this.ratio]
  'border-image-width': NumericType[] = [this.zero, this.smallPx, this.ratio, this.borderSliceNum]
  'border-left': NumericType[] = [this.zero, this.borderWidthPx]
  'border-left-width': NumericType[] = [this.zero, this.borderWidthPx]
  'border-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-right': NumericType[] = [this.zero, this.borderWidthPx]
  'border-right-width': NumericType[] = [this.zero, this.borderWidthPx]
  'border-spacing': NumericType[] = [this.zero, this.gapPx]
  'border-start-end-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-start-start-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-top': NumericType[] = [this.zero, this.borderWidthPx]
  'border-top-left-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-top-right-radius': NumericType[] = [this.zero, this.radiusPx, this.radiusRem, this.ratio]
  'border-top-width': NumericType[] = [this.zero, this.borderWidthPx]
  'border-width': NumericType[] = [this.zero, this.borderWidthPx]
  'outline-offset': NumericType[] = [this.zero, this.smallPx]
  'outline-width': NumericType[] = [this.zero, this.borderWidthPx]

  // background
  background: NumericType[] = [this.zero, this.positionPx, this.ratio]
  'background-position': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'background-position-x': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'background-position-y': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'background-size': NumericType[] = [this.zero, this.sizePx, this.ratio]

  // opacity
  'fill-opacity': NumericType[] = [this.alpha]
  opacity: NumericType[] = [this.alpha]

  // transform
  perspective: NumericType[] = [this.zero, this.sizePx]
  rotate: NumericType[] = [this.zero, this.rotateDeg]
  scale: NumericType[] = [this.scaleNum, this.ratio]
  'transform-origin': NumericType[] = [this.zero, this.positionPx, this.ratio]
  translate: NumericType[] = [this.zero, this.spacingPx, this.ratio]

  // animation
  animation: NumericType[] = [this.durationMs, this.iterationCount]
  'animation-delay': NumericType[] = [this.zero, this.durationMs]
  'animation-duration': NumericType[] = [this.zero, this.durationMs]
  'animation-iteration-count': NumericType[] = [this.iterationCount]
  'animation-range-end': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'animation-range-start': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'animation-timing-function': NumericType[] = [this.easingNum]
  transition: NumericType[] = [this.durationMs, this.iterationCount]
  'transition-delay': NumericType[] = [this.zero, this.durationMs]
  'transition-duration': NumericType[] = [this.zero, this.durationMs]
  'transition-timing-function': NumericType[] = [this.easingNum]

  // scroll
  'overflow-clip-margin': NumericType[] = [this.zero, this.smallPx]
  'scroll-margin': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-block': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-block-end': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-block-start': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-bottom': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-inline': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-inline-end': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-inline-start': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-left': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-right': NumericType[] = [this.zero, this.gapPx]
  'scroll-margin-top': NumericType[] = [this.zero, this.gapPx]
  'scroll-padding': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-block': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-block-end': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-block-start': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-bottom': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-inline': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-inline-end': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-inline-start': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-left': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-right': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-padding-top': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'scroll-snap-coordinate': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'scroll-snap-destination': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'scroll-snap-points-x': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'scroll-snap-points-y': NumericType[] = [this.zero, this.positionPx, this.ratio]

  // other
  'aspect-ratio': NumericType[] = [this.aspectRatioNum]
  azimuth: NumericType[] = [this.rotateDeg]
  'baseline-shift': NumericType[] = [this.zero, this.smallPx, this.ratio]
  'box-flex': NumericType[] = [this.scaleNum]
  'box-flex-group': NumericType[] = [this.groupInt]
  'box-ordinal-group': NumericType[] = [this.groupInt]
  'clip-path': NumericType[] = [this.zero, this.maskPx, this.ratio]
  'column-count': NumericType[] = [this.lineCount]
  'column-width': NumericType[] = [this.zero, this.sizePx]
  'contain-intrinsic-block-size': NumericType[] = [this.zero, this.sizePx]
  'contain-intrinsic-height': NumericType[] = [this.zero, this.sizePx]
  'contain-intrinsic-inline-size': NumericType[] = [this.zero, this.sizePx]
  'contain-intrinsic-size': NumericType[] = [this.zero, this.sizePx]
  'contain-intrinsic-width': NumericType[] = [this.zero, this.sizePx]
  'counter-increment': NumericType[] = [this.counterInt]
  'counter-reset': NumericType[] = [this.counterInt]
  'counter-set': NumericType[] = [this.counterInt]
  cursor: NumericType[] = [this.cursorNum]
  cx: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  cy: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  'glyph-orientation-horizontal': NumericType[] = [this.rotateDeg]
  'glyph-orientation-vertical': NumericType[] = [this.rotateDeg]
  'hyphenate-limit-chars': NumericType[] = [this.charCount]
  'image-orientation': NumericType[] = [this.rotateDeg]
  'initial-letter': NumericType[] = [this.initialLetterNum]
  kerning: NumericType[] = [this.zero, this.gapPx, this.ratio]
  mask: NumericType[] = [this.zero, this.maskPx, this.ratio]
  'mask-border-outset': NumericType[] = [this.zero, this.smallPx, this.borderSliceNum]
  'mask-border-slice': NumericType[] = [this.borderSliceNum, this.ratio]
  'mask-border-width': NumericType[] = [this.zero, this.smallPx, this.ratio, this.borderSliceNum]
  'mask-position': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'mask-size': NumericType[] = [this.zero, this.sizePx, this.ratio]
  'math-depth': NumericType[] = [this.mathDepthInt]
  'max-lines': NumericType[] = [this.lineCount]
  'object-position': NumericType[] = [this.zero, this.positionPx, this.ratio]
  'offset-anchor': NumericType[] = [this.zero, this.offsetPx, this.ratio]
  'offset-distance': NumericType[] = [this.zero, this.offsetPx, this.ratio]
  'offset-path': NumericType[] = [this.zero, this.offsetPx, this.ratio, this.rotateDeg]
  'offset-position': NumericType[] = [this.zero, this.offsetPx, this.ratio]
  'offset-rotate': NumericType[] = [this.rotateDeg]
  orphans: NumericType[] = [this.lineCount]
  'pause-after': NumericType[] = [this.zero, this.durationMs]
  'pause-before': NumericType[] = [this.zero, this.durationMs]
  'perspective-origin': NumericType[] = [this.zero, this.positionPx, this.ratio]
  r: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  'rest-after': NumericType[] = [this.zero, this.durationMs]
  'rest-before': NumericType[] = [this.zero, this.durationMs]
  rx: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  ry: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]

  'shape-image-threshold': NumericType[] = [this.alpha]
  'shape-margin': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'shape-outside': NumericType[] = [this.zero, this.maskPx, this.ratio]
  'stroke-dasharray': NumericType[] = [this.zero, this.strokePx, this.ratio, this.scaleNum]
  'stroke-dashoffset': NumericType[] = [this.zero, this.strokePx, this.ratio, this.scaleNum]
  'stroke-miterlimit': NumericType[] = [this.miterLimitNum]
  'stroke-width': NumericType[] = [this.zero, this.strokePx, this.ratio, this.scaleNum]
  'view-timeline-inset': NumericType[] = [this.zero, this.gapPx, this.ratio]
  'voice-balance': NumericType[] = [this.voiceBalanceNum]
  'voice-duration': NumericType[] = [this.zero, this.durationMs]
  'voice-family': NumericType[] = [this.groupInt]
  'voice-pitch': NumericType[] = [this.ratio]
  'voice-range': NumericType[] = [this.ratio]
  'voice-rate': NumericType[] = [this.ratio]
  widows: NumericType[] = [this.lineCount]
  x: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  y: NumericType[] = [this.zero, this.svgCoordPx, this.ratio]
  zoom: NumericType[] = [this.scaleNum, this.ratio]

  /**
   * 获取属性到数值类型的映射
   * 排除 NumericType 常量，只返回 CSS 属性配置
   */
  getPropertyNumericTypes(): Record<string, NumericType[]> {
    const result: Record<string, NumericType[]> = {}
    const numericTypeKeys = new Set([
      'zero', 'ratio', 'fr', 'alpha', 'fontWeight',
      'sizePx', 'spacingPx', 'borderWidthPx', 'radiusPx', 'fontSizePx',
      'gapPx', 'zIndex', 'orderInt', 'gridTrack', 'durationMs',
      'scaleNum', 'rotateDeg', 'lineCount', 'lineHeightNum',
      'gridSizePx', 'positionPx', 'smallPx', 'strokePx', 'svgCoordPx',
      'maskPx', 'offsetPx', 'obliqueDeg', 'fontFeatureInt', 'counterInt',
      'groupInt', 'charCount', 'mathDepthInt', 'fontAdjustNum', 'iterationCount',
      'easingNum', 'aspectRatioNum', 'borderSliceNum', 'miterLimitNum',
      'voiceBalanceNum', 'initialLetterNum', 'cursorNum', 'fontVariationNum',
    ])

    for (const key of Object.keys(this)) {
      if (!numericTypeKeys.has(key) && key !== 'getPropertyNumericTypes') {
        const value = (this as unknown as Record<string, unknown>)[key]
        if (Array.isArray(value)) {
          result[key] = value as NumericType[]
        }
      }
    }

    return result
  }
}

/** 默认配置实例 */
export const defaultConfig = new PropertyNumericConfigBase()


/**
 * 创建自定义配置
 * 用户可以传入部分覆盖，引用 defaultConfig 中的常量
 *
 * @example
 * ```typescript
 * const config = createConfig({
 *   // 覆盖边框宽度最大值
 *   borderWidthPx: { unit: 'px', value: 'integer', max: 50 },
 *   // 覆盖 bottom 属性，可以引用 defaultConfig 的常量
 *   bottom: [defaultConfig.zero, defaultConfig.sizePx, defaultConfig.ratio],
 * })
 * ```
 */
export function createConfig(
  overrides: Partial<PropertyNumericConfigBase>
): PropertyNumericConfigBase {
  const config = new PropertyNumericConfigBase()
  return Object.assign(config, overrides)
}

/** 导出常量，方便用户在覆盖时引用 */
export const n = defaultConfig
