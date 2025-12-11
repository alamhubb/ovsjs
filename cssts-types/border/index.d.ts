/**
 * Border 原子类聚合导出
 */

export * from './border'
export * from './border-radius'
export * from './outline'

import type { BorderWidthAtoms, BorderStyleAtoms, BorderCollapseAtoms } from './border'
import type { BorderRadiusAtoms, BorderRadiusSideAtoms } from './border-radius'
import type { OutlineAtoms, OutlineStyleAtoms, OutlineOffsetAtoms } from './outline'

export interface BorderAtoms extends
  BorderWidthAtoms,
  BorderStyleAtoms,
  BorderCollapseAtoms,
  BorderRadiusAtoms,
  BorderRadiusSideAtoms,
  OutlineAtoms,
  OutlineStyleAtoms,
  OutlineOffsetAtoms {}
