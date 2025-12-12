/**
 * CssTs Types - TypeScript type definitions for CssTs atomic styles
 * 
 * This package provides type definitions for all atomic styles,
 * enabling IDE code completion and type checking.
 * 
 * 结构:
 * - layout/     布局相关 (display, flex, position, z-index, overflow)
 * - spacing/    间距相关 (padding, margin, gap)
 * - sizing/     尺寸相关 (width, height)
 * - typography/ 排版相关 (font-size, font-weight, text-align, line-height)
 * - border/     边框相关 (border, border-radius, outline)
 * - effects/    效果相关 (opacity, transition, cursor, box-shadow)
 * - color/      CSS原生颜色 (color, background-color, border-color)
 * - states/     组件状态 (disabled, loading, active, hover)
 */

// 按分类导出
export * from './layout/index'
export * from './spacing/index'
export * from './sizing/index'
export * from './typography/index'
export * from './border/index'
export * from './effects/index'
export * from './color/index'
export * from './states/index'

// 运行时类型
export * from './runtime'

// 聚合所有原子类
import type { LayoutAtoms } from './layout/index'
import type { SpacingAtoms } from './spacing/index'
import type { SizingAtoms } from './sizing/index'
import type { TypographyAtoms } from './typography/index'
import type { BorderAtoms } from './border/index'
import type { EffectsAtoms } from './effects/index'
import type { ColorCategoryAtoms } from './color/index'
import type { StatesAtoms } from './states/index'

export interface AllAtoms extends
  LayoutAtoms,
  SpacingAtoms,
  SizingAtoms,
  TypographyAtoms,
  BorderAtoms,
  EffectsAtoms,
  ColorCategoryAtoms,
  StatesAtoms {}

/**
 * CsstsAtoms 接口 - 用于 CsstsAtomImpl 类实现
 * 
 * 每个原子类属性的值是一个对象，键为 kebab-case 类名，值为 true
 * 例如: isDisabled = { 'is-disabled': true }
 */
export interface CsstsAtoms {
  // Layout
  readonly block: { 'block': true }
  readonly inlineBlock: { 'inline-block': true }
  readonly inline: { 'inline': true }
  readonly flex: { 'flex': true }
  readonly inlineFlex: { 'inline-flex': true }
  readonly grid: { 'grid': true }
  readonly hidden: { 'hidden': true }
  readonly displayNone: { 'display-none': true }
  
  // Flex
  readonly flexRow: { 'flex-row': true }
  readonly flexCol: { 'flex-col': true }
  readonly flexWrap: { 'flex-wrap': true }
  readonly flexNowrap: { 'flex-nowrap': true }
  readonly flex1: { 'flex-1': true }
  readonly flexAuto: { 'flex-auto': true }
  readonly flexNone: { 'flex-none': true }
  readonly flexCenter: { 'flex-center': true }
  
  // Justify & Align
  readonly justifyStart: { 'justify-start': true }
  readonly justifyEnd: { 'justify-end': true }
  readonly justifyCenter: { 'justify-center': true }
  readonly justifyBetween: { 'justify-between': true }
  readonly justifyAround: { 'justify-around': true }
  readonly itemsStart: { 'items-start': true }
  readonly itemsEnd: { 'items-end': true }
  readonly itemsCenter: { 'items-center': true }
  readonly itemsStretch: { 'items-stretch': true }
  
  // Position
  readonly relative: { 'relative': true }
  readonly absolute: { 'absolute': true }
  readonly fixed: { 'fixed': true }
  readonly sticky: { 'sticky': true }
  
  // Spacing
  readonly padding0: { 'padding-0': true }
  readonly padding4: { 'padding-4': true }
  readonly padding8: { 'padding-8': true }
  readonly padding12: { 'padding-12': true }
  readonly padding16: { 'padding-16': true }
  readonly paddingSm: { 'padding-sm': true }
  readonly paddingMd: { 'padding-md': true }
  readonly paddingLg: { 'padding-lg': true }
  readonly margin0: { 'margin-0': true }
  readonly margin4: { 'margin-4': true }
  readonly margin8: { 'margin-8': true }
  readonly marginAuto: { 'margin-auto': true }
  readonly gap4: { 'gap-4': true }
  readonly gap8: { 'gap-8': true }
  readonly gap12: { 'gap-12': true }
  
  // Sizing
  readonly widthFull: { 'width-full': true }
  readonly widthAuto: { 'width-auto': true }
  readonly heightFull: { 'height-full': true }
  readonly heightAuto: { 'height-auto': true }
  
  // Typography
  readonly fontSize12: { 'font-size-12': true }
  readonly fontSize14: { 'font-size-14': true }
  readonly fontSize16: { 'font-size-16': true }
  readonly fontNormal: { 'font-normal': true }
  readonly fontMedium: { 'font-medium': true }
  readonly fontBold: { 'font-bold': true }
  readonly textLeft: { 'text-left': true }
  readonly textCenter: { 'text-center': true }
  readonly textRight: { 'text-right': true }
  
  // Border
  readonly border: { 'border': true }
  readonly borderNone: { 'border-none': true }
  readonly rounded: { 'rounded': true }
  readonly roundedSm: { 'rounded-sm': true }
  readonly roundedMd: { 'rounded-md': true }
  readonly roundedLg: { 'rounded-lg': true }
  readonly roundedFull: { 'rounded-full': true }
  
  // Effects
  readonly shadow: { 'shadow': true }
  readonly shadowSm: { 'shadow-sm': true }
  readonly shadowMd: { 'shadow-md': true }
  readonly transition: { 'transition': true }
  readonly cursorPointer: { 'cursor-pointer': true }
  readonly cursorNotAllowed: { 'cursor-not-allowed': true }
  
  // Colors
  readonly colorRed: { 'color-red': true }
  readonly colorBlue: { 'color-blue': true }
  readonly colorGreen: { 'color-green': true }
  readonly colorWhite: { 'color-white': true }
  readonly colorBlack: { 'color-black': true }
  readonly bgRed: { 'bg-red': true }
  readonly bgBlue: { 'bg-blue': true }
  readonly bgGreen: { 'bg-green': true }
  readonly bgWhite: { 'bg-white': true }
  readonly bgBlack: { 'bg-black': true }
  readonly bgTransparent: { 'bg-transparent': true }
  
  // States
  readonly isDisabled: { 'is-disabled': true }
  readonly disabled: { 'is-disabled': true }
  readonly isLoading: { 'is-loading': true }
  readonly loading: { 'is-loading': true }
  readonly isActive: { 'is-active': true }
  readonly active: { 'is-active': true }
  readonly isFocus: { 'is-focus': true }
  readonly isHover: { 'is-hover': true }
  readonly isSelected: { 'is-selected': true }
  readonly isError: { 'is-error': true }
  readonly isSuccess: { 'is-success': true }
  readonly isWarning: { 'is-warning': true }
  readonly isPlain: { 'is-plain': true }
  readonly isRound: { 'is-round': true }
  readonly isCircle: { 'is-circle': true }
  readonly isText: { 'is-text': true }
  readonly isLink: { 'is-link': true }
  
  // 允许任意其他原子类
  readonly [key: string]: { [className: string]: true }
}

// 全局类型声明
import './global'
