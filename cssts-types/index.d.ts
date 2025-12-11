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

// 全局类型声明
import './global'
