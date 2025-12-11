/**
 * Sizing 原子类聚合导出
 */

export * from './width'
export * from './height'

import type { WidthAtoms, MinWidthAtoms, MaxWidthAtoms } from './width'
import type { HeightAtoms, MinHeightAtoms, MaxHeightAtoms } from './height'

export interface SizingAtoms extends
  WidthAtoms,
  MinWidthAtoms,
  MaxWidthAtoms,
  HeightAtoms,
  MinHeightAtoms,
  MaxHeightAtoms {}
