/**
 * Color 原子类聚合导出 - CSS 原生颜色
 */

export * from './color'
export * from './background-color'
export * from './border-color'

import type { ColorAtoms } from './color'
import type { BackgroundColorAtoms } from './background-color'
import type { BorderColorAtoms } from './border-color'

export interface ColorCategoryAtoms extends
  ColorAtoms,
  BackgroundColorAtoms,
  BorderColorAtoms {}
