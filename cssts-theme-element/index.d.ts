/**
 * CssTs Element Plus Theme
 * 
 * Element Plus 设计规范的语义化颜色主题
 * 包含 colorPrimary, bgSuccess, borderDanger 等语义化颜色
 */

export * from './color'
export * from './background-color'
export * from './border-color'

import type { ThemeColorAtoms, ThemeTextColorAtoms } from './color'
import type { ThemeBackgroundColorAtoms, ThemeBackgroundUtilityAtoms, ThemeFillAtoms } from './background-color'
import type { ThemeBorderColorAtoms } from './border-color'

export interface ElementThemeAtoms extends
  ThemeColorAtoms,
  ThemeTextColorAtoms,
  ThemeBackgroundColorAtoms,
  ThemeBackgroundUtilityAtoms,
  ThemeFillAtoms,
  ThemeBorderColorAtoms {}
