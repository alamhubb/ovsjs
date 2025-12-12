/**
 * 属性到数值类型的映射配置
 * 手动配置：定义每个属性的数值生成规则（css-tree 无法提供）
 */

// ============ 基础 NumericType 对象 ============

/** px 整数（渐进步长） */
const pxInt = { unit: 'px', value: 'integer' }

/** px 整数（渐进步长，支持负数） */
const pxIntNeg = { ...pxInt, allowNegative: true }

/** ratio 百分比（0-100，步长5） */
const ratio100 = { unit: 'ratio', value: 'number', range: { min: 0, max: 100, step: 5 } }

/** ratio 百分比（-100到100，步长5，支持负数） */
const ratio100Neg = { ...ratio100, allowNegative: true, range: { min: -100, max: 100, step: 5 } }

/** rem（0-5，步长0.25） */
const rem5 = { unit: 'rem', value: 'number', range: { min: 0, max: 5, step: 0.25 } }

/** 边框宽度 px（0-20，步长1） */
const pxBorder = { ...pxInt, range: { min: 0, max: 20, step: 1 } }

/** 圆角 px（0-100，步长2） */
const pxRadius = { ...pxInt, range: { min: 0, max: 100, step: 2 } }

/** 角度（-360到360，步长15） */
const deg360 = { unit: 'deg', value: 'number', allowNegative: true, range: { min: -360, max: 360, step: 15 } }

/** 时间 ms（0-2000，步长50） */
const ms2000 = { unit: 'ms', value: 'integer', range: { min: 0, max: 2000, step: 50 } }

/** 透明度（0-1，步长0.05） */
const unitlessOpacity = { unit: 'unitless', value: 'number', range: { min: 0, max: 1, step: 0.05 } }

/** 层级（-10到9999，步长1） */
const unitlessZIndex = { unit: 'unitless', value: 'integer', allowNegative: true, range: { min: -10, max: 9999, step: 1 } }

/** 行高（1-3，步长0.1） */
const unitlessLineHeight = { unit: 'unitless', value: 'number', range: { min: 1, max: 3, step: 0.1 } }

/** 字重（1-1000，步长100） */
const unitlessFontWeight = { unit: 'unitless', value: 'integer', range: { min: 1, max: 1000, step: 100 } }

/** flex 增长/收缩（0-10，步长1） */
const unitlessFlex = { unit: 'unitless', value: 'number', range: { min: 0, max: 10, step: 1 } }

/** 排序（-10到10，步长1） */
const unitlessOrder = { unit: 'unitless', value: 'integer', allowNegative: true, range: { min: -10, max: 10, step: 1 } }

// ============ 预设模板（NumericType 数组） ============

/** 间距（不支持负数）- padding 系列 */
const spacing = [pxInt]

/** 间距（支持负数）- margin 系列 */
const spacingNegative = [pxIntNeg]

/** 尺寸 - width, height 系列 */
const sizing = [pxInt, ratio100]

/** 定位 - top, right, bottom, left */
const positioning = [pxIntNeg, ratio100Neg]

/** 边框宽度 */
const borderWidth = [pxBorder]

/** 圆角 */
const borderRadius = [pxRadius]

/** 字体大小 */
const fontSize = [pxInt, rem5]

/** 字间距 */
const letterSpacing = [pxIntNeg]

/** 角度 */
const angle = [deg360]

/** 时间 */
const duration = [ms2000]

/** 透明度 */
const opacity = [unitlessOpacity]

/** 层级 */
const zIndex = [unitlessZIndex]

/** 行高 */
const lineHeight = [unitlessLineHeight]

/** 字重 */
const fontWeight = [unitlessFontWeight]

/** flex 增长/收缩 */
const flexGrowShrink = [unitlessFlex]

/** 排序 */
const order = [unitlessOrder]

/** 间隙 */
const gap = [pxInt]

// ============ 属性映射（自动生成，按分类排序） ============

export const propertyNumericTypes = {
  // ========== sizing ==========
  'height': [],
  'max-height': [],
  'max-width': [],
  'min-height': [],
  'min-width': [],
  'width': [],

  // ========== spacing ==========
  'column-gap': [],
  'margin': [],
  'margin-bottom': [],
  'margin-left': [],
  'margin-right': [],
  'margin-top': [],
  'padding': [],
  'padding-bottom': [],
  'padding-left': [],
  'padding-right': [],
  'padding-top': [],
  'row-gap': [],

  // ========== positioning ==========
  'bottom': [],
  'left': [],
  'right': [],
  'top': [],

  // ========== layout ==========
  'flex-grow': [],
  'flex-shrink': [],
  'grid-area': [],
  'grid-auto-columns': [],
  'grid-auto-rows': [],
  'grid-column': [],
  'grid-column-end': [],
  'grid-column-gap': [],
  'grid-column-start': [],
  'grid-row': [],
  'grid-row-end': [],
  'grid-row-gap': [],
  'grid-row-start': [],
  'grid-template': [],
  'grid-template-columns': [],
  'grid-template-rows': [],
  'order': [],
  'z-index': [],

  // ========== typography ==========
  'font-feature-settings': [],
  'font-size': [],
  'font-size-adjust': [],
  'font-smooth': [],
  'font-stretch': [],
  'font-style': [],
  'font-variation-settings': [],
  'font-weight': [],
  'letter-spacing': [],
  'line-clamp': [],
  'line-height': [],
  'line-height-step': [],
  'tab-size': [],
  'text-combine-upright': [],
  'text-decoration-thickness': [],
  'text-indent': [],
  'text-shadow': [],
  'text-size-adjust': [],
  'text-underline-offset': [],
  'vertical-align': [],
  'word-spacing': [],

  // ========== border ==========
  'border': [],
  'border-bottom': [],
  'border-bottom-left-radius': [],
  'border-bottom-right-radius': [],
  'border-bottom-width': [],
  'border-end-end-radius': [],
  'border-end-start-radius': [],
  'border-image-outset': [],
  'border-image-slice': [],
  'border-image-source': [],
  'border-image-width': [],
  'border-left': [],
  'border-left-width': [],
  'border-radius': [],
  'border-right': [],
  'border-right-width': [],
  'border-spacing': [],
  'border-start-end-radius': [],
  'border-start-start-radius': [],
  'border-top': [],
  'border-top-left-radius': [],
  'border-top-right-radius': [],
  'border-top-width': [],
  'border-width': [],
  'outline-offset': [],
  'outline-width': [],

  // ========== background ==========
  'background': [],
  'background-image': [],
  'background-position': [],
  'background-position-x': [],
  'background-position-y': [],
  'background-size': [],

  // ========== opacity ==========
  'fill-opacity': [],
  'opacity': [],

  // ========== transform ==========
  'perspective': [],
  'rotate': [],
  'scale': [],
  'transform': [],
  'transform-origin': [],
  'translate': [],

  // ========== animation ==========
  'animation': [],
  'animation-delay': [],
  'animation-duration': [],
  'animation-iteration-count': [],
  'animation-range-end': [],
  'animation-range-start': [],
  'animation-timing-function': [],
  'transition': [],
  'transition-delay': [],
  'transition-duration': [],
  'transition-timing-function': [],

  // ========== scroll ==========
  'overflow-clip-margin': [],
  'scroll-margin': [],
  'scroll-margin-block': [],
  'scroll-margin-block-end': [],
  'scroll-margin-block-start': [],
  'scroll-margin-bottom': [],
  'scroll-margin-inline': [],
  'scroll-margin-inline-end': [],
  'scroll-margin-inline-start': [],
  'scroll-margin-left': [],
  'scroll-margin-right': [],
  'scroll-margin-top': [],
  'scroll-padding': [],
  'scroll-padding-block': [],
  'scroll-padding-block-end': [],
  'scroll-padding-block-start': [],
  'scroll-padding-bottom': [],
  'scroll-padding-inline': [],
  'scroll-padding-inline-end': [],
  'scroll-padding-inline-start': [],
  'scroll-padding-left': [],
  'scroll-padding-right': [],
  'scroll-padding-top': [],
  'scroll-snap-coordinate': [],
  'scroll-snap-destination': [],
  'scroll-snap-points-x': [],
  'scroll-snap-points-y': [],

  // ========== other ==========
  'aspect-ratio': [],
  'azimuth': [],
  'backdrop-filter': [],
  'baseline-shift': [],
  'box-flex': [],
  'box-flex-group': [],
  'box-ordinal-group': [],
  'box-shadow': [],
  'clip': [],
  'clip-path': [],
  'column-count': [],
  'column-width': [],
  'contain-intrinsic-block-size': [],
  'contain-intrinsic-height': [],
  'contain-intrinsic-inline-size': [],
  'contain-intrinsic-size': [],
  'contain-intrinsic-width': [],
  'content': [],
  'counter-increment': [],
  'counter-reset': [],
  'counter-set': [],
  'cursor': [],
  'cx': [],
  'cy': [],
  'filter': [],
  'glyph-orientation-horizontal': [],
  'glyph-orientation-vertical': [],
  'hyphenate-limit-chars': [],
  'image-orientation': [],
  'initial-letter': [],
  'kerning': [],
  'list-style-image': [],
  'mask': [],
  'mask-border-outset': [],
  'mask-border-slice': [],
  'mask-border-source': [],
  'mask-border-width': [],
  'mask-image': [],
  'mask-position': [],
  'mask-size': [],
  'math-depth': [],
  'max-lines': [],
  'object-position': [],
  'offset-anchor': [],
  'offset-distance': [],
  'offset-path': [],
  'offset-position': [],
  'offset-rotate': [],
  'orphans': [],
  'pause-after': [],
  'pause-before': [],
  'perspective-origin': [],
  'r': [],
  'rest-after': [],
  'rest-before': [],
  'rx': [],
  'ry': [],
  'shape-image-threshold': [],
  'shape-margin': [],
  'shape-outside': [],
  'stroke-dasharray': [],
  'stroke-dashoffset': [],
  'stroke-miterlimit': [],
  'stroke-width': [],
  'view-timeline-inset': [],
  'voice-balance': [],
  'voice-duration': [],
  'voice-family': [],
  'voice-pitch': [],
  'voice-range': [],
  'voice-rate': [],
  'widows': [],
  'x': [],
  'y': [],
  'zoom': [],
}

// ============ 旧版属性映射（参考用） ============

export const propertyNumericTypesOld = {
  // 尺寸
  'width': sizing,
  'height': sizing,
  'min-width': sizing,
  'max-width': sizing,
  'min-height': sizing,
  'max-height': sizing,

  // padding（不支持负数）
  'padding': spacing,
  'padding-top': spacing,
  'padding-right': spacing,
  'padding-bottom': spacing,
  'padding-left': spacing,

  // margin（支持负数）
  'margin': spacingNegative,
  'margin-top': spacingNegative,
  'margin-right': spacingNegative,
  'margin-bottom': spacingNegative,
  'margin-left': spacingNegative,

  // 间隙
  'gap': gap,
  'row-gap': gap,
  'column-gap': gap,

  // 定位
  'top': positioning,
  'right': positioning,
  'bottom': positioning,
  'left': positioning,
  'inset': positioning,

  // 字体
  'font-size': fontSize,
  'letter-spacing': letterSpacing,
  'word-spacing': letterSpacing,

  // 边框宽度
  'border-width': borderWidth,
  'border-top-width': borderWidth,
  'border-right-width': borderWidth,
  'border-bottom-width': borderWidth,
  'border-left-width': borderWidth,

  // 圆角
  'border-radius': borderRadius,
  'border-top-left-radius': borderRadius,
  'border-top-right-radius': borderRadius,
  'border-bottom-left-radius': borderRadius,
  'border-bottom-right-radius': borderRadius,

  // 变换
  'rotate': angle,

  // 过渡
  'transition-duration': duration,

  // 无单位属性
  'opacity': opacity,
  'z-index': zIndex,
  'line-height': lineHeight,
  'font-weight': fontWeight,
  'flex-grow': flexGrowShrink,
  'flex-shrink': flexGrowShrink,
  'order': order,
}

// 导出基础 NumericType 对象
export const numericTypes = {
  pxInt,
  pxIntNeg,
  ratio100,
  ratio100Neg,
  rem5,
  pxBorder,
  pxRadius,
  deg360,
  ms2000,
  unitlessOpacity,
  unitlessZIndex,
  unitlessLineHeight,
  unitlessFontWeight,
  unitlessFlex,
  unitlessOrder,
}

// 导出预设模板
export const presets = {
  spacing,
  spacingNegative,
  sizing,
  positioning,
  borderWidth,
  borderRadius,
  fontSize,
  letterSpacing,
  angle,
  duration,
  opacity,
  zIndex,
  lineHeight,
  fontWeight,
  flexGrowShrink,
  order,
  gap,
}
