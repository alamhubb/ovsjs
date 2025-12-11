/**
 * Effects 原子类聚合导出
 */

export * from './opacity'
export * from './transition'
export * from './cursor'
export * from './box-shadow'
export * from './pointer-events'
export * from './user-select'
export * from './visibility'
export * from './transform'

import type { OpacityAtoms } from './opacity'
import type { TransitionAtoms, TransitionDurationAtoms, TransitionTimingAtoms, TransitionDelayAtoms } from './transition'
import type { CursorAtoms } from './cursor'
import type { BoxShadowAtoms } from './box-shadow'
import type { PointerEventsAtoms } from './pointer-events'
import type { UserSelectAtoms } from './user-select'
import type { VisibilityAtoms } from './visibility'
import type { TransformAtoms, ScaleAtoms, RotateAtoms, TranslateAtoms, TransformOriginAtoms } from './transform'

export interface EffectsAtoms extends
  OpacityAtoms,
  TransitionAtoms,
  TransitionDurationAtoms,
  TransitionTimingAtoms,
  TransitionDelayAtoms,
  CursorAtoms,
  BoxShadowAtoms,
  PointerEventsAtoms,
  UserSelectAtoms,
  VisibilityAtoms,
  TransformAtoms,
  ScaleAtoms,
  RotateAtoms,
  TranslateAtoms,
  TransformOriginAtoms {}
