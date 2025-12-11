/**
 * Spacing 原子类聚合导出
 */

export * from './padding'
export * from './margin'
export * from './gap'

import type { PaddingAtoms, PaddingXAtoms, PaddingYAtoms, PaddingSideAtoms } from './padding'
import type { MarginAtoms, MarginXAtoms, MarginYAtoms, MarginSideAtoms } from './margin'
import type { GapAtoms, GapXAtoms, GapYAtoms } from './gap'

export interface SpacingAtoms extends
  PaddingAtoms,
  PaddingXAtoms,
  PaddingYAtoms,
  PaddingSideAtoms,
  MarginAtoms,
  MarginXAtoms,
  MarginYAtoms,
  MarginSideAtoms,
  GapAtoms,
  GapXAtoms,
  GapYAtoms {}
