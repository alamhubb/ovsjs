/**
 * Layout 原子类聚合导出
 */

export * from './display'
export * from './flex-direction'
export * from './justify-content'
export * from './align-items'
export * from './flex'
export * from './position'
export * from './z-index'
export * from './overflow'

import type { DisplayAtoms } from './display'
import type { FlexDirectionAtoms } from './flex-direction'
import type { JustifyContentAtoms } from './justify-content'
import type { AlignItemsAtoms, AlignSelfAtoms, AlignContentAtoms } from './align-items'
import type { FlexWrapAtoms, FlexGrowShrinkAtoms, FlexAtoms, FlexUtilityAtoms } from './flex'
import type { PositionAtoms, InsetAtoms } from './position'
import type { ZIndexAtoms } from './z-index'
import type { OverflowAtoms } from './overflow'

export interface LayoutAtoms extends
  DisplayAtoms,
  FlexDirectionAtoms,
  JustifyContentAtoms,
  AlignItemsAtoms,
  AlignSelfAtoms,
  AlignContentAtoms,
  FlexWrapAtoms,
  FlexGrowShrinkAtoms,
  FlexAtoms,
  FlexUtilityAtoms,
  PositionAtoms,
  InsetAtoms,
  ZIndexAtoms,
  OverflowAtoms {}
