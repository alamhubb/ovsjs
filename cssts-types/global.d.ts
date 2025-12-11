/**
 * CssTs Global Type Declarations
 * 
 * 提供所有原子样式的全局声明，
 * 使得在 css {} 语法中可以直接使用而无需导入。
 * 
 * 结构:
 * - layout/     布局 (display, flex, position)
 * - spacing/    间距 (padding, margin, gap)
 * - sizing/     尺寸 (width, height)
 * - typography/ 排版 (font-size, font-weight, text-align)
 * - border/     边框 (border, border-radius)
 * - effects/    效果 (opacity, transition, cursor)
 * - color/      CSS原生颜色 (colorRed, bgBlue)
 * - states/     组件状态 (disabled, loading)
 */

import type { AllAtoms } from './index'
import type { CsstsRuntime, StyleObject } from './runtime'

declare global {
  /** CssTs runtime object with all atoms and utility functions */
  const cssts: AllAtoms & CsstsRuntime
  
  // ==================== Layout: Display ====================
  const block: { 'block': true }
  const inlineBlock: { 'inline-block': true }
  const inline: { 'inline': true }
  const flex: { 'flex': true }
  const inlineFlex: { 'inline-flex': true }
  const grid: { 'grid': true }
  const inlineGrid: { 'inline-grid': true }
  const contents: { 'contents': true }
  const flowRoot: { 'flow-root': true }
  const hidden: { 'hidden': true }
  const displayNone: { 'display-none': true }

  // ==================== Layout: Flex Direction ====================
  const flexRow: { 'flex-row': true }
  const flexRowReverse: { 'flex-row-reverse': true }
  const flexCol: { 'flex-col': true }
  const flexColReverse: { 'flex-col-reverse': true }
  
  // ==================== Layout: Flex Wrap ====================
  const flexWrap: { 'flex-wrap': true }
  const flexWrapReverse: { 'flex-wrap-reverse': true }
  const flexNowrap: { 'flex-nowrap': true }
  
  // ==================== Layout: Flex Utilities ====================
  const flex1: { 'flex-1': true }
  const flexAuto: { 'flex-auto': true }
  const flexInitial: { 'flex-initial': true }
  const flexNone: { 'flex-none': true }
  const flexGrow: { 'flex-grow': true }
  const flexGrow0: { 'flex-grow-0': true }
  const flexShrink: { 'flex-shrink': true }
  const flexShrink0: { 'flex-shrink-0': true }
  const flexCenter: { 'flex-center': true }
  
  // ==================== Layout: Justify Content ====================
  const justifyStart: { 'justify-start': true }
  const justifyEnd: { 'justify-end': true }
  const justifyCenter: { 'justify-center': true }
  const justifyBetween: { 'justify-between': true }
  const justifyAround: { 'justify-around': true }
  const justifyEvenly: { 'justify-evenly': true }
  const justifyStretch: { 'justify-stretch': true }
  
  // ==================== Layout: Align Items ====================
  const itemsStart: { 'items-start': true }
  const itemsEnd: { 'items-end': true }
  const itemsCenter: { 'items-center': true }
  const itemsBaseline: { 'items-baseline': true }
  const itemsStretch: { 'items-stretch': true }
  
  // ==================== Layout: Align Self ====================
  const selfAuto: { 'self-auto': true }
  const selfStart: { 'self-start': true }
  const selfEnd: { 'self-end': true }
  const selfCenter: { 'self-center': true }
  const selfStretch: { 'self-stretch': true }
  const selfBaseline: { 'self-baseline': true }
  
  // ==================== Layout: Position ====================
  const relative: { 'relative': true }
  const absolute: { 'absolute': true }
  const fixed: { 'fixed': true }
  const sticky: { 'sticky': true }
  const static: { 'static': true }

  // ==================== Layout: Inset ====================
  const top0: { 'top-0': true }
  const right0: { 'right-0': true }
  const bottom0: { 'bottom-0': true }
  const left0: { 'left-0': true }
  const inset0: { 'inset-0': true }
  const insetX0: { 'inset-x-0': true }
  const insetY0: { 'inset-y-0': true }
  const topAuto: { 'top-auto': true }
  const rightAuto: { 'right-auto': true }
  const bottomAuto: { 'bottom-auto': true }
  const leftAuto: { 'left-auto': true }
  
  // ==================== Layout: Z-Index ====================
  const z0: { 'z-0': true }
  const z10: { 'z-10': true }
  const z20: { 'z-20': true }
  const z30: { 'z-30': true }
  const z40: { 'z-40': true }
  const z50: { 'z-50': true }
  const zAuto: { 'z-auto': true }
  
  // ==================== Layout: Overflow ====================
  const overflowAuto: { 'overflow-auto': true }
  const overflowHidden: { 'overflow-hidden': true }
  const overflowVisible: { 'overflow-visible': true }
  const overflowScroll: { 'overflow-scroll': true }
  const overflowXAuto: { 'overflow-x-auto': true }
  const overflowXHidden: { 'overflow-x-hidden': true }
  const overflowXVisible: { 'overflow-x-visible': true }
  const overflowXScroll: { 'overflow-x-scroll': true }
  const overflowYAuto: { 'overflow-y-auto': true }
  const overflowYHidden: { 'overflow-y-hidden': true }
  const overflowYVisible: { 'overflow-y-visible': true }
  const overflowYScroll: { 'overflow-y-scroll': true }
  
  // ==================== Spacing: Padding ====================
  const padding0: { 'padding-0': true }
  const padding4: { 'padding-4': true }
  const padding8: { 'padding-8': true }
  const padding12: { 'padding-12': true }
  const padding16: { 'padding-16': true }
  const padding20: { 'padding-20': true }
  const padding24: { 'padding-24': true }
  const padding32: { 'padding-32': true }
  const paddingXs: { 'padding-xs': true }
  const paddingSm: { 'padding-sm': true }
  const paddingMd: { 'padding-md': true }
  const paddingLg: { 'padding-lg': true }
  const paddingXl: { 'padding-xl': true }

  // ==================== Spacing: Padding X/Y ====================
  const paddingX0: { 'padding-x-0': true }
  const paddingX4: { 'padding-x-4': true }
  const paddingX8: { 'padding-x-8': true }
  const paddingX12: { 'padding-x-12': true }
  const paddingX16: { 'padding-x-16': true }
  const paddingXXs: { 'padding-x-xs': true }
  const paddingXSm: { 'padding-x-sm': true }
  const paddingXMd: { 'padding-x-md': true }
  const paddingXLg: { 'padding-x-lg': true }
  
  const paddingY0: { 'padding-y-0': true }
  const paddingY4: { 'padding-y-4': true }
  const paddingY8: { 'padding-y-8': true }
  const paddingY12: { 'padding-y-12': true }
  const paddingY16: { 'padding-y-16': true }
  const paddingYXs: { 'padding-y-xs': true }
  const paddingYSm: { 'padding-y-sm': true }
  const paddingYMd: { 'padding-y-md': true }
  const paddingYLg: { 'padding-y-lg': true }
  
  // ==================== Spacing: Margin ====================
  const margin0: { 'margin-0': true }
  const margin4: { 'margin-4': true }
  const margin8: { 'margin-8': true }
  const margin12: { 'margin-12': true }
  const margin16: { 'margin-16': true }
  const margin20: { 'margin-20': true }
  const margin24: { 'margin-24': true }
  const margin32: { 'margin-32': true }
  const marginAuto: { 'margin-auto': true }
  const marginXs: { 'margin-xs': true }
  const marginSm: { 'margin-sm': true }
  const marginMd: { 'margin-md': true }
  const marginLg: { 'margin-lg': true }
  const marginXl: { 'margin-xl': true }
  
  // ==================== Spacing: Gap ====================
  const gap0: { 'gap-0': true }
  const gap4: { 'gap-4': true }
  const gap8: { 'gap-8': true }
  const gap12: { 'gap-12': true }
  const gap16: { 'gap-16': true }
  const gap20: { 'gap-20': true }
  const gap24: { 'gap-24': true }
  const gap32: { 'gap-32': true }
  const gapXs: { 'gap-xs': true }
  const gapSm: { 'gap-sm': true }
  const gapMd: { 'gap-md': true }
  const gapLg: { 'gap-lg': true }
  const gapXl: { 'gap-xl': true }

  // ==================== Sizing: Width ====================
  const width0: { 'width-0': true }
  const width24: { 'width-24': true }
  const width32: { 'width-32': true }
  const width40: { 'width-40': true }
  const width48: { 'width-48': true }
  const width64: { 'width-64': true }
  const width80: { 'width-80': true }
  const width100: { 'width-100': true }
  const width120: { 'width-120': true }
  const width160: { 'width-160': true }
  const width200: { 'width-200': true }
  const width240: { 'width-240': true }
  const width320: { 'width-320': true }
  const widthFull: { 'width-full': true }
  const widthHalf: { 'width-half': true }
  const widthAuto: { 'width-auto': true }
  const widthScreen: { 'width-screen': true }
  const widthMin: { 'width-min': true }
  const widthMax: { 'width-max': true }
  const widthFit: { 'width-fit': true }
  
  // ==================== Sizing: Height ====================
  const height0: { 'height-0': true }
  const height24: { 'height-24': true }
  const height32: { 'height-32': true }
  const height40: { 'height-40': true }
  const height48: { 'height-48': true }
  const height64: { 'height-64': true }
  const height80: { 'height-80': true }
  const height100: { 'height-100': true }
  const height120: { 'height-120': true }
  const heightFull: { 'height-full': true }
  const heightHalf: { 'height-half': true }
  const heightAuto: { 'height-auto': true }
  const heightScreen: { 'height-screen': true }
  const heightMin: { 'height-min': true }
  const heightMax: { 'height-max': true }
  const heightFit: { 'height-fit': true }
  
  // ==================== Typography: Font Size ====================
  const fontSize12: { 'font-size-12': true }
  const fontSize13: { 'font-size-13': true }
  const fontSize14: { 'font-size-14': true }
  const fontSize15: { 'font-size-15': true }
  const fontSize16: { 'font-size-16': true }
  const fontSize18: { 'font-size-18': true }
  const fontSize20: { 'font-size-20': true }
  const fontSize24: { 'font-size-24': true }
  const fontSize28: { 'font-size-28': true }
  const fontSize32: { 'font-size-32': true }

  // ==================== Typography: Font Weight ====================
  const fontThin: { 'font-thin': true }
  const fontLight: { 'font-light': true }
  const fontNormal: { 'font-normal': true }
  const fontMedium: { 'font-medium': true }
  const fontSemibold: { 'font-semibold': true }
  const fontBold: { 'font-bold': true }
  const fontExtrabold: { 'font-extrabold': true }
  const fontBlack: { 'font-black': true }
  
  // ==================== Typography: Text Align ====================
  const textLeft: { 'text-left': true }
  const textCenter: { 'text-center': true }
  const textRight: { 'text-right': true }
  const textJustify: { 'text-justify': true }
  
  // ==================== Typography: Text Decoration ====================
  const underline: { 'underline': true }
  const lineThrough: { 'line-through': true }
  const noUnderline: { 'no-underline': true }
  
  // ==================== Typography: Text Transform ====================
  const uppercase: { 'uppercase': true }
  const lowercase: { 'lowercase': true }
  const capitalize: { 'capitalize': true }
  
  // ==================== Typography: White Space ====================
  const whitespaceNormal: { 'whitespace-normal': true }
  const whitespaceNowrap: { 'whitespace-nowrap': true }
  const whitespacePre: { 'whitespace-pre': true }
  const truncate: { 'truncate': true }
  
  // ==================== Typography: Vertical Align ====================
  const alignBaseline: { 'align-baseline': true }
  const alignTop: { 'align-top': true }
  const alignMiddle: { 'align-middle': true }
  const alignBottom: { 'align-bottom': true }
  
  // ==================== Border: Width ====================
  const border: { 'border': true }
  const borderNone: { 'border-none': true }
  const border0: { 'border-0': true }
  const border2: { 'border-2': true }
  const borderT: { 'border-t': true }
  const borderR: { 'border-r': true }
  const borderB: { 'border-b': true }
  const borderL: { 'border-l': true }
  
  // ==================== Border: Style ====================
  const borderSolid: { 'border-solid': true }
  const borderDashed: { 'border-dashed': true }
  const borderDotted: { 'border-dotted': true }

  // ==================== Border: Radius ====================
  const roundedNone: { 'rounded-none': true }
  const roundedSm: { 'rounded-sm': true }
  const rounded: { 'rounded': true }
  const roundedMd: { 'rounded-md': true }
  const roundedLg: { 'rounded-lg': true }
  const roundedXl: { 'rounded-xl': true }
  const roundedFull: { 'rounded-full': true }
  const borderRadius0: { 'border-radius-0': true }
  const borderRadius2: { 'border-radius-2': true }
  const borderRadius4: { 'border-radius-4': true }
  const borderRadius6: { 'border-radius-6': true }
  const borderRadius8: { 'border-radius-8': true }
  const borderRadius12: { 'border-radius-12': true }
  const borderRadius16: { 'border-radius-16': true }
  const borderRadiusFull: { 'border-radius-full': true }
  
  // ==================== Border: Outline ====================
  const outlineNone: { 'outline-none': true }
  const outline: { 'outline': true }
  
  // ==================== Effects: Box Shadow ====================
  const shadowNone: { 'shadow-none': true }
  const shadowSm: { 'shadow-sm': true }
  const shadow: { 'shadow': true }
  const shadowMd: { 'shadow-md': true }
  const shadowLg: { 'shadow-lg': true }
  const shadowXl: { 'shadow-xl': true }
  
  // ==================== Effects: Opacity ====================
  const opacity0: { 'opacity-0': true }
  const opacity25: { 'opacity-25': true }
  const opacity50: { 'opacity-50': true }
  const opacity75: { 'opacity-75': true }
  const opacity100: { 'opacity-100': true }
  
  // ==================== Effects: Transition ====================
  const transition: { 'transition': true }
  const transitionNone: { 'transition-none': true }
  const transitionAll: { 'transition-all': true }
  const transitionFast: { 'transition-fast': true }
  const transitionSlow: { 'transition-slow': true }
  
  // ==================== Effects: Cursor ====================
  const cursorAuto: { 'cursor-auto': true }
  const cursorDefault: { 'cursor-default': true }
  const cursorPointer: { 'cursor-pointer': true }
  const cursorWait: { 'cursor-wait': true }
  const cursorText: { 'cursor-text': true }
  const cursorMove: { 'cursor-move': true }
  const cursorNotAllowed: { 'cursor-not-allowed': true }

  // ==================== Effects: Pointer Events ====================
  const pointerEventsNone: { 'pointer-events-none': true }
  const pointerEventsAuto: { 'pointer-events-auto': true }
  
  // ==================== Effects: User Select ====================
  const userSelectNone: { 'user-select-none': true }
  const userSelectText: { 'user-select-text': true }
  const userSelectAll: { 'user-select-all': true }
  const selectNone: { 'select-none': true }
  const selectText: { 'select-text': true }
  const selectAll: { 'select-all': true }
  
  // ==================== Effects: Visibility ====================
  const visible: { 'visible': true }
  const invisible: { 'invisible': true }
  
  // ==================== Color: Text Color (CSS Native) ====================
  const colorRed: { 'color-red': true }
  const colorOrange: { 'color-orange': true }
  const colorYellow: { 'color-yellow': true }
  const colorGreen: { 'color-green': true }
  const colorBlue: { 'color-blue': true }
  const colorPurple: { 'color-purple': true }
  const colorPink: { 'color-pink': true }
  const colorCyan: { 'color-cyan': true }
  const colorWhite: { 'color-white': true }
  const colorBlack: { 'color-black': true }
  const colorGray: { 'color-gray': true }
  const colorTransparent: { 'color-transparent': true }
  const colorInherit: { 'color-inherit': true }
  const colorCurrent: { 'color-current': true }
  
  // ==================== Color: Background Color (CSS Native) ====================
  const bgRed: { 'bg-red': true }
  const bgOrange: { 'bg-orange': true }
  const bgYellow: { 'bg-yellow': true }
  const bgGreen: { 'bg-green': true }
  const bgBlue: { 'bg-blue': true }
  const bgPurple: { 'bg-purple': true }
  const bgPink: { 'bg-pink': true }
  const bgCyan: { 'bg-cyan': true }
  const bgWhite: { 'bg-white': true }
  const bgBlack: { 'bg-black': true }
  const bgGray: { 'bg-gray': true }
  const bgTransparent: { 'bg-transparent': true }
  const bgInherit: { 'bg-inherit': true }
  const bgCurrent: { 'bg-current': true }

  // ==================== Color: Border Color (CSS Native) ====================
  const borderRed: { 'border-red': true }
  const borderOrange: { 'border-orange': true }
  const borderYellow: { 'border-yellow': true }
  const borderGreen: { 'border-green': true }
  const borderBlue: { 'border-blue': true }
  const borderPurple: { 'border-purple': true }
  const borderWhite: { 'border-white': true }
  const borderBlack: { 'border-black': true }
  const borderGray: { 'border-gray': true }
  const borderTransparent: { 'border-transparent': true }
  
  // ==================== States: Interactive ====================
  const disabled: { 'is-disabled': true }
  const isDisabled: { 'is-disabled': true }
  const loading: { 'is-loading': true }
  const isLoading: { 'is-loading': true }
  const active: { 'is-active': true }
  const isActive: { 'is-active': true }
  // Note: 'focus' conflicts with global focus() function, use 'isFocus' instead
  const isFocus: { 'is-focus': true }
  const hover: { 'is-hover': true }
  const isHover: { 'is-hover': true }
  const selected: { 'is-selected': true }
  const isSelected: { 'is-selected': true }
  const checked: { 'is-checked': true }
  const isChecked: { 'is-checked': true }
  const indeterminate: { 'is-indeterminate': true }
  const readonly: { 'is-readonly': true }
  const required: { 'is-required': true }
  
  // ==================== States: Validation ====================
  const error: { 'is-error': true }
  const isError: { 'is-error': true }
  const success: { 'is-success': true }
  const isSuccess: { 'is-success': true }
  const warning: { 'is-warning': true }
  const isWarning: { 'is-warning': true }
  const info: { 'is-info': true }
  const isInfo: { 'is-info': true }
  
  // ==================== States: Component ====================
  const plain: { 'is-plain': true }
  const isPlain: { 'is-plain': true }
  const round: { 'is-round': true }
  const isRound: { 'is-round': true }
  const circle: { 'is-circle': true }
  const isCircle: { 'is-circle': true }
  const text: { 'is-text': true }
  const isText: { 'is-text': true }
  const link: { 'is-link': true }
  const isLink: { 'is-link': true }

  const expanded: { 'is-expanded': true }
  const collapsed: { 'is-collapsed': true }
  
  // ==================== States: Size ====================
  const large: { 'is-large': true }
  const isLarge: { 'is-large': true }
  const small: { 'is-small': true }
  const isSmall: { 'is-small': true }
  const mini: { 'is-mini': true }
  const isMini: { 'is-mini': true }
  
  // ==================== States: Orientation ====================
  const vertical: { 'is-vertical': true }
  const isVertical: { 'is-vertical': true }
  const horizontal: { 'is-horizontal': true }
  const isHorizontal: { 'is-horizontal': true }
}

export {}
