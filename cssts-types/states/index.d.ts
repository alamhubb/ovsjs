/**
 * States 原子类聚合导出 - 组件状态类
 */

export * from './interactive'
export * from './validation'
export * from './component'

import type { InteractiveStateAtoms } from './interactive'
import type { ValidationStateAtoms } from './validation'
import type { ComponentStateAtoms, SizeStateAtoms, OrientationStateAtoms } from './component'

export interface StatesAtoms extends
  InteractiveStateAtoms,
  ValidationStateAtoms,
  ComponentStateAtoms,
  SizeStateAtoms,
  OrientationStateAtoms {}
