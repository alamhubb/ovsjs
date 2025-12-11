/**
 * All Atomic Styles Type Definitions
 */

export * from './colors'
export * from './sizing'
export * from './typography'
export * from './layout'
export * from './spacing'
export * from './effects'
export * from './states'

import type { ColorAtoms } from './colors'
import type { SizingAtoms } from './sizing'
import type { TypographyAtoms } from './typography'
import type { LayoutAtoms } from './layout'
import type { SpacingAtoms } from './spacing'
import type { EffectsAtoms } from './effects'
import type { StateAtoms } from './states'

/** All Atoms Combined */
export interface AllAtoms extends 
  ColorAtoms,
  SizingAtoms,
  TypographyAtoms,
  LayoutAtoms,
  SpacingAtoms,
  EffectsAtoms,
  StateAtoms {}
