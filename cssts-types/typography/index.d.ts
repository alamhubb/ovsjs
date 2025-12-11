/**
 * Typography 原子类聚合导出
 */

export * from './font-size'
export * from './font-weight'
export * from './text-align'
export * from './line-height'
export * from './white-space'
export * from './text-decoration'
export * from './vertical-align'

import type { FontSizeAtoms } from './font-size'
import type { FontWeightAtoms } from './font-weight'
import type { TextAlignAtoms } from './text-align'
import type { LineHeightAtoms } from './line-height'
import type { WhiteSpaceAtoms, TextOverflowAtoms, WordBreakAtoms } from './white-space'
import type { TextDecorationAtoms, TextTransformAtoms } from './text-decoration'
import type { VerticalAlignAtoms } from './vertical-align'

export interface TypographyAtoms extends
  FontSizeAtoms,
  FontWeightAtoms,
  TextAlignAtoms,
  LineHeightAtoms,
  WhiteSpaceAtoms,
  TextOverflowAtoms,
  WordBreakAtoms,
  TextDecorationAtoms,
  TextTransformAtoms,
  VerticalAlignAtoms {}
