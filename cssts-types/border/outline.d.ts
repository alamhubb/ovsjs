/**
 * CSS outline 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface OutlineAtoms {
  outlineNone: StyleObject<'outline-none'>
  outline: StyleObject<'outline'>
  outline0: StyleObject<'outline-0'>
  outline1: StyleObject<'outline-1'>
  outline2: StyleObject<'outline-2'>
  outline4: StyleObject<'outline-4'>
  outline8: StyleObject<'outline-8'>
}

export interface OutlineStyleAtoms {
  outlineSolid: StyleObject<'outline-solid'>
  outlineDashed: StyleObject<'outline-dashed'>
  outlineDotted: StyleObject<'outline-dotted'>
  outlineDouble: StyleObject<'outline-double'>
}

export interface OutlineOffsetAtoms {
  outlineOffset0: StyleObject<'outline-offset-0'>
  outlineOffset1: StyleObject<'outline-offset-1'>
  outlineOffset2: StyleObject<'outline-offset-2'>
  outlineOffset4: StyleObject<'outline-offset-4'>
  outlineOffset8: StyleObject<'outline-offset-8'>
}
